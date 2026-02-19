import { useQuery } from "@tanstack/react-query";
import { axiosInstance } from "@/lib/axios";
import { useSession } from "next-auth/react";

export function useProfileQuery() {
  const { data: session } = useSession();

  return useQuery({
    queryKey: ["profile"],
    queryFn: async () => {
      const res = await axiosInstance.get("/users/profile");
      return res.data?.data ?? res.data;
    },
    retry: false,
    staleTime: 60_000,
    enabled: !!session, // Only fetch if user is logged in
    initialData: session?.user, // Use session data as initial data!
  });
}