export type RoleCode = "CUSTOMER" | "SUPER_ADMIN" | "OUTLET_ADMIN" | "WORKER" | "DRIVER";

export type Me = {
  id: number;
  email: string | null;
  role: RoleCode;
  isEmailVerified: boolean;
  profile?: {
    fullName: string;
    phone?: string | null;
    photoUrl?: string | null;
  } | null;
};