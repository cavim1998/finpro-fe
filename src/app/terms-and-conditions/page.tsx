"use client";

import Footer from '@/components/Footer'
import Navbar from '@/components/Navbar'
import React, { useMemo, useState } from 'react'

const page = () => {
    const [activeTab, setActiveTab] = useState<'order' | 'kiloan'>('order');

    const sections = useMemo(
        () => ({
            order: {
                title: 'Terms & Conditions: Order',
                items: [
                    'Service and transactions follow a queue system. Laundry will be processed after full payment is completed.',
                    'Minimum weight is 3kg. We do not mix customer loads (1 machine per customer). Weight is rounded down if under 0.4kg and rounded up if above 0.5kg.',
                    'Laundry pickup is handled by our partners (Lalamove/Paketqu). We do not provide bags/containers, so please pack items neatly before handing them to the driver.',
                    'Express orders placed after 13:00 will be completed the next day.',
                    'Damage due to pre-existing conditions (tears, holes, poor fabric quality) is not our responsibility.',
                    'If any discrepancy occurs regarding the number of items under our responsibility, the count stated on the handover receipt is considered correct.',
                    'Items not collected within 1 week are outside our responsibility.',
                    'Compensation is Rp 20,000/item (max Rp 100,000) for Laundry Kiloan, and 5x the wash value for items listed on the Laundry Satuan receipt.',
                    'Complaint claims are valid within 24 hours after pickup, or within one week from drop-off, and must include an unboxing video and receipt/e-invoice.',
                    'We will compensate Rp 100,000 if our crew does not provide an official receipt.',
                    'We do not accept items with dirt, blood, or animal fur that may reduce garment hygiene. By using our service, you agree to these terms.',
                    'Changes such as damage, color fading, or shrinkage due to natural fabric properties may occur and are beyond our control.'
                ]
            },
            kiloan: {
                title: 'Terms & Conditions: Laundry Kiloan',
                items: [
                    'Prices and services follow the latest LaundryQ price list.',
                    'Estimated completion for regular service is 2–3 business days; express follows the selected package.',
                    'Potentially color-bleeding garments will be separated if notified by the customer.',
                    'Kiloan service does not accept leather garments or items requiring special care (dry clean only) without prior confirmation.',
                    'Please confirm special items (large bed covers, shoes, bags) before placing an order.',
                    'Complaints must include evidence (photo/video) within 24 hours after pickup.'
                ]
            }
        }),
        []
    );

    const currentSection = sections[activeTab];
    return (
        <div>
            <Navbar />
            <div className='min-h-screen bg-[#f9f9f9]'>

                {/* Hero Section */}
                <div className="bg-linear-to-r from-[#1dacbc] to-[#14939e] text-white py-20">
                    <div className="container mx-auto px-4 text-center">
                        <h1 className="text-5xl md:text-6xl font-extrabold tracking-tight">
                            Terms & Conditions
                        </h1>
                    </div>
                </div>

                {/* Content Section */}
                <div className="container mx-auto px-4 py-12">
                    <div className="flex flex-wrap gap-3 justify-center mb-8">
                        <button
                            onClick={() => setActiveTab('order')}
                            className={`px-5 py-2 rounded-full text-sm font-semibold transition ${
                                activeTab === 'order'
                                    ? 'bg-[#1dacbc] text-white shadow-md'
                                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                            }`}
                        >
                            Syarat & Ketentuan : Order
                        </button>
                        <button
                            onClick={() => setActiveTab('kiloan')}
                            className={`px-5 py-2 rounded-full text-sm font-semibold transition ${
                                activeTab === 'kiloan'
                                    ? 'bg-[#1dacbc] text-white shadow-md'
                                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                            }`}
                        >
                            Syarat & Ketentuan : Laundry Kiloan
                        </button>
                    </div>

                    <div className="max-w-6xl mx-auto bg-white rounded-2xl shadow-lg p-6 md:p-10">
                        <h2 className="text-xl md:text-2xl font-bold text-[#1dacbc] mb-6">
                            {currentSection.title}
                        </h2>
                        <ol className="list-decimal ml-5 space-y-3 text-gray-700 leading-relaxed">
                            {currentSection.items.map((item, index) => (
                                <li key={index}>{item}</li>
                            ))}
                        </ol>
                    </div>
                </div>
            </div>
            <Footer />
        </div>
    )
}

export default page