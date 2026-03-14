import React, { useState, useEffect } from 'react';
import Navbar from '../components/common/Navbar';
import Sidebar from '../components/common/Sidebar';
import Modal from '../components/common/Modal';
import Table from '../components/common/Table';
import Loading from '../components/common/Loading';
import productService from '../services/productService';
import supplierService from '../services/supplierService';
import { Plus, Package, AlertCircle } from 'lucide-react';
import { formatCurrency } from '../utils/formatters';

const Products = () => {
  const [products, setProducts] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    productcode: '',
    productname: '',
    suppliercode: '',
    quantity: '',
    costprice: '',
    sellingprice: '',
    brand: '',
    category: '',
    image: null,
  });

  useEffect(() => {
    fetchProducts();
    fetchSuppliers();
  }, []);

  const fetchProducts = async () => {
    try {
      const response = await productService.getAll();
      setProducts(response.data);
      setLoading(false);
    } catch (err) {
      setError('Failed to fetch products');
      setLoading(false);
    }
  };

  const fetchSuppliers = async () => {
    try {
      const response = await supplierService.getAll();
      setSuppliers(response.data);
    } catch (err) {
      console.error('Failed to fetch suppliers');
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleFileChange = (e) => {
    setFormData({ ...formData, image: e.target.files[0] });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    try {
      const data = new FormData();
      Object.keys(formData).forEach((key) => {
        if (formData[key]) {
          data.append(key, formData[key]);
        }
      });

      if (editingProduct) {
        await productService.update(editingProduct.pid, data);
      } else {
        await productService.create(data);
      }

      setShowModal(false);
      resetForm();
      fetchProducts();
    } catch (err) {
      setError(err.response?.data?.message || 'Operation failed');
    }
  };

  const handleEdit = (product) => {
    setEditingProduct(product);
    setFormData({
      productcode: product.productcode,
      productname: product.productname,
      suppliercode: product.suppliercode,
      quantity: product.quantity,
      costprice: product.costprice,
      sellingprice: product.sellingprice,
      brand: product.brand,
      category: product.category,
      image: null,
    });
    setShowModal(true);
  };

  const handleDelete = async (product) => {
    if (window.confirm(`Delete product: ${product.productname}?`)) {
      try {
        await productService.delete(product.pid);
        fetchProducts();
      } catch (err) {
        alert('Failed to delete product');
      }
    }
  };

  const resetForm = () => {
    setFormData({
      productcode: '',
      productname: '',
      suppliercode: '',
      quantity: '',
      costprice: '',
      sellingprice: '',
      brand: '',
      category: '',
      image: null,
    });
    setEditingProduct(null);
    setError('');
  };

  const columns = [
    { header: 'Code', accessor: 'productcode' },
    { header: 'Name', accessor: 'productname' },
    { header: 'Supplier', accessor: 'supplier_name' },
    { header: 'Brand', accessor: 'brand' },
    { header: 'Category', accessor: 'category' },
    { 
      header: 'Cost Price', 
      render: (row) => formatCurrency(row.costprice) 
    },
    { 
      header: 'Selling Price', 
      render: (row) => formatCurrency(row.sellingprice) 
    },
    { header: 'Quantity', accessor: 'quantity' },
    {
      header: 'Image',
      render: (row) =>
        row.image ? (
          <img
            src={`http://localhost:5000/uploads/products/${row.image}`}
            alt={row.productname}
            className="w-12 h-12 object-cover rounded"
          />
        ) : (
          <Package className="w-12 h-12 text-gray-400" />
        ),
    },
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
              <h1 className="text-3xl font-bold text-gray-800">Products</h1>
              <p className="text-gray-600 mt-2">Manage your product inventory</p>
            </div>
            <button
              onClick={() => {
                resetForm();
                setShowModal(true);
              }}
              className="flex items-center space-x-2 px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition"
            >
              <Plus className="w-5 h-5" />
              <span>Add Product</span>
            </button>
          </div>

          <div className="bg-white rounded-xl shadow-md p-6">
            <Table
              columns={columns}
              data={products}
              onEdit={handleEdit}
              onDelete={handleDelete}
            />
          </div>
        </main>
      </div>

      <Modal
        isOpen={showModal}
        onClose={() => {
          setShowModal(false);
          resetForm();
        }}
        title={editingProduct ? 'Edit Product' : 'Add New Product'}
        size="lg"
      >
        {error && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start">
            <AlertCircle className="w-5 h-5 text-red-600 mr-3 flex-shrink-0 mt-0.5" />
            <span className="text-red-700 text-sm">{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Product Code *
              </label>
              <input
                type="text"
                name="productcode"
                value={formData.productcode}
                onChange={handleInputChange}
                required
                disabled={!!editingProduct}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Product Name *
              </label>
              <input
                type="text"
                name="productname"
                value={formData.productname}
                onChange={handleInputChange}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Supplier *
              </label>
              <select
                name="suppliercode"
                value={formData.suppliercode}
                onChange={handleInputChange}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
              >
                <option value="">Select Supplier</option>
                {suppliers.map((supplier) => (
                  <option key={supplier.sid} value={supplier.suppliercode}>
                    {supplier.fullname}
                  </option>
                ))}
              </select>
            </div>

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
                min="0"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Cost Price *
              </label>
              <input
                type="number"
                name="costprice"
                value={formData.costprice}
                onChange={handleInputChange}
                required
                step="0.01"
                min="0"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Selling Price *
              </label>
              <input
                type="number"
                name="sellingprice"
                value={formData.sellingprice}
                onChange={handleInputChange}
                required
                step="0.01"
                min="0"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Brand
              </label>
              <input
                type="text"
                name="brand"
                value={formData.brand}
                onChange={handleInputChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Category
              </label>
              <input
                type="text"
                name="category"
                value={formData.category}
                onChange={handleInputChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
              />
            </div>

            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Product Image
              </label>
              <input
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
              />
            </div>
          </div>

          <div className="flex justify-end space-x-4 pt-4">
            <button
              type="button"
              onClick={() => {
                setShowModal(false);
                resetForm();
              }}
              className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition"
            >
              {editingProduct ? 'Update Product' : 'Add Product'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default Products;