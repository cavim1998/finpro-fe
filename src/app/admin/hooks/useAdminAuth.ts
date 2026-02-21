import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { RoleCode } from "@/types";
import { useSession } from "next-auth/react";

export const useAdminAuth = () => {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [roleCode, setRoleCode] = useState<RoleCode | null>("SUPER_ADMIN");
  const [userOutletId, setUserOutletId] = useState<number | undefined>(
    undefined,
  );
  const [isAuthLoading, setIsAuthLoading] = useState(false);

  useEffect(() => {
    // if (status === "unauthenticated") {
    //   toast.error("Sesi habis, silakan login kembali");
    //   router.push("/signin");
    //   return;
    // }
    // try {
    //   const role = session?.user.role;
    //   const outletId = session?.user.outletId;
    //   setRoleCode(role as RoleCode);
    //   if (role === "OUTLET_ADMIN") {
    //     setUserOutletId(outletId);
    //   }
    // } catch (error) {
    //   console.error("Token invalid", error);
    //   toast.error("Gagal memverifikasi sesi");
    //   router.push("/signin");
    // } finally {
    //   setIsAuthLoading(false);
    // }
  }, [router]);

  return { roleCode, userOutletId, isAuthLoading };
};
