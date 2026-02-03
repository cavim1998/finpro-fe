import React from 'react'

const Introduction = () => {
    return (
        <div className='bg-[#1dacbc]'>
            <div className='container mx-auto px-12 py-20'>
                <div className='grid grid-cols-2 items-center gap-20'>

                    {/* Text Section */}
                    <div className='flex flex-col justify-center text-left space-y-4'>
                        <h1 className='text-6xl font-extrabold text-[#ffffff] tracking-tight'>
                            Delivery & Pickup - Maximum 30 Minutes Pickup
                        </h1>

                        <p className='text-[#ffffff] text-xl tracking-tight'>
                            We understand that your convenience is our priority. That's why we provide free delivery and pickup service with a maximum pickup time of 30 minutes after you place your order. Simply contact us or order through our app, and we'll come right away to pick up your laundry.
                        </p>
                    </div>

                    {/* Image Section */}
                    <div className='flex-1'>
                        <img
                            src="/ImgAssets/header-pickup.png"
                            alt="Laundry Service Illustration"
                            className='w-full h-auto bg-white rounded-xl'
                        />
                    </div>

                </div>
            </div>
        </div>
    )
}

export default Introduction