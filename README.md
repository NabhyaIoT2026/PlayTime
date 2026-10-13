# Playtime — YouTube Playlist Length Calculator & Study Planner

> **"Your Playlist. Your Time."**  
> Calculate the total length of any YouTube playlist, discover how much time you save at 1.25×, 1.5×, 1.75×, 2×, and custom playback speeds, and build a personalized daily study schedule.

---

## 🌟 Overview & Key Features

Playtime is a full-stack, production-quality web application built with **React 18**, **Tailwind CSS**, **Fastify**, and the **YouTube Data API v3**. Designed with a modern, high-contrast dark theme inspired by Linear and Vercel SaaS dashboards.

- **⏱️ Precise Playlist Duration Calculations:**
  - Converts YouTube ISO 8601 durations (`PT1H2M10S`) into integer seconds to eliminate fractional rounding drift.
  - Displays total duration in clock format (`HH:MM:SS`), and detailed breakdown (`days, hours, minutes, seconds`).
  - Computes average video duration across all accessible videos.
- **⚡ Instant Playback Speed Optimizer:**
  - Preset speeds: `0.5×`, `0.75×`, `1.0×`, `1.25×`, `1.5×`, `1.75×`, `2.0×`, `2.25×`, `2.5×`, `3.0×`.
  - Custom speed slider & numeric input (`0.25×` to `4.0×`).
  - Displays adjusted watch time, exact time saved, and percentage saved for every speed multiplier.
  - Updates all dependent sections immediately on speed change with zero server re-fetching.
- **📊 Time-Saving Comparison Chart:**
  - Interactive Recharts bar chart highlighting the compression curve across standard speeds.
  - Automatically highlights the active speed and reveals saved hours on hover.
- **📅 "Plan Your Watch Time" Study Planner:**
  - Configure daily available study/viewing time (30 minutes to 12 hours) via interactive slider and quick chips.
  - Computes total days needed to finish the playlist.
  - Estimates daily videos target and completion calendar date.
  - Optional target deadline date analyzer with feasibility indicator (*"Ahead of schedule"*, *"Pace adjustment needed"*, or *"Unrealistic deadline"*).
  - Clear mathematical estimate disclaimers.
- **🗂️ Interactive Video Library:**
  - Switchable between responsive **Card View** and **Table View**.
  - Search by video title or channel.
  - Filter by duration: *All*, *Short (< 10 min)*, *Medium (10–30 min)*, *Long (> 30 min)*, and *Unavailable*.
  - Sort by playlist position, duration, or alphabetical title.
  - Real-time adjusted duration per video at the active playback speed.
  - Identifies and flags private, deleted, or region-restricted videos without fabricating data.
- **🛡️ Resilient Offline & Demo Capabilities:**
  - **Sample Demo Mode:** One-click exploration of a curated 18-episode Full-Stack Development Course with sample data banner.
  - **Manual Duration Calculator:** Enter custom playlist metrics directly (Hours/Minutes or Video Count × Average Duration) without needing a URL or YouTube API key.
  - **Graceful Error Handling:** Informs users when API keys are unconfigured, quotas are reached, or playlists are private, offering instant fallback paths.
- **📤 Export & Sharing:**
  - Copy formatted summary to clipboard with a single click.
  - Native Web Share API integration with clipboard fallback.
  - Export complete video list with durations and links to **CSV**.
- **🎨 UI / UX Aesthetics:**
  - Dark mode default (`#0a0c10`) with rich YouTube red (`#ff0033`) glowing accents.
  - Seamless Light / Dark theme toggle persisted in `localStorage`.
  - Glassmorphic cards, Lucide icons, accessible focus states, and loading skeletons.

---

## 🏗️ Architecture & Technology Stack

```
playlist_length/
├── client/                     # Frontend Application (React + Vite)
│   ├── src/
│   │   ├── components/         # Reusable UI components
│   │   │   ├── Navbar.jsx
│   │   │   ├── HeroSection.jsx
│   │   │   ├── ResultsSummary.jsx
│   │   │   ├── PlaybackSpeedSelector.jsx
│   │   │   ├── SpeedComparisonChart.jsx
│   │   │   ├── StudyPlanner.jsx
│   │   │   ├── VideoList.jsx
│   │   │   ├── ManualCalculatorModal.jsx
│   │   │   ├── HowItWorksSection.jsx
│   │   │   ├── FAQSection.jsx
│   │   │   ├── Footer.jsx
│   │   │   ├── LoadingSkeleton.jsx
│   │   │   └── ErrorMessage.jsx
│   │   ├── services/
│   │   │   └── api.js          # API service with offline fallback
│   │   ├── utils/
│   │   │   ├── calculations.js # Core duration & study planner math
│   │   │   ├── sampleData.js   # Offline sample demo playlist
│   │   │   └── urlParser.js    # YouTube URL & playlist ID parser
│   │   ├── App.jsx             # Main application layout & state
│   │   ├── index.css           # Tailwind base + custom design tokens
│   │   └── main.jsx
│   ├── index.html              # SEO meta tags, Google Fonts & favicon
│   ├── tailwind.config.js
│   ├── vite.config.js
│   └── package.json
│
├── server/                     # Backend API (Node.js + Fastify)
│   ├── src/
│   │   ├── routes/
│   │   │   └── playlist.js     # /api/status, /api/sample, /api/playlist
│   │   ├── services/
│   │   │   └── youtube.js      # YouTube Data API v3 paginated client
│   │   ├── utils/
│   │   │   ├── durationParser.js # ISO 8601 duration parser
│   │   │   ├── formatters.js     # Duration & speed metrics
│   │   │   ├── sampleData.js     # Sample playlist dataset
│   │   │   └── urlParser.js      # Server playlist ID extraction
│   │   └── server.js           # Fastify server entry point
│   ├── .env.example
│   └── package.json
│
├── tests/                      # Automated Test Suite (Vitest)
│   └── utils.test.js           # 22 unit tests for parsing & math
│
├── .env.example                # Root environment sample
├── package.json                # Monorepo root scripts
└── README.md
```

---

## 🚀 Getting Started

### Prerequisites
- **Node.js**: v18.0.0 or higher (v20+ recommended)
- **npm**: v9.0.0 or higher

### 1. Installation
Clone or navigate to the project directory and install all dependencies:

```bash
# Install root, server, and client dependencies
npm run install:all
```

Or manually:
```bash
npm install
npm --prefix server install
npm --prefix client install
```

---

## 🔑 YouTube API Key Configuration

To calculate **live YouTube playlists** directly from YouTube's servers:

1. Go to the [Google Cloud Console](https://console.cloud.google.com/).
2. Create a new project or select an existing one.
3. Enable the **YouTube Data API v3** under **APIs & Services > Library**.
4. Go to **APIs & Services > Credentials** and click **Create Credentials > API Key**.
5. Copy your API key.
6. In `server/`, create a `.env` file (or copy from `.env.example`):

```bash
# In server/.env
YOUTUBE_API_KEY=AIzaSyYourActualYouTubeApiKeyHere
PORT=5000
HOST=0.0.0.0
```

> **Note:** If no API key is configured, Playtime will automatically notify you via the status badge in the navbar and offer **Demo Mode** and the **Manual Duration Calculator**. The app will never crash or fake real API responses.

---

## 💻 Running the Application

### Option A: Run Both Frontend & Backend Concurrently
From the root directory:
```bash
npm run dev
```
- Frontend starts at: `http://localhost:5173/`
- Backend API starts at: `http://localhost:5000/`
- Vite proxies `/api` requests to `http://localhost:5000/` automatically.

### Option B: Run Individually
**Start Backend:**
```bash
cd server
npm run dev
```

**Start Frontend:**
```bash
cd client
npm run dev
```

---

## 🧪 Running Automated Unit Tests

Playtime includes unit tests verifying URL parsing across various YouTube formats, ISO 8601 durations, edge cases (zero durations, >24 hour playlists), custom speed multipliers, and study planner logic.

Run tests using Vitest:
```bash
npm test
```

### Test Coverage Highlights
- ✅ Standard YouTube URLs (`youtube.com/playlist?list=...`)
- ✅ Video URLs with playlist params (`youtube.com/watch?v=...&list=...`)
- ✅ Short URLs (`youtu.be/...`) and Music URLs (`music.youtube.com/...`)
- ✅ URLs with extraneous tracking/timestamp parameters (`&index=`, `&t=`, `&si=`)
- ✅ Raw playlist IDs (`PL...`, `UU...`, `RD...`)
- ✅ Rejection of invalid links and malformed IDs
- ✅ ISO 8601 duration parser (`PT15M33S`, `PT1H2M10S`, `PT45S`, `P1DT2H`, `PT0S`)
- ✅ Duration formatters for clock format and multi-day long playlists
- ✅ Speed calculations (`0.75×`, `1.0×`, `1.5×`, `2.0×`, `2.5×`)
- ✅ Zero-duration and division-by-zero safety

---

## 🚢 Production Build & Deployment

### Frontend (e.g. Vercel / Netlify / Cloudflare Pages)
To create an optimized production bundle:
```bash
npm run build:client
```
The output will be in `client/dist/`.
If deploying frontend and backend to separate domains, set `VITE_API_URL` in the frontend environment (e.g. `VITE_API_URL=https://api.yourdomain.com`).

### Backend (e.g. Render / Railway / Fly.io / VPS)
In the backend directory:
```bash
cd server
npm start
```
Make sure `YOUTUBE_API_KEY` and `PORT` are set in the production environment variables.

---

## 📄 License
MIT License. Created for the Playtime YouTube Playlist Length Calculator project.
