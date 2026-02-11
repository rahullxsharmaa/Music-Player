import React from 'react'
import { usePlayer } from '../context/UserContext'
import { FaPlay } from "react-icons/fa"
import { GoHeart, GoHeartFill } from "react-icons/go"

function Card({ song, size = 'normal' }) {
    const { playNow, isLiked, toggleLike, currentSong, isPlaying } = usePlayer()

    if (!song) return null

    const isCurrentSong = currentSong?.videoId === song.videoId
    const isSmall = size === 'small'

    return (
        <div
            onClick={() => playNow(song)}
            style={{
                width: isSmall ? '160px' : '180px',
                cursor: 'pointer',
                padding: '12px',
                borderRadius: 'var(--radius-md)',
                transition: 'background var(--transition)',
                flexShrink: 0,
                position: 'relative'
            }}
            className="hover-card"
        >
            {/* Thumbnail */}
            <div style={{
                width: '100%',
                aspectRatio: '1',
                borderRadius: 'var(--radius-md)',
                overflow: 'hidden',
                position: 'relative',
                marginBottom: '10px',
                boxShadow: isCurrentSong ? '0 0 0 2px var(--accent)' : 'none'
            }}>
                <img
                    src={song.thumbnail}
                    alt={song.title}
                    loading="lazy"
                    style={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover',
                        transition: 'transform var(--transition)'
                    }}
                />
                {/* Play overlay */}
                <div style={{
                    position: 'absolute',
                    inset: 0,
                    background: 'rgba(0,0,0,0.4)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    opacity: 0,
                    transition: 'opacity var(--transition)'
                }} className="card-overlay">
                    <div style={{
                        width: '40px',
                        height: '40px',
                        borderRadius: '50%',
                        background: 'var(--accent)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                    }}>
                        <FaPlay size={16} color="white" style={{ marginLeft: '2px' }} />
                    </div>
                </div>
            </div>

            {/* Info */}
            <div className="text-ellipsis-1" style={{
                fontSize: '14px',
                fontWeight: '500',
                color: isCurrentSong ? 'var(--accent)' : 'var(--text-primary)',
                marginBottom: '4px'
            }}>
                {song.title}
            </div>
            <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
            }}>
                <div className="text-ellipsis-1" style={{
                    fontSize: '12px',
                    color: 'var(--text-secondary)',
                    flex: 1
                }}>
                    {song.artist}
                </div>
                <button
                    onClick={(e) => { e.stopPropagation(); toggleLike(song) }}
                    style={{
                        color: isLiked(song.videoId) ? 'var(--accent)' : 'var(--text-muted)',
                        display: 'flex',
                        alignItems: 'center',
                        flexShrink: 0,
                        padding: '4px'
                    }}
                >
                    {isLiked(song.videoId) ? <GoHeartFill size={14} /> : <GoHeart size={14} />}
                </button>
            </div>

            <style>{`
        .hover-card:hover .card-overlay {
          opacity: 1 !important;
        }
        .hover-card:hover img {
          transform: scale(1.05);
        }
      `}</style>
        </div>
    )
}

export default Card