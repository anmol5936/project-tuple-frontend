import React, { useEffect, useState } from 'react';
import { Settings as SettingsIcon, User, MapPin, Bell, Truck, AlertCircle } from 'lucide-react';
import { customerApi } from '../../lib/api';
import { delivererApi } from '../../lib/api';

type DeliveryItems = {
  id: string;
  subscription: {
    userId: string;
    quantity: number;
    deliveryPreferences: {
      placement: string;
      additionalInstructions: string;
    };
  };
  address: {
    streetAddress: string;
    city: string;
    state: string;
    postalCode: string;
    deliveryInstructions: string;
  };
  publication: {
    name: string;
    language: string;
  };
};

type Manager = {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
};

 function DelivererSettings() {
  const [deliveryItems, setDeliveryItems] = useState<DeliveryItems[]>([]);
  const [managers, setManagers] = useState<Manager[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [itemsData, managersData] = await Promise.all([
          delivererApi.getDeliveryItems(),
          customerApi.getManagers()
        ]);
        setDeliveryItems(itemsData.items);
        setManagers(managersData.managers);
      } catch (err) {
        setError('Failed to load settings data. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <p className="text-xl font-semibold text-red-500">{error}</p>
          <button 
            onClick={() => window.location.reload()} 
            className="mt-4 px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  const defaultDeliveryPreferences = deliveryItems[0]?.subscription.deliveryPreferences;
  const defaultAddress = deliveryItems[0]?.address;
  const assignedManager = managers[0];

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center mb-8">
          <SettingsIcon className="w-8 h-8 text-blue-500 mr-3" />
          <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
        </div>

        <div className="space-y-6">
          {/* Contact Information */}
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="p-6">
              <div className="flex items-center mb-4">
                <User className="w-5 h-5 text-blue-500 mr-2" />
                <h2 className="text-xl font-semibold text-gray-900">Contact Information</h2>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Assigned Manager</label>
                  {assignedManager && (
                    <div className="mt-2">
                      <p className="text-gray-900">{assignedManager.firstName} {assignedManager.lastName}</p>
                      <p className="text-gray-600">{assignedManager.email}</p>
                      <p className="text-gray-600">{assignedManager.phone}</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Delivery Preferences */}
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="p-6">
              <div className="flex items-center mb-4">
                <Truck className="w-5 h-5 text-blue-500 mr-2" />
                <h2 className="text-xl font-semibold text-gray-900">Delivery Preferences</h2>
              </div>

              {defaultDeliveryPreferences && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Placement Location</label>
                    <p className="mt-1 text-gray-900">{defaultDeliveryPreferences.placement}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Additional Instructions</label>
                    <p className="mt-1 text-gray-900">{defaultDeliveryPreferences.additionalInstructions || 'No additional instructions'}</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Delivery Address */}
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="p-6">
              <div className="flex items-center mb-4">
                <MapPin className="w-5 h-5 text-blue-500 mr-2" />
                <h2 className="text-xl font-semibold text-gray-900">Delivery Address</h2>
              </div>

              {defaultAddress && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Street Address</label>
                    <p className="mt-1 text-gray-900">{defaultAddress.streetAddress}</p>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">City</label>
                      <p className="mt-1 text-gray-900">{defaultAddress.city}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">State</label>
                      <p className="mt-1 text-gray-900">{defaultAddress.state}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Postal Code</label>
                      <p className="mt-1 text-gray-900">{defaultAddress.postalCode}</p>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Delivery Instructions</label>
                    <p className="mt-1 text-gray-900">{defaultAddress.deliveryInstructions || 'No specific instructions'}</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Notification Preferences */}
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="p-6">
              <div className="flex items-center mb-4">
                <Bell className="w-5 h-5 text-blue-500 mr-2" />
                <h2 className="text-xl font-semibold text-gray-900">Notification Preferences</h2>
              </div>

              <div className="space-y-4">
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="delivery-notifications"
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    defaultChecked
                  />
                  <label htmlFor="delivery-notifications" className="ml-2 block text-sm text-gray-900">
                    Delivery Status Updates
                  </label>
                </div>
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="billing-notifications"
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    defaultChecked
                  />
                  <label htmlFor="billing-notifications" className="ml-2 block text-sm text-gray-900">
                    Billing and Payment Reminders
                  </label>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default  DelivererSettings;