# 2gether - AI-Powered Onboarding Platform

An intelligent onboarding platform that helps companies create and manage interactive employee onboarding experiences. Built with React, TypeScript, and powered by Google's Gemini AI.

## Features

- **Admin Dashboard** - Create and manage onboarding courses with multiple step types
- **Interactive Steps** - Support for videos, downloads, actions, images, SOPs, and AI-generated content
- **Client View** - Beautiful, user-friendly interface for completing onboarding steps
- **Analytics** - Track completion rates and user progress
- **AI Integration** - Powered by Google Gemini for intelligent content generation
- **Customizable Theming** - Dark/light mode with customizable colors
- **Persistent Settings** - Local storage for settings and progress

## Tech Stack

- React 19
- TypeScript
- Vite
- Tailwind CSS
- Google Gemini AI
- Lucide React Icons

## Prerequisites

- Node.js (v18 or higher)
- Gemini API Key ([Get it here](https://aistudio.google.com/app/apikey))

## Getting Started

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Environment Variables

Create a `.env.local` file in the root directory:

```bash
GEMINI_API_KEY=your_gemini_api_key_here
```

Or copy from the example file:

```bash
cp .env.example .env.local
```

Then edit `.env.local` and add your Gemini API key.

### 3. Run Development Server

```bash
npm run dev
```

The app will be available at `http://localhost:3000`

### 4. Build for Production

```bash
npm run build
```

## Deployment

### Deploy to Vercel

1. Push your code to GitHub
2. Import your repository in [Vercel](https://vercel.com)
3. Add `GEMINI_API_KEY` to Environment Variables in Vercel project settings
4. Deploy

The `vercel.json` configuration is already included.

## Project Structure

```
2gether/
├── components/          # React components
│   ├── AdminDashboard.tsx
│   ├── ClientView.tsx
│   ├── CourseList.tsx
│   ├── SettingsView.tsx
│   ├── AnalyticsView.tsx
│   ├── AiChatWidget.tsx
│   └── ReviewModal.tsx
├── services/           # API services
│   └── geminiService.ts
├── src/
│   └── index.css      # Tailwind CSS styles
├── App.tsx            # Main application component
├── types.ts           # TypeScript type definitions
└── index.tsx          # Application entry point
```

## Step Types

The platform supports various step types for onboarding:

- **Video** - Embedded YouTube videos
- **Download** - Downloadable files (PDFs, documents)
- **Action** - Action items with confirmation
- **Image** - AI-generated or uploaded images
- **SOP** - Standard Operating Procedures

## License

MIT
