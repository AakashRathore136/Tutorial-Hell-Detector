# Tutorial Hell Detector

A lightweight, visually impressive Next.js application that evaluates developer habits to diagnose "Tutorial Hell" and provides an AI-generated recovery plan.

## Features
- **Brutal AI Diagnosis:** Uses Google's Gemini API to roast your habits and give practical advice.
- **Scoring System:** Calculates a Tutorial Hell Score and Builder Score based on your inputs.
- **Local Storage History:** Keeps track of your previous analyses without needing a database.
- **Dark Premium UI:** Built with Tailwind CSS, shadcn/ui, and Framer Motion.

## Tech Stack
- Next.js 14 App Router
- TypeScript
- Tailwind CSS v4
- shadcn/ui
- Framer Motion
- Gemini API (AI Analysis)

## Local Setup

1. **Clone the repository** (if applicable) or navigate to the directory:
   ```bash
   cd tutorial-hell-detector
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Set up environment variables:**
   Copy the `.env.example` file to `.env.local`:
   ```bash
   cp .env.example .env.local
   ```
   Add your Gemini API Key in `.env.local` (`GEMINI_API_KEY=your_key_here`). Get one from [Google AI Studio](https://aistudio.google.com/).

4. **Run the development server:**
   ```bash
   npm run dev
   ```
   Open [http://localhost:3000](http://localhost:3000) in your browser.

## Deployment
This project is Vercel-ready.
1. Push your code to GitHub.
2. Import the project in Vercel.
3. Add `GEMINI_API_KEY` to the Environment Variables in the Vercel dashboard.
4. Deploy
