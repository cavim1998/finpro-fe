interface ReviewsCardProps {
    name: string;
    review: string;
}

function ReviewsCard(props: ReviewsCardProps) {
    return (
        <div className="bg-white rounded-lg overflow-hidden border shadow-md">
            <div className="p-6 space-y-3">

                <div className="flex justify-center">
                    <p className="text-lg text-gray-700">{props.review}</p>
                </div>
                <hr />
                <div className="flex justify-center">
                    <p className="text-xl font-extrabold text-[#14939e] tracking-tight">{props.name}</p>
                </div>
            </div>
        </div>
    );
}

export default ReviewsCard;