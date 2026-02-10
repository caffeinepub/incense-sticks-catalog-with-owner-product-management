import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import ProductAdminList from '../components/admin/ProductAdminList';
import OrderRequestsPanel from '../components/admin/OrderRequestsPanel';
import { Package, ShoppingCart } from 'lucide-react';

export default function AdminDashboardPage() {
  const [activeTab, setActiveTab] = useState('products');

  return (
    <div className="container-custom py-12">
      <div className="mb-8">
        <h1 className="text-4xl font-serif font-bold mb-2">Admin Dashboard</h1>
        <p className="text-muted-foreground">Manage your products and view order requests</p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full max-w-md grid-cols-2">
          <TabsTrigger value="products" className="gap-2">
            <Package className="h-4 w-4" />
            Products
          </TabsTrigger>
          <TabsTrigger value="orders" className="gap-2">
            <ShoppingCart className="h-4 w-4" />
            Order Requests
          </TabsTrigger>
        </TabsList>

        <TabsContent value="products" className="mt-6">
          <ProductAdminList />
        </TabsContent>

        <TabsContent value="orders" className="mt-6">
          <OrderRequestsPanel />
        </TabsContent>
      </Tabs>
    </div>
  );
}
