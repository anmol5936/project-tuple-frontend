import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { 
  Users, 
  Search, 
  MapPin, 
  Mail,
  Phone,
  DollarSign,
  Route,
  Plus,
  Calendar
} from 'lucide-react';
import { managerApi } from '../../lib/api';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { Card } from '../../components/ui/Card';
import { PageHeader } from '../../components/ui/PageHeader';
import { Button } from '../../components/ui/Button';

export default function Deliverers() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedArea, setSelectedArea] = useState('all');

  const { data: areasData, isLoading: isLoadingAreas } = useQuery({
    queryKey: ['areas'],
    queryFn: managerApi.getAreas,
  });

  // Get all unique deliverers from all areas
  const deliverers = areasData?.areas.flatMap(area => 
    area.deliverers.map(deliverer => ({
      ...deliverer,
      areaName: area.name,
      areaId: area.id
    }))
  ) || [];

  const filteredDeliverers = deliverers.filter(deliverer => {
    const searchMatch = 
      deliverer.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      deliverer.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      deliverer.email.toLowerCase().includes(searchTerm.toLowerCase());

    const areaMatch = selectedArea === 'all' || deliverer.areaId === selectedArea;

    return searchMatch && areaMatch;
  });

  const [showAddDelivererForm, setShowAddDelivererForm] = useState(false);
  const [newDeliverer, setNewDeliverer] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    areaId: '',
    bankDetails: {
      accountName: '',
      accountNumber: '',
      bankName: '',
      ifscCode: ''
    },
    commissionRate: 2.5 // Default commission rate as per requirement
  });

  const handleAddDeliverer = async () => {
    try {
      await managerApi.addDeliverer(newDeliverer);
      setShowAddDelivererForm(false);
      // Reset form
      setNewDeliverer({
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        areaId: '',
        bankDetails: {
          accountName: '',
          accountNumber: '',
          bankName: '',
          ifscCode: ''
        },
        commissionRate: 2.5
      });
    } catch (error) {
      console.error('Error adding deliverer:', error);
    }
  };

  return (
    <DashboardLayout>
      <PageHeader
        title="Deliverer Management"
        subtitle="View and manage delivery staff and their routes"
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
                <p className="text-sm font-medium text-gray-500">Total Deliverers</p>
                <p className="text-2xl font-semibold text-gray-900">
                  {deliverers.length}
                </p>
              </div>
            </div>
          </Card.Content>
        </Card>

        <Card>
          <Card.Content className="p-6">
            <div className="flex items-center justify-between">
              <div className="bg-green-100 rounded-full p-3">
                <MapPin className="h-6 w-6 text-green-600" />
              </div>
              <div className="text-right">
                <p className="text-sm font-medium text-gray-500">Service Areas</p>
                <p className="text-2xl font-semibold text-gray-900">
                  {areasData?.areas.length || 0}
                </p>
              </div>
            </div>
          </Card.Content>
        </Card>

        <Card>
          <Card.Content className="p-6">
            <div className="flex items-center justify-between">
              <div className="bg-purple-100 rounded-full p-3">
                <Route className="h-6 w-6 text-purple-600" />
              </div>
              <div className="text-right">
                <p className="text-sm font-medium text-gray-500">Active Routes</p>
                <p className="text-2xl font-semibold text-gray-900">
                  {areasData?.areas.length || 0}
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
                    placeholder="Search deliverers..."
                    className="pl-10 pr-4 py-2 w-full border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="h-5 w-5 text-gray-400" />
                <select
                  className="border rounded-lg px-4 py-2 bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  value={selectedArea}
                  onChange={(e) => setSelectedArea(e.target.value)}
                >
                  <option value="all">All Areas</option>
                  {areasData?.areas.map(area => (
                    <option key={area.id} value={area.id}>
                      {area.name}
                    </option>
                  ))}
                </select>
              </div>
              <Button
                variant="primary"
                size="sm"
                onClick={() => setShowAddDelivererForm(true)}
              >
                <Plus className="h-5 w-5 mr-2" />
                Add Deliverer
              </Button>
            </div>
          </Card.Content>
        </Card>
      </div>

      {/* Add Deliverer Form */}
      {showAddDelivererForm && (
        <Card className="mb-6">
          <Card.Content className="p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Add New Deliverer</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">First Name</label>
                <input
                  type="text"
                  className="mt-1 block w-full border rounded-md shadow-sm py-2 px-3 focus:ring-blue-500 focus:border-blue-500"
                  value={newDeliverer.firstName}
                  onChange={(e) => setNewDeliverer({...newDeliverer, firstName: e.target.value})}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Last Name</label>
                <input
                  type="text"
                  className="mt-1 block w-full border rounded-md shadow-sm py-2 px-3 focus:ring-blue-500 focus:border-blue-500"
                  value={newDeliverer.lastName}
                  onChange={(e) => setNewDeliverer({...newDeliverer, lastName: e.target.value})}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Email</label>
                <input
                  type="email"
                  className="mt-1 block w-full border rounded-md shadow-sm py-2 px-3 focus:ring-blue-500 focus:border-blue-500"
                  value={newDeliverer.email}
                  onChange={(e) => setNewDeliverer({...newDeliverer, email: e.target.value})}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Phone</label>
                <input
                  type="tel"
                  className="mt-1 block w-full border rounded-md shadow-sm py-2 px-3 focus:ring-blue-500 focus:border-blue-500"
                  value={newDeliverer.phone}
                  onChange={(e) => setNewDeliverer({...newDeliverer, phone: e.target.value})}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Area</label>
                <select
                  className="mt-1 block w-full border rounded-md shadow-sm py-2 px-3 focus:ring-blue-500 focus:border-blue-500"
                  value={newDeliverer.areaId}
                  onChange={(e) => setNewDeliverer({...newDeliverer, areaId: e.target.value})}
                >
                  <option value="">Select Area</option>
                  {areasData?.areas.map(area => (
                    <option key={area.id} value={area.id}>
                      {area.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Commission Rate (%)</label>
                <input
                  type="number"
                  className="mt-1 block w-full border rounded-md shadow-sm py-2 px-3 focus:ring-blue-500 focus:border-blue-500"
                  value={newDeliverer.commissionRate}
                  onChange={(e) => setNewDeliverer({...newDeliverer, commissionRate: parseFloat(e.target.value)})}
                />
              </div>
            </div>

            <h4 className="text-md font-medium text-gray-900 mt-6 mb-4">Bank Details</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Account Name</label>
                <input
                  type="text"
                  className="mt-1 block w-full border rounded-md shadow-sm py-2 px-3 focus:ring-blue-500 focus:border-blue-500"
                  value={newDeliverer.bankDetails.accountName}
                  onChange={(e) => setNewDeliverer({
                    ...newDeliverer,
                    bankDetails: {...newDeliverer.bankDetails, accountName: e.target.value}
                  })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Account Number</label>
                <input
                  type="text"
                  className="mt-1 block w-full border rounded-md shadow-sm py-2 px-3 focus:ring-blue-500 focus:border-blue-500"
                  value={newDeliverer.bankDetails.accountNumber}
                  onChange={(e) => setNewDeliverer({
                    ...newDeliverer,
                    bankDetails: {...newDeliverer.bankDetails, accountNumber: e.target.value}
                  })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Bank Name</label>
                <input
                  type="text"
                  className="mt-1 block w-full border rounded-md shadow-sm py-2 px-3 focus:ring-blue-500 focus:border-blue-500"
                  value={newDeliverer.bankDetails.bankName}
                  onChange={(e) => setNewDeliverer({
                    ...newDeliverer,
                    bankDetails: {...newDeliverer.bankDetails, bankName: e.target.value}
                  })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">IFSC Code</label>
                <input
                  type="text"
                  className="mt-1 block w-full border rounded-md shadow-sm py-2 px-3 focus:ring-blue-500 focus:border-blue-500"
                  value={newDeliverer.bankDetails.ifscCode}
                  onChange={(e) => setNewDeliverer({
                    ...newDeliverer,
                    bankDetails: {...newDeliverer.bankDetails, ifscCode: e.target.value}
                  })}
                />
              </div>
            </div>

            <div className="mt-6 flex justify-end gap-4">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowAddDelivererForm(false)}
              >
                Cancel
              </Button>
              <Button
                variant="primary"
                size="sm"
                onClick={handleAddDeliverer}
              >
                Add Deliverer
              </Button>
            </div>
          </Card.Content>
        </Card>
      )}

      {/* Deliverers List */}
      <div className="space-y-6">
        {isLoadingAreas ? (
          <Card>
            <Card.Content className="p-8 text-center text-gray-500">
              Loading deliverers...
            </Card.Content>
          </Card>
        ) : filteredDeliverers.length === 0 ? (
          <Card>
            <Card.Content className="p-8 text-center text-gray-500">
              No deliverers found
            </Card.Content>
          </Card>
        ) : (
          filteredDeliverers.map((deliverer) => (
            <Card key={`${deliverer.firstName}-${deliverer.lastName}-${deliverer.areaId}`}>
              <Card.Content className="p-6">
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
                  <div className="mb-4 lg:mb-0">
                    <h3 className="text-lg font-semibold text-gray-900">
                      {deliverer.firstName} {deliverer.lastName}
                    </h3>
                    <div className="mt-2 space-y-2">
                      <div className="flex items-center text-sm text-gray-500">
                        <Mail className="h-4 w-4 mr-2" />
                        {deliverer.email}
                      </div>
                      <div className="flex items-center text-sm text-gray-500">
                        <MapPin className="h-4 w-4 mr-2" />
                        {deliverer.areaName}
                      </div>
                      <div className="flex items-center text-sm text-gray-500">
                        <Calendar className="h-4 w-4 mr-2" />
                        Commission Rate: 2.5%
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row gap-4">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => window.location.href = `/manager/deliverers/${deliverer.areaId}/route`}
                    >
                      <Route className="h-4 w-4 mr-2" />
                      View Route
                    </Button>
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={() => window.location.href = `/manager/deliverers/${deliverer.areaId}/earnings`}
                    >
                      <DollarSign className="h-4 w-4 mr-2" />
                      View Earnings
                    </Button>
                  </div>
                </div>
              </Card.Content>
            </Card>
          ))
        )}
      </div>
    </DashboardLayout>
  );
}