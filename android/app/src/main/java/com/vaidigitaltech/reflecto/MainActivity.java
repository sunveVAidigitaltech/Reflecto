package com.vaidigitaltech.reflecto;

import android.annotation.SuppressLint;
import android.graphics.Color;
import android.os.Build;
import android.os.Bundle;
import android.util.Log;
import android.view.View;
import android.view.ViewGroup;
import android.webkit.ConsoleMessage;
import android.webkit.JavascriptInterface;
import android.webkit.WebChromeClient;
import android.webkit.WebResourceError;
import android.webkit.WebResourceRequest;
import android.webkit.WebSettings;
import android.webkit.WebView;
import android.webkit.WebViewClient;
import android.widget.FrameLayout;
import android.widget.LinearLayout;
import android.widget.TextView;
import androidx.appcompat.app.AppCompatActivity;
import androidx.core.view.WindowCompat;
import androidx.core.view.WindowInsetsCompat;
import androidx.core.view.WindowInsetsControllerCompat;

import com.google.android.gms.ads.AdError;
import com.google.android.gms.ads.AdRequest;
import com.google.android.gms.ads.AdSize;
import com.google.android.gms.ads.AdView;
import com.google.android.gms.ads.FullScreenContentCallback;
import com.google.android.gms.ads.LoadAdError;
import com.google.android.gms.ads.MobileAds;
import com.google.android.gms.ads.RequestConfiguration;
import com.google.android.gms.ads.interstitial.InterstitialAd;
import com.google.android.gms.ads.interstitial.InterstitialAdLoadCallback;
import com.google.android.gms.ads.rewarded.RewardedAd;
import com.google.android.gms.ads.rewarded.RewardedAdLoadCallback;

public class MainActivity extends AppCompatActivity {

    private static final String TAG = "Reflecto";

    // Google AdMob Production Ad Unit IDs
    private static final String BANNER_AD_UNIT_ID = "ca-app-pub-8892099269596029/2721683985";
    private static final String INTERSTITIAL_AD_UNIT_ID = "ca-app-pub-8892099269596029/3140039276";
    private static final String REWARDED_AD_UNIT_ID = "ca-app-pub-8892099269596029/6948703605";

    private WebView webView;
    private FrameLayout adContainer;
    private AdView adView;
    private InterstitialAd interstitialAd;
    private RewardedAd rewardedAd;

    @SuppressLint("SetJavaScriptEnabled")
    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);

        Thread.setDefaultUncaughtExceptionHandler((thread, throwable) -> {
            Log.e(TAG, "Uncaught exception on thread " + thread.getName(), throwable);
        });

        try {
            // 1. Root Vertical Layout: WebView (top) + AdView Container (bottom)
            LinearLayout rootLayout = new LinearLayout(this);
            rootLayout.setOrientation(LinearLayout.VERTICAL);
            rootLayout.setBackgroundColor(Color.parseColor("#FFF8EE"));
            rootLayout.setLayoutParams(new ViewGroup.LayoutParams(
                    ViewGroup.LayoutParams.MATCH_PARENT,
                    ViewGroup.LayoutParams.MATCH_PARENT));

            // 2. Initialize WebView
            webView = new WebView(this);
            webView.setBackgroundColor(Color.parseColor("#FFF8EE"));
            LinearLayout.LayoutParams webViewParams = new LinearLayout.LayoutParams(
                    ViewGroup.LayoutParams.MATCH_PARENT, 0, 1.0f);
            webView.setLayoutParams(webViewParams);
            rootLayout.addView(webView);

            // 3. Ad Container for Adaptive Bottom Banner
            adContainer = new FrameLayout(this);
            adContainer.setBackgroundColor(Color.parseColor("#FFF8EE"));
            LinearLayout.LayoutParams adParams = new LinearLayout.LayoutParams(
                    ViewGroup.LayoutParams.MATCH_PARENT,
                    ViewGroup.LayoutParams.WRAP_CONTENT);
            adContainer.setLayoutParams(adParams);
            rootLayout.addView(adContainer);

            setContentView(rootLayout);

            // 4. Configure WebSettings & JS Bridge
            WebSettings settings = webView.getSettings();
            settings.setJavaScriptEnabled(true);
            settings.setDomStorageEnabled(true);
            settings.setDatabaseEnabled(true);
            settings.setMediaPlaybackRequiresUserGesture(false);
            settings.setAllowFileAccess(true);
            settings.setAllowContentAccess(true);
            try {
                settings.setAllowFileAccessFromFileURLs(true);
                settings.setAllowUniversalAccessFromFileURLs(true);
            } catch (Throwable t) {
                Log.w(TAG, "File access warning: " + t.getMessage());
            }
            settings.setLoadWithOverviewMode(true);
            settings.setUseWideViewPort(true);
            settings.setCacheMode(WebSettings.LOAD_DEFAULT);

            // Expose native Ads Bridge to JS
            webView.addJavascriptInterface(new ReflectoAdBridge(), "AndroidAds");

            webView.setWebChromeClient(new WebChromeClient() {
                @Override
                public boolean onConsoleMessage(ConsoleMessage consoleMessage) {
                    Log.d(TAG + "JS", "[" + consoleMessage.messageLevel() + "] "
                            + consoleMessage.message() + " (" + consoleMessage.sourceId()
                            + ":" + consoleMessage.lineNumber() + ")");
                    return true;
                }
            });

            webView.setWebViewClient(new WebViewClient() {
                @Override
                public void onReceivedError(WebView view, WebResourceRequest request, WebResourceError error) {
                    if (request != null && request.isForMainFrame()) {
                        Log.e(TAG, "Main frame error: " + (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M ? error.getDescription() : "Error"));
                    }
                }
            });

            // 5. Initialize Google AdMob with COPPA Child-Directed Tagging
            initAdMob();

            // 6. Load bundled web assets
            webView.loadUrl("file:///android_asset/www/index.html");

        } catch (Throwable t) {
            Log.e(TAG, "Fatal error initializing MainActivity", t);
            showFallbackError(t);
        }
    }

    private void initAdMob() {
        try {
            // COPPA & Families Policy: Tag for child-directed treatment & G-rating
            RequestConfiguration requestConfig = MobileAds.getRequestConfiguration().toBuilder()
                    .setTagForChildDirectedTreatment(RequestConfiguration.TAG_FOR_CHILD_DIRECTED_TREATMENT_TRUE)
                    .setMaxAdContentRating(RequestConfiguration.MAX_AD_CONTENT_RATING_G)
                    .build();
            MobileAds.setRequestConfiguration(requestConfig);

            MobileAds.initialize(this, initializationStatus -> {
                Log.d(TAG, "Google Mobile Ads initialized successfully.");
                runOnUiThread(() -> {
                    initBannerAd();
                    loadInterstitialAd();
                    loadRewardedAd();
                });
            });
        } catch (Throwable t) {
            Log.w(TAG, "AdMob initialization error: " + t.getMessage());
        }
    }

    private void initBannerAd() {
        try {
            adView = new AdView(this);
            adView.setAdUnitId(BANNER_AD_UNIT_ID);
            adView.setAdSize(AdSize.BANNER);
            adContainer.addView(adView);

            AdRequest adRequest = new AdRequest.Builder().build();
            adView.loadAd(adRequest);
            Log.d(TAG, "AdMob Banner ad requested.");
        } catch (Throwable t) {
            Log.w(TAG, "Banner setup failed: " + t.getMessage());
        }
    }

    private void loadInterstitialAd() {
        try {
            AdRequest adRequest = new AdRequest.Builder().build();
            InterstitialAd.load(this, INTERSTITIAL_AD_UNIT_ID, adRequest,
                    new InterstitialAdLoadCallback() {
                        @Override
                        public void onAdLoaded(InterstitialAd ad) {
                            interstitialAd = ad;
                            Log.d(TAG, "AdMob Interstitial loaded successfully.");
                            interstitialAd.setFullScreenContentCallback(new FullScreenContentCallback() {
                                @Override
                                public void onAdDismissedFullScreenContent() {
                                    interstitialAd = null;
                                    loadInterstitialAd(); // Preload next
                                }

                                @Override
                                public void onAdFailedToShowFullScreenContent(AdError adError) {
                                    interstitialAd = null;
                                    loadInterstitialAd();
                                }
                            });
                        }

                        @Override
                        public void onAdFailedToLoad(LoadAdError loadAdError) {
                            interstitialAd = null;
                            Log.w(TAG, "Interstitial load failed: " + loadAdError.getMessage());
                        }
                    });
        } catch (Throwable t) {
            Log.w(TAG, "Interstitial request failed: " + t.getMessage());
        }
    }

    private void loadRewardedAd() {
        try {
            AdRequest adRequest = new AdRequest.Builder().build();
            RewardedAd.load(this, REWARDED_AD_UNIT_ID, adRequest,
                    new RewardedAdLoadCallback() {
                        @Override
                        public void onAdLoaded(RewardedAd ad) {
                            rewardedAd = ad;
                            Log.d(TAG, "AdMob Rewarded Ad loaded successfully.");
                            rewardedAd.setFullScreenContentCallback(new FullScreenContentCallback() {
                                @Override
                                public void onAdDismissedFullScreenContent() {
                                    rewardedAd = null;
                                    loadRewardedAd(); // Preload next
                                }

                                @Override
                                public void onAdFailedToShowFullScreenContent(AdError adError) {
                                    rewardedAd = null;
                                    loadRewardedAd();
                                }
                            });
                        }

                        @Override
                        public void onAdFailedToLoad(LoadAdError loadAdError) {
                            rewardedAd = null;
                            Log.w(TAG, "Rewarded ad load failed: " + loadAdError.getMessage());
                        }
                    });
        } catch (Throwable t) {
            Log.w(TAG, "Rewarded ad request failed: " + t.getMessage());
        }
    }

    /**
     * JavaScript Bridge Interface exposed to WebView as `window.AndroidAds`
     */
    public class ReflectoAdBridge {

        @JavascriptInterface
        public void showInterstitial() {
            runOnUiThread(() -> {
                if (interstitialAd != null) {
                    interstitialAd.show(MainActivity.this);
                } else {
                    loadInterstitialAd();
                }
            });
        }

        @JavascriptInterface
        public void showRewardedAd() {
            runOnUiThread(() -> {
                if (rewardedAd != null) {
                    rewardedAd.show(MainActivity.this, rewardItem -> {
                        Log.d(TAG, "User completed rewarded video! Granting +2 hints.");
                        if (webView != null) {
                            webView.evaluateJavascript("window.onRewardedAdSuccess && window.onRewardedAdSuccess();", null);
                        }
                    });
                } else {
                    Log.d(TAG, "Rewarded ad not loaded yet, triggering fallback reload.");
                    loadRewardedAd();
                    if (webView != null) {
                        webView.evaluateJavascript("window.onRewardedAdUnavailable && window.onRewardedAdUnavailable();", null);
                    }
                }
            });
        }

        @JavascriptInterface
        public boolean isRewardedAdReady() {
            return rewardedAd != null;
        }

        @JavascriptInterface
        public void showBanner() {
            runOnUiThread(() -> {
                if (adContainer != null) adContainer.setVisibility(View.VISIBLE);
            });
        }

        @JavascriptInterface
        public void hideBanner() {
            runOnUiThread(() -> {
                if (adContainer != null) adContainer.setVisibility(View.GONE);
            });
        }
    }

    private void showFallbackError(Throwable t) {
        FrameLayout layout = new FrameLayout(this);
        layout.setBackgroundColor(Color.parseColor("#FFF8EE"));
        layout.setPadding(48, 80, 48, 80);

        TextView tv = new TextView(this);
        tv.setTextColor(Color.parseColor("#0F172A"));
        tv.setTextSize(16f);
        tv.setText("Reflecto: Light & Reflection\n\nInitialization Diagnosis:\n" + t.getClass().getSimpleName() + ": " + t.getMessage()
                + "\n\nPlease ensure Android System WebView is updated on your device.");
        layout.addView(tv);
        setContentView(layout);
    }

    @Override
    protected void onPause() {
        if (adView != null) adView.pause();
        super.onPause();
    }

    @Override
    protected void onResume() {
        super.onResume();
        if (adView != null) adView.resume();
    }

    @Override
    protected void onDestroy() {
        if (adView != null) adView.destroy();
        super.onDestroy();
    }

    @SuppressWarnings("deprecation")
    @Override
    public void onBackPressed() {
        if (webView != null && webView.canGoBack()) {
            webView.goBack();
        } else {
            super.onBackPressed();
        }
    }
}
