export interface OrderListViewProps {
  title: string;
  isPickupTab: boolean;
  data: any[];
  loading?: boolean;

  page: number;
  limit: number;
  totalData: number;
  onPageChange: (newPage: number) => void;

  roleCode?: string;
  selectedOutletId?: number;
  onOutletChange?: (id: number) => void;
  selectedStatus?: string;
  onStatusChange?: (status: string) => void;

  sortBy?: string;
  onSortByChange?: (val: string) => void;
  sortOrder?: "asc" | "desc";
  onSortOrderChange?: (val: "asc" | "desc") => void;

  onCreateOrder?: (pickupId: string) => void;
  onRefresh?: () => void;
}
