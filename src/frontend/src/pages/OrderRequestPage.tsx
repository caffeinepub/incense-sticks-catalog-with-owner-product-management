import { useState } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { useOrderDraft } from '../hooks/useOrderDraft';
import { useSubmitOrderRequest } from '../hooks/useOrderRequests';
import { useActorState } from '../hooks/useActorState';
import ProductImage from '../components/ProductImage';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { ArrowLeft, Trash2, Smartphone, AlertCircle, Loader2, RefreshCw, MapPin } from 'lucide-react';
import { toast } from 'sonner';
import { formatINR } from '../utils/currency';
import { calculateShippingFee } from '../utils/shipping';
import { MERCHANT_UPI_ID } from '../config/payment';
import { getActorErrorMessage } from '../utils/actorErrorMessages';
import type { PaymentMethod, Address } from '../backend';

export default function OrderRequestPage() {
  const navigate = useNavigate();
  const { items, updateQuantity, removeItem, clearDraft } = useOrderDraft();
  const submitOrder = useSubmitOrderRequest();
  const { isReady, isError, isLoading, retry } = useActorState();
  
  const [customerName, setCustomerName] = useState('');
  const [contactDetails, setContactDetails] = useState('');
  const [note, setNote] = useState('');
  const [upiReference, setUpiReference] = useState('');
  const [upiTransactionId, setUpiTransactionId] = useState('');
  
  // Delivery address fields
  const [deliveryAddress, setDeliveryAddress] = useState('');
  const [deliveryLandmark, setDeliveryLandmark] = useState('');
  const [deliveryCity, setDeliveryCity] = useState('');
  const [deliveryPinCode, setDeliveryPinCode] = useState('');

  // Calculate subtotal using bigint arithmetic
  const subtotal = items.reduce((sum, item) => {
    return sum + (item.product.price * BigInt(item.quantity));
  }, 0n);

  // Calculate shipping fee based on delivery city
  const shippingFee = deliveryCity.trim() ? calculateShippingFee(deliveryCity) : 0n;
  
  // Calculate total payable (subtotal + shipping)
  const totalPayable = subtotal + shippingFee;

  // Validate UPI payment details
  const hasValidUpiDetails = upiReference.trim().length > 0 || upiTransactionId.trim().length > 0;

  // Determine if submit should be disabled
  const isSubmitDisabled = 
    submitOrder.isPending || 
    !hasValidUpiDetails || 
    !isReady || 
    isError ||
    isLoading;

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

    if (!deliveryAddress.trim()) {
      toast.error('Please enter your delivery address');
      return;
    }

    if (!deliveryCity.trim()) {
      toast.error('Please enter your delivery city');
      return;
    }

    if (items.length === 0) {
      toast.error('Your order is empty');
      return;
    }

    // Validate UPI payment details
    if (!upiReference.trim() && !upiTransactionId.trim()) {
      toast.error('Please enter at least one UPI payment detail (reference number or transaction ID)');
      return;
    }

    // Check actor readiness
    if (!isReady) {
      toast.error('We are still connecting to the service. Please wait a moment and try again.');
      return;
    }

    if (isError) {
      toast.error('Unable to connect to the service. Please retry or reload the page.');
      return;
    }

    try {
      const productsWithQuantity: Array<[typeof items[0]['product'], bigint]> = items.map(item => [
        item.product,
        BigInt(item.quantity)
      ]);

      // Build delivery address
      const address: Address = {
        firstLine: deliveryAddress.trim(),
        landmark: deliveryLandmark.trim() || '',
        city: deliveryCity.trim(),
        pinCode: deliveryPinCode.trim() || '',
      };

      // Build UPI payment method
      const paymentMethod: PaymentMethod = {
        __kind__: 'upi',
        upi: {
          reference: upiReference.trim() || undefined,
          transactionId: upiTransactionId.trim() || undefined,
        }
      };

      await submitOrder.mutateAsync({
        productsWithQuantity,
        customerName: customerName.trim(),
        contactDetails: contactDetails.trim(),
        note: note.trim() || null,
        deliveryAddress: address,
        paymentMethod,
      });

      clearDraft();
      navigate({ to: '/order/confirmation' });
    } catch (error: any) {
      const errorMessage = getActorErrorMessage(error);
      toast.error(errorMessage);
    }
  };

  const handleRetry = () => {
    retry();
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

      {/* Actor Error State */}
      {isError && (
        <Alert variant="destructive" className="mb-6">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Connection Error</AlertTitle>
          <AlertDescription className="flex items-center justify-between">
            <span>
              Unable to connect to the service. Please check your internet connection and try again.
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={handleRetry}
              className="ml-4 gap-2"
            >
              <RefreshCw className="h-4 w-4" />
              Retry
            </Button>
          </AlertDescription>
        </Alert>
      )}

      {/* Actor Loading State */}
      {isLoading && !isError && (
        <Alert className="mb-6">
          <Loader2 className="h-4 w-4 animate-spin" />
          <AlertTitle>Connecting</AlertTitle>
          <AlertDescription>
            Connecting to the service. Please wait a moment...
          </AlertDescription>
        </Alert>
      )}

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

                <Separator className="my-4" />

                {/* Delivery Address Section */}
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <MapPin className="h-5 w-5 text-primary" />
                    <Label className="text-base font-semibold">Delivery Address *</Label>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="deliveryAddress">Delivery Address *</Label>
                    <Textarea
                      id="deliveryAddress"
                      value={deliveryAddress}
                      onChange={(e) => setDeliveryAddress(e.target.value)}
                      placeholder="House/Flat number, Street, Area"
                      rows={2}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="deliveryLandmark">Landmark (Optional)</Label>
                    <Input
                      id="deliveryLandmark"
                      value={deliveryLandmark}
                      onChange={(e) => setDeliveryLandmark(e.target.value)}
                      placeholder="Nearby landmark"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-2">
                      <Label htmlFor="deliveryCity">Delivery City *</Label>
                      <Input
                        id="deliveryCity"
                        value={deliveryCity}
                        onChange={(e) => setDeliveryCity(e.target.value)}
                        placeholder="City"
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="deliveryPinCode">Pin Code</Label>
                      <Input
                        id="deliveryPinCode"
                        value={deliveryPinCode}
                        onChange={(e) => setDeliveryPinCode(e.target.value)}
                        placeholder="Pin code"
                      />
                    </div>
                  </div>
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

                {/* Order Summary */}
                <div className="bg-accent/30 rounded-lg p-4 space-y-2">
                  <h3 className="font-semibold text-sm mb-3">Order Summary</h3>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Items Subtotal:</span>
                    <span className="font-medium">{formatINR(subtotal)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Shipping:</span>
                    <span className="font-medium">
                      {shippingFee === 0n ? (
                        <span className="text-green-600">Free</span>
                      ) : (
                        formatINR(shippingFee)
                      )}
                    </span>
                  </div>
                  <Separator className="my-2" />
                  <div className="flex justify-between text-base font-semibold">
                    <span>Total Payable:</span>
                    <span className="text-primary">{formatINR(totalPayable)}</span>
                  </div>
                  {deliveryCity.trim() && shippingFee === 0n && (
                    <p className="text-xs text-green-600 mt-2">
                      🎉 Free shipping for Gurugram delivery!
                    </p>
                  )}
                </div>

                <Separator className="my-4" />

                {/* UPI Payment Section */}
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <Smartphone className="h-5 w-5 text-primary" />
                    <Label className="text-base font-semibold">UPI Payment Required *</Label>
                  </div>
                  
                  <div className="bg-accent/30 rounded-lg p-4 space-y-3">
                    <p className="text-sm text-muted-foreground">
                      Please complete your payment using the merchant UPI ID below before confirming your order.
                    </p>
                    
                    {/* Merchant UPI ID Display */}
                    {MERCHANT_UPI_ID && MERCHANT_UPI_ID.trim() ? (
                      <div className="bg-background border-2 border-primary/20 rounded-lg p-4 space-y-2">
                        <Label className="text-xs uppercase tracking-wide text-muted-foreground">
                          Merchant UPI ID
                        </Label>
                        <p className="text-lg font-mono font-semibold text-primary break-all">
                          {MERCHANT_UPI_ID}
                        </p>
                      </div>
                    ) : (
                      <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-4">
                        <p className="text-sm text-destructive font-medium">
                          Merchant UPI ID is not configured. Please contact the store administrator.
                        </p>
                      </div>
                    )}

                    <div className="space-y-2">
                      <div className="flex justify-between text-lg font-semibold">
                        <span>Amount to Pay:</span>
                        <span className="text-primary">{formatINR(totalPayable)}</span>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4 pt-2">
                    <p className="text-sm font-medium">
                      After payment, enter at least one of the following details:
                    </p>
                    <div className="space-y-2">
                      <Label htmlFor="upiReference">UPI Reference Number</Label>
                      <Input
                        id="upiReference"
                        value={upiReference}
                        onChange={(e) => setUpiReference(e.target.value)}
                        placeholder="Enter UPI reference number"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="upiTransactionId">UPI Transaction ID</Label>
                      <Input
                        id="upiTransactionId"
                        value={upiTransactionId}
                        onChange={(e) => setUpiTransactionId(e.target.value)}
                        placeholder="Enter UPI transaction ID"
                      />
                    </div>
                    {!hasValidUpiDetails && (
                      <p className="text-sm text-destructive">
                        Please provide at least one payment detail to confirm your order
                      </p>
                    )}
                  </div>
                </div>

                <Separator className="my-4" />

                <Button
                  type="submit"
                  className="w-full"
                  size="lg"
                  disabled={isSubmitDisabled}
                >
                  {submitOrder.isPending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Confirming...
                    </>
                  ) : isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Connecting...
                    </>
                  ) : (
                    'Confirm Paid Order'
                  )}
                </Button>
                
                {!isReady && !isError && !isLoading && (
                  <p className="text-xs text-center text-muted-foreground">
                    Waiting for service connection...
                  </p>
                )}
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
