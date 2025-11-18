import React, { useContext, useEffect, useState,useRef } from 'react'
import { songsData } from '../songs.js'
import musicImg from '../assets/musicanim.webp'
import { GiPreviousButton } from "react-icons/gi";
import { GiNextButton } from "react-icons/gi";
import { FaPlay } from "react-icons/fa";
import { FaPause } from "react-icons/fa";
import { dataContext } from '../context/UserContext.jsx';
import Card from '../components/Card.jsx';

function Home() {

  let { audioRef, playingSong, playSong, pauseSong, prevSong, nextSong, index } = useContext(dataContext)

  const [range, setRange] = useState(0)


  useEffect(() => {
    const updateProgress = () => {
      let duration = audioRef.current.duration || 0
      let currentTime = audioRef.current.currentTime || 0
      let progressPercentage = (currentTime / duration) * 100 || 0
      setRange(progressPercentage)
    }

    audioRef.current.addEventListener("timeupdate", updateProgress)

  })

  function handleRange(e) {
    let newRange = e.target.value
    setRange(newRange)
    let duration = audioRef.current.duration
    audioRef.current.currentTime = (duration * newRange) / 100
    console.log(audioRef.current.currentTime)
  }

  return (
    <div className='w-full h-screen bg-black flex '>
      <div className='w-full md:w-[50%] h-full flex justify-start items-center pt-[20px] md:pt-[120px] flex-col gap-[30px]'>
        <h1 className='text-white font-semibold text-[20px]'>Now Playing</h1>
        <div className='w-[80%] max-w-[250px] md:w-[300px] h-[250px] object-fill rounded-md overflow-hidden relative'>
          <img src={songsData[index].image} className='w-[100%] h-[100%]' alt='' />
          {playingSong ? <div className='w-full h-full bg-black absolute top-0 opacity-[0.5] flex justify-center items-center '>
            <img src={musicImg} className='w-[50%] ' alt="" />
          </div> : null}
          
        </div>
        <div >
          <div className='text-white text-[30px] font-semibold'>{songsData[index].name}</div>
          <div className='text-gray-400 text-[18px] text-center'>{songsData[index].singer}</div>
        </div>
        <div className='w-full flex justify-center items-center'>

          <input value={range} type='range' id='range' className='appearance-none w-[50%] h-[7px] rounded-md bg-gray-600' onChange={(e) => handleRange(e)} />
          <div className={`bg-white w-${range} h-[100%] absolute left-0`}></div>
        </div>
        <div className='text-white flex justify-center items-center gap-[20px]'>


          <GiPreviousButton onClick={() => prevSong()} className='w-[28px] h-[28px] hover:text-gray-400 transition-all cursor-pointer' />
          {!playingSong ? <div onClick={() => playSong()} className='w-[50px] h-[50px] rounded-full bg-white text-black flex justify-center items-center hover:bg-gray-400 transition-all cursor-pointer'>
            <FaPlay />
          </div>
            :
            <div onClick={() => pauseSong()} className='w-[50px] h-[50px] rounded-full bg-white text-black flex justify-center items-center hover:bg-gray-400 transition-all cursor-pointer'>
              <FaPause />
            </div>}


          <GiNextButton onClick={() => nextSong()} className='w-[28px] h-[28px] hover:text-gray-400 transition-all cursor-pointer' />
        </div>
      </div>




      <div className='w-[100%] md:w-[50%] h-full bg-black-500 hidden md:flex pt-[120px]'>
            <Card/>
      </div>
    </div>
  )
}

export default Home