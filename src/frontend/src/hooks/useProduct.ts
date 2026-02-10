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

export function useGetProduct(productId: bigint) {
  const { actor, isFetching } = useActor();

  return useQuery<Product | null>({
    queryKey: ['product', productId.toString()],
    queryFn: async () => {
      if (!actor) return null;
      const product = await actor.getProduct(productId);
      return product ? normalizeProduct(product) : null;
    },
    enabled: !!actor && !isFetching,
  });
}
