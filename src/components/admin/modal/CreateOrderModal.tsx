import React, { useState, useEffect } from "react";
import { X, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { createOrder, getLaundryItems } from "@/services/order.service";

interface CreateOrderModalProps {
  isOpen: boolean;
  onClose: () => void;
  pickupId: string | null;
  onSuccess: () => void;
}

const CreateOrderModal: React.FC<CreateOrderModalProps> = ({
  isOpen,
  onClose,
  pickupId,
  onSuccess,
}) => {
  const [itemsMaster, setItemsMaster] = useState<any[]>([]);

  const [loading, setLoading] = useState(false);
  const [serviceType, setServiceType] = useState<"REGULAR" | "PREMIUM">(
    "REGULAR",
  );
  const [weight, setWeight] = useState<string>("");

  const [orderItems, setOrderItems] = useState<
    { itemId: string; qty: string }[]
  >([{ itemId: "", qty: "1" }]);

  useEffect(() => {
    if (isOpen) {
      getLaundryItems()
        .then((res: any) => {
          const items = Array.isArray(res) ? res : res.data || [];
          setItemsMaster(items);
        })
        .catch((err) => console.error("Gagal load item", err));

      setWeight("");
      setServiceType("REGULAR");
      setOrderItems([{ itemId: "", qty: "1" }]);
    }
  }, [isOpen]);

  const addField = () => {
    setOrderItems([...orderItems, { itemId: "", qty: "1" }]);
  };

  const removeField = (index: number) => {
    const newItems = [...orderItems];
    newItems.splice(index, 1);
    setOrderItems(newItems);
  };

  const handleItemChange = (
    index: number,
    field: "itemId" | "qty",
    value: string,
  ) => {
    const newItems = [...orderItems];
    newItems[index] = { ...newItems[index], [field]: value };
    setOrderItems(newItems);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!pickupId) return toast.error("Pickup ID tidak ditemukan!");

    setLoading(true);
    try {
      const payload = {
        pickupRequestId: pickupId,
        serviceType,
        totalWeightKg: parseFloat(weight),
        deliveryFee: 0, //nanti bisa diisi berdasarkan ongkir
        items: orderItems.map((item) => ({
          itemId: parseInt(item.itemId),
          qty: parseInt(item.qty),
        })),
      };

      if (payload.items.some((i) => isNaN(i.itemId) || isNaN(i.qty))) {
        throw new Error("Mohon lengkapi semua data item!");
      }

      await createOrder(payload);

      toast.success("Order berhasil dibuat!");
      onSuccess();
      onClose();
    } catch (error: any) {
      toast.error(error.response?.data?.error || "Gagal membuat order");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-lg rounded-2xl p-6 relative animate-in fade-in zoom-in duration-200 max-h-[90vh] overflow-y-auto">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
        >
          <X size={24} />
        </button>
        <h2 className="text-xl font-bold text-gray-800 mb-1">Create Order</h2>
        <p className="text-sm text-gray-500 mb-6">
          Processing Pickup #{pickupId}
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">
                Layanan
              </label>
              <select
                value={serviceType}
                onChange={(e) => setServiceType(e.target.value as any)}
                className="w-full border border-gray-300 rounded-lg p-2.5 bg-white focus:ring-2 focus:ring-blue-100 outline-none"
              >
                <option value="REGULAR">Regular</option>
                <option value="PREMIUM">Premium (+20%)</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">
                Berat (Kg) <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  type="number"
                  step="0.1"
                  value={weight}
                  onChange={(e) => setWeight(e.target.value)}
                  required
                  className="w-full pl-4 pr-10 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-100 outline-none"
                  placeholder="0.0"
                />
                <span className="absolute right-3 top-2.5 text-gray-400 text-sm">
                  Kg
                </span>
              </div>
            </div>
          </div>

          <div className="border border-gray-200 rounded-lg p-4 bg-gray-50">
            <label className="block text-sm font-semibold text-gray-700 mb-3">
              Detail Item <span className="text-red-500">*</span>
            </label>

            <div className="space-y-3 max-h-60 overflow-y-auto pr-1">
              {orderItems.map((item, index) => (
                <div key={index} className="flex gap-2 items-end">
                  <div className="flex-1">
                    <select
                      value={item.itemId}
                      onChange={(e) =>
                        handleItemChange(index, "itemId", e.target.value)
                      }
                      required
                      className="w-full text-sm border border-gray-300 rounded-md p-2 bg-white"
                    >
                      <option value="">- Pilih Item -</option>
                      {itemsMaster.map((opt) => (
                        <option key={opt.id} value={opt.id}>
                          {opt.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="w-20">
                    <input
                      type="number"
                      min="1"
                      value={item.qty}
                      onChange={(e) =>
                        handleItemChange(index, "qty", e.target.value)
                      }
                      required
                      placeholder="Qty"
                      className="w-full text-sm text-center border border-gray-300 rounded-md p-2"
                    />
                  </div>

                  {orderItems.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeField(index)}
                      className="p-2 text-red-500 hover:bg-red-50 rounded-md transition-colors"
                    >
                      <Trash2 size={18} />
                    </button>
                  )}
                </div>
              ))}
            </div>

            <button
              type="button"
              onClick={addField}
              className="mt-3 text-sm text-[#17A2B8] font-medium flex items-center gap-1 hover:underline"
            >
              <Plus size={16} /> Tambah Item Lain
            </button>
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#17A2B8] text-white font-bold py-3 rounded-xl hover:bg-[#138496] transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
            >
              {loading ? "Memproses..." : "Create Order"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateOrderModal;
