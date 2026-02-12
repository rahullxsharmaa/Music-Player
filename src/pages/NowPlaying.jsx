import React, { useEffect } from 'react'
import { usePlayer } from '../context/UserContext'
import { handleImageErrorHighRes } from '../utils/imageUtils'
import { useNavigate } from 'react-router-dom'
import { IoChevronDown } from "react-icons/io5"

function NowPlaying() {
    const { currentSong, setShowQueue } = usePlayer()
    const navigate = useNavigate()

    useEffect(() => {
        setShowQueue(true)
    }, [setShowQueue])

    if (!currentSong) return null

    return (
        <div className="fade-in" style={{
            height: '100%',
            width: '100%',
            position: 'relative',
            background: '#000',
            overflow: 'hidden'
        }}>
            <img
                src={currentSong.thumbnail}
                alt={currentSong.title}
                onError={(e) => handleImageErrorHighRes(e, currentSong.thumbnail)}
                style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                    position: 'relative',
                    zIndex: 1
                }}
            />

            <button
                onClick={() => navigate(-1)}
                style={{
                    position: 'absolute',
                    top: '20px', left: '24px',
                    color: 'white',
                    zIndex: 10,
                    background: 'rgba(0,0,0,0.3)',
                    borderRadius: '50%',
                    padding: '10px',
                    backdropFilter: 'blur(10px)',
                    border: '1px solid rgba(255,255,255,0.1)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    transition: 'background 0.2s',
                    cursor: 'pointer'
                }}
                className="hover-btn"
            >
                <IoChevronDown size={24} />
            </button>

            <style>{`
                .hover-btn:hover { background: rgba(0,0,0,0.5) !important; }
            `}</style>
        </div>
    )
}

export default NowPlaying
