# Music Player

A YouTube Music-style web music player with a dark theme, streaming from YouTube Music via a Node.js backend. Built with React, Vite, and Express.

## Architecture

```mermaid
graph TD
    subgraph Frontend ["Frontend (React + Vite)"]
        A[Browser - localhost:5173]
        A --> B[Home Page]
        A --> C[Search Page]
        A --> D[Now Playing]
        A --> E[Liked Songs]
        A --> F[Playlists]
        A --> G[PlayerBar]
    end

    subgraph Backend ["Backend (Express - port 3001)"]
        H["/api/trending"]
        I["/api/search"]
        J["/api/suggestions"]
        K["/api/stream/:videoId"]
        L["/api/stream-premium/:videoId"]
        M["/api/playlist/:playlistId"]
    end

    subgraph External ["External Services"]
        N["ytmusic-api"]
        O["Piped API (5 instances)"]
        P["yt-dlp (fallback)"]
    end

    G -- fetch stream URL --> K
    B -- fetch trending --> H
    C -- search query --> I
    C -- autocomplete --> J

    H --> N
    I --> N
    J --> N
    K --> O
    K -. fallback .-> P
    L --> P
    M --> O
```

## Prerequisites

- [Node.js](https://nodejs.org/) v18 or higher
- [npm](https://www.npmjs.com/) (comes with Node.js)
- [yt-dlp](https://github.com/yt-dlp/yt-dlp) (important used as stream fallback)

## Setup

### 1. Clone the repository

```bash
git clone https://github.com/rahullxsharmaa/Music-Player.git
cd Music-Player
```

### 2. Install frontend dependencies

```bash
npm install
```

### 3. Install backend dependencies

```bash
cd server
npm install
cd ..
```

### 4. Start the backend server

Open a terminal and run:

```bash
cd server
node index.js
```

You should see:

```
Music Player API running on http://localhost:3001
[OK] ytmusic-api initialized
```

### 5. Start the frontend dev server

Open a second terminal and run:

```bash
npm run dev
```

### 6. Open the app

Go to `http://localhost:5173` in your browser.

## Project Structure

```
Music-Player/
├── index.html
├── package.json
├── vite.config.js
├── src/
│   ├── main.jsx              # Entry point
│   ├── App.jsx               # Layout + routing
│   ├── index.css              # Design system (dark theme)
│   ├── context/
│   │   └── UserContext.jsx    # Playback state, queue, library
│   ├── components/
│   │   ├── Nav.jsx            # Sidebar + mobile bottom nav
│   │   ├── PlayerBar.jsx      # Persistent bottom player
│   │   ├── Card.jsx           # Song card (carousel items)
│   │   ├── SongRow.jsx        # Song list row
│   │   └── Queue.jsx          # Queue sidebar
│   └── pages/
│       ├── Home.jsx           # Trending, quick picks, charts
│       ├── Search.jsx         # Search with suggestions
│       ├── NowPlaying.jsx     # Full-screen player
│       ├── Like.jsx           # Liked songs
│       └── Playlist.jsx       # Playlist management
└── server/
    ├── package.json
    └── index.js               # API server (Express)
```

## Stream Flow

```mermaid
sequenceDiagram
    participant User
    participant Frontend
    participant Backend
    participant Piped as Piped API (x5)
    participant YtDlp as yt-dlp

    User->>Frontend: Click song
    Frontend->>Backend: GET /api/stream/:videoId
    Backend->>Piped: Try instance 1
    alt Instance 1 responds
        Piped-->>Backend: Audio stream URL
    else Instance 1 fails (502)
        Backend->>Piped: Try instance 2, 3, 4, 5
    end
    alt All Piped instances fail
        Backend->>YtDlp: Extract audio URL
        YtDlp-->>Backend: Direct audio URL
    end
    Backend-->>Frontend: { audioUrl }
    Frontend->>User: Play audio
```

## Optional: Premium Audio

For higher quality audio, you can provide YouTube cookies:

1. Install a browser extension that exports cookies in Netscape format (such as "Get cookies.txt LOCALLY")
2. Export your YouTube cookies
3. Save the file as `server/cookies.txt`
4. Restart the backend

The backend will automatically use cookies when available for `yt-dlp` requests.

## Troubleshooting

**Backend exits silently**: Make sure you are in the `server/` directory and run `node index.js`. Check that port 3001 is not in use by another process.

**Songs not playing**: The Piped API instances may be temporarily down. The backend will automatically try all 5 instances and fall back to yt-dlp. Make sure yt-dlp is installed if you want the fallback to work.

**No trending content**: The ytmusic-api needs a moment to initialize. Wait for the `[OK] ytmusic-api initialized` message before loading the frontend.

**CORS errors**: The backend allows all origins by default. If you changed the frontend port, it should still work.
