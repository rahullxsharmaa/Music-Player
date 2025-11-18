import React from 'react'
import { songsData } from '../songs'
import { MdPlaylistAdd } from "react-icons/md";
import { GoHeart } from "react-icons/go";
import { GoHeartFill } from "react-icons/go";

function Card() {
    return (
        <div className='md:p-[10px] p-[5px]  w-[90%] md:h-[120px] h-[70px] bg-gray-800 rounded-lg flex'>
            <div className=' flex justify-start items-center gap-[20px] w-[70%] h-[100%]'>
                <img src={songsData[0].image} className='md:w-[100px] md:max-h-[100px] md:w-[100px] rounded-lg' alt="" />
                <div className='text-15px md:text-[20px] '>
                    <div className='text-white text-[1.2em] font-semibold'>{songsData[0].name}</div>
                    <div className='text-gray-400 text-[0.7em] font-semibold'>{songsData[0].singer}</div>
                </div>
            </div>
            <div className='flex justify-center items-center gap-[20px] w-[30%] h-[100%]'>
                <div>
                    <MdPlaylistAdd/>
                </div>
                <div>
                    <GoHeart/>
                </div>
            </div>
        </div>

    )
}

export default Card