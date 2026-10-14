# 🛡️ Google Play Console Data Safety Form Guide

Every app submitted to the Google Play Store must complete the **Data Safety** questionnaire. Google's review system automatically scans APKs/AABs for SDKs (including the Google Mobile Ads SDK), so your questionnaire answers must match what AdMob collects.

Follow this exact question-by-question guide to complete the Data Safety section in Google Play Console with 100% compliance.

---

## Step 1: Data Collection & Security Overview

When asked:

1. **Does your app collect or share any of the required user data types?**
   - Select: **Yes**

2. **Is all of the user data collected by your app encrypted in transit?**
   - Select: **Yes** *(AdMob transfers all telemetry and ad requests over HTTPS).*

3. **Do you provide a way for users to request that their data be deleted?**
   - Select: **No** *(Since Reflecto does not require user accounts and stores game progress locally on the device, there are no remote user accounts to delete).*

---

## Step 2: Specific Data Types to Declare

Check **ONLY** the following three data types (these correspond directly to Google AdMob):

### 1. Location > Approximate Location
* **Is this data collected?** -> **Yes**
* **Is this data shared?** -> **Yes** *(shared with Google AdMob)*
* **Is this data processed ephemerally?** -> **No**
* **Is this data required or optional?** -> **Data collection is required** *(part of ad serving)*
* **Why is this user data collected?**
  - Check: **Advertising or marketing**
  - Check: **Fraud prevention, security, and compliance**

---

### 2. App Info and Performance > Diagnostics & Crash Logs
* **Crash logs**:
  - Collected? -> **Yes**
  - Shared? -> **Yes**
  - Ephemeral? -> **No**
  - Required? -> **Data collection is required**
  - Purpose: Check **Analytics** and **App functionality**
* **Diagnostics**:
  - Collected? -> **Yes**
  - Shared? -> **Yes**
  - Purpose: Check **Analytics**

---

### 3. Device or other IDs > Device or other IDs
*(Reflecto uses Google Mobile Ads, which reads the Google Advertising ID / AAID).*
* **Is this data collected?** -> **Yes**
* **Is this data shared?** -> **Yes** *(shared with Google AdMob)*
* **Is this data processed ephemerally?** -> **No**
* **Is this data required or optional?** -> **Data collection is required**
* **Why is this user data collected?**
  - Check: **Advertising or marketing**
  - Check: **Analytics**
  - Check: **Fraud prevention, security, and compliance**

---

## Step 3: Target Audience & Families Policy

In the **Target Audience & Content** section of Google Play Console:

1. **Target Age Groups**:
   - Check: **Ages 6–8**, **Ages 9–12**, and **13 and older** (or **All Ages**).
2. **Could the store listing unintentionally appeal to children?**
   - If prompted, select: **Yes** (the colorful pastel theme appeals to families).
3. **Ads Compliance**:
   - Answer: **Yes, my app contains ads**.
   - Confirm that all ads shown are served by an approved ad network (**Google AdMob is Google Play certified**) and comply with the Families Ads Policy.
4. **Neutral Age Screen**:
   - Because all ads in Reflecto are hard-filtered to G-rated / child-safe categories, no complex age gates are required.

---

## Summary Table

| Category | Data Type | Collected | Shared | Primary Purpose |
| :--- | :--- | :---: | :---: | :--- |
| **Location** | Approximate location | ✅ | ✅ | Advertising, Fraud Prevention |
| **App info** | Crash logs & Diagnostics | ✅ | ✅ | Analytics, App Functionality |
| **Device IDs** | Advertising ID (AAID) | ✅ | ✅ | Advertising, Analytics, Security |

*(All other categories: Personal Info, Financial Info, Health, Photos, Contacts, Audio, etc. should be marked as **Not Collected**).*
