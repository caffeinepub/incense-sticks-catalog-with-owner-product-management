import { OrderStatus } from '../../backend';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface OrderStatusSelectProps {
  value: OrderStatus;
  onChange: (status: OrderStatus) => void;
  disabled?: boolean;
}

const statusOptions = [
  { value: OrderStatus.pending, label: 'Pending' },
  { value: OrderStatus.inProgress, label: 'Packed' },
  { value: OrderStatus.shipped, label: 'Out for Delivery' },
  { value: OrderStatus.delivered, label: 'Delivered' },
];

function getStatusLabel(status: OrderStatus): string {
  switch (status) {
    case OrderStatus.pending:
      return 'Pending';
    case OrderStatus.inProgress:
      return 'Packed';
    case OrderStatus.shipped:
      return 'Out for Delivery';
    case OrderStatus.delivered:
      return 'Delivered';
    case OrderStatus.cancelled:
      return 'Cancelled';
    default:
      return 'Unknown';
  }
}

export default function OrderStatusSelect({ value, onChange, disabled }: OrderStatusSelectProps) {
  return (
    <Select
      value={value}
      onValueChange={(newValue) => onChange(newValue as OrderStatus)}
      disabled={disabled}
    >
      <SelectTrigger className="w-[180px]">
        <SelectValue>{getStatusLabel(value)}</SelectValue>
      </SelectTrigger>
      <SelectContent>
        {statusOptions.map((option) => (
          <SelectItem key={option.value} value={option.value}>
            {option.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
