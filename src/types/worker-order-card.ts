type WorkerOrderCardProps = {
  orderId: string | number;
  customerName: string;

  clothesCount: number;
  totalKg: number;
  enteredAt: string | Date;
  statusLabel: string;

  onClick?: () => void;

  accentClassName?: string;
};