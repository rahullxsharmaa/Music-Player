import React, { useMemo } from 'react'
import { usePlayer } from '../context/UserContext'
import { useNavigate } from 'react-router-dom'
import { FaPlay, FaPause } from "react-icons/fa"
import { IoPlaySkipBack, IoPlaySkipForward, IoChevronDown, IoMusicalNotes } from "react-icons/io5"
import { IoShuffle } from "react-icons/io5"
import { TbRepeat, TbRepeatOnce, TbRepeatOff } from "react-icons/tb"
import { GoHeart, GoHeartFill } from "react-icons/go"
import SongRow from '../components/SongRow'

function NowPlaying() {
    const {
        currentSong, isPlaying, isLoading,
        currentTime, duration,
        shuffle, repeat,
        togglePlay, handleNext, handlePrev,
        seek, toggleShuffle, toggleRepeat,
        isLiked, toggleLike, queue, queueIndex
    } = usePlayer()

    const navigate = useNavigate()

    function formatTime(secs) {
        if (!secs || isNaN(secs)) return '0:00'
        const m = Math.floor(secs / 60)
        const s = Math.floor(secs % 60)
        return `${m}:${s.toString().padStart(2, '0')}`
    }

    const progressPercent = useMemo(() => {
        return duration > 0 ? (currentTime / duration) * 100 : 0
    }, [currentTime, duration])

    const RepeatIcon = repeat === 'one' ? TbRepeatOnce : repeat === 'all' ? TbRepeat : TbRepeatOff
    const upNext = queue.slice(queueIndex + 1, queueIndex + 6)

    if (!currentSong) {
        return (
            <div className="fade-in" style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                height: '80vh',
                color: 'var(--text-muted)',
                gap: '12px'
            }}>
                <IoMusicalNotes size={64} color="var(--text-muted)" />
                <p style={{ fontSize: '18px' }}>No song playing</p>
                <p style={{ fontSize: '13px' }}>Search for a song to get started</p>
            </div>
        )
    }

    return (
        <div className="fade-in" style={{
            display: 'flex',
            flexDirection: 'row',
            height: '100%',
            overflow: 'hidden'
        }}>
            {/* Main Player */}
            <div style={{
                flex: 1,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '40px 32px',
                position: 'relative',
                overflow: 'hidden'
            }}>
                {/* Blurred background */}
                <div style={{
                    position: 'absolute',
                    inset: 0,
                    backgroundImage: `url(${currentSong.thumbnail})`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    filter: 'blur(80px) brightness(0.3)',
                    transform: 'scale(1.2)',
                    zIndex: 0
                }} />

                {/* Content */}
                <div style={{ position: 'relative', zIndex: 1, width: '100%', maxWidth: '400px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '32px' }}>
                    {/* Back button */}
                    <button
                        onClick={() => navigate(-1)}
                        style={{
                            alignSelf: 'flex-start',
                            color: 'var(--text-secondary)',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '4px',
                            fontSize: '14px',
                            marginBottom: '-12px'
                        }}
                    >
                        <IoChevronDown size={22} />
                    </button>

                    {/* Album Art */}
                    <div style={{
                        width: '100%',
                        maxWidth: '320px',
                        aspectRatio: '1',
                        borderRadius: 'var(--radius-lg)',
                        overflow: 'hidden',
                        boxShadow: '0 16px 64px rgba(0,0,0,0.5)'
                    }}>
                        <img
                            src={currentSong.thumbnail}
                            alt={currentSong.title}
                            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                        />
                    </div>

                    {/* Song Info */}
                    <div style={{ textAlign: 'center', width: '100%' }}>
                        <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '12px'
                        }}>
                            <div style={{ flex: 1, minWidth: 0 }}>
                                <h1 className="text-ellipsis-1" style={{
                                    fontSize: '22px',
                                    fontWeight: '700',
                                    marginBottom: '4px'
                                }}>
                                    {currentSong.title}
                                </h1>
                                <p style={{ fontSize: '15px', color: 'var(--text-secondary)' }}>
                                    {currentSong.artist}
                                </p>
                            </div>
                            <button
                                onClick={() => toggleLike(currentSong)}
                                style={{
                                    color: isLiked(currentSong.videoId) ? 'var(--accent)' : 'var(--text-secondary)',
                                    display: 'flex',
                                    padding: '8px',
                                    transition: 'color var(--transition)'
                                }}
                            >
                                {isLiked(currentSong.videoId) ? <GoHeartFill size={22} /> : <GoHeart size={22} />}
                            </button>
                        </div>
                    </div>

                    {/* Progress */}
                    <div style={{ width: '100%' }}>
                        <input
                            type="range"
                            min="0"
                            max={duration || 0}
                            value={currentTime}
                            onChange={(e) => seek(Number(e.target.value))}
                            style={{
                                width: '100%',
                                accentColor: 'var(--accent)',
                                marginBottom: '4px'
                            }}
                        />
                        <div style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            fontSize: '12px',
                            color: 'var(--text-muted)'
                        }}>
                            <span>{formatTime(currentTime)}</span>
                            <span>{formatTime(duration)}</span>
                        </div>
                    </div>

                    {/* Controls */}
                    <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '28px'
                    }}>
                        <button
                            onClick={toggleShuffle}
                            style={{
                                color: shuffle ? 'var(--accent)' : 'var(--text-secondary)',
                                display: 'flex'
                            }}
                        >
                            <IoShuffle size={22} />
                        </button>

                        <button onClick={handlePrev} style={{ color: 'var(--text-primary)', display: 'flex' }}>
                            <IoPlaySkipBack size={28} />
                        </button>

                        <button
                            onClick={togglePlay}
                            style={{
                                width: '56px',
                                height: '56px',
                                borderRadius: '50%',
                                background: 'var(--text-primary)',
                                color: 'var(--bg-primary)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                transition: 'transform 0.1s',
                                transform: isLoading ? 'scale(0.95)' : 'scale(1)'
                            }}
                        >
                            {isPlaying ? <FaPause size={20} /> : <FaPlay size={20} style={{ marginLeft: '3px' }} />}
                        </button>

                        <button onClick={handleNext} style={{ color: 'var(--text-primary)', display: 'flex' }}>
                            <IoPlaySkipForward size={28} />
                        </button>

                        <button
                            onClick={toggleRepeat}
                            style={{
                                color: repeat !== 'off' ? 'var(--accent)' : 'var(--text-secondary)',
                                display: 'flex'
                            }}
                        >
                            <RepeatIcon size={22} />
                        </button>
                    </div>
                </div>
            </div>

            {/* Up Next sidebar (desktop only) */}
            <div className="desktop-only" style={{
                width: '350px',
                borderLeft: '1px solid var(--border)',
                overflowY: 'auto',
                padding: '24px 16px',
                flexShrink: 0
            }}>
                <h3 style={{
                    fontSize: '14px',
                    fontWeight: '600',
                    color: 'var(--text-muted)',
                    marginBottom: '16px',
                    textTransform: 'uppercase',
                    letterSpacing: '1px'
                }}>
                    Up Next
                </h3>
                {upNext.length > 0 ? (
                    upNext.map((song, i) => (
                        <SongRow key={song.videoId + i} song={song} index={queueIndex + 1 + i} />
                    ))
                ) : (
                    <p style={{ color: 'var(--text-muted)', fontSize: '13px', textAlign: 'center', padding: '20px' }}>
                        No more songs in queue
                    </p>
                )}
            </div>

            <style>{`
        @media (max-width: 768px) {
          .desktop-only { display: none !important; }
        }
      `}</style>
        </div>
    )
}

export default NowPlaying
