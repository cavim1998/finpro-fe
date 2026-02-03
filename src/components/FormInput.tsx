import React from "react";
import { UseFormRegisterReturn } from "react-hook-form";

interface FormInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
  registration: UseFormRegisterReturn;
}

export const FormInput = ({
  label,
  error,
  registration,
  className,
  ...props
}: FormInputProps) => {
  return (
    <div className="space-y-1">
      <label className="block text-sm font-semibold text-gray-700">
        {label} <span className="text-red-500">*</span>
      </label>
      <input
        {...registration}
        {...props}
        className={`w-full px-4 py-2 border rounded-lg focus:ring-2 outline-none disabled:bg-gray-100 ${
          error
            ? "border-red-500 focus:ring-red-200"
            : "border-gray-300 focus:ring-[#17A2B8]"
        } ${className}`}
      />
      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  );
};
