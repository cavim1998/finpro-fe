import React from 'react'

import { FaCalendarDays } from "react-icons/fa6";

const Navbar = () => {
    return (
        <div className='container mx-auto'>
            <div className='flex justify-between items-center p-4'>

                {/* Logo */}
                {/* <div>
                    <img src="/ImgAssets/logo.png" alt="Logo" className='w-auto h-10'/>
                </div> */}

                {/* Logo Teks */}
                <a href="/">
                    <h1 className='text-4xl font-bold text-[#1dacbc]'>
                        LAUNDRYQ
                    </h1>
                </a>

                <div className='sm:flex items-center gap-4 hidden'>
                    <a href="/" className='text-lg font-semibold text-[#1dacbc] hover:underline underline-offset-4 decoration-2'>Home</a>
                    <a href="/about-us" className='text-lg font-semibold text-[#1dacbc] hover:underline underline-offset-4 decoration-2'>About Us</a>
                    <a href="/outlet" className='text-lg font-semibold text-[#1dacbc] hover:underline underline-offset-4 decoration-2'>Outlet</a>
                    <a href="/check-status" className='text-lg font-semibold text-[#1dacbc] hover:underline underline-offset-4 decoration-2'>Check Status</a>
                    <a href="/terms-and-conditions" className='text-lg font-semibold text-[#1dacbc] hover:underline underline-offset-4 decoration-2'>T&C</a>
                </div>

                <div className='flex space-x-4'>
                    {/* <a href="/sign-in">
                        <button className="bg-[#1dacbc] text-white py-2 px-4 rounded-full font-semibold hover:bg-[#14939e] transition">
                            Sign In
                        </button>
                    </a>
                    <a href="/sign-up">
                        <button className="bg-[#1dacbc] text-white py-2 px-4 rounded-full font-semibold hover:bg-[#14939e] transition">
                            Sign Up
                        </button>
                    </a> */}
                    <a href="/signin">
                        <button className="bg-[#1dacbc] flex items-center gap-1 text-white py-4 px-4 rounded-full font-semibold hover:bg-[#14939e] transition">
                            <FaCalendarDays /> Reservasion
                        </button>
                    </a>
                </div>
            </div>
        </div>
    )
}

export default Navbar