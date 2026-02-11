import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { jwtDecode } from "jwt-decode";
import { RoleCode } from "@/types";

export const useAdminAuth = () => {
  const router = useRouter();
  const [roleCode, setRoleCode] = useState<RoleCode | null>(null);
  const [userOutletId, setUserOutletId] = useState<number | undefined>(
    undefined,
  );
  const [isAuthLoading, setIsAuthLoading] = useState(true);

  const getCookie = (name: string) => {
    if (typeof document === "undefined") return null;
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop()?.split(";").shift();
    return null;
  };

  useEffect(() => {
    const token = getCookie("token");

    if (!token) {
      toast.error("Sesi habis, silakan login kembali");
      router.push("/auth/login");
      return;
    }

    try {
      const decoded: any = jwtDecode(token);
      setRoleCode(decoded.role as RoleCode);

      if (decoded.role === "OUTLET_ADMIN") {
        setUserOutletId(decoded.outletId);
      }
    } catch (error) {
      console.error("Token invalid", error);
      toast.error("Gagal memverifikasi sesi");
      router.push("/auth/login");
    } finally {
      setIsAuthLoading(false);
    }
  }, [router]);

  return { roleCode, userOutletId, isAuthLoading };
};
