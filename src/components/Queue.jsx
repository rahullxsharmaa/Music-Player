import React from 'react'
import { usePlayer } from '../context/UserContext'
import { IoClose } from "react-icons/io5"
import { FaPlay, FaPause } from "react-icons/fa"
import { handleImageErrorHighRes } from '../utils/imageUtils'

function Queue({ onClose }) {
    const { queue, queueIndex, playFromQueue, removeFromQueue, currentSong, isPlaying, togglePlay } = usePlayer()

    const upNext = queue.slice(queueIndex + 1)

    return (
        <div style={{
            width: '360px',
            height: '100%',
            background: 'rgba(15, 15, 15, 0.9)',
            backdropFilter: 'blur(24px)',
            WebkitBackdropFilter: 'blur(24px)',
            borderLeft: '1px solid var(--border)',
            display: 'flex',
            flexDirection: 'column',
            flexShrink: 0,
            overflow: 'hidden'
        }}>
            {/* Header */}
            <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '18px 20px',
                borderBottom: '1px solid var(--border)'
            }}>
                <h2 style={{ fontSize: '16px', fontWeight: '700', letterSpacing: '-0.02em' }}>Queue</h2>
                <button
                    onClick={onClose}
                    style={{
                        color: 'var(--text-secondary)',
                        display: 'flex',
                        padding: '4px',
                        borderRadius: 'var(--radius-sm)',
                        transition: 'all var(--transition)'
                    }}
                    className="hover-card"
                >
                    <IoClose size={20} />
                </button>
            </div>

            {/* Now Playing */}
            {currentSong && (
                <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border)' }}>
                    <div style={{
                        fontSize: '11px',
                        fontWeight: '600',
                        color: 'var(--accent)',
                        marginBottom: '10px',
                        textTransform: 'uppercase',
                        letterSpacing: '1.5px'
                    }}>
                        Now Playing
                    </div>
                    <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '12px',
                        padding: '10px',
                        borderRadius: 'var(--radius-md)',
                        background: 'var(--accent-gradient-subtle)',
                        border: '1px solid rgba(229, 57, 53, 0.1)'
                    }}>
                        <img
                            src={currentSong.thumbnail}
                            alt={currentSong.title}
                            onError={(e) => handleImageErrorHighRes(e, currentSong.thumbnail)}
                            style={{
                                width: '48px',
                                height: '48px',
                                borderRadius: 'var(--radius-sm)',
                                objectFit: 'cover',
                                boxShadow: '0 0 12px var(--accent-glow)'
                            }}
                        />
                        <div style={{ flex: 1, minWidth: 0 }}>
                            <div className="text-ellipsis-1" style={{
                                fontSize: '14px',
                                fontWeight: '500',
                                color: 'var(--accent)'
                            }}>
                                {currentSong.title}
                            </div>
                            <div className="text-ellipsis-1" style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '2px' }}>
                                {typeof currentSong.artist === 'object' ? currentSong.artist.name : currentSong.artist}
                            </div>
                        </div>
                        <button onClick={togglePlay} style={{
                            color: 'var(--accent)',
                            display: 'flex',
                            padding: '8px',
                            borderRadius: '50%',
                            background: 'rgba(229, 57, 53, 0.15)',
                            transition: 'all var(--transition)'
                        }}>
                            {isPlaying ? <FaPause size={12} /> : <FaPlay size={12} />}
                        </button>
                    </div>
                </div>
            )}

            {/* Up Next */}
            <div style={{ flex: 1, overflowY: 'auto', padding: '14px 20px' }}>
                <div style={{
                    fontSize: '11px',
                    fontWeight: '600',
                    color: 'var(--text-muted)',
                    marginBottom: '12px',
                    textTransform: 'uppercase',
                    letterSpacing: '1.5px'
                }}>
                    Up Next ({upNext.length})
                </div>

                {upNext.length === 0 ? (
                    <div style={{
                        color: 'var(--text-muted)',
                        fontSize: '13px',
                        padding: '24px 0',
                        textAlign: 'center',
                        opacity: 0.5
                    }}>
                        No songs in queue
                    </div>
                ) : (
                    upNext.map((song, i) => (
                        <div
                            key={`${song.videoId}-${i}`}
                            onClick={() => playFromQueue(queueIndex + 1 + i)}
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '10px',
                                padding: '8px',
                                borderRadius: 'var(--radius-md)',
                                cursor: 'pointer',
                                marginBottom: '2px',
                                transition: 'all var(--transition)'
                            }}
                            className="hover-card"
                        >
                            <span style={{
                                fontSize: '12px',
                                color: 'var(--text-muted)',
                                width: '20px',
                                textAlign: 'center',
                                flexShrink: 0,
                                fontVariantNumeric: 'tabular-nums'
                            }}>
                                {i + 1}
                            </span>
                            <img
                                src={song.thumbnail}
                                alt={song.title}
                                onError={(e) => handleImageErrorHighRes(e, song.thumbnail)}
                                style={{
                                    width: '40px',
                                    height: '40px',
                                    borderRadius: 'var(--radius-sm)',
                                    objectFit: 'cover',
                                    flexShrink: 0
                                }}
                            />
                            <div style={{ flex: 1, minWidth: 0 }}>
                                <div className="text-ellipsis-1" style={{
                                    fontSize: '13px',
                                    color: 'var(--text-primary)',
                                    fontWeight: '400'
                                }}>
                                    {song.title}
                                </div>
                                <div className="text-ellipsis-1" style={{
                                    fontSize: '11px',
                                    color: 'var(--text-secondary)',
                                    marginTop: '1px'
                                }}>
                                    {typeof song.artist === 'object' ? song.artist.name : song.artist}
                                </div>
                            </div>
                            <button
                                onClick={(e) => { e.stopPropagation(); removeFromQueue(queueIndex + 1 + i) }}
                                style={{
                                    color: 'var(--text-muted)',
                                    display: 'flex',
                                    padding: '4px',
                                    flexShrink: 0,
                                    borderRadius: 'var(--radius-sm)',
                                    transition: 'all var(--transition)'
                                }}
                            >
                                <IoClose size={16} />
                            </button>
                        </div>
                    ))
                )}
            </div>
        </div>
    )
}

export default Queue
