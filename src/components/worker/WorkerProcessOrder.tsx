import { BottomNav } from "@/components/BottomNav";
import { StatusBadge } from "@/components/StatusBadge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Order, OrderStatus, StationType } from "@/types";
import {
  AlertTriangle,
  ArrowLeft,
  CheckCircle2,
  Droplets,
  Flame,
  Minus,
  Package,
  Plus,
} from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import { useOrders } from "../../contexts/OrderContext";
import Link from "next/link";

// Extended order type for display
interface ExtendedOrder extends Order {
  customerName?: string;
  displayItems?: { id: number; name: string; qty: number }[];
}

const stationConfig: Record<
  StationType,
  {
    icon: React.ElementType;
    color: string;
    bgColor: string;
    label: string;
    nextStatus: OrderStatus;
  }
> = {
  WASHING: {
    icon: Droplets,
    color: "text-station-washing",
    bgColor: "bg-station-washing/10",
    label: "Washing",
    nextStatus: "IRONING",
  },
  IRONING: {
    icon: Flame,
    color: "text-station-ironing",
    bgColor: "bg-station-ironing/10",
    label: "Ironing",
    nextStatus: "PACKING",
  },
  PACKING: {
    icon: Package,
    color: "text-station-packing",
    bgColor: "bg-station-packing/10",
    label: "Packing",
    nextStatus: "WAITING_PAYMENT", // Will change to READY_TO_DELIVER if paid
  },
};

export function WorkerProcessOrder() {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { orders, updateOrderStatus, createBypassRequest, bypassRequests } =
    useOrders();
  const { toast } = useToast();

  const workerStation = user?.workerStation || "WASHING";
  const config = stationConfig[workerStation];
  const StationIcon = config.icon;

  const order = orders.find((o) => o.id === orderId) as
    | ExtendedOrder
    | undefined;
  const [itemCounts, setItemCounts] = useState<Record<number, number>>({});
  const [bypassReason, setBypassReason] = useState("");
  const [showBypassForm, setShowBypassForm] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  // Check if there's an approved bypass for this order
  const approvedBypass = bypassRequests.find(
    (r) => r.requestedByWorkerId === user?.id && r.status === "APPROVED",
  );
  const pendingBypass = bypassRequests.find(
    (r) => r.requestedByWorkerId === user?.id && r.status === "REQUESTED",
  );

  const displayName = user?.profile?.fullName || "Worker";

  useEffect(() => {
    if (order?.displayItems) {
      const counts: Record<number, number> = {};
      order.displayItems.forEach((item) => {
        counts[item.id] = 0;
      });
      setItemCounts(counts);
    }
  }, [order]);

  if (!order) {
    return (
      <div className="min-h-screen bg-background pb-20">
        <header className="bg-card border-b border-border p-4 sticky top-0 z-40">
          <div className="flex items-center gap-3">
            <Link href="/worker/orders">
              <Button variant="ghost" size="icon">
                <ArrowLeft className="h-5 w-5" />
              </Button>
            </Link>
            <h1 className="text-lg font-display font-semibold">
              Order Not Found
            </h1>
          </div>
        </header>
        <BottomNav />
      </div>
    );
  }

  const items = order.displayItems || [];

  const adjustCount = (itemId: number, delta: number) => {
    setItemCounts((prev) => ({
      ...prev,
      [itemId]: Math.max(0, (prev[itemId] || 0) + delta),
    }));
  };

  const itemsMatch = items.every((item) => itemCounts[item.id] === item.qty);

  const allItemsEntered = items.every(
    (item) => itemCounts[item.id] !== undefined && itemCounts[item.id] > 0,
  );

  const handleStartProcessing = () => {
    if (!user) return;

    const statusMap: Record<StationType, OrderStatus> = {
      WASHING: "WASHING",
      IRONING: "IRONING",
      PACKING: "PACKING",
    };

    updateOrderStatus(orderId!, statusMap[workerStation], user.id);
    setIsProcessing(true);
    toast({
      title: "Processing Started",
      description: `Order is now at ${config.label} station.`,
    });
  };

  const handleComplete = () => {
    if (!user) return;

    // For packing station, check if paid
    let nextStatus = config.nextStatus;
    if (workerStation === "PACKING") {
      nextStatus = order.paidAt ? "READY_TO_DELIVER" : "WAITING_PAYMENT";
    }

    updateOrderStatus(orderId!, nextStatus);
    toast({
      title: "Order Completed",
      description: `Order moved to ${nextStatus === "WAITING_PAYMENT" ? "Awaiting Payment" : "next station"}.`,
    });
    navigate("/worker/orders");
  };

  const handleRequestBypass = () => {
    if (!user) return;

    const actualItems = items.map((item) => ({
      id: item.id,
      name: item.name,
      qty: itemCounts[item.id] || 0,
    }));

    createBypassRequest({
      orderStationId: 1, // Demo value
      requestedByWorkerId: user.id,
      workerName: displayName,
      station: workerStation,
      expectedItems: items,
      actualItems,
      reason: bypassReason,
    });

    toast({
      title: "Bypass Requested",
      description: "Waiting for admin approval.",
    });
    setShowBypassForm(false);
  };

  // Check if this worker has already started processing (simplified check)
  const hasStarted = isProcessing || order.status === workerStation;

  return (
    <div className="min-h-screen bg-background pb-20">
      <header className={`p-4 pt-6 pb-6 rounded-b-2xl ${config.bgColor}`}>
        <div className="flex items-center gap-3 mb-4">
          <Link href="/worker/orders">
            <Button variant="ghost" size="icon" className={config.color}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <div>
            <h1 className="text-lg font-display font-semibold">
              Process Order
            </h1>
            <p className="text-sm text-muted-foreground">
              {config.label} Station
            </p>
          </div>
        </div>

        <Card className="shadow-card">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <p className="font-semibold">
                Order #{order.orderNo || order.id.slice(-6)}
              </p>
              <StatusBadge status={order.status} size="sm" />
            </div>
            <p className="text-sm text-muted-foreground">
              {order.customerName || "Customer"}
            </p>
            {order.totalWeightKg > 0 && (
              <p className="text-sm text-muted-foreground mt-1">
                Total Weight: {order.totalWeightKg} kg
              </p>
            )}
          </CardContent>
        </Card>
      </header>

      <div className="p-4 space-y-4">
        {/* Pending Bypass Warning */}
        {pendingBypass && (
          <Card className="border-2 border-status-warning">
            <CardContent className="p-4 flex items-center gap-3">
              <AlertTriangle className="h-6 w-6 text-status-warning shrink-0" />
              <div>
                <p className="font-medium text-status-warning">
                  Bypass Request Pending
                </p>
                <p className="text-sm text-muted-foreground">
                  Waiting for admin approval to continue
                </p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Approved Bypass */}
        {approvedBypass && (
          <Card className="border-2 border-status-success">
            <CardContent className="p-4 flex items-center gap-3">
              <CheckCircle2 className="h-6 w-6 text-status-success shrink-0" />
              <div>
                <p className="font-medium text-status-success">
                  Bypass Approved
                </p>
                <p className="text-sm text-muted-foreground">
                  You may proceed with processing
                </p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Start Processing Button */}
        {!hasStarted && !pendingBypass && (
          <Button
            className="w-full gradient-primary h-12"
            onClick={handleStartProcessing}
          >
            <StationIcon className="h-5 w-5 mr-2" />
            Start Processing
          </Button>
        )}

        {/* Item Verification */}
        {(hasStarted || isProcessing) && !pendingBypass && (
          <>
            <Card className="shadow-card">
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <StationIcon className={`h-5 w-5 ${config.color}`} />
                  Verify Items
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  Enter the quantity of each item you're processing. Counts must
                  match the order.
                </p>

                {items.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center justify-between p-3 bg-secondary rounded-lg"
                  >
                    <div>
                      <p className="font-medium">{item.name}</p>
                      <p className="text-sm text-muted-foreground">
                        Expected: {item.qty}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => adjustCount(item.id, -1)}
                      >
                        <Minus className="h-4 w-4" />
                      </Button>
                      <span
                        className={`w-10 text-center font-semibold ${
                          itemCounts[item.id] === item.qty
                            ? "text-status-success"
                            : itemCounts[item.id] > 0
                              ? "text-status-warning"
                              : ""
                        }`}
                      >
                        {itemCounts[item.id] || 0}
                      </span>
                      <Button
                        variant="outline"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => adjustCount(item.id, 1)}
                      >
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}

                {/* Match Status */}
                {allItemsEntered && (
                  <div
                    className={`p-3 rounded-lg ${itemsMatch ? "bg-status-success/10" : "bg-status-warning/10"}`}
                  >
                    {itemsMatch ? (
                      <p className="text-status-success font-medium flex items-center gap-2">
                        <CheckCircle2 className="h-5 w-5" />
                        All items verified correctly
                      </p>
                    ) : (
                      <p className="text-status-warning font-medium flex items-center gap-2">
                        <AlertTriangle className="h-5 w-5" />
                        Item counts don't match - bypass required
                      </p>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Action Buttons */}
            {allItemsEntered && (
              <>
                {itemsMatch || approvedBypass ? (
                  <Button
                    className="w-full gradient-success h-12"
                    onClick={handleComplete}
                  >
                    <CheckCircle2 className="h-5 w-5 mr-2" />
                    Complete & Move to Next Station
                  </Button>
                ) : !showBypassForm ? (
                  <Button
                    variant="outline"
                    className="w-full h-12 border-status-warning text-status-warning"
                    onClick={() => setShowBypassForm(true)}
                  >
                    <AlertTriangle className="h-5 w-5 mr-2" />
                    Request Bypass from Admin
                  </Button>
                ) : (
                  <Card className="border-status-warning">
                    <CardContent className="p-4 space-y-3">
                      <Label htmlFor="reason">Reason for Discrepancy</Label>
                      <Textarea
                        id="reason"
                        placeholder="Explain why the item counts don't match..."
                        value={bypassReason}
                        onChange={(e) => setBypassReason(e.target.value)}
                        rows={3}
                      />
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          className="flex-1"
                          onClick={() => setShowBypassForm(false)}
                        >
                          Cancel
                        </Button>
                        <Button
                          className="flex-1 bg-status-warning text-white"
                          onClick={handleRequestBypass}
                          disabled={!bypassReason.trim()}
                        >
                          Submit Request
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </>
            )}
          </>
        )}
      </div>

      <BottomNav />
    </div>
  );
}
