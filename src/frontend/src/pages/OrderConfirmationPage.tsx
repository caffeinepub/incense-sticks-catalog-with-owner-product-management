import { useNavigate } from '@tanstack/react-router';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle2 } from 'lucide-react';

export default function OrderConfirmationPage() {
  const navigate = useNavigate();

  return (
    <div className="container-custom py-12">
      <div className="max-w-2xl mx-auto">
        <Card>
          <CardHeader className="text-center">
            <div className="mx-auto mb-4">
              <CheckCircle2 className="h-16 w-16 text-primary" />
            </div>
            <CardTitle className="text-3xl font-serif">Order Confirmed!</CardTitle>
          </CardHeader>
          <CardContent className="text-center space-y-6">
            <p className="text-muted-foreground">
              Thank you for your order and payment. We've received your order request along with your UPI payment details.
            </p>
            <p className="text-sm text-muted-foreground">
              We will verify your payment and begin processing your order shortly. You'll receive a confirmation message via email or phone.
            </p>
            <div className="pt-4">
              <Button onClick={() => navigate({ to: '/' })} size="lg">
                Continue Shopping
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
