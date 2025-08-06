import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useAuth } from "@/lib/auth";
import { Search, Barcode, Plus, Minus, Trash2, CreditCard, Banknote, Smartphone } from "lucide-react";

interface Product {
  id: number;
  name: string;
  price: string;
  stock: number;
  categoryId?: number;
}

interface Customer {
  id: number;
  firstName: string;
  lastName: string;
}

interface CartItem {
  product: Product;
  quantity: number;
  total: number;
}

interface POSModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function POSModal({ isOpen, onClose }: POSModalProps) {
  const { toast } = useToast();
  const { business } = useAuth();
  const [cart, setCart] = useState<CartItem[]>([]);
  const [selectedCustomerId, setSelectedCustomerId] = useState<string>("");
  const [searchQuery, setSearchQuery] = useState("");

  const { data: products = [] } = useQuery<Product[]>({
    queryKey: ["/api/products"],
  });

  const { data: customers = [] } = useQuery<Customer[]>({
    queryKey: ["/api/customers"],
  });

  const transactionMutation = useMutation({
    mutationFn: async (data: any) => {
      const res = await apiRequest("POST", "/api/transactions", data);
      return await res.json();
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Transaction completed successfully!",
      });
      setCart([]);
      setSelectedCustomerId("");
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard/stats"] });
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard/recent-transactions"] });
      queryClient.invalidateQueries({ queryKey: ["/api/products"] });
      onClose();
    },
    onError: (error: any) => {
      toast({
        title: "Transaction Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const filteredProducts = products.filter(product =>
    product.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const addToCart = (product: Product) => {
    const existingItem = cart.find(item => item.product.id === product.id);
    
    if (existingItem) {
      if (existingItem.quantity >= product.stock) {
        toast({
          title: "Out of Stock",
          description: `Only ${product.stock} items available`,
          variant: "destructive",
        });
        return;
      }
      
      setCart(cart.map(item =>
        item.product.id === product.id
          ? { 
              ...item, 
              quantity: item.quantity + 1, 
              total: (item.quantity + 1) * parseFloat(product.price) 
            }
          : item
      ));
    } else {
      if (product.stock <= 0) {
        toast({
          title: "Out of Stock",
          description: "This product is out of stock",
          variant: "destructive",
        });
        return;
      }
      
      setCart([...cart, {
        product,
        quantity: 1,
        total: parseFloat(product.price)
      }]);
    }
  };

  const updateQuantity = (productId: number, newQuantity: number) => {
    if (newQuantity <= 0) {
      removeFromCart(productId);
      return;
    }
    
    const product = products.find(p => p.id === productId);
    if (product && newQuantity > product.stock) {
      toast({
        title: "Out of Stock",
        description: `Only ${product.stock} items available`,
        variant: "destructive",
      });
      return;
    }
    
    setCart(cart.map(item =>
      item.product.id === productId
        ? { 
            ...item, 
            quantity: newQuantity, 
            total: newQuantity * parseFloat(item.product.price) 
          }
        : item
    ));
  };

  const removeFromCart = (productId: number) => {
    setCart(cart.filter(item => item.product.id !== productId));
  };

  const calculateTotals = () => {
    const subtotal = cart.reduce((sum, item) => sum + item.total, 0);
    const taxRate = parseFloat(business?.taxRate || "0.0825");
    const tax = subtotal * taxRate;
    const total = subtotal + tax;
    
    return {
      subtotal: subtotal.toFixed(2),
      tax: tax.toFixed(2),
      total: total.toFixed(2)
    };
  };

  const processPayment = (paymentMethod: string) => {
    if (cart.length === 0) {
      toast({
        title: "Error",
        description: "Cart is empty",
        variant: "destructive",
      });
      return;
    }

    const totals = calculateTotals();
    
    const transactionData = {
      subtotal: totals.subtotal,
      taxAmount: totals.tax,
      total: totals.total,
      paymentMethod,
      customerId: selectedCustomerId && selectedCustomerId !== "walk-in" ? parseInt(selectedCustomerId) : null,
      status: "completed"
    };

    const items = cart.map(item => ({
      productId: item.product.id,
      quantity: item.quantity,
      unitPrice: item.product.price,
      total: item.total.toFixed(2)
    }));

    transactionMutation.mutate({ transaction: transactionData, items });
  };

  const totals = calculateTotals();

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-hidden p-0">
        <div className="flex h-[80vh]">
          {/* Product Selection */}
          <div className="flex-1 p-6 border-r border-gray-200 overflow-y-auto">
            <DialogHeader className="mb-6">
              <DialogTitle>Products</DialogTitle>
              <div className="flex items-center space-x-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Search products..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <Button size="icon" variant="outline">
                  <Barcode className="h-4 w-4" />
                </Button>
              </div>
            </DialogHeader>

            {/* Product Grid */}
            <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredProducts.map((product) => (
                <Card
                  key={product.id}
                  className="p-4 cursor-pointer hover:shadow-md transition-shadow"
                  onClick={() => addToCart(product)}
                >
                  <div className="w-full h-32 bg-gray-200 rounded-lg mb-3"></div>
                  <h4 className="font-medium text-gray-900 mb-1">{product.name}</h4>
                  <p className="text-emerald-600 font-semibold">${product.price}</p>
                  <p className="text-xs text-gray-500 mt-1">Stock: {product.stock}</p>
                </Card>
              ))}
            </div>
          </div>

          {/* Cart and Checkout */}
          <div className="w-96 bg-gray-50 p-6 flex flex-col">
            <DialogHeader className="mb-6">
              <DialogTitle>Current Sale</DialogTitle>
            </DialogHeader>

            {/* Customer Selection */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">Customer</label>
              <Select value={selectedCustomerId} onValueChange={setSelectedCustomerId}>
                <SelectTrigger>
                  <SelectValue placeholder="Walk-in Customer" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="walk-in">Walk-in Customer</SelectItem>
                  {customers.map((customer) => (
                    <SelectItem key={customer.id} value={customer.id.toString()}>
                      {customer.firstName} {customer.lastName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Cart Items */}
            <div className="flex-1 overflow-y-auto mb-6">
              <h4 className="font-medium text-gray-900 mb-4">
                Items ({cart.reduce((sum, item) => sum + item.quantity, 0)})
              </h4>
              <div className="space-y-3">
                {cart.map((item) => (
                  <Card key={item.product.id} className="p-3">
                    <div className="flex items-center justify-between mb-2">
                      <h5 className="font-medium text-gray-900">{item.product.name}</h5>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => removeFromCart(item.product.id)}
                        className="text-red-500 hover:text-red-700 p-1"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
                          className="w-7 h-7 p-0"
                        >
                          <Minus className="h-3 w-3" />
                        </Button>
                        <span className="font-medium">{item.quantity}</span>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                          className="w-7 h-7 p-0"
                        >
                          <Plus className="h-3 w-3" />
                        </Button>
                      </div>
                      <span className="font-semibold text-emerald-600">${item.total.toFixed(2)}</span>
                    </div>
                  </Card>
                ))}
              </div>
            </div>

            {/* Order Summary */}
            <div className="border-t border-gray-200 pt-4 space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Subtotal:</span>
                <span className="font-medium">${totals.subtotal}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Tax:</span>
                <span className="font-medium">${totals.tax}</span>
              </div>
              <div className="flex justify-between text-lg font-semibold border-t border-gray-200 pt-3">
                <span>Total:</span>
                <span className="text-emerald-600">${totals.total}</span>
              </div>
            </div>

            {/* Payment Methods */}
            <div className="mt-6 space-y-3">
              <Button
                onClick={() => processPayment("cash")}
                disabled={cart.length === 0 || transactionMutation.isPending}
                className="w-full btn-primary"
              >
                <Banknote className="w-4 h-4 mr-2" />
                Cash Payment
              </Button>
              <Button
                onClick={() => processPayment("card")}
                disabled={cart.length === 0 || transactionMutation.isPending}
                className="w-full bg-blue-500 hover:bg-blue-600 text-white"
              >
                <CreditCard className="w-4 h-4 mr-2" />
                Card Payment
              </Button>
              <Button
                onClick={() => processPayment("mobile")}
                disabled={cart.length === 0 || transactionMutation.isPending}
                className="w-full bg-gray-500 hover:bg-gray-600 text-white"
              >
                <Smartphone className="w-4 h-4 mr-2" />
                Mobile Payment
              </Button>
            </div>

            {/* Action Buttons */}
            <div className="flex space-x-3 mt-4">
              <Button 
                variant="secondary" 
                className="flex-1"
                disabled={transactionMutation.isPending}
              >
                Hold
              </Button>
              <Button 
                variant="destructive" 
                className="flex-1"
                onClick={() => {
                  setCart([]);
                  setSelectedCustomerId("");
                }}
                disabled={transactionMutation.isPending}
              >
                Cancel
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
