"use client";

import { RoleCode } from "@/types";
import { useRouter } from "next/navigation";
import { useEffect, useMemo } from "react";
import { useSession } from "next-auth/react";

type Props = {
  children: React.ReactNode;
  roles: RoleCode[];
  redirectTo?: string;
};

export default function RequireRole({ children, roles, redirectTo = "/" }: Props) {
  const router = useRouter();
  const { data: session, status } = useSession();

  const role = (session?.user?.role || session?.user?.roleCode) as
    | RoleCode
    | undefined;

  const shouldGoSignin = useMemo(() => {
    if (status === "loading") return false;
    return status === "unauthenticated";
  }, [status]);

  const shouldRedirect = useMemo(() => {
    if (status !== "authenticated") return false;
    if (!role) return true;
    return !roles.includes(role);
  }, [status, role, roles]);

  useEffect(() => {
    if (shouldGoSignin) {
      router.replace("/signin");
      return;
    }
    if (shouldRedirect) {
      router.replace(redirectTo);
    }
  }, [shouldGoSignin, shouldRedirect, redirectTo, router]);

  if (status === "loading") return null;
  if (shouldGoSignin) return null;
  if (shouldRedirect) return null;

  return <>{children}</>;
}

