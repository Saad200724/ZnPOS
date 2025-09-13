import { Link, useLocation } from "wouter";
import { useAuth } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { 
  LayoutDashboard, 
  ShoppingCart, 
  Package, 
  Users, 
  UserCheck, 
  BarChart3, 
  Settings, 
  LogOut 
} from "lucide-react";
import znforgeLogo from "@assets/ZnForge_Logo_1757783430022.png";

const navigation = [
  { name: "Dashboard", href: "/", icon: LayoutDashboard, permission: null },
  { name: "Point of Sale", href: "/pos", icon: ShoppingCart, permission: "pos" as const },
  { name: "Inventory", href: "/inventory", icon: Package, permission: "inventory" as const },
  { name: "Customers", href: "/customers", icon: Users, permission: "customers" as const },
  { name: "Employees", href: "/employees", icon: UserCheck, permission: "employees" as const },
  { name: "Reports", href: "/reports", icon: BarChart3, permission: "reports" as const },
  { name: "Settings", href: "/settings", icon: Settings, permission: "settings" as const },
];

export default function Sidebar() {
  const [location] = useLocation();
  const { user, business, logout } = useAuth();

  return (
    <div className="w-64 emerald-gradient text-white flex-shrink-0 flex flex-col h-screen">
      {/* Header */}
      <div className="p-6 border-b border-emerald-400">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center p-1">
            <img src={znforgeLogo} alt="ZnPOS Logo" className="w-full h-full object-contain" />
          </div>
          <div>
            <h1 className="text-xl font-bold">ZnPOS</h1>
            <p className="text-emerald-200 text-sm font-medium">Meow Meow Pet Shop</p>
          </div>
        </div>
      </div>
      
      {/* Navigation */}
      <nav className="flex-1 mt-6">
        <div className="px-4 space-y-2">
          {navigation
            .filter((item) => {
              // Show dashboard to everyone
              if (!item.permission) return true;
              // Show all to admin users
              if (user?.role === 'admin') return true;
              // For non-admin users, show basic pages (could add permission logic later)
              return false;
            })
            .map((item) => {
              const Icon = item.icon;
              const isActive = location === item.href || 
                (item.href === "/" && location === "/");
              
              return (
                <Link key={item.name} href={item.href}>
                  <div className={`sidebar-item ${isActive ? 'active' : ''}`}>
                    <Icon className="w-5 h-5 mr-3" />
                    {item.name}
                  </div>
                </Link>
              );
            })}
        </div>
      </nav>
      
      {/* User Profile - Fixed at bottom */}
      <div className="p-4 mt-auto">
        <div className="bg-emerald-700 rounded-lg p-4 mb-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-emerald-500 rounded-full flex items-center justify-center">
              <span className="text-white font-semibold">
                {user?.firstName?.charAt(0) || 'U'}{user?.lastName?.charAt(0) || 'S'}
              </span>
            </div>
            <div>
              <p className="font-medium">{user?.username || 'User'}</p>
              <p className="text-emerald-200 text-sm capitalize">{user?.role || 'employee'}</p>
            </div>
          </div>
        </div>
        <Button 
          onClick={() => logout()} 
          variant="ghost" 
          className="w-full text-emerald-100 hover:bg-emerald-700"
        >
          <LogOut className="w-4 h-4 mr-2" />
          Sign Out
        </Button>
      </div>
    </div>
  );
}
