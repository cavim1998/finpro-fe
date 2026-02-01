import React from 'react'

const MainHeader = () => {
  return (
    <div className='bg-gray-100'>
        <div className='container mx-auto px-4 py-10'>
            <div className='flex flex-col md:flex-row items-center md:items-start gap-6'>

                {/* Text Section */}
                <div className='flex-1 text-center md:text-left'>
                    <h1 className='text-7xl font-extrabold text-[#1dacbc] tracking-tight mb-4'>
                        NO.1 Laundry Service in Indonesia
                    </h1>
                    <p className='text-gray-700 text-xl mb-6'>
                        Your one-stop solution for all your laundry needs. Experience convenience and quality service like never before.
                    </p>
                </div>
                {/* Image Section */}
                <div className='flex-1'>
                    <img src="/ImgAssets/main-header.png" alt="Laundry Service" className='w-full h-auto'/>
                </div>
                </div>
        </div>
    </div>
  )
}

export default MainHeader