import React from 'react'
import { usePlayer } from '../context/UserContext'
import { Link, useLocation } from 'react-router-dom'
import { GoHome, GoHomeFill } from "react-icons/go"
import { GoSearch } from "react-icons/go"
import { RiPlayListFill, RiPlayListLine } from "react-icons/ri"
import { GoHeart, GoHeartFill } from "react-icons/go"
import { IoMusicalNotes } from "react-icons/io5"

const navItems = [
    { to: '/', label: 'Home', icon: GoHome, activeIcon: GoHomeFill },
    { to: '/search', label: 'Search', icon: GoSearch, activeIcon: GoSearch },
    { to: '/playlist', label: 'Playlists', icon: RiPlayListLine, activeIcon: RiPlayListFill },
    { to: '/liked', label: 'Liked', icon: GoHeart, activeIcon: GoHeartFill },
]

function Nav() {
    const path = useLocation().pathname

    const isActive = (to) => {
        if (to === '/') return path === '/'
        return path.startsWith(to)
    }

    return (
        <>
            {/* Desktop sidebar */}
            <nav className="desktop-only" style={{
                width: 'var(--sidebar-width)',
                height: '100vh',
                background: 'rgba(15, 15, 15, 0.9)',
                backdropFilter: 'blur(20px)',
                WebkitBackdropFilter: 'blur(20px)',
                borderRight: '1px solid var(--border)',
                padding: '20px 0',
                display: 'flex',
                flexDirection: 'column',
                gap: '2px',
                flexShrink: 0,
                overflowY: 'auto',
                position: 'sticky',
                top: 0
            }}>
                <Link to="/" style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    padding: '14px 24px',
                    marginBottom: '20px',
                    fontSize: '22px',
                    fontWeight: '800',
                    letterSpacing: '-0.5px'
                }}>
                    <div style={{
                        width: '32px',
                        height: '32px',
                        borderRadius: '8px',
                        background: 'var(--accent-gradient)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        boxShadow: '0 0 16px var(--accent-glow)'
                    }}>
                        <IoMusicalNotes size={18} color="white" />
                    </div>
                    <span className="gradient-text">Music</span>
                </Link>

                {navItems.map(item => {
                    const active = isActive(item.to)
                    const Icon = active ? item.activeIcon : item.icon
                    return (
                        <Link
                            key={item.to}
                            to={item.to}
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '14px',
                                padding: '11px 24px',
                                fontSize: '14px',
                                fontWeight: active ? '600' : '400',
                                color: active ? 'var(--text-primary)' : 'var(--text-secondary)',
                                background: active ? 'var(--accent-gradient-subtle)' : 'transparent',
                                borderRadius: 'var(--radius-md)',
                                margin: '0 10px',
                                transition: 'all var(--transition)',
                                position: 'relative'
                            }}
                        >
                            {active && (
                                <div style={{
                                    position: 'absolute',
                                    left: 0,
                                    top: '50%',
                                    transform: 'translateY(-50%)',
                                    width: '3px',
                                    height: '20px',
                                    background: 'var(--accent-gradient)',
                                    borderRadius: '0 3px 3px 0'
                                }} />
                            )}
                            <Icon size={20} />
                            {item.label}
                        </Link>
                    )
                })}

                {/* Bottom decorative gradient */}
                <div style={{
                    marginTop: 'auto',
                    height: '1px',
                    margin: '16px 24px',
                    background: 'linear-gradient(90deg, transparent, var(--border-glow), transparent)'
                }} />
                <div style={{
                    padding: '8px 24px',
                    fontSize: '11px',
                    color: 'var(--text-muted)',
                    opacity: 0.5
                }}>
                    Music Player
                </div>
            </nav>

            {/* Mobile bottom nav */}
            <nav className="mobile-only" style={{
                position: 'fixed',
                bottom: 0,
                left: 0,
                right: 0,
                background: 'rgba(15, 15, 15, 0.9)',
                backdropFilter: 'blur(20px)',
                WebkitBackdropFilter: 'blur(20px)',
                borderTop: '1px solid var(--border)',
                display: 'flex',
                justifyContent: 'space-around',
                padding: '8px 0 max(8px, env(safe-area-inset-bottom))',
                zIndex: 40
            }}>
                {navItems.map(item => {
                    const active = isActive(item.to)
                    const Icon = active ? item.activeIcon : item.icon
                    return (
                        <Link
                            key={item.to}
                            to={item.to}
                            style={{
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                                gap: '3px',
                                fontSize: '10px',
                                color: active ? 'var(--accent)' : 'var(--text-muted)',
                                padding: '4px 12px',
                                transition: 'color var(--transition)'
                            }}
                        >
                            <Icon size={22} />
                            {item.label}
                        </Link>
                    )
                })}
            </nav>

            <style>{`
        @media (max-width: 768px) {
          .desktop-only { display: none !important; }
        }
        @media (min-width: 769px) {
          .mobile-only { display: none !important; }
        }
      `}</style>
        </>
    )
}

export default Nav