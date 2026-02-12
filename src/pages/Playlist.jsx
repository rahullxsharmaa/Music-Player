import React, { useState } from 'react'
import { usePlayer } from '../context/UserContext'
import { useParams, useNavigate } from 'react-router-dom'
import SongRow from '../components/SongRow'
import { RiPlayListFill } from "react-icons/ri"
import { IoAdd, IoClose, IoTrash } from "react-icons/io5"
import { FaPlay } from "react-icons/fa"

function Playlist() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { playlists, createPlaylist, deletePlaylist, removeFromPlaylist, playNow } = usePlayer()
  const [newName, setNewName] = useState('')
  const [showCreate, setShowCreate] = useState(false)

  // Single playlist view
  if (id) {
    const playlist = playlists.find(p => p.id === id)
    if (!playlist) {
      return (
        <div className="fade-in" style={{
          padding: '28px 36px',
          color: 'var(--text-muted)',
          textAlign: 'center',
          paddingTop: '80px'
        }}>
          <p style={{ fontSize: '16px' }}>Playlist not found</p>
        </div>
      )
    }

    return (
      <div className="fade-in" style={{ padding: '28px 36px' }}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '20px', marginBottom: '32px' }}>
          <div style={{
            width: '80px',
            height: '80px',
            background: 'linear-gradient(135deg, var(--bg-surface-solid), var(--bg-surface-active))',
            borderRadius: 'var(--radius-lg)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
            overflow: 'hidden',
            boxShadow: 'var(--shadow-md)'
          }}>
            {playlist.songs[0]?.thumbnail ? (
              <img src={playlist.songs[0].thumbnail} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            ) : (
              <RiPlayListFill size={36} color="var(--text-muted)" />
            )}
          </div>
          <div style={{ flex: 1 }}>
            <h1 style={{
              fontSize: '24px',
              fontWeight: '800',
              letterSpacing: '-0.03em'
            }}>{playlist.name}</h1>
            <p style={{ color: 'var(--text-secondary)', fontSize: '14px', marginTop: '4px' }}>
              {playlist.songs.length} {playlist.songs.length === 1 ? 'song' : 'songs'}
            </p>
          </div>

          {playlist.songs.length > 0 && (
            <button
              onClick={() => playNow(playlist.songs[0], playlist.songs.slice(1))}
              style={{
                padding: '12px 24px',
                background: 'var(--accent-gradient)',
                color: 'white',
                borderRadius: 'var(--radius-full)',
                fontWeight: '600',
                fontSize: '14px',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                boxShadow: '0 4px 16px var(--accent-glow)',
                transition: 'all var(--transition)'
              }}
            >
              <FaPlay size={12} /> Play
            </button>
          )}

          <button
            onClick={() => { deletePlaylist(playlist.id); navigate('/playlist') }}
            style={{
              color: 'var(--text-muted)',
              padding: '10px',
              display: 'flex',
              borderRadius: 'var(--radius-sm)',
              transition: 'all var(--transition)'
            }}
            className="hover-card"
            title="Delete Playlist"
          >
            <IoTrash size={20} />
          </button>
        </div>

        {/* Songs */}
        {playlist.songs.length > 0 ? (
          playlist.songs.map((song, i) => (
            <div key={song.videoId} style={{ display: 'flex', alignItems: 'center' }}>
              <div style={{ flex: 1 }}>
                <SongRow song={song} index={i} showIndex />
              </div>
              <button
                onClick={() => removeFromPlaylist(playlist.id, song.videoId)}
                style={{
                  color: 'var(--text-muted)',
                  padding: '8px',
                  display: 'flex',
                  borderRadius: 'var(--radius-sm)',
                  transition: 'all var(--transition)'
                }}
              >
                <IoClose size={18} />
              </button>
            </div>
          ))
        ) : (
          <div style={{ textAlign: 'center', padding: '60px 20px', color: 'var(--text-muted)' }}>
            <p style={{ fontWeight: '500' }}>This playlist is empty</p>
            <p style={{ fontSize: '13px', marginTop: '4px', opacity: 0.6 }}>Search and add songs to this playlist</p>
          </div>
        )}
      </div>
    )
  }

  // Playlists overview
  return (
    <div className="fade-in" style={{ padding: '28px 36px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '28px' }}>
        <h1 style={{
          fontSize: '28px',
          fontWeight: '800',
          letterSpacing: '-0.03em'
        }}>Your Playlists</h1>
        <button
          onClick={() => setShowCreate(true)}
          style={{
            padding: '10px 22px',
            background: 'rgba(229, 57, 53, 0.1)',
            border: '1px solid rgba(229, 57, 53, 0.2)',
            borderRadius: 'var(--radius-full)',
            color: 'var(--accent)',
            fontSize: '14px',
            fontWeight: '600',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            transition: 'all var(--transition)'
          }}
          className="hover-card"
        >
          <IoAdd size={18} /> New Playlist
        </button>
      </div>

      {/* Create Dialog */}
      {showCreate && (
        <div style={{
          display: 'flex',
          gap: '8px',
          marginBottom: '24px',
          maxWidth: '400px'
        }}>
          <input
            type="text"
            placeholder="Playlist name..."
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && newName.trim()) {
                createPlaylist(newName.trim())
                setNewName('')
                setShowCreate(false)
              }
            }}
            autoFocus
            style={{
              flex: 1,
              padding: '12px 16px',
              background: 'var(--bg-surface-solid)',
              border: '1px solid var(--border)',
              borderRadius: 'var(--radius-md)',
              color: 'var(--text-primary)',
              fontSize: '14px',
              outline: 'none',
              fontFamily: 'inherit',
              transition: 'border-color var(--transition)'
            }}
          />
          <button
            onClick={() => {
              if (newName.trim()) {
                createPlaylist(newName.trim())
                setNewName('')
                setShowCreate(false)
              }
            }}
            style={{
              padding: '12px 20px',
              background: 'var(--accent-gradient)',
              color: 'white',
              borderRadius: 'var(--radius-md)',
              fontWeight: '600',
              fontSize: '14px',
              boxShadow: '0 4px 12px var(--accent-glow)'
            }}
          >
            Create
          </button>
          <button
            onClick={() => { setShowCreate(false); setNewName('') }}
            style={{
              color: 'var(--text-muted)',
              display: 'flex',
              alignItems: 'center',
              padding: '8px'
            }}
          >
            <IoClose size={20} />
          </button>
        </div>
      )}

      {/* Playlist Grid */}
      {playlists.length > 0 ? (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
          gap: '16px'
        }}>
          {playlists.map(pl => (
            <div
              key={pl.id}
              onClick={() => navigate(`/playlist/${pl.id}`)}
              style={{
                padding: '14px',
                background: 'var(--bg-surface)',
                borderRadius: 'var(--radius-lg)',
                cursor: 'pointer',
                transition: 'all var(--transition)',
                border: '1px solid var(--border)'
              }}
              className="hover-card"
            >
              <div style={{
                width: '100%',
                aspectRatio: '1',
                background: 'linear-gradient(135deg, var(--bg-surface-solid), var(--bg-surface-active))',
                borderRadius: 'var(--radius-md)',
                marginBottom: '12px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                overflow: 'hidden'
              }}>
                {pl.songs[0]?.thumbnail ? (
                  <img src={pl.songs[0].thumbnail} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                ) : (
                  <RiPlayListFill size={40} color="var(--text-muted)" style={{ opacity: 0.3 }} />
                )}
              </div>
              <div className="text-ellipsis-1" style={{
                fontSize: '14px',
                fontWeight: '600',
                letterSpacing: '-0.01em'
              }}>
                {pl.name}
              </div>
              <div style={{
                fontSize: '12px',
                color: 'var(--text-secondary)',
                marginTop: '4px'
              }}>
                {pl.songs.length} songs
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div style={{ textAlign: 'center', padding: '80px 20px', color: 'var(--text-muted)' }}>
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
            <RiPlayListFill size={32} style={{ opacity: 0.4 }} />
          </div>
          <p style={{ fontSize: '16px', fontWeight: '500' }}>No playlists yet</p>
          <p style={{ fontSize: '13px', marginTop: '6px', opacity: 0.6 }}>Create a playlist to organize your music</p>
        </div>
      )}

      <div style={{ height: '40px' }} />
    </div>
  )
}

export default Playlist