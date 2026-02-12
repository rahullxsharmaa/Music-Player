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
  const [browseCategories, setBrowseCategories] = useState([])
  const [loading, setLoading] = useState(false)
  const [browseLoading, setBrowseLoading] = useState(true)
  const [showSuggestions, setShowSuggestions] = useState(false)
  const inputRef = useRef(null)
  const debounceRef = useRef(null)

  // Load browse categories on mount
  useEffect(() => {
    async function fetchBrowse() {
      try {
        setBrowseLoading(true)
        const res = await fetch(`${API_BASE}/browse`)
        const data = await res.json()
        setBrowseCategories(Array.isArray(data) ? data : [])
      } catch {
        setBrowseCategories([])
      } finally {
        setBrowseLoading(false)
      }
    }
    fetchBrowse()
  }, [API_BASE])

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

  const categoryColors = [
    'linear-gradient(135deg, #e53935, #ff6f61)',
    'linear-gradient(135deg, #1db954, #1ed760)',
    'linear-gradient(135deg, #e91e63, #f06292)',
    'linear-gradient(135deg, #ff9800, #ffb74d)',
    'linear-gradient(135deg, #2196f3, #64b5f6)',
    'linear-gradient(135deg, #9c27b0, #ce93d8)',
    'linear-gradient(135deg, #00bcd4, #4dd0e1)',
    'linear-gradient(135deg, #ff5722, #ff8a65)',
  ]

  return (
    <div className="fade-in" style={{ padding: '28px 36px' }}>
      {/* Search Bar */}
      <div style={{ position: 'relative', maxWidth: '600px', marginBottom: '28px' }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          background: 'rgba(26, 26, 26, 0.6)',
          backdropFilter: 'blur(12px)',
          WebkitBackdropFilter: 'blur(12px)',
          borderRadius: 'var(--radius-full)',
          padding: '14px 22px',
          border: '1px solid var(--border)',
          transition: 'all var(--transition)',
          boxShadow: '0 4px 16px rgba(0,0,0,0.2)'
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
              fontFamily: 'inherit',
              letterSpacing: '-0.01em'
            }}
          />
          {query && (
            <button
              onClick={() => { setQuery(''); setResults([]); setSuggestions([]); inputRef.current?.focus() }}
              style={{
                color: 'var(--text-muted)',
                display: 'flex',
                padding: '4px',
                borderRadius: '50%',
                transition: 'all var(--transition)'
              }}
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
            background: 'rgba(20, 20, 20, 0.95)',
            backdropFilter: 'blur(16px)',
            WebkitBackdropFilter: 'blur(16px)',
            border: '1px solid var(--border)',
            borderRadius: 'var(--radius-md)',
            marginTop: '6px',
            zIndex: 50,
            maxHeight: '300px',
            overflowY: 'auto',
            boxShadow: '0 12px 48px rgba(0,0,0,0.5)'
          }}>
            {suggestions.map((s, i) => {
              const text = typeof s === 'string' ? s : s.term || s.query || ''
              return (
                <div
                  key={i}
                  onClick={() => handleSuggestionClick(text)}
                  style={{
                    padding: '11px 18px',
                    fontSize: '14px',
                    color: 'var(--text-primary)',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
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
            <div key={i} className="skeleton" style={{ height: '60px', borderRadius: 'var(--radius-md)' }} />
          ))}
        </div>
      )}

      {/* Results */}
      {!loading && results.length > 0 && (
        <div>
          <h2 style={{
            fontSize: '18px',
            fontWeight: '700',
            marginBottom: '16px',
            letterSpacing: '-0.02em'
          }}>
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
                background: 'var(--accent-gradient-subtle)',
                borderRadius: 'var(--radius-lg)',
                marginBottom: '24px',
                cursor: 'pointer',
                transition: 'all var(--transition)',
                border: '1px solid rgba(229, 57, 53, 0.1)'
              }}
              className="hover-card"
            >
              <img
                src={results[0].thumbnail}
                alt={results[0].title}
                style={{
                  width: '88px',
                  height: '88px',
                  borderRadius: 'var(--radius-md)',
                  objectFit: 'cover',
                  boxShadow: 'var(--shadow-md)'
                }}
              />
              <div>
                <div style={{
                  fontSize: '11px',
                  fontWeight: '700',
                  color: 'var(--accent)',
                  textTransform: 'uppercase',
                  letterSpacing: '1.5px',
                  marginBottom: '6px'
                }}>
                  Top Result
                </div>
                <div style={{
                  fontSize: '22px',
                  fontWeight: '700',
                  color: 'var(--text-primary)',
                  marginBottom: '4px',
                  letterSpacing: '-0.02em'
                }}>
                  {results[0].title}
                </div>
                <div style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>
                  {results[0].artist}
                </div>
              </div>
            </div>
          )}

          {/* Song List */}
          <h3 style={{
            fontSize: '16px',
            fontWeight: '700',
            marginBottom: '8px',
            letterSpacing: '-0.02em'
          }}>Songs</h3>
          {results.slice(1).map((song, i) => (
            <SongRow key={song.videoId + i} song={song} index={i} />
          ))}
        </div>
      )}

      {/* Empty Results */}
      {!loading && results.length === 0 && query && (
        <div style={{
          textAlign: 'center',
          padding: '60px 20px',
          color: 'var(--text-muted)'
        }}>
          <FiSearch size={48} style={{ marginBottom: '16px', opacity: 0.2 }} />
          <p style={{ fontSize: '16px', fontWeight: '500' }}>No results found</p>
          <p style={{ fontSize: '13px', marginTop: '4px', opacity: 0.6 }}>Try a different search term</p>
        </div>
      )}

      {/* Browse Categories — shown when no search */}
      {!loading && results.length === 0 && !query && (
        <div>
          <h2 style={{
            fontSize: '22px',
            fontWeight: '700',
            marginBottom: '20px',
            letterSpacing: '-0.02em'
          }}>
            Browse
          </h2>

          {browseLoading ? (
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
              gap: '16px'
            }}>
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="skeleton" style={{ height: '100px', borderRadius: 'var(--radius-lg)' }} />
              ))}
            </div>
          ) : browseCategories.length > 0 ? (
            <>
              {/* Category Cards Grid */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
                gap: '16px',
                marginBottom: '36px'
              }}>
                {browseCategories.map((cat, i) => (
                  <div
                    key={cat.name}
                    onClick={() => {
                      setQuery(cat.name)
                      handleSearch(cat.name)
                    }}
                    style={{
                      background: categoryColors[i % categoryColors.length],
                      borderRadius: 'var(--radius-lg)',
                      padding: '20px',
                      cursor: 'pointer',
                      minHeight: '100px',
                      display: 'flex',
                      alignItems: 'flex-end',
                      position: 'relative',
                      overflow: 'hidden',
                      transition: 'transform var(--transition), box-shadow var(--transition)'
                    }}
                    className="browse-card"
                  >
                    <span style={{
                      fontSize: '18px',
                      fontWeight: '700',
                      color: 'white',
                      letterSpacing: '-0.02em',
                      textShadow: '0 2px 8px rgba(0,0,0,0.3)',
                      zIndex: 1
                    }}>
                      {cat.name}
                    </span>
                    {/* Decorative thumbnail */}
                    {cat.songs[0]?.thumbnail && (
                      <img
                        src={cat.songs[0].thumbnail}
                        alt=""
                        style={{
                          position: 'absolute',
                          right: '-10px',
                          top: '-10px',
                          width: '80px',
                          height: '80px',
                          borderRadius: 'var(--radius-md)',
                          objectFit: 'cover',
                          transform: 'rotate(15deg)',
                          opacity: 0.5,
                          boxShadow: '0 4px 12px rgba(0,0,0,0.3)'
                        }}
                      />
                    )}
                  </div>
                ))}
              </div>

              {/* Category song lists */}
              {browseCategories.map(cat => (
                <div key={cat.name + '-songs'} style={{ marginBottom: '32px' }}>
                  <h3 style={{
                    fontSize: '18px',
                    fontWeight: '700',
                    marginBottom: '12px',
                    letterSpacing: '-0.02em',
                    position: 'relative',
                    display: 'inline-block'
                  }}>
                    {cat.name}
                    <div style={{
                      position: 'absolute',
                      bottom: '-4px',
                      left: 0,
                      width: '28px',
                      height: '2px',
                      background: 'var(--accent-gradient)',
                      borderRadius: '1px'
                    }} />
                  </h3>
                  <div style={{
                    display: 'flex',
                    gap: '4px',
                    overflowX: 'auto',
                    paddingBottom: '8px',
                    scrollbarWidth: 'none'
                  }}>
                    {cat.songs.map(song => (
                      <Card key={song.videoId} song={song} />
                    ))}
                  </div>
                </div>
              ))}
            </>
          ) : (
            <div style={{
              textAlign: 'center',
              padding: '60px 20px',
              color: 'var(--text-muted)'
            }}>
              <FiSearch size={48} style={{ marginBottom: '16px', opacity: 0.2 }} />
              <p style={{ fontSize: '16px', fontWeight: '500' }}>Search for your favorite music</p>
              <p style={{ fontSize: '13px', marginTop: '6px', opacity: 0.6 }}>Find songs, artists, and albums</p>
            </div>
          )}
        </div>
      )}

      <div style={{ height: '40px' }} />

      <style>{`
        .browse-card:hover {
          transform: scale(1.03);
          box-shadow: 0 8px 24px rgba(0,0,0,0.3);
        }
      `}</style>
    </div>
  )
}

export default Search