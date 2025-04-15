import React, { useState, useEffect } from 'react';
import { User, Lock, Eye, EyeOff, CheckCircle, AlertCircle, Mail, Phone, MapPin, Newspaper, Calendar, CreditCard } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { authApi } from '../../lib/api';
import { CUSTOMER_ROUTES } from '../../types/api';

interface ChangePasswordForm {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

interface UserProfile {
  id: string;
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  address: string;
  subscriptions: Subscription[];
  outstandingDue: number;
  lastPaymentDate: string | null;
}

interface Subscription {
  id: string;
  publicationType: string;
  name: string;
  startDate: string;
  status: 'active' | 'paused' | 'cancelled';
  deliveryTime: string;
  cost: number;
  quantity: number;
}

function Profile() {
  const { user } = useAuth();
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  const [profile, setProfile] = useState<UserProfile>({
    id: '',
    username: '',
    email: '',
    firstName: '',
    lastName: '',
    role: '',
    address: '',
    subscriptions: [],
    outstandingDue: 0,
    lastPaymentDate: null,
  });

  const [formData, setFormData] = useState<ChangePasswordForm>({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  // Fetch user data and subscriptions on mount
  useEffect(() => {
    if (user) {
      // Map user token data to profile
      const address = user.areas?.[0]
        ? `${user.areas[0].name}, ${user.areas[0].city}, ${user.areas[0].state}`
        : 'No address provided';

      setProfile((prev) => ({
        ...prev,
        id: user.id,
        username: user.username,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        address,
      }));

      // Fetch subscriptions
      const fetchSubscriptions = async () => {
        try {
          const response = await fetch(CUSTOMER_ROUTES.GET_SUBSCRIPTIONS.path, {
            headers: {
              Authorization: `Bearer ${localStorage.getItem('token')}`,
            },
          });
          const data = await response.json();
          if (data.subscriptions) {
            setProfile((prev) => ({
              ...prev,
              subscriptions: data.subscriptions.map((sub: any) => ({
                id: sub.id,
                publicationType: sub.publication.publicationType || 'Unknown',
                name: sub.publication.name,
                startDate: sub.effectiveDate || new Date().toISOString(),
                status: sub.status.toLowerCase(),
                deliveryTime: sub.deliveryPreferences?.placement || 'Morning',
                cost: sub.publication.price,
                quantity: sub.quantity,
              })),
            }));
          }
        } catch (err) {
          console.error('Failed to fetch subscriptions:', err);
        }
      };

      // Fetch bills to calculate outstanding due and last payment
      const fetchBills = async () => {
        try {
          const response = await fetch(CUSTOMER_ROUTES.GET_BILLS.path, {
            headers: {
              Authorization: `Bearer ${localStorage.getItem('token')}`,
            },
          });
          const data = await response.json();
          if (data.bills) {
            const outstandingDue = data.bills.reduce(
              (sum: number, bill: any) => sum + bill.outstandingAmount,
              0
            );
            const lastPaidBill = data.bills
              .filter((bill: any) => bill.status === 'Paid')
              .sort((a: any, b: any) => new Date(b.billDate).getTime() - new Date(a.billDate).getTime())[0];

            setProfile((prev) => ({
              ...prev,
              outstandingDue,
              lastPaymentDate: lastPaidBill ? lastPaidBill.billDate : null,
            }));
          }
        } catch (err) {
          console.error('Failed to fetch bills:', err);
        }
      };

      fetchSubscriptions();
      fetchBills();
    }
  }, [user]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    setError('');
    setSuccess('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (formData.newPassword !== formData.confirmPassword) {
      setError('New passwords do not match');
      return;
    }

    if (formData.newPassword.length < 8) {
      setError('Password must be at least 8 characters long');
      return;
    }

    try {
      setLoading(true);
      await authApi.changepassword({
        currentPassword: formData.currentPassword,
        newPassword: formData.newPassword,
      });
      setSuccess('Password changed successfully');
      setFormData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      });
    } catch (err: any) {
      setError(
        err.response?.data?.message ||
          'Failed to change password. Please check your current password and try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Profile Information Card */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <User className="h-6 w-6 text-blue-600" />
              </div>
              <h1 className="ml-3 text-xl font-semibold text-gray-900">Profile Information</h1>
            </div>
          </div>

          <div className="px-6 py-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="flex items-center space-x-3">
                  <User className="h-5 w-5 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-500">Name</p>
                    <p className="text-sm font-medium text-gray-900">
                      {profile.firstName} {profile.lastName}
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <Mail className="h-5 w-5 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-500">Email</p>
                    <p className="text-sm font-medium text-gray-900">{profile.email}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <Phone className="h-5 w-5 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-500">Username</p>
                    <p className="text-sm font-medium text-gray-900">{profile.username}</p>
                  </div>
                </div>
              </div>
              <div className="space-y-4">
                <div className="flex items-center space-x-3">
                  <MapPin className="h-5 w-5 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-500">Delivery Address</p>
                    <p className="text-sm font-medium text-gray-900">{profile.address}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Change Password Card */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Lock className="h-6 w-6 text-blue-600" />
              </div>
              <h2 className="ml-3 text-xl font-semibold text-gray-900">Change Password</h2>
            </div>
          </div>

          <div className="px-6 py-6">
            {success && (
              <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-md flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-green-500" />
                <span className="text-green-700">{success}</span>
              </div>
            )}

            {error && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-md flex items-center gap-2">
                <AlertCircle className="h-5 w-5 text-red-500" />
                <span className="text-red-700">{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label htmlFor="currentPassword" className="block text-sm font-medium text-gray-700">
                  Current Password
                </label>
                <div className="mt-1 relative">
                  <input
                    type={showCurrentPassword ? 'text' : 'password'}
                    name="currentPassword"
                    id="currentPassword"
                    value={formData.currentPassword}
                    onChange={handleInputChange}
                    required
                    className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  />
                  <button
                    type="button"
                    onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  >
                    {showCurrentPassword ? (
                      <EyeOff className="h-5 w-5 text-gray-400" />
                    ) : (
                      <Eye className="h-5 w-5 text-gray-400" />
                    )}
                  </button>
                </div>
              </div>

              <div>
                <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700">
                  New Password
                </label>
                <div className="mt-1 relative">
                  <input
                    type={showNewPassword ? 'text' : 'password'}
                    name="newPassword"
                    id="newPassword"
                    value={formData.newPassword}
                    onChange={handleInputChange}
                    required
                    className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  >
                    {showNewPassword ? (
                      <EyeOff className="h-5 w-5 text-gray-400" />
                    ) : (
                      <Eye className="h-5 w-5 text-gray-400" />
                    )}
                  </button>
                </div>
              </div>

              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
                  Confirm New Password
                </label>
                <div className="mt-1 relative">
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    name="confirmPassword"
                    id="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleInputChange}
                    required
                    className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="h-5 w-5 text-gray-400" />
                    ) : (
                      <Eye className="h-5 w-5 text-gray-400" />
                    )}
                  </button>
                </div>
              </div>

              <div>
                <button
                  type="submit"
                  disabled={loading}
                  className={`w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white ${
                    loading
                      ? 'bg-blue-400 cursor-not-allowed'
                      : 'bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500'
                  }`}
                >
                  {loading ? 'Changing Password...' : 'Change Password'}
                </button>
              </div>
            </form>

            <div className="mt-8 p-4 bg-gray-50 rounded-md">
              <h3 className="text-sm font-medium text-gray-900">Password Requirements:</h3>
              <ul className="mt-2 text-sm text-gray-600 list-disc list-inside">
                <li>Minimum 8 characters long</li>
                <li>Include at least one uppercase letter</li>
                <li>Include at least one number</li>
                <li>Include at least one special character</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Profile;