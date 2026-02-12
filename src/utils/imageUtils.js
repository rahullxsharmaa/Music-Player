export const handleImageError = (e) => {
    e.target.src = 'https://www.gstatic.com/youtube/media/ytm/images/pbg/liked-music-@576.png';
    e.target.onerror = null;
};

export const handleImageErrorHighRes = (e) => {
    const src = e.target.src;

    if (src.includes('maxresdefault.jpg')) {
        // Fallback 1: High Quality (480x360)
        e.target.src = src.replace('maxresdefault.jpg', 'hqdefault.jpg');
    } else if (src.includes('hqdefault.jpg')) {
        // Fallback 2: Medium Quality (320x180) - almost always exists
        e.target.src = src.replace('hqdefault.jpg', 'mqdefault.jpg');
    } else if (src.includes('mqdefault.jpg')) {
        // Fallback 3: Placeholder
        e.target.src = 'https://www.gstatic.com/youtube/media/ytm/images/pbg/liked-music-@576.png';
        e.target.onerror = null; // Stop trying
    } else {
        // Not a standard YT url, go straight to placeholder
        e.target.src = 'https://www.gstatic.com/youtube/media/ytm/images/pbg/liked-music-@576.png';
        e.target.onerror = null;
    }
};
