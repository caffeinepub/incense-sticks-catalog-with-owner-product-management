import { useQuery } from '@tanstack/react-query';
import { useActor } from './useActor';
import { type Product } from '../backend';
import { normalizePriceToPaise } from '../utils/currency';

function normalizeProduct(product: Product): Product {
  return {
    ...product,
    price: normalizePriceToPaise(product.price),
  };
}

export function useGetAllProducts() {
  const { actor, isFetching: actorFetching } = useActor();

  const query = useQuery<Product[]>({
    queryKey: ['products'],
    queryFn: async () => {
      if (!actor) return [];
      const products = await actor.getAllProducts();
      return products.map(normalizeProduct);
    },
    enabled: !!actor && !actorFetching,
  });

  // Combine actor initialization state with query loading state
  return {
    ...query,
    isLoading: actorFetching || query.isLoading,
    isFetched: !!actor && query.isFetched,
  };
}

export function useGetInStockProducts() {
  const { actor, isFetching: actorFetching } = useActor();

  const query = useQuery<Product[]>({
    queryKey: ['products', 'in-stock'],
    queryFn: async () => {
      if (!actor) return [];
      const products = await actor.getInStockProducts();
      return products.map(normalizeProduct);
    },
    enabled: !!actor && !actorFetching,
  });

  // Combine actor initialization state with query loading state
  return {
    ...query,
    isLoading: actorFetching || query.isLoading,
    isFetched: !!actor && query.isFetched,
  };
}
