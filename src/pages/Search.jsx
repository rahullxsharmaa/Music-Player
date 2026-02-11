import React, { useState, useCallback, useRef, useEffect } from 'react'
import { usePlayer } from '../context/UserContext'
import SongRow from '../components/SongRow'
import Card from '../components/Card'
import { FiSearch, FiX } from "react-icons/fi"

function Search() {
  const { API_BASE, playNow, addToQueue } = usePlayer()
  const [query, setQuery] = useState('')
  const [results, setResults] = useState([])
  const [suggestions, setSuggestions] = useState([])
  const [loading, setLoading] = useState(false)
  const [showSuggestions, setShowSuggestions] = useState(false)
  const inputRef = useRef(null)
  const debounceRef = useRef(null)

  // Debounced suggestion fetch
  useEffect(() => {
    if (!query.trim()) {
      setSuggestions([])
      return
    }

    clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(async () => {
      try {
        const res = await fetch(`${API_BASE}/suggestions?q=${encodeURIComponent(query)}`)
        const data = await res.json()
        setSuggestions(Array.isArray(data) ? data.slice(0, 8) : [])
      } catch {
        setSuggestions([])
      }
    }, 300)

    return () => clearTimeout(debounceRef.current)
  }, [query, API_BASE])

  const handleSearch = useCallback(async (searchQuery) => {
    const q = searchQuery || query
    if (!q.trim()) return

    setShowSuggestions(false)
    setLoading(true)

    try {
      const res = await fetch(`${API_BASE}/search?q=${encodeURIComponent(q)}`)
      const data = await res.json()
      setResults(Array.isArray(data) ? data : [])
    } catch (err) {
      console.error('Search failed:', err)
      setResults([])
    } finally {
      setLoading(false)
    }
  }, [query, API_BASE])

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') handleSearch()
    if (e.key === 'Escape') setShowSuggestions(false)
  }

  const handleSuggestionClick = (text) => {
    setQuery(text)
    setShowSuggestions(false)
    handleSearch(text)
  }

  return (
    <div className="fade-in" style={{ padding: '24px 32px' }}>
      {/* Search Bar */}
      <div style={{ position: 'relative', maxWidth: '600px', marginBottom: '24px' }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          background: 'var(--bg-surface)',
          borderRadius: 'var(--radius-full)',
          padding: '12px 20px',
          border: '1px solid var(--border)',
          transition: 'border-color var(--transition)'
        }}>
          <FiSearch size={18} color="var(--text-muted)" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => { setQuery(e.target.value); setShowSuggestions(true) }}
            onFocus={() => setShowSuggestions(true)}
            onKeyDown={handleKeyDown}
            placeholder="Search songs, artists, albums..."
            style={{
              flex: 1,
              background: 'transparent',
              border: 'none',
              outline: 'none',
              color: 'var(--text-primary)',
              fontSize: '15px',
              fontFamily: 'inherit'
            }}
          />
          {query && (
            <button
              onClick={() => { setQuery(''); setResults([]); setSuggestions([]); inputRef.current?.focus() }}
              style={{ color: 'var(--text-muted)', display: 'flex' }}
            >
              <FiX size={18} />
            </button>
          )}
        </div>

        {/* Suggestions Dropdown */}
        {showSuggestions && suggestions.length > 0 && (
          <div style={{
            position: 'absolute',
            top: '100%',
            left: 0,
            right: 0,
            background: 'var(--bg-surface)',
            border: '1px solid var(--border)',
            borderRadius: 'var(--radius-md)',
            marginTop: '4px',
            zIndex: 50,
            maxHeight: '300px',
            overflowY: 'auto',
            boxShadow: '0 8px 32px rgba(0,0,0,0.4)'
          }}>
            {suggestions.map((s, i) => {
              const text = typeof s === 'string' ? s : s.term || s.query || ''
              return (
                <div
                  key={i}
                  onClick={() => handleSuggestionClick(text)}
                  style={{
                    padding: '10px 16px',
                    fontSize: '14px',
                    color: 'var(--text-primary)',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    transition: 'background var(--transition)'
                  }}
                  className="hover-card"
                >
                  <FiSearch size={14} color="var(--text-muted)" />
                  {text}
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* Loading */}
      {loading && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="skeleton" style={{ height: '56px', borderRadius: 'var(--radius-md)' }} />
          ))}
        </div>
      )}

      {/* Results */}
      {!loading && results.length > 0 && (
        <div>
          <h2 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '12px' }}>
            Results for "{query}"
          </h2>
          {/* Top Result Card */}
          {results[0] && (
            <div
              onClick={() => playNow(results[0], results.slice(1))}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '20px',
                padding: '20px',
                background: 'var(--bg-surface)',
                borderRadius: 'var(--radius-lg)',
                marginBottom: '20px',
                cursor: 'pointer',
                transition: 'background var(--transition)'
              }}
              className="hover-card"
            >
              <img
                src={results[0].thumbnail}
                alt={results[0].title}
                style={{
                  width: '80px',
                  height: '80px',
                  borderRadius: 'var(--radius-md)',
                  objectFit: 'cover'
                }}
              />
              <div>
                <div style={{ fontSize: '11px', fontWeight: '600', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '4px' }}>
                  Top Result
                </div>
                <div style={{ fontSize: '22px', fontWeight: '700', color: 'var(--text-primary)', marginBottom: '4px' }}>
                  {results[0].title}
                </div>
                <div style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>
                  {results[0].artist}
                </div>
              </div>
            </div>
          )}

          {/* Song List */}
          <h3 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '8px' }}>Songs</h3>
          {results.slice(1).map((song, i) => (
            <SongRow key={song.videoId + i} song={song} index={i} />
          ))}
        </div>
      )}

      {/* Empty State */}
      {!loading && results.length === 0 && query && (
        <div style={{
          textAlign: 'center',
          padding: '60px 20px',
          color: 'var(--text-muted)'
        }}>
          <FiSearch size={48} style={{ marginBottom: '16px', opacity: 0.3 }} />
          <p style={{ fontSize: '16px' }}>No results found</p>
          <p style={{ fontSize: '13px', marginTop: '4px' }}>Try a different search term</p>
        </div>
      )}

      {/* Initial State */}
      {!loading && results.length === 0 && !query && (
        <div style={{
          textAlign: 'center',
          padding: '80px 20px',
          color: 'var(--text-muted)'
        }}>
          <FiSearch size={48} style={{ marginBottom: '16px', opacity: 0.3 }} />
          <p style={{ fontSize: '16px' }}>Search for your favorite music</p>
          <p style={{ fontSize: '13px', marginTop: '4px' }}>Find songs, artists, and albums</p>
        </div>
      )}

      <div style={{ height: '40px' }} />
    </div>
  )
}

export default Search