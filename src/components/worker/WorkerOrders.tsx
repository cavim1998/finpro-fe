import { BottomNav } from "@/components/BottomNav";
import { StatusBadge } from "@/components/StatusBadge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Order, OrderStatus, StationType } from "@/types";
import {
  AlertTriangle,
  ArrowLeft,
  Clock,
  Droplets,
  Flame,
  Package,
} from "lucide-react";
import { useState } from "react";
import { useAttendance } from "../../contexts/AttendanceContext";
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
    waitingStatus: OrderStatus;
    processingStatus: OrderStatus;
  }
> = {
  WASHING: {
    icon: Droplets,
    color: "text-station-washing",
    bgColor: "bg-station-washing/10",
    label: "Washing",
    waitingStatus: "ARRIVED_AT_OUTLET",
    processingStatus: "WASHING",
  },
  IRONING: {
    icon: Flame,
    color: "text-station-ironing",
    bgColor: "bg-station-ironing/10",
    label: "Ironing",
    waitingStatus: "WASHING",
    processingStatus: "IRONING",
  },
  PACKING: {
    icon: Package,
    color: "text-station-packing",
    bgColor: "bg-station-packing/10",
    label: "Packing",
    waitingStatus: "IRONING",
    processingStatus: "PACKING",
  },
};

export function WorkerOrders() {
  const { user } = useAuth();
  const { orders, bypassRequests } = useOrders();
  const { isUserCheckedIn } = useAttendance();
  const [activeTab, setActiveTab] = useState("pending");

  const workerStation = user?.workerStation || "WASHING";
  const config = stationConfig[workerStation];
  const StationIcon = config.icon;
  const isChecked = user ? isUserCheckedIn(user.id) : false;

  // Get orders for this station
  const pendingOrders = orders.filter(
    (o) => o.status === config.waitingStatus,
  ) as ExtendedOrder[];
  const inProgressOrders = orders.filter(
    (o) => o.status === config.processingStatus,
  ) as ExtendedOrder[];

  const myBypassRequests = bypassRequests.filter(
    (r) => r.requestedByWorkerId === user?.id,
  );

  const OrderItem = ({
    order,
    showProcess = true,
  }: {
    order: ExtendedOrder;
    showProcess?: boolean;
  }) => (
    <Card className="shadow-card">
      <CardContent className="p-4">
        <div className="flex items-start justify-between mb-3">
          <div>
            <p className="font-semibold">
              Order #{order.orderNo || order.id.slice(-6)}
            </p>
            <p className="text-sm text-muted-foreground">
              {order.customerName || "Customer"}
            </p>
          </div>
          <StatusBadge status={order.status} size="sm" />
        </div>

        <div className="flex flex-wrap gap-1.5 mb-3">
          {(order.displayItems || []).map((item) => (
            <span
              key={item.id}
              className="text-xs bg-secondary px-2 py-0.5 rounded-full"
            >
              {item.name} ({item.qty})
            </span>
          ))}
        </div>

        <div className="flex items-center justify-between pt-2 border-t border-border">
          <span className="text-sm text-muted-foreground">
            {order.totalWeightKg
              ? `${order.totalWeightKg} kg`
              : "Weight pending"}
          </span>
          {showProcess && (
            <Link href={`/worker/process/${order.id}`}>
              <Button size="sm" className={`${config.bgColor} ${config.color}`}>
                <StationIcon className="h-4 w-4 mr-1" />
                Process
              </Button>
            </Link>
          )}
        </div>
      </CardContent>
    </Card>
  );

  if (!isChecked) {
    return (
      <div className="min-h-screen bg-background pb-20">
        <header className="bg-card border-b border-border p-4 sticky top-0 z-40">
          <div className="flex items-center gap-3">
            <Link href="/worker">
              <Button variant="ghost" size="icon">
                <ArrowLeft className="h-5 w-5" />
              </Button>
            </Link>
            <h1 className="text-lg font-display font-semibold">Orders</h1>
          </div>
        </header>
        <div className="p-4">
          <Card className="bg-status-warning/10 border-status-warning/20">
            <CardContent className="py-8 text-center">
              <Clock className="h-12 w-12 mx-auto text-status-warning mb-3" />
              <p className="text-status-warning font-medium mb-2">
                Not Checked In
              </p>
              <p className="text-sm text-muted-foreground mb-4">
                Check in to view and process orders
              </p>
              <Link href="/worker">
                <Button variant="outline">Go to Dashboard</Button>
              </Link>
            </CardContent>
          </Card>
        </div>
        <BottomNav />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-20">
      <header className="bg-card border-b border-border p-4 sticky top-0 z-40">
        <div className="flex items-center gap-3">
          <Link href="/worker">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <div>
            <h1 className="text-lg font-display font-semibold">Orders</h1>
            <p className="text-xs text-muted-foreground">
              {config.label} Station
            </p>
          </div>
        </div>
      </header>

      <div className="p-4">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-3 mb-4">
            <TabsTrigger value="pending" className="gap-1 text-xs">
              <Clock className="h-3 w-3" />
              Pending ({pendingOrders.length})
            </TabsTrigger>
            <TabsTrigger value="progress" className="gap-1 text-xs">
              <StationIcon className="h-3 w-3" />
              In Progress ({inProgressOrders.length})
            </TabsTrigger>
            <TabsTrigger value="bypass" className="gap-1 text-xs">
              <AlertTriangle className="h-3 w-3" />
              Bypass (
              {myBypassRequests.filter((r) => r.status === "REQUESTED").length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="pending" className="space-y-3">
            {pendingOrders.length > 0 ? (
              pendingOrders.map((order) => (
                <OrderItem key={order.id} order={order} />
              ))
            ) : (
              <Card>
                <CardContent className="py-12 text-center">
                  <StationIcon className="h-12 w-12 mx-auto text-muted-foreground/50 mb-3" />
                  <p className="text-muted-foreground">No orders waiting</p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="progress" className="space-y-3">
            {inProgressOrders.length > 0 ? (
              inProgressOrders.map((order) => (
                <OrderItem key={order.id} order={order} showProcess />
              ))
            ) : (
              <Card>
                <CardContent className="py-12 text-center">
                  <StationIcon className="h-12 w-12 mx-auto text-muted-foreground/50 mb-3" />
                  <p className="text-muted-foreground">No orders in progress</p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="bypass" className="space-y-3">
            {myBypassRequests.length > 0 ? (
              myBypassRequests.map((request) => (
                <Card
                  key={request.id}
                  className={`shadow-card ${request.status === "REQUESTED" ? "border-status-warning" : request.status === "APPROVED" ? "border-status-success" : "border-destructive"}`}
                >
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <p className="font-semibold">
                          Bypass Request #{request.id}
                        </p>
                        <p className="text-sm text-muted-foreground capitalize">
                          {request.station} Station
                        </p>
                      </div>
                      <span
                        className={`text-xs px-2 py-1 rounded-full font-medium ${
                          request.status === "REQUESTED"
                            ? "bg-status-warning/10 text-status-warning"
                            : request.status === "APPROVED"
                              ? "bg-status-success/10 text-status-success"
                              : "bg-destructive/10 text-destructive"
                        }`}
                      >
                        {request.status}
                      </span>
                    </div>

                    <div className="text-sm space-y-1 mb-2">
                      <p className="text-muted-foreground">
                        Expected:{" "}
                        {(request.expectedItems || [])
                          .map((i) => `${i.name}(${i.qty})`)
                          .join(", ")}
                      </p>
                      <p className="text-muted-foreground">
                        Actual:{" "}
                        {(request.actualItems || [])
                          .map((i) => `${i.name}(${i.qty})`)
                          .join(", ")}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : (
              <Card>
                <CardContent className="py-12 text-center">
                  <AlertTriangle className="h-12 w-12 mx-auto text-muted-foreground/50 mb-3" />
                  <p className="text-muted-foreground">No bypass requests</p>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </div>

      <BottomNav />
    </div>
  );
}
