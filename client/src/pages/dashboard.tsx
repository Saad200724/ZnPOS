import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import Sidebar from "@/components/sidebar";
import DashboardStats from "@/components/dashboard-stats";
import POSModal from "@/components/pos-modal";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Plus, Bell, Package, UserPlus, BarChart, Users } from "lucide-react";

interface Transaction {
  id: number;
  transactionNumber: string;
  total: string;
  status: string;
  createdAt: string;
  user: { firstName: string; lastName: string };
  customer?: { firstName: string; lastName: string };
}

interface TopProduct {
  id: number;
  name: string;
  soldCount: number;
  revenue: string;
}

interface LowStockProduct {
  id: number;
  name: string;
  stock: number;
  lowStockThreshold: number;
}

export default function Dashboard() {
  const [isPOSOpen, setIsPOSOpen] = useState(false);

  const { data: recentTransactions = [] } = useQuery<Transaction[]>({
    queryKey: ["/api/dashboard/recent-transactions"],
  });

  const { data: topProducts = [] } = useQuery<TopProduct[]>({
    queryKey: ["/api/dashboard/top-products"],
  });

  const { data: lowStockProducts = [] } = useQuery<LowStockProduct[]>({
    queryKey: ["/api/dashboard/low-stock"],
  });

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
    
    if (diffMinutes < 1) return "Just now";
    if (diffMinutes < 60) return `${diffMinutes} min ago`;
    if (diffMinutes < 1440) return `${Math.floor(diffMinutes / 60)} hour(s) ago`;
    return date.toLocaleDateString();
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
      completed: "default",
      pending: "secondary",
      refunded: "destructive"
    };
    
    const colors: Record<string, string> = {
      completed: "bg-green-100 text-green-800",
      pending: "bg-yellow-100 text-yellow-800",
      refunded: "bg-red-100 text-red-800"
    };

    return (
      <Badge className={colors[status] || "bg-gray-100 text-gray-800"}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  };

  return (
    <div className="flex h-screen">
      <Sidebar />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="bg-white border-b border-gray-200 px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Dashboard</h2>
              <p className="text-gray-600">
                Today, {new Date().toLocaleDateString('en-US', { 
                  weekday: 'long', 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                })}
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <Button onClick={() => setIsPOSOpen(true)} className="btn-primary">
                <Plus className="w-4 h-4 mr-2" />
                New Sale
              </Button>
              <Button size="icon" variant="ghost" className="relative">
                <Bell className="h-5 w-5" />
                {lowStockProducts.length > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full w-5 h-5 text-xs flex items-center justify-center">
                    {lowStockProducts.length}
                  </span>
                )}
              </Button>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1 overflow-x-hidden overflow-y-auto p-6">
          <DashboardStats />

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Recent Transactions */}
            <div className="lg:col-span-2">
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle>Recent Transactions</CardTitle>
                    <Button variant="ghost" size="sm">View All</Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Transaction ID
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Customer
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Amount
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Status
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Time
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {recentTransactions.length === 0 ? (
                          <tr>
                            <td colSpan={5} className="px-6 py-8 text-center text-gray-500">
                              No transactions yet. Start your first sale!
                            </td>
                          </tr>
                        ) : (
                          recentTransactions.map((transaction) => (
                            <tr key={transaction.id} className="hover:bg-gray-50">
                              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                {transaction.transactionNumber}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                {transaction.customer 
                                  ? `${transaction.customer.firstName} ${transaction.customer.lastName}`
                                  : "Walk-in Customer"
                                }
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                ${transaction.total}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                {getStatusBadge(transaction.status)}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                {formatDate(transaction.createdAt)}
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="space-y-6">
              {/* Top Products */}
              <Card>
                <CardHeader>
                  <CardTitle>Top Products</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {topProducts.length === 0 ? (
                      <p className="text-center text-gray-500 py-4">
                        No sales data available
                      </p>
                    ) : (
                      topProducts.map((product) => (
                        <div key={product.id} className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <div className="w-10 h-10 bg-gray-200 rounded-lg"></div>
                            <div>
                              <p className="font-medium text-gray-900">{product.name}</p>
                              <p className="text-sm text-gray-500">{product.soldCount} sold</p>
                            </div>
                          </div>
                          <span className="text-sm font-medium text-gray-900">${product.revenue}</span>
                        </div>
                      ))
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Low Stock Alerts */}
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle>Low Stock Alerts</CardTitle>
                    <Badge variant="destructive">{lowStockProducts.length} items</Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {lowStockProducts.length === 0 ? (
                      <p className="text-center text-gray-500 py-4">
                        All products are well-stocked!
                      </p>
                    ) : (
                      lowStockProducts.map((product) => (
                        <div 
                          key={product.id} 
                          className={`flex items-center justify-between p-3 rounded-lg border ${
                            product.stock <= 2 ? 'bg-red-50 border-red-200' : 'bg-amber-50 border-amber-200'
                          }`}
                        >
                          <div>
                            <p className="font-medium text-gray-900">{product.name}</p>
                            <p className={`text-sm ${
                              product.stock <= 2 ? 'text-red-600' : 'text-amber-600'
                            }`}>
                              Only {product.stock} left
                            </p>
                          </div>
                          <Button 
                            size="sm" 
                            variant="ghost"
                            className={product.stock <= 2 ? 'text-red-600 hover:text-red-700' : 'text-amber-600 hover:text-amber-700'}
                          >
                            <Plus className="h-4 w-4" />
                          </Button>
                        </div>
                      ))
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="mt-8">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Button 
                variant="outline" 
                className="h-auto p-6 text-left justify-start flex-col items-start"
              >
                <div className="w-12 h-12 bg-emerald-100 rounded-lg flex items-center justify-center mb-4">
                  <Package className="text-emerald-600 text-xl" />
                </div>
                <h4 className="font-semibold text-gray-900 mb-2">Add Product</h4>
                <p className="text-sm text-gray-600">Add new inventory items to your catalog</p>
              </Button>

              <Button 
                variant="outline" 
                className="h-auto p-6 text-left justify-start flex-col items-start"
              >
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                  <UserPlus className="text-blue-600 text-xl" />
                </div>
                <h4 className="font-semibold text-gray-900 mb-2">Add Customer</h4>
                <p className="text-sm text-gray-600">Register new customers and manage profiles</p>
              </Button>

              <Button 
                variant="outline" 
                className="h-auto p-6 text-left justify-start flex-col items-start"
              >
                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
                  <BarChart className="text-purple-600 text-xl" />
                </div>
                <h4 className="font-semibold text-gray-900 mb-2">Generate Report</h4>
                <p className="text-sm text-gray-600">Create detailed sales and inventory reports</p>
              </Button>

              <Button 
                variant="outline" 
                className="h-auto p-6 text-left justify-start flex-col items-start"
              >
                <div className="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center mb-4">
                  <Users className="text-indigo-600 text-xl" />
                </div>
                <h4 className="font-semibold text-gray-900 mb-2">Manage Staff</h4>
                <p className="text-sm text-gray-600">Handle employee schedules and permissions</p>
              </Button>
            </div>
          </div>
        </main>
      </div>

      <POSModal isOpen={isPOSOpen} onClose={() => setIsPOSOpen(false)} />
    </div>
  );
}
