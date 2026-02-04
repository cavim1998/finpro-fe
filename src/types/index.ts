

export type TabType = 'DASHBOARD' | 'PICKUP' | 'ORDERS' | 'REPORT' | 'MASTER';

// =========================
// ENUMS
// =========================

export type RoleCode = 'CUSTOMER' | 'SUPER_ADMIN' | 'OUTLET_ADMIN' | 'WORKER' | 'DRIVER';

export type UserStatus = 'ACTIVE' | 'SUSPENDED' | 'DELETED';

export type IdentityProvider = 'EMAIL' | 'GOOGLE' | 'FACEBOOK' | 'TWITTER';

export type StationType = 'WASHING' | 'IRONING' | 'PACKING';

export type StationStatus = 'PENDING' | 'IN_PROGRESS' | 'WAITING_BYPASS' | 'COMPLETED';

export type PickupStatus = 'WAITING_DRIVER' | 'DRIVER_ASSIGNED' | 'PICKED_UP' | 'ARRIVED_OUTLET' | 'CANCELED';

export type OrderStatus =
  | 'WAITING_DRIVER_PICKUP'
  | 'ON_THE_WAY_TO_OUTLET'
  | 'ARRIVED_AT_OUTLET'
  | 'WASHING'
  | 'IRONING'
  | 'PACKING'
  | 'WAITING_PAYMENT'
  | 'READY_TO_DELIVER'
  | 'DELIVERING_TO_CUSTOMER'
  | 'RECEIVED_BY_CUSTOMER'
  | 'CANCELED';

export type TaskType = 'PICKUP' | 'DELIVERY';

export type TaskStatus = 'AVAILABLE' | 'ASSIGNED' | 'IN_PROGRESS' | 'DONE' | 'CANCELED';

export type PaymentStatus = 'PENDING' | 'PAID' | 'FAILED' | 'EXPIRED' | 'REFUNDED';

export type NotificationType = 'PAYMENT_REMINDER' | 'ORDER_STATUS' | 'GENERAL';

export type ComplaintType = 'DAMAGED' | 'MISSING' | 'NOT_MATCH' | 'OTHER';

export type ComplaintStatus = 'OPEN' | 'IN_REVIEW' | 'RESOLVED' | 'REJECTED';

export type BypassStatus = 'REQUESTED' | 'APPROVED' | 'REJECTED';

export type ShiftAssignmentStatus = 'SCHEDULED' | 'ON_DUTY' | 'OFF_DUTY';

// =========================
// USERS & AUTH
// =========================

export interface User {
  id: string;
  role: RoleCode;
  email?: string;
  passwordHash?: string;
  isEmailVerified: boolean;
  status: UserStatus;
  createdAt: Date;
  updatedAt: Date;
  profile?: UserProfile;
}

export interface UserProfile {
  userId: string;
  fullName: string;
  phone?: string;
  photoUrl?: string;
  photoMime?: string;
  photoSizeBytes?: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface UserIdentity {
  id: number;
  userId: string;
  provider: IdentityProvider;
  providerUserId: string;
  createdAt: Date;
}

export interface EmailVerificationToken {
  id: number;
  userId: string;
  token: string;
  expiresAt: Date;
  usedAt?: Date;
  createdAt: Date;
}

export interface PasswordResetToken {
  id: number;
  userId: string;
  token: string;
  expiresAt: Date;
  usedAt?: Date;
  createdAt: Date;
}

// =========================
// CUSTOMER ADDRESSES & OUTLETS
// =========================

export interface UserAddress {
  id: number;
  userId: string;
  label?: string;
  receiverName?: string;
  receiverPhone?: string;
  addressText: string;
  latitude?: number;
  longitude?: number;
  isPrimary: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface Outlet {
  id: number;
  name: string;
  addressText: string;
  latitude?: number;
  longitude?: number;
  serviceRadiusKm: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// =========================
// STAFF, SHIFT, ATTENDANCE
// =========================

export interface OutletStaff {
  id: number;
  outletId: number;
  userId: string;
  workerStation?: StationType;
  isActive: boolean;
  createdAt: Date;
  outlet?: Outlet;
  user?: User;
}

export interface Shift {
  id: number;
  outletId: number;
  shiftDate: Date;
  startTime: Date;
  endTime: Date;
  createdAt: Date;
  outlet?: Outlet;
  assignments?: ShiftAssignment[];
}

export interface ShiftAssignment {
  id: number;
  shiftId: number;
  outletStaffId: number;
  status: ShiftAssignmentStatus;
  createdAt: Date;
  shift?: Shift;
  staff?: OutletStaff;
}

export interface AttendanceLog {
  id: number;
  outletStaffId: number;
  date: Date;
  clockInAt?: Date;
  clockOutAt?: Date;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
  staff?: OutletStaff;
}

// =========================
// MASTER LAUNDRY ITEMS
// =========================

export interface LaundryItem {
  id: number;
  name: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// =========================
// PICKUP REQUEST & ORDER
// =========================

export interface PickupRequest {
  id: string;
  customerId: string;
  addressId: number;
  scheduledPickupAt: Date;
  notes?: string;
  assignedOutletId: number;
  status: PickupStatus;
  createdAt: Date;
  updatedAt: Date;
  customer?: User;
  address?: UserAddress;
  outlet?: Outlet;
  order?: Order;
}

export interface Order {
  id: string;
  orderNo: string;
  pickupRequestId: string;
  outletId: number;
  customerId: string;
  createdByOutletAdminId: string;
  totalWeightKg: number;
  subtotalAmount: number;
  deliveryFee: number;
  totalAmount: number;
  status: OrderStatus;
  paymentDueAt?: Date;
  paidAt?: Date;
  deliveredAt?: Date;
  receivedConfirmedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
  pickupRequest?: PickupRequest;
  outlet?: Outlet;
  customer?: User;
  createdBy?: User;
  items?: OrderItem[];
  stations?: OrderStation[];
  payments?: Payment[];
  driverTasks?: DriverTask[];
  complaints?: Complaint[];
}

export interface OrderItem {
  id: number;
  orderId: string;
  itemId: number;
  qty: number;
  createdAt: Date;
  order?: Order;
  item?: LaundryItem;
}

// =========================
// STATIONS + RECOUNT + BYPASS
// =========================

export interface OrderStation {
  id: number;
  orderId: string;
  stationType: StationType;
  assignedWorkerId?: string;
  startedAt?: Date;
  completedAt?: Date;
  status: StationStatus;
  order?: Order;
  worker?: User;
  itemCounts?: StationItemCount[];
  bypassRequests?: BypassRequest[];
}

export interface StationItemCount {
  id: number;
  orderStationId: number;
  itemId: number;
  qty: number;
  station?: OrderStation;
  item?: LaundryItem;
}

export interface BypassRequest {
  id: number;
  orderStationId: number;
  requestedByWorkerId: string;
  approvedByAdminId?: string;
  reason: string;
  status: BypassStatus;
  requestedAt: Date;
  decidedAt?: Date;
  orderStation?: OrderStation;
  requestedBy?: User;
  approvedBy?: User;
  diffs?: BypassRequestDiff[];
}

export interface BypassRequestDiff {
  id: number;
  bypassRequestId: number;
  itemId: number;
  prevQty: number;
  currentQty: number;
  bypassRequest?: BypassRequest;
  item?: LaundryItem;
}

// =========================
// DRIVER TASKS
// =========================

export interface DriverTask {
  id: number;
  taskType: TaskType;
  outletId: number;
  driverId: string;
  pickupRequestId?: string;
  orderId?: string;
  fromLat?: number;
  fromLng?: number;
  toLat?: number;
  toLng?: number;
  status: TaskStatus;
  assignedAt?: Date;
  startedAt?: Date;
  completedAt?: Date;
  createdAt: Date;
  outlet?: Outlet;
  driver?: User;
  pickupRequest?: PickupRequest;
  order?: Order;
}

// =========================
// PAYMENTS + NOTIFICATIONS
// =========================

export interface Payment {
  id: number;
  orderId: string;
  provider: string;
  amount: number;
  status: PaymentStatus;
  gatewayRef?: string;
  paidAt?: Date;
  payloadJson?: Record<string, unknown>;
  createdAt: Date;
  updatedAt: Date;
  order?: Order;
}

export interface Notification {
  id: number;
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  isRead: boolean;
  createdAt: Date;
  user?: User;
}

// =========================
// COMPLAINTS
// =========================

export interface Complaint {
  id: number;
  orderId: string;
  customerId: string;
  type: ComplaintType;
  description: string;
  status: ComplaintStatus;
  createdAt: Date;
  updatedAt: Date;
  order?: Order;
  customer?: User;
  attachments?: ComplaintAttachment[];
}

export interface ComplaintAttachment {
  id: number;
  complaintId: number;
  fileUrl: string;
  mime?: string;
  sizeBytes?: number;
  createdAt: Date;
  complaint?: Complaint;
}

