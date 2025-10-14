import React, { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Package, Check } from 'lucide-react';

interface Product {
  id: number;
  name: string;
  stock: number;
  image?: string;
}

export default function FixProducts() {
  const [updates, setUpdates] = useState<Record<number, { stock: number; image: string }>>({});

  const { data: products = [], refetch } = useQuery({
    queryKey: ['products-fix'],
    queryFn: async () => {
      const response = await fetch('/api/products');
      if (!response.ok) throw new Error('Failed to fetch products');
      return response.json();
    }
  });

  const bulkUpdateMutation = useMutation({
    mutationFn: async (productUpdates: any[]) => {
      const response = await fetch('/api/products/bulk-update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ updates: productUpdates })
      });
      if (!response.ok) throw new Error('Failed to update products');
      return response.json();
    },
    onSuccess: () => {
      refetch();
      setUpdates({});
      alert('Products updated successfully!');
    }
  });

  const handleUpdate = (productId: number, field: 'stock' | 'image', value: string | number) => {
    setUpdates(prev => ({
      ...prev,
      [productId]: {
        ...prev[productId],
        stock: field === 'stock' ? Number(value) : (prev[productId]?.stock || 0),
        image: field === 'image' ? String(value) : (prev[productId]?.image || '')
      }
    }));
  };

  const handleSubmit = () => {
    const productUpdates = Object.entries(updates).map(([id, data]) => ({
      id: Number(id),
      ...data
    }));
    
    if (productUpdates.length === 0) {
      alert('No updates to save');
      return;
    }

    bulkUpdateMutation.mutate(productUpdates);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-6xl mx-auto">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Package className="w-6 h-6 mr-2" />
              Fix Product Stock & Images
            </CardTitle>
            <p className="text-sm text-gray-600 mt-2">
              Update stock amounts and image URLs for your existing products
            </p>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {products.map((product: Product) => (
                <div key={product.id} className="border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <h3 className="font-semibold text-lg">{product.name}</h3>
                      <p className="text-sm text-gray-500">
                        Current Stock: {product.stock || 0} | 
                        Image: {product.image ? '✓ Set' : '✗ Not Set'}
                      </p>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor={`stock-${product.id}`}>New Stock Amount</Label>
                      <Input
                        id={`stock-${product.id}`}
                        type="number"
                        placeholder={String(product.stock || 0)}
                        value={updates[product.id]?.stock ?? ''}
                        onChange={(e) => handleUpdate(product.id, 'stock', e.target.value)}
                      />
                    </div>
                    <div>
                      <Label htmlFor={`image-${product.id}`}>Image URL</Label>
                      <Input
                        id={`image-${product.id}`}
                        type="text"
                        placeholder={product.image || 'https://example.com/image.jpg'}
                        value={updates[product.id]?.image ?? ''}
                        onChange={(e) => handleUpdate(product.id, 'image', e.target.value)}
                      />
                    </div>
                  </div>
                  {product.image && (
                    <div className="mt-3">
                      <img 
                        src={product.image} 
                        alt={product.name} 
                        className="h-20 w-20 object-cover rounded border"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = '/placeholder-product.png';
                        }}
                      />
                    </div>
                  )}
                </div>
              ))}

              {products.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  No products found. Please log in as admin to view products.
                </div>
              )}

              {products.length > 0 && (
                <div className="flex justify-end pt-4">
                  <Button 
                    onClick={handleSubmit}
                    disabled={bulkUpdateMutation.isPending || Object.keys(updates).length === 0}
                    className="btn-primary"
                  >
                    <Check className="w-4 h-4 mr-2" />
                    {bulkUpdateMutation.isPending ? 'Updating...' : `Update ${Object.keys(updates).length} Products`}
                  </Button>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
