import React from 'react'
import { usePlayer } from '../context/UserContext'
import { IoClose } from "react-icons/io5"
import { FaPlay, FaPause } from "react-icons/fa"

function Queue({ onClose }) {
    const { queue, queueIndex, playFromQueue, removeFromQueue, currentSong, isPlaying, togglePlay } = usePlayer()

    const upNext = queue.slice(queueIndex + 1)

    return (
        <div style={{
            width: '350px',
            height: '100%',
            background: 'var(--bg-surface)',
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
                padding: '16px 20px',
                borderBottom: '1px solid var(--border)'
            }}>
                <h2 style={{ fontSize: '16px', fontWeight: '600' }}>Queue</h2>
                <button onClick={onClose} style={{ color: 'var(--text-secondary)', display: 'flex' }}>
                    <IoClose size={22} />
                </button>
            </div>

            {/* Now Playing */}
            {currentSong && (
                <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border)' }}>
                    <div style={{ fontSize: '12px', fontWeight: '600', color: 'var(--text-muted)', marginBottom: '10px', textTransform: 'uppercase', letterSpacing: '1px' }}>
                        Now Playing
                    </div>
                    <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '12px',
                        padding: '8px',
                        borderRadius: 'var(--radius-md)',
                        background: 'var(--bg-surface-hover)'
                    }}>
                        <img
                            src={currentSong.thumbnail}
                            alt={currentSong.title}
                            style={{ width: '44px', height: '44px', borderRadius: 'var(--radius-sm)', objectFit: 'cover' }}
                        />
                        <div style={{ flex: 1, minWidth: 0 }}>
                            <div className="text-ellipsis-1" style={{ fontSize: '14px', fontWeight: '500', color: 'var(--accent)' }}>
                                {currentSong.title}
                            </div>
                            <div className="text-ellipsis-1" style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
                                {currentSong.artist}
                            </div>
                        </div>
                        <button onClick={togglePlay} style={{ color: 'var(--text-primary)', display: 'flex' }}>
                            {isPlaying ? <FaPause size={14} /> : <FaPlay size={14} />}
                        </button>
                    </div>
                </div>
            )}

            {/* Up Next */}
            <div style={{ flex: 1, overflowY: 'auto', padding: '12px 20px' }}>
                <div style={{ fontSize: '12px', fontWeight: '600', color: 'var(--text-muted)', marginBottom: '10px', textTransform: 'uppercase', letterSpacing: '1px' }}>
                    Up Next ({upNext.length})
                </div>

                {upNext.length === 0 ? (
                    <div style={{ color: 'var(--text-muted)', fontSize: '13px', padding: '20px 0', textAlign: 'center' }}>
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
                                transition: 'background var(--transition)'
                            }}
                            className="hover-card"
                        >
                            <span style={{ fontSize: '12px', color: 'var(--text-muted)', width: '20px', textAlign: 'center', flexShrink: 0 }}>
                                {i + 1}
                            </span>
                            <img
                                src={song.thumbnail}
                                alt={song.title}
                                style={{ width: '36px', height: '36px', borderRadius: 'var(--radius-sm)', objectFit: 'cover', flexShrink: 0 }}
                            />
                            <div style={{ flex: 1, minWidth: 0 }}>
                                <div className="text-ellipsis-1" style={{ fontSize: '13px', color: 'var(--text-primary)' }}>
                                    {song.title}
                                </div>
                                <div className="text-ellipsis-1" style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>
                                    {song.artist}
                                </div>
                            </div>
                            <button
                                onClick={(e) => { e.stopPropagation(); removeFromQueue(queueIndex + 1 + i) }}
                                style={{ color: 'var(--text-muted)', display: 'flex', padding: '4px', flexShrink: 0 }}
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
