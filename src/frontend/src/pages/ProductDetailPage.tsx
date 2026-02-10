import { useParams, useNavigate, Link } from '@tanstack/react-router';
import { useGetProduct } from '../hooks/useProduct';
import ProductImage from '../components/ProductImage';
import AddToOrderControls from '../components/AddToOrderControls';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { formatINR } from '../utils/currency';

export default function ProductDetailPage() {
  const { productId } = useParams({ from: '/product/$productId' });
  const navigate = useNavigate();
  const { data: product, isLoading, error } = useGetProduct(BigInt(productId));

  if (isLoading) {
    return (
      <div className="container-custom py-12">
        <div className="grid md:grid-cols-2 gap-12">
          <Skeleton className="aspect-square w-full" />
          <div className="space-y-6">
            <Skeleton className="h-8 w-3/4" />
            <Skeleton className="h-6 w-1/2" />
            <Skeleton className="h-24 w-full" />
            <Skeleton className="h-12 w-full" />
          </div>
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="container-custom py-12">
        <div className="text-center">
          <p className="text-destructive mb-4">Product not found.</p>
          <Button onClick={() => navigate({ to: '/' })}>
            Return to Shop
          </Button>
        </div>
      </div>
    );
  }

  const priceFormatted = formatINR(product.price);

  return (
    <div className="container-custom py-12">
      <Button
        variant="ghost"
        className="mb-6 gap-2"
        onClick={() => navigate({ to: '/' })}
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Shop
      </Button>

      <div className="grid md:grid-cols-2 gap-12">
        {/* Product Image */}
        <div className="aspect-square overflow-hidden rounded-lg bg-muted">
          <ProductImage 
            photoUrl={product.photoUrl} 
            alt={product.name}
            className="w-full h-full object-cover"
          />
        </div>

        {/* Product Details */}
        <div className="space-y-6">
          <div>
            <div className="flex items-start justify-between mb-2">
              <h1 className="text-4xl font-serif font-bold">{product.name}</h1>
              <Badge variant={product.inStock ? 'default' : 'secondary'} className="text-sm">
                {product.inStock ? 'In Stock' : 'Out of Stock'}
              </Badge>
            </div>
            {product.scent && (
              <p className="text-lg text-muted-foreground">{product.scent}</p>
            )}
          </div>

          <div className="text-3xl font-bold text-primary">{priceFormatted}</div>

          {product.description && (
            <div>
              <h2 className="text-lg font-semibold mb-2">Description</h2>
              <p className="text-muted-foreground leading-relaxed">{product.description}</p>
            </div>
          )}

          {product.inStock ? (
            <div className="space-y-4">
              <AddToOrderControls product={product} variant="detail" />
              <Button 
                variant="outline" 
                className="w-full"
                onClick={() => navigate({ to: '/order' })}
              >
                View Order
              </Button>
            </div>
          ) : (
            <Button variant="secondary" disabled className="w-full">
              Out of Stock
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
