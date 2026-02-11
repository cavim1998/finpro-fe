"use client";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { divIcon } from "leaflet";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;

  title: string;
  description?: string;

  confirmText?: string;
  cancelText?: string;

  loading?: boolean;
  onConfirm: () => void | Promise<void>;
};

export default function ConfirmActionDialog({
  open,
  onOpenChange,
  title,
  description,
  confirmText = "Ya, lanjutkan",
  cancelText = "Batal",
  loading = false,
  onConfirm,
}: Props) {
  const handleConfirm = async () => {
    try {
      await onConfirm();
      onOpenChange(false);
    } catch {}
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>
            <div className="text-2xl">{title}</div>
          </AlertDialogTitle>
          {description ? (
            <AlertDialogDescription>
              <div className="text-xl">{description} </div>
            </AlertDialogDescription>
          ) : null}
        </AlertDialogHeader>

        <AlertDialogFooter>
          <AlertDialogCancel disabled={loading}><div className="text-xl text-red-500">{cancelText}
            </div></AlertDialogCancel>
          <AlertDialogAction
            onClick={handleConfirm}
            disabled={loading}
            className={loading ? "opacity-70 pointer-events-none" : ""}
          >
            <div className="text-xl ">
              {loading ? "Memproses..." : confirmText}
            </div>
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
