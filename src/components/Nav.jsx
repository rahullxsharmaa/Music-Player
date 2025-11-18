import React from 'react'
import { IoHome } from "react-icons/io5";
import { FaSearch } from "react-icons/fa";
import { PiPlaylistFill } from "react-icons/pi";
import { FaHeart } from "react-icons/fa6";
import { Link } from 'react-router-dom';

function Nav() {
    return (
        <div className='w-full h-[100px] bg-black fixed md:top-0 text-white flex md:justify-center justify-around item-center gap-[50px] bottom-0 p-[10px]'>
            <Link to="/">
                <IoHome className='w-[25px] h-[25px]' />
            </Link>
            <Link to="/search">
                <FaSearch className='w-[25px] h-[25px]' />
            </Link>
            <Link to='/playlist'>
                <PiPlaylistFill className='w-[25px] h-[25px]' />
            </Link>
            <Link to='/like'>
                <FaHeart className='w-[25px] h-[25px]' />
            </Link>
        </div>
    )
}

export default Nav