import React, { useMemo } from 'react'
import { usePlayer } from '../context/UserContext'
import { useNavigate } from 'react-router-dom'
import { FaPlay, FaPause } from "react-icons/fa"
import { IoPlaySkipBack, IoPlaySkipForward } from "react-icons/io5"
import { IoMdVolumeHigh, IoMdVolumeOff, IoMdVolumeLow } from "react-icons/io"
import { TbRepeat, TbRepeatOnce, TbRepeatOff } from "react-icons/tb"
import { IoShuffle } from "react-icons/io5"
import { RiPlayListFill } from "react-icons/ri"

function PlayerBar({ onQueueToggle, showQueue }) {
    const {
        currentSong, isPlaying, isLoading, error,
        currentTime, duration,
        volume, isMuted,
        shuffle, repeat,
        togglePlay, handleNext, handlePrev,
        seek, setVolume, toggleMute,
        toggleShuffle, toggleRepeat
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

    if (!currentSong) {
        return (
            <div style={{
                height: 'var(--player-height)',
                background: '#181818',
                borderTop: '1px solid var(--border)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--text-muted)',
                fontSize: '14px',
                flexShrink: 0
            }}>
                Search for a song to start playing
            </div>
        )
    }

    const VolumeIcon = isMuted || volume === 0
        ? IoMdVolumeOff
        : volume < 0.5
            ? IoMdVolumeLow
            : IoMdVolumeHigh

    const RepeatIcon = repeat === 'one' ? TbRepeatOnce : repeat === 'all' ? TbRepeat : TbRepeatOff

    return (
        <div style={{
            height: 'var(--player-height)',
            background: '#181818',
            borderTop: '1px solid var(--border)',
            display: 'flex',
            alignItems: 'center',
            padding: '0 16px',
            gap: '16px',
            flexShrink: 0,
            position: 'relative'
        }}>
            {/* Error toast */}
            {error && (
                <div style={{
                    position: 'absolute',
                    top: '-40px',
                    left: '50%',
                    transform: 'translateX(-50%)',
                    background: '#cc0000',
                    color: 'white',
                    padding: '8px 20px',
                    borderRadius: 'var(--radius-full)',
                    fontSize: '13px',
                    fontWeight: '500',
                    zIndex: 50,
                    whiteSpace: 'nowrap',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.5)'
                }}>
                    {error}
                </div>
            )}

            {/* Progress bar (top of player) */}
            <div style={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                height: '3px',
                background: 'var(--bg-surface-active)'
            }}>
                <div style={{
                    height: '100%',
                    width: `${progressPercent}%`,
                    background: 'var(--accent)',
                    transition: 'width 0.1s linear'
                }} />
            </div>

            {/* Left: Song info */}
            <div
                onClick={() => navigate('/now-playing')}
                style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    minWidth: 0,
                    flex: '1 1 30%',
                    cursor: 'pointer'
                }}
            >
                <img
                    src={currentSong.thumbnail}
                    alt={currentSong.title}
                    style={{
                        width: '48px',
                        height: '48px',
                        borderRadius: 'var(--radius-sm)',
                        objectFit: 'cover',
                        flexShrink: 0
                    }}
                />
                <div style={{ minWidth: 0 }}>
                    <div className="text-ellipsis-1" style={{
                        fontSize: '14px',
                        fontWeight: '500',
                        color: 'var(--text-primary)'
                    }}>
                        {currentSong.title}
                    </div>
                    <div className="text-ellipsis-1" style={{
                        fontSize: '12px',
                        color: 'var(--text-secondary)'
                    }}>
                        {currentSong.artist}
                    </div>
                </div>
            </div>

            {/* Center: Controls */}
            <div style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '4px',
                flex: '0 1 auto'
            }}>
                <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '16px'
                }}>
                    <button
                        onClick={toggleShuffle}
                        style={{
                            color: shuffle ? 'var(--accent)' : 'var(--text-secondary)',
                            transition: 'color var(--transition)',
                            display: 'flex',
                            alignItems: 'center'
                        }}
                        className="desktop-only"
                        title="Shuffle"
                    >
                        <IoShuffle size={18} />
                    </button>

                    <button
                        onClick={handlePrev}
                        style={{ color: 'var(--text-primary)', display: 'flex', alignItems: 'center' }}
                        title="Previous"
                    >
                        <IoPlaySkipBack size={20} />
                    </button>

                    <button
                        onClick={togglePlay}
                        style={{
                            width: '36px',
                            height: '36px',
                            borderRadius: '50%',
                            background: 'var(--text-primary)',
                            color: 'var(--bg-primary)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            transition: 'transform var(--transition)',
                            transform: isLoading ? 'scale(0.9)' : 'scale(1)',
                            opacity: isLoading ? 0.6 : 1
                        }}
                        title={isPlaying ? "Pause" : "Play"}
                    >
                        {isPlaying ? <FaPause size={14} /> : <FaPlay size={14} style={{ marginLeft: '2px' }} />}
                    </button>

                    <button
                        onClick={handleNext}
                        style={{ color: 'var(--text-primary)', display: 'flex', alignItems: 'center' }}
                        title="Next"
                    >
                        <IoPlaySkipForward size={20} />
                    </button>

                    <button
                        onClick={toggleRepeat}
                        style={{
                            color: repeat !== 'off' ? 'var(--accent)' : 'var(--text-secondary)',
                            transition: 'color var(--transition)',
                            display: 'flex',
                            alignItems: 'center'
                        }}
                        className="desktop-only"
                        title={`Repeat: ${repeat}`}
                    >
                        <RepeatIcon size={18} />
                    </button>
                </div>

                {/* Desktop: time + seekbar */}
                <div className="desktop-only" style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    width: '100%',
                    maxWidth: '400px'
                }}>
                    <span style={{ fontSize: '11px', color: 'var(--text-muted)', minWidth: '35px', textAlign: 'right' }}>
                        {formatTime(currentTime)}
                    </span>
                    <input
                        type="range"
                        min="0"
                        max={duration || 0}
                        value={currentTime}
                        onChange={(e) => seek(Number(e.target.value))}
                        style={{
                            flex: 1,
                            height: '4px',
                            accentColor: 'var(--accent)'
                        }}
                    />
                    <span style={{ fontSize: '11px', color: 'var(--text-muted)', minWidth: '35px' }}>
                        {formatTime(duration)}
                    </span>
                </div>
            </div>

            {/* Right: Volume + Queue */}
            <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                flex: '1 1 30%',
                justifyContent: 'flex-end'
            }} className="desktop-only">
                <button
                    onClick={onQueueToggle}
                    style={{
                        color: showQueue ? 'var(--accent)' : 'var(--text-secondary)',
                        display: 'flex',
                        alignItems: 'center',
                        transition: 'color var(--transition)'
                    }}
                    title="Queue"
                >
                    <RiPlayListFill size={18} />
                </button>

                <button
                    onClick={toggleMute}
                    style={{ color: 'var(--text-secondary)', display: 'flex', alignItems: 'center' }}
                >
                    <VolumeIcon size={18} />
                </button>

                <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.01"
                    value={isMuted ? 0 : volume}
                    onChange={(e) => setVolume(Number(e.target.value))}
                    style={{ width: '80px', accentColor: 'var(--accent)' }}
                />
            </div>

            <style>{`
        @media (max-width: 768px) {
          .desktop-only { display: none !important; }
        }
      `}</style>
        </div>
    )
}

export default PlayerBar
