import { useState } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { useOrderDraft } from '../hooks/useOrderDraft';
import { useSubmitOrderRequest } from '../hooks/useOrderRequests';
import ProductImage from '../components/ProductImage';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { ArrowLeft, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { formatINR } from '../utils/currency';

export default function OrderRequestPage() {
  const navigate = useNavigate();
  const { items, updateQuantity, removeItem, clearDraft } = useOrderDraft();
  const submitOrder = useSubmitOrderRequest();
  
  const [customerName, setCustomerName] = useState('');
  const [contactDetails, setContactDetails] = useState('');
  const [note, setNote] = useState('');

  // Calculate total using bigint arithmetic to avoid precision issues
  const total = items.reduce((sum, item) => {
    return sum + (item.product.price * BigInt(item.quantity));
  }, 0n);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!customerName.trim()) {
      toast.error('Please enter your name');
      return;
    }

    if (!contactDetails.trim()) {
      toast.error('Please enter your contact details');
      return;
    }

    if (items.length === 0) {
      toast.error('Your order is empty');
      return;
    }

    try {
      const productsWithQuantity: Array<[typeof items[0]['product'], bigint]> = items.map(item => [
        item.product,
        BigInt(item.quantity)
      ]);

      await submitOrder.mutateAsync({
        productsWithQuantity,
        customerName: customerName.trim(),
        contactDetails: contactDetails.trim(),
        note: note.trim() || null
      });

      clearDraft();
      navigate({ to: '/order/confirmation' });
    } catch (error) {
      toast.error('Failed to submit order. Please try again.');
    }
  };

  if (items.length === 0) {
    return (
      <div className="container-custom py-12">
        <div className="text-center space-y-4">
          <h1 className="text-3xl font-serif font-bold">Your Order is Empty</h1>
          <p className="text-muted-foreground">Add some products to your order to continue.</p>
          <Button onClick={() => navigate({ to: '/' })}>
            Browse Products
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container-custom py-12">
      <Button
        variant="ghost"
        className="mb-6 gap-2"
        onClick={() => navigate({ to: '/' })}
      >
        <ArrowLeft className="h-4 w-4" />
        Continue Shopping
      </Button>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Order Items */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Order Items</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {items.map((item) => {
                // Use bigint arithmetic for item total
                const itemTotal = item.product.price * BigInt(item.quantity);
                return (
                  <div key={item.product.id.toString()} className="flex gap-4 pb-4 border-b last:border-0">
                    <div className="w-20 h-20 flex-shrink-0 rounded-md overflow-hidden bg-muted">
                      <ProductImage 
                        photoUrl={item.product.photoUrl} 
                        alt={item.product.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold truncate">{item.product.name}</h3>
                      {item.product.scent && (
                        <p className="text-sm text-muted-foreground">{item.product.scent}</p>
                      )}
                      <p className="text-sm font-medium text-primary mt-1">
                        {formatINR(item.product.price)} each
                      </p>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => updateQuantity(item.product.id, Math.max(1, item.quantity - 1))}
                        >
                          -
                        </Button>
                        <span className="w-8 text-center font-medium">{item.quantity}</span>
                        <Button
                          variant="outline"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                        >
                          +
                        </Button>
                      </div>
                      <p className="font-semibold">{formatINR(itemTotal)}</p>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeItem(item.product.id)}
                        className="text-destructive hover:text-destructive"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                );
              })}
            </CardContent>
          </Card>
        </div>

        {/* Order Form & Summary */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Contact Information</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="customerName">Your Name *</Label>
                  <Input
                    id="customerName"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    placeholder="Enter your name"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="contactDetails">Contact Details *</Label>
                  <Input
                    id="contactDetails"
                    value={contactDetails}
                    onChange={(e) => setContactDetails(e.target.value)}
                    placeholder="Email or phone number"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="note">Special Instructions (Optional)</Label>
                  <Textarea
                    id="note"
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                    placeholder="Any special requests or notes..."
                    rows={3}
                  />
                </div>

                <Separator className="my-4" />

                <div className="space-y-2">
                  <div className="flex justify-between text-lg font-semibold">
                    <span>Total</span>
                    <span className="text-primary">{formatINR(total)}</span>
                  </div>
                </div>

                <Button
                  type="submit"
                  className="w-full"
                  size="lg"
                  disabled={submitOrder.isPending}
                >
                  {submitOrder.isPending ? 'Submitting...' : 'Submit Order Request'}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
