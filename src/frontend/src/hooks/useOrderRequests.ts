import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useActor } from './useActor';
import { type OrderRequest, type Product } from '../backend';
import { normalizePriceToPaise } from '../utils/currency';

interface SubmitOrderRequestParams {
  productsWithQuantity: Array<[Product, bigint]>;
  customerName: string;
  contactDetails: string;
  note: string | null;
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
  };
}

export function useGetAllOrderRequests() {
  const { actor, isFetching } = useActor();

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
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: SubmitOrderRequestParams) => {
      if (!actor) throw new Error('Actor not available');
      return actor.submitOrderRequest(
        params.productsWithQuantity,
        params.customerName,
        params.contactDetails,
        params.note
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orderRequests'] });
    },
  });
}

export function useDeleteOrderRequest() {
  const { actor } = useActor();
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
