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

const navigation = [
  { name: "Dashboard", href: "/", icon: LayoutDashboard },
  { name: "Point of Sale", href: "/pos", icon: ShoppingCart },
  { name: "Inventory", href: "/inventory", icon: Package },
  { name: "Customers", href: "/customers", icon: Users },
  { name: "Employees", href: "/employees", icon: UserCheck },
  { name: "Reports", href: "/reports", icon: BarChart3 },
  { name: "Settings", href: "/settings", icon: Settings },
];

export default function Sidebar() {
  const [location] = useLocation();
  const { user, business, logout } = useAuth();

  return (
    <div className="w-64 emerald-gradient text-white flex-shrink-0 flex flex-col">
      {/* Header */}
      <div className="p-6 border-b border-emerald-400">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center">
            <span className="text-emerald-600 font-bold text-lg">Z</span>
          </div>
          <div>
            <h1 className="text-xl font-bold">ZnForge POS</h1>
            <p className="text-emerald-100 text-sm">{business?.name}</p>
          </div>
        </div>
      </div>
      
      {/* Navigation */}
      <nav className="flex-1 mt-6">
        <div className="px-4 space-y-2">
          {navigation.map((item) => {
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
      
      {/* User Profile */}
      <div className="p-4">
        <div className="bg-emerald-700 rounded-lg p-4 mb-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-emerald-500 rounded-full flex items-center justify-center">
              <span className="text-white font-semibold">
                {user?.firstName?.charAt(0) || 'U'}{user?.lastName?.charAt(0) || 'S'}
              </span>
            </div>
            <div>
              <p className="font-medium">{user?.firstName || 'User'} {user?.lastName || 'Name'}</p>
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
