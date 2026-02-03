import { Loader2 } from "lucide-react";

interface LoadingStateProps {
  text?: string;
}

export const LoadingState = ({
  text = "Memuat data...",
}: LoadingStateProps) => {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-gray-400 animate-in fade-in duration-300">
      <Loader2 className="animate-spin mb-3 text-[#17A2B8]" size={32} />
      <p className="text-sm font-medium">{text}</p>
    </div>
  );
};
