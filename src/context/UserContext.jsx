import React, { createContext, useContext, useEffect, useState, useRef, useCallback } from 'react'

export const PlayerContext = createContext()

const API_BASE = 'http://localhost:3001/api'

export function usePlayer() {
    return useContext(PlayerContext)
}

function PlayerProvider({ children }) {
    const audioRef = useRef(new Audio())

    // ── Playback State ──
    const [currentSong, setCurrentSong] = useState(null)
    const [isPlaying, setIsPlaying] = useState(false)
    const [currentTime, setCurrentTime] = useState(0)
    const [duration, setDuration] = useState(0)
    const [volume, setVolume] = useState(0.7)
    const [isMuted, setIsMuted] = useState(false)
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState(null)

    // ── Queue ──
    const [queue, setQueue] = useState([])
    const [queueIndex, setQueueIndex] = useState(-1)
    const [showQueue, setShowQueue] = useState(false)

    // ── Modes ──
    const [shuffle, setShuffle] = useState(false)
    const [repeat, setRepeat] = useState('off') // off, one, all

    // ── Library ──
    const [likedSongs, setLikedSongs] = useState(() => {
        try {
            return JSON.parse(localStorage.getItem('likedSongs') || '[]')
        } catch { return [] }
    })

    const [playlists, setPlaylists] = useState(() => {
        try {
            return JSON.parse(localStorage.getItem('playlists') || '[]')
        } catch { return [] }
    })

    // ── Persist liked songs ──
    useEffect(() => {
        localStorage.setItem('likedSongs', JSON.stringify(likedSongs))
    }, [likedSongs])

    useEffect(() => {
        localStorage.setItem('playlists', JSON.stringify(playlists))
    }, [playlists])

    // ── Audio Event Listeners ──
    useEffect(() => {
        const audio = audioRef.current

        const onTimeUpdate = () => setCurrentTime(audio.currentTime)
        const onDurationChange = () => setDuration(audio.duration || 0)
        const onEnded = () => handleNext()
        const onPlay = () => setIsPlaying(true)
        const onPause = () => setIsPlaying(false)
        const onWaiting = () => setIsLoading(true)
        const onCanPlay = () => setIsLoading(false)

        audio.addEventListener('timeupdate', onTimeUpdate)
        audio.addEventListener('durationchange', onDurationChange)
        audio.addEventListener('ended', onEnded)
        audio.addEventListener('play', onPlay)
        audio.addEventListener('pause', onPause)
        audio.addEventListener('waiting', onWaiting)
        audio.addEventListener('canplay', onCanPlay)

        return () => {
            audio.removeEventListener('timeupdate', onTimeUpdate)
            audio.removeEventListener('durationchange', onDurationChange)
            audio.removeEventListener('ended', onEnded)
            audio.removeEventListener('play', onPlay)
            audio.removeEventListener('pause', onPause)
            audio.removeEventListener('waiting', onWaiting)
            audio.removeEventListener('canplay', onCanPlay)
        }
    }, [queue, queueIndex, shuffle, repeat])

    // ── Volume ──
    useEffect(() => {
        audioRef.current.volume = isMuted ? 0 : volume
    }, [volume, isMuted])

    // ── Media Session API ──
    useEffect(() => {
        if (!currentSong || !('mediaSession' in navigator)) return

        navigator.mediaSession.metadata = new MediaMetadata({
            title: currentSong.title,
            artist: currentSong.artist,
            artwork: currentSong.thumbnail ? [{ src: currentSong.thumbnail }] : []
        })

        navigator.mediaSession.setActionHandler('play', play)
        navigator.mediaSession.setActionHandler('pause', pause)
        navigator.mediaSession.setActionHandler('previoustrack', handlePrev)
        navigator.mediaSession.setActionHandler('nexttrack', handleNext)
    }, [currentSong])

    // ── Play a song by fetching its stream URL ──
    const playSong = useCallback(async (song) => {
        if (!song || !song.videoId) return

        setIsLoading(true)
        setError(null)
        setCurrentSong(song)

        try {
            const res = await fetch(`${API_BASE}/stream/${song.videoId}`)
            const data = await res.json()

            if (!data.audioUrl) {
                throw new Error('No audio URL returned')
            }

            audioRef.current.src = data.audioUrl
            audioRef.current.load()

            try {
                await audioRef.current.play()
            } catch (playErr) {
                console.warn('Autoplay blocked, waiting for user interaction')
            }

            // Update song with full metadata from stream
            setCurrentSong(prev => ({
                ...prev,
                thumbnail: prev.thumbnail || data.thumbnail,
                artist: prev.artist || data.artist,
                duration: data.duration || prev.duration
            }))

            // Auto-queue related songs if nothing left in queue
            if (data.relatedStreams && data.relatedStreams.length > 0) {
                setQueue(prev => {
                    const currentIdx = prev.findIndex(s => s.videoId === song.videoId)
                    const remaining = currentIdx >= 0 ? prev.length - currentIdx - 1 : 0
                    if (remaining <= 0) {
                        const existingIds = new Set(prev.map(s => s.videoId))
                        const newSongs = data.relatedStreams.filter(s => !existingIds.has(s.videoId))
                        return newSongs.length > 0 ? [...prev, ...newSongs] : prev
                    }
                    return prev
                })
            }
        } catch (err) {
            console.error('Failed to play:', err)
            setError(`Failed to stream. Trying next...`)
            setTimeout(() => setError(null), 4000)
        } finally {
            setIsLoading(false)
        }
    }, [])

    // ── Play from queue ──
    const playFromQueue = useCallback((index) => {
        if (index >= 0 && index < queue.length) {
            setQueueIndex(index)
            playSong(queue[index])
        }
    }, [queue, playSong])

    // ── Add to queue and optionally play ──
    const addToQueue = useCallback((songs, playNow = false) => {
        const songsArray = Array.isArray(songs) ? songs : [songs]
        setQueue(prev => {
            const newQueue = [...prev, ...songsArray]
            if (playNow) {
                const newIndex = prev.length
                setQueueIndex(newIndex)
                playSong(songsArray[0])
            }
            return newQueue
        })
    }, [playSong])

    // ── Play a song immediately (clear queue and set it) ──
    const playNow = useCallback((song, additionalQueue = []) => {
        const newQueue = [song, ...additionalQueue]
        setQueue(newQueue)
        setQueueIndex(0)
        playSong(song)
    }, [playSong])

    // ── Controls ──
    const play = useCallback(() => { audioRef.current.play() }, [])
    const pause = useCallback(() => { audioRef.current.pause() }, [])

    const togglePlay = useCallback(() => {
        if (isPlaying) pause()
        else play()
    }, [isPlaying, play, pause])

    const handleNext = useCallback(() => {
        if (queue.length === 0) return

        if (repeat === 'one') {
            audioRef.current.currentTime = 0
            audioRef.current.play()
            return
        }

        let nextIndex
        if (shuffle) {
            nextIndex = Math.floor(Math.random() * queue.length)
        } else {
            nextIndex = queueIndex + 1
        }

        if (nextIndex >= queue.length) {
            if (repeat === 'all') {
                nextIndex = 0
            } else {
                setIsPlaying(false)
                return
            }
        }

        playFromQueue(nextIndex)
    }, [queue, queueIndex, shuffle, repeat, playFromQueue])

    const handlePrev = useCallback(() => {
        if (audioRef.current.currentTime > 3) {
            audioRef.current.currentTime = 0
            return
        }

        if (queue.length === 0) return

        let prevIndex = queueIndex - 1
        if (prevIndex < 0) {
            prevIndex = repeat === 'all' ? queue.length - 1 : 0
        }

        playFromQueue(prevIndex)
    }, [queue, queueIndex, repeat, playFromQueue])

    const seek = useCallback((time) => {
        audioRef.current.currentTime = time
    }, [])

    const toggleMute = useCallback(() => setIsMuted(prev => !prev), [])

    const toggleShuffle = useCallback(() => setShuffle(prev => !prev), [])

    const toggleRepeat = useCallback(() => {
        setRepeat(prev => {
            if (prev === 'off') return 'all'
            if (prev === 'all') return 'one'
            return 'off'
        })
    }, [])

    // ── Liked Songs ──
    const isLiked = useCallback((videoId) => {
        return likedSongs.some(s => s.videoId === videoId)
    }, [likedSongs])

    const toggleLike = useCallback((song) => {
        setLikedSongs(prev => {
            const exists = prev.some(s => s.videoId === song.videoId)
            if (exists) return prev.filter(s => s.videoId !== song.videoId)
            return [...prev, song]
        })
    }, [])

    // ── Playlists ──
    const createPlaylist = useCallback((name) => {
        const pl = { id: Date.now().toString(), name, songs: [] }
        setPlaylists(prev => [...prev, pl])
        return pl
    }, [])

    const addToPlaylist = useCallback((playlistId, song) => {
        setPlaylists(prev => prev.map(pl => {
            if (pl.id === playlistId) {
                if (pl.songs.some(s => s.videoId === song.videoId)) return pl
                return { ...pl, songs: [...pl.songs, song] }
            }
            return pl
        }))
    }, [])

    const removeFromPlaylist = useCallback((playlistId, videoId) => {
        setPlaylists(prev => prev.map(pl => {
            if (pl.id === playlistId) {
                return { ...pl, songs: pl.songs.filter(s => s.videoId !== videoId) }
            }
            return pl
        }))
    }, [])

    const deletePlaylist = useCallback((playlistId) => {
        setPlaylists(prev => prev.filter(pl => pl.id !== playlistId))
    }, [])

    const removeFromQueue = useCallback((index) => {
        setQueue(prev => prev.filter((_, i) => i !== index))
        if (index < queueIndex) {
            setQueueIndex(prev => prev - 1)
        }
    }, [queueIndex])

    const value = {
        // Audio
        audioRef, currentSong, isPlaying, isLoading, error,
        currentTime, duration, volume, isMuted,
        // Queue
        queue, queueIndex,
        // Modes
        shuffle, repeat,
        // Actions
        playSong, playNow, addToQueue, playFromQueue, removeFromQueue,
        play, pause, togglePlay, handleNext, handlePrev,
        seek, setVolume, toggleMute,
        toggleShuffle, toggleRepeat,
        // Library
        likedSongs, isLiked, toggleLike,
        playlists, createPlaylist, addToPlaylist,
        showQueue, setShowQueue,
        // API
        API_BASE
    }

    return (
        <PlayerContext.Provider value={value}>
            {children}
        </PlayerContext.Provider>
    )
}

export default PlayerProvider