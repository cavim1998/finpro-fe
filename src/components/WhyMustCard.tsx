interface WhyMustCardProps {
  icon: React.ReactNode;
  title: string;
  desc: string;
}

function WhyMustCard(props: WhyMustCardProps) {
  return (
    <div className="bg-white rounded-2xl overflow-hidden border border-gray-100 shadow-lg hover:shadow-xl transition-shadow duration-300 h-full">
      <div className="p-8 space-y-4 flex flex-col h-full">
        
        {/* Icon */}
        <div className="flex justify-center pt-2">
          {props.icon}
        </div>

        {/* Divider */}
        <hr className="border-gray-200" />

        {/* Title */}
        <div className="flex justify-center">
          <p className="text-2xl font-bold text-[#14939e] tracking-tight text-center">{props.title}</p>
        </div>

        {/* Description */}
        <div className="flex-grow flex items-center justify-center">
          <p className="text-base text-gray-600 text-center leading-relaxed">{props.desc}</p>
        </div>
      </div>
    </div>
  );
}

export default WhyMustCard;