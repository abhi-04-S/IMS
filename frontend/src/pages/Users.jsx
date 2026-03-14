import React, { useState, useEffect } from 'react';
import Navbar from '../components/common/Navbar';
import Sidebar from '../components/common/Sidebar';
import Modal from '../components/common/Modal';
import Table from '../components/common/Table';
import Loading from '../components/common/Loading';
import userService from '../services/userService';
import { Plus, AlertCircle, Shield, User as UserIcon } from 'lucide-react';
import { formatDateTime } from '../utils/formatters';

const Users = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    fullname: '',
    location: '',
    phone: '',
    role: 'normal',
  });

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const response = await userService.getAll();
      setUsers(response.data);
      setLoading(false);
    } catch (err) {
      setError('Failed to fetch users');
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
      if (editingUser) {
        // For update, only send password if it's been changed
        const updateData = { ...formData };
        if (!updateData.password) {
          delete updateData.password;
        }
        await userService.update(editingUser.id, updateData);
      } else {
        // For create, password is required
        if (!formData.password) {
          setError('Password is required for new users');
          return;
        }
        await userService.create(formData);
      }
      setShowModal(false);
      resetForm();
      fetchUsers();
    } catch (err) {
      setError(err.response?.data?.message || 'Operation failed');
    }
  };

  const handleEdit = (user) => {
    setEditingUser(user);
    setFormData({
      username: user.username,
      password: '', // Don't populate password
      fullname: user.fullname,
      location: user.location || '',
      phone: user.phone || '',
      role: user.role,
    });
    setShowModal(true);
  };

  const handleDelete = async (user) => {
    if (window.confirm(`Delete user: ${user.fullname}?`)) {
      try {
        await userService.delete(user.id);
        fetchUsers();
      } catch (err) {
        alert(err.response?.data?.message || 'Failed to delete user');
      }
    }
  };

  const resetForm = () => {
    setFormData({
      username: '',
      password: '',
      fullname: '',
      location: '',
      phone: '',
      role: 'normal',
    });
    setEditingUser(null);
    setError('');
  };

  const columns = [
    { 
      header: 'Username', 
      accessor: 'username',
      render: (row) => (
        <div className="flex items-center space-x-2">
          <UserIcon className="w-4 h-4 text-gray-500" />
          <span className="font-medium">{row.username}</span>
        </div>
      )
    },
    { header: 'Full Name', accessor: 'fullname' },
    { header: 'Location', accessor: 'location' },
    { header: 'Phone', accessor: 'phone' },
    {
      header: 'Role',
      render: (row) => (
        <span
          className={`px-3 py-1 rounded-full text-xs font-semibold ${
            row.role === 'admin'
              ? 'bg-purple-100 text-purple-800'
              : 'bg-blue-100 text-blue-800'
          }`}
        >
          {row.role === 'admin' ? (
            <div className="flex items-center space-x-1">
              <Shield className="w-3 h-3" />
              <span>Admin</span>
            </div>
          ) : (
            'Normal User'
          )}
        </span>
      ),
    },
    {
      header: 'Created',
      render: (row) => formatDateTime(row.created_at),
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
              <h1 className="text-3xl font-bold text-gray-800">User Management</h1>
              <p className="text-gray-600 mt-2">Manage system users (Admin only)</p>
            </div>
            <button
              onClick={() => {
                resetForm();
                setShowModal(true);
              }}
              className="flex items-center space-x-2 px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition"
            >
              <Plus className="w-5 h-5" />
              <span>Add User</span>
            </button>
          </div>

          <div className="bg-white rounded-xl shadow-md p-6">
            <div className="mb-4 p-4 bg-purple-50 border border-purple-200 rounded-lg flex items-start">
              <Shield className="w-5 h-5 text-purple-600 mr-3 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm text-purple-800 font-medium">Admin Access Required</p>
                <p className="text-xs text-purple-600 mt-1">
                  Only administrators can create, edit, and delete users.
                </p>
              </div>
            </div>

            <Table columns={columns} data={users} onEdit={handleEdit} onDelete={handleDelete} />
          </div>
        </main>
      </div>

      <Modal
        isOpen={showModal}
        onClose={() => {
          setShowModal(false);
          resetForm();
        }}
        title={editingUser ? 'Edit User' : 'Add New User'}
      >
        {error && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start">
            <AlertCircle className="w-5 h-5 text-red-600 mr-3 flex-shrink-0 mt-0.5" />
            <span className="text-red-700 text-sm">{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Username *
            </label>
            <input
              type="text"
              name="username"
              value={formData.username}
              onChange={handleInputChange}
              required
              disabled={!!editingUser}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 disabled:bg-gray-100"
              placeholder="Enter username"
            />
            {editingUser && (
              <p className="text-xs text-gray-500 mt-1">Username cannot be changed</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Password {editingUser ? '(Leave blank to keep current)' : '*'}
            </label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleInputChange}
              required={!editingUser}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
              placeholder={editingUser ? 'Enter new password to change' : 'Enter password'}
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
              placeholder="Enter full name"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Location</label>
            <input
              type="text"
              name="location"
              value={formData.location}
              onChange={handleInputChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
              placeholder="Enter location"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Phone</label>
            <input
              type="text"
              name="phone"
              value={formData.phone}
              onChange={handleInputChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
              placeholder="Enter phone number"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Role *</label>
            <select
              name="role"
              value={formData.role}
              onChange={handleInputChange}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
            >
              <option value="normal">Normal User</option>
              <option value="admin">Administrator</option>
            </select>
            <p className="text-xs text-gray-500 mt-1">
              Admins have full access to all features including user management
            </p>
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
              {editingUser ? 'Update User' : 'Create User'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default Users;