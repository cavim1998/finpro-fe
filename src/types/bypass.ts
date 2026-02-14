export interface BypassListViewProps {
  data: any[];
  loading: boolean;
  page: number;
  limit: number;
  totalData: number;
  onPageChange: (newPage: number) => void;
  onRefresh: () => void;

  roleCode?: string;
  selectedOutletId?: number;
  onOutletChange?: (id: number) => void;
  selectedStatus?: string;
  onStatusChange?: (status: string) => void;
}
