export interface EmployeeTypes {
  id: string;
  name: string;
  email: string;
  role: string;
  outletId: number;
  outletName: string;
  shift: string;
}

export interface Employee {
  id: number;
  userId: number;
  workerStation: string;
  shiftTemplateId: number;
  user: {
    id: string;
    email: string;
    role: string;
    profile: {
      fullName: string;
    };
  };
  role: "SUPER_ADMIN" | "OUTLET_ADMIN" | "WORKER" | "DRIVER" | "CUSTOMER";

  outletId?: number;
  outlet?: {
    id: number;
    name: string;
  };

  status?: "ACTIVE" | "SUSPENDED" | "DELETED";
  createdAt: string;
}
