/**
 * REFLECTO - ADS MANAGER
 * Coordinates Google AdMob for Android (via window.AndroidAds bridge)
 * and provides seamless in-browser ad simulation for localhost/desktop testing.
 *
 * Rules:
 * - Adaptive Banner: Persistent at bottom
 * - Interstitial Ad: Triggered every 3 levels won
 * - Rewarded Video: Awards +2 Free Hints when completed
 */

class AdsManager {
  constructor() {
    this.isAndroidBridge = typeof window.AndroidAds !== 'undefined';
    this.levelsCompletedCount = parseInt(localStorage.getItem('reflecto_ad_level_counter') || '0', 10);
    this.pendingRewardCallback = null;

    this.initGlobalCallbacks();
  }

  initGlobalCallbacks() {
    // Android native bridge callback on rewarded ad completion
    window.onRewardedAdSuccess = () => {
      console.log("[AdsManager] Rewarded Ad Success received from Android bridge!");
      if (this.pendingRewardCallback) {
        this.pendingRewardCallback(2); // Grant +2 hints
        this.pendingRewardCallback = null;
      }
    };

    window.onRewardedAdUnavailable = () => {
      console.log("[AdsManager] Rewarded Ad unavailable on device, falling back to simulator.");
      this.showBrowserSimulator(this.pendingRewardCallback);
    };
  }

  /**
   * Called when player completes a level.
   * Every 3 levels won, triggers an interstitial ad.
   */
  onLevelWon(callback) {
    this.levelsCompletedCount++;
    localStorage.setItem('reflecto_ad_level_counter', this.levelsCompletedCount.toString());

    if (this.levelsCompletedCount >= 3) {
      this.levelsCompletedCount = 0;
      localStorage.setItem('reflecto_ad_level_counter', '0');
      this.showInterstitial(callback);
    } else {
      if (callback) callback();
    }
  }

  showInterstitial(callback) {
    console.log("[AdsManager] Showing Interstitial Ad (Every 3 Levels)");
    if (this.isAndroidBridge && window.AndroidAds.showInterstitial) {
      window.AndroidAds.showInterstitial();
      if (callback) setTimeout(callback, 500);
    } else {
      this.showBrowserInterstitialSimulator(callback);
    }
  }

  /**
   * Rewarded Video Ad flow for +2 Hints.
   */
  requestRewardedAdForHints(onSuccess) {
    this.pendingRewardCallback = onSuccess;

    if (this.isAndroidBridge && window.AndroidAds.showRewardedAd) {
      window.AndroidAds.showRewardedAd();
    } else {
      this.showBrowserSimulator(onSuccess);
    }
  }

  /**
   * In-Browser Rewarded Ad Simulator for localhost testing
   */
  showBrowserSimulator(onSuccess) {
    const modal = document.getElementById('browser-ad-simulator-modal');
    const timerElem = document.getElementById('simulator-timer');
    const titleElem = document.getElementById('simulator-title');
    const descElem = document.getElementById('simulator-desc');

    if (!modal) {
      if (onSuccess) onSuccess(2);
      return;
    }

    if (titleElem) titleElem.textContent = "🎬 Sponsor Video (AdMob Test)";
    if (descElem) descElem.textContent = "Watching short kid-friendly video for +2 Hints...";

    modal.classList.add('active');
    let timeLeft = 3;
    if (timerElem) timerElem.textContent = `Reward in ${timeLeft}s...`;

    const interval = setInterval(() => {
      timeLeft--;
      if (timerElem) timerElem.textContent = `Reward in ${timeLeft}s...`;

      if (timeLeft <= 0) {
        clearInterval(interval);
        modal.classList.remove('active');
        if (window.soundFX && window.soundFX.victoryFanfare) {
          window.soundFX.victoryFanfare();
        }
        if (onSuccess) onSuccess(2);
      }
    }, 1000);
  }

  /**
   * In-Browser Interstitial Ad Simulator
   */
  showBrowserInterstitialSimulator(callback) {
    const modal = document.getElementById('browser-ad-simulator-modal');
    const timerElem = document.getElementById('simulator-timer');
    const titleElem = document.getElementById('simulator-title');
    const descElem = document.getElementById('simulator-desc');

    if (!modal) {
      if (callback) callback();
      return;
    }

    if (titleElem) titleElem.textContent = "🌟 Reflecto Fun Break (AdMob Test)";
    if (descElem) descElem.textContent = "Interstitial ad every 3 levels...";

    modal.classList.add('active');
    let timeLeft = 2;
    if (timerElem) timerElem.textContent = `Continuing in ${timeLeft}s...`;

    const interval = setInterval(() => {
      timeLeft--;
      if (timerElem) timerElem.textContent = `Continuing in ${timeLeft}s...`;

      if (timeLeft <= 0) {
        clearInterval(interval);
        modal.classList.remove('active');
        if (callback) callback();
      }
    }, 1000);
  }
}

// Global AdsManager singleton
window.adsManager = new AdsManager();

if (typeof module !== 'undefined' && module.exports) {
  module.exports = AdsManager;
}
