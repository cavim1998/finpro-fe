"use client";

import Image from "next/image";
import { Dialog, DialogContent } from "@/components/ui/dialog";

type Props = {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  mode: "checkin" | "checkout";
  name: string;
  onConfirm: () => void;
};

export function CheckInOutDialog({
  open,
  onOpenChange,
  mode,
  name,
  onConfirm,
}: Props) {
  const isCheckIn = mode === "checkin";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="border-0 bg-transparent p-0 shadow-none sm:max-w-[420px]">
        <div className="w-full rounded-[44px] bg-[#54E1E6] px-8 py-10 text-center">
          <h1 className="text-[42px] font-extrabold leading-tight text-black">
            Hello, {name}
          </h1>

          <div className="mx-auto my-10 flex h-[240px] w-[240px] items-center justify-center overflow-hidden rounded-full bg-white/40">
            {/* pakai image bebas. kalau belum ada, boleh ganti placeholder */}
            <Image
              src="/placeholder.png"
              alt="illustration"
              width={260}
              height={260}
              className="h-full w-full object-cover"
            />
          </div>

          <p className="mx-auto max-w-[260px] text-[28px] leading-snug text-black/90">
            {isCheckIn
              ? "silakan check in dulu sebelum bekerja ya!"
              : "terima kasih hari ini!\njangan lupa check out!"}
          </p>

          <button
            onClick={() => {
              onConfirm();
              onOpenChange(false);
            }}
            className="mt-10 w-full rounded-full bg-white py-5 text-[44px] font-extrabold text-black shadow-lg active:scale-[0.99]"
          >
            {isCheckIn ? "check in" : "check out"}
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}