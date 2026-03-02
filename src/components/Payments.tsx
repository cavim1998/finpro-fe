import React from 'react'

const Payments = () => {
    const paymentMethods = [    
        { name: 'QRIS', logo: '/imgAssets/payments/QRIS.png' },
        { name: 'Mastercard', logo: '/imgAssets/payments/Mastercard.png' },
        { name: 'GoPay', logo: '/imgAssets/payments/Gopay.png' },
        { name: 'DANA', logo: '/imgAssets/payments/Dana.png' },
        { name: 'OVO', logo: '/imgAssets/payments/OVO.png' },
        { name: 'VISA', logo: '/imgAssets/payments/Visa.png' },
    ]

    return (
        <div className='bg-[#f9f9f9]'>
            <div className='container mx-auto px-4 md:px-8 xl:px-12 py-10 md:py-20'>
                {/* Heading Section */}
                <div className='flex flex-col items-center md:items-start mb-8 md:mb-10'>
                    <h1 className='text-3xl sm:text-4xl md:text-5xl font-extrabold text-[#1dacbc] tracking-tight leading-tight'>
                        OUR PAYMENTS
                    </h1>
                </div>

                {/* Payment Methods Grid */}
                <div className='grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4 md:gap-6 items-center justify-items-center'>
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
