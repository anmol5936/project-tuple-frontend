import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { 
  Users, 
  Search, 
  Filter, 
  Newspaper, 
  MapPin, 
  Mail,
  Phone,
  AlertTriangle
} from 'lucide-react';
import { managerApi } from '../../lib/api';
import { Card } from '../../components/ui/Card';
import { PageHeader } from '../../components/ui/PageHeader';
import { Button } from '../../components/ui/Button';

type Customer = {
  id: string;
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  notificationPreferences?: {
    email: boolean;
    sms: boolean;
  };
  defaultAddress?: {
    _id: string;
    userId: string;
    streetAddress: string;
    city: string;
    state: string;
    postalCode: string;
  };
  subscriptions: Array<{
    id?: string;
    _id: string;
    userId: string;
    publicationId: {
      _id: string;
      name: string;
      publicationType: string;
      language: string;
    };
    addressId?: {
      _id: string;
      userId: string;
      streetAddress: string;
      city: string;
      state: string;
      postalCode: string;
    };
    areaId?: string;
    quantity: number;
    startDate: string;
    status: string;
    createdAt: string;
    deliveryPreferences?: {
      placement: string;
      additionalInstructions: string;
    };
  }>;
};

export default function Customers() {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [selectedArea, setSelectedArea] = useState('all');

  const { data: customersData, isLoading: customersLoading } = useQuery({
    queryKey: ['customers'],
    queryFn: managerApi.getCustomers,
  });

  const { data: areasData, isLoading: areasLoading } = useQuery({
    queryKey: ['areas'],
    queryFn: managerApi.getAreas,
  });

  // Adapt the API data to match our component's expected format
  const adaptedCustomers = customersData?.customers?.map(customer => {
    return {
      ...customer,
      id: customer._id || customer.id,
      subscriptions: customer.subscriptions.map(sub => ({
        ...sub,
        id: sub._id || sub.id,
        publication: {
          name: sub.publicationId?.name || 'Unknown Publication',
          publicationType: sub.publicationId?.publicationType || 'Unknown',
          language: sub.publicationId?.language || 'Unknown'
        }
      }))
    };
  }) || [];

  const filteredCustomers = adaptedCustomers.filter(customer => {
    const searchMatch = 
      customer.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      customer.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      customer.email.toLowerCase().includes(searchTerm.toLowerCase());

    const statusMatch = filterStatus === 'all' || 
      customer.subscriptions.some(sub => sub.status.toLowerCase() === filterStatus.toLowerCase());

    const areaMatch = selectedArea === 'all' || 
      customer.subscriptions.some(sub => sub.areaId === selectedArea);

    return searchMatch && statusMatch && areaMatch;
  });

  const getSubscriptionStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'paused':
        return 'bg-yellow-100 text-yellow-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getTotalSubscriptionsByStatus = (status: string) => {
    return adaptedCustomers.reduce(
      (acc, customer) => acc + customer.subscriptions.filter(
        sub => sub.status.toLowerCase() === status.toLowerCase()
      ).length,
      0
    );
  };

  return (
    <>
      <PageHeader
        title="Customer Management"
        subtitle="View and manage customer subscriptions and details"
      />

      {/* Summary Cards */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 mb-8">
        <Card>
          <Card.Content className="p-6">
            <div className="flex items-center justify-between">
              <div className="bg-blue-100 rounded-full p-3">
                <Users className="h-6 w-6 text-blue-600" />
              </div>
              <div className="text-right">
                <p className="text-sm font-medium text-gray-500">Total Customers</p>
                <p className="text-2xl font-semibold text-gray-900">
                  {adaptedCustomers.length || 0}
                </p>
              </div>
            </div>
          </Card.Content>
        </Card>

        <Card>
          <Card.Content className="p-6">
            <div className="flex items-center justify-between">
              <div className="bg-green-100 rounded-full p-3">
                <Newspaper className="h-6 w-6 text-green-600" />
              </div>
              <div className="text-right">
                <p className="text-sm font-medium text-gray-500">Active Subscriptions</p>
                <p className="text-2xl font-semibold text-gray-900">
                  {getTotalSubscriptionsByStatus('active')}
                </p>
              </div>
            </div>
          </Card.Content>
        </Card>

        <Card>
          <Card.Content className="p-6">
            <div className="flex items-center justify-between">
              <div className="bg-red-100 rounded-full p-3">
                <AlertTriangle className="h-6 w-6 text-red-600" />
              </div>
              <div className="text-right">
                <p className="text-sm font-medium text-gray-500">Cancelled Subscriptions</p>
                <p className="text-2xl font-semibold text-gray-900">
                  {getTotalSubscriptionsByStatus('cancelled')}
                </p>
              </div>
            </div>
          </Card.Content>
        </Card>
      </div>

      {/* Search and Filters */}
      <div className="mb-6">
        <Card>
          <Card.Content className="p-4">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search customers..."
                    className="pl-10 pr-4 py-2 w-full border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Filter className="h-5 w-5 text-gray-400" />
                <select
                  className="border rounded-lg px-4 py-2 bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                >
                  <option value="all">All Statuses</option>
                  <option value="active">Active</option>
                  <option value="paused">Paused</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="h-5 w-5 text-gray-400" />
                <select
                  className="border rounded-lg px-4 py-2 bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  value={selectedArea}
                  onChange={(e) => setSelectedArea(e.target.value)}
                >
                  <option value="all">All Areas</option>
                  {areasData?.areas?.map(area => (
                    <option key={area.id || area._id} value={area.id || area._id}>
                      {area.name} - {area.city}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </Card.Content>
        </Card>
      </div>

      {/* Customers List */}
      <div className="space-y-6">
        {customersLoading || areasLoading ? (
          <Card>
            <Card.Content className="p-8 text-center text-gray-500">
              Loading customers...
            </Card.Content>
          </Card>
        ) : filteredCustomers.length === 0 ? (
          <Card>
            <Card.Content className="p-8 text-center text-gray-500">
              No customers found
            </Card.Content>
          </Card>
        ) : (
          filteredCustomers.map((customer) => (
            <Card key={customer.id}>
              <Card.Content className="p-6">
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
                  <div className="mb-4 lg:mb-0">
                    <h3 className="text-lg font-semibold text-gray-900">
                      {customer.firstName} {customer.lastName}
                    </h3>
                    <div className="mt-2 space-y-2">
                      <div className="flex items-center text-sm text-gray-500">
                        <Mail className="h-4 w-4 mr-2" />
                        {customer.email}
                      </div>
                      <div className="flex items-center text-sm text-gray-500">
                        <Phone className="h-4 w-4 mr-2" />
                        {customer.phone}
                      </div>
                      <div className="flex items-center text-sm text-gray-500">
                        <MapPin className="h-4 w-4 mr-2" />
                        {customer.defaultAddress ? (
                          `${customer.defaultAddress.streetAddress}, ${customer.defaultAddress.city}, ${customer.defaultAddress.state} - ${customer.defaultAddress.postalCode}`
                        ) : (
                          'No address provided'
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Subscriptions */}
                <div className="mt-6">
                  <h4 className="text-sm font-medium text-gray-900 mb-3">Subscriptions</h4>
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead>
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Publication
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Type
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Language
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Quantity
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Status
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {customer.subscriptions.map((subscription) => (
                          <tr key={subscription.id}>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              {subscription.publication.name}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {subscription.publication.publicationType}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {subscription.publication.language}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {subscription.quantity}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getSubscriptionStatusColor(subscription.status)}`}>
                                {subscription.status}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </Card.Content>
            </Card>
          ))
        )}
      </div>
    </>
  );
}