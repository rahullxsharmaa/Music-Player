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
    { to: '/playlists', label: 'Playlists', icon: RiPlayListLine, activeIcon: RiPlayListFill },
    { to: '/liked', label: 'Liked', icon: GoHeart, activeIcon: GoHeartFill },
]

function Nav() {
    const path = useLocation().pathname

    return (
        <>
            {/* Desktop sidebar */}
            <nav className="desktop-only" style={{
                width: 'var(--sidebar-width)',
                height: '100vh',
                background: 'var(--bg-secondary)',
                borderRight: '1px solid var(--border)',
                padding: '16px 0',
                display: 'flex',
                flexDirection: 'column',
                gap: '4px',
                flexShrink: 0,
                overflowY: 'auto',
                position: 'sticky',
                top: 0
            }}>
                <Link to="/" style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    padding: '12px 20px',
                    marginBottom: '12px',
                    fontSize: '20px',
                    fontWeight: '700',
                    color: 'var(--text-primary)',
                    letterSpacing: '-0.5px'
                }}>
                    <IoMusicalNotes size={24} color="var(--accent)" />
                    <span>Music</span>
                </Link>

                {navItems.map(item => {
                    const isActive = path === item.to
                    const Icon = isActive ? item.activeIcon : item.icon
                    return (
                        <Link
                            key={item.to}
                            to={item.to}
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '16px',
                                padding: '10px 20px',
                                fontSize: '14px',
                                fontWeight: isActive ? '600' : '400',
                                color: isActive ? 'var(--text-primary)' : 'var(--text-secondary)',
                                background: isActive ? 'var(--bg-surface-active)' : 'transparent',
                                borderRadius: 'var(--radius-md)',
                                margin: '0 8px',
                                transition: 'all var(--transition)'
                            }}
                        >
                            <Icon size={20} />
                            {item.label}
                        </Link>
                    )
                })}
            </nav>

            {/* Mobile bottom nav */}
            <nav className="mobile-only" style={{
                position: 'fixed',
                bottom: 0,
                left: 0,
                right: 0,
                background: 'var(--bg-secondary)',
                borderTop: '1px solid var(--border)',
                display: 'flex',
                justifyContent: 'space-around',
                padding: '8px 0 max(8px, env(safe-area-inset-bottom))',
                zIndex: 40
            }}>
                {navItems.map(item => {
                    const isActive = path === item.to
                    const Icon = isActive ? item.activeIcon : item.icon
                    return (
                        <Link
                            key={item.to}
                            to={item.to}
                            style={{
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                                gap: '2px',
                                fontSize: '10px',
                                color: isActive ? 'var(--text-primary)' : 'var(--text-muted)',
                                padding: '4px 12px'
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