import React from 'react'
import ServicesCard from './ServicesCard';

const Services = () => {

  const experienceItems: { image: string; title: string; }[] = [
    {
      image: "/imgAssets/daily-laundry.png",
      title: "Daily Laundry"
    },
    {
      image: "/imgAssets/wash-fold.png",
      title: "Wash & Fold"
    },
    {
      image: "/imgAssets/shoe-cleaning.png",
      title: "Shoe Cleaning"
    },
    {
      image: "/imgAssets/bag-cleaning.png",
      title: "Bag Cleaning"
    }
  ];

  return (
    <div className="w-full bg-[#ffffff]">
      <div className="container mx-auto px-4 py-20">
        <h1 className="text-5xl text-center font-extrabold text-[#1dacbc] tracking-tight mb-4">
          OUR SERVICES
        </h1>

        {/* Card Experience */}
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6 mt-8">
          {experienceItems.map((experienceItem, index) => {
            return (
              <ServicesCard
                key={index}
                image={experienceItem.image}
                title={experienceItem.title}
              />
            );
          })}
        </div>
      </div>

    </div>
  )
}

export default Services
