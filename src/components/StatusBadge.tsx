import { OrderStatus } from '@/types';
import { 
  Clock, 
  Truck, 
  Building2, 
  Droplets, 
  Flame, 
  Package, 
  CreditCard, 
  CheckCircle2, 
  XCircle
} from 'lucide-react';

const statusConfig: Record<OrderStatus, { label: string; icon: React.ElementType; variant: 'default' | 'secondary' | 'destructive' | 'outline' | 'success' | 'warning' | 'info' }> = {
  WAITING_DRIVER_PICKUP: { label: 'Waiting for Pickup', icon: Clock, variant: 'warning' },
  ON_THE_WAY_TO_OUTLET: { label: 'On Way to Outlet', icon: Truck, variant: 'info' },
  ARRIVED_AT_OUTLET: { label: 'At Outlet', icon: Building2, variant: 'default' },
  WASHING: { label: 'Washing', icon: Droplets, variant: 'info' },
  IRONING: { label: 'Ironing', icon: Flame, variant: 'info' },
  PACKING: { label: 'Packing', icon: Package, variant: 'info' },
  WAITING_PAYMENT: { label: 'Awaiting Payment', icon: CreditCard, variant: 'warning' },
  READY_TO_DELIVER: { label: 'Ready to Deliver', icon: Package, variant: 'success' },
  DELIVERING_TO_CUSTOMER: { label: 'Being Delivered', icon: Truck, variant: 'info' },
  RECEIVED_BY_CUSTOMER: { label: 'Completed', icon: CheckCircle2, variant: 'success' },
  CANCELED: { label: 'Canceled', icon: XCircle, variant: 'destructive' },
};

interface StatusBadgeProps {
  status: OrderStatus;
  showIcon?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

export function StatusBadge({ status, showIcon = true, size = 'md' }: StatusBadgeProps) {
  const config = statusConfig[status];
  const Icon = config.icon;
  
  const sizeClasses = {
    sm: 'text-xs px-2 py-0.5',
    md: 'text-sm px-2.5 py-1',
    lg: 'text-base px-3 py-1.5',
  };

  const variantClasses = {
    default: 'bg-primary/10 text-primary border-primary/20',
    secondary: 'bg-secondary text-secondary-foreground',
    destructive: 'bg-destructive/10 text-destructive border-destructive/20',
    outline: 'border-border',
    success: 'bg-status-success/10 text-status-success border-status-success/20',
    warning: 'bg-status-warning/10 text-status-warning border-status-warning/20',
    info: 'bg-station-washing/10 text-station-washing border-station-washing/20',
  };

  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full border font-medium ${sizeClasses[size]} ${variantClasses[config.variant]}`}>
      {showIcon && <Icon className={size === 'sm' ? 'h-3 w-3' : size === 'lg' ? 'h-5 w-5' : 'h-4 w-4'} />}
      {config.label}
    </span>
  );
}
