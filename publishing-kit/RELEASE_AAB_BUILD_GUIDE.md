# 📦 Android App Bundle (.AAB) Release Build Guide

Since August 2021, Google Play requires all new apps to be published as **Android App Bundles (`.aab`)** rather than standalone APKs. Google Play uses the AAB to dynamically generate optimized APKs tailored to each user's specific screen density and CPU architecture, resulting in smaller download sizes.

Follow this guide to generate your release signing key and compile the final `.aab` package for the Google Play Store.

---

## Step 1: Generate Your Release Keystore

Run the following command in your terminal to create your private signing keystore file (`reflecto-release-key.jks`):

```bash
keytool -genkey -v \
  -keystore reflecto-release-key.jks \
  -keyalg RSA \
  -keysize 2048 \
  -validity 10000 \
  -alias reflecto-key
```

* **Keystore password**: Enter a secure password (e.g. at least 8 characters) and remember it.
* **Certificate questions**: Enter your developer or company details (Name, Organization, Country Code).
* **Location**: Keep `reflecto-release-key.jks` in a secure location (or place it inside `android/app/`).

> [!CAUTION]
> **BACK UP YOUR KEYSTORE!** If you lose this keystore file or forget its password, Google will not allow you to release updates to Reflecto under the same Play Store listing unless you use Google Play App Signing with key recovery.

---

## Step 2: Configure Signing in `android/app/build.gradle`

You can configure Gradle to sign your release bundle automatically. 

In `android/app/build.gradle`, add the `signingConfigs` block above `buildTypes`:

```groovy
android {
    ...
    signingConfigs {
        release {
            storeFile file("reflecto-release-key.jks")
            storePassword "YOUR_KEYSTORE_PASSWORD"
            keyAlias "reflecto-key"
            keyPassword "YOUR_KEY_PASSWORD"
        }
    }

    buildTypes {
        release {
            signingConfig signingConfigs.release
            minifyEnabled false
            proguardFiles getDefaultProguardFile('proguard-android-optimize.txt'), 'proguard-rules.pro'
        }
    }
}
```

*(Tip: To avoid putting plain text passwords in `build.gradle`, you can store them in your user `~/.gradle/gradle.properties` file as `REFLECTO_STORE_PASSWORD` and `REFLECTO_KEY_PASSWORD`).*

---

## Step 3: Build the Production App Bundle (`.aab`)

Navigate to the `android/` directory and execute:

```bash
cd android
JAVA_HOME="/Applications/Android Studio.app/Contents/jbr/Contents/Home" ./gradlew bundleRelease
```

Once the build finishes successfully (`BUILD SUCCESSFUL`), your release bundle will be generated at:

```text
android/app/build/outputs/bundle/release/app-release.aab
```

---

## Step 4: Uploading to Google Play Console

1. Open [Google Play Console](https://play.google.com/console).
2. Select your app: **Reflecto**.
3. In the left navigation menu, go to **Release** > **Production** (or **Closed testing** for an internal beta test first).
4. Click **Create new release**.
5. Drag and drop `app-release.aab` into the **App bundles** upload area.
6. Verify the Release Name (e.g. `1.0.0 (1)`).
7. Paste your Release Notes from [`STORE_LISTING.md`](./STORE_LISTING.md).
8. Click **Next** > **Review release** > **Start rollout to Production**!
