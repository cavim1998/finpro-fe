interface WhyMustCardProps {
  image: string;
  title: string;
  desc: string;
}

function WhyMustCard(props: WhyMustCardProps) {
  return (
    <div className="bg-white rounded-lg overflow-hidden border shadow-md">
      <div className="p-6 space-y-3">
        <div className="flex justify-center w-auto h-65">
          <img src={props.image} alt={props.title} className="mb-3" />
        </div>
        <hr />
        <div className="flex justify-center">
          <p className="text-3xl font-extrabold text-[#14939e] tracking-tight">{props.title}</p>
        </div>
        <div className="flex justify-center">
          <p className="text-xl text-[#6b7280] text-justify">{props.desc}</p>
        </div>
      </div>
    </div>
  );
}

export default WhyMustCard;