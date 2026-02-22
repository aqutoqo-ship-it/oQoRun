# 📦 oQoRun Website — Infrastructure & Development Log

## 📖 Introduction
**oQoRun** is a local AI model launcher specifically designed for low-end hardware. It provides an OpenAI-compatible API interface and features a live UI code preview, allowing older laptops to serve as powerful backend engines for AI Agents.

## 🏗️ Core Architecture
- **Frontend Technology**: Pure HTML5 + Vanilla CSS + JavaScript (ES6).
- **Shared Modules**: 
    - Integrates global `shared/` resources, including `firebase-init.js`, `ads.js`, and `style-base.css`.
    - Uses relative paths (`./shared/`) to ensure reliable connectivity across custom domains (e.g., GitHub Pages).
- **Data Synchronization**: Real-time Download and Like statistics powered by Firebase Firestore (Compat SDK 10.7.1).
- **Deployment**: **GitHub Pages** with automated CI/CD.
- **Monetization**: Utilizes the `SharedAds` module to implement a 5-second mandatory interstitial ad before downloads.

## ✨ Key Features
1. **Real-time Counters**: Automatically synchronizes and displays global `Likes` and `Downloads` metrics.
2. **Image Carousel**: 
    - Located in the center of the page, showcasing software interface screenshots (`1.png` - `6.png`).
    - Supports 5-second auto-play.
    - Includes manual navigation arrows and indicator dots.
    - **Smart Pause**: Auto-pauses on hover and resumes when the mouse leaves.
3. **Resilient Design**: 
    - Features a decoupled architecture; the carousel remains functional even if Firebase or ad resources fail to load.
4. **GitHub Pages Optimization**: 
    - Includes a `.nojekyll` file to prevent GitHub from filtering essential resource folders like `shared`.

## 🛠️ Development & Bug Fix Log (2026-02-22)
1. **Path Correction**: 
    - Migrated `../shared/` to `./shared/` and reorganized directories to resolve 404 errors on custom domains.
2. **Link Fixes**: 
    - Corrected the `oQoRun.zip` download path.
    - Verified and updated the `Buy me a coffee` donation link.
3. **New Features**: Developed a responsive image carousel component from scratch.
4. **Deployment Optimization**: Resolved Jekyll cache filtering issues that caused 404s, ensuring full asset deployment.
5. **Firebase Stability**: Fixed initialization crashes by adding missing dependencies (`firebase-auth-compat.js`) and resolving `ads.js` syntax errors.

---
*This documentation is maintained by Antigravity AI as part of the AQutoQo architecture.*
