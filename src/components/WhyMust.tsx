import React from 'react'
import WhyMustCard from './WhyMustCard';

const WhyMust = () => {

    const experienceItems: { image: string; title: string; desc: string; }[] = [
        {
            image: "/ImgAssets/laundry-basket.png",
            title: "Trusted Service",
            desc: "We prioritize customer satisfaction and have built a reputation for reliability and excellence in laundry services."
        },
        {
            image: "/ImgAssets/laundry-basket.png",
            title: "Express Delivery",
            desc: "We offer fast and reliable delivery services to ensure your laundry is returned to you quickly and efficiently."
        },
        {
            image: "/ImgAssets/laundry-basket.png",
            title: "Quality Assurance",
            desc: "We ensure all garments are cleaned and handled with care, maintaining the highest standards of quality."
        },
        {
            image: "/ImgAssets/laundry-basket.png",
            title: "Affordable Pricing",
            desc: "We offer competitive pricing without compromising on quality, making our services accessible to all customers."
        }
    ];

    return (
        <div className="w-full bg-[#f9f9f9]">
            <div className="">
                <div className="container mx-auto px-4 py-10">
                    <h1 className="text-6xl text-center font-extrabold text-[#1dacbc] tracking-tight mb-4">
                        WHY CHOOSE LAUNDRYQ?
                    </h1>

                    {/* Card Experience */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6 mt-8">
                        {experienceItems.map((experienceItem, index) => {
                            return (
                                <WhyMustCard
                                    key={index}
                                    image={experienceItem.image}
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
