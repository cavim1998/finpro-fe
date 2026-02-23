"use client";

import { useState } from "react";
import Link from "next/link";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { BottomNav } from "@/components/BottomNav";
import RequireCheckInRQ from "@/components/guards/RequireCheckIn";
import NavbarWorker from "@/components/Navbarworker";
import ConfirmActionDialog from "@/app/attendance/components/ConfirmActionDialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useDriverOrderDetailQuery, usePickupArrivedDirectMutation } from "@/features/driver/driver.hooks";
import { ArrowLeft, ExternalLink, Loader2, MapPin, Phone, User } from "lucide-react";
import { toast } from "sonner";

function asObj(v: unknown): Record<string, unknown> {
  return typeof v === "object" && v !== null ? (v as Record<string, unknown>) : {};
}

function asNum(v: unknown): number | null {
  const n = Number(v);
  return Number.isFinite(n) ? n : null;
}

function pickText(...values: unknown[]) {
  for (const v of values) {
    if (typeof v === "string" && v.trim()) return v;
  }
  return "-";
}

export default function DriverOrderDetailPage() {
  const router = useRouter();
  const params = useParams();
  const searchParams = useSearchParams();

  const slug = params?.slug;
  const id = Number(Array.isArray(slug) ? slug[0] : slug);
  const typeParam = searchParams.get("type");
  const type = typeParam === "pickup" ? "pickup" : "task";

  const detailQ = useDriverOrderDetailQuery({ id, type }, { enabled: Number.isFinite(id) });
  const arrivedM = usePickupArrivedDirectMutation();
  const [confirmOpen, setConfirmOpen] = useState(false);

  const payload = detailQ.data;
  const root = asObj(payload);
  const task = asObj(root.task);
  const pickup = asObj(root.pickupRequest?.id ? root.pickupRequest : root.pickup);

  const effective =
    Object.keys(task).length > 0
      ? task
      : Object.keys(pickup).length > 0
        ? pickup
        : root;

  const effectivePickup =
    Object.keys(asObj(effective.pickupRequest)).length > 0
      ? asObj(effective.pickupRequest)
      : effective;

  const customer = asObj(effectivePickup.customer);
  const profile = asObj(customer.profile);
  const addressObj = asObj(effectivePickup.address);

  const customerName = pickText(
    profile.fullName,
    profile.name,
    effectivePickup.customerName,
    customer.email,
  );
  const phone = pickText(
    effectivePickup.receiverPhone,
    addressObj.receiverPhone,
    profile.phone,
    customer.phone,
  );
  const addressText = pickText(
    effectivePickup.addressText,
    addressObj.addressText,
    addressObj.label,
  );

  const lat = asNum(effectivePickup.latitude) ?? asNum(addressObj.latitude);
  const lng = asNum(effectivePickup.longitude) ?? asNum(addressObj.longitude);
  const hasCoords = lat !== null && lng !== null;

  const mapsHref = hasCoords
    ? `https://www.google.com/maps?q=${lat},${lng}`
    : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(addressText)}`;
  const embedSrc = hasCoords
    ? `https://maps.google.com/maps?q=${lat},${lng}&z=15&output=embed`
    : `https://maps.google.com/maps?q=${encodeURIComponent(addressText)}&z=15&output=embed`;

  const onConfirmArrived = async () => {
    try {
      await arrivedM.mutateAsync(id);
      toast.success("Status berhasil diupdate: Arrived at Outlet");
      router.push("/driver");
    } catch (error: unknown) {
      const message =
        typeof error === "object" &&
        error !== null &&
        "response" in error &&
        typeof (error as { response?: { data?: { message?: string } } }).response?.data?.message === "string"
          ? (error as { response?: { data?: { message?: string } } }).response?.data?.message
          : "Gagal update status arrived.";
      toast.error(message);
    }
  };

  return (
    <RequireCheckInRQ roles={["DRIVER"]} redirectTo={Number.isFinite(id) ? `/attendance?next=/driver/order/${id}` : "/attendance?next=/driver"}>
      <NavbarWorker />

      <div className="container mx-auto px-4 py-6 pb-24 space-y-4">
        <Button asChild variant="ghost" className="gap-2">
          <Link href="/driver">
            <ArrowLeft className="h-4 w-4" /> Kembali
          </Link>
        </Button>

        <Card className="rounded-2xl">
          <CardHeader>
            <CardTitle className="text-lg">Detail Order Driver</CardTitle>
          </CardHeader>

          <CardContent className="space-y-4">
            {detailQ.isLoading ? (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Loader2 className="h-4 w-4 animate-spin" /> Loading detail...
              </div>
            ) : detailQ.isError ? (
              <div className="text-sm text-destructive">Gagal memuat detail order driver.</div>
            ) : (
              <>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  <div className="rounded-xl border overflow-hidden min-h-[320px]">
                    <iframe
                      title="Driver Order Map"
                      src={embedSrc}
                      className="h-[320px] w-full border-0"
                      loading="lazy"
                      referrerPolicy="no-referrer-when-downgrade"
                    />
                  </div>

                  <div className="rounded-xl border p-4 space-y-3">
                    <div className="flex items-start gap-2">
                      <User className="h-4 w-4 mt-0.5" />
                      <div>
                        <p className="text-xs text-muted-foreground">Nama</p>
                        <p className="font-semibold">{customerName}</p>
                      </div>
                    </div>

                    <div className="flex items-start gap-2">
                      <Phone className="h-4 w-4 mt-0.5" />
                      <div>
                        <p className="text-xs text-muted-foreground">Nomor Telp</p>
                        <p className="font-semibold">{phone}</p>
                      </div>
                    </div>

                    <div className="flex items-start gap-2">
                      <MapPin className="h-4 w-4 mt-0.5" />
                      <div>
                        <p className="text-xs text-muted-foreground">Alamat Lengkap</p>
                        <p className="font-semibold">{addressText}</p>
                      </div>
                    </div>

                    <Button asChild variant="outline" className="w-full rounded-xl">
                      <a href={mapsHref} target="_blank" rel="noopener noreferrer">
                        Open Google Maps <ExternalLink className="h-4 w-4" />
                      </a>
                    </Button>
                  </div>
                </div>

                <Button
                  className="w-full rounded-xl"
                  disabled={arrivedM.isPending}
                  onClick={() => setConfirmOpen(true)}
                >
                  {arrivedM.isPending ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" /> Memproses...
                    </>
                  ) : (
                    "Arrived at Outlet"
                  )}
                </Button>
              </>
            )}
          </CardContent>
        </Card>
      </div>

      <ConfirmActionDialog
        open={confirmOpen}
        onOpenChange={setConfirmOpen}
        title="Konfirmasi Arrived at Outlet"
        description="Apakah kamu yakin sudah tiba di outlet untuk order ini?"
        confirmText="Ya, Arrived"
        cancelText="Batal"
        loading={arrivedM.isPending}
        onConfirm={onConfirmArrived}
      />

      <BottomNav role="DRIVER" />
    </RequireCheckInRQ>
  );
}
