# Pattern Mirror - Complete Project Prompt

Create a retro-style memory pattern game called "Pattern Mirror" with the following specifications:

---

## 📋 Project Overview

**Game Name:** Pattern Mirror  
**Type:** Memory Pattern Matching Game  
**Style:** Retro 80s/90s Arcade (Cyberpunk/Neon aesthetic)  
**Tech Stack:** React + TypeScript + Vite + Tailwind CSS

---

## 🎮 Game Description

A pattern matching game where players must copy a displayed pattern. The twist: in later rounds, the pattern is horizontally mirrored! Players lose lives for wrong answers. Features both Single Player and 2-Player Battle modes.

### Game Rules:
- **Single Player:** Complete 10 rounds with 3 lives. Wrong answer = -1 life. Game over at 0 lives.
- **2-Player Battle:** Race to complete 10 rounds first. Wrong answers just slow you down (no lives lost).
- **Mirror Mode:** Rounds 8-10 require horizontal mirroring of the pattern.
- **Grid Progression:** 3×3 (R1-2) → 4×4 (R3-4) → 5×5 (R5-6) → 6×6 (R7-10)

---

## 📁 File Structure

```
my-app/
├── index.html
├── package.json
├── tsconfig.json
├── tsconfig.app.json
├── tsconfig.node.json
├── vite.config.ts
├── tailwind.config.js
├── postcss.config.js
├── src/
│   ├── main.tsx
│   ├── App.tsx
│   ├── App.css
│   ├── index.css
│   └── utils/
│       └── sound.ts
```

---

## 📦 Dependencies

Create a new Vite React TypeScript project and install these dependencies:

```bash
npm create vite@latest my-app -- --template react-ts
npm install tailwindcss postcss autoprefixer tailwindcss-animate
npm install clsx tailwind-merge class-variance-authority
npm install lucide-react
```

**package.json dependencies:**
```json
{
  "dependencies": {
    "class-variance-authority": "^0.7.1",
    "clsx": "^2.1.1",
    "lucide-react": "^0.562.0",
    "react": "^19.2.0",
    "react-dom": "^19.2.0",
    "tailwind-merge": "^3.4.0",
    "tailwindcss-animate": "^1.0.7"
  },
  "devDependencies": {
    "@types/react": "^19.2.5",
    "@types/react-dom": "^19.2.3",
    "@vitejs/plugin-react": "^5.1.1",
    "autoprefixer": "^10.4.23",
    "postcss": "^8.5.6",
    "tailwindcss": "^3.4.19",
    "typescript": "~5.9.3",
    "vite": "^7.2.4"
  }
}
```

---

## 🔧 Configuration Files

### vite.config.ts
```typescript
import path from "path"
import react from "@vitejs/plugin-react"
import { defineConfig } from "vite"

export default defineConfig({
  base: './',
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
});
```

### tailwind.config.js
```javascript
/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ["class"],
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
      },
      borderRadius: {
        xl: "calc(var(--radius) + 4px)",
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
        xs: "calc(var(--radius) - 6px)",
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
}
```

### postcss.config.js
```javascript
export default {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
}
```

### tsconfig.json
```json
{
  "files": [],
  "references": [
    { "path": "./tsconfig.app.json" },
    { "path": "./tsconfig.node.json" }
  ],
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@/*": ["./src/*"]
    }
  }
}
```

### index.html
```html
<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Retro Pattern Mirror</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>
```

---

## 💾 Source Code

### src/main.tsx
```typescript
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
```

### src/utils/sound.ts
```typescript
// Sound utility using Web Audio API - Generates synthesized sounds

class SoundManager {
  private audioContext: AudioContext | null = null;
  private enabled = true;

  private getContext(): AudioContext | null {
    if (!this.enabled) return null;
    if (!this.audioContext) {
      try {
        this.audioContext = new (window.AudioContext ||
          (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
      } catch {
        return null;
      }
    }
    return this.audioContext;
  }

  private playTone(
    frequency: number,
    duration: number,
    type: OscillatorType = "sine",
    volume = 0.3,
    fadeOut = true
  ): void {
    const ctx = this.getContext();
    if (!ctx) return;

    const oscillator = ctx.createOscillator();
    const gainNode = ctx.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(ctx.destination);

    oscillator.frequency.value = frequency;
    oscillator.type = type;

    const now = ctx.currentTime;
    gainNode.gain.setValueAtTime(volume, now);
    
    if (fadeOut) {
      gainNode.gain.exponentialRampToValueAtTime(0.01, now + duration);
    }

    oscillator.start(now);
    oscillator.stop(now + duration);
  }

  // Menu button click - short pleasant beep
  playMenuClick(): void {
    this.playTone(440, 0.1, "sine", 0.2);
  }

  // Cell click - short blip
  playCellClick(): void {
    this.playTone(880, 0.05, "square", 0.15);
  }

  // Correct answer - happy ascending arpeggio
  playCorrect(): void {
    const ctx = this.getContext();
    if (!ctx) return;
    const now = ctx.currentTime;
    
    [523.25, 659.25, 783.99, 1046.5].forEach((freq, index) => {
      const oscillator = ctx.createOscillator();
      const gainNode = ctx.createGain();
      oscillator.connect(gainNode);
      gainNode.connect(ctx.destination);
      oscillator.frequency.value = freq;
      oscillator.type = "sine";
      const startTime = now + index * 0.05;
      gainNode.gain.setValueAtTime(0, startTime);
      gainNode.gain.linearRampToValueAtTime(0.25, startTime + 0.02);
      gainNode.gain.exponentialRampToValueAtTime(0.01, startTime + 0.3);
      oscillator.start(startTime);
      oscillator.stop(startTime + 0.35);
    });
  }

  // Wrong answer - descending buzz
  playWrong(): void {
    const ctx = this.getContext();
    if (!ctx) return;
    const now = ctx.currentTime;
    
    [300, 250, 200].forEach((freq, index) => {
      const oscillator = ctx.createOscillator();
      const gainNode = ctx.createGain();
      oscillator.connect(gainNode);
      gainNode.connect(ctx.destination);
      oscillator.frequency.value = freq;
      oscillator.type = "sawtooth";
      const startTime = now + index * 0.08;
      gainNode.gain.setValueAtTime(0.2, startTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, startTime + 0.25);
      oscillator.start(startTime);
      oscillator.stop(startTime + 0.3);
    });
  }

  // Victory - fanfare melody
  playVictory(): void {
    const ctx = this.getContext();
    if (!ctx) return;
    const now = ctx.currentTime;
    const notes = [
      { freq: 523.25, time: 0, duration: 0.2 },
      { freq: 523.25, time: 0.2, duration: 0.2 },
      { freq: 523.25, time: 0.4, duration: 0.2 },
      { freq: 659.25, time: 0.6, duration: 0.4 },
      { freq: 523.25, time: 1.0, duration: 0.4 },
      { freq: 783.99, time: 1.4, duration: 0.8 },
    ];

    notes.forEach(({ freq, time, duration }) => {
      const oscillator = ctx.createOscillator();
      const gainNode = ctx.createGain();
      oscillator.connect(gainNode);
      gainNode.connect(ctx.destination);
      oscillator.frequency.value = freq;
      oscillator.type = "sine";
      const startTime = now + time;
      gainNode.gain.setValueAtTime(0, startTime);
      gainNode.gain.linearRampToValueAtTime(0.3, startTime + 0.05);
      gainNode.gain.exponentialRampToValueAtTime(0.01, startTime + duration);
      oscillator.start(startTime);
      oscillator.stop(startTime + duration);
    });
  }

  // Game Over - sad descending tones
  playGameOver(): void {
    const ctx = this.getContext();
    if (!ctx) return;
    const now = ctx.currentTime;
    const notes = [
      { freq: 349.23, time: 0, duration: 0.4 },
      { freq: 329.63, time: 0.3, duration: 0.4 },
      { freq: 311.13, time: 0.6, duration: 0.4 },
      { freq: 293.66, time: 0.9, duration: 1.0 },
    ];

    notes.forEach(({ freq, time, duration }) => {
      const oscillator = ctx.createOscillator();
      const gainNode = ctx.createGain();
      oscillator.connect(gainNode);
      gainNode.connect(ctx.destination);
      oscillator.frequency.value = freq;
      oscillator.type = "sawtooth";
      const startTime = now + time;
      gainNode.gain.setValueAtTime(0.25, startTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, startTime + duration);
      oscillator.start(startTime);
      oscillator.stop(startTime + duration);
    });
  }

  setEnabled(enabled: boolean): void {
    this.enabled = enabled;
  }

  resume(): void {
    if (this.audioContext && this.audioContext.state === "suspended") {
      this.audioContext.resume();
    }
  }
}

export const soundManager = new SoundManager();
```

### src/index.css
See the complete index.css file content from the project. Key features:
- Press Start 2P font from Google Fonts
- CSS variables for retro color palette
- Scanline overlay effect
- Neon glow text effects
- Cell animations (pulse, appear, shake)
- Button styles with 3D effect
- Grid styling with borders and shadows
- Hearts display animations
- Progress bars
- Team panel layout
- Victory/Game Over screens
- Confetti and star animations
- Responsive breakpoints

### src/App.css
Additional app-specific styles:
- Enhanced glow for active cells
- Grid border glow effect
- Mobile optimizations
- Life loss animations
- Round transitions
- Mirror warning flash
- Score pop animation

### src/App.tsx
The main React application containing:
- Type definitions for game state
- Utility functions for pattern generation and mirroring
- Cell and Grid components
- Hearts display component
- Mode badge component
- Team Panel component for 2P mode
- Victory, Game Over, and Win screen components
- Main App component with game logic
- Sound integration at all interaction points

---

## 🎨 Visual Design Specifications

### Color Palette
| Name | Hex | Usage |
|------|-----|-------|
| retro-bg | #0d0221 | Main background |
| retro-dark | #1a0b2e | Card/panel backgrounds |
| retro-purple | #45125e | Borders, accents |
| retro-pink | #ff006e | Secondary buttons, errors |
| retro-cyan | #00f5d4 | Primary buttons, highlights |
| retro-yellow | #fee440 | Score, warnings |
| retro-green | #00bb9f | Success states |
| retro-red | #ff3333 | Danger/loss |

### Typography
- **Font:** Press Start 2P (Google Fonts) - pixel art style
- **Sizes:** Use clamp() for responsive scaling

### Effects
- **Scanlines:** CSS repeating gradient overlay on body
- **Neon Glow:** Multiple text-shadows for glowing text
- **Cell Pulse:** Animated box-shadow on active cells
- **Button 3D:** box-shadow for depth, translateY on hover/active

---

## 🔊 Sound Effects

All sounds are synthesized using Web Audio API (no external files):

| Event | Sound |
|-------|-------|
| Menu button click | 440Hz sine wave, 0.1s |
| Cell click | 880Hz square wave, 0.05s |
| Correct answer | Ascending C major arpeggio |
| Wrong answer | Descending sawtooth buzz |
| Victory | Fanfare melody (C-C-C-E-C-G) |
| Game Over | Sad descending F-E-D#-D |

---

## 🚀 Build & Deploy

```bash
# Development
npm run dev

# Build
npm run build

# Preview build
npm run preview
```

---

## 📱 Responsive Breakpoints

- Mobile: < 640px (single column, smaller grids)
- Tablet: 641px - 1023px (adjusted spacing)
- Desktop: > 1024px (full 2P side-by-side layout)

---

## ✨ Key Features to Implement

1. **Pattern Generation:** Random boolean grids with 40% density
2. **Mirror Logic:** Horizontal flip for rounds 8-10
3. **Progressive Difficulty:** Grid size increases every 2 rounds
4. **Lives System:** 3 hearts, lose one per wrong answer (1P only)
5. **Score System:** +10 points per correct round (1P only)
6. **Battle Mode:** Two players race side-by-side
7. **Visual Feedback:** Flash effects for correct/wrong answers
8. **Animations:** Cell appear, success/error glow, confetti
9. **Sound Effects:** Web Audio API synthesized sounds
10. **Responsive Design:** Works on mobile and desktop
