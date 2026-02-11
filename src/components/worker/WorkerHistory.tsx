// import { BottomNav } from "@/components/BottomNav";
// import { StatusBadge } from "@/components/StatusBadge";
// import { Button } from "@/components/ui/button";
// import { Card, CardContent } from "@/components/ui/card";
// import { Order, OrderStatus, StationType } from "@/types";
// import { format } from "date-fns";
// import { ArrowLeft, CheckCircle2, Clock } from "lucide-react";
// import { useAuth } from "../../contexts/AuthContext";
// import { useOrders } from "../../contexts/OrderContext";
// import Link from "next/link";

// // Extended order type for display
// interface ExtendedOrder extends Order {
//   customerName?: string;
//   displayItems?: { id: number; name: string; qty: number }[];
// }

// export function WorkerHistory() {
//   const { user } = useAuth();
//   const { orders } = useOrders();

//   const workerStation = user?.workerStation || "WASHING";

//   // Get orders this worker has processed (simplified - all orders past this station)
//   const completedStatuses: Record<StationType, OrderStatus[]> = {
//     WASHING: [
//       "IRONING",
//       "PACKING",
//       "WAITING_PAYMENT",
//       "READY_TO_DELIVER",
//       "DELIVERING_TO_CUSTOMER",
//       "RECEIVED_BY_CUSTOMER",
//     ],
//     IRONING: [
//       "PACKING",
//       "WAITING_PAYMENT",
//       "READY_TO_DELIVER",
//       "DELIVERING_TO_CUSTOMER",
//       "RECEIVED_BY_CUSTOMER",
//     ],
//     PACKING: [
//       "WAITING_PAYMENT",
//       "READY_TO_DELIVER",
//       "DELIVERING_TO_CUSTOMER",
//       "RECEIVED_BY_CUSTOMER",
//     ],
//   };

//   const completedOrders = orders.filter((o) =>
//     completedStatuses[workerStation].includes(o.status),
//   ) as ExtendedOrder[];

//   return (
//     <div className="min-h-screen bg-background pb-20">
//       <header className="bg-card border-b border-border p-4 sticky top-0 z-40">
//         <div className="flex items-center gap-3">
//           <Link href="/worker">
//             <Button variant="ghost" size="icon">
//               <ArrowLeft className="h-5 w-5" />
//             </Button>
//           </Link>
//           <h1 className="text-lg font-display font-semibold">Job History</h1>
//         </div>
//       </header>

//       <div className="p-4">
//         {/* Stats */}
//         <div className="grid grid-cols-2 gap-3 mb-6">
//           <Card className="shadow-card">
//             <CardContent className="p-4 text-center">
//               <CheckCircle2 className="h-6 w-6 mx-auto mb-2 text-status-success" />
//               <p className="text-2xl font-bold">{completedOrders.length}</p>
//               <p className="text-xs text-muted-foreground">Orders Processed</p>
//             </CardContent>
//           </Card>
//           <Card className="shadow-card">
//             <CardContent className="p-4 text-center">
//               <Clock className="h-6 w-6 mx-auto mb-2 text-primary" />
//               <p className="text-2xl font-bold">4.2h</p>
//               <p className="text-xs text-muted-foreground">Avg. Time/Order</p>
//             </CardContent>
//           </Card>
//         </div>

//         {/* History List */}
//         <h2 className="font-display font-semibold mb-3">Recent Jobs</h2>

//         {completedOrders.length > 0 ? (
//           <div className="space-y-3">
//             {completedOrders.map((order) => (
//               <Card key={order.id} className="shadow-card">
//                 <CardContent className="p-4">
//                   <div className="flex items-start justify-between mb-2">
//                     <div>
//                       <p className="font-semibold">
//                         Order #{order.orderNo || order.id.slice(-6)}
//                       </p>
//                       <p className="text-sm text-muted-foreground">
//                         {order.customerName || "Customer"}
//                       </p>
//                     </div>
//                     <StatusBadge status={order.status} size="sm" />
//                   </div>
//                   <div className="flex flex-wrap gap-1.5 mb-2">
//                     {(order.displayItems || []).slice(0, 3).map((item) => (
//                       <span
//                         key={item.id}
//                         className="text-xs bg-secondary px-2 py-0.5 rounded-full"
//                       >
//                         {item.name} ({item.qty})
//                       </span>
//                     ))}
//                     {(order.displayItems || []).length > 3 && (
//                       <span className="text-xs bg-secondary px-2 py-0.5 rounded-full">
//                         +{(order.displayItems || []).length - 3} more
//                       </span>
//                     )}
//                   </div>
//                   <p className="text-xs text-muted-foreground">
//                     Processed: {format(order.updatedAt, "MMM d, yyyy HH:mm")}
//                   </p>
//                 </CardContent>
//               </Card>
//             ))}
//           </div>
//         ) : (
//           <Card>
//             <CardContent className="py-12 text-center">
//               <Clock className="h-12 w-12 mx-auto text-muted-foreground/50 mb-3" />
//               <p className="text-muted-foreground">No completed orders yet</p>
//               <p className="text-sm text-muted-foreground mt-1">
//                 Your job history will appear here
//               </p>
//             </CardContent>
//           </Card>
//         )}
//       </div>

//       <BottomNav />
//     </div>
//   );
// }
