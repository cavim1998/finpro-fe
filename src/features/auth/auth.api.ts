import { api } from "@/lib/api";

export type LoginBody = { email: string; password: string };

export async function loginApi(body: LoginBody) {
  const res = await api.post("/auth/login", body);
  return res.data;
}

// kalau kamu punya endpoint profile /users/profile
export async function meApi() {
  const res = await api.get("/users/profile");
  return res.data?.data ?? res.data;
}
