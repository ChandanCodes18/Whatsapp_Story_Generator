# 📱 WhatsApp Story Generator

[![Live Demo](https://img.shields.io/badge/Demo-Live%20App-25D366?style=for-the-badge&logo=whatsapp&logoColor=white)](https://whatsapp-story-generator-xi.vercel.app/app)
[![Next.js](https://img.shields.io/badge/Next.js-15%2B-black?style=for-the-badge&logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg?style=for-the-badge)](LICENSE)

> **Create pixel-accurate, animated WhatsApp chat mockups, viral text stories, and video reels with zero video editing experience.**

🔗 **Live Application:** [https://whatsapp-story-generator-xi.vercel.app/app](https://whatsapp-story-generator-xi.vercel.app/app)

---

## 💡 What is WhatsApp Story Generator?

**WhatsApp Story Generator** is an all-in-one studio built for content creators, authors, screenwriters, educators, and social media marketers. It allows you to produce photorealistic WhatsApp chat conversations, export them as **high-resolution images**, or generate **cinematic animated videos** with realistic typing delays and authentic sound effects.

Whether you are crafting viral TikTok/Reels horror fiction, marketing product demos, creating educational case studies, or sharing funny text exchanges, this tool turns your written scripts into engaging visual stories in seconds.

---

## ✨ Key Features

### 🎨 Pixel-Accurate WhatsApp Experience
- **Authentic UI & Themes:** Seamlessly switch between WhatsApp Light Mode and Dark Mode with true WhatsApp color codes, typography, dynamic tails, and status ticks.
- **Custom Wallpaper & Frames:** Choose from default WhatsApp doodle patterns, solid background colors, or clean presentation backdrops wrapped in a modern smartphone bezel with a Dynamic Island / notch.
- **Header & Status Details:** Customize contact names, avatars, online/typing statuses, verified badges, and group chat headers.

### 💬 Comprehensive Message Types
- **Standard Text Bubbles:** Outgoing and incoming text with read receipts (single tick, double tick, blue tick).
- **Interactive WhatsApp Polls:** Create authentic poll cards with single-choice or multi-choice options, clickable voting previews, and WhatsApp poll badges.
- **Rich Media & Attachments:**
  - 📷 **Photos:** Full-width image previews with custom captions and lightbox viewing.
  - 🎥 **Videos:** Video thumbnails with durations and caption support.
  - 🎙️ **Voice Notes / Audio:** Realistic WhatsApp audio waveform bubbles with playback simulation.
  - 📞 **Voice & Video Call Logs:** Missed, answered, and outgoing call event logs.
  - 🚫 **Deleted Messages:** Authentic *"This message was deleted"* placeholder styling.
- **System Events & Dividers:** Insert date dividers (`TODAY`, `YESTERDAY`), group member added/left alerts, and security notice banners.

### ⚡ Smart Script Importer (Bulk Production)
Turn a raw script or dialogue draft into an entire group conversation in one click.
- **Direct `.txt` & `.md` Parsing:** Drag-and-drop or paste dialogue files.
- **Auto-Character Extraction:** Automatically detects all participants and assigns distinct WhatsApp group chat name colors.
- **Poll & Divider Recognition:** Identifies polls (`[Poll] Question | Opt 1 | Opt 2`) and date dividers (`# TODAY`) straight from plain text.

### 🎬 Animation & Export Studio
- **Animated Video Generation:** Automatically animates chat conversations with realistic typing indicators, message intervals, audio playback, and photo transitions.
- **In-Browser High-Performance Rendering:** Uses **WebCodecs** and **webm-muxer** for ultra-fast frame-by-frame video rendering directly on your device.
- **Audio Synchronization:** Realistic WhatsApp delivery chimes and audio tracks mixed using the Web Audio API.
- **High-Res Still Screenshots:** One-click PNG snapshot export up to 3x pixel ratio for crystal-clear social media publishing.

---

## 📝 Script Import Syntax Guide

You can write your story in any text editor or markdown file and upload it directly into the **Import Script** panel:

```markdown
Group: Weekend Road Trip 🚗
Me: Sam

Sam: Did everyone pack their bags?
Alex: Almost ready! Bringing the speakers 🎶
Jordan: Don't forget sunscreen!
Sam: [Poll] Where should we eat tonight? | Beach Shack 🏖️ | Night Market 🌮 | Seafood Grill 🦞
# TODAY
Sam: Flight is at 6 PM sharp, meet at Terminal 2.
Alex: On my way!
```

### Syntax Breakdown
| Directive / Format | Description |
| :--- | :--- |
| `Group: <Name>` | Sets the chat title and switches to Group Mode |
| `Me: <Name>` | Specifies which character represents "You" (the right-side green bubble) |
| `*Name: <Text>` | Prefixing a name with an asterisk also flags them as "Me" |
| `Name: <Text>` | Normal dialogue line assigned to that participant |
| `[Poll] Question \| Opt 1 \| Opt 2` | Creates an interactive WhatsApp poll bubble |
| `# <Text>` | Adds a centered date divider (e.g., `# TODAY`) |
| `---` | Inserts a custom system notification banner |

---

## 🛠️ Technology Stack

- **Framework:** [Next.js](https://nextjs.org/) (App Router, Turbopack)
- **UI & Components:** [React](https://react.dev/), [Lucide Icons](https://lucide.dev/)
- **State Management:** [Zustand](https://github.com/pmndrs/zustand)
- **Video & Image Processing:**
  - [WebCodecs API](https://developer.mozilla.org/en-US/docs/Web/API/WebCodecs_API) & [webm-muxer](https://github.com/Vanilagy/webm-muxer) (high-speed client-side video encoding)
  - [html-to-image](https://github.com/bubkoo/html-to-image) (DOM screenshotting)
  - Web Audio API (real-time sound effects and audio mixing)
- **Styling:** CSS Modules with responsive, pixel-tuned WhatsApp styling tokens
- **Language:** [TypeScript](https://www.typescriptlang.org/)

---

## 🚀 Getting Started Locally

### Prerequisites
- Node.js 18.18+ or later
- npm, pnpm, or yarn

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/your-username/whatsapp-story-generator.git
   cd whatsapp-story-generator
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Run the local development server:**
   ```bash
   npm run dev
   ```

4. **Open in browser:**
   Navigate to [http://localhost:3000/app](http://localhost:3000/app) to use the editor.

---

## 📦 Scripts

- `npm run dev` - Starts development server with Turbopack.
- `npm run build` - Creates an optimized production build.
- `npm run start` - Runs the built production application.
- `npm run lint` - Runs ESLint code quality checks.

---

## 📄 License

This project is licensed under the MIT License — see the [LICENSE](LICENSE) file for details.
