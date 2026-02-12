# Music Player

A YouTube Music-style web music player with streaming powered by yt-dlp and metadata from ytmusic-api.

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
        L["/api/playlist/:playlistId"]
    end

    subgraph External ["External"]
        N["ytmusic-api"]
        P["yt-dlp"]
    end

    G -- fetch stream URL --> K
    B -- fetch trending --> H
    C -- search query --> I
    C -- autocomplete --> J

    H --> N
    I --> N
    J --> N
    K --> P
    L --> N
```

## Stream Flow

```mermaid
sequenceDiagram
    participant User
    participant Frontend
    participant Backend
    participant YtDlp as yt-dlp

    User->>Frontend: Click song
    Frontend->>Backend: GET /api/stream/:videoId
    Backend->>YtDlp: Extract audio URL + metadata
    YtDlp-->>Backend: Audio URL, title, artist, thumbnail, duration
    Backend-->>Frontend: { audioUrl, title, artist, ... }
    Frontend->>User: Play audio
```

## Setup

```bash
# Clone
git clone https://github.com/rahullxsharmaa/Music-Player.git
cd Music-Player

# Install dependencies
npm install
cd server && npm install && cd ..

# Start backend (terminal 1)
cd server
node index.js

# Start frontend (terminal 2)
npm run dev
```

Open `http://localhost:5173` in your browser.

## Troubleshooting

- **Backend exits silently** - Make sure you are in the `server/` directory. Check port 3001 is free.
- **Songs not playing** - Ensure yt-dlp is installed and accessible in your PATH.
- **No trending content** - Wait for the `[OK] ytmusic-api initialized` message before loading the frontend.

## Developed by *johnwick's himself*