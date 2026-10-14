# 🚀 Reflecto: Google Play Store Publishing Kit

Welcome to the **Complete Google Play Store Publishing Kit** for **Reflecto: Light & Mirror Puzzle**.

This kit contains everything you need to launch Reflecto smoothly and successfully on the Google Play Store, comply with Google's Families & AdMob policies, configure production ads, generate signed release builds (AAB), and pass app review on the first submission.

---

## 📁 Kit Contents

| Document | Purpose & Description |
| :--- | :--- |
| **[`STORE_LISTING.md`](./STORE_LISTING.md)** | App title, short description, 4,000-character rich description, tags, categorization, and keywords optimized for Play Store search (ASO). |
| **[`PRIVACY_POLICY.md`](./PRIVACY_POLICY.md)** / **[`privacy-policy.html`](./privacy-policy.html)** | Mandatory, GDPR & COPPA compliant Privacy Policy covering Google AdMob, local storage, and child-safe gaming. Ready to host on GitHub Pages or custom domain. |
| **[`DATA_SAFETY_FORM_GUIDE.md`](./DATA_SAFETY_FORM_GUIDE.md)** | Step-by-step answers for Google Play Console's mandatory **Data Safety Form** (specifically tailored to Google Mobile Ads SDK). |
| **[`ADMOB_SETUP_GUIDE.md`](./ADMOB_SETUP_GUIDE.md)** | Exact files and lines where your real AdMob App ID and Ad Unit IDs (Banner, Interstitial, Rewarded) must be inserted. |
| **[`RELEASE_AAB_BUILD_GUIDE.md`](./RELEASE_AAB_BUILD_GUIDE.md)** | Instructions for creating a release keystore, configuring Gradle signing, and building the production `.aab` (Android App Bundle). |
| **[`GRAPHIC_ASSETS_SPEC.md`](./GRAPHIC_ASSETS_SPEC.md)** | Dimension guidelines, copy storyboard, and design templates for App Icon (512x512), Feature Graphic (1024x500), and Promotional Screenshots. |

---

## ⚡ Quick Start Checklist

1. [ ] **Test on Mobile**: Verify APK on your physical Android phone (already built and placed at `/Users/sandeep/Desktop/reflecto.apk`).
2. [ ] **Replace AdMob IDs**: Update your real AdMob IDs in `AndroidManifest.xml` and `MainActivity.java` as detailed in [`ADMOB_SETUP_GUIDE.md`](./ADMOB_SETUP_GUIDE.md).
3. [ ] **Host Privacy Policy**: Enable GitHub Pages on your repository or upload [`privacy-policy.html`](./privacy-policy.html) to your website, and paste the URL in Play Console.
4. [ ] **Generate Release Keystore**: Run the `keytool` command in [`RELEASE_AAB_BUILD_GUIDE.md`](./RELEASE_AAB_BUILD_GUIDE.md) and keep your keystore file safe.
5. [ ] **Build `.aab`**: Run `./gradlew bundleRelease` to generate the production app bundle.
6. [ ] **Submit to Google Play Console**: Copy the store listing from [`STORE_LISTING.md`](./STORE_LISTING.md) and fill out the Data Safety questionnaire using [`DATA_SAFETY_FORM_GUIDE.md`](./DATA_SAFETY_FORM_GUIDE.md).
