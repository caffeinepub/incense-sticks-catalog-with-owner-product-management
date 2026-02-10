import { useState, useEffect } from 'react';
import { type Product } from '../backend';
import { normalizePriceToPaise } from '../utils/currency';

interface OrderItem {
  product: Product;
  quantity: number;
}

const STORAGE_KEY = 'incense-order-draft';

function normalizeProduct(product: Product): Product {
  return {
    ...product,
    price: normalizePriceToPaise(product.price),
  };
}

function loadDraft(): OrderItem[] {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      // Convert bigint fields back from strings and normalize prices
      return parsed.map((item: any) => ({
        ...item,
        product: normalizeProduct({
          ...item.product,
          id: BigInt(item.product.id),
          price: BigInt(item.product.price),
        }),
      }));
    }
  } catch (error) {
    console.error('Failed to load order draft:', error);
  }
  return [];
}

function saveDraft(items: OrderItem[]) {
  try {
    // Convert bigint fields to strings for JSON serialization
    const serializable = items.map(item => ({
      ...item,
      product: {
        ...item.product,
        id: item.product.id.toString(),
        price: item.product.price.toString(),
      },
    }));
    localStorage.setItem(STORAGE_KEY, JSON.stringify(serializable));
  } catch (error) {
    console.error('Failed to save order draft:', error);
  }
}

export function useOrderDraft() {
  const [items, setItems] = useState<OrderItem[]>(() => loadDraft());

  useEffect(() => {
    saveDraft(items);
  }, [items]);

  const addItem = (product: Product, quantity: number = 1) => {
    // Normalize the product price when adding to cart
    const normalizedProduct = normalizeProduct(product);
    
    setItems(current => {
      const existing = current.find(item => item.product.id === normalizedProduct.id);
      if (existing) {
        return current.map(item =>
          item.product.id === normalizedProduct.id
            ? { ...item, quantity: item.quantity + quantity }
            : item
        );
      }
      return [...current, { product: normalizedProduct, quantity }];
    });
  };

  const updateQuantity = (productId: bigint, quantity: number) => {
    if (quantity <= 0) {
      removeItem(productId);
      return;
    }
    setItems(current =>
      current.map(item =>
        item.product.id === productId ? { ...item, quantity } : item
      )
    );
  };

  const removeItem = (productId: bigint) => {
    setItems(current => current.filter(item => item.product.id !== productId));
  };

  const clearDraft = () => {
    setItems([]);
    localStorage.removeItem(STORAGE_KEY);
  };

  return {
    items,
    addItem,
    updateQuantity,
    removeItem,
    clearDraft,
  };
}
