# BeatMaker Studio

A modern, minimalist DAW-style beat maker built with React, Tone.js, and Tailwind CSS.

## Features

- **6-channel Step Sequencer** — Kick, Snare, Hi-Hat, Clap, Tom, Melody (16 or 32 steps)
- **Per-channel controls** — Volume, Mute, Solo
- **Polyphonic Synthesizer** — ADSR envelope, 4 waveforms, octave selector, piano roll
- **Master FX** — Delay (time, feedback, mix) + Reverb (decay, mix)
- **BPM Control** — 60–180 BPM with real-time sync
- **Export WAV** — Renders your beat locally at 44.1kHz
- **Save/Load JSON** — Portable project files
- **Share Link** — Compressed URL you can paste anywhere

---

## Quick Start (Development)

### Prerequisites
- Node.js 18+ (https://nodejs.org)

### Install & Run

```bash
cd Desktop/beatmaker-app
npm install
npm run dev
```

Open your browser at **http://localhost:5173**

---

## Build for Web (Deploy)

```bash
npm run build
```

Output goes to `dist/`. You can:
- **Deploy to Vercel**: `npx vercel dist`
- **Deploy to Netlify**: drag & drop the `dist/` folder at netlify.com/drop
- **Host yourself**: serve the `dist/` folder with any static file server

---

## Package as Desktop App (Electron)

```bash
npm install --save-dev electron electron-builder concurrently wait-on
```

Add to `package.json`:
```json
{
  "main": "electron/main.js",
  "scripts": {
    "electron:dev": "concurrently \"npm run dev\" \"wait-on http://localhost:5173 && electron .\"",
    "electron:build": "npm run build && electron-builder"
  }
}
```

Create `electron/main.js`:
```js
const { app, BrowserWindow } = require('electron')
const path = require('path')

function createWindow() {
  const win = new BrowserWindow({ width: 1200, height: 800 })
  win.loadFile(path.join(__dirname, '../dist/index.html'))
}

app.whenReady().then(createWindow)
```

Then run `npm run electron:build` to get a `.exe` / `.dmg` installer.

---

## How to Use

1. **Play** — Click the purple PLAY button or press Space (when focused)
2. **Program beats** — Click cells in the Sequencer grid to toggle steps ON/OFF
3. **Melody** — Switch to the SYNTH tab, enable steps in the MELODY row, then assign notes
4. **Effects** — Switch to the FX tab and drag the knobs
5. **Export** — Click "⬇ Export WAV" at the bottom to download your beat
6. **Share** — Click "🔗 Share Link" to copy a URL with your full project embedded
