import express from 'express';
import cors from 'cors';
import axios from 'axios';
import { exec } from 'child_process';
import { promisify } from 'util';
import YTMusic from 'ytmusic-api';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const execAsync = promisify(exec);
const __dirname = path.dirname(fileURLToPath(import.meta.url));

const app = express();
const PORT = 3001;

// --- CORS (allow any origin) ---
app.use(cors());
app.use(express.json());

// --- Multiple Piped API instances for fallback ---
const PIPED_INSTANCES = [
    'https://pipedapi.kavin.rocks',
    'https://pipedapi.adminforge.de',
    'https://pipedapi.r4fo.com',
    'https://pipedapi.in.projectsegfau.lt',
    'https://api.piped.yt'
];

async function pipedRequest(endpoint, timeout = 8000) {
    for (const instance of PIPED_INSTANCES) {
        try {
            const { data } = await axios.get(`${instance}${endpoint}`, { timeout });
            return data;
        } catch (err) {
            console.log(`[PIPED] ${instance} failed: ${err.message}`);
        }
    }
    throw new Error('All Piped instances failed');
}

// --- ytmusic-api instance ---
const ytmusic = new YTMusic();
let ytmusicReady = false;

(async () => {
    try {
        await ytmusic.initialize();
        ytmusicReady = true;
        console.log('[OK] ytmusic-api initialized');
    } catch (err) {
        console.error('[FAIL] ytmusic-api init failed:', err.message);
    }
})();

// ──────────────────────────────────────────────
//  Trending / Home (ytmusic-api getHomeSections + searchSongs)
// ──────────────────────────────────────────────

app.get('/api/trending', async (req, res) => {
    try {
        if (!ytmusicReady) {
            return res.json([]);
        }

        const results = [];
        const seen = new Set();

        // Strategy 1: Get YouTube Music home sections (curated)
        try {
            const sections = await ytmusic.getHomeSections();
            for (const section of sections) {
                for (const item of section.contents || []) {
                    if (item.type === 'SONG' && item.videoId && !seen.has(item.videoId)) {
                        seen.add(item.videoId);
                        results.push({
                            videoId: item.videoId,
                            title: item.name || '',
                            artist: item.artist?.name || 'Unknown',
                            thumbnail: item.thumbnails?.[item.thumbnails.length - 1]?.url || '',
                            duration: item.duration || 0
                        });
                    }
                }
            }
        } catch (homeErr) {
            console.log('[TRENDING] getHomeSections failed:', homeErr.message);
        }

        // Strategy 2: Fill up with searchSongs if not enough
        if (results.length < 15) {
            const queries = [
                'trending songs 2025',
                'new hindi songs 2025',
                'top bollywood songs',
                'latest punjabi songs',
                'popular english songs'
            ];

            const searchPromises = queries.map(q =>
                ytmusic.searchSongs(q).catch(() => [])
            );

            const allResults = await Promise.all(searchPromises);
            for (const batch of allResults) {
                for (const item of batch) {
                    if (item.videoId && !seen.has(item.videoId)) {
                        seen.add(item.videoId);
                        results.push({
                            videoId: item.videoId,
                            title: item.name || '',
                            artist: item.artist?.name || 'Unknown',
                            thumbnail: item.thumbnails?.[item.thumbnails.length - 1]?.url || '',
                            duration: item.duration || 0
                        });
                    }
                }
            }
        }

        res.json(results.slice(0, 30));
    } catch (err) {
        console.error('Trending error:', err.message);
        res.status(500).json({ error: 'Failed to fetch trending' });
    }
});

// ──────────────────────────────────────────────
//  Search (ytmusic-api — songs only)
// ──────────────────────────────────────────────

app.get('/api/search', async (req, res) => {
    try {
        if (!ytmusicReady) {
            return res.status(503).json({ error: 'ytmusic-api not ready yet' });
        }

        const query = req.query.q;
        if (!query) {
            return res.status(400).json({ error: 'Missing query parameter q' });
        }

        const results = await ytmusic.searchSongs(query);

        const formatted = results
            .filter(item => item.videoId)
            .map(item => ({
                videoId: item.videoId,
                title: item.name || '',
                artist: item.artist?.name || 'Unknown',
                thumbnail: item.thumbnails?.[item.thumbnails.length - 1]?.url || '',
                duration: item.duration || 0,
                album: item.album?.name || ''
            }));

        res.json(formatted);
    } catch (err) {
        console.error('Search error:', err.message);
        res.status(500).json({ error: 'Search failed' });
    }
});

// ──────────────────────────────────────────────
//  Search Suggestions (ytmusic-api)
// ──────────────────────────────────────────────

app.get('/api/suggestions', async (req, res) => {
    try {
        if (!ytmusicReady) return res.json([]);
        const query = req.query.q;
        if (!query) return res.json([]);

        const suggestions = await ytmusic.getSearchSuggestions(query);
        res.json(suggestions);
    } catch (err) {
        console.error('Suggestions error:', err.message);
        res.json([]);
    }
});

// ──────────────────────────────────────────────
//  Stream URL (Piped multi-instance -> yt-dlp fallback)
// ──────────────────────────────────────────────

app.get('/api/stream/:videoId', async (req, res) => {
    const { videoId } = req.params;

    // --- Try Piped API first (multiple instances) ---
    try {
        const data = await pipedRequest(`/streams/${videoId}`);

        const audioStreams = (data.audioStreams || [])
            .filter(s => s.mimeType?.startsWith('audio/'))
            .sort((a, b) => (b.bitrate || 0) - (a.bitrate || 0));

        if (audioStreams.length > 0) {
            const bestAudio = audioStreams[0];
            return res.json({
                audioUrl: bestAudio.url,
                mimeType: bestAudio.mimeType,
                bitrate: bestAudio.bitrate,
                quality: bestAudio.quality,
                title: data.title || '',
                artist: data.uploader || '',
                thumbnail: data.thumbnailUrl || '',
                duration: data.duration || 0,
                relatedStreams: (data.relatedStreams || []).slice(0, 10).map(r => ({
                    videoId: r.url?.replace('/watch?v=', '') || '',
                    title: r.title || '',
                    artist: r.uploaderName || '',
                    thumbnail: r.thumbnail || '',
                    duration: r.duration || 0
                }))
            });
        }
    } catch (err) {
        console.log(`[STREAM] Piped failed for ${videoId}: ${err.message}`);
    }

    // --- Fallback: yt-dlp ---
    try {
        console.log(`[STREAM] Trying yt-dlp for ${videoId}...`);
        const cookiePath = path.join(__dirname, 'cookies.txt');
        let cmd = `yt-dlp -g -f "ba[acodec^=opus]/ba/b" --no-playlist "https://www.youtube.com/watch?v=${videoId}"`;

        if (fs.existsSync(cookiePath)) {
            cmd = `yt-dlp -g -f "ba[acodec^=opus]/ba/b" --cookies "${cookiePath}" --no-playlist "https://www.youtube.com/watch?v=${videoId}"`;
        }

        const { stdout } = await execAsync(cmd, { timeout: 20000 });
        const audioUrl = stdout.trim().split('\n')[0];

        if (audioUrl) {
            console.log(`[STREAM] yt-dlp success for ${videoId}`);
            return res.json({
                audioUrl,
                title: '',
                artist: '',
                thumbnail: '',
                duration: 0,
                relatedStreams: []
            });
        }
    } catch (err) {
        console.error(`[STREAM] yt-dlp also failed for ${videoId}:`, err.message);
    }

    res.status(500).json({ error: 'Could not get audio stream from any source' });
});

// ──────────────────────────────────────────────
//  Stream via yt-dlp directly
// ──────────────────────────────────────────────

app.get('/api/stream-premium/:videoId', async (req, res) => {
    try {
        const { videoId } = req.params;
        const cookiePath = path.join(__dirname, 'cookies.txt');

        let cmd = `yt-dlp -g -f "ba[acodec^=opus]/ba/b" --no-playlist "https://www.youtube.com/watch?v=${videoId}"`;
        if (fs.existsSync(cookiePath)) {
            cmd = `yt-dlp -g -f "ba[acodec^=opus]/ba/b" --cookies "${cookiePath}" --no-playlist "https://www.youtube.com/watch?v=${videoId}"`;
        }

        const { stdout } = await execAsync(cmd, { timeout: 20000 });
        const audioUrl = stdout.trim().split('\n')[0];

        if (!audioUrl) {
            return res.status(404).json({ error: 'No audio URL extracted' });
        }

        res.json({ audioUrl });
    } catch (err) {
        console.error('yt-dlp error:', err.message);
        res.status(500).json({ error: 'yt-dlp extraction failed' });
    }
});

// ──────────────────────────────────────────────
//  Playlist (Piped with fallback)
// ──────────────────────────────────────────────

app.get('/api/playlist/:playlistId', async (req, res) => {
    try {
        const { playlistId } = req.params;
        const data = await pipedRequest(`/playlists/${playlistId}`);

        res.json({
            name: data.name || '',
            thumbnail: data.thumbnailUrl || '',
            uploader: data.uploader || '',
            videos: (data.relatedStreams || []).map(v => ({
                videoId: v.url?.replace('/watch?v=', '') || '',
                title: v.title || '',
                artist: v.uploaderName || '',
                thumbnail: v.thumbnail || '',
                duration: v.duration || 0
            }))
        });
    } catch (err) {
        console.error('Playlist error:', err.message);
        res.status(500).json({ error: 'Failed to fetch playlist' });
    }
});

// ──────────────────────────────────────────────
//  Start
// ──────────────────────────────────────────────

app.listen(PORT, () => {
    console.log(`Music Player API running on http://localhost:${PORT}`);
});
