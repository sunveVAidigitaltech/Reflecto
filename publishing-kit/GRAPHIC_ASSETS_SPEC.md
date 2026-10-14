# 🎨 Google Play Store Graphic Assets Specification & Storyboard

This document specifies the required graphical assets for the Google Play Store, including exact dimensions, formatting rules, design guidelines, and a high-converting screenshot storyboard.

---

## 1. Required Asset Checklist

| Asset | Dimensions | Format | Max File Size | Where Used |
| :--- | :--- | :--- | :--- | :--- |
| **App Icon** | **512 x 512 px** | 32-bit PNG (with alpha) | 1 MB | Store search, category ranking, app page header |
| **Feature Graphic** | **1024 x 500 px** | JPG or 24-bit PNG (no alpha) | 15 MB | Top banner on Play Store app page, promoted cards |
| **Phone Screenshots** | **1080 x 1920 px** *(or 1080 x 2400)* | PNG or JPG (min 2, rec 5–8) | 8 MB / img | Main preview carousel on mobile devices |
| **7" Tablet Screenshots** | **1200 x 1920 px** *(optional)* | PNG or JPG | 8 MB / img | Tablet Play Store carousel |
| **10" Tablet Screenshots** | **1600 x 2560 px** *(optional)* | PNG or JPG | 8 MB / img | Large tablet & Chromebook Play Store carousel |

---

## 2. App Icon Design Guidelines (512 x 512 px)

* **Hero Focal Point**:
  A luminous, multifaceted **Neon Diamond Prism** reflecting an electric cyan and gold laser beam, casting a soft ambient glow on a warm deep cosmic navy squircle background (`#0A192F` or `#08182B`).
* **Design Tips**:
  - Avoid text or tiny badges on the icon. The icon should be iconic, geometric, and instantly identifiable at 48x48px on a phone launcher.
  - Google Play automatically applies rounded corner masks (radius = 20%), so do **not** add artificial rounded corners or drop shadows around the 512x512 outer boundary. Fill the entire canvas.

---

## 3. Feature Graphic Design Guidelines (1024 x 500 px)

* **Composition**:
  - **Left Side**: Bold, stylized 3D typography: `REFLECTO` in warm golden candy letters with subtitle `Light & Mirror Puzzle`.
  - **Center & Right**: Action shot showing an emitter firing a brilliant glowing multi-color laser beam bouncing between two dark neon blue mirrors, splitting through an electric neon prism, and striking a happy golden sleepy star.
* **Google Play Safe Zone**:
  - Keep important logos, characters, and text within the central **safe zone** (inset by 15% from top/bottom/left/right), as Google Play overlays the app title, developer name, and install button on top of the banner in some layouts.

---

## 4. Phone Screenshot Storyboard (5 High-Converting Slides)

To maximize download conversion, each screenshot should feature an attractive top headline banner describing a key gameplay benefit:

### Screenshot 1: Core Mechanics
* **Headline Banner**: `BEND THE LIGHT, WAKE THE STARS!`
* **Visual**: Action gameplay from Series 1 (Level 10: *Sunny Diamond*), showing the laser beam striking mirrors and lighting up the sleepy golden stars with sparkling particle bursts.

### Screenshot 2: Content Depth & Progression
* **Headline Banner**: `100 HANDCRAFTED CHAMBER PUZZLES`
* **Visual**: The 100-Level Selection Hub view showing Series 1 through 10, star badges (`⭐ 3/3`), progress bars, and unlocked level series.

### Screenshot 3: Advanced Optics & Teleportation
* **Headline Banner**: `SPLIT BEAMS & TELEPORT WITH PORTALS`
* **Visual**: A mid-game chamber (Series 5 or 9) showing an electric Neon Blue prism splitting one beam into two distinct paths, plus a donut wormhole portal transporting light across walls.

### Screenshot 4: Story & Characters
* **Headline Banner**: `MEET PROFESSOR RAY & UNLOCK SECRETS`
* **Visual**: An opened Chapter Story Card modal showing the friendly owl avatar, dialogue speech bubble, and optical tips.

### Screenshot 5: Creative Freedom
* **Headline Banner**: `ZEN MODE & CREATIVE TOYBOX PLAYGROUND`
* **Visual**: The Creative Toybox sandbox screen showing custom placed mirrors, splitters, and custom laser paths with zero move limits.

---

## 5. Automated HTML5 Graphic Generator

We have included a dedicated visual graphic generator in [`tools/generate-store-assets.html`](../tools/generate-store-assets.html). 

You can open this file in any web browser to preview and download pixel-perfect **512x512 App Icons** and **1024x500 Feature Graphics** with high-resolution canvas rendering.
