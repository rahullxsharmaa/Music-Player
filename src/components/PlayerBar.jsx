import React, { useMemo, useState, useRef } from 'react'
import { usePlayer } from '../context/UserContext'
import { useNavigate } from 'react-router-dom'
import { FaPlay, FaPause } from "react-icons/fa"
import { IoPlaySkipBack, IoPlaySkipForward } from "react-icons/io5"
import { IoShuffle } from "react-icons/io5"
import { TbRepeat, TbRepeatOnce, TbRepeatOff } from "react-icons/tb"
import { GoHeart, GoHeartFill } from "react-icons/go"
import { RiPlayListAddFill } from "react-icons/ri"
import { HiOutlineQueueList } from "react-icons/hi2"
import { IoVolumeHigh, IoVolumeMute } from "react-icons/io5"

function PlayerBar({ onQueueToggle, showQueue }) {
    const {
        currentSong, isPlaying, isLoading,
        currentTime, duration,
        shuffle, repeat,
        volume, isMuted,
        togglePlay, handleNext, handlePrev,
        seek, toggleShuffle, toggleRepeat,
        setVolume, toggleMute,
        isLiked, toggleLike,
        playlists, addToPlaylist
    } = usePlayer()

    const navigate = useNavigate()
    const [showPlaylistMenu, setShowPlaylistMenu] = useState(false)
    const progressRef = useRef(null)

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

    const handleProgressClick = (e) => {
        if (!progressRef.current || !duration) return
        const rect = progressRef.current.getBoundingClientRect()
        const x = e.clientX - rect.left
        const percent = Math.max(0, Math.min(1, x / rect.width))
        seek(percent * duration)
    }

    // Empty state
    if (!currentSong) {
        return (
            <div style={{
                height: 'var(--player-height)',
                background: 'rgba(15, 15, 15, 0.85)',
                backdropFilter: 'blur(24px)',
                WebkitBackdropFilter: 'blur(24px)',
                borderTop: '1px solid var(--border)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--text-muted)',
                fontSize: '13px',
                flexShrink: 0
            }}>
                Pick a song to start listening
            </div>
        )
    }

    return (
        <div style={{ flexShrink: 0, position: 'relative' }}>
            {/* Seekable progress bar at the very top of the bar */}
            <div
                ref={progressRef}
                onClick={handleProgressClick}
                style={{
                    width: '100%',
                    height: '4px',
                    background: 'rgba(255,255,255,0.08)',
                    cursor: 'pointer',
                    position: 'relative',
                    zIndex: 10
                }}
            >
                <div style={{
                    height: '100%',
                    width: `${progressPercent}%`,
                    background: 'var(--accent-gradient)',
                    borderRadius: '0 2px 2px 0',
                    transition: 'width 0.1s linear',
                    position: 'relative'
                }}>
                    <div style={{
                        position: 'absolute',
                        right: '-6px',
                        top: '50%',
                        transform: 'translateY(-50%)',
                        width: '12px',
                        height: '12px',
                        borderRadius: '50%',
                        background: 'var(--accent)',
                        boxShadow: '0 0 10px var(--accent-glow)',
                        border: '2px solid white',
                        opacity: 0,
                        transition: 'opacity var(--transition)'
                    }}
                        className="progress-dot"
                    />
                </div>
                {/* Invisible range input for drag support */}
                <input
                    type="range"
                    min="0"
                    max={duration || 0}
                    value={currentTime}
                    onChange={(e) => seek(Number(e.target.value))}
                    style={{
                        position: 'absolute',
                        inset: 0,
                        width: '100%',
                        height: '100%',
                        opacity: 0,
                        cursor: 'pointer',
                        margin: 0
                    }}
                />
            </div>

            {/* Main PlayerBar */}
            <div style={{
                height: 'var(--player-height)',
                background: 'rgba(15, 15, 15, 0.9)',
                backdropFilter: 'blur(30px)',
                WebkitBackdropFilter: 'blur(30px)',
                borderTop: '1px solid var(--border)',
                display: 'flex',
                alignItems: 'center',
                padding: '0 20px',
                gap: '16px'
            }}>
                {/* Left: Song info */}
                <div
                    onClick={() => navigate('/now-playing')}
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '14px',
                        flex: '1 1 240px',
                        minWidth: 0,
                        cursor: 'pointer'
                    }}
                >
                    <img
                        src={currentSong.thumbnail}
                        alt={currentSong.title}
                        style={{
                            width: '52px',
                            height: '52px',
                            borderRadius: 'var(--radius-sm)',
                            objectFit: 'cover',
                            boxShadow: '0 4px 12px rgba(0,0,0,0.4)',
                            flexShrink: 0
                        }}
                    />
                    <div style={{ minWidth: 0 }}>
                        <p className="text-ellipsis-1" style={{
                            fontSize: '14px',
                            fontWeight: '600',
                            lineHeight: 1.3
                        }}>
                            {currentSong.title}
                        </p>
                        <p className="text-ellipsis-1" style={{
                            fontSize: '12px',
                            color: 'var(--text-secondary)',
                            lineHeight: 1.3
                        }}>
                            {currentSong.artist}
                        </p>
                    </div>
                </div>

                {/* Center: Controls */}
                <div style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    flex: '0 1 auto'
                }}>
                    <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '18px'
                    }}>
                        <button
                            onClick={toggleShuffle}
                            className="desktop-only"
                            style={{
                                color: shuffle ? 'var(--accent)' : 'var(--text-muted)',
                                display: 'flex',
                                padding: '4px',
                                transition: 'all var(--transition)'
                            }}
                        >
                            <IoShuffle size={18} />
                        </button>

                        <button
                            onClick={handlePrev}
                            style={{
                                color: 'var(--text-primary)',
                                display: 'flex',
                                transition: 'all var(--transition)',
                                padding: '4px'
                            }}
                        >
                            <IoPlaySkipBack size={20} />
                        </button>

                        <button
                            onClick={togglePlay}
                            style={{
                                width: '40px',
                                height: '40px',
                                borderRadius: '50%',
                                background: 'var(--accent-gradient)',
                                color: 'white',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                transition: 'transform var(--transition-spring), box-shadow var(--transition)',
                                transform: isLoading ? 'scale(0.9)' : 'scale(1)',
                                boxShadow: '0 4px 16px var(--accent-glow)'
                            }}
                        >
                            {isPlaying ? <FaPause size={14} /> : <FaPlay size={14} style={{ marginLeft: '2px' }} />}
                        </button>

                        <button
                            onClick={handleNext}
                            style={{
                                color: 'var(--text-primary)',
                                display: 'flex',
                                transition: 'all var(--transition)',
                                padding: '4px'
                            }}
                        >
                            <IoPlaySkipForward size={20} />
                        </button>

                        <button
                            onClick={toggleRepeat}
                            className="desktop-only"
                            style={{
                                color: repeat !== 'off' ? 'var(--accent)' : 'var(--text-muted)',
                                display: 'flex',
                                padding: '4px',
                                transition: 'all var(--transition)'
                            }}
                        >
                            <RepeatIcon size={18} />
                        </button>
                    </div>

                    {/* Time display */}
                    <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        fontSize: '11px',
                        color: 'var(--text-muted)',
                        fontVariantNumeric: 'tabular-nums',
                        marginTop: '2px'
                    }}>
                        <span>{formatTime(currentTime)}</span>
                        <span>/</span>
                        <span>{formatTime(duration)}</span>
                    </div>
                </div>

                {/* Right: Like, Playlist, Queue, Volume */}
                <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                    flex: '1 1 240px',
                    justifyContent: 'flex-end'
                }}>
                    {/* Like */}
                    <button
                        onClick={() => toggleLike(currentSong)}
                        style={{
                            color: isLiked(currentSong.videoId) ? 'var(--accent)' : 'var(--text-muted)',
                            display: 'flex',
                            padding: '8px',
                            transition: 'all var(--transition)',
                            borderRadius: '50%'
                        }}
                        title="Like"
                    >
                        {isLiked(currentSong.videoId) ? <GoHeartFill size={18} /> : <GoHeart size={18} />}
                    </button>

                    {/* Add to Playlist */}
                    <div style={{ position: 'relative' }}>
                        <button
                            onClick={() => setShowPlaylistMenu(!showPlaylistMenu)}
                            style={{
                                color: 'var(--text-muted)',
                                display: 'flex',
                                padding: '8px',
                                transition: 'all var(--transition)',
                                borderRadius: '50%'
                            }}
                            title="Add to playlist"
                        >
                            <RiPlayListAddFill size={18} />
                        </button>
                        {/* Playlist dropdown */}
                        {showPlaylistMenu && (
                            <div style={{
                                position: 'absolute',
                                right: 0,
                                bottom: '100%',
                                marginBottom: '8px',
                                background: 'rgba(28, 28, 28, 0.95)',
                                backdropFilter: 'blur(16px)',
                                WebkitBackdropFilter: 'blur(16px)',
                                border: '1px solid var(--border)',
                                borderRadius: 'var(--radius-md)',
                                minWidth: '200px',
                                zIndex: 100,
                                boxShadow: '0 -12px 40px rgba(0,0,0,0.5)',
                                overflow: 'hidden'
                            }}>
                                {playlists.length === 0 ? (
                                    <div style={{
                                        padding: '14px 16px',
                                        fontSize: '13px',
                                        color: 'var(--text-muted)',
                                        textAlign: 'center'
                                    }}>
                                        No playlists yet
                                    </div>
                                ) : (
                                    playlists.map(pl => (
                                        <button
                                            key={pl.id}
                                            onClick={() => {
                                                addToPlaylist(pl.id, currentSong)
                                                setShowPlaylistMenu(false)
                                            }}
                                            style={{
                                                width: '100%',
                                                padding: '11px 16px',
                                                textAlign: 'left',
                                                fontSize: '14px',
                                                color: 'var(--text-primary)',
                                                transition: 'background var(--transition)',
                                                display: 'block'
                                            }}
                                            className="hover-card"
                                        >
                                            {pl.name}
                                        </button>
                                    ))
                                )}
                            </div>
                        )}
                    </div>

                    {/* Queue */}
                    <button
                        onClick={onQueueToggle}
                        style={{
                            color: showQueue ? 'var(--accent)' : 'var(--text-muted)',
                            display: 'flex',
                            padding: '8px',
                            transition: 'color var(--transition)',
                            borderRadius: 'var(--radius-sm)',
                            background: showQueue ? 'rgba(229, 57, 53, 0.1)' : 'transparent'
                        }}
                        title="Queue"
                    >
                        <HiOutlineQueueList size={18} />
                    </button>

                    {/* Volume (desktop) */}
                    <div className="desktop-only" style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                        marginLeft: '4px'
                    }}>
                        <button
                            onClick={toggleMute}
                            style={{
                                color: 'var(--text-muted)',
                                display: 'flex',
                                padding: '4px',
                                transition: 'color var(--transition)'
                            }}
                        >
                            {isMuted || volume === 0 ? <IoVolumeMute size={18} /> : <IoVolumeHigh size={18} />}
                        </button>
                        <input
                            type="range"
                            min="0"
                            max="1"
                            step="0.01"
                            value={isMuted ? 0 : volume}
                            onChange={(e) => setVolume(Number(e.target.value))}
                            style={{
                                width: '80px',
                                height: '3px',
                                accentColor: 'var(--accent)',
                                cursor: 'pointer'
                            }}
                        />
                    </div>
                </div>
            </div>

            <style>{`
        .progress-dot { opacity: 0 !important; }
        div:hover > .progress-dot,
        div:hover .progress-dot { opacity: 1 !important; }
        @media (max-width: 768px) {
          .desktop-only { display: none !important; }
        }
      `}</style>
        </div>
    )
}

export default PlayerBar
