import { AlertCircle } from "lucide-react";

interface ErrorStateProps {
  text?: string;
}

export const ErrorState = ({
  text = "Terjadi kesalahan sistem.",
}: ErrorStateProps) => {
  return (
    <div className="flex flex-col items-center justify-center py-12 px-4 text-center border-2 border-dashed border-red-200 bg-red-50 rounded-xl text-red-500 animate-in zoom-in duration-200">
      <AlertCircle className="mb-2" size={28} />
      <p className="font-medium">{text}</p>
      <p className="text-xs text-red-400 mt-1">
        Silakan coba muat ulang halaman.
      </p>
    </div>
  );
};
