import React from 'react'
import ServicesCard from './ServicesCard';
import ReviewsCard from './ReviewsCard';

const Reviews = () => {

    const reviewItems: { name: string; review: string;}[] = [
        {
            name: "Kai Larssen",
            review: "lorem ipsum dolor sit amet, consectetur adipiscing elit"
        },
        {
            name: "Lynn Stevanson",
            review: "lorem ipsum dolor sit amet, consectetur adipiscing elit"
        },
        {
            name: "Kyoto Mercya",
            review: "lorem ipsum dolor sit amet, consectetur adipiscing elit"
        },
        {
            name: "Anne Hall",
            review: "lorem ipsum dolor sit amet, consectetur adipiscing elit"
        }
    ];

    return (
        <div className="w-full bg-[#ffffff]">
            <div className="container mx-auto px-4 py-20">
                <h1 className="text-5xl text-center font-extrabold text-[#1dacbc] tracking-tight mb-4">
                    What Our Happy Customers Say About Us
                </h1>

                {/* Card Experience */}
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6 mt-8">
                    {reviewItems.map((reviewItem, index) => {
                        return (
                            <ReviewsCard
                                key={index}
                                name={reviewItem.name}
                                review={reviewItem.review}
                            />
                        );
                    })}
                </div>
            </div>

        </div>
    )
}

export default Reviews
