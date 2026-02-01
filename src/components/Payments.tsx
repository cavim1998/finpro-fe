import React from 'react'

const Payments = () => {
    const paymentMethods = [    
        { name: 'QRIS', logo: '/ImgAssets/payments/QRIS.png' },
        { name: 'Mastercard', logo: '/ImgAssets/payments/Mastercard.png' },
        { name: 'GoPay', logo: '/ImgAssets/payments/GoPay.png' },
        { name: 'DANA', logo: '/ImgAssets/payments/Dana.png' },
        { name: 'OVO', logo: '/ImgAssets/payments/OVO.png' },
        { name: 'VISA', logo: '/ImgAssets/payments/Visa.png' },
    ]

    return (
        <div className='bg-[#f9f9f9]'>
            <div className='container mx-auto px-12 py-20'>
                {/* Heading Section */}
                <div className='flex flex-col items-start mb-10'>
                    <h1 className='text-5xl font-extrabold text-[#1dacbc] tracking-tight leading-tight'>
                        OUR PAYMENTS
                    </h1>
                </div>

                {/* Payment Methods Grid */}
                <div className='grid grid-cols-6 gap-6 items-center justify-items-center'>
                    {paymentMethods.map((method, index) => (
                        <div
                            key={index}
                            className='flex items-center justify-center w-full h-30 bg-white rounded-lg shadow-md'
                        >
                            <img
                                src={method.logo}
                                alt={method.name}
                                className='max-w-full max-h-30 object-contain'
                            />
                        </div>
                    ))}
                </div>
            </div>
        </div>
    )
}

export default Payments
