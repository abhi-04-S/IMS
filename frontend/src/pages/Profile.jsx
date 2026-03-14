
// ============================================
// FILE: frontend/src/pages/Profile.jsx - 
// ============================================
import React, { useState } from 'react';
import Navbar from '../components/common/Navbar';
import Sidebar from '../components/common/Sidebar';
import Modal from '../components/common/Modal';
import { useAuth } from '../context/AuthContext';
import { 
  User, 
  Phone, 
  MapPin, 
  Shield, 
  Edit2, 
  Key,
  Calendar,
  AlertCircle,
  CheckCircle,
  Camera
} from 'lucide-react';
import { formatDateTime } from '../utils/formatters';
import api from '../services/api';

const Profile = () => {
  const { user } = useAuth();
  const [showEditModal, setShowEditModal] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  
  const [profileData, setProfileData] = useState({
    fullname: user?.fullname || '',
    location: user?.location || '',
    phone: user?.phone || '',
  });

  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  const handleProfileChange = (e) => {
    setProfileData({ ...profileData, [e.target.name]: e.target.value });
  };

  const handlePasswordChange = (e) => {
    setPasswordData({ ...passwordData, [e.target.name]: e.target.value });
  };

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      await api.put(`/users/${user.id}`, {
        ...profileData,
        role: user.role,
      });
      setSuccess('Profile updated successfully!');
      setTimeout(() => {
        setShowEditModal(false);
        setSuccess('');
      }, 2000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setError('New passwords do not match');
      return;
    }

    if (passwordData.newPassword.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    setLoading(true);

    try {
      await api.put(`/users/${user.id}`, {
        fullname: user.fullname,
        location: user.location,
        phone: user.phone,
        role: user.role,
        password: passwordData.newPassword,
      });
      setSuccess('Password changed successfully!');
      setTimeout(() => {
        setShowPasswordModal(false);
        setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
        setSuccess('');
      }, 2000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to change password');
    } finally {
      setLoading(false);
    }
  };

  const getInitials = (name) => {
    return name
      ?.split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2) || 'U';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <Navbar />
      <div className="flex">
        <Sidebar />
        <main className="flex-1 p-8">
          <div className="max-w-4xl mx-auto">
            {/* Header */}
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-gray-800">Profile</h1>
              <p className="text-gray-600 mt-2">Manage your account settings</p>
            </div>

            {/* Success Message */}
            {success && (
              <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-xl flex items-start animate-fade-in">
                <CheckCircle className="w-5 h-5 text-green-600 mr-3 flex-shrink-0 mt-0.5" />
                <span className="text-green-700 text-sm font-medium">{success}</span>
              </div>
            )}

            {/* Profile Card */}
            <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
              {/* Cover Image */}
              <div className="h-32 bg-gradient-to-r from-primary-500 via-purple-500 to-pink-500 relative">
                <div className="absolute inset-0 bg-black/10"></div>
              </div>

              {/* Profile Content */}
              <div className="px-8 pb-8">
                {/* Avatar Section */}
                <div className="flex flex-col md:flex-row items-start md:items-end -mt-16 mb-6">
                  <div className="relative group">
                    <div className="w-32 h-32 bg-gradient-to-br from-primary-400 to-purple-600 rounded-2xl flex items-center justify-center text-white text-4xl font-bold shadow-2xl border-4 border-white">
                      {getInitials(user?.fullname)}
                    </div>
                    <button className="absolute bottom-2 right-2 w-10 h-10 bg-white rounded-full shadow-lg flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      <Camera className="w-5 h-5 text-gray-600" />
                    </button>
                  </div>

                  <div className="mt-4 md:mt-0 md:ml-6 flex-1">
                    <h2 className="text-3xl font-bold text-gray-800">{user?.fullname}</h2>
                    <p className="text-gray-500 text-lg">@{user?.username}</p>
                    
                    <div className="flex items-center mt-2">
                      <span
                        className={`px-4 py-1.5 rounded-full text-sm font-semibold flex items-center space-x-1 ${
                          user?.role === 'admin'
                            ? 'bg-purple-100 text-purple-700'
                            : 'bg-blue-100 text-blue-700'
                        }`}
                      >
                        <Shield className="w-4 h-4" />
                        <span>{user?.role === 'admin' ? 'Administrator' : 'Normal User'}</span>
                      </span>
                    </div>
                  </div>

                  <div className="flex space-x-3 mt-4 md:mt-0">
                    <button
                      onClick={() => setShowEditModal(true)}
                      className="px-6 py-3 bg-primary-600 text-white rounded-xl hover:bg-primary-700 transition-all duration-300 flex items-center space-x-2 shadow-lg hover:shadow-xl transform hover:scale-105"
                    >
                      <Edit2 className="w-4 h-4" />
                      <span>Edit Profile</span>
                    </button>
                    <button
                      onClick={() => setShowPasswordModal(true)}
                      className="px-6 py-3 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-all duration-300 flex items-center space-x-2"
                    >
                      <Key className="w-4 h-4" />
                      <span>Change Password</span>
                    </button>
                  </div>
                </div>

                {/* Information Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
                  {/* Username */}
                  <div className="p-6 bg-gradient-to-br from-blue-50 to-blue-100/50 rounded-xl border border-blue-200/50">
                    <div className="flex items-center space-x-3 mb-2">
                      <div className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center">
                        <User className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 font-medium uppercase tracking-wider">Username</p>
                        <p className="text-lg font-semibold text-gray-800">{user?.username}</p>
                      </div>
                    </div>
                  </div>

                  {/* Role */}
                  <div className="p-6 bg-gradient-to-br from-purple-50 to-purple-100/50 rounded-xl border border-purple-200/50">
                    <div className="flex items-center space-x-3 mb-2">
                      <div className="w-10 h-10 bg-purple-500 rounded-lg flex items-center justify-center">
                        <Shield className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 font-medium uppercase tracking-wider">Role</p>
                        <p className="text-lg font-semibold text-gray-800 capitalize">{user?.role}</p>
                      </div>
                    </div>
                  </div>

                  {/* Location */}
                  <div className="p-6 bg-gradient-to-br from-green-50 to-green-100/50 rounded-xl border border-green-200/50">
                    <div className="flex items-center space-x-3 mb-2">
                      <div className="w-10 h-10 bg-green-500 rounded-lg flex items-center justify-center">
                        <MapPin className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 font-medium uppercase tracking-wider">Location</p>
                        <p className="text-lg font-semibold text-gray-800">
                          {user?.location || 'Not set'}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Phone */}
                  <div className="p-6 bg-gradient-to-br from-orange-50 to-orange-100/50 rounded-xl border border-orange-200/50">
                    <div className="flex items-center space-x-3 mb-2">
                      <div className="w-10 h-10 bg-orange-500 rounded-lg flex items-center justify-center">
                        <Phone className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 font-medium uppercase tracking-wider">Phone</p>
                        <p className="text-lg font-semibold text-gray-800">
                          {user?.phone || 'Not set'}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Account Info */}
                <div className="mt-8 p-6 bg-gray-50 rounded-xl border border-gray-200">
                  <div className="flex items-center space-x-2 mb-4">
                    <Calendar className="w-5 h-5 text-gray-600" />
                    <h3 className="text-lg font-semibold text-gray-800">Account Information</h3>
                  </div>
                  <div className="space-y-2 text-sm text-gray-600">
                    <p>
                      <span className="font-medium">Member since:</span>{' '}
                      {user?.created_at ? formatDateTime(user.created_at) : 'N/A'}
                    </p>
                    <p>
                      <span className="font-medium">User ID:</span> #{user?.id}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>

      {/* Edit Profile Modal */}
      <Modal
        isOpen={showEditModal}
        onClose={() => {
          setShowEditModal(false);
          setError('');
        }}
        title="Edit Profile"
      >
        {error && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-xl flex items-start">
            <AlertCircle className="w-5 h-5 text-red-600 mr-3 flex-shrink-0 mt-0.5" />
            <span className="text-red-700 text-sm">{error}</span>
          </div>
        )}

        <form onSubmit={handleProfileSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
            <input
              type="text"
              name="fullname"
              value={profileData.fullname}
              onChange={handleProfileChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent transition"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Location</label>
            <input
              type="text"
              name="location"
              value={profileData.location}
              onChange={handleProfileChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent transition"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Phone</label>
            <input
              type="text"
              name="phone"
              value={profileData.phone}
              onChange={handleProfileChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent transition"
            />
          </div>

          <div className="flex justify-end space-x-4 pt-4">
            <button
              type="button"
              onClick={() => setShowEditModal(false)}
              className="px-6 py-3 border border-gray-300 rounded-xl hover:bg-gray-50 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-3 bg-primary-600 text-white rounded-xl hover:bg-primary-700 transition disabled:opacity-50"
            >
              {loading ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Change Password Modal */}
      <Modal
        isOpen={showPasswordModal}
        onClose={() => {
          setShowPasswordModal(false);
          setError('');
          setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
        }}
        title="Change Password"
      >
        {error && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-xl flex items-start">
            <AlertCircle className="w-5 h-5 text-red-600 mr-3 flex-shrink-0 mt-0.5" />
            <span className="text-red-700 text-sm">{error}</span>
          </div>
        )}

        <form onSubmit={handlePasswordSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">New Password</label>
            <input
              type="password"
              name="newPassword"
              value={passwordData.newPassword}
              onChange={handlePasswordChange}
              required
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent transition"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Confirm New Password
            </label>
            <input
              type="password"
              name="confirmPassword"
              value={passwordData.confirmPassword}
              onChange={handlePasswordChange}
              required
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent transition"
            />
          </div>

          <div className="flex justify-end space-x-4 pt-4">
            <button
              type="button"
              onClick={() => setShowPasswordModal(false)}
              className="px-6 py-3 border border-gray-300 rounded-xl hover:bg-gray-50 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-3 bg-primary-600 text-white rounded-xl hover:bg-primary-700 transition disabled:opacity-50"
            >
              {loading ? 'Changing...' : 'Change Password'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default Profile;