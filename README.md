# 🚀 Krishnabharathi Portfolio App
### Ultra-Premium React Native Portfolio — Production Ready

---

## 📁 Complete Folder Structure

```
krishnabharathi-portfolio/
├── app/                          # Expo Router screens
│   ├── _layout.tsx               # Root navigator + providers
│   ├── index.tsx                 # Splash Screen (2.8s cinematic)
│   ├── home.tsx                  # Home + Profile (typing anim, stats)
│   ├── about.tsx                 # About Me + Education + Certs
│   ├── skills.tsx                # Animated progress bars + filter
│   ├── projects.tsx              # Swipeable project cards + screenshots
│   ├── experience.tsx            # Animated timeline (left-right)
│   └── contact.tsx               # Contact cards + FAB email button
│
├── src/
│   ├── components/
│   │   ├── GlassCard.tsx         # Reusable glassmorphism card
│   │   └── NavBar.tsx            # Bottom navigation bar
│   ├── data/
│   │   └── portfolio.ts          # ALL your data (edit this!)
│   ├── hooks/
│   │   └── useAnimatedCounter.ts # Animated number counter
│   └── theme/
│       ├── theme.ts              # Colors, fonts, spacing constants
│       └── ThemeContext.tsx      # Dark/Light theme provider
│
├── assets/
│   ├── images/                   # Profile pic + project screenshots
│   │   ├── profile.png           ← YOUR PHOTO HERE
│   │   ├── y1.png → y7.png       ← Yaazhtech screenshots
│   │   ├── g1.png → g3.png       ← Gaming app screenshots
│   │   └── icon.png, splash.png  ← App icon
│   ├── pdf/
│   │   └── resume.pdf            ← YOUR RESUME HERE
│   └── sound/
│       ├── backgroundSound.mp3   ← Background music
│       └── success.wav           ← Download success sound
│
├── scripts/
│   └── setup-assets.js           # Creates placeholder assets
├── app.json
├── babel.config.js
├── package.json
└── tsconfig.json
```

---

## 🛠️ Installation & Setup

### Step 1: Install Dependencies
```bash
npm install
# or
npx expo install
```

### Step 2: Create Placeholder Assets
```bash
node scripts/setup-assets.js
```

### Step 3: Add Your Real Assets
Replace placeholder files with your actual assets:
- `assets/images/profile.png` — Your profile photo (square, min 400x400)
- `assets/images/y1.png` to `y7.png` — Yaazhtech project screenshots
- `assets/images/g1.png` to `g3.png` — Gaming app screenshots
- `assets/pdf/resume.pdf` — Your resume
- `assets/sound/backgroundSound.mp3` — Background music
- `assets/sound/success.wav` — Success sound effect

### Step 4: Update Your Data
Edit `src/data/portfolio.ts` to update your:
- Personal info (email, phone, LinkedIn, GitHub)
- Skills with levels
- Project descriptions
- Education details

### Step 5: Run the App
```bash
# Development
npx expo start

# Android
npx expo start --android

# iOS
npx expo start --ios
```

---

## 📱 Screens Overview

| Screen | Features |
|--------|----------|
| **Splash** | Logo scale + glow rings + tagline fade, 2.8s cinematic |
| **Home** | Floating profile, typing animation, stats, 3 CTAs |
| **About** | Objective, education timeline, certifications, stats grid |
| **Skills** | Animated progress bars, category filter, top-3 spotlight |
| **Projects** | Swipeable screenshot cards, tech tags, live demo links |
| **Experience** | Alternating left-right timeline with glowing dots |
| **Contact** | Copy-to-clipboard, FAB email button, availability badge |

---

## 🎨 Design System

**Dark Theme (Default)**
- Background: `#0D0D0D`
- Accent: `#7F5AF0` → `#2CB67D` gradient
- Surface: `rgba(255,255,255,0.05)` glassmorphism

**Typography**
- Headings: 28-42px, weight 900, letter-spacing
- Body: 14-16px, weight 400-600
- Labels: 10-12px, uppercase, letter-spacing

---

## 🚀 Production Build

```bash
# Install EAS CLI
npm install -g eas-cli

# Login to Expo
eas login

# Configure
eas build:configure

# Build Android APK
eas build --platform android --profile preview

# Build iOS (requires Apple Developer account)
eas build --platform ios --profile preview
```

---

## 📦 Key Dependencies

```
expo ~54.0.33
react-native 0.81.5
expo-router ~6.0.23          # File-based navigation
react-native-reanimated ~4.1.1 # Smooth animations
expo-linear-gradient ~15.0.8  # Gradient effects
expo-blur ~15.0.8             # Glassmorphism
expo-av ~16.0.8               # Sound playback
expo-haptics ~15.0.8          # Tactile feedback
expo-file-system ~18.0.12     # Resume download
expo-sharing ~13.0.3          # Share resume
```

---

## 🔧 Customization

### Change Theme Colors
```ts
// src/theme/theme.ts
export const COLORS = {
  dark: {
    accent: '#7F5AF0',        // Purple — change to your brand color
    accentSecondary: '#2CB67D', // Green
    ...
  }
}
```

### Add More Projects
```ts
// src/data/portfolio.ts → projects array
{
  id: "proj4",
  title: "Your New Project",
  subtitle: "Category",
  description: "Description",
  tech: ["React Native", "Node.js"],
  website: "https://yoursite.com",
  github: "https://github.com/yourrepo",
  color: "#FF6B6B",
  screenshots: [require('../../assets/images/new-screenshot.png')],
}
```

---

## ✅ Features Checklist

- [x] Cinematic splash screen (2.8s)
- [x] Dark/Light theme toggle with animation
- [x] Floating profile with glow ring
- [x] Typing animation for role
- [x] Animated stats counter
- [x] Resume download alert
- [x] Horizontal swipeable project cards
- [x] Screenshot gallery per project
- [x] Animated progress bars for skills
- [x] Category filter for skills
- [x] Alternating timeline for experience
- [x] Copy-to-clipboard contact
- [x] FAB email button with ripple
- [x] Haptic feedback on interactions
- [x] Bottom navigation bar
- [x] Tech tag filtering for projects
- [x] Glassmorphism cards
- [x] Gradient accents throughout

---

**Built with ❤️ for Krishnabharathi Sakthivel — Full Stack Developer**
