import React, { useState, useEffect } from 'react';
import Navbar from '../components/common/Navbar';
import Sidebar from '../components/common/Sidebar';
import { Package, Users, ShoppingCart, TrendingUp, AlertTriangle } from 'lucide-react';
import productService from '../services/productService';
import supplierService from '../services/supplierService';
import customerService from '../services/customerService';
import salesService from '../services/salesService';
import { formatCurrency } from '../utils/formatters';

const Dashboard = () => {
  const [stats, setStats] = useState({
    totalProducts: 0,
    totalSuppliers: 0,
    totalCustomers: 0,
    totalSales: 0,
    todaySales: 0,
    monthlySales: 0,
  });
  const [lowStockProducts, setLowStockProducts] = useState([]);
  const [recentSales, setRecentSales] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const [productsRes, suppliersRes, customersRes, salesSummaryRes, salesRes, stocksRes] =
        await Promise.all([
          productService.getAll(),
          supplierService.getAll(),
          customerService.getAll(),
          salesService.getSummary(),
          salesService.getAll(),
          productService.getCurrentStocks(),
        ]);

      setStats({
        totalProducts: productsRes.data.length,
        totalSuppliers: suppliersRes.data.length,
        totalCustomers: customersRes.data.length,
        totalSales: salesSummaryRes.data.total,
        todaySales: salesSummaryRes.data.today,
        monthlySales: salesSummaryRes.data.monthly,
      });

      setRecentSales(salesRes.data.slice(0, 5));
      setLowStockProducts(stocksRes.data.filter((s) => s.quantity < 10));
      setLoading(false);
    } catch (err) {
      console.error('Failed to fetch dashboard data');
      setLoading(false);
    }
  };

  const statsCards = [
    {
      title: 'Total Products',
      value: stats.totalProducts,
      icon: Package,
      color: 'bg-blue-500',
    },
    {
      title: 'Total Suppliers',
      value: stats.totalSuppliers,
      icon: Users,
      color: 'bg-green-500',
    },
    {
      title: 'Total Customers',
      value: stats.totalCustomers,
      icon: ShoppingCart,
      color: 'bg-purple-500',
    },
    {
      title: 'Total Sales',
      value: formatCurrency(stats.totalSales),
      icon: TrendingUp,
      color: 'bg-orange-500',
    },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <Navbar />
      <div className="flex">
        <Sidebar />
        <main className="flex-1 p-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-800">Dashboard</h1>
            <p className="text-gray-600 mt-2">Welcome to your inventory management system</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {statsCards.map((stat, index) => {
              const Icon = stat.icon;
              return (
                <div
                  key={index}
                  className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-gray-500 text-sm font-medium">{stat.title}</p>
                      <h3 className="text-3xl font-bold text-gray-800 mt-2">{stat.value}</h3>
                    </div>
                    <div className={`${stat.color} p-4 rounded-lg`}>
                      <Icon className="w-8 h-8 text-white" />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            <div className="bg-white rounded-xl shadow-md p-6">
              <h2 className="text-xl font-bold text-gray-800 mb-4">Sales Summary</h2>
              <div className="space-y-4">
                <div className="flex justify-between items-center p-4 bg-green-50 rounded-lg">
                  <span className="text-gray-700 font-medium">Today's Sales</span>
                  <span className="text-2xl font-bold text-green-600">
                    {formatCurrency(stats.todaySales)}
                  </span>
                </div>
                <div className="flex justify-between items-center p-4 bg-blue-50 rounded-lg">
                  <span className="text-gray-700 font-medium">Monthly Sales</span>
                  <span className="text-2xl font-bold text-blue-600">
                    {formatCurrency(stats.monthlySales)}
                  </span>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-md p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-gray-800">Low Stock Alert</h2>
                <AlertTriangle className="w-6 h-6 text-orange-500" />
              </div>
              <div className="space-y-3">
                {lowStockProducts.length === 0 ? (
                  <p className="text-gray-500">All products are well stocked!</p>
                ) : (
                  lowStockProducts.map((product, index) => (
                    <div
                      key={index}
                      className="flex justify-between items-center p-3 bg-orange-50 rounded-lg"
                    >
                      <span className="text-gray-700">{product.productname}</span>
                      <span className="text-orange-600 font-semibold">
                        {product.quantity} units left
                      </span>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-md p-6">
            <h2 className="text-xl font-bold text-gray-800 mb-4">Recent Sales</h2>
            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Customer
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Product
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Quantity
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Revenue
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Sold By
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {recentSales.length === 0 ? (
                    <tr>
                      <td colSpan="5" className="px-6 py-4 text-center text-gray-500">
                        No recent sales
                      </td>
                    </tr>
                  ) : (
                    recentSales.map((sale, index) => (
                      <tr key={index} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">{sale.customer_name}</td>
                        <td className="px-6 py-4 whitespace-nowrap">{sale.productname}</td>
                        <td className="px-6 py-4 whitespace-nowrap">{sale.quantity}</td>
                        <td className="px-6 py-4 whitespace-nowrap font-semibold text-green-600">
                          {formatCurrency(sale.revenue)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">{sale.soldby}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default Dashboard;