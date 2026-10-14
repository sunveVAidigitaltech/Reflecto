# 📦 Android App Bundle (.AAB) Release Build Guide

Since August 2021, Google Play requires all new apps to be published as **Android App Bundles (`.aab`)** rather than standalone APKs. Google Play uses the AAB to dynamically generate optimized APKs tailored to each user's specific screen density and CPU architecture, resulting in smaller download sizes.

Follow this guide to generate your release signing key and compile the final `.aab` package for the Google Play Store.

---

## Step 1: Release Signing Keystore (Generated & Configured)

The release signing key has been generated and pre-configured for the project:

* **Keystore File**: `android/app/reflecto-release-key.jks` (backed up to `/Users/sandeep/Desktop/reflecto-release-key.jks`)
* **Alias**: `reflecto-key`
* **Keystore Password**: `ReflectoPlay2026!`
* **Key Password**: `ReflectoPlay2026!`
* **Algorithm**: RSA 2048-bit, 10,000 days validity (expires 2054)

> [!CAUTION]
> **KEEP YOUR KEYSTORE BACKUP SAFE!** A copy has been placed at `/Users/sandeep/Desktop/reflecto-release-key.jks`. Save this file to your secure cloud backup (Google Drive, 1Password, or private storage) as it is required to sign future Play Store updates.

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
