# 🌌 FocusFlow — Virtual Study Room

> A distraction-free, aesthetic virtual workspace featuring customizable Pomodoro timers, atmospheric ambient environments, and productivity sessions designed for deep focus.

---

## 📸 Interface Preview

![FocusFlow Workspace Preview](https://images.unsplash.com/photo-1521587760476-6c12a4b040da?auto=format&fit=crop&w=1200&q=80)

---

## 🚀 Version Roadmap & Changelog

FocusFlow is built incrementally across three distinct milestone versions:

| Version | Status | Focus Areas |
| :--- | :--- | :--- |
| **`v1.0.0`** | **✅ Released** | **Core Timer & Glassmorphic Workspace** (Pomodoro state machine, circular SVG dial, cozy library room, Web Audio chime alerts, customizable settings modal) |
| **`v2.0.0`** | **✅ Released** | **Ambient Soundscapes & Focus Tasks** (Multi-track mixer, procedural Brown/White/Rain noise, Lofi Beats player, interactive tasks drawer, active focus pin) |
| **`v3.0.0`** | **⏳ Next** | **Study Analytics & Gamification** (Daily study streak, historical session logs, productivity charts, level-up XP system) |

---

## 🎧 What's New in Version 2.0.0

### 1. 📋 Interactive Focus Tasks & Checklist
* **Slide-out Tasks Drawer**: Frosted glass side panel accessible from the top navbar or the floating action button.
* **Active Focus Pinning**: Mark any task with the star icon to pin it directly under the countdown timer (`Focusing on: ...`).
* **Filters & Counter**: Filter by All, Active, or Completed tasks with a real-time pending badge counter.
* **Local Persistence**: Tasks and active focus selection remain saved across browser reloads via `localStorage`.

### 2. 🎶 Multi-Track Ambient Soundscapes & Lofi Player
* **Procedural Sound Generators**:
  * **Brown Noise**: Deep low-frequency rumble for masking distractions.
  * **White Noise**: Soft waterfall white noise.
  * **Rainy Windowpane**: Organic rain droplets hitting glass using dynamic bandpass filtering.
* **Lofi Chillhop Beats Player**: Stream atmospheric background study lo-fi beats with Play/Pause and Next Song controls.
* **Multi-Track Mixer Modal**: Blend volume levels for multiple ambient sound layers simultaneously.
* **Master Mute**: One-click instant audio silencer.

### 3. 🖼️ Multi-Scene Environment Switcher
* Switch between 6 cozy high-resolution study environments with smooth visual transitions:
  1. 📚 **Old Library** (Default)
  2. 🌧️ **Rainy Window**
  3. ☕ **Night Cafe**
  4. 🛏️ **Lofi Bedroom**
  5. 🌲 **Mystic Forest**
  6. 🌌 **Deep Space**

---

## 🌟 Version 1.0.0 Features (Recap)

* **Pomodoro Timer**: Focus (25m), Short Break (5m), and Long Break (15m).
* **SVG Circular Ring**: Fluid progress dial with glowing purple accent.
* **Tibetan Singing Bowl Alert**: Gentle harmonic audio chime synthesized via Web Audio API.
* **Glassmorphism Design**: Frosted glass cards, glowing borders, and floating dust particle canvas.
* **Keyboard Shortcuts**: <kbd>Space</kbd> (Play/Pause), <kbd>R</kbd> (Reset), <kbd>F</kbd> (Fullscreen).

---

## 📂 Project Structure

```text
FocusFlow/
├── index.html           # Semantic HTML5 layout & responsive UI
├── css/
│   └── styles.css       # Glassmorphism design system & V1/V2/V3 styles
├── js/
│   ├── timer.js         # Pomodoro state machine & SVG dial animations
│   ├── audio.js         # Multi-track procedural audio & lofi engine
│   ├── tasks.js         # Focus task checklist & active task pinning
│   └── particles.js     # Ambient dust motes particle animation
├── assets/              # Icons and graphics
└── README.md            # Master project documentation & changelog
```

---

## 🛠️ How to Run Locally

Because FocusFlow is built using modern native web standards, **no build tools or node_modules are required**:

1. Open the project folder:
   ```bash
   cd "C:\Users\vaish\Documents\AK_atharav\MY Projects\Antigravity_Project\FocusFlow"
   ```
2. Double-click `index.html` to open directly in any modern web browser.
3. Or serve locally with Python:
   ```bash
   python -m http.server 8000
   ```
   and visit `http://localhost:8000`.

---

## 🌿 Git Milestones

* **`v1.0.0`**: Initial release — Complete Pomodoro timer, ambient library UI, Web Audio chimes, and settings modal.
* **`v2.0.0`**: Ambient sound mixer, procedural noise, Lofi beats, environment switcher, and to-do task list.
* **`v3.0.0`**: Productivity stats dashboard, history logs, and level gamification.
