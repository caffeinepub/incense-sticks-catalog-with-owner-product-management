import { useState, useMemo } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { useGetAllProducts } from '../hooks/useProducts';
import ProductCard from '../components/ProductCard';
import ProductDiscoveryBar from '../components/ProductDiscoveryBar';
import { useOrderDraft } from '../hooks/useOrderDraft';
import { Button } from '@/components/ui/button';
import { ShoppingBag, Sparkles } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

export default function StorefrontCatalogPage() {
  const { data: products, isLoading, isFetched, error } = useGetAllProducts();
  const { items } = useOrderDraft();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedScent, setSelectedScent] = useState('all');

  const availableScents = useMemo(() => {
    if (!products) return [];
    const scents = products
      .map(p => p.scent)
      .filter(s => s && s.trim() !== '');
    return Array.from(new Set(scents));
  }, [products]);

  const filteredProducts = useMemo(() => {
    if (!products) return [];
    
    return products.filter(product => {
      const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           product.description.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesScent = selectedScent === 'all' || product.scent === selectedScent;
      return matchesSearch && matchesScent;
    });
  }, [products, searchQuery, selectedScent]);

  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);

  if (error) {
    return (
      <div className="container-custom py-12">
        <div className="text-center">
          <p className="text-destructive">Failed to load products. Please try again later.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative h-[400px] md:h-[500px] overflow-hidden">
        <img 
          src="/assets/generated/incense-hero.dim_1600x900.png" 
          alt="Harmony Incense - Handcrafted incense sticks" 
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background/80 to-transparent" />
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center space-y-4 px-4">
            <h1 className="text-4xl md:text-6xl font-serif font-bold text-foreground drop-shadow-lg">
              Find Your Harmony
            </h1>
            <p className="text-lg md:text-xl text-foreground/90 max-w-2xl mx-auto drop-shadow">
              Handcrafted incense sticks to elevate your space and spirit
            </p>
          </div>
        </div>
      </section>

      {/* Products Section */}
      <section className="container-custom py-12">
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-6">
            <Sparkles className="h-6 w-6 text-primary" />
            <h2 className="text-3xl font-serif font-bold">Our Collection</h2>
          </div>
          
          <ProductDiscoveryBar
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            selectedScent={selectedScent}
            onScentChange={setSelectedScent}
            availableScents={availableScents}
          />
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="space-y-4">
                <Skeleton className="aspect-square w-full" />
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
              </div>
            ))}
          </div>
        ) : isFetched && filteredProducts.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">
              {searchQuery || selectedScent !== 'all' 
                ? 'No products match your search criteria.' 
                : 'No products available at the moment.'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredProducts.map((product) => (
              <ProductCard key={product.id.toString()} product={product} />
            ))}
          </div>
        )}
      </section>

      {/* Floating Order Button */}
      {itemCount > 0 && (
        <div className="fixed bottom-6 right-6 z-40">
          <Button
            size="lg"
            className="rounded-full shadow-lg gap-2 h-14 px-6"
            onClick={() => navigate({ to: '/order' })}
          >
            <ShoppingBag className="h-5 w-5" />
            <span>Review Order ({itemCount})</span>
          </Button>
        </div>
      )}
    </div>
  );
}
