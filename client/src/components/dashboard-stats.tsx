import { useQuery } from "@tanstack/react-query";
import { DollarSign, Receipt, TrendingUp, AlertTriangle } from "lucide-react";

interface DashboardStats {
  todaySales: string;
  todayTransactions: number;
  averageSale: string;
  lowStockCount: number;
  todayGrowth: string;
  transactionGrowth: string;
  averageGrowth: string;
}

export default function DashboardStats() {
  const { data: stats, isLoading } = useQuery<DashboardStats>({
    queryKey: ["/api/dashboard/stats"],
  });

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="stats-card animate-pulse">
            <div className="h-4 bg-gray-200 rounded mb-2"></div>
            <div className="h-8 bg-gray-200 rounded mb-2"></div>
            <div className="h-3 bg-gray-200 rounded w-1/2"></div>
          </div>
        ))}
      </div>
    );
  }

  if (!stats) {
    return null;
  }

  const formatGrowth = (growth: string) => {
    const num = parseFloat(growth);
    const isPositive = num >= 0;
    return {
      value: `${Math.abs(num).toFixed(1)}%`,
      isPositive,
      color: isPositive ? "text-emerald-600" : "text-red-600",
      icon: isPositive ? "↑" : "↓"
    };
  };

  const todayGrowth = formatGrowth(stats.todayGrowth);
  const transactionGrowth = formatGrowth(stats.transactionGrowth);
  const averageGrowth = formatGrowth(stats.averageGrowth);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      {/* Today's Sales */}
      <div className="stats-card">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-gray-600 text-sm font-medium">Today's Sales</p>
            <p className="text-3xl font-bold text-gray-900">${stats.todaySales}</p>
            <p className={`${todayGrowth.color} text-sm font-medium mt-1`}>
              {todayGrowth.icon} {todayGrowth.value} from yesterday
            </p>
          </div>
          <div className="w-12 h-12 bg-emerald-100 rounded-lg flex items-center justify-center">
            <DollarSign className="text-emerald-600 text-xl" />
          </div>
        </div>
      </div>

      {/* Transactions */}
      <div className="stats-card">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-gray-600 text-sm font-medium">Transactions</p>
            <p className="text-3xl font-bold text-gray-900">{stats.todayTransactions}</p>
            <p className={`${transactionGrowth.color} text-sm font-medium mt-1`}>
              {transactionGrowth.icon} {transactionGrowth.value} from yesterday
            </p>
          </div>
          <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
            <Receipt className="text-blue-600 text-xl" />
          </div>
        </div>
      </div>

      {/* Average Sale */}
      <div className="stats-card">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-gray-600 text-sm font-medium">Average Sale</p>
            <p className="text-3xl font-bold text-gray-900">${stats.averageSale}</p>
            <p className={`${averageGrowth.color} text-sm font-medium mt-1`}>
              {averageGrowth.icon} {averageGrowth.value} from yesterday
            </p>
          </div>
          <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
            <TrendingUp className="text-purple-600 text-xl" />
          </div>
        </div>
      </div>

      {/* Low Stock Items */}
      <div className="stats-card">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-gray-600 text-sm font-medium">Low Stock Items</p>
            <p className="text-3xl font-bold text-gray-900">{stats.lowStockCount}</p>
            <p className="text-amber-600 text-sm font-medium mt-1">
              <AlertTriangle className="inline w-4 h-4 mr-1" />
              Needs attention
            </p>
          </div>
          <div className="w-12 h-12 bg-amber-100 rounded-lg flex items-center justify-center">
            <AlertTriangle className="text-amber-600 text-xl" />
          </div>
        </div>
      </div>
    </div>
  );
}
