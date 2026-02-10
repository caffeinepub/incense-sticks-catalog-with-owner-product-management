import { RouterProvider, createRouter, createRoute, createRootRoute } from '@tanstack/react-router';
import { ThemeProvider } from 'next-themes';
import Layout from './components/Layout';
import StorefrontCatalogPage from './pages/StorefrontCatalogPage';
import ProductDetailPage from './pages/ProductDetailPage';
import OrderRequestPage from './pages/OrderRequestPage';
import OrderConfirmationPage from './pages/OrderConfirmationPage';
import AdminDashboardPage from './pages/AdminDashboardPage';
import AdminRoute from './components/AdminRoute';
import ProfileSetupDialog from './components/ProfileSetupDialog';
import { Toaster } from '@/components/ui/sonner';

const rootRoute = createRootRoute({
  component: () => (
    <>
      <ProfileSetupDialog />
      <Layout />
    </>
  )
});

const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/',
  component: StorefrontCatalogPage
});

const productDetailRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/product/$productId',
  component: ProductDetailPage
});

const orderRequestRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/order',
  component: OrderRequestPage
});

const orderConfirmationRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/order/confirmation',
  component: OrderConfirmationPage
});

const adminRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/admin',
  component: () => (
    <AdminRoute>
      <AdminDashboardPage />
    </AdminRoute>
  )
});

const routeTree = rootRoute.addChildren([
  indexRoute,
  productDetailRoute,
  orderRequestRoute,
  orderConfirmationRoute,
  adminRoute
]);

const router = createRouter({ routeTree });

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router;
  }
}

export default function App() {
  return (
    <ThemeProvider attribute="class" defaultTheme="light" enableSystem>
      <RouterProvider router={router} />
      <Toaster />
    </ThemeProvider>
  );
}
