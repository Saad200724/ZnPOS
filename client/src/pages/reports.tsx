import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import Sidebar from "@/components/sidebar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DatePickerWithRange } from "@/components/ui/date-range-picker";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { 
  BarChart, 
  DollarSign, 
  TrendingUp, 
  Package, 
  Users, 
  Download,
  Calendar,
  Filter
} from "lucide-react";
import { DateRange } from "react-day-picker";
import { addDays, format } from "date-fns";

interface SalesData {
  date: string;
  sales: number;
  transactions: number;
}

interface TopProduct {
  id: number;
  name: string;
  soldCount: number;
  revenue: string;
}

interface Transaction {
  id: number;
  transactionNumber: string;
  total: string;
  status: string;
  createdAt: string;
  user: { firstName: string; lastName: string };
  customer?: { firstName: string; lastName: string };
}

export default function Reports() {
  const [dateRange, setDateRange] = useState<DateRange | undefined>({
    from: addDays(new Date(), -30),
    to: new Date(),
  });
  const [reportType, setReportType] = useState("sales");

  const { data: stats = {} } = useQuery({
    queryKey: ["/api/dashboard/stats"],
  });

  const { data: topProducts = [] } = useQuery<TopProduct[]>({
    queryKey: ["/api/dashboard/top-products"],
  });

  const { data: recentTransactions = [] } = useQuery<Transaction[]>({
    queryKey: ["/api/dashboard/recent-transactions"],
  });

  // Mock data for demonstration - in real implementation this would come from API
  const salesData: SalesData[] = [
    { date: "2024-01-01", sales: 1200, transactions: 45 },
    { date: "2024-01-02", sales: 1450, transactions: 52 },
    { date: "2024-01-03", sales: 980, transactions: 38 },
    { date: "2024-01-04", sales: 1680, transactions: 61 },
    { date: "2024-01-05", sales: 1320, transactions: 48 },
    { date: "2024-01-06", sales: 1890, transactions: 67 },
    { date: "2024-01-07", sales: 2100, transactions: 74 },
  ];

  const inventoryReport = [
    { category: "Beverages", totalItems: 45, totalValue: 2340, lowStock: 3 },
    { category: "Food", totalItems: 32, totalValue: 1890, lowStock: 2 },
    { category: "Retail", totalItems: 28, totalValue: 1560, lowStock: 1 },
  ];

  const formatCurrency = (amount: number) => `$${amount.toFixed(2)}`;

  const handleExportReport = () => {
    // Mock export functionality
    const blob = new Blob(['Sales Report Data'], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${reportType}-report-${format(new Date(), 'yyyy-MM-dd')}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  return (
    <div className="flex h-screen">
      <Sidebar />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="bg-white border-b border-gray-200 px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Reports & Analytics</h2>
              <p className="text-gray-600">Comprehensive business insights and reporting</p>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <Calendar className="w-4 h-4 text-gray-500" />
                <DatePickerWithRange 
                  date={dateRange} 
                  onDateChange={setDateRange}
                />
              </div>
              <Button onClick={handleExportReport} variant="outline">
                <Download className="w-4 h-4 mr-2" />
                Export
              </Button>
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-6">
          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-600 text-sm font-medium">Total Revenue</p>
                    <p className="text-3xl font-bold text-gray-900">
                      ${(stats as any)?.todaySales ? parseFloat((stats as any).todaySales) * 30 : 0}
                    </p>
                    <p className="text-emerald-600 text-sm font-medium mt-1">
                      ↑ {(stats as any)?.todayGrowth || '0'}% vs last period
                    </p>
                  </div>
                  <div className="w-12 h-12 bg-emerald-100 rounded-lg flex items-center justify-center">
                    <DollarSign className="text-emerald-600 text-xl" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-600 text-sm font-medium">Total Transactions</p>
                    <p className="text-3xl font-bold text-gray-900">
                      {(stats as any)?.todayTransactions ? (stats as any).todayTransactions * 30 : 0}
                    </p>
                    <p className="text-blue-600 text-sm font-medium mt-1">
                      ↑ {(stats as any)?.transactionGrowth || '0'}% vs last period
                    </p>
                  </div>
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                    <BarChart className="text-blue-600 text-xl" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-600 text-sm font-medium">Average Order</p>
                    <p className="text-3xl font-bold text-gray-900">${(stats as any)?.averageSale || '0'}</p>
                    <p className="text-purple-600 text-sm font-medium mt-1">
                      ↑ {(stats as any)?.averageGrowth || '0'}% vs last period
                    </p>
                  </div>
                  <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                    <TrendingUp className="text-purple-600 text-xl" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-600 text-sm font-medium">Active Products</p>
                    <p className="text-3xl font-bold text-gray-900">{topProducts.length}</p>
                    <p className="text-amber-600 text-sm font-medium mt-1">
                      {(stats as any)?.lowStockCount || 0} low stock alerts
                    </p>
                  </div>
                  <div className="w-12 h-12 bg-amber-100 rounded-lg flex items-center justify-center">
                    <Package className="text-amber-600 text-xl" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Report Tabs */}
          <Tabs value={reportType} onValueChange={setReportType} className="space-y-6">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="sales">Sales Report</TabsTrigger>
              <TabsTrigger value="inventory">Inventory Report</TabsTrigger>
              <TabsTrigger value="customers">Customer Report</TabsTrigger>
              <TabsTrigger value="financial">Financial Report</TabsTrigger>
            </TabsList>

            <TabsContent value="sales" className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Sales Chart Area */}
                <div className="lg:col-span-2">
                  <Card>
                    <CardHeader>
                      <CardTitle>Daily Sales Performance</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="h-80 bg-gray-50 rounded-lg flex items-center justify-center">
                        <div className="text-center">
                          <BarChart className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                          <p className="text-gray-500">Interactive sales chart would be displayed here</p>
                          <p className="text-sm text-gray-400 mt-2">
                            Integration with Chart.js or similar visualization library
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Top Products */}
                <div>
                  <Card>
                    <CardHeader>
                      <CardTitle>Top Performing Products</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {topProducts.length === 0 ? (
                          <p className="text-center text-gray-500 py-8">
                            No sales data available for the selected period
                          </p>
                        ) : (
                          topProducts.map((product, index) => (
                            <div key={product.id} className="flex items-center justify-between">
                              <div className="flex items-center space-x-3">
                                <div className="w-8 h-8 bg-emerald-100 rounded-lg flex items-center justify-center">
                                  <span className="text-emerald-600 font-bold text-sm">{index + 1}</span>
                                </div>
                                <div>
                                  <p className="font-medium text-gray-900">{product.name}</p>
                                  <p className="text-sm text-gray-500">{product.soldCount} units sold</p>
                                </div>
                              </div>
                              <span className="text-sm font-semibold text-gray-900">${product.revenue}</span>
                            </div>
                          ))
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>

              {/* Recent Transactions */}
              <Card>
                <CardHeader>
                  <CardTitle>Recent Transactions</CardTitle>
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
                            Date
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {recentTransactions.slice(0, 10).map((transaction) => (
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
                              <Badge className={
                                transaction.status === 'completed' ? 'bg-green-100 text-green-800' :
                                transaction.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                                'bg-red-100 text-red-800'
                              }>
                                {transaction.status.charAt(0).toUpperCase() + transaction.status.slice(1)}
                              </Badge>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {format(new Date(transaction.createdAt), 'MMM dd, yyyy')}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="inventory" className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <Card>
                  <CardHeader>
                    <CardTitle>Inventory Overview</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {inventoryReport.map((category, index) => (
                        <div key={index} className="bg-gray-50 rounded-lg p-4">
                          <div className="flex items-center justify-between mb-2">
                            <h4 className="font-medium text-gray-900">{category.category}</h4>
                            {category.lowStock > 0 && (
                              <Badge variant="destructive">{category.lowStock} low stock</Badge>
                            )}
                          </div>
                          <div className="grid grid-cols-2 gap-4 text-sm">
                            <div>
                              <p className="text-gray-600">Total Items:</p>
                              <p className="font-semibold">{category.totalItems}</p>
                            </div>
                            <div>
                              <p className="text-gray-600">Total Value:</p>
                              <p className="font-semibold">${category.totalValue}</p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Stock Movement</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="h-64 bg-gray-50 rounded-lg flex items-center justify-center">
                      <div className="text-center">
                        <TrendingUp className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                        <p className="text-gray-500">Stock movement chart would be displayed here</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="customers" className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <Card>
                  <CardHeader>
                    <CardTitle>Customer Metrics</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-6">
                      <div className="text-center">
                        <Users className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                        <p className="text-gray-500">Customer analytics and insights</p>
                        <p className="text-sm text-gray-400 mt-2">
                          Detailed customer behavior analysis would be displayed here
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Customer Lifetime Value</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="h-64 bg-gray-50 rounded-lg flex items-center justify-center">
                      <div className="text-center">
                        <DollarSign className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                        <p className="text-gray-500">CLV analysis would be displayed here</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="financial" className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <Card>
                  <CardHeader>
                    <CardTitle>Profit & Loss Summary</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex justify-between items-center py-2 border-b">
                        <span className="text-gray-600">Revenue</span>
                        <span className="font-semibold text-green-600">
                          +${(stats as any)?.todaySales ? (parseFloat((stats as any).todaySales) * 30).toFixed(2) : '0.00'}
                        </span>
                      </div>
                      <div className="flex justify-between items-center py-2 border-b">
                        <span className="text-gray-600">Cost of Goods</span>
                        <span className="font-semibold text-red-600">
                          -${(stats as any)?.todaySales ? (parseFloat((stats as any).todaySales) * 30 * 0.6).toFixed(2) : '0.00'}
                        </span>
                      </div>
                      <div className="flex justify-between items-center py-2 border-b">
                        <span className="text-gray-600">Operating Expenses</span>
                        <span className="font-semibold text-red-600">-$2,500.00</span>
                      </div>
                      <div className="flex justify-between items-center py-3 border-t-2 font-bold">
                        <span>Net Profit</span>
                        <span className="text-emerald-600">
                          +${(stats as any)?.todaySales ? (parseFloat((stats as any).todaySales) * 30 * 0.4 - 2500).toFixed(2) : '0.00'}
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Tax Summary</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="bg-gray-50 rounded-lg p-4">
                        <h4 className="font-medium text-gray-900 mb-2">Sales Tax Collected</h4>
                        <p className="text-2xl font-bold text-gray-900">
                          ${(stats as any)?.todaySales ? (parseFloat((stats as any).todaySales) * 30 * 0.0825).toFixed(2) : '0.00'}
                        </p>
                        <p className="text-sm text-gray-600 mt-1">
                          Based on 8.25% tax rate for 30-day period
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </main>
      </div>
    </div>
  );
}
