import React, { useState, useEffect } from 'react';
import Navbar from '../components/common/Navbar';
import Sidebar from '../components/common/Sidebar';
import Modal from '../components/common/Modal';
import Table from '../components/common/Table';
import Loading from '../components/common/Loading';
import customerService from '../services/customerService';
import { Plus, AlertCircle } from 'lucide-react';
import { formatCurrency } from '../utils/formatters';

const Customers = () => {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState(null);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    customercode: '',
    fullname: '',
    location: '',
    phone: '',
    debit: 0,
    credit: 0,
  });

  useEffect(() => {
    fetchCustomers();
  }, []);

  const fetchCustomers = async () => {
    try {
      const response = await customerService.getAll();
      setCustomers(response.data);
      setLoading(false);
    } catch (err) {
      setError('Failed to fetch customers');
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
      if (editingCustomer) {
        await customerService.update(editingCustomer.cid, formData);
      } else {
        await customerService.create(formData);
      }
      setShowModal(false);
      resetForm();
      fetchCustomers();
    } catch (err) {
      setError(err.response?.data?.message || 'Operation failed');
    }
  };

  const handleEdit = (customer) => {
    setEditingCustomer(customer);
    setFormData({
      customercode: customer.customercode,
      fullname: customer.fullname,
      location: customer.location,
      phone: customer.phone,
      debit: customer.debit,
      credit: customer.credit,
    });
    setShowModal(true);
  };

  const handleDelete = async (customer) => {
    if (window.confirm(`Delete customer: ${customer.fullname}?`)) {
      try {
        await customerService.delete(customer.cid);
        fetchCustomers();
      } catch (err) {
        alert('Failed to delete customer');
      }
    }
  };

  const resetForm = () => {
    setFormData({
      customercode: '',
      fullname: '',
      location: '',
      phone: '',
      debit: 0,
      credit: 0,
    });
    setEditingCustomer(null);
    setError('');
  };

  const columns = [
    { header: 'Code', accessor: 'customercode' },
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
        <span className={row.balance >= 0 ? 'text-red-600' : 'text-green-600'}>
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
              <h1 className="text-3xl font-bold text-gray-800">Customers</h1>
              <p className="text-gray-600 mt-2">Manage your customers</p>
            </div>
            <button
              onClick={() => {
                resetForm();
                setShowModal(true);
              }}
              className="flex items-center space-x-2 px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition"
            >
              <Plus className="w-5 h-5" />
              <span>Add Customer</span>
            </button>
          </div>

          <div className="bg-white rounded-xl shadow-md p-6">
            <Table
              columns={columns}
              data={customers}
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
        title={editingCustomer ? 'Edit Customer' : 'Add New Customer'}
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
              Customer Code *
            </label>
            <input
              type="text"
              name="customercode"
              value={formData.customercode}
              onChange={handleInputChange}
              required
              disabled={!!editingCustomer}
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

          {editingCustomer && (
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
              {editingCustomer ? 'Update' : 'Add'} Customer
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default Customers;