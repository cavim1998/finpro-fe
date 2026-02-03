import { useAuth } from "@/contexts/AuthContext";
import { useOrders } from "@/contexts/OrderContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { BypassRequest, StationType } from "@/types/index";
import { format } from "date-fns";
import {
  AlertTriangle,
  ArrowLeft,
  CheckCircle2,
  Clock,
  XCircle,
} from "lucide-react";
import { useState } from "react";
import { BottomNav } from "../BottomNav";
import Link from "next/link";

// Extended bypass request with display info
interface ExtendedBypassRequest extends BypassRequest {
  workerName?: string;
  station?: StationType;
  expectedItems?: { id: number; name: string; qty: number }[];
  actualItems?: { id: number; name: string; qty: number }[];
}

export function AdminBypass() {
  const { user } = useAuth();
  const { bypassRequests, resolveBypassRequest } = useOrders();
  const { toast } = useToast();
  const [explanations, setExplanations] = useState<Record<number, string>>({});
  const [activeRequest, setActiveRequest] = useState<number | null>(null);

  const pendingRequests = bypassRequests.filter(
    (r) => r.status === "REQUESTED",
  ) as ExtendedBypassRequest[];
  const resolvedRequests = bypassRequests.filter(
    (r) => r.status !== "REQUESTED",
  ) as ExtendedBypassRequest[];

  const handleResolve = (requestId: number, approved: boolean) => {
    if (!user) return;

    const explanation = explanations[requestId] || "";
    if (!explanation.trim()) {
      toast({
        title: "Explanation Required",
        description: "Please provide an explanation for your decision.",
        variant: "destructive",
      });
      return;
    }

    resolveBypassRequest(requestId, approved, user.id, explanation);
    toast({
      title: approved ? "Bypass Approved" : "Bypass Rejected",
      description: "Worker has been notified of your decision.",
    });
    setActiveRequest(null);
    setExplanations((prev) => {
      const next = { ...prev };
      delete next[requestId];
      return next;
    });
  };

  const RequestCard = ({
    request,
    showActions = false,
  }: {
    request: ExtendedBypassRequest;
    showActions?: boolean;
  }) => (
    <Card
      className={`shadow-card ${
        request.status === "REQUESTED"
          ? "border-status-warning"
          : request.status === "APPROVED"
            ? "border-status-success/50"
            : "border-destructive/50"
      }`}
    >
      <CardContent className="p-4 space-y-3">
        <div className="flex items-start justify-between">
          <div>
            <p className="font-semibold">Bypass Request #{request.id}</p>
            <p className="text-sm text-muted-foreground">
              {request.workerName || "Worker"}
            </p>
            <p className="text-xs text-muted-foreground capitalize">
              {request.station?.toLowerCase()} Station •{" "}
              {format(request.requestedAt, "MMM d, HH:mm")}
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

        <div className="grid grid-cols-2 gap-2 text-sm">
          <div className="p-2 bg-secondary rounded-lg">
            <p className="text-xs text-muted-foreground mb-1">Expected Items</p>
            {(request.expectedItems || []).map((item) => (
              <p key={item.id}>
                {item.name}: {item.qty}
              </p>
            ))}
          </div>
          <div className="p-2 bg-secondary rounded-lg">
            <p className="text-xs text-muted-foreground mb-1">Actual Items</p>
            {(request.actualItems || []).map((item) => (
              <p
                key={item.id}
                className={
                  item.qty !==
                  (request.expectedItems || []).find((e) => e.id === item.id)
                    ?.qty
                    ? "text-status-warning font-medium"
                    : ""
                }
              >
                {item.name}: {item.qty}
              </p>
            ))}
          </div>
        </div>

        {request.reason && (
          <div className="p-2 bg-muted rounded-lg">
            <p className="text-xs text-muted-foreground mb-1">
              Worker's Reason
            </p>
            <p className="text-sm">{request.reason}</p>
          </div>
        )}

        {showActions && request.status === "REQUESTED" && (
          <>
            {activeRequest === request.id ? (
              <div className="space-y-3 pt-2 border-t border-border">
                <div>
                  <Label htmlFor={`explanation-${request.id}`}>
                    Your Explanation
                  </Label>
                  <Textarea
                    id={`explanation-${request.id}`}
                    placeholder="Explain your decision..."
                    value={explanations[request.id] || ""}
                    onChange={(e) =>
                      setExplanations((prev) => ({
                        ...prev,
                        [request.id]: e.target.value,
                      }))
                    }
                    rows={2}
                    className="mt-1"
                  />
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1"
                    onClick={() => setActiveRequest(null)}
                  >
                    Cancel
                  </Button>
                  <Button
                    size="sm"
                    className="flex-1 bg-destructive text-destructive-foreground"
                    onClick={() => handleResolve(request.id, false)}
                  >
                    <XCircle className="h-4 w-4 mr-1" />
                    Reject
                  </Button>
                  <Button
                    size="sm"
                    className="flex-1 bg-status-success text-white"
                    onClick={() => handleResolve(request.id, true)}
                  >
                    <CheckCircle2 className="h-4 w-4 mr-1" />
                    Approve
                  </Button>
                </div>
              </div>
            ) : (
              <Button
                variant="outline"
                className="w-full"
                onClick={() => setActiveRequest(request.id)}
              >
                Review Request
              </Button>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );

  return (
    <div className="min-h-screen bg-background pb-20">
      <header className="bg-card border-b border-border p-4 sticky top-0 z-40">
        <div className="flex items-center gap-3">
          <Link href="/admin">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>

          <div>
            <h1 className="text-lg font-display font-semibold">
              Bypass Requests
            </h1>
            {pendingRequests.length > 0 && (
              <p className="text-xs text-status-warning">
                {pendingRequests.length} pending approval
              </p>
            )}
          </div>
        </div>
      </header>

      <div className="p-4 space-y-4">
        {/* Pending Requests */}
        {pendingRequests.length > 0 && (
          <div className="space-y-3">
            <h2 className="font-display font-semibold flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-status-warning" />
              Pending Approval
            </h2>
            {pendingRequests.map((request) => (
              <RequestCard key={request.id} request={request} showActions />
            ))}
          </div>
        )}

        {pendingRequests.length === 0 && (
          <Card className="border-status-success/50">
            <CardContent className="py-8 text-center">
              <CheckCircle2 className="h-12 w-12 mx-auto text-status-success mb-3" />
              <p className="font-medium text-status-success">All caught up!</p>
              <p className="text-sm text-muted-foreground">
                No pending bypass requests
              </p>
            </CardContent>
          </Card>
        )}

        {/* Resolved Requests */}
        {resolvedRequests.length > 0 && (
          <div className="space-y-3">
            <h2 className="font-display font-semibold flex items-center gap-2">
              <Clock className="h-4 w-4 text-muted-foreground" />
              History
            </h2>
            {resolvedRequests.slice(0, 5).map((request) => (
              <RequestCard key={request.id} request={request} />
            ))}
          </div>
        )}
      </div>

      <BottomNav />
    </div>
  );
}
