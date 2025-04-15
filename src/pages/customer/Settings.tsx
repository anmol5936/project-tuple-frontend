import React, { useEffect, useState } from 'react';
import { User, MapPin, Bell, Truck, Phone, Mail, Settings as SettingsIcon, AlertCircle } from 'lucide-react';
import { customerApi } from '../../lib/api';

type Manager = {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
};

type Subscription = {
  id: string;
  publication: {
    name: string;
    language: string;
    price: number;
  };
  quantity: number;
  status: string;
  address: {
    streetAddress: string;
    city: string;
    state: string;
    postalCode: string;
  };
  deliverer: {
    firstName: string;
    lastName: string;
    phone: string;
  };
};

function Settings() {
  const [managers, setManagers] = useState<Manager[]>([]);
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState<'profile' | 'delivery' | 'notifications'>('profile');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [managersResponse, subscriptionsResponse] = await Promise.all([
        customerApi.getManagers(),
        customerApi.getSubscriptions()
      ]);
      setManagers(managersResponse.managers);
      setSubscriptions(subscriptionsResponse.subscriptions);
    } catch (err) {
      setError('Failed to load settings. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const getUniqueDeliverers = () => {
    const deliverers = subscriptions.map(sub => sub.deliverer);
    return deliverers.filter((deliverer, index, self) =>
      index === self.findIndex(d => d.phone === deliverer.phone)
    );
  };

  const getUniqueAddresses = () => {
    const addresses = subscriptions.map(sub => sub.address);
    return addresses.filter((address, index, self) =>
      index === self.findIndex(a => 
        a.streetAddress === address.streetAddress && 
        a.city === address.city
      )
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <p className="text-gray-600">Loading...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
          <SettingsIcon className="text-gray-400" size={24} />
        </div>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4 flex items-center gap-2">
            <AlertCircle size={20} />
            {error}
          </div>
        )}

        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="border-b border-gray-200">
            <nav className="flex">
              <button
                onClick={() => setActiveTab('profile')}
                className={`px-6 py-4 text-sm font-medium ${
                  activeTab === 'profile'
                    ? 'text-blue-600 border-b-2 border-blue-600'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                <div className="flex items-center gap-2">
                  <User size={18} />
                  Profile
                </div>
              </button>
              <button
                onClick={() => setActiveTab('delivery')}
                className={`px-6 py-4 text-sm font-medium ${
                  activeTab === 'delivery'
                    ? 'text-blue-600 border-b-2 border-blue-600'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                <div className="flex items-center gap-2">
                  <Truck size={18} />
                  Delivery
                </div>
              </button>
              <button
                onClick={() => setActiveTab('notifications')}
                className={`px-6 py-4 text-sm font-medium ${
                  activeTab === 'notifications'
                    ? 'text-blue-600 border-b-2 border-blue-600'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                <div className="flex items-center gap-2">
                  <Bell size={18} />
                  Notifications
                </div>
              </button>
            </nav>
          </div>

          <div className="p-6">
            {activeTab === 'profile' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Account Manager</h3>
                  {managers.map((manager) => (
                    <div key={manager.id} className="bg-gray-50 rounded-lg p-4">
                      <div className="flex items-start gap-4">
                        <div className="p-3 bg-blue-100 rounded-lg">
                          <User className="text-blue-600" size={24} />
                        </div>
                        <div>
                          <h4 className="font-medium text-gray-900">
                            {manager.firstName} {manager.lastName}
                          </h4>
                          <div className="mt-2 space-y-1">
                            <p className="text-sm text-gray-600 flex items-center gap-2">
                              <Mail size={16} />
                              {manager.email}
                            </p>
                            <p className="text-sm text-gray-600 flex items-center gap-2">
                              <Phone size={16} />
                              {manager.phone}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Delivery Addresses</h3>
                  <div className="space-y-4">
                    {getUniqueAddresses().map((address, index) => (
                      <div key={index} className="bg-gray-50 rounded-lg p-4">
                        <div className="flex items-start gap-4">
                          <div className="p-3 bg-green-100 rounded-lg">
                            <MapPin className="text-green-600" size={24} />
                          </div>
                          <div>
                            <p className="text-gray-900">{address.streetAddress}</p>
                            <p className="text-sm text-gray-600">
                              {address.city}, {address.state} {address.postalCode}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'delivery' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Delivery Personnel</h3>
                  <div className="space-y-4">
                    {getUniqueDeliverers().map((deliverer, index) => (
                      <div key={index} className="bg-gray-50 rounded-lg p-4">
                        <div className="flex items-start gap-4">
                          <div className="p-3 bg-purple-100 rounded-lg">
                            <Truck className="text-purple-600" size={24} />
                          </div>
                          <div>
                            <h4 className="font-medium text-gray-900">
                              {deliverer.firstName} {deliverer.lastName}
                            </h4>
                            <p className="text-sm text-gray-600 flex items-center gap-2 mt-2">
                              <Phone size={16} />
                              {deliverer.phone}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Active Subscriptions</h3>
                  <div className="space-y-4">
                    {subscriptions.map((subscription) => (
                      <div key={subscription.id} className="bg-gray-50 rounded-lg p-4">
                        <div className="flex justify-between items-start">
                          <div>
                            <h4 className="font-medium text-gray-900">
                              {subscription.publication.name}
                            </h4>
                            <p className="text-sm text-gray-600">
                              {subscription.quantity} {subscription.quantity > 1 ? 'copies' : 'copy'} •{' '}
                              {subscription.publication.language}
                            </p>
                          </div>
                          <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                            subscription.status.toLowerCase() === 'active'
                              ? 'bg-green-100 text-green-800'
                              : 'bg-yellow-100 text-yellow-800'
                          }`}>
                            {subscription.status}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'notifications' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Notification Preferences</h3>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between py-3">
                      <div>
                        <p className="font-medium text-gray-900">Bill Reminders</p>
                        <p className="text-sm text-gray-600">
                          Get notified when your monthly bill is generated
                        </p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input type="checkbox" className="sr-only peer" defaultChecked />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                      </label>
                    </div>

                    <div className="flex items-center justify-between py-3">
                      <div>
                        <p className="font-medium text-gray-900">Delivery Updates</p>
                        <p className="text-sm text-gray-600">
                          Receive notifications about delivery status changes
                        </p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input type="checkbox" className="sr-only peer" defaultChecked />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                      </label>
                    </div>

                    <div className="flex items-center justify-between py-3">
                      <div>
                        <p className="font-medium text-gray-900">Subscription Updates</p>
                        <p className="text-sm text-gray-600">
                          Get notified about changes to your subscriptions
                        </p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input type="checkbox" className="sr-only peer" defaultChecked />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                      </label>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Settings;