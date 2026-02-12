import React, { useEffect, useState } from 'react'
import { usePlayer } from '../context/UserContext'
import Card from '../components/Card'
import SongRow from '../components/SongRow'

function Home() {
  const { API_BASE, playNow } = usePlayer()
  const [trending, setTrending] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    async function fetchTrending() {
      try {
        setLoading(true)
        const res = await fetch(`${API_BASE}/trending?region=IN`)
        if (!res.ok) throw new Error('Server error')
        const data = await res.json()
        if (Array.isArray(data)) {
          setTrending(data)
          setError(null)
        } else {
          setTrending([])
          setError('Invalid data received')
        }
      } catch (err) {
        console.error('Failed to fetch trending:', err)
        setError('Could not load trending music. Make sure the server is running on port 3001.')
      } finally {
        setLoading(false)
      }
    }
    fetchTrending()
  }, [API_BASE])

  const topPicks = trending.slice(0, 8)
  const chartList = trending.slice(0, 20)
  const moreTrending = trending.slice(8, 16)

  return (
    <div className="fade-in" style={{ padding: '28px 36px' }}>
      {/* Header */}
      <h1 style={{
        fontSize: '32px',
        fontWeight: '800',
        marginBottom: '28px',
        letterSpacing: '-0.03em'
      }}>
        Good <span className="gradient-text">{getTimeGreeting()}</span>
      </h1>

      {/* Error State */}
      {error && (
        <div style={{
          padding: '14px 20px',
          background: 'rgba(239, 68, 68, 0.1)',
          borderRadius: 'var(--radius-md)',
          color: '#fca5a5',
          fontSize: '14px',
          marginBottom: '24px',
          border: '1px solid rgba(239, 68, 68, 0.2)'
        }}>
          {error}
        </div>
      )}

      {/* Quick Picks Carousel */}
      <Section title="Quick Picks">
        {loading ? (
          <div style={{ display: 'flex', gap: '8px' }}>
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="skeleton" style={{ width: '180px', height: '260px', flexShrink: 0 }} />
            ))}
          </div>
        ) : (
          <div style={{
            display: 'flex',
            gap: '4px',
            overflowX: 'auto',
            paddingBottom: '8px',
            scrollbarWidth: 'none'
          }}>
            {topPicks.map(song => (
              <Card key={song.videoId} song={song} />
            ))}
          </div>
        )}
      </Section>

      {/* Charts */}
      <Section title="Top Charts">
        {loading ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="skeleton" style={{ height: '60px', borderRadius: 'var(--radius-md)' }} />
            ))}
          </div>
        ) : (
          <div>
            {chartList.map((song, i) => (
              <SongRow key={song.videoId} song={song} index={i} showIndex />
            ))}
          </div>
        )}
      </Section>

      {/* More Trending */}
      {moreTrending.length > 0 && (
        <Section title="Trending">
          <div style={{
            display: 'flex',
            gap: '4px',
            overflowX: 'auto',
            paddingBottom: '8px',
            scrollbarWidth: 'none'
          }}>
            {moreTrending.map(song => (
              <Card key={song.videoId + '-trending'} song={song} />
            ))}
          </div>
        </Section>
      )}

      {/* Bottom padding */}
      <div style={{ height: '40px' }} />
    </div>
  )
}

function Section({ title, children }) {
  return (
    <div style={{ marginBottom: '36px' }}>
      <h2 style={{
        fontSize: '20px',
        fontWeight: '700',
        marginBottom: '16px',
        color: 'var(--text-primary)',
        letterSpacing: '-0.02em',
        position: 'relative',
        display: 'inline-block'
      }}>
        {title}
        <div style={{
          position: 'absolute',
          bottom: '-4px',
          left: 0,
          width: '32px',
          height: '2px',
          background: 'var(--accent-gradient)',
          borderRadius: '1px'
        }} />
      </h2>
      {children}
    </div>
  )
}

function getTimeGreeting() {
  const h = new Date().getHours()
  if (h < 12) return 'morning'
  if (h < 17) return 'afternoon'
  return 'evening'
}

export default Home