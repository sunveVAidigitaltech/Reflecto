# 💰 Google AdMob Integration & Configuration Guide

Reflecto is fully wired to support **Adaptive Banners**, **Interstitials every 3 levels**, and **Rewarded Videos for +2 Hints** via native Google Mobile Ads SDK integration.

Currently, the app uses Google's official test ad units so you can test on any device without risk. When you are ready to earn revenue, follow this guide to insert your real production AdMob IDs.

---

## 1. Required AdMob IDs from Your AdMob Dashboard

Log in to [Google AdMob Console](https://admob.google.com/) and create:
1. **An Android App**: "Reflecto"
2. **Three Ad Units**:
   - **Banner Ad Unit**: Format: *Banner* (Standard / Adaptive)
   - **Interstitial Ad Unit**: Format: *Interstitial*
   - **Rewarded Ad Unit**: Format: *Rewarded*

You will receive 4 IDs:
| Name | Format Pattern | Example |
| :--- | :--- | :--- |
| **AdMob App ID** | `ca-app-pub-XXXXXXXXXXXXXXXX~XXXXXXXXXX` | Contains a tilde (`~`) |
| **Banner Unit ID** | `ca-app-pub-XXXXXXXXXXXXXXXX/XXXXXXXXXX` | Contains a slash (`/`) |
| **Interstitial Unit ID** | `ca-app-pub-XXXXXXXXXXXXXXXX/XXXXXXXXXX` | Contains a slash (`/`) |
| **Rewarded Unit ID** | `ca-app-pub-XXXXXXXXXXXXXXXX/XXXXXXXXXX` | Contains a slash (`/`) |

---

## 2. Where to Insert Your Production IDs

### File A: `android/app/src/main/AndroidManifest.xml`
Find line 19–21 and replace the test App ID with your real App ID:

```xml
<!-- REPLACE WITH YOUR REAL ADMOB APP ID -->
<meta-data
    android:name="com.google.android.gms.ads.APPLICATION_ID"
    android:value="ca-app-pub-XXXXXXXXXXXXXXXX~XXXXXXXXXX"/>
```

> [!CAUTION]
> If the `com.google.android.gms.ads.APPLICATION_ID` meta-data is missing or invalid, the Android app will crash immediately on startup!

---

### File B: `android/app/src/main/java/io/reflecto/game/MainActivity.java`
Find lines 44–46 and replace the sample Ad Unit IDs with your production IDs:

```java
// REPLACE WITH YOUR REAL ADMOB AD UNIT IDS
private static final String BANNER_AD_UNIT_ID = "ca-app-pub-XXXXXXXXXXXXXXXX/XXXXXXXXXX";
private static final String INTERSTITIAL_AD_UNIT_ID = "ca-app-pub-XXXXXXXXXXXXXXXX/XXXXXXXXXX";
private static final String REWARDED_AD_UNIT_ID = "ca-app-pub-XXXXXXXXXXXXXXXX/XXXXXXXXXX";
```

---

## 3. Ad Placement Architecture in Reflecto

* **Adaptive Banner**:
  - Displayed at the very bottom of the Android Activity below the gameplay area.
  - Automatically loads on launch and auto-refreshes according to AdMob optimization.
* **Interstitial Ad (Full-Screen)**:
  - Triggered every **3 puzzle levels won**.
  - Tracks progress persistently in local storage (`localStorage.getItem('reflecto_ad_level_counter')`).
  - Pre-loads in the background so it displays instantly with zero stutter when level 3, 6, 9, etc., are completed.
* **Rewarded Video**:
  - Triggered when the player taps the Hint button and has **0 hints remaining**, or requests extra hints.
  - Upon successful video completion, native Android calls `window.onRewardedAdSuccess()`, awarding **+2 Free Hints** to the player!
  - If no ad is filled or the device is offline, the in-game simulator gracefully ensures the player is never blocked.

---

## 4. Important AdMob Compliance & Best Practices

1. **Child-Directed / Families Setting (COPPA)**:
   - In your AdMob Console, open your app settings and set **Children's Online Privacy Protection Act (COPPA)** to:
     - *"Yes, treat this app as child-directed"* (or select the appropriate age rating in AdMob blocking controls).
   - This ensures Google automatically excludes adult, dating, gambling, or non-family-friendly advertisers.
2. **Never Click Your Own Live Ads**:
   - Clicking your own production ads or asking friends/testers to click them can cause Google to suspend your AdMob account for invalid traffic.
   - To safely test on your personal phone, add your phone as a **Test Device** in AdMob:
     `AdMob Console > Settings > Test Devices > Add Test Device` (paste your phone's Advertising ID).
3. **`app-ads.txt` Setup**:
   - Google AdMob requires an `app-ads.txt` file hosted on your developer website root (e.g. `https://yourwebsite.com/app-ads.txt`).
   - AdMob provides your exact line in: `AdMob Console > Apps > View All Apps > app-ads.txt`.
