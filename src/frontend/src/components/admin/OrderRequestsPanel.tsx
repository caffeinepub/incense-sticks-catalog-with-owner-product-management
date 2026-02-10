import { useGetAllOrderRequests, useDeleteOrderRequest } from '../../hooks/useOrderRequests';
import { type OrderRequest } from '../../backend';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Trash2, Mail, Phone } from 'lucide-react';
import { toast } from 'sonner';
import { Skeleton } from '@/components/ui/skeleton';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { useState } from 'react';
import { formatINR } from '../../utils/currency';

export default function OrderRequestsPanel() {
  const { data: orders, isLoading } = useGetAllOrderRequests();
  const deleteOrder = useDeleteOrderRequest();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [orderToDelete, setOrderToDelete] = useState<OrderRequest | null>(null);

  const handleDeleteClick = (order: OrderRequest) => {
    setOrderToDelete(order);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!orderToDelete) return;

    try {
      await deleteOrder.mutateAsync(orderToDelete.id);
      toast.success('Order request deleted');
      setDeleteDialogOpen(false);
      setOrderToDelete(null);
    } catch (error) {
      toast.error('Failed to delete order request');
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Order Requests</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <Skeleton key={i} className="h-20 w-full" />
          ))}
        </CardContent>
      </Card>
    );
  }

  if (!orders || orders.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Order Requests</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-12 text-muted-foreground">
            No order requests yet.
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Order Requests ({orders.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <Accordion type="single" collapsible className="w-full">
            {orders.map((order) => {
              // Calculate total using bigint arithmetic
              const total = order.products.reduce((sum, [product, quantity]) => {
                return sum + (product.price * quantity);
              }, 0n);

              return (
                <AccordionItem key={order.id.toString()} value={order.id.toString()}>
                  <AccordionTrigger className="hover:no-underline">
                    <div className="flex items-center justify-between w-full pr-4">
                      <div className="text-left">
                        <div className="font-semibold">{order.customerName}</div>
                        <div className="text-sm text-muted-foreground">
                          {order.products.length} item{order.products.length !== 1 ? 's' : ''} • {formatINR(total)}
                        </div>
                      </div>
                      <Badge>Order #{order.id.toString()}</Badge>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent>
                    <div className="space-y-4 pt-4">
                      {/* Contact Details */}
                      <div className="space-y-2">
                        <h4 className="font-semibold text-sm">Contact Information</h4>
                        <div className="flex items-center gap-2 text-sm">
                          {order.contactDetails.includes('@') ? (
                            <Mail className="h-4 w-4 text-muted-foreground" />
                          ) : (
                            <Phone className="h-4 w-4 text-muted-foreground" />
                          )}
                          <span>{order.contactDetails}</span>
                        </div>
                      </div>

                      {/* Products */}
                      <div className="space-y-2">
                        <h4 className="font-semibold text-sm">Items</h4>
                        <div className="space-y-2">
                          {order.products.map(([product, quantity], idx) => {
                            // Use bigint arithmetic for item total
                            const itemTotal = product.price * quantity;
                            return (
                              <div key={idx} className="flex justify-between text-sm border-l-2 border-primary/20 pl-3 py-1">
                                <span>
                                  {product.name} × {quantity.toString()}
                                </span>
                                <span className="font-medium">
                                  {formatINR(itemTotal)}
                                </span>
                              </div>
                            );
                          })}
                        </div>
                        <div className="flex justify-between font-semibold pt-2 border-t">
                          <span>Total</span>
                          <span className="text-primary">{formatINR(total)}</span>
                        </div>
                      </div>

                      {/* Note */}
                      {order.note && (
                        <div className="space-y-2">
                          <h4 className="font-semibold text-sm">Customer Note</h4>
                          <p className="text-sm text-muted-foreground bg-muted p-3 rounded-md">
                            {order.note}
                          </p>
                        </div>
                      )}

                      {/* Actions */}
                      <div className="flex justify-end pt-2">
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => handleDeleteClick(order)}
                          disabled={deleteOrder.isPending}
                          className="gap-2"
                        >
                          <Trash2 className="h-4 w-4" />
                          Delete Request
                        </Button>
                      </div>
                    </div>
                  </AccordionContent>
                </AccordionItem>
              );
            })}
          </Accordion>
        </CardContent>
      </Card>

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Order Request</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this order request from {orderToDelete?.customerName}? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
