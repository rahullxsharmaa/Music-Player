import express from 'express';
import cors from 'cors';
import { exec } from 'child_process';
import { promisify } from 'util';
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

// ──────────────────────────────────────────────
//  Helpers
// ──────────────────────────────────────────────

function getYtDlpCmd(videoId, extraArgs = '') {
    const cookiePath = path.join(__dirname, 'cookies.txt');
    const cookies = fs.existsSync(cookiePath) ? `--cookies "${cookiePath}"` : '';
    return `yt-dlp ${extraArgs} ${cookies} --no-playlist "https://www.youtube.com/watch?v=${videoId}"`;
}

// Upgrade thumbnail URL to high resolution
function hiRes(url) {
    if (!url) return '';
    // Google/YouTube Music thumbnails: replace size suffix for higher res
    if (url.includes('lh3.googleusercontent.com')) {
        return url.replace(/=w\d+-h\d+.*$/, '=w1200-h1200-l90-rj');
    }
    // YouTube standard thumbnails: upgrade to maxresdefault
    if (url.includes('i.ytimg.com') && !url.includes('maxresdefault')) {
        return url.replace(/(default|mqdefault|hqdefault|sddefault)\.jpg/, 'maxresdefault.jpg');
    }
    return url;
}

// Robust search using yt-dlp
async function searchWithYtDlp(query, limit = 10) {
    try {
        // Fetch more results than needed to allow for filtering
        const fetchLimit = limit * 2;
        const cmd = `yt-dlp --print "id: %(id)s | title: %(title)s | artist: %(uploader)s | duration: %(duration)s" --flat-playlist "ytsearch${fetchLimit}:${query}"`;
        const { stdout } = await execAsync(cmd);

        const parsed = stdout.split('\n').filter(line => line.trim()).map(line => {
            const parts = line.split(' | ');
            const getVal = (key) => parts.find(p => p.startsWith(key))?.split(': ')[1] || '';
            const id = getVal('id');
            if (!id) return null;

            const duration = parseFloat(getVal('duration')) || 0;

            // Filter out Shorts (< 60s) and Long Mixes (> 15 mins)
            // This mimics "Song" search
            if (duration < 60 || duration > 900) return null;

            return {
                videoId: id,
                name: getVal('title'),
                artist: { name: getVal('artist') },
                thumbnails: [{ url: `https://i.ytimg.com/vi/${id}/hqdefault.jpg` }],
                duration: duration
            };
        }).filter(Boolean);

        // Return only requested amount
        return parsed.slice(0, limit);
    } catch (e) {
        console.error(`[Desired Search] yt-dlp failed for ${query}: ${e.message}`);
        return [];
    }
}

// ──────────────────────────────────────────────
//  Trending / Home
// ──────────────────────────────────────────────

app.get('/api/trending', async (req, res) => {
    try {
        console.log('[TRENDING] Fetching Global Top Songs via yt-dlp...');

        const results = [];
        const seen = new Set();
        const addSongs = (songs) => {
            for (const s of songs) {
                if (!seen.has(s.videoId)) {
                    seen.add(s.videoId);
                    results.push({
                        videoId: s.videoId,
                        title: s.name,
                        artist: s.artist.name,
                        thumbnail: hiRes(s.thumbnails[0].url),
                        duration: s.duration
                    });
                }
            }
        };

        // Fetch "Global Top Songs 2025" and some specialized charts
        const p1 = searchWithYtDlp('global top songs 2025', 10);
        const p2 = searchWithYtDlp('top hits 2025', 10);
        const p3 = searchWithYtDlp('trending music video', 5);

        const [r1, r2, r3] = await Promise.all([p1, p2, p3]);

        addSongs(r1);
        addSongs(r2);
        addSongs(r3);

        if (results.length === 0) {
            console.log('[TRENDING] Fallback to static list');
            results.push(
                { videoId: 'k4yXQkGDbLY', title: 'Channa Mereya', artist: 'Arijit Singh', thumbnail: 'https://i.ytimg.com/vi/k4yXQkGDbLY/maxresdefault.jpg', duration: 289 },
                { videoId: 'TUXf8wBf7II', title: 'Kesariya', artist: 'Arijit Singh', thumbnail: 'https://i.ytimg.com/vi/TUXf8wBf7II/maxresdefault.jpg', duration: 268 }
            );
        }

        console.log(`[TRENDING] Serving ${results.length} songs`);
        res.json(results);
    } catch (err) {
        console.error('Trending error:', err.message);
        res.status(500).json({ error: 'Failed to fetch trending' });
    }
});


// ──────────────────────────────────────────────
//  Browse categories (Home Logic)
// ──────────────────────────────────────────────

app.get('/api/browse', async (req, res) => {
    try {
        const categories = [
            { name: 'Bollywood Hits', query: 'bollywood hits 2025' },
            { name: 'Punjabi Beats', query: 'top punjabi songs 2025' },
            { name: 'English Pop', query: 'english pop hits 2025' },
            { name: 'Romantic Hits', query: 'romantic hindi songs' },
            { name: 'Party Mix', query: 'party songs hindi 2025' },
            { name: 'Lo-Fi Vibes', query: 'lofi hindi songs' }
        ];

        const browseResults = await Promise.all(
            categories.map(async (cat) => {
                const songs = await searchWithYtDlp(cat.query, 6);
                return {
                    name: cat.name,
                    songs: songs.map(s => ({
                        videoId: s.videoId,
                        title: s.name,
                        artist: s.artist.name,
                        thumbnail: hiRes(s.thumbnails[0].url),
                        duration: s.duration
                    }))
                };
            })
        );

        res.json(browseResults.filter(c => c.songs.length > 0));
    } catch (err) {
        console.error('Browse error:', err.message);
        res.json([]);
    }
});


// ──────────────────────────────────────────────
//  Search (yt-dlp)
// ──────────────────────────────────────────────

app.get('/api/search', async (req, res) => {
    try {
        const query = req.query.q;
        if (!query) return res.json([]);

        console.log(`[SEARCH] Searching for: ${query}`);
        const rawResults = await searchWithYtDlp(query, 20);

        const formatted = rawResults.map(item => ({
            videoId: item.videoId,
            title: item.name,
            artist: item.artist.name,
            thumbnail: hiRes(item.thumbnails[0].url),
            duration: item.duration,
            album: ''
        }));

        res.json(formatted);
    } catch (err) {
        console.error('Search error:', err.message);
        res.status(500).json({ error: 'Search failed' });
    }
});


// ──────────────────────────────────────────────
//  Search Suggestions (Google Public API)
// ──────────────────────────────────────────────

app.get('/api/suggestions', async (req, res) => {
    try {
        const query = req.query.q;
        if (!query) return res.json([]);

        const url = `http://suggestqueries.google.com/complete/search?client=firefox&ds=yt&q=${encodeURIComponent(query)}`;
        const response = await fetch(url);
        const data = await response.json();

        // Google returns [query, [suggestions...]]
        const suggestions = data[1] || [];
        res.json(suggestions);
    } catch (err) {
        console.error('Suggestions error:', err.message);
        res.json([]);
    }
});


// ──────────────────────────────────────────────
//  Stream URL (yt-dlp)
// ──────────────────────────────────────────────

app.get('/api/stream/:videoId', async (req, res) => {
    const { videoId } = req.params;

    try {
        console.log(`[STREAM] yt-dlp extracting ${videoId}...`);

        // Get audio URL + metadata in one call
        const cmd = getYtDlpCmd(videoId, '-g -f "ba[acodec^=opus]/ba/b" --print title --print uploader --print thumbnail --print duration');
        const { stdout } = await execAsync(cmd, { timeout: 25000 });
        const lines = stdout.trim().split('\n');

        const title = lines[0] || '';
        const artist = lines[1] || '';
        const thumbnail = lines[2] || '';
        const durationRaw = parseFloat(lines[3]) || 0;
        const audioUrl = lines[4] || '';

        if (!audioUrl) {
            return res.status(500).json({ error: 'No audio URL extracted' });
        }

        // Fetch related songs using yt-dlp search (by artist + title)
        let relatedStreams = [];
        try {
            // Search for expanded context
            const searchQuery = `${artist} ${title} official video`;
            const related = await searchWithYtDlp(searchQuery, 15);
            relatedStreams = related
                .filter(s => s.videoId !== videoId)
                .map(s => ({
                    videoId: s.videoId,
                    title: s.name,
                    artist: s.artist.name,
                    thumbnail: hiRes(s.thumbnails[0].url),
                    duration: s.duration
                }));
        } catch (relErr) {
            console.log(`[STREAM] Related songs fetch failed: ${relErr.message}`);
        }

        console.log(`[STREAM] yt-dlp success for ${videoId} (${relatedStreams.length} related)`);
        res.json({
            audioUrl,
            title,
            artist,
            thumbnail: hiRes(thumbnail),
            duration: durationRaw,
            relatedStreams
        });
    } catch (err) {
        console.error(`[STREAM] yt-dlp failed for ${videoId}:`, err.message);
        res.status(500).json({ error: 'Could not get audio stream' });
    }
});


// ──────────────────────────────────────────────
//  Playlist (yt-dlp flat)
// ──────────────────────────────────────────────

app.get('/api/playlist/:playlistId', async (req, res) => {
    try {
        const { playlistId } = req.params;
        const cmd = `yt-dlp --dump-json --flat-playlist "https://www.youtube.com/playlist?list=${playlistId}"`;

        // Increase max buffer for large playgrounds
        const { stdout } = await execAsync(cmd, { maxBuffer: 1024 * 1024 * 10 });

        const videos = stdout.split('\n')
            .filter(line => line.trim())
            .map(line => {
                try { return JSON.parse(line); } catch { return null; }
            })
            .filter(v => v && v.id) // yt-dlp uses 'id' for flat playlist
            .map(v => ({
                videoId: v.id,
                title: v.title || '',
                artist: v.uploader || 'Unknown',
                thumbnail: `https://i.ytimg.com/vi/${v.id}/hqdefault.jpg`, // Construct standard thumb
                duration: v.duration || 0
            }));

        res.json({
            name: 'Playlist', // yt-dlp flat doesn't easily give playlist metadata in stream
            thumbnail: videos[0]?.thumbnail || '',
            uploader: '',
            videos: videos
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
    console.log(`Music Player API (Pure yt-dlp) running on http://localhost:${PORT}`);
});
