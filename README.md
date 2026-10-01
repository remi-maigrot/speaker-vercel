# Speaker · AI Voice Studio (front-end prototype)

Front-end prototype of **Speaker**, an AI voice product: users record or upload audio, edit it on a waveform with emotion sections, and publish voices to a marketplace.
This repository contains the UI prototype only: there is no backend, data is stored in the browser (IndexedDB), and AI voice generation is simulated.

> The Speaker product site is live at [speaker-ai.vercel.app](https://speaker-ai.vercel.app). It runs a later iteration of the project, not this exact codebase.

## Features

- **Landing page** with product presentation and pricing tiers (`src/pages/landing.tsx`)
- **Authentication flow** (register / login) with a persisted session store (`src/hooks/use-auth.ts`)
- **Audio recording** in the browser with the MediaRecorder API (`src/components/audio-recorder.tsx`)
- **Voice creator**: record, upload or "generate" a voice (generation is mocked) (`src/components/voice-creator.tsx`)
- **Waveform editor** with sections, emotion timeline and effects, powered by wavesurfer.js (`src/components/voice-editor.tsx`, `emotion-timeline.tsx`)
- **Marketplace**: publish a voice with a price and description, browse published voices (`src/components/marketplace-studio.tsx`, `marketplace.tsx`)
- **Dashboard** with usage charts (Chart.js) and a settings page
- Light / dark theme

Routes: `/` · `/login` · `/register` · `/dashboard` · `/marketplace`

## Tech stack

- React 18 · TypeScript · Vite 5
- React Router 6 · TanStack Query · Zustand
- Tailwind CSS · shadcn/ui (Radix UI) · lucide-react · sonner
- wavesurfer.js · Chart.js (react-chartjs-2)
- IndexedDB via `idb` for local persistence

## Getting started

The app lives in the `speaker-vercel-app/` folder.

```bash
cd speaker-vercel-app
npm install
npm run dev       # start the Vite dev server
npm run build     # type-check and build for production
npm run preview   # preview the production build
```

No environment variables are required.
