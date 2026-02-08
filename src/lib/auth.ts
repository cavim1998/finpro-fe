import { jwtDecode } from "jwt-decode";

export function getRoleFromToken(accessToken?: string): string | null {
  if (!accessToken) return null;
  try {
    const decoded: any = jwtDecode(accessToken);
    return decoded?.role ?? decoded?.roleCode ?? null;
  } catch {
    return null;
  }
}