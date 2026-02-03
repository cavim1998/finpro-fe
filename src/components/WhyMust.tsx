import React from 'react'
import WhyMustCard from './WhyMustCard';
import { FaShieldAlt, FaTruck, FaCheckCircle, FaTag } from 'react-icons/fa';

const WhyMust = () => {

    const experienceItems: { icon: React.ReactNode; title: string; desc: string; }[] = [
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

    return (
        <div className="w-full bg-[#ffffff]">
            <div className="">
                <div className="container mx-auto px-4 py-20">
                    <h1 className="text-5xl text-center font-extrabold text-[#1dacbc] tracking-tight mb-4">
                        WHY CHOOSE LAUNDRYQ?
                    </h1>

                    {/* Card Experience */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6 mt-8">
                        {experienceItems.map((experienceItem, index) => {
                            return (
                                <WhyMustCard
                                    key={index}
                                    icon={experienceItem.icon}
                                    title={experienceItem.title}
                                    desc={experienceItem.desc}
                                />
                            );
                        })}
                    </div>
                </div>
            </div>

        </div>
    )
}

export default WhyMust
