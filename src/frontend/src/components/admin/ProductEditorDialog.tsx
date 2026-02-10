import { useState, useEffect } from 'react';
import { type Product } from '../../backend';
import { useCreateProduct, useUpdateProduct } from '../../hooks/useAdminProducts';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { paiseToRupees, rupeesToPaise } from '../../utils/currency';

interface ProductEditorDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  product: Product | null;
}

export default function ProductEditorDialog({ open, onOpenChange, product }: ProductEditorDialogProps) {
  const createProduct = useCreateProduct();
  const updateProduct = useUpdateProduct();
  
  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [description, setDescription] = useState('');
  const [scent, setScent] = useState('');
  const [photoUrl, setPhotoUrl] = useState('');

  useEffect(() => {
    if (product) {
      setName(product.name);
      // Use paiseToRupees to properly convert normalized paise to rupees for display
      setPrice(paiseToRupees(product.price).toFixed(2));
      setDescription(product.description);
      setScent(product.scent);
      setPhotoUrl(product.photoUrl);
    } else {
      setName('');
      setPrice('');
      setDescription('');
      setScent('');
      setPhotoUrl('');
    }
  }, [product, open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim()) {
      toast.error('Product name is required');
      return;
    }

    const priceNum = parseFloat(price);
    if (isNaN(priceNum) || priceNum <= 0) {
      toast.error('Please enter a valid price');
      return;
    }

    // Convert rupees to paise for backend storage
    const priceInPaise = rupeesToPaise(priceNum);

    try {
      if (product) {
        await updateProduct.mutateAsync({
          productId: product.id,
          name: name.trim(),
          price: priceInPaise,
          description: description.trim(),
          scent: scent.trim(),
          photoUrl: photoUrl.trim()
        });
        toast.success('Product updated successfully');
      } else {
        await createProduct.mutateAsync({
          name: name.trim(),
          price: priceInPaise,
          description: description.trim(),
          scent: scent.trim(),
          photoUrl: photoUrl.trim()
        });
        toast.success('Product created successfully');
      }
      onOpenChange(false);
    } catch (error) {
      toast.error(product ? 'Failed to update product' : 'Failed to create product');
    }
  };

  const isPending = createProduct.isPending || updateProduct.isPending;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>{product ? 'Edit Product' : 'Create Product'}</DialogTitle>
          <DialogDescription>
            {product ? 'Update the product details below.' : 'Add a new product to your catalog.'}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Product Name *</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Lavender Dreams"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="price">Price (₹) *</Label>
            <Input
              id="price"
              type="number"
              step="0.01"
              min="0"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              placeholder="299.00"
              required
            />
            <p className="text-xs text-muted-foreground">
              Enter price in rupees (e.g., 299.00 for ₹299.00)
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="scent">Scent</Label>
            <Input
              id="scent"
              value={scent}
              onChange={(e) => setScent(e.target.value)}
              placeholder="Lavender, Sandalwood, etc."
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe the product..."
              rows={4}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="photoUrl">Photo URL</Label>
            <Input
              id="photoUrl"
              value={photoUrl}
              onChange={(e) => setPhotoUrl(e.target.value)}
              placeholder="/assets/generated/incense-placeholder.dim_800x800.png"
            />
            <p className="text-xs text-muted-foreground">
              Use /assets/generated/incense-placeholder.dim_800x800.png for placeholder
            </p>
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isPending}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending ? 'Saving...' : product ? 'Update Product' : 'Create Product'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
