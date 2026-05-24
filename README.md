

# 🚨 SafeSignal-AI

### From Surveillance to Smart Protection

**SafeSignal-AI** is an AI-powered silent emergency detection system designed to transform traditional CCTV surveillance into an **active safety network**.

Using **computer vision**, **pose estimation**, and **gesture recognition**, SafeSignal detects predefined distress gestures from live camera feeds and automatically triggers emergency alerts through multiple communication channels.

> Turning passive surveillance into proactive protection.

---

## 🌟 Problem Statement

Traditional CCTV systems only **record incidents** and depend on manual review after an event occurs.

In high-risk environments such as:

* 🏬 Shopping Malls
* 🏠 Residential Homes
* 💎 Jewellery Stores
* 🏦 Banks

Victims may be unable to:

* Reach panic buttons
* Make emergency calls
* Seek help without escalating danger

SafeSignal solves this problem by enabling **silent gesture-based emergency activation** using existing surveillance infrastructure.

---

## 💡 Solution Overview

SafeSignal continuously monitors CCTV/live video feeds and detects emergency gestures in real time.

### Supported Distress Signals

✅ **Crossed Arms “X” Gesture** *(Silent SOS)*

✅ **Hands-Up Gesture** *(Distress Signal)*

✅ **Custom Dynamic Gestures** *(User-defined emergency trigger)*

The system validates gestures over a fixed duration to reduce false alarms before activating emergency protocols.

---

## ⚙️ Core Features

### 🎯 AI Gesture Detection

* Real-time posture analysis
* Pose estimation pipeline
* Silent emergency recognition

### 📹 CCTV Integration Ready

* Works with existing surveillance systems
* Continuous monitoring support
* Scalable deployment architecture

### 🚨 Multi-Channel Emergency Alerts

Automatic notification system:

* 📩 SMS Alerts
* 📧 Gmail Notifications
* 📱 Phone Calls
* 💬 WhatsApp Messages

### 📍 Live Location Tracking

Alert packets include:

* GPS Coordinates
* Timestamp
* Emergency Status
* Incident Metadata

### 🧾 Evidence Logging

* Event history storage
* Alert tracking
* Threat documentation

### 🔍 Weapon Detection Extension

AI training support using CCTV weapon datasets.

Dataset used:

🔗 [CCTV Weapon Dataset (Kaggle)](https://www.kaggle.com/datasets/simuletic/cctv-weapon-dataset)

---

## 🧠 System Workflow

```text
Live CCTV Feed
        │
        ▼
Pose Estimation Engine
        │
        ▼
Gesture Recognition Layer
        │
        ▼
Validation Window
(False Alarm Reduction)
        │
        ▼
Emergency Trigger
        │
 ┌──────┼────────┬──────────┐
 │      │        │          │
SMS   Email    Call    WhatsApp
        │
        ▼
Location + Status Alert
```

---

## 🏗 Architecture

```text
Camera / CCTV Stream
        │
        ▼
Computer Vision Module
(OpenCV + Pose Detection)
        │
        ▼
Gesture Classification
        │
        ▼
Emergency Decision Engine
        │
        ▼
Notification Service
        │
        ▼
Security Team / Authorities
```

---

## 📊 Insights & Data Sources

SafeSignal processes and generates insights from:

### Real-Time Inputs

* CCTV Live Feeds
* SOS Activations
* Emergency Gesture Events
* GPS Location Streams

### AI Datasets

* CCTV weapon detection datasets
* Threat identification samples
* Distress gesture training data

### Generated Insights

* Dynamic safety monitoring
* Real-time anomaly alerts
* Threat detection analytics
* Risk heatmaps

---

## 🧪 Prototype Use Cases

### 🏬 Shopping Mall Security

Detect robbery attempts and silently notify security teams.

### 💎 Jewellery Shop Protection

Hands-free emergency activation during armed threats.

### 🏦 Banking Environment

Silent alerts for hostage situations or coercion events.

### 🏠 Residential Monitoring

AI-assisted emergency response inside homes.

---

## 📚 Case Studies Behind SafeSignal

SafeSignal was inspired by security failures highlighted in major incidents:

* Lopburi mall shooting
* 2009 Graff Diamonds robbery
* Northern Bank robbery

These incidents exposed limitations in passive surveillance systems and motivated proactive AI safety approaches.

---

## 🚀 Future Roadmap

### 1. CCTV Infrastructure Integration

* Direct enterprise camera deployment
* Smart mall integration
* Retail security extensions

### 2. Mobile Application

Features planned:

* Live CCTV viewing
* Instant notifications
* Voice assistance
* Emergency dashboard
* Location monitoring

### 3. Smart Safety Ecosystem

* SaaS Security Platform
* Workspace Safety Suite
* Centralized monitoring system

---

## 🛠 Tech Stack

```yaml
Frontend:
  - React / Next.js
  - Vercel Deployment

AI / CV:
  - OpenCV
  - Pose Estimation
  - Gesture Recognition
  - Weapon Detection Models

Notifications:
  - Gmail API
  - SMS Gateway
  - WhatsApp Integration
  - Calling Services

Deployment:
  - Vercel
  - Cloud-based Monitoring
```

---

## 👥 Team

**Team Name:** *The Missing Semicolon*

**Presented By**

* Lokesh Hazra
* Sreoshi Bhowmik

---

## 📜 License

This project is released under the **MIT License**.

---

## ⭐ Vision

**SafeSignal-AI aims to make emergency response silent, intelligent, and immediate — transforming surveillance systems from passive observers into active protectors.**

---

Source presentation: 
