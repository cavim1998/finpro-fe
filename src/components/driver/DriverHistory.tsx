import OrderCard from "@/components/admin/card/OrderCard";
import { BottomNav } from "@/components/BottomNav";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowLeft, Clock, Package, Truck } from "lucide-react";
import { useAuth } from "../../contexts/AuthContext";
import { useOrders } from "../../contexts/OrderContext";
import Link from "next/link";

export function DriverHistory() {
  const { user } = useAuth();
  const { orders } = useOrders();

  // Get all orders this driver has handled
  const driverOrders = orders.filter((o) => o.driverName);
  const completedOrders = driverOrders.filter(
    (o) =>
      o.status === "ARRIVED_AT_OUTLET" || o.status === "RECEIVED_BY_CUSTOMER",
  );

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
          <h1 className="text-lg font-display font-semibold">History</h1>
        </div>
      </header>

      <div className="p-4">
        {/* Stats */}
        <div className="grid grid-cols-2 gap-3 mb-6">
          <Card className="shadow-card">
            <CardContent className="p-4 text-center">
              <Truck className="h-6 w-6 mx-auto mb-2 text-primary" />
              <p className="text-2xl font-bold">
                {
                  driverOrders.filter((o) =>
                    [
                      "ARRIVED_AT_OUTLET",
                      "WASHING",
                      "IRONING",
                      "PACKING",
                      "WAITING_PAYMENT",
                      "READY_TO_DELIVER",
                    ].includes(o.status),
                  ).length
                }
              </p>
              <p className="text-xs text-muted-foreground">Pickups Completed</p>
            </CardContent>
          </Card>
          <Card className="shadow-card">
            <CardContent className="p-4 text-center">
              <Package className="h-6 w-6 mx-auto mb-2 text-accent" />
              <p className="text-2xl font-bold">
                {
                  driverOrders.filter(
                    (o) => o.status === "RECEIVED_BY_CUSTOMER",
                  ).length
                }
              </p>
              <p className="text-xs text-muted-foreground">
                Deliveries Completed
              </p>
            </CardContent>
          </Card>
        </div>

        {/* History List */}
        <h2 className="font-display font-semibold mb-3">Recent Activity</h2>

        {completedOrders.length > 0 ? (
          <div className="space-y-3">
            {completedOrders.map((order) => (
              <OrderCard key={order.id} order={order} />
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="py-12 text-center">
              <Clock className="h-12 w-12 mx-auto text-muted-foreground/50 mb-3" />
              <p className="text-muted-foreground">No completed orders yet</p>
              <p className="text-sm text-muted-foreground mt-1">
                Your pickup and delivery history will appear here
              </p>
            </CardContent>
          </Card>
        )}
      </div>

      <BottomNav />
    </div>
  );
}
