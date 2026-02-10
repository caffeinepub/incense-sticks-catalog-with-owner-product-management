import { Link } from '@tanstack/react-router';
import { ShieldAlert } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface AccessDeniedScreenProps {
  message?: string;
}

export default function AccessDeniedScreen({ 
  message = "You don't have permission to access this page." 
}: AccessDeniedScreenProps) {
  return (
    <div className="container-custom py-24">
      <div className="max-w-md mx-auto text-center">
        <ShieldAlert className="h-16 w-16 text-destructive mx-auto mb-6" />
        <h1 className="text-3xl font-bold mb-4">Access Denied</h1>
        <p className="text-muted-foreground mb-8">{message}</p>
        <Button asChild>
          <Link to="/">Return to Shop</Link>
        </Button>
      </div>
    </div>
  );
}
