import OrderCard from "@/components/admin/card/OrderCard";
import { BottomNav } from "@/components/BottomNav";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Bell,
  CheckCircle2,
  ChevronRight,
  Clock,
  Package,
  Truck,
} from "lucide-react";
import { useAttendance } from "../../contexts/AttendanceContext";
import { useAuth } from "../../contexts/AuthContext";
import { useOrders } from "../../contexts/OrderContext";
import Link from "next/link";

export function DriverDashboard() {
  const { user } = useAuth();
  const { orders, getOrdersByStatus } = useOrders();
  const { isUserCheckedIn } = useAttendance();

  const pickupOrders = getOrdersByStatus(["WAITING_DRIVER_PICKUP"]);
  const deliveryOrders = getOrdersByStatus(["READY_TO_DELIVER"]);
  const myActiveOrder = orders.find(
    (o) =>
      o.driverName &&
      (o.status === "ON_THE_WAY_TO_OUTLET" ||
        o.status === "DELIVERING_TO_CUSTOMER"),
  );

  const outletStaffId = user?.outletStaffId;
  const isChecked = outletStaffId ? isUserCheckedIn(outletStaffId) : false;
  const displayName = user?.profile?.fullName || "Driver";

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Header */}
      <header className="gradient-hero text-primary-foreground p-4 pt-6 pb-8 rounded-b-3xl">
        <div className="flex items-center justify-between mb-4">
          <div>
            <p className="text-primary-foreground/80 text-sm">Good morning,</p>
            <h1 className="text-xl font-display font-bold">{displayName}</h1>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="text-primary-foreground"
          >
            <Bell className="h-5 w-5" />
          </Button>
        </div>

        <div className="grid grid-cols-3 gap-3">
          <div className="bg-primary-foreground/10 backdrop-blur-sm rounded-xl p-3 text-center">
            <Truck className="h-5 w-5 mx-auto mb-1" />
            <p className="text-lg font-bold">{pickupOrders.length}</p>
            <p className="text-xs text-primary-foreground/80">Pickups</p>
          </div>
          <div className="bg-primary-foreground/10 backdrop-blur-sm rounded-xl p-3 text-center">
            <Package className="h-5 w-5 mx-auto mb-1" />
            <p className="text-lg font-bold">{deliveryOrders.length}</p>
            <p className="text-xs text-primary-foreground/80">Deliveries</p>
          </div>
          <div className="bg-primary-foreground/10 backdrop-blur-sm rounded-xl p-3 text-center">
            <CheckCircle2 className="h-5 w-5 mx-auto mb-1" />
            <p className="text-lg font-bold">12</p>
            <p className="text-xs text-primary-foreground/80">Completed</p>
          </div>
        </div>
      </header>

      <div className="p-4 space-y-4 -mt-4">
        {/* Active Order */}
        {myActiveOrder && (
          <Card className="border-2 border-accent shadow-card">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-accent">
                <div className="w-2 h-2 rounded-full bg-accent animate-pulse" />
                Active Order
              </CardTitle>
            </CardHeader>
            <CardContent>
              <OrderCard order={myActiveOrder} showItems />
              <Link href={`/driver/order/${myActiveOrder.id}`}>
                <Button className="w-full mt-3 gradient-accent">
                  Continue Order
                  <ChevronRight className="h-4 w-4 ml-1" />
                </Button>
              </Link>
            </CardContent>
          </Card>
        )}

        {/* Available Pickups */}
        {!myActiveOrder && isChecked && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="font-display font-semibold">Available Pickups</h2>
              <Link
                href="/driver/pickups"
                className="text-sm text-primary font-medium"
              >
                View All
              </Link>
            </div>

            {pickupOrders.length > 0 ? (
              <div className="space-y-3">
                {pickupOrders.slice(0, 3).map((order) => (
                  <OrderCard key={order.id} order={order} onClick={() => {}} />
                ))}
              </div>
            ) : (
              <Card className="shadow-card">
                <CardContent className="py-8 text-center">
                  <Clock className="h-12 w-12 mx-auto text-muted-foreground/50 mb-3" />
                  <p className="text-muted-foreground">
                    No pickup requests available
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        )}

        {/* Not Checked In Warning */}
        {!isChecked && (
          <Card className="bg-status-warning/10 border-status-warning/20">
            <CardContent className="py-4 text-center">
              <p className="text-status-warning font-medium">
                Check in to start accepting orders
              </p>
            </CardContent>
          </Card>
        )}
      </div>

      <BottomNav />
    </div>
  );
}
