import React from 'react'
import { usePlayer } from '../context/UserContext'
import SongRow from '../components/SongRow'
import { GoHeart } from "react-icons/go"

function Like() {
  const { likedSongs, playNow } = usePlayer()

  return (
    <div className="fade-in" style={{ padding: '24px 32px' }}>
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
          background: 'linear-gradient(135deg, #ff0000, #ff4444)',
          borderRadius: 'var(--radius-md)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0
        }}>
          <GoHeart size={36} color="white" />
        </div>
        <div>
          <h1 style={{ fontSize: '28px', fontWeight: '700' }}>Liked Songs</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '14px', marginTop: '4px' }}>
            {likedSongs.length} {likedSongs.length === 1 ? 'song' : 'songs'}
          </p>
        </div>

        {likedSongs.length > 0 && (
          <button
            onClick={() => playNow(likedSongs[0], likedSongs.slice(1))}
            style={{
              marginLeft: 'auto',
              padding: '10px 32px',
              background: 'var(--accent)',
              color: 'white',
              borderRadius: 'var(--radius-full)',
              fontWeight: '600',
              fontSize: '14px',
              transition: 'background var(--transition)'
            }}
          >
            Play All
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
          <GoHeart size={48} style={{ marginBottom: '16px', opacity: 0.3 }} />
          <p style={{ fontSize: '16px' }}>No liked songs yet</p>
          <p style={{ fontSize: '13px', marginTop: '4px' }}>Like songs to see them here</p>
        </div>
      )}

      <div style={{ height: '40px' }} />
    </div>
  )
}

export default Like