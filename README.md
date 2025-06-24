# CurrencyDetectionApp

A mobile app solution for real-time currency detection, live exchange rates, and micro-vlogging. Built with React Native, Expo, and TensorFlow.js to showcase on-device machine learning, robust API integration, and interactive social features.

---

## Table of Contents
1. [Introduction](#introduction)
2. [Features](#features)
3. [Tech Stack](#tech-stack)
4. [Architecture](#architecture)
5. [Installation](#installation)
6. [Running the App](#running-the-app)
7. [Usage](#usage)
8. [Model & API Details](#model--api-details)
9. [Roadmap](#roadmap)
10. [Contributing](#contributing)
11. [License](#license)
12. [Contact](#contact)

---

## Introduction
CurrencyDetectionApp is a cross-platform (iOS & Android) mobile application that:
- Performs **real-time detection** of Bangladeshi Taka notes via device camera using on-device ML.
- Fetches **live exchange rates** for BDT, USD, and EUR from a public API.
- Enables **micro-vlogging** with zero-refresh posts, comments, and likes.

Developed as a 6th-semester capstone project, it demonstrates proficiency in:
- Integrating TensorFlow.js for on-device inference.
- Consuming RESTful APIs for dynamic data.
- Designing modular UI with React Native & Expo.

---

## Features
- 🎥 **Real-time Currency Detection**: Live recognition of BDT notes with bounding box and confidence.
- 💱 **Live Exchange Rates**: Up-to-the-second FX conversions via ExchangeRate-API.
- 📝 **Micro-Vlogging**: Seamless posting, commenting, and liking without page reloads.
- ⚙️ **Offline Inference**: ML detection runs entirely on-device.
---

## Tech Stack
- **Framework**: React Native & Expo (Bare Workflow)
- **ML**: TensorFlow.js & @tensorflow/tfjs-react-native
- **Network**: Axios for REST, Apollo Client for GraphQL integration
- **Backend**: Firebase Realtime Database for micro-vlog data
- **Language**: TypeScript
- **Package Manager**: Yarn

---


## Architecture
```
[Camera Module] --> [Expo Camera] --> [TF.js Inference] --> [UI Overlay]
[Rates Module] --> [API Fetch] --> [Display Screen]
[Social Module] --> [Firebase Calls] --> [Feed Screen]
```
Component-based design ensures scalability and maintainability across modules.

---

## Installation
```bash
# Clone the repository
git clone https://github.com/SabbirHasanBhuiyan/CurrencyDetectionApp.git
cd CurrencyDetectionApp

# Install dependencies (choose one)
yarn install
# or
npm install
```

---

## Running the App
```bash
# Start Metro Bundler / Dev Server
# using npm:
npm start
# or using yarn:
yarn start

# Launch on Android device/emulator
# using npm:
npm run android
# or using yarn:
yarn android

# Launch on iOS simulator/device
# using npm:
npm run ios
# or using yarn:
yarn ios
```

---

## Usage
1. **Detection**: Grant camera permission, frame a BDT note, and view detection overlays.
2. **Snapshot**: Tap the camera icon to save a snapshot to the in-app gallery.
3. **Rates**: Switch to the Rates tab to see live FX conversions.
4. **Micro-Vlog**: Create posts, comment, and like. All updates happen instantly.

---

## Model & API Details
- **Model:** Trained with **Google Teachable Machine**, using ~1,000 total images (3 classes). Exported directly to TensorFlow.js format for on-device inference.
- **Performance:** Currently achieving low accuracy due to limited training data and class imbalance; average inference time ~30s on mid-range devices.

- **FX API:** Integrates [ExchangeRate-API](https://www.exchangerate-api.com/) via Axios with error handling for network issues.
- **Social Data:** Performs CRUD operations on posts, comments, and likes using Firebase Realtime Database.

---

## Roadmap
- 📈 **Improve Model Accuracy:** Collect more balanced training data, use data augmentation, and fine-tune model architecture.
- ⚡ **Optimize Inference Speed:** Convert model to TensorFlow Lite, apply quantization, and prune layers for faster on-device performance.
- 🔄 **Support Additional Currencies:** Add USD, EUR, INR, JPY detection with expanded dataset.
- 🎙️ **Text-to-Speech:** Announce detected denominations via TTS for accessibility.
- ☁️ **Cloud Backup & User Sync:** Store snapshots and micro-vlogs tied to user accounts.
---
---

## Contributing
1. Fork repo
2. Create feature branch: `git checkout -b feature/YourFeature`
3. Commit & push
4. Open PR

Please open an issue for major changes or suggestions.

---

## License
This project is licensed under the **MIT License**. 

## Contact
**Sabbir Hasan**  
Email: sabbirhasan675@gmail.com  
LinkedIn: [linkedin.com/in/SabbirHasanBhuiyan](https://linkedin.com/in/SabbirHasanBhuiyan)
