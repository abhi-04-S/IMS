import React, { useState, useEffect } from 'react';
import Navbar from '../components/common/Navbar';
import Sidebar from '../components/common/Sidebar';
import Modal from '../components/common/Modal';
import Table from '../components/common/Table';
import Loading from '../components/common/Loading';
import salesService from '../services/salesService';
import productService from '../services/productService';
import customerService from '../services/customerService';
import { useAuth } from '../context/AuthContext';
import { Plus, AlertCircle } from 'lucide-react';
import { formatCurrency, formatDateTime } from '../utils/formatters';

const Sales = () => {
  const { user } = useAuth();
  const [sales, setSales] = useState([]);
  const [products, setProducts] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [stocks, setStocks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    customercode: '',
    productcode: '',
    quantity: '',
  });

  useEffect(() => {
    fetchSales();
    fetchProducts();
    fetchCustomers();
    fetchStocks();
  }, []);

  const fetchSales = async () => {
    try {
      const response = await salesService.getAll();
      setSales(response.data);
      setLoading(false);
    } catch (err) {
      setError('Failed to fetch sales');
      setLoading(false);
    }
  };

  const fetchProducts = async () => {
    try {
      const response = await productService.getAll();
      setProducts(response.data);
    } catch (err) {
      console.error('Failed to fetch products');
    }
  };

  const fetchCustomers = async () => {
    try {
      const response = await customerService.getAll();
      setCustomers(response.data);
    } catch (err) {
      console.error('Failed to fetch customers');
    }
  };

  const fetchStocks = async () => {
    try {
      const response = await productService.getCurrentStocks();
      setStocks(response.data);
    } catch (err) {
      console.error('Failed to fetch stocks');
    }
  };

  const getAvailableStock = (productcode) => {
    const stock = stocks.find((s) => s.productcode === productcode);
    return stock ? stock.quantity : 0;
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    const availableStock = getAvailableStock(formData.productcode);
    if (parseInt(formData.quantity) > availableStock) {
      setError(`Insufficient stock. Available: ${availableStock}`);
      return;
    }

    try {
      await salesService.create({
        ...formData,
        soldby: user.username,
      });
      setShowModal(false);
      resetForm();
      fetchSales();
      fetchStocks();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to record sale');
    }
  };

  const resetForm = () => {
    setFormData({
      customercode: '',
      productcode: '',
      quantity: '',
    });
    setError('');
  };

  const columns = [
    {
      header: 'Date',
      render: (row) => formatDateTime(row.created_at),
    },
    { header: 'Customer', accessor: 'customer_name' },
    { header: 'Product', accessor: 'productname' },
    { header: 'Quantity', accessor: 'quantity' },
    {
      header: 'Revenue',
      render: (row) => formatCurrency(row.revenue),
    },
    { header: 'Sold By', accessor: 'soldby' },
  ];

  if (loading) return <Loading />;

  return (
    <div className="min-h-screen bg-gray-100">
      <Navbar />
      <div className="flex">
        <Sidebar />
        <main className="flex-1 p-8">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-3xl font-bold text-gray-800">Sales</h1>
              <p className="text-gray-600 mt-2">Record and manage sales transactions</p>
            </div>
            <button
              onClick={() => {
                resetForm();
                setShowModal(true);
              }}
              className="flex items-center space-x-2 px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition"
            >
              <Plus className="w-5 h-5" />
              <span>Record Sale</span>
            </button>
          </div>

          <div className="bg-white rounded-xl shadow-md p-6">
            <Table columns={columns} data={sales} />
          </div>
        </main>
      </div>

      <Modal
        isOpen={showModal}
        onClose={() => {
          setShowModal(false);
          resetForm();
        }}
        title="Record New Sale"
      >
        {error && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start">
            <AlertCircle className="w-5 h-5 text-red-600 mr-3" />
            <span className="text-red-700 text-sm">{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Customer *
            </label>
            <select
              name="customercode"
              value={formData.customercode}
              onChange={handleInputChange}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
            >
              <option value="">Select Customer</option>
              {customers.map((customer) => (
                <option key={customer.cid} value={customer.customercode}>
                  {customer.fullname} ({customer.customercode})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Product *
            </label>
            <select
              name="productcode"
              value={formData.productcode}
              onChange={handleInputChange}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
            >
              <option value="">Select Product</option>
              {products.map((product) => (
                <option key={product.pid} value={product.productcode}>
                  {product.productname} - {formatCurrency(product.sellingprice)} (Stock:{' '}
                  {getAvailableStock(product.productcode)})
                </option>
              ))}
            </select>
          </div>

          {formData.productcode && (
            <div className="p-3 bg-blue-50 rounded-lg">
              <p className="text-sm text-blue-700">
                Available Stock: {getAvailableStock(formData.productcode)} units
              </p>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Quantity *
            </label>
            <input
              type="number"
              name="quantity"
              value={formData.quantity}
              onChange={handleInputChange}
              required
              min="1"
              max={getAvailableStock(formData.productcode)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
            />
          </div>

          <div className="flex justify-end space-x-4 pt-4">
            <button
              type="button"
              onClick={() => {
                setShowModal(false);
                resetForm();
              }}
              className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
            >
              Record Sale
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default Sales;