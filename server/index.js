import express from 'express';
import cors from 'cors';
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


//  yt-dlp helper


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


//  Trending / Home


app.get('/api/trending', async (req, res) => {
    try {
        if (!ytmusicReady) {
            return res.json([]);
        }

        const results = [];
        const seen = new Set();

        const addSong = (item) => {
            if (!item || !item.videoId || seen.has(item.videoId)) return;
            seen.add(item.videoId);
            results.push({
                videoId: item.videoId,
                title: item.name || '',
                artist: item.artist?.name || 'Unknown',
                thumbnail: hiRes(item.thumbnails?.[item.thumbnails.length - 1]?.url || ''),
                duration: item.duration || 0
            });
        };

        // Strategy 1: Get YouTube Music home sections (with null-safety)
        try {
            const sections = await ytmusic.getHomeSections();
            if (Array.isArray(sections)) {
                for (const section of sections) {
                    if (!section || !Array.isArray(section.contents)) continue;
                    for (const item of section.contents) {
                        if (item && item.type === 'SONG') {
                            addSong(item);
                        }
                    }
                }
            }
        } catch (homeErr) {
            console.log('[TRENDING] getHomeSections failed:', homeErr.message);
        }

        // Strategy 2: Search for popular music to fill up
        if (results.length < 20) {
            const queries = [
                'top hits 2025',
                'latest bollywood songs',
                'trending hindi songs 2025',
                'top punjabi songs 2025',
                'new english songs 2025',
                'popular songs India'
            ];

            // Helper: Search using yt-dlp (fallback if API fails)
            async function searchWithYtDlp(query) {
                try {
                    const cmd = `yt-dlp --print "id: %(id)s | title: %(title)s | artist: %(uploader)s | duration: %(duration)s" --flat-playlist "ytsearch5:${query}"`;
                    const { stdout } = await execAsync(cmd);
                    return stdout.split('\n').filter(line => line.trim()).map(line => {
                        const parts = line.split(' | ');
                        const getVal = (key) => parts.find(p => p.startsWith(key))?.split(': ')[1] || '';
                        const id = getVal('id');
                        if (!id) return null;
                        return {
                            videoId: id,
                            name: getVal('title'),
                            artist: { name: getVal('artist') },
                            thumbnails: [{ url: `https://i.ytimg.com/vi/${id}/hqdefault.jpg` }],
                            duration: parseFloat(getVal('duration')) || 0
                        };
                    }).filter(Boolean);
                } catch (e) {
                    console.error(`[Search Fallback] yt-dlp failed for ${query}: ${e.message}`);
                    return [];
                }
            }

            const searchPromises = queries.map(async q => {
                try {
                    return await ytmusic.searchSongs(q);
                } catch (err) {
                    console.error(`[TRENDING] API failed for "${q}", trying yt-dlp...`);
                    return await searchWithYtDlp(q);
                }
            });

            const allResults = await Promise.all(searchPromises);
            for (const batch of allResults) {
                if (!Array.isArray(batch)) continue;
                for (const item of batch) {
                    addSong(item);
                }
            }
            console.log(`[TRENDING] Final results count: ${results.length}`);
        }

        // Strategy 3: Static fallback if everything failed
        if (results.length === 0) {
            console.log('[TRENDING] All strategies failed, using static fallback');
            results.push(
                { videoId: 'k4yXQkGDbLY', title: 'Channa Mereya', artist: 'Arijit Singh', thumbnail: 'https://i.ytimg.com/vi/k4yXQkGDbLY/maxresdefault.jpg', duration: 289 },
                { videoId: 'TUXf8wBf7II', title: 'Kesariya', artist: 'Arijit Singh', thumbnail: 'https://i.ytimg.com/vi/TUXf8wBf7II/maxresdefault.jpg', duration: 268 },
                { videoId: 'BddP6PYo2gs', title: 'Kesariya (Dance Mix)', artist: 'Arijit Singh', thumbnail: 'https://i.ytimg.com/vi/BddP6PYo2gs/maxresdefault.jpg', duration: 245 },
                { videoId: 'axTg5t3a6sg', title: 'Heeriye', artist: 'Arijit Singh', thumbnail: 'https://i.ytimg.com/vi/axTg5t3a6sg/maxresdefault.jpg', duration: 194 },
                { videoId: '8q-0W-2h1mE', title: 'Chaleya', artist: 'Arijit Singh', thumbnail: 'https://i.ytimg.com/vi/8q-0W-2h1mE/maxresdefault.jpg', duration: 200 }
            );
        }

        res.json(results.slice(0, 30));
    } catch (err) {
        console.error('Trending error:', err.message);
        res.status(500).json({ error: 'Failed to fetch trending' });
    }
});


//  Browse categories (for Search page)


app.get('/api/browse', async (req, res) => {
    try {
        if (!ytmusicReady) {
            return res.json([]);
        }

        // Curated browse categories like YT Music
        const categories = [
            { name: 'Bollywood Hits', query: 'bollywood hits 2025' },
            { name: 'Punjabi Beats', query: 'top punjabi songs 2025' },
            { name: 'English Pop', query: 'english pop hits 2025' },
            { name: 'Romantic Hits', query: 'romantic hindi songs' },
            { name: 'Party Mix', query: 'party songs hindi 2025' },
            { name: 'Chill Vibes', query: 'chill lofi indian songs' },
            { name: 'Old School', query: '90s bollywood songs' },
            { name: 'Workout Mix', query: 'workout songs hindi' }
        ];

        const browseResults = await Promise.all(
            categories.map(async (cat) => {
                try {
                    const songs = await ytmusic.searchSongs(cat.query);
                    return {
                        name: cat.name,
                        songs: (songs || [])
                            .filter(s => s && s.videoId)
                            .slice(0, 8)
                            .map(s => ({
                                videoId: s.videoId,
                                title: s.name || '',
                                artist: s.artist?.name || 'Unknown',
                                thumbnail: hiRes(s.thumbnails?.[s.thumbnails.length - 1]?.url || ''),
                                duration: s.duration || 0
                            }))
                    };
                } catch {
                    return { name: cat.name, songs: [] };
                }
            })
        );

        res.json(browseResults.filter(c => c.songs.length > 0));
    } catch (err) {
        console.error('Browse error:', err.message);
        res.json([]);
    }
});


//  Search (ytmusic-api — songs only)


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

        const formatted = (results || [])
            .filter(item => item && item.videoId)
            .map(item => ({
                videoId: item.videoId,
                title: item.name || '',
                artist: item.artist?.name || 'Unknown',
                thumbnail: hiRes(item.thumbnails?.[item.thumbnails.length - 1]?.url || ''),
                duration: item.duration || 0,
                album: item.album?.name || ''
            }));

        res.json(formatted);
    } catch (err) {
        console.error('Search error:', err.message);
        res.status(500).json({ error: 'Search failed' });
    }
});


//  Search Suggestions (ytmusic-api)


app.get('/api/suggestions', async (req, res) => {
    try {
        if (!ytmusicReady) return res.json([]);
        const query = req.query.q;
        if (!query) return res.json([]);

        const suggestions = await ytmusic.getSearchSuggestions(query);
        res.json(suggestions || []);
    } catch (err) {
        console.error('Suggestions error:', err.message);
        res.json([]);
    }
});


//  Stream URL (yt-dlp)


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

        // Fetch related songs in background (don't block response if it fails)
        let relatedStreams = [];
        if (ytmusicReady) {
            try {
                const searchQuery = `${artist} ${title}`.trim();
                const related = await ytmusic.searchSongs(searchQuery);
                relatedStreams = (related || [])
                    .filter(s => s && s.videoId && s.videoId !== videoId)
                    .slice(0, 15)
                    .map(s => ({
                        videoId: s.videoId,
                        title: s.name || '',
                        artist: s.artist?.name || 'Unknown',
                        thumbnail: hiRes(s.thumbnails?.[s.thumbnails.length - 1]?.url || ''),
                        duration: s.duration || 0
                    }));
            } catch (relErr) {
                console.log(`[STREAM] Related songs fetch failed: ${relErr.message}`);
            }
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


//  Playlist (ytmusic-api)


app.get('/api/playlist/:playlistId', async (req, res) => {
    try {
        if (!ytmusicReady) {
            return res.status(503).json({ error: 'ytmusic-api not ready yet' });
        }

        const { playlistId } = req.params;
        const data = await ytmusic.getPlaylist(playlistId);

        res.json({
            name: data.name || '',
            thumbnail: hiRes(data.thumbnails?.[data.thumbnails.length - 1]?.url || ''),
            uploader: '',
            videos: (data.tracks || [])
                .filter(v => v && v.videoId)
                .map(v => ({
                    videoId: v.videoId || '',
                    title: v.name || '',
                    artist: v.artist?.name || '',
                    thumbnail: hiRes(v.thumbnails?.[v.thumbnails.length - 1]?.url || ''),
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
