import React from 'react'
import { usePlayer } from '../context/UserContext'
import { handleImageErrorHighRes } from '../utils/imageUtils'
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
                borderRadius: 'var(--radius-lg)',
                transition: 'all var(--transition)',
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
                marginBottom: '12px',
                boxShadow: isCurrentSong
                    ? '0 0 0 2px var(--accent), 0 0 20px var(--accent-glow)'
                    : 'var(--shadow-sm)'
            }}>
                <img
                    src={song.thumbnail}
                    alt={song.title}
                    onError={(e) => handleImageErrorHighRes(e, song.thumbnail)}
                    loading="lazy"
                    style={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover',
                        transition: 'transform var(--transition), filter var(--transition)'
                    }}
                />
                {/* Gradient overlay */}
                <div style={{
                    position: 'absolute',
                    inset: 0,
                    background: 'linear-gradient(180deg, transparent 50%, rgba(0,0,0,0.6) 100%)',
                    opacity: 0,
                    transition: 'opacity var(--transition)'
                }} className="card-overlay" />
                {/* Play button */}
                <div style={{
                    position: 'absolute',
                    inset: 0,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    opacity: 0,
                    transition: 'opacity var(--transition), transform var(--transition)',
                    transform: 'translateY(8px)'
                }} className="card-play-btn">
                    <div style={{
                        width: '44px',
                        height: '44px',
                        borderRadius: '50%',
                        background: 'var(--accent-gradient)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        boxShadow: '0 4px 16px var(--accent-glow)',
                        transition: 'transform var(--transition-spring)'
                    }}>
                        <FaPlay size={16} color="white" style={{ marginLeft: '2px' }} />
                    </div>
                </div>
                {/* Currently playing indicator */}
                {isCurrentSong && isPlaying && (
                    <div style={{
                        position: 'absolute',
                        bottom: '8px',
                        left: '8px',
                        padding: '4px 8px',
                        borderRadius: 'var(--radius-sm)',
                        background: 'rgba(0,0,0,0.7)',
                        backdropFilter: 'blur(8px)'
                    }}>
                        <div className="equalizer">
                            <div className="bar" />
                            <div className="bar" />
                            <div className="bar" />
                        </div>
                    </div>
                )}
            </div>

            {/* Info */}
            <div className="text-ellipsis-1" style={{
                fontSize: '14px',
                fontWeight: '500',
                color: isCurrentSong ? 'var(--accent)' : 'var(--text-primary)',
                marginBottom: '4px',
                letterSpacing: '-0.01em'
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
                    {typeof song.artist === 'object' ? song.artist.name : song.artist}
                </div>
                <button
                    onClick={(e) => { e.stopPropagation(); toggleLike(song) }}
                    style={{
                        color: isLiked(song.videoId) ? 'var(--accent)' : 'var(--text-muted)',
                        display: 'flex',
                        alignItems: 'center',
                        flexShrink: 0,
                        padding: '4px',
                        transition: 'color var(--transition), transform var(--transition)'
                    }}
                >
                    {isLiked(song.videoId) ? <GoHeartFill size={14} /> : <GoHeart size={14} />}
                </button>
            </div>

            <style>{`
        .hover-card:hover .card-overlay {
          opacity: 1 !important;
        }
        .hover-card:hover .card-play-btn {
          opacity: 1 !important;
          transform: translateY(0) !important;
        }
        .hover-card:hover img {
          transform: scale(1.05);
          filter: brightness(0.8);
        }
      `}</style>
        </div>
    )
}

export default Card