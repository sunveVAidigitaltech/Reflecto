package io.reflecto.game;

import android.annotation.SuppressLint;
import android.graphics.Color;
import android.os.Build;
import android.os.Bundle;
import android.util.Log;
import android.webkit.ConsoleMessage;
import android.webkit.WebChromeClient;
import android.webkit.WebResourceError;
import android.webkit.WebResourceRequest;
import android.webkit.WebSettings;
import android.webkit.WebView;
import android.webkit.WebViewClient;
import android.widget.FrameLayout;
import android.widget.TextView;
import androidx.appcompat.app.AppCompatActivity;
import androidx.core.view.WindowCompat;
import androidx.core.view.WindowInsetsCompat;
import androidx.core.view.WindowInsetsControllerCompat;

public class MainActivity extends AppCompatActivity {

    private static final String TAG = "Reflecto";
    private WebView webView;

    @SuppressLint("SetJavaScriptEnabled")
    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);

        // Global crash protection for diagnostic visibility
        Thread.setDefaultUncaughtExceptionHandler((thread, throwable) -> {
            Log.e(TAG, "Uncaught exception on thread " + thread.getName(), throwable);
        });

        try {
            // 1. Initialize WebView safely
            webView = new WebView(this);
            webView.setBackgroundColor(Color.parseColor("#FFF8EE"));
            setContentView(webView);

            // 2. Configure System Bars / Fullscreen after view is attached
            hideSystemUI();

            // 3. Configure WebSettings
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

            // 4. Chrome Client for console logging & debugging
            webView.setWebChromeClient(new WebChromeClient() {
                @Override
                public boolean onConsoleMessage(ConsoleMessage consoleMessage) {
                    Log.d(TAG + "JS", "[" + consoleMessage.messageLevel() + "] "
                            + consoleMessage.message() + " (" + consoleMessage.sourceId()
                            + ":" + consoleMessage.lineNumber() + ")");
                    return true;
                }
            });

            // 5. Robust WebViewClient
            webView.setWebViewClient(new WebViewClient() {
                @Override
                public void onReceivedError(WebView view, WebResourceRequest request, WebResourceError error) {
                    if (request != null && request.isForMainFrame()) {
                        Log.e(TAG, "Main frame error: " + (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M ? error.getDescription() : "Error"));
                    }
                }
            });

            // 6. Load bundled assets
            webView.loadUrl("file:///android_asset/www/index.html");

        } catch (Throwable t) {
            Log.e(TAG, "Fatal error initializing MainActivity", t);
            showFallbackError(t);
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

    private void hideSystemUI() {
        try {
            WindowCompat.setDecorFitsSystemWindows(getWindow(), false);
            WindowInsetsControllerCompat controller = WindowCompat.getInsetsController(getWindow(), getWindow().getDecorView());
            if (controller != null) {
                controller.hide(WindowInsetsCompat.Type.systemBars());
                controller.setSystemBarsBehavior(WindowInsetsControllerCompat.BEHAVIOR_SHOW_TRANSIENT_BARS_BY_SWIPE);
            }
        } catch (Throwable t) {
            Log.w(TAG, "hideSystemUI warning: " + t.getMessage());
        }
    }

    @Override
    public void onWindowFocusChanged(boolean hasFocus) {
        super.onWindowFocusChanged(hasFocus);
        if (hasFocus) {
            hideSystemUI();
        }
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
