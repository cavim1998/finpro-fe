import React from 'react'

const MainHeader = () => {
    return (
        <div className='bg-[#f9f9f9]'>
            <div className='container mx-auto px-12 py-20'>
                <div className='grid grid-cols-2 items-center gap-6'>

                    {/* Text Section */}
                    <div className='flex flex-col justify-center text-left space-y-4'>
                        <h1 className='text-6xl font-extrabold text-[#1dacbc] tracking-tight'>
                            No.1 Laundry Service in Indonesia
                        </h1>

                        <p className='text-[#1dacbc] text-xl tracking-tight'>
                            <span className='font-semibold italic text-[#14939e]'>LaundryQ</span> is a professional
                            laundry service offering both per-kilogram and individual item washing.
                            We apply high cleanliness standards to ensure your clothes are clean,
                            neat, fresh, hygienic, and completed on time.
                        </p>

                        <p className='text-[#1dacbc] text-xl tracking-tight'>
                            <span className='font-semibold italic text-[#14939e]'>LaundryQ</span> is committed to
                            delivering consistent and reliable service.
                            Customer trust is our top priority, which is why every item is handled
                            with great care to ensure results that are always clean, tidy, and meet
                            your expectations.
                        </p>
                    </div>

                    {/* Image Section */}
                    <div className='flex-1'>
                        <img
                            src="/ImgAssets/main-header.png"
                            alt="Laundry Service Illustration"
                            className='w-full h-auto'
                        />
                    </div>

                </div>
            </div>
        </div>
    )
}

export default MainHeader