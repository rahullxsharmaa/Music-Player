import React from 'react'
import { usePlayer } from '../context/UserContext'
import SongRow from '../components/SongRow'
import { GoHeart } from "react-icons/go"
import { FaPlay } from "react-icons/fa"

function Like() {
  const { likedSongs, playNow } = usePlayer()

  return (
    <div className="fade-in" style={{ padding: '28px 36px' }}>
      {/* Header */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '20px',
        marginBottom: '32px'
      }}>
        <div style={{
          width: '80px',
          height: '80px',
          background: 'var(--accent-gradient)',
          borderRadius: 'var(--radius-lg)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
          boxShadow: '0 8px 32px var(--accent-glow)'
        }}>
          <GoHeart size={36} color="white" />
        </div>
        <div>
          <h1 style={{
            fontSize: '28px',
            fontWeight: '800',
            letterSpacing: '-0.03em'
          }}>Liked Songs</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '14px', marginTop: '4px' }}>
            {likedSongs.length} {likedSongs.length === 1 ? 'song' : 'songs'}
          </p>
        </div>

        {likedSongs.length > 0 && (
          <button
            onClick={() => playNow(likedSongs[0], likedSongs.slice(1))}
            style={{
              marginLeft: 'auto',
              padding: '12px 32px',
              background: 'var(--accent-gradient)',
              color: 'white',
              borderRadius: 'var(--radius-full)',
              fontWeight: '600',
              fontSize: '14px',
              transition: 'all var(--transition)',
              boxShadow: '0 4px 16px var(--accent-glow)',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}
          >
            <FaPlay size={12} /> Play All
          </button>
        )}
      </div>

      {/* Song List */}
      {likedSongs.length > 0 ? (
        <div>
          {likedSongs.map((song, i) => (
            <SongRow key={song.videoId} song={song} index={i} showIndex />
          ))}
        </div>
      ) : (
        <div style={{
          textAlign: 'center',
          padding: '80px 20px',
          color: 'var(--text-muted)'
        }}>
          <div style={{
            width: '80px',
            height: '80px',
            borderRadius: '50%',
            background: 'var(--accent-gradient-subtle)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 20px'
          }}>
            <GoHeart size={32} style={{ opacity: 0.4 }} />
          </div>
          <p style={{ fontSize: '16px', fontWeight: '500' }}>No liked songs yet</p>
          <p style={{ fontSize: '13px', marginTop: '6px', opacity: 0.6 }}>Like songs to see them here</p>
        </div>
      )}

      <div style={{ height: '40px' }} />
    </div>
  )
}

export default Like