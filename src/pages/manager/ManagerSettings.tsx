import React, { useEffect, useState } from 'react';
import { Settings as SettingsIcon, Users, MapPin, Newspaper, DollarSign, Building2, AlertCircle } from 'lucide-react';
import { managerApi } from '../../lib/api';

type Area = {
  id: string;
  name: string;
  city: string;
  state: string;
  postalCodes: string[];
  managers: Array<{
    firstName: string;
    lastName: string;
    email: string;
  }>;
  deliverers: Array<{
    firstName: string;
    lastName: string;
    email: string;
  }>;
  publications: Array<{
    name: string;
    language: string;
    price: number;
    publicationType: string;
  }>;
};

type Customer = {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  defaultAddress: {
    streetAddress: string;
    city: string;
    state: string;
    postalCode: string;
  };
  subscriptions: Array<{
    id: string;
    publication: {
      name: string;
      language: string;
      publicationType: string;
    };
    quantity: number;
    status: string;
  }>;
};

export function ManagerSettings() {
  const [areas, setAreas] = useState<Area[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedArea, setSelectedArea] = useState<string>('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [areasData, customersData] = await Promise.all([
          managerApi.getAreas(),
          managerApi.getCustomers()
        ]);
        setAreas(areasData.areas);
        setCustomers(customersData.customers);
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

  const selectedAreaData = areas.find(area => area.id === selectedArea);

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center mb-8">
          <SettingsIcon className="w-8 h-8 text-blue-500 mr-3" />
          <h1 className="text-3xl font-bold text-gray-900">Agency Settings</h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Area Management */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-md overflow-hidden">
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center">
                    <MapPin className="w-5 h-5 text-blue-500 mr-2" />
                    <h2 className="text-xl font-semibold text-gray-900">Area Management</h2>
                  </div>
                  <select
                    value={selectedArea}
                    onChange={(e) => setSelectedArea(e.target.value)}
                    className="rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  >
                    <option value="">Select Area</option>
                    {areas.map(area => (
                      <option key={area.id} value={area.id}>
                        {area.name} - {area.city}
                      </option>
                    ))}
                  </select>
                </div>

                {selectedAreaData && (
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <h3 className="text-lg font-medium text-gray-900 mb-3">Area Details</h3>
                        <div className="space-y-2">
                          <p className="text-sm text-gray-600">Name: <span className="text-gray-900">{selectedAreaData.name}</span></p>
                          <p className="text-sm text-gray-600">City: <span className="text-gray-900">{selectedAreaData.city}</span></p>
                          <p className="text-sm text-gray-600">State: <span className="text-gray-900">{selectedAreaData.state}</span></p>
                          <p className="text-sm text-gray-600">Postal Codes: <span className="text-gray-900">{selectedAreaData.postalCodes.join(', ')}</span></p>
                        </div>
                      </div>
                      
                      <div>
                        <h3 className="text-lg font-medium text-gray-900 mb-3">Publications</h3>
                        <div className="space-y-2">
                          {selectedAreaData.publications.map((pub, index) => (
                            <div key={index} className="flex justify-between items-center">
                              <span className="text-sm text-gray-600">{pub.name} ({pub.language})</span>
                              <span className="text-sm font-medium text-gray-900">₹{pub.price}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>

                    <div className="border-t pt-6">
                      <h3 className="text-lg font-medium text-gray-900 mb-3">Team</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <h4 className="text-sm font-medium text-gray-700 mb-2">Managers</h4>
                          <div className="space-y-2">
                            {selectedAreaData.managers.map((manager, index) => (
                              <div key={index} className="text-sm text-gray-600">
                                {manager.firstName} {manager.lastName}
                                <div className="text-xs text-gray-500">{manager.email}</div>
                              </div>
                            ))}
                          </div>
                        </div>
                        <div>
                          <h4 className="text-sm font-medium text-gray-700 mb-2">Deliverers</h4>
                          <div className="space-y-2">
                            {selectedAreaData.deliverers.map((deliverer, index) => (
                              <div key={index} className="text-sm text-gray-600">
                                {deliverer.firstName} {deliverer.lastName}
                                <div className="text-xs text-gray-500">{deliverer.email}</div>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div>
            <div className="bg-white rounded-lg shadow-md overflow-hidden">
              <div className="p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-6">Quick Actions</h2>
                <div className="space-y-4">
                  <button className="w-full flex items-center justify-center px-4 py-2 border border-blue-500 text-blue-500 rounded-md hover:bg-blue-50 transition-colors">
                    <Users className="w-4 h-4 mr-2" />
                    Add New Deliverer
                  </button>
                  <button className="w-full flex items-center justify-center px-4 py-2 border border-green-500 text-green-500 rounded-md hover:bg-green-50 transition-colors">
                    <Building2 className="w-4 h-4 mr-2" />
                    Add New Area
                  </button>
                  <button className="w-full flex items-center justify-center px-4 py-2 border border-purple-500 text-purple-500 rounded-md hover:bg-purple-50 transition-colors">
                    <Newspaper className="w-4 h-4 mr-2" />
                    Manage Publications
                  </button>
                  <button className="w-full flex items-center justify-center px-4 py-2 border border-orange-500 text-orange-500 rounded-md hover:bg-orange-50 transition-colors">
                    <DollarSign className="w-4 h-4 mr-2" />
                    Process Payments
                  </button>
                </div>
              </div>
            </div>

            {/* Customer Overview */}
            <div className="mt-6 bg-white rounded-lg shadow-md overflow-hidden">
              <div className="p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Customer Overview</h2>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Total Customers</span>
                    <span className="text-sm font-medium text-gray-900">{customers.length}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Active Subscriptions</span>
                    <span className="text-sm font-medium text-gray-900">
                      {customers.reduce((acc, customer) => 
                        acc + customer.subscriptions.filter(sub => sub.status === 'Active').length, 0
                      )}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Areas Covered</span>
                    <span className="text-sm font-medium text-gray-900">{areas.length}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}