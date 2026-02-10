import { useState } from 'react';
import { type Product } from '../backend';
import { useOrderDraft } from '../hooks/useOrderDraft';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Plus, Minus, ShoppingBag } from 'lucide-react';
import { toast } from 'sonner';

interface AddToOrderControlsProps {
  product: Product;
  variant?: 'default' | 'detail';
}

export default function AddToOrderControls({ product, variant = 'default' }: AddToOrderControlsProps) {
  const { items, addItem, updateQuantity, removeItem } = useOrderDraft();
  const existingItem = items.find(item => item.product.id === product.id);
  const [quantity, setQuantity] = useState(1);

  const handleAdd = () => {
    if (existingItem) {
      updateQuantity(product.id, existingItem.quantity + quantity);
      toast.success(`Updated ${product.name} quantity`);
    } else {
      addItem(product, quantity);
      toast.success(`Added ${product.name} to order`);
    }
    setQuantity(1);
  };

  const handleIncrement = () => {
    if (existingItem) {
      updateQuantity(product.id, existingItem.quantity + 1);
    } else {
      setQuantity(q => q + 1);
    }
  };

  const handleDecrement = () => {
    if (existingItem) {
      if (existingItem.quantity > 1) {
        updateQuantity(product.id, existingItem.quantity - 1);
      } else {
        removeItem(product.id);
        toast.success(`Removed ${product.name} from order`);
      }
    } else {
      setQuantity(q => Math.max(1, q - 1));
    }
  };

  if (variant === 'detail') {
    return (
      <div className="flex items-center gap-4">
        <div className="flex items-center border rounded-md">
          <Button
            variant="ghost"
            size="icon"
            onClick={handleDecrement}
            disabled={!existingItem && quantity <= 1}
          >
            <Minus className="h-4 w-4" />
          </Button>
          <Input
            type="number"
            min="1"
            value={existingItem?.quantity || quantity}
            onChange={(e) => {
              const val = parseInt(e.target.value) || 1;
              if (existingItem) {
                updateQuantity(product.id, val);
              } else {
                setQuantity(val);
              }
            }}
            className="w-16 text-center border-0 focus-visible:ring-0"
          />
          <Button
            variant="ghost"
            size="icon"
            onClick={handleIncrement}
          >
            <Plus className="h-4 w-4" />
          </Button>
        </div>
        <Button onClick={handleAdd} className="flex-1 gap-2">
          <ShoppingBag className="h-4 w-4" />
          {existingItem ? 'Update Order' : 'Add to Order'}
        </Button>
      </div>
    );
  }

  if (existingItem) {
    return (
      <div className="flex items-center gap-2 w-full">
        <Button
          variant="outline"
          size="icon"
          onClick={handleDecrement}
          className="h-9 w-9"
        >
          <Minus className="h-4 w-4" />
        </Button>
        <span className="flex-1 text-center font-medium">{existingItem.quantity}</span>
        <Button
          variant="outline"
          size="icon"
          onClick={handleIncrement}
          className="h-9 w-9"
        >
          <Plus className="h-4 w-4" />
        </Button>
      </div>
    );
  }

  return (
    <Button onClick={handleAdd} className="w-full gap-2">
      <ShoppingBag className="h-4 w-4" />
      Add to Order
    </Button>
  );
}
