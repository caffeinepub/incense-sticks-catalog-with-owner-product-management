import { Link } from '@tanstack/react-router';
import { type Product } from '../backend';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import ProductImage from './ProductImage';
import AddToOrderControls from './AddToOrderControls';
import { formatINR } from '../utils/currency';

interface ProductCardProps {
  product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
  const priceFormatted = formatINR(product.price);

  return (
    <Card className="overflow-hidden hover:shadow-soft transition-shadow">
      <Link to="/product/$productId" params={{ productId: product.id.toString() }}>
        <div className="aspect-square overflow-hidden bg-muted">
          <ProductImage 
            photoUrl={product.photoUrl} 
            alt={product.name}
            className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
          />
        </div>
      </Link>
      <CardContent className="p-4">
        <div className="flex items-start justify-between mb-2">
          <Link to="/product/$productId" params={{ productId: product.id.toString() }}>
            <h3 className="font-semibold text-lg hover:text-primary transition-colors">
              {product.name}
            </h3>
          </Link>
          <Badge variant={product.inStock ? 'default' : 'secondary'}>
            {product.inStock ? 'In Stock' : 'Out of Stock'}
          </Badge>
        </div>
        {product.scent && (
          <p className="text-sm text-muted-foreground mb-2">{product.scent}</p>
        )}
        <p className="text-xl font-bold text-primary">{priceFormatted}</p>
      </CardContent>
      <CardFooter className="p-4 pt-0">
        {product.inStock ? (
          <AddToOrderControls product={product} />
        ) : (
          <Button variant="secondary" disabled className="w-full">
            Out of Stock
          </Button>
        )}
      </CardFooter>
    </Card>
  );
}
