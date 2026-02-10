import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useActorState } from './useActorState';
import { type OrderRequest, type Product, type PaymentMethod, type Address, OrderStatus } from '../backend';
import { normalizePriceToPaise } from '../utils/currency';
import { getActorErrorMessage } from '../utils/actorErrorMessages';

interface SubmitOrderRequestParams {
  productsWithQuantity: Array<[Product, bigint]>;
  customerName: string;
  contactDetails: string;
  note: string | null;
  deliveryAddress: Address;
  paymentMethod: PaymentMethod;
}

function normalizeProduct(product: Product): Product {
  return {
    ...product,
    price: normalizePriceToPaise(product.price),
  };
}

function normalizeOrderRequest(order: OrderRequest): OrderRequest {
  return {
    ...order,
    products: order.products.map(([product, quantity]) => [
      normalizeProduct(product),
      quantity,
    ]),
    shippingFee: normalizePriceToPaise(order.shippingFee),
  };
}

export function useGetAllOrderRequests() {
  const { actor, isFetching } = useActorState();

  return useQuery<OrderRequest[]>({
    queryKey: ['orderRequests'],
    queryFn: async () => {
      if (!actor) return [];
      const orders = await actor.getAllOrderRequests();
      return orders.map(normalizeOrderRequest);
    },
    enabled: !!actor && !isFetching,
  });
}

export function useSubmitOrderRequest() {
  const { actor, isReady, isError } = useActorState();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: SubmitOrderRequestParams) => {
      // Check if actor initialization failed
      if (isError) {
        throw new Error('Unable to connect to the service. Please retry or reload the page.');
      }
      
      // Check if actor is not ready yet
      if (!isReady || !actor) {
        throw new Error('We are still connecting to the service. Please wait a moment and try again.');
      }
      
      return actor.submitOrderRequest(
        params.productsWithQuantity,
        params.customerName,
        params.contactDetails,
        params.note,
        params.deliveryAddress,
        params.paymentMethod
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orderRequests'] });
    },
    onError: (error) => {
      // Transform error to user-friendly message
      const message = getActorErrorMessage(error);
      throw new Error(message);
    },
  });
}

export function useDeleteOrderRequest() {
  const { actor } = useActorState();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (orderId: bigint) => {
      if (!actor) throw new Error('Actor not available');
      return actor.deleteOrderRequest(orderId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orderRequests'] });
    },
  });
}

export function useUpdateOrderStatus() {
  const { actor } = useActorState();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ orderId, status }: { orderId: bigint; status: OrderStatus }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.updateOrderStatus(orderId, status);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orderRequests'] });
    },
  });
}
