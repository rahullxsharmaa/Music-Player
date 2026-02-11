import React from 'react'
import { usePlayer } from '../context/UserContext'
import { FaPlay, FaPause } from "react-icons/fa"
import { GoHeart, GoHeartFill } from "react-icons/go"

function SongRow({ song, index, showIndex = false }) {
    const { playNow, isLiked, toggleLike, currentSong, isPlaying, togglePlay } = usePlayer()

    if (!song) return null

    const isCurrentSong = currentSong?.videoId === song.videoId

    function formatDuration(secs) {
        if (!secs) return ''
        const m = Math.floor(secs / 60)
        const s = Math.floor(secs % 60)
        return `${m}:${s.toString().padStart(2, '0')}`
    }

    return (
        <div
            onClick={() => playNow(song)}
            style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                padding: '8px 16px',
                borderRadius: 'var(--radius-md)',
                cursor: 'pointer',
                transition: 'background var(--transition)'
            }}
            className="hover-card"
        >
            {/* Index or play icon */}
            <div style={{
                width: '32px',
                textAlign: 'center',
                flexShrink: 0,
                color: isCurrentSong ? 'var(--accent)' : 'var(--text-muted)',
                fontSize: '14px'
            }}>
                {isCurrentSong ? (
                    isPlaying ? (
                        <button onClick={(e) => { e.stopPropagation(); togglePlay() }}
                            style={{ color: 'var(--accent)', display: 'flex', alignItems: 'center', justifyContent: 'center', width: '100%' }}>
                            <FaPause size={12} />
                        </button>
                    ) : (
                        <button onClick={(e) => { e.stopPropagation(); togglePlay() }}
                            style={{ color: 'var(--accent)', display: 'flex', alignItems: 'center', justifyContent: 'center', width: '100%' }}>
                            <FaPlay size={12} />
                        </button>
                    )
                ) : showIndex ? (
                    <span>{index + 1}</span>
                ) : (
                    <FaPlay size={10} className="row-play-icon" style={{ opacity: 0, transition: 'opacity var(--transition)' }} />
                )}
            </div>

            {/* Thumbnail */}
            <img
                src={song.thumbnail}
                alt={song.title}
                loading="lazy"
                style={{
                    width: '40px',
                    height: '40px',
                    borderRadius: 'var(--radius-sm)',
                    objectFit: 'cover',
                    flexShrink: 0
                }}
            />

            {/* Info */}
            <div style={{ flex: 1, minWidth: 0 }}>
                <div className="text-ellipsis-1" style={{
                    fontSize: '14px',
                    fontWeight: '400',
                    color: isCurrentSong ? 'var(--accent)' : 'var(--text-primary)'
                }}>
                    {song.title}
                </div>
                <div className="text-ellipsis-1" style={{
                    fontSize: '12px',
                    color: 'var(--text-secondary)'
                }}>
                    {song.artist}
                </div>
            </div>

            {/* Duration */}
            <span style={{
                fontSize: '12px',
                color: 'var(--text-muted)',
                flexShrink: 0
            }}>
                {formatDuration(song.duration)}
            </span>

            {/* Like */}
            <button
                onClick={(e) => { e.stopPropagation(); toggleLike(song) }}
                style={{
                    color: isLiked(song.videoId) ? 'var(--accent)' : 'var(--text-muted)',
                    display: 'flex',
                    alignItems: 'center',
                    flexShrink: 0,
                    padding: '4px',
                    transition: 'color var(--transition)'
                }}
            >
                {isLiked(song.videoId) ? <GoHeartFill size={16} /> : <GoHeart size={16} />}
            </button>

            <style>{`
        .hover-card:hover .row-play-icon {
          opacity: 1 !important;
        }
      `}</style>
        </div>
    )
}

export default SongRow
