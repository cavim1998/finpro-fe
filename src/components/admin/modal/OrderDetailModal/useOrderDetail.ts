import { useState, useEffect } from "react";
import { getAdminOrderById } from "@/services/order.service";
import { toast } from "sonner";

export const useOrderDetail = (orderId: string | null, isOpen: boolean) => {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!orderId || !isOpen) return;
    const fetchData = async () => {
      setLoading(true);
      try {
        const res = await getAdminOrderById(orderId);
        setData(res.data);
      } catch (error) {
        toast.error("Gagal mengambil detail pesanan");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [orderId, isOpen]);

  return { data, loading };
};
