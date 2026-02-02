import { FaStar, FaQuoteLeft } from 'react-icons/fa';

interface ReviewsCardProps {
    name: string;
    review: string;
}

function ReviewsCard(props: ReviewsCardProps) {
    // Generate initials from name
    const getInitials = (name: string) => {
        return name
            .split(' ')
            .map((word) => word[0])
            .join('')
            .toUpperCase()
            .slice(0, 2);
    };

    return (
        <div className="bg-white rounded-2xl overflow-hidden border border-gray-100 shadow-md h-full">
            <div className="p-6 space-y-4 flex flex-col h-full">
                
                {/* Quote Icon */}
                <div className="flex justify-start">
                    <FaQuoteLeft className="text-3xl text-[#1dacbc] opacity-30" />
                </div>

                {/* Review Text */}
                <div className="grow">
                    <p className="text-base text-gray-600 leading-relaxed italic">
                        "{props.review}"
                    </p>
                </div>

                {/* Rating Stars */}
                <div className="flex justify-start gap-1">
                    {[...Array(5)].map((_, i) => (
                        <FaStar key={i} className="text-yellow-400 text-sm" />
                    ))}
                </div>

                {/* Divider */}
                <hr className="border-gray-200" />

                {/* Customer Info */}
                <div className="flex items-center gap-3">
                    {/* Avatar */}
                    <div className="w-12 h-12 rounded-full bg-linear-to-br from-[#1dacbc] to-[#14939e] text-white font-bold flex items-center justify-center text-sm shadow-md">
                        {getInitials(props.name)}
                    </div>
                    
                    {/* Name */}
                    <div>
                        <p className="text-lg font-bold text-[#14939e] tracking-tight">
                            {props.name}
                        </p>
                        <p className="text-xs text-gray-500">Verified Customer</p>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default ReviewsCard;