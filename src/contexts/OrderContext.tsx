"use client";

import {
    BypassRequest,
    BypassStatus,
    Notification,
    Order,
    OrderStatus,
    StationType
} from "@/types/index";
import React, { createContext, useCallback, useContext, useState } from "react";

// Extended types for demo display
interface ExtendedOrder extends Order {
  customerName?: string;
  customerAddress?: string;
  customerPhone?: string;
  outletName?: string;
  driverName?: string;
  displayItems?: { id: number; name: string; qty: number }[];
}

interface ExtendedBypassRequest extends BypassRequest {
  workerName?: string;
  station?: StationType;
  expectedItems?: { id: number; name: string; qty: number }[];
  actualItems?: { id: number; name: string; qty: number }[];
}

interface OrderContextType {
  orders: ExtendedOrder[];
  bypassRequests: ExtendedBypassRequest[];
  notifications: Notification[];
  createOrder: (
    order: Omit<ExtendedOrder, "id" | "createdAt" | "updatedAt">,
  ) => ExtendedOrder;
  updateOrderStatus: (
    orderId: string,
    status: OrderStatus,
    workerId?: string,
  ) => void;
  updateOrderItems: (
    orderId: string,
    items: { id: number; name: string; qty: number }[],
    weight?: number,
  ) => void;
  assignDriver: (orderId: string, driverId: string, driverName: string) => void;
  createBypassRequest: (
    request: Omit<ExtendedBypassRequest, "id" | "requestedAt" | "status">,
  ) => void;
  resolveBypassRequest: (
    requestId: number,
    approved: boolean,
    adminId: string,
    explanation: string,
  ) => void;
  addNotification: (
    notification: Omit<Notification, "id" | "createdAt" | "isRead">,
  ) => void;
  markNotificationRead: (notificationId: number) => void;
  getOrdersByStatus: (statuses: OrderStatus[]) => ExtendedOrder[];
  getOrdersByDriver: (driverId: string) => ExtendedOrder[];
  getOrdersByStation: (station: StationType) => ExtendedOrder[];
}

const OrderContext = createContext<OrderContextType | undefined>(undefined);

// Demo orders
const initialOrders: ExtendedOrder[] = [
  {
    id: "order-1",
    orderNo: "ORD-001",
    pickupRequestId: "pickup-1",
    outletId: 1,
    customerId: "cust-1",
    createdByOutletAdminId: "admin-1",
    customerName: "John Customer",
    customerAddress: "123 Main St, Downtown",
    customerPhone: "+1 234 567 8900",
    outletName: "CleanWash Downtown",
    status: "WAITING_DRIVER_PICKUP",
    totalWeightKg: 0,
    subtotalAmount: 0,
    deliveryFee: 0,
    totalAmount: 0,
    displayItems: [
      { id: 1, name: "T-Shirt", qty: 5 },
      { id: 2, name: "Jeans", qty: 2 },
      { id: 3, name: "Underwear", qty: 8 },
    ],
    createdAt: new Date(Date.now() - 3600000),
    updatedAt: new Date(Date.now() - 3600000),
  },
  {
    id: "order-2",
    orderNo: "ORD-002",
    pickupRequestId: "pickup-2",
    outletId: 1,
    customerId: "cust-2",
    createdByOutletAdminId: "admin-1",
    customerName: "Sarah Smith",
    customerAddress: "456 Oak Ave, Midtown",
    customerPhone: "+1 234 567 8910",
    outletName: "CleanWash Downtown",
    status: "ARRIVED_AT_OUTLET",
    totalWeightKg: 3.5,
    subtotalAmount: 35.0,
    deliveryFee: 5.0,
    totalAmount: 40.0,
    displayItems: [
      { id: 4, name: "Dress", qty: 3 },
      { id: 5, name: "Blouse", qty: 4 },
      { id: 6, name: "Skirt", qty: 2 },
    ],
    driverName: "Mike Driver",
    createdAt: new Date(Date.now() - 7200000),
    updatedAt: new Date(Date.now() - 1800000),
  },
  {
    id: "order-3",
    orderNo: "ORD-003",
    pickupRequestId: "pickup-3",
    outletId: 1,
    customerId: "cust-3",
    createdByOutletAdminId: "admin-1",
    customerName: "Bob Johnson",
    customerAddress: "789 Pine Rd, Uptown",
    customerPhone: "+1 234 567 8920",
    outletName: "CleanWash Downtown",
    status: "WASHING",
    totalWeightKg: 4.2,
    subtotalAmount: 42.0,
    deliveryFee: 5.0,
    totalAmount: 47.0,
    displayItems: [
      { id: 7, name: "Shirt", qty: 6 },
      { id: 8, name: "Pants", qty: 4 },
      { id: 9, name: "Socks", qty: 10 },
    ],
    createdAt: new Date(Date.now() - 10800000),
    updatedAt: new Date(Date.now() - 900000),
  },
  {
    id: "order-4",
    orderNo: "ORD-004",
    pickupRequestId: "pickup-4",
    outletId: 1,
    customerId: "cust-4",
    createdByOutletAdminId: "admin-1",
    customerName: "Emily Davis",
    customerAddress: "321 Elm St, Suburb",
    customerPhone: "+1 234 567 8930",
    outletName: "CleanWash Downtown",
    status: "IRONING",
    totalWeightKg: 2.8,
    subtotalAmount: 56.0,
    deliveryFee: 5.0,
    totalAmount: 61.0,
    paidAt: new Date(),
    displayItems: [
      { id: 10, name: "Suit Jacket", qty: 2 },
      { id: 11, name: "Dress Pants", qty: 3 },
      { id: 12, name: "Tie", qty: 4 },
    ],
    createdAt: new Date(Date.now() - 14400000),
    updatedAt: new Date(Date.now() - 600000),
  },
  {
    id: "order-5",
    orderNo: "ORD-005",
    pickupRequestId: "pickup-5",
    outletId: 1,
    customerId: "cust-5",
    createdByOutletAdminId: "admin-1",
    customerName: "Michael Brown",
    customerAddress: "555 Cedar Lane, East Side",
    customerPhone: "+1 234 567 8940",
    outletName: "CleanWash Downtown",
    status: "READY_TO_DELIVER",
    totalWeightKg: 5.0,
    subtotalAmount: 45.0,
    deliveryFee: 5.0,
    totalAmount: 50.0,
    paidAt: new Date(),
    displayItems: [
      { id: 13, name: "Bedsheet", qty: 2 },
      { id: 14, name: "Pillowcase", qty: 4 },
      { id: 15, name: "Blanket", qty: 1 },
    ],
    createdAt: new Date(Date.now() - 18000000),
    updatedAt: new Date(Date.now() - 300000),
  },
];

export function OrderProvider({ children }: { children: React.ReactNode }) {
  const [orders, setOrders] = useState<ExtendedOrder[]>(initialOrders);
  const [bypassRequests, setBypassRequests] = useState<ExtendedBypassRequest[]>(
    [],
  );
  const [notifications, setNotifications] = useState<Notification[]>([]);

  const createOrder = useCallback(
    (
      orderData: Omit<ExtendedOrder, "id" | "createdAt" | "updatedAt">,
    ): ExtendedOrder => {
      const newOrder: ExtendedOrder = {
        ...orderData,
        id: `order-${Date.now()}`,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      setOrders((prev) => [...prev, newOrder]);
      return newOrder;
    },
    [],
  );

  const updateOrderStatus = useCallback(
    (orderId: string, status: OrderStatus, workerId?: string) => {
      setOrders((prev) =>
        prev.map((order) => {
          if (order.id !== orderId) return order;
          return { ...order, status, updatedAt: new Date() };
        }),
      );
    },
    [],
  );

  const updateOrderItems = useCallback(
    (
      orderId: string,
      items: { id: number; name: string; qty: number }[],
      weight?: number,
    ) => {
      setOrders((prev) =>
        prev.map((order) => {
          if (order.id !== orderId) return order;
          return {
            ...order,
            displayItems: items,
            totalWeightKg: weight ?? order.totalWeightKg,
            totalAmount: weight ? weight * 10 : order.totalAmount,
            updatedAt: new Date(),
          };
        }),
      );
    },
    [],
  );

  const assignDriver = useCallback(
    (orderId: string, driverId: string, driverName: string) => {
      setOrders((prev) =>
        prev.map((order) => {
          if (order.id !== orderId) return order;
          return {
            ...order,
            driverName,
            status:
              order.status === "WAITING_DRIVER_PICKUP"
                ? "ON_THE_WAY_TO_OUTLET"
                : "DELIVERING_TO_CUSTOMER",
            updatedAt: new Date(),
          };
        }),
      );
    },
    [],
  );

  const createBypassRequest = useCallback(
    (request: Omit<ExtendedBypassRequest, "id" | "requestedAt" | "status">) => {
      const newRequest: ExtendedBypassRequest = {
        ...request,
        id: Date.now(),
        orderStationId: 1, // Demo value
        requestedByWorkerId: request.requestedByWorkerId,
        reason: request.reason || "",
        status: "REQUESTED",
        requestedAt: new Date(),
      };
      setBypassRequests((prev) => [...prev, newRequest]);
    },
    [],
  );

  const resolveBypassRequest = useCallback(
    (
      requestId: number,
      approved: boolean,
      adminId: string,
      explanation: string,
    ) => {
      setBypassRequests((prev) =>
        prev.map((request) => {
          if (request.id !== requestId) return request;
          return {
            ...request,
            status: approved ? "APPROVED" : ("REJECTED" as BypassStatus),
            approvedByAdminId: adminId,
            decidedAt: new Date(),
          };
        }),
      );
    },
    [],
  );

  const addNotification = useCallback(
    (notification: Omit<Notification, "id" | "createdAt" | "isRead">) => {
      const newNotification: Notification = {
        ...notification,
        id: Date.now(),
        isRead: false,
        createdAt: new Date(),
      };
      setNotifications((prev) => [newNotification, ...prev]);
    },
    [],
  );

  const markNotificationRead = useCallback((notificationId: number) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === notificationId ? { ...n, isRead: true } : n)),
    );
  }, []);

  const getOrdersByStatus = useCallback(
    (statuses: OrderStatus[]) => {
      return orders.filter((order) => statuses.includes(order.status));
    },
    [orders],
  );

  const getOrdersByDriver = useCallback(
    (driverId: string) => {
      return orders.filter((order) => order.driverName);
    },
    [orders],
  );

  const getOrdersByStation = useCallback(
    (station: StationType) => {
      const statusMap: Record<StationType, OrderStatus[]> = {
        WASHING: ["ARRIVED_AT_OUTLET", "WASHING"],
        IRONING: ["WASHING", "IRONING"],
        PACKING: ["IRONING", "PACKING"],
      };
      return orders.filter((order) =>
        statusMap[station]?.includes(order.status),
      );
    },
    [orders],
  );

  return (
    <OrderContext.Provider
      value={{
        orders,
        bypassRequests,
        notifications,
        createOrder,
        updateOrderStatus,
        updateOrderItems,
        assignDriver,
        createBypassRequest,
        resolveBypassRequest,
        addNotification,
        markNotificationRead,
        getOrdersByStatus,
        getOrdersByDriver,
        getOrdersByStation,
      }}
    >
      {children}
    </OrderContext.Provider>
  );
}

export function useOrders() {
  const context = useContext(OrderContext);
  if (context === undefined) {
    throw new Error("useOrders must be used within an OrderProvider");
  }
  return context;
}
