import { BottomNav } from "@/components/BottomNav";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StationType } from "@/types";
import {
  AlertTriangle,
  Bell,
  CheckCircle2,
  ChevronRight,
  Clock,
  Droplets,
  Flame,
  Package,
} from "lucide-react";
import { useAttendance } from "../../contexts/AttendanceContext";
import { useAuth } from "../../contexts/AuthContext";
import { useOrders } from "../../contexts/OrderContext";
import Link from "next/link";

const stationConfig: Record<
  StationType,
  {
    icon: React.ElementType;
    color: string;
    bgColor: string;
    label: string;
    waitingStatus: string;
  }
> = {
  WASHING: {
    icon: Droplets,
    color: "text-station-washing",
    bgColor: "bg-station-washing/10",
    label: "Washing Station",
    waitingStatus: "ARRIVED_AT_OUTLET",
  },
  IRONING: {
    icon: Flame,
    color: "text-station-ironing",
    bgColor: "bg-station-ironing/10",
    label: "Ironing Station",
    waitingStatus: "WASHING",
  },
  PACKING: {
    icon: Package,
    color: "text-station-packing",
    bgColor: "bg-station-packing/10",
    label: "Packing Station",
    waitingStatus: "IRONING",
  },
};

export function WorkerDashboard() {
  const { user } = useAuth();
  const { orders, getOrdersByStation, bypassRequests } = useOrders();
  const { isUserCheckedIn } = useAttendance();

  const workerStation = user?.workerStation || "WASHING";
  const config = stationConfig[workerStation];
  const StationIcon = config.icon;

  const isChecked = user ? isUserCheckedIn(user.id) : false;
  const stationOrders = getOrdersByStation(workerStation);
  const pendingOrders = stationOrders.filter(
    (o) => o.status === config.waitingStatus,
  );
  const inProgressOrders = stationOrders.filter((o) => {
    if (workerStation === "WASHING") return o.status === "WASHING";
    if (workerStation === "IRONING") return o.status === "IRONING";
    return o.status === "PACKING";
  });

  const myBypassRequests = bypassRequests.filter(
    (r) => r.requestedByWorkerId === user?.id && r.status === "REQUESTED",
  );

  const displayName = user?.profile?.fullName || "Worker";

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Header */}
      <header className={`p-4 pt-6 pb-8 rounded-b-3xl ${config.bgColor}`}>
        <div className="flex items-center justify-between mb-4">
          <div>
            <p className="text-muted-foreground text-sm">Welcome back,</p>
            <h1 className="text-xl font-display font-bold">{displayName}</h1>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon">
              <Bell className="h-5 w-5" />
            </Button>
          </div>
        </div>

        <Card className="shadow-card">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div
                className={`w-12 h-12 rounded-xl ${config.bgColor} flex items-center justify-center`}
              >
                <StationIcon className={`h-6 w-6 ${config.color}`} />
              </div>
              <div>
                <p className="font-display font-semibold">{config.label}</p>
                <p className="text-sm text-muted-foreground">
                  {pendingOrders.length} orders waiting
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </header>

      <div className="p-4 space-y-4 -mt-4">
        {/* Pending Bypass Requests */}
        {myBypassRequests.length > 0 && (
          <Card className="border-2 border-status-warning shadow-card">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-status-warning text-base">
                <AlertTriangle className="h-5 w-5" />
                Pending Bypass Requests
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-3">
                {myBypassRequests.length} request(s) awaiting admin approval
              </p>
              <Link href="/worker/orders">
                <Button variant="outline" className="w-full">
                  View Details
                </Button>
              </Link>
              
            </CardContent>
          </Card>
        )}

        {/* Stats */}
        <div className="grid grid-cols-3 gap-3">
          <Card className="shadow-card">
            <CardContent className="p-3 text-center">
              <Clock className={`h-5 w-5 mx-auto mb-1 ${config.color}`} />
              <p className="text-lg font-bold">{pendingOrders.length}</p>
              <p className="text-[10px] text-muted-foreground">Waiting</p>
            </CardContent>
          </Card>
          <Card className="shadow-card">
            <CardContent className="p-3 text-center">
              <StationIcon className={`h-5 w-5 mx-auto mb-1 ${config.color}`} />
              <p className="text-lg font-bold">{inProgressOrders.length}</p>
              <p className="text-[10px] text-muted-foreground">In Progress</p>
            </CardContent>
          </Card>
          <Card className="shadow-card">
            <CardContent className="p-3 text-center">
              <CheckCircle2 className="h-5 w-5 mx-auto mb-1 text-status-success" />
              <p className="text-lg font-bold">24</p>
              <p className="text-[10px] text-muted-foreground">Completed</p>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        {isChecked ? (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="font-display font-semibold">Pending Orders</h2>
              <Link
                href="/worker/orders"
                className="text-sm text-primary font-medium"
              >
                View All
              </Link>
            </div>

            {pendingOrders.length > 0 ? (
              <div className="space-y-2">
                {pendingOrders.slice(0, 3).map((order) => (
                  <Card key={order.id} className="shadow-card">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium">
                            Order #{order.orderNo || order.id.slice(-6)}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {order.displayItems?.length || 0} items •{" "}
                            {order.totalWeightKg || "?"} kg
                          </p>
                        </div>
                        <Link href={`/worker/process/${order.id}`}>
                          <Button
                            size="sm"
                            className={config.bgColor + " " + config.color}
                          >
                            Process
                            <ChevronRight className="h-4 w-4 ml-1" />
                          </Button>
                        </Link>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <Card className="shadow-card">
                <CardContent className="py-8 text-center">
                  <CheckCircle2 className="h-12 w-12 mx-auto text-muted-foreground/50 mb-3" />
                  <p className="text-muted-foreground">
                    No orders waiting at your station
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        ) : (
          <Card className="bg-status-warning/10 border-status-warning/20">
            <CardContent className="py-4 text-center">
              <p className="text-status-warning font-medium">
                Check in to start processing orders
              </p>
            </CardContent>
          </Card>
        )}
      </div>

      <BottomNav />
    </div>
  );
}
