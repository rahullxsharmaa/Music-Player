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
        <div className="fade-in" style={{ padding: '24px 32px', color: 'var(--text-muted)', textAlign: 'center', paddingTop: '80px' }}>
          <p style={{ fontSize: '16px' }}>Playlist not found</p>
        </div>
      )
    }

    return (
      <div className="fade-in" style={{ padding: '24px 32px' }}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '20px', marginBottom: '32px' }}>
          <div style={{
            width: '80px',
            height: '80px',
            background: 'linear-gradient(135deg, #1d1d1d, #333)',
            borderRadius: 'var(--radius-md)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
            overflow: 'hidden'
          }}>
            {playlist.songs[0]?.thumbnail ? (
              <img src={playlist.songs[0].thumbnail} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            ) : (
              <RiPlayListFill size={36} color="var(--text-muted)" />
            )}
          </div>
          <div style={{ flex: 1 }}>
            <h1 style={{ fontSize: '24px', fontWeight: '700' }}>{playlist.name}</h1>
            <p style={{ color: 'var(--text-secondary)', fontSize: '14px', marginTop: '4px' }}>
              {playlist.songs.length} {playlist.songs.length === 1 ? 'song' : 'songs'}
            </p>
          </div>

          {playlist.songs.length > 0 && (
            <button
              onClick={() => playNow(playlist.songs[0], playlist.songs.slice(1))}
              style={{
                padding: '10px 24px',
                background: 'var(--accent)',
                color: 'white',
                borderRadius: 'var(--radius-full)',
                fontWeight: '600',
                fontSize: '14px',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}
            >
              <FaPlay size={12} /> Play
            </button>
          )}

          <button
            onClick={() => { deletePlaylist(playlist.id); navigate('/playlist') }}
            style={{ color: 'var(--text-muted)', padding: '8px', display: 'flex' }}
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
                style={{ color: 'var(--text-muted)', padding: '8px', display: 'flex' }}
              >
                <IoClose size={18} />
              </button>
            </div>
          ))
        ) : (
          <div style={{ textAlign: 'center', padding: '60px 20px', color: 'var(--text-muted)' }}>
            <p>This playlist is empty</p>
            <p style={{ fontSize: '13px', marginTop: '4px' }}>Search and add songs to this playlist</p>
          </div>
        )}
      </div>
    )
  }

  // Playlists overview
  return (
    <div className="fade-in" style={{ padding: '24px 32px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
        <h1 style={{ fontSize: '28px', fontWeight: '700' }}>Your Playlists</h1>
        <button
          onClick={() => setShowCreate(true)}
          style={{
            padding: '8px 20px',
            background: 'var(--bg-surface)',
            border: '1px solid var(--border)',
            borderRadius: 'var(--radius-full)',
            color: 'var(--text-primary)',
            fontSize: '14px',
            fontWeight: '500',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            transition: 'background var(--transition)'
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
              padding: '10px 16px',
              background: 'var(--bg-surface)',
              border: '1px solid var(--border)',
              borderRadius: 'var(--radius-md)',
              color: 'var(--text-primary)',
              fontSize: '14px',
              outline: 'none',
              fontFamily: 'inherit'
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
              padding: '10px 20px',
              background: 'var(--accent)',
              color: 'white',
              borderRadius: 'var(--radius-md)',
              fontWeight: '500',
              fontSize: '14px'
            }}
          >
            Create
          </button>
          <button
            onClick={() => { setShowCreate(false); setNewName('') }}
            style={{ color: 'var(--text-muted)', display: 'flex', alignItems: 'center', padding: '8px' }}
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
                padding: '16px',
                background: 'var(--bg-surface)',
                borderRadius: 'var(--radius-md)',
                cursor: 'pointer',
                transition: 'background var(--transition)'
              }}
              className="hover-card"
            >
              <div style={{
                width: '100%',
                aspectRatio: '1',
                background: 'var(--bg-surface-active)',
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
                  <RiPlayListFill size={40} color="var(--text-muted)" />
                )}
              </div>
              <div className="text-ellipsis-1" style={{ fontSize: '14px', fontWeight: '500' }}>
                {pl.name}
              </div>
              <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '4px' }}>
                {pl.songs.length} songs
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div style={{ textAlign: 'center', padding: '80px 20px', color: 'var(--text-muted)' }}>
          <RiPlayListFill size={48} style={{ marginBottom: '16px', opacity: 0.3 }} />
          <p style={{ fontSize: '16px' }}>No playlists yet</p>
          <p style={{ fontSize: '13px', marginTop: '4px' }}>Create a playlist to organize your music</p>
        </div>
      )}

      <div style={{ height: '40px' }} />
    </div>
  )
}

export default Playlist