interface ServicesCardProps {
  image: string;
  title: string;
}

function ServicesCard(props: ServicesCardProps) {
  return (
    <div className="bg-white rounded-lg overflow-hidden border shadow-md">
      <div className="p-6 space-y-3">
        <div className="flex justify-center w-auto h-60">
          <img src={props.image} alt={props.title} className="mb-3" />
        </div>
        <hr />
        <div className="flex justify-center">
          <p className="text-4xl font-extrabold text-[#14939e] tracking-tight">{props.title}</p>
        </div>
      </div>
    </div>
  );
}

export default ServicesCard;