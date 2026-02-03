import OrderCard from "@/components/admin/card/OrderCard";
import { BottomNav } from "@/components/BottomNav";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, CheckCircle2, Clock, Package, Truck } from "lucide-react";
import { useState } from "react";
import { useAttendance } from "../../contexts/AttendanceContext";
import { useAuth } from "../../contexts/AuthContext";
import { useOrders } from "../../contexts/OrderContext";
import Link from "next/link";

export function DriverPickups() {
  const { user } = useAuth();
  const { orders, getOrdersByStatus, assignDriver } = useOrders();
  const { isUserCheckedIn } = useAttendance();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("pickups");

  const outletStaffId = user?.outletStaffId;
  const isChecked = outletStaffId ? isUserCheckedIn(outletStaffId) : false;
  const pickupOrders = getOrdersByStatus(["WAITING_DRIVER_PICKUP"]);
  const deliveryOrders = getOrdersByStatus(["READY_TO_DELIVER"]);

  const hasActiveOrder = orders.some(
    (o) =>
      o.driverName &&
      (o.status === "ON_THE_WAY_TO_OUTLET" ||
        o.status === "DELIVERING_TO_CUSTOMER"),
  );

  const displayName = user?.profile?.fullName || "Driver";

  const handleTakeOrder = (orderId: string, isDelivery: boolean) => {
    if (!user) return;

    if (hasActiveOrder) {
      toast({
        title: "Active Order Exists",
        description: "Complete your current order before taking a new one.",
        variant: "destructive",
      });
      return;
    }

    assignDriver(orderId, user.id, displayName);
    toast({
      title: isDelivery ? "Delivery Assigned" : "Pickup Assigned",
      description: "You have successfully taken this order.",
    });
  };

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Header */}
      <header className="bg-card border-b border-border p-4 sticky top-0 z-40">
        <div className="flex items-center gap-3">
          <Link href="/driver">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <h1 className="text-lg font-display font-semibold">
            Pickup & Delivery
          </h1>
        </div>
      </header>

      <div className="p-4">
        {!isChecked ? (
          <Card className="bg-status-warning/10 border-status-warning/20">
            <CardContent className="py-8 text-center">
              <Clock className="h-12 w-12 mx-auto text-status-warning mb-3" />
              <p className="text-status-warning font-medium mb-2">
                You're not checked in
              </p>
              <p className="text-sm text-muted-foreground">
                Go to dashboard and check in to view orders
              </p>
              <Link href="/driver">
                <Button variant="outline" className="mt-4">
                  Go to Dashboard
                </Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-2 mb-4">
              <TabsTrigger value="pickups" className="gap-2">
                <Truck className="h-4 w-4" />
                Pickups ({pickupOrders.length})
              </TabsTrigger>
              <TabsTrigger value="deliveries" className="gap-2">
                <Package className="h-4 w-4" />
                Deliveries ({deliveryOrders.length})
              </TabsTrigger>
            </TabsList>

            <TabsContent value="pickups" className="space-y-3">
              {hasActiveOrder && (
                <Card className="bg-status-warning/10 border-status-warning/20">
                  <CardContent className="py-3 text-center text-sm text-status-warning">
                    Complete your active order to take new pickups
                  </CardContent>
                </Card>
              )}

              {pickupOrders.length > 0 ? (
                pickupOrders.map((order) => (
                  <div key={order.id} className="space-y-2">
                    <OrderCard order={order} showItems />
                    <Button
                      className="w-full gradient-primary"
                      onClick={() => handleTakeOrder(order.id, false)}
                      disabled={hasActiveOrder}
                    >
                      <Truck className="h-4 w-4 mr-2" />
                      Take Pickup
                    </Button>
                  </div>
                ))
              ) : (
                <Card>
                  <CardContent className="py-12 text-center">
                    <CheckCircle2 className="h-12 w-12 mx-auto text-muted-foreground/50 mb-3" />
                    <p className="text-muted-foreground">
                      No pickup requests available
                    </p>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            <TabsContent value="deliveries" className="space-y-3">
              {hasActiveOrder && (
                <Card className="bg-status-warning/10 border-status-warning/20">
                  <CardContent className="py-3 text-center text-sm text-status-warning">
                    Complete your active order to take new deliveries
                  </CardContent>
                </Card>
              )}

              {deliveryOrders.length > 0 ? (
                deliveryOrders.map((order) => (
                  <div key={order.id} className="space-y-2">
                    <OrderCard order={order} showItems />
                    <Button
                      className="w-full gradient-accent"
                      onClick={() => handleTakeOrder(order.id, true)}
                      disabled={hasActiveOrder}
                    >
                      <Package className="h-4 w-4 mr-2" />
                      Take Delivery
                    </Button>
                  </div>
                ))
              ) : (
                <Card>
                  <CardContent className="py-12 text-center">
                    <Package className="h-12 w-12 mx-auto text-muted-foreground/50 mb-3" />
                    <p className="text-muted-foreground">No deliveries ready</p>
                  </CardContent>
                </Card>
              )}
            </TabsContent>
          </Tabs>
        )}
      </div>

      <BottomNav />
    </div>
  );
}
