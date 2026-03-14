import React, { useState, useEffect } from 'react';
import Navbar from '../components/common/Navbar';
import Sidebar from '../components/common/Sidebar';
import Modal from '../components/common/Modal';
import Table from '../components/common/Table';
import Loading from '../components/common/Loading';
import supplierService from '../services/supplierService';
import { Plus, AlertCircle } from 'lucide-react';
import { formatCurrency } from '../utils/formatters';

const Suppliers = () => {
  const [suppliers, setSuppliers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingSupplier, setEditingSupplier] = useState(null);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    suppliercode: '',
    fullname: '',
    location: '',
    phone: '',
    debit: 0,
    credit: 0,
  });

  useEffect(() => {
    fetchSuppliers();
  }, []);

  const fetchSuppliers = async () => {
    try {
      const response = await supplierService.getAll();
      setSuppliers(response.data);
      setLoading(false);
    } catch (err) {
      setError('Failed to fetch suppliers');
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    try {
      if (editingSupplier) {
        await supplierService.update(editingSupplier.sid, formData);
      } else {
        await supplierService.create(formData);
      }
      setShowModal(false);
      resetForm();
      fetchSuppliers();
    } catch (err) {
      setError(err.response?.data?.message || 'Operation failed');
    }
  };

  const handleEdit = (supplier) => {
    setEditingSupplier(supplier);
    setFormData({
      suppliercode: supplier.suppliercode,
      fullname: supplier.fullname,
      location: supplier.location,
      phone: supplier.phone,
      debit: supplier.debit,
      credit: supplier.credit,
    });
    setShowModal(true);
  };

  const handleDelete = async (supplier) => {
    if (window.confirm(`Delete supplier: ${supplier.fullname}?`)) {
      try {
        await supplierService.delete(supplier.sid);
        fetchSuppliers();
      } catch (err) {
        alert('Failed to delete supplier');
      }
    }
  };

  const resetForm = () => {
    setFormData({
      suppliercode: '',
      fullname: '',
      location: '',
      phone: '',
      debit: 0,
      credit: 0,
    });
    setEditingSupplier(null);
    setError('');
  };

  const columns = [
    { header: 'Code', accessor: 'suppliercode' },
    { header: 'Full Name', accessor: 'fullname' },
    { header: 'Location', accessor: 'location' },
    { header: 'Phone', accessor: 'phone' },
    {
      header: 'Debit',
      render: (row) => formatCurrency(row.debit),
    },
    {
      header: 'Credit',
      render: (row) => formatCurrency(row.credit),
    },
    {
      header: 'Balance',
      render: (row) => (
        <span className={row.balance >= 0 ? 'text-green-600' : 'text-red-600'}>
          {formatCurrency(row.balance)}
        </span>
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
              <h1 className="text-3xl font-bold text-gray-800">Suppliers</h1>
              <p className="text-gray-600 mt-2">Manage your suppliers</p>
            </div>
            <button
              onClick={() => {
                resetForm();
                setShowModal(true);
              }}
              className="flex items-center space-x-2 px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition"
            >
              <Plus className="w-5 h-5" />
              <span>Add Supplier</span>
            </button>
          </div>

          <div className="bg-white rounded-xl shadow-md p-6">
            <Table
              columns={columns}
              data={suppliers}
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
        title={editingSupplier ? 'Edit Supplier' : 'Add New Supplier'}
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
              Supplier Code *
            </label>
            <input
              type="text"
              name="suppliercode"
              value={formData.suppliercode}
              onChange={handleInputChange}
              required
              disabled={!!editingSupplier}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Full Name *
            </label>
            <input
              type="text"
              name="fullname"
              value={formData.fullname}
              onChange={handleInputChange}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Location
            </label>
            <input
              type="text"
              name="location"
              value={formData.location}
              onChange={handleInputChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Phone
            </label>
            <input
              type="text"
              name="phone"
              value={formData.phone}
              onChange={handleInputChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
            />
          </div>

          {editingSupplier && (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Debit
                </label>
                <input
                  type="number"
                  name="debit"
                  value={formData.debit}
                  onChange={handleInputChange}
                  step="0.01"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Credit
                </label>
                <input
                  type="number"
                  name="credit"
                  value={formData.credit}
                  onChange={handleInputChange}
                  step="0.01"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                />
              </div>
            </>
          )}

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
              {editingSupplier ? 'Update' : 'Add'} Supplier
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default Suppliers;
