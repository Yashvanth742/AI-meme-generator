<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://ai.google.dev/static/site-assets/images/share-ais-513315318.png" />
</div>

# Run and deploy your AI Studio app

This contains everything you need to run your app locally.

View your app in AI Studio: [https://ai.studio/apps/575be7f9-a32e-4439-bbac-4530e295be6c](https://ai-meme-generator-1-ulix.onrender.com/)

## Run Locally

**Prerequisites:**  Node.js


1. Install dependencies:
   `npm install`
2. Set the `GEMINI_API_KEY` in [.env.local](.env.local) to your Gemini API key
3. Run the app:
   `npm run dev`

   # ⚡ AI Meme Generator (Cosmic Slate Edition)

An AI-powered meme generator built with **React (Vite) + Express + TypeScript** and powered by **Google Gemini API**. Users can select trending templates, upload custom files, generate custom bases using AI text-to-image prompts, or rewrite existing images using instructions. The core feature is the **"Magic Caption"** board, which scans the image context and suggests five custom, hilarious, trope-aligned meme captions with detailed explanations.

---

## 🎯 Project Overview & Purpose

Memes are the native language of the internet, but finding the perfect joke for a unique reaction image takes time. **AI Meme Generator** bridges the gap between AI understanding and internet culture.

By feeding your image directly to **Gemini's multimodal models**, the application analyses facial expressions, background elements, and visible items to suggest five tailor-made captions based on classic meme tropes (relatable pain, sarcasm, dev panic, or galaxy-brain logic). 

---

## ✨ Key Features

- **🧠 Multimodal Magic Caption Board**: One-click analysis scans any template or upload using a smart fallback pipeline (`gemini-2.5-flash` ➜ `gemini-1.5-flash` ➜ `gemini-3.1-pro-preview`) to deliver 5 funny, context-specific captions.
- **🎨 Custom AI Template Engine**: Describe any concept (e.g., *"A programmer hamster panicking over code"*) and generate a brand-new meme base instantly using `gemini-3.1-flash-image-preview`.
- **🖌️ AI Image Painter & Modifier**: Instruct the AI to edit an existing base image directly (e.g., *"Add neon laser sunglasses"* or *"Make it look like a vintage painting"*).
- **📐 Interactive Meme Canvas Modifiers**:
  - **Meme Styles**: Switch seamlessly between **Classic Overlay** (bold Impact text), modern **Twitter/X-style** header, or dynamic **Breaking News Banner** overlays.
  - **Typography Controls**: Choose between classic meme fonts (`Impact`, `Inter`, `Space Grotesk`, `JetBrains Mono`), scale size, and configure custom stroke outlines.
  - **Height Positioning Sliders**: Fine-tune where the top and bottom text sit directly on the image.
  - **Filter Suite**: Apply instant photo-filters (vintage, grayscale, sepia, invert, or blur).
- **📤 Smart Drag-and-Drop Uploader**: Seamlessly drag and drop your own custom images directly into the design canvas.
- **💾 Canvas Renderer & Export**: Compiles overlays, text heights, filters, and borders on a high-fidelity client-side HTML canvas for pristine, water-mark free `.png` downloads.

---

## 🛠️ Tech Stack & Architecture

- **Frontend**: React 19, TypeScript, Tailwind CSS, Lucide Icons, Motion.
- **Backend (API Proxy)**: Express, Node.js, `dotenv`, `esbuild`, `tsx`.
- **AI Integration**: `@google/genai` (Official modern Google GenAI SDK).
- **Build System**: Vite compiled assets bundled with Node-executable server builds.

---

## 🚀 Setup & Installation

Follow these steps to run the project locally on your machine:

### 1. Prerequisites
- **Node.js** (v18 or higher recommended)
- **NPM** or **Yarn**
- A **Gemini API Key** (Get one for free from [Google AI Studio](https://aistudio.google.com/))

### 2. Clone the Repository
```bash
git clone https://github.com/your-username/ai-meme-generator.git
cd ai-meme-generator
