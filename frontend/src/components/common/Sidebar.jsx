import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Package, 
  Users, // Used for Customers
  ShoppingCart, 
  TrendingUp,
  Truck,
  UserCircle,
  UserPlus // NEW ICON for User Management
} from 'lucide-react';

const Sidebar = () => {
  const location = useLocation();

  const menuItems = [
    { path: '/', icon: LayoutDashboard, label: 'Dashboard' },
    { path: '/products', icon: Package, label: 'Products' },
    { path: '/suppliers', icon: Truck, label: 'Suppliers' },
    { path: '/customers', icon: Users, label: 'Customers' },
    { path: '/sales', icon: ShoppingCart, label: 'Sales' },
    { path: '/reports', icon: TrendingUp, label: 'Reports' },
    
    { path: '/users', icon: UserPlus, label: 'User Management' }, 
    { path: '/profile', icon: UserCircle, label: 'Profile' },
  ];

  return (
    <div className="w-64 bg-white shadow-lg min-h-screen">
      <div className="p-4">
        <h2 className="text-xl font-bold text-gray-800 mb-6">Menu</h2>
        <nav className="space-y-2">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition ${
                  isActive
                    ? 'bg-blue-600 text-white' // Changed from primary-600 to blue-600 for safety
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                <Icon className="w-5 h-5" />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>
      </div>
    </div>
  );
};

export default Sidebar;