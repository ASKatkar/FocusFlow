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
| **`v2.0.0`** | **⏳ Next** | **Ambient Soundscapes & Focus Tasks** (Procedural Brown/White/Pink noise, rain & cafe audio layers, environment theme switcher, integrated task checklist) |
| **`v3.0.0`** | **⏳ Planned** | **Study Analytics & Gamification** (Daily study streak, historical session logs, productivity charts, level-up XP system) |

---

## 🌟 Version 1.0.0 Features

### 1. ⏱️ Pomodoro Timer Engine
* **Three Dedicated Modes**:
  * **Focus**: Default 25 minutes of uninterrupted work.
  * **Short Break**: 5-minute breather between study cycles.
  * **Long Break**: 15-minute restorative rest after completing 4 consecutive focus sessions.
* **Animated Circular Progress Dial**: Smooth SVG ring tracking elapsed time with dynamic glowing purple accent.
* **Session Cycle Dots**: Visual indicator of progress through the standard 4-block Pomodoro cycle.
* **Browser Tab Updates**: Real-time timer countdown in document title `(24:59) Focus — FocusFlow`.

### 2. 🪟 Atmospheric Glassmorphism Design
* **Cinematic Backdrop**: Cozy vintage library scene with warm sunlight streaming through arched windows.
* **Ambient Floating Particles**: Gentle dust motes floating through sunbeams powered by an optimized HTML5 Canvas.
* **Frosted Glass Cards**: Sleek translucent dark cards with modern backdrop-blur and glowing borders.

### 3. 🔔 Audio & Alerts
* **Procedural Singing Bowl Chime**: Built using the Web Audio API with zero external audio assets. Plays a soothing harmonic alert when sessions finish.
* **Brown Noise Engine**: High-fidelity procedural Brownian noise generator to mask room distractions.

### 4. ⚙️ Customization & Presets
* **Custom Durations**: Adjust Focus, Short Break, and Long Break lengths from 1 to 120 minutes.
* **Auto-Start Cycles**: Optional automatic progression between focus and break periods.
* **Persistent Settings**: Configuration auto-saved to browser `localStorage`.

### 5. ⌨️ Keyboard Shortcuts
* <kbd>Space</kbd> — Start / Pause timer
* <kbd>R</kbd> — Reset current session
* <kbd>F</kbd> — Toggle Fullscreen mode

---

## 📂 Project Structure

```text
FocusFlow/
├── index.html           # Core HTML5 layout & semantic structure
├── css/
│   └── styles.css       # Glassmorphism design system & responsive styling
├── js/
│   ├── timer.js         # Pomodoro state machine & dial rendering
│   ├── audio.js         # Web Audio API sound engine & chime synthesizer
│   └── particles.js     # Canvas dust motes particle animation
├── assets/              # Icons and graphics
└── README.md            # Comprehensive project documentation
```

---

## 🛠️ How to Run Locally

Because FocusFlow is built using modern native web standards, **no build tools or node_modules are required**:

1. Clone or open the project folder:
   ```bash
   cd "C:\Users\vaish\Documents\AK_atharav\MY Projects\Antigravity_Project\FocusFlow"
   ```
2. Double-click `index.html` or open it with any modern web browser (Chrome, Edge, Firefox, Safari).
3. Alternatively, launch with VS Code's **Live Server** extension or run a quick local server:
   ```bash
   python -m http.server 8000
   ```
   and navigate to `http://localhost:8000`.

---

## 🌿 Git Milestones

* **`v1.0.0`**: Initial release — Complete Pomodoro timer, ambient library UI, Web Audio chimes, and settings modal.
* **`v2.0.0`**: Ambient sound mixer, environment switcher, and to-do task list.
* **`v3.0.0`**: Productivity stats dashboard, history logs, and level gamification.
