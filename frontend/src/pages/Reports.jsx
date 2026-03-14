import React, { useState, useEffect, useCallback } from 'react';
import Navbar from '../components/common/Navbar';
import Sidebar from '../components/common/Sidebar';
import salesService from '../services/salesService';
import productService from '../services/productService';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line } from 'recharts';
import { Calendar, DollarSign, Package, TrendingUp, Download } from 'lucide-react';
import { formatCurrency } from '../utils/formatters';

const Reports = () => {
  const [salesData, setSalesData] = useState([]);
  const [lowStockProducts, setLowStockProducts] = useState([]);
  const [summary, setSummary] = useState({ total: 0, today: 0, monthly: 0 });
  const [dateRange, setDateRange] = useState({
    startDate: new Date(new Date().setDate(1)).toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0],
  });
  const [isGenerating, setIsGenerating] = useState(false);

  const fetchReports = useCallback(async () => {
    try {
      const response = await salesService.getByDateRange(dateRange.startDate, dateRange.endDate);
      setSalesData(response.data);
    } catch (err) {
      console.error('Failed to fetch sales data');
    }
  }, [dateRange.startDate, dateRange.endDate]);

  const fetchLowStock = useCallback(async () => {
    try {
      const response = await productService.getCurrentStocks();
      const lowStock = response.data.filter((item) => item.quantity < 10);
      setLowStockProducts(lowStock);
    } catch (err) {
      console.error('Failed to fetch stock data');
    }
  }, []);

  const fetchSummary = useCallback(async () => {
    try {
      const response = await salesService.getSummary();
      setSummary(response.data);
    } catch (err) {
      console.error('Failed to fetch summary');
    }
  }, []);

  useEffect(() => {
    fetchReports();
    fetchLowStock();
    fetchSummary();
  }, [fetchReports, fetchLowStock, fetchSummary]);

  const getSalesChartData = () => {
    const grouped = salesData.reduce((acc, sale) => {
      const date = new Date(sale.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      if (!acc[date]) {
        acc[date] = { date, revenue: 0, quantity: 0 };
      }
      acc[date].revenue += sale.revenue;
      acc[date].quantity += sale.quantity;
      return acc;
    }, {});
    return Object.values(grouped);
  };

  const getProductSalesData = () => {
    const grouped = salesData.reduce((acc, sale) => {
      const product = sale.productname || 'Unknown';
      if (!acc[product]) {
        acc[product] = { product, revenue: 0, quantity: 0 };
      }
      acc[product].revenue += sale.revenue;
      acc[product].quantity += sale.quantity;
      return acc;
    }, {});
    return Object.values(grouped).sort((a, b) => b.revenue - a.revenue).slice(0, 10);
  };

  const generatePDF = async () => {
    setIsGenerating(true);
    try {
      // Dynamic imports
      const html2canvas = (await import('html2canvas')).default;
      const jsPDF = (await import('jspdf')).default;

      const pdf = new jsPDF('p', 'mm', 'a4');
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      let yPosition = 20;

      // Title
      pdf.setFontSize(22);
      pdf.setFont('helvetica', 'bold');
      pdf.text('Sales & Inventory Report', pageWidth / 2, yPosition, { align: 'center' });
      
      yPosition += 10;
      pdf.setFontSize(10);
      pdf.setFont('helvetica', 'normal');
      pdf.setTextColor(100);
      pdf.text(`Period: ${dateRange.startDate} to ${dateRange.endDate}`, pageWidth / 2, yPosition, { align: 'center' });
      pdf.text(`Generated: ${new Date().toLocaleString()}`, pageWidth / 2, yPosition + 5, { align: 'center' });
      
      yPosition += 15;
      pdf.setTextColor(0);

      // Summary Section
      pdf.setFillColor(59, 130, 246);
      pdf.rect(15, yPosition - 5, pageWidth - 30, 8, 'F');
      pdf.setFontSize(14);
      pdf.setFont('helvetica', 'bold');
      pdf.setTextColor(255);
      pdf.text('Sales Summary', 20, yPosition);
      pdf.setTextColor(0);
      yPosition += 10;

      pdf.setFontSize(11);
      pdf.setFont('helvetica', 'normal');
      pdf.text(`Total Sales:`, 20, yPosition);
      pdf.setFont('helvetica', 'bold');
      pdf.text(formatCurrency(summary.total), 60, yPosition);
      yPosition += 6;

      pdf.setFont('helvetica', 'normal');
      pdf.text(`Today's Sales:`, 20, yPosition);
      pdf.setFont('helvetica', 'bold');
      pdf.text(formatCurrency(summary.today), 60, yPosition);
      yPosition += 6;

      pdf.setFont('helvetica', 'normal');
      pdf.text(`Monthly Sales:`, 20, yPosition);
      pdf.setFont('helvetica', 'bold');
      pdf.text(formatCurrency(summary.monthly), 60, yPosition);
      yPosition += 15;

      // Capture Sales Trend Chart
      const salesChartElement = document.querySelector('.sales-trend-chart');
      if (salesChartElement) {
        const canvas = await html2canvas(salesChartElement, { 
          scale: 2,
          backgroundColor: '#ffffff',
          logging: false
        });
        const imgData = canvas.toDataURL('image/png');
        const imgWidth = pageWidth - 30;
        const imgHeight = (canvas.height * imgWidth) / canvas.width;
        
        if (yPosition + imgHeight > pageHeight - 20) {
          pdf.addPage();
          yPosition = 20;
        }
        
        pdf.setFillColor(59, 130, 246);
        pdf.rect(15, yPosition - 5, pageWidth - 30, 8, 'F');
        pdf.setFontSize(14);
        pdf.setFont('helvetica', 'bold');
        pdf.setTextColor(255);
        pdf.text('Sales Trend', 20, yPosition);
        pdf.setTextColor(0);
        yPosition += 8;
        
        pdf.addImage(imgData, 'PNG', 15, yPosition, imgWidth, imgHeight);
        yPosition += imgHeight + 12;
      }

      // Capture Top Products Chart
      const productsChartElement = document.querySelector('.products-chart');
      if (productsChartElement) {
        if (yPosition > pageHeight - 80) {
          pdf.addPage();
          yPosition = 20;
        }
        
        const canvas = await html2canvas(productsChartElement, { 
          scale: 2,
          backgroundColor: '#ffffff',
          logging: false
        });
        const imgData = canvas.toDataURL('image/png');
        const imgWidth = pageWidth - 30;
        const imgHeight = (canvas.height * imgWidth) / canvas.width;
        
        if (yPosition + imgHeight > pageHeight - 20) {
          pdf.addPage();
          yPosition = 20;
        }
        
        pdf.setFillColor(59, 130, 246);
        pdf.rect(15, yPosition - 5, pageWidth - 30, 8, 'F');
        pdf.setFontSize(14);
        pdf.setFont('helvetica', 'bold');
        pdf.setTextColor(255);
        pdf.text('Top Products by Revenue', 20, yPosition);
        pdf.setTextColor(0);
        yPosition += 8;
        
        pdf.addImage(imgData, 'PNG', 15, yPosition, imgWidth, imgHeight);
        yPosition += imgHeight + 12;
      }

      // Low Stock Alert Table
      if (yPosition > pageHeight - 60) {
        pdf.addPage();
        yPosition = 20;
      }

      pdf.setFillColor(59, 130, 246);
      pdf.rect(15, yPosition - 5, pageWidth - 30, 8, 'F');
      pdf.setFontSize(14);
      pdf.setFont('helvetica', 'bold');
      pdf.setTextColor(255);
      pdf.text('Low Stock Alert', 20, yPosition);
      pdf.setTextColor(0);
      yPosition += 10;

      if (lowStockProducts.length === 0) {
        pdf.setFontSize(11);
        pdf.setFont('helvetica', 'italic');
        pdf.setTextColor(100);
        pdf.text('✓ All products are well stocked!', 20, yPosition);
      } else {
        // Table header
        pdf.setFillColor(240, 240, 240);
        pdf.rect(15, yPosition - 4, pageWidth - 30, 8, 'F');
        pdf.setFontSize(10);
        pdf.setFont('helvetica', 'bold');
        pdf.text('Product Code', 20, yPosition);
        pdf.text('Product Name', 60, yPosition);
        pdf.text('Stock Level', 130, yPosition);
        pdf.text('Status', 165, yPosition);
        yPosition += 8;

        pdf.setFont('helvetica', 'normal');
        lowStockProducts.forEach((product, index) => {
          if (yPosition > pageHeight - 20) {
            pdf.addPage();
            yPosition = 20;
          }
          
          // Alternating row colors
          if (index % 2 === 0) {
            pdf.setFillColor(249, 250, 251);
            pdf.rect(15, yPosition - 4, pageWidth - 30, 7, 'F');
          }
          
          pdf.setTextColor(0);
          pdf.text(product.productcode || 'N/A', 20, yPosition);
          pdf.text(product.productname || 'N/A', 60, yPosition);
          
          pdf.setTextColor(234, 88, 12); // Orange color
          pdf.setFont('helvetica', 'bold');
          pdf.text(`${product.quantity} units`, 130, yPosition);
          
          pdf.setFillColor(254, 243, 199); // Orange background
          pdf.roundedRect(165, yPosition - 3, 25, 5, 1, 1, 'F');
          pdf.setTextColor(146, 64, 14);
          pdf.setFontSize(8);
          pdf.text('LOW STOCK', 167, yPosition);
          
          pdf.setFontSize(10);
          pdf.setFont('helvetica', 'normal');
          pdf.setTextColor(0);
          yPosition += 7;
        });
      }

      // Footer
      const totalPages = pdf.internal.pages.length - 1;
      for (let i = 1; i <= totalPages; i++) {
        pdf.setPage(i);
        pdf.setFontSize(8);
        pdf.setTextColor(150);
        pdf.text(
          `Page ${i} of ${totalPages}`,
          pageWidth / 2,
          pageHeight - 10,
          { align: 'center' }
        );
        pdf.text(
          'Generated by Inventory Management System',
          pageWidth / 2,
          pageHeight - 5,
          { align: 'center' }
        );
      }

      // Save PDF
      pdf.save(`sales-report-${new Date().toISOString().split('T')[0]}.pdf`);
    } catch (error) {
      console.error('Error generating PDF:', error);
      alert('Failed to generate PDF report. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <Navbar />
      <div className="flex">
        <Sidebar />
        <main className="flex-1 p-8">
          {/* Header with PDF Button */}
          <div className="mb-8 flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-800">Reports & Analytics</h1>
              <p className="text-gray-600 mt-2">View sales and inventory reports</p>
            </div>
            <button
              onClick={generatePDF}
              disabled={isGenerating}
              className="flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold rounded-lg hover:from-blue-700 hover:to-indigo-700 transform hover:scale-105 transition-all duration-200 disabled:from-gray-400 disabled:to-gray-500 disabled:cursor-not-allowed disabled:transform-none shadow-lg hover:shadow-xl"
            >
              {isGenerating ? (
                <>
                  <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  <span>Generating PDF...</span>
                </>
              ) : (
                <>
                  <Download className="w-5 h-5" />
                  <span>Export PDF Report</span>
                </>
              )}
            </button>
          </div>

          {/* Date Range Filter */}
          <div className="bg-white rounded-xl shadow-md p-6 mb-6">
            <div className="flex items-center space-x-4">
              <Calendar className="w-6 h-6 text-primary-600" />
              <div className="flex items-center space-x-4 flex-1">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
                  <input
                    type="date"
                    value={dateRange.startDate}
                    onChange={(e) => setDateRange({ ...dateRange, startDate: e.target.value })}
                    className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
                  <input
                    type="date"
                    value={dateRange.endDate}
                    onChange={(e) => setDateRange({ ...dateRange, endDate: e.target.value })}
                    className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-white rounded-xl shadow-md p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-500 text-sm font-medium">Total Sales</p>
                  <h3 className="text-3xl font-bold text-gray-800 mt-2">
                    {formatCurrency(summary.total)}
                  </h3>
                </div>
                <div className="bg-green-500 p-4 rounded-lg">
                  <DollarSign className="w-8 h-8 text-white" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-md p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-500 text-sm font-medium">Today's Sales</p>
                  <h3 className="text-3xl font-bold text-gray-800 mt-2">
                    {formatCurrency(summary.today)}
                  </h3>
                </div>
                <div className="bg-blue-500 p-4 rounded-lg">
                  <TrendingUp className="w-8 h-8 text-white" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-md p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-500 text-sm font-medium">Monthly Sales</p>
                  <h3 className="text-3xl font-bold text-gray-800 mt-2">
                    {formatCurrency(summary.monthly)}
                  </h3>
                </div>
                <div className="bg-purple-500 p-4 rounded-lg">
                  <Calendar className="w-8 h-8 text-white" />
                </div>
              </div>
            </div>
          </div>

          {/* Sales Trend Chart */}
          <div className="bg-white rounded-xl shadow-md p-6 mb-8 sales-trend-chart">
            <h2 className="text-xl font-bold text-gray-800 mb-4">Sales Trend</h2>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={getSalesChartData()}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip formatter={(value) => formatCurrency(value)} />
                <Legend />
                <Line type="monotone" dataKey="revenue" stroke="#0ea5e9" name="Revenue" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Top Products Chart */}
          <div className="bg-white rounded-xl shadow-md p-6 mb-8 products-chart">
            <h2 className="text-xl font-bold text-gray-800 mb-4">Top Products by Revenue</h2>
            <ResponsiveContainer width="100%" height={400}>
              <BarChart data={getProductSalesData()}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="product" angle={-45} textAnchor="end" height={100} />
                <YAxis />
                <Tooltip formatter={(value) => formatCurrency(value)} />
                <Legend />
                <Bar dataKey="revenue" fill="#0ea5e9" name="Revenue" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Low Stock Products */}
          <div className="bg-white rounded-xl shadow-md p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-gray-800">Low Stock Alert</h2>
              <Package className="w-6 h-6 text-orange-500" />
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Product Code
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Product Name
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Stock Level
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {lowStockProducts.length === 0 ? (
                    <tr>
                      <td colSpan="4" className="px-6 py-4 text-center text-gray-500">
                        All products are well stocked!
                      </td>
                    </tr>
                  ) : (
                    lowStockProducts.map((product, index) => (
                      <tr key={index} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">{product.productcode}</td>
                        <td className="px-6 py-4 whitespace-nowrap">{product.productname}</td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="font-semibold text-orange-600">{product.quantity} units</span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="px-2 py-1 text-xs font-semibold rounded-full bg-orange-100 text-orange-800">
                            Low Stock
                          </span>
                        </td>
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

export default Reports;
