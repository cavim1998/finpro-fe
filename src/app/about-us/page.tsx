'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import WhyMustCard from '@/components/WhyMustCard';
import { FaHandshake, FaAward, FaUsers, FaShieldAlt, FaTruck, FaCheckCircle, FaTag } from 'react-icons/fa';

export default function AboutUsPage() {
    const router = useRouter();
    const { data: session, status } = useSession();
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        setIsLoggedIn(status === 'authenticated');
        setLoading(false);
    }, [status]);

    const handleBooking = () => {
        if (isLoggedIn) {
            router.push('/reservation');
        } else {
            router.push('/signin');
        }
    };

    const whyChooseItems = [
        {
            icon: <FaShieldAlt className="text-5xl text-[#1dacbc]" />,
            title: "Trusted Service",
            desc: "We prioritize customer satisfaction and have built a reputation for reliability and excellence in laundry services."
        },
        {
            icon: <FaTruck className="text-5xl text-[#1dacbc]" />,
            title: "Express Delivery",
            desc: "We offer fast and reliable delivery services to ensure your laundry is returned to you quickly and efficiently."
        },
        {
            icon: <FaCheckCircle className="text-5xl text-[#1dacbc]" />,
            title: "Quality Assurance",
            desc: "We ensure all garments are cleaned and handled with care, maintaining the highest standards of quality."
        },
        {
            icon: <FaTag className="text-5xl text-[#1dacbc]" />,
            title: "Affordable Pricing",
            desc: "We offer competitive pricing without compromising on quality, making our services accessible to all customers."
        }
    ];

    const values = [
        {
            icon: <FaHandshake className="text-5xl text-[#1dacbc]" />,
            title: "Trust",
            description: "Building lasting relationships with our customers through honest and transparent service"
        },
        {
            icon: <FaAward className="text-5xl text-[#1dacbc]" />,
            title: "Excellence",
            description: "Committed to delivering the highest quality laundry service every single time"
        },
        {
            icon: <FaUsers className="text-5xl text-[#1dacbc]" />,
            title: "Customer First",
            description: "Your satisfaction is our priority. We listen, care, and deliver beyond expectations"
        }
    ];

    const stats = [
        { number: "10K+", label: "Happy Customers" },
        { number: "50K+", label: "Items Cleaned" },
        { number: "15+", label: "Years Experience" },
        { number: "98%", label: "Satisfaction Rate" }
    ];

    return (
        <div className="min-h-screen bg-[#f9f9f9]">
            <Navbar />

            {/* Hero Section */}
            <div className="bg-linear-to-r from-[#1dacbc] to-[#14939e] text-white py-20">
                <div className="container mx-auto px-4 text-center">
                    <h1 className="text-5xl md:text-6xl font-extrabold mb-6 tracking-tight">
                        About LaundryQ
                    </h1>
                    <p className="text-xl md:text-2xl max-w-3xl mx-auto leading-relaxed">
                        Your trusted partner for professional laundry services since 2026
                    </p>
                </div>
            </div>

            {/* Story Section */}
            <div className="container mx-auto px-4 py-16">
                <div className="max-w-4xl mx-auto">
                    <div className="bg-white rounded-2xl shadow-lg p-8 md:p-12">
                        <h1 className="text-5xl text-center font-extrabold text-[#1dacbc] tracking-tight mb-8">
                            OUR STORY
                        </h1>
                        <div className="space-y-4 text-gray-700 text-lg leading-relaxed">
                            <p>
                                LaundryQ was founded with a simple mission: to make professional laundry services
                                accessible, affordable, and hassle-free for everyone. What started as a small
                                neighborhood laundry shop has grown into a trusted brand serving thousands of
                                satisfied customers across the region.
                            </p>
                            <p>
                                We understand that in today's fast-paced world, time is precious. That's why we've
                                built a service that takes the burden of laundry off your shoulders, so you can
                                focus on what truly matters to you. From busy professionals to families, students,
                                and businesses—we're here to serve everyone with the same dedication and care.
                            </p>
                            <p>
                                Our commitment to quality, sustainability, and customer satisfaction has made us
                                the go-to choice for laundry services. We continuously invest in the latest
                                technology and training to ensure every piece of clothing is treated with the
                                utmost care and returned to you fresh, clean, and perfectly pressed.
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Stats Section */}
            <div className="bg-[#1dacbc] text-white py-16">
                <div className="container mx-auto px-4">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
                        {stats.map((stat, index) => (
                            <div key={index} className="text-center">
                                <h3 className="text-4xl md:text-5xl font-extrabold mb-2">
                                    {stat.number}
                                </h3>
                                <p className="text-lg md:text-xl font-medium opacity-90">
                                    {stat.label}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Features Section */}
            <div className='bg-white'>
                <div className="container mx-auto px-4 py-16">
                    <h1 className="text-5xl text-center font-extrabold text-[#1dacbc] tracking-tight mb-8">
                        WHY CHOOSE LAUNDRYQ?
                    </h1>
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-8 max-w-7xl mx-auto">
                        {whyChooseItems.map((item, index) => (
                            <WhyMustCard
                                key={index}
                                icon={item.icon}
                                title={item.title}
                                desc={item.desc}
                            />
                        ))}
                    </div>
                </div>
            </div>

            {/* Values Section */}
            <div className="bg-gray-100 py-16">
                <div className="container mx-auto px-4">
                    <h1 className="text-5xl text-center font-extrabold text-[#1dacbc] tracking-tight mb-8">
                        OUR VALUES
                    </h1>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
                        {values.map((value, index) => (
                            <div
                                key={index}
                                className="bg-white rounded-2xl shadow-lg p-8 text-center hover:shadow-xl transition-shadow duration-300"
                            >
                                <div className="mb-4 flex justify-center">
                                    {value.icon}
                                </div>
                                <h3 className="text-2xl font-bold text-gray-800 mb-3">
                                    {value.title}
                                </h3>
                                <p className="text-gray-600 leading-relaxed">
                                    {value.description}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* CTA Section */}
            <div className="bg-linear-to-r from-[#1dacbc] to-[#14939e] text-white py-16">
                <div className="container mx-auto px-4 text-center">
                    <h2 className="text-4xl font-bold mb-6">
                        Ready to Experience the Best Laundry Service?
                    </h2>
                    <p className="text-xl mb-8 max-w-2xl mx-auto">
                        Join thousands of satisfied customers who trust LaundryQ for their laundry needs
                    </p>
                    <button
                        onClick={handleBooking}
                        disabled={loading}
                        className="bg-white text-[#1dacbc] px-8 py-4 rounded-full font-bold text-lg hover:bg-gray-100 transition shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        Book Your Service Now
                    </button>
                </div>
            </div>

            <Footer />
        </div>
    );
}
