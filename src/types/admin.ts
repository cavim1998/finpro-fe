export type UserRole = 'SUPER_ADMIN' | 'OUTLET_ADMIN' | 'WORKER' | 'DRIVER';

export type TabType = 'DASHBOARD' | 'PICKUP' | 'ORDERS' | 'REPORT' | 'MASTER';

export interface Order {
  id: string;
  customer: string;
  weight: number;
  itemsCount: number;
  status: string;
  date: string;
}

export interface PickupRequest {
  id: string;
  customer: string;
  address: string;
  time: string;
  status: string;
}