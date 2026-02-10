import { Search, X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface ProductDiscoveryBarProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  selectedScent: string;
  onScentChange: (scent: string) => void;
  availableScents: string[];
}

export default function ProductDiscoveryBar({
  searchQuery,
  onSearchChange,
  selectedScent,
  onScentChange,
  availableScents
}: ProductDiscoveryBarProps) {
  const hasFilters = searchQuery || selectedScent !== 'all';

  const handleClear = () => {
    onSearchChange('');
    onScentChange('all');
  };

  return (
    <div className="flex flex-col sm:flex-row gap-4 items-stretch sm:items-center">
      <div className="relative flex-1">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          type="text"
          placeholder="Search products..."
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pl-10"
        />
      </div>
      
      <Select value={selectedScent} onValueChange={onScentChange}>
        <SelectTrigger className="w-full sm:w-[200px]">
          <SelectValue placeholder="Filter by scent" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Scents</SelectItem>
          {availableScents.map((scent) => (
            <SelectItem key={scent} value={scent}>
              {scent}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {hasFilters && (
        <Button variant="outline" size="icon" onClick={handleClear}>
          <X className="h-4 w-4" />
        </Button>
      )}
    </div>
  );
}
