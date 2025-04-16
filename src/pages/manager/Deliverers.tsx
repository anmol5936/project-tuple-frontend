import { useState, useEffect } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
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
import { Card } from '../../components/ui/Card';
import { PageHeader } from '../../components/ui/PageHeader';
import { Button } from '../../components/ui/Button';

export interface DeliverySchedule {
  _id: string;
  personnelId: {
    _id: string;
    firstName: string;
    lastName: string;
    bankDetails: { accountName: string };
  };
  date: string;
  areaId: { _id: string; name: string };
  routeId: { _id: string; routeName: string };
  notes?: string;
  status: string;
}

export interface CreateRouteRequest {
  personnelId: string;
  routeName: string;
  routeDescription: string;
  areaId: string;
  optimizationCriteria: 'Distance' | 'Time' | 'Custom';
}

export interface DeliveryRoute {
  _id: string;
  personnelId: {
    _id: string;
    firstName: string;
    lastName: string;
  };
  routeName: string;
  routeDescription?: string;
  areaId: {
    _id: string;
    name: string;
  };
  optimizationCriteria: 'Distance' | 'Time' | 'Custom';
  isActive: boolean;
  createdAt: string;
}

interface DelivererWithPersonnel extends Deliverer {
  areaName: string;
  areaId: string;
  personnelId?: string;
}

interface Deliverer {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  commissionRate?: number;
}

export default function Deliverers() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedArea, setSelectedArea] = useState('all');
  const [showAddDelivererForm, setShowAddDelivererForm] = useState(false);
  const [showCreateRouteForm, setShowCreateRouteForm] = useState(false);
  const [showCreateScheduleModal, setShowCreateScheduleModal] = useState(false);
  const [showSchedulesModal, setShowSchedulesModal] = useState(false);
  const [showRoutesModal, setShowRoutesModal] = useState(false);
  const [selectedDelivererRoutes, setSelectedDelivererRoutes] = useState<DeliveryRoute[]>([]);
  const [deliverersWithPersonnel, setDeliverersWithPersonnel] = useState<DelivererWithPersonnel[]>([]);
  const [schedules, setSchedules] = useState<DeliverySchedule[]>([]);
  const [routes, setRoutes] = useState<DeliveryRoute[]>([]);

  const queryClient = useQueryClient();

  const { data: areasData, isLoading: isLoadingAreas, refetch: refetchAreas } = useQuery({
    queryKey: ['areas'],
    queryFn: managerApi.getAreas,
  });

  const { data: routesData, isLoading: isLoadingRoutes } = useQuery({
    queryKey: ['routes'],
    queryFn: () => managerApi.getRoutes(),
    enabled: !!areasData,
  });

  useEffect(() => {
    if (routesData?.routes) {
      setRoutes(routesData.routes);
    }
  }, [routesData]);

  useEffect(() => {
    const fetchPersonnelIds = async () => {
      if (!areasData?.areas) return;

      const deliverers = areasData.areas.flatMap(area =>
        area.deliverers.map(deliverer => ({
          ...deliverer,
          areaName: area.name,
          areaId: area._id,
        }))
      );

      const deliverersWithIds = await Promise.all(
        deliverers.map(async deliverer => {
          try {
            const { personnelId } = await managerApi.getPersonnelIdByUserId(deliverer._id);
            return { ...deliverer, personnelId };
          } catch (error) {
            console.error(`Error fetching personnelId for user ${deliverer._id}:`, error);
            return deliverer;
          }
        })
      );

      setDeliverersWithPersonnel(deliverersWithIds);
    };

    fetchPersonnelIds();
  }, [areasData]);

  const filteredDeliverers = deliverersWithPersonnel.filter(deliverer => {
    const searchMatch =
      deliverer.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      deliverer.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      deliverer.email.toLowerCase().includes(searchTerm.toLowerCase());

    const areaMatch = selectedArea === 'all' || deliverer.areaId === selectedArea;

    return searchMatch && areaMatch;
  });

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
      ifscCode: '',
    },
    commissionRate: 2.5,
  });

  const [newRoute, setNewRoute] = useState<CreateRouteRequest>({
    personnelId: '',
    routeName: '',
    routeDescription: '',
    areaId: '',
    optimizationCriteria: 'Distance',
  });

  const [newSchedule, setNewSchedule] = useState<{
    personnelId: string;
    date: string;
    areaId: string;
    routeId: string;
    notes: string;
  }>({
    personnelId: '',
    date: '',
    areaId: '',
    routeId: '',
    notes: '',
  });

  const handleAddDeliverer = async () => {
    try {
      await managerApi.addDeliverer(newDeliverer);
      setShowAddDelivererForm(false);
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
          ifscCode: '',
        },
        commissionRate: 2.5,
      });
      await refetchAreas();
    } catch (error) {
      console.error('Error adding deliverer:', error);
      alert('Failed to add deliverer. Please try again.');
    }
  };

  const handleCreateRoute = async () => {
    if (!newRoute.personnelId || !newRoute.routeName || !newRoute.areaId) {
      alert('Please fill in all required fields: Deliverer, Route Name, and Area');
      return;
    }

    try {
      await managerApi.createRoute(newRoute);
      setShowCreateRouteForm(false);
      setNewRoute({
        personnelId: '',
        routeName: '',
        routeDescription: '',
        areaId: '',
        optimizationCriteria: 'Distance',
      });
      await refetchAreas();
      await queryClient.invalidateQueries(['routes']);
    } catch (error) {
      console.error('Error creating route:', error);
      alert('Failed to create route. Please check the console for details.');
    }
  };

  const handleCreateSchedule = async () => {
    if (!newSchedule.personnelId || !newSchedule.date || !newSchedule.areaId || !newSchedule.routeId) {
      alert('Please fill in all required fields: Deliverer, Date, Area, and Route');
      return;
    }

    try {
      await managerApi.createSchedule(newSchedule);
      setShowCreateScheduleModal(false);
      setNewSchedule({
        personnelId: '',
        date: '',
        areaId: '',
        routeId: '',
        notes: '',
      });
      alert('Schedule created successfully!');
    } catch (error) {
      console.error('Error creating schedule:', error);
      alert('Failed to create schedule. Please try again.');
    }
  };

  const handleGetSchedules = async () => {
    try {
      const response = await managerApi.getSchedules({ date: '' });
      console.log('Fetched schedules:', response);
      setSchedules(response.schedules);
      setShowSchedulesModal(true);
    } catch (error) {
      console.error('Error fetching schedules:', error);
      alert('Failed to fetch schedules. Please try again.');
    }
  };

  const handleViewRoutes = async (personnelId: string) => {
    try {
      // First, check if we already have routes data
      if (routes.length > 0) {
        // Filter routes to show only those belonging to this deliverer
        const delivererRoutes = routes.filter(
          route => route.personnelId._id === personnelId
        );
        setSelectedDelivererRoutes(delivererRoutes);
        setShowRoutesModal(true);
      } else {
        // If routes aren't loaded yet, fetch them first
        const response = await managerApi.getRoutes();
        if (response && response.routes) {
          const allRoutes = response.routes;
          setRoutes(allRoutes);
          // Then filter for this deliverer
          const delivererRoutes = allRoutes.filter(
            route => route.personnelId._id === personnelId
          );
          setSelectedDelivererRoutes(delivererRoutes);
          setShowRoutesModal(true);
        }
      }
    } catch (error) {
      console.error('Error fetching routes:', error);
      alert('Failed to fetch routes. Please try again.');
    }
  };

  return (
    <>
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
                  {deliverersWithPersonnel.length}
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
                  {routes.length}
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
                    <option key={area._id} value={area._id}>
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
              <Button
                variant="primary"
                size="sm"
                onClick={() => setShowCreateRouteForm(true)}
              >
                <Route className="h-5 w-5 mr-2" />
                Create Route
              </Button>
              <Button
                variant="primary"
                size="sm"
                onClick={() => setShowCreateScheduleModal(true)}
              >
                <Calendar className="h-5 w-5 mr-2" />
                Create Schedule
              </Button>
              <Button
                variant="primary"
                size="sm"
                onClick={handleGetSchedules}
              >
                <Calendar className="h-5 w-5 mr-2" />
                View Schedules
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
                  onChange={(e) => setNewDeliverer({ ...newDeliverer, firstName: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Last Name</label>
                <input
                  type="text"
                  className="mt-1 block w-full border rounded-md shadow-sm py-2 px-3 focus:ring-blue-500 focus:border-blue-500"
                  value={newDeliverer.lastName}
                  onChange={(e) => setNewDeliverer({ ...newDeliverer, lastName: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Email</label>
                <input
                  type="email"
                  className="mt-1 block w-full border rounded-md shadow-sm py-2 px-3 focus:ring-blue-500 focus:border-blue-500"
                  value={newDeliverer.email}
                  onChange={(e) => setNewDeliverer({ ...newDeliverer, email: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Phone</label>
                <input
                  type="tel"
                  className="mt-1 block w-full border rounded-md shadow-sm py-2 px-3 focus:ring-blue-500 focus:border-blue-500"
                  value={newDeliverer.phone}
                  onChange={(e) => setNewDeliverer({ ...newDeliverer, phone: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Area</label>
                <select
                  className="mt-1 block w-full border rounded-md shadow-sm py-2 px-3 focus:ring-blue-500 focus:border-blue-500"
                  value={newDeliverer.areaId}
                  onChange={(e) => setNewDeliverer({ ...newDeliverer, areaId: e.target.value })}
                >
                  <option value="">Select Area</option>
                  {areasData?.areas.map(area => (
                    <option key={area._id} value={area._id}>
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
                  onChange={(e) => setNewDeliverer({ ...newDeliverer, commissionRate: parseFloat(e.target.value) })}
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
                  onChange={(e) =>
                    setNewDeliverer({
                      ...newDeliverer,
                      bankDetails: { ...newDeliverer.bankDetails, accountName: e.target.value },
                    })
                  }
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Account Number</label>
                <input
                  type="text"
                  className="mt-1 block w-full border rounded-md shadow-sm py-2 px-3 focus:ring-blue-500 focus:border-blue-500"
                  value={newDeliverer.bankDetails.accountNumber}
                  onChange={(e) =>
                    setNewDeliverer({
                      ...newDeliverer,
                      bankDetails: { ...newDeliverer.bankDetails, accountNumber: e.target.value },
                    })
                  }
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Bank Name</label>
                <input
                  type="text"
                  className="mt-1 block w-full border rounded-md shadow-sm py-2 px-3 focus:ring-blue-500 focus:border-blue-500"
                  value={newDeliverer.bankDetails.bankName}
                  onChange={(e) =>
                    setNewDeliverer({
                      ...newDeliverer,
                      bankDetails: { ...newDeliverer.bankDetails, bankName: e.target.value },
                    })
                  }
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">IFSC Code</label>
                <input
                  type="text"
                  className="mt-1 block w-full border rounded-md shadow-sm py-2 px-3 focus:ring-blue-500 focus:border-blue-500"
                  value={newDeliverer.bankDetails.ifscCode}
                  onChange={(e) =>
                    setNewDeliverer({
                      ...newDeliverer,
                      bankDetails: { ...newDeliverer.bankDetails, ifscCode: e.target.value },
                    })
                  }
                />
              </div>
            </div>

            <div className="mt-6 flex justify-end gap-4">
              <Button variant="outline" size="sm" onClick={() => setShowAddDelivererForm(false)}>
                Cancel
              </Button>
              <Button variant="primary" size="sm" onClick={handleAddDeliverer}>
                Add Deliverer
              </Button>
            </div>
          </Card.Content>
        </Card>
      )}

      {/* Create Route Form */}
      {showCreateRouteForm && (
        <Card className="mb-6">
          <Card.Content className="p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Create New Route</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Deliverer</label>
                <select
                  className="mt-1 block w-full border rounded-md shadow-sm py-2 px-3 focus:ring-blue-500 focus:border-blue-500"
                  value={newRoute.personnelId}
                  onChange={(e) => setNewRoute({ ...newRoute, personnelId: e.target.value })}
                >
                  <option value="">Select Deliverer</option>
                  {deliverersWithPersonnel.map(deliverer => (
                    <option key={deliverer._id} value={deliverer.personnelId || ''}>
                      {deliverer.firstName} {deliverer.lastName} ({deliverer.areaName})
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Route Name</label>
                <input
                  type="text"
                  className="mt-1 block w-full border rounded-md shadow-sm py-2 px-3 focus:ring-blue-500 focus:border-blue-500"
                  value={newRoute.routeName}
                  onChange={(e) => setNewRoute({ ...newRoute, routeName: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Route Description</label>
                <input
                  type="text"
                  className="mt-1 block w-full border rounded-md shadow-sm py-2 px-3 focus:ring-blue-500 focus:border-blue-500"
                  value={newRoute.routeDescription}
                  onChange={(e) => setNewRoute({ ...newRoute, routeDescription: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Area</label>
                <select
                  className="mt-1 block w-full border rounded-md shadow-sm py-2 px-3 focus:ring-blue-500 focus:border-blue-500"
                  value={newRoute.areaId}
                  onChange={(e) => setNewRoute({ ...newRoute, areaId: e.target.value })}
                >
                  <option value="">Select Area</option>
                  {areasData?.areas.map(area => (
                    <option key={area._id} value={area._id}>
                      {area.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Optimization Criteria</label>
                <select
                  className="mt-1 block w-full border rounded-md shadow-sm py-2 px-3 focus:ring-blue-500 focus:border-blue-500"
                  value={newRoute.optimizationCriteria}
                  onChange={(e) =>
                    setNewRoute({
                      ...newRoute,
                      optimizationCriteria: e.target.value as 'Distance' | 'Time' | 'Custom',
                    })
                  }
                >
                  <option value="Distance">Distance</option>
                  <option value="Time">Time</option>
                  <option value="Custom">Custom</option>
                </select>
              </div>
            </div>

            <div className="mt-6 flex justify-end gap-4">
              <Button variant="outline" size="sm" onClick={() => setShowCreateRouteForm(false)}>
                Cancel
              </Button>
              <Button variant="primary" size="sm" onClick={handleCreateRoute}>
                Create Route
              </Button>
            </div>
          </Card.Content>
        </Card>
      )}

      {/* Create Schedule Modal */}
      {showCreateScheduleModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-lg">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Create New Schedule</h3>
            <div className="grid grid-cols-1 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Deliverer</label>
                <select
                  className="mt-1 block w-full border rounded-md shadow-sm py-2 px-3 focus:ring-blue-500 focus:border-blue-500"
                  value={newSchedule.personnelId}
                  onChange={(e) => setNewSchedule({ ...newSchedule, personnelId: e.target.value })}
                >
                  <option value="">Select Deliverer</option>
                  {deliverersWithPersonnel.map(deliverer => (
                    <option key={deliverer._id} value={deliverer.personnelId || ''}>
                      {deliverer.firstName} {deliverer.lastName} ({deliverer.areaName})
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Date</label>
                <input
                  type="date"
                  className="mt-1 block w-full border rounded-md shadow-sm py-2 px-3 focus:ring-blue-500 focus:border-blue-500"
                  value={newSchedule.date}
                  onChange={(e) => setNewSchedule({ ...newSchedule, date: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Area</label>
                <select
                  className="mt-1 block w-full border rounded-md shadow-sm py-2 px-3 focus:ring-blue-500 focus:border-blue-500"
                  value={newSchedule.areaId}
                  onChange={(e) => setNewSchedule({ ...newSchedule, areaId: e.target.value })}
                >
                  <option value="">Select Area</option>
                  {areasData?.areas.map(area => (
                    <option key={area._id} value={area._id}>
                      {area.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Route</label>
                <select
                  className="mt-1 block w-full border rounded-md shadow-sm py-2 px-3 focus:ring-blue-500 focus:border-blue-500"
                  value={newSchedule.routeId}
                  onChange={(e) => setNewSchedule({ ...newSchedule, routeId: e.target.value })}
                >
                  <option value="">Select Route</option>
                  {isLoadingRoutes ? (
                    <option disabled>Loading routes...</option>
                  ) : routes.length === 0 ? (
                    <option disabled>No routes available</option>
                  ) : (
                    routes.map(route => (
                      <option key={route._id} value={route._id}>
                        {route.routeName} ({route.areaId.name}, {route.personnelId.firstName} {route.personnelId.lastName})
                      </option>
                    ))
                  )}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Notes</label>
                <textarea
                  className="mt-1 block w-full border rounded-md shadow-sm py-2 px-3 focus:ring-blue-500 focus:border-blue-500"
                  value={newSchedule.notes}
                  onChange={(e) => setNewSchedule({ ...newSchedule, notes: e.target.value })}
                />
              </div>
            </div>

            <div className="mt-6 flex justify-end gap-4">
              <Button variant="outline" size="sm" onClick={() => setShowCreateScheduleModal(false)}>
                Cancel
              </Button>
              <Button variant="primary" size="sm" onClick={handleCreateSchedule}>
                Create Schedule
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Schedules Modal */}
      {showSchedulesModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Delivery Schedules</h3>
            {schedules.length === 0 ? (
              <p className="text-gray-500">No schedules found.</p>
            ) : (
              <div className="space-y-4">
                {schedules.map(schedule => (
                  <Card key={schedule._id}>
                    <Card.Content className="p-4">
                      <div className="flex flex-col gap-2">
                        <p>
                          <strong>Deliverer:</strong>{' '}
                          {schedule.personnelId
                            ? `${schedule.personnelId.bankDetails.accountName} `
                            : 'N/A'}
                        </p>
                        <p>
                          <strong>Date:</strong> {new Date(schedule.date).toLocaleDateString()}
                        </p>
                        <p>
                          <strong>Area:</strong> {schedule.areaId?.name || 'N/A'}
                        </p>
                        <p>
                          <strong>Route:</strong> {schedule.routeId?.routeName || 'N/A'}
                        </p>
                        <p>
                          <strong>Notes:</strong> {schedule.notes || 'N/A'}
                        </p>
                        <p>
                          <strong>Status:</strong> {schedule.status || 'N/A'}
                        </p>
                      </div>
                    </Card.Content>
                  </Card>
                ))}
              </div>
            )}
            <div className="mt-6 flex justify-end">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowSchedulesModal(false)}
              >
                Close
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Routes Modal */}
      {showRoutesModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Deliverer Routes</h3>
            {selectedDelivererRoutes.length === 0 ? (
              <p className="text-gray-500">No routes found for this deliverer.</p>
            ) : (
              <div className="space-y-4">
                {selectedDelivererRoutes.map(route => (
                  <Card key={route._id}>
                    <Card.Content className="p-4">
                      <div className="flex flex-col gap-2">
                        <p>
                          <strong>Route Name:</strong> {route.routeName}
                        </p>
                        <p>
                          <strong>Description:</strong> {route.routeDescription || 'N/A'}
                        </p>
                        <p>
                          <strong>Area:</strong> {route.areaId.name}
                        </p>
                        <p>
                          <strong>Optimization Criteria:</strong> {route.optimizationCriteria}
                        </p>
                        <p>
                          <strong>Active:</strong> {route.isActive ? 'Yes' : 'No'}
                        </p>
                        <p>
                          <strong>Created At:</strong>{' '}
                          {new Date(route.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    </Card.Content>
                  </Card>
                ))}
              </div>
            )}
            <div className="mt-6 flex justify-end">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowRoutesModal(false)}
              >
                Close
              </Button>
            </div>
          </div>
        </div>
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
          filteredDeliverers.map(deliverer => (
            <Card key={`${deliverer._id}-${deliverer.areaId}`}>
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
                        Commission Rate: {deliverer.commissionRate || 2.5}%
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row gap-4">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleViewRoutes(deliverer.personnelId || deliverer._id)}
                    >
                      <Route className="h-4 w-4 mr-2" />
                      View Route
                    </Button>
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={() =>
                        window.location.href = `/manager/deliverers/${deliverer.personnelId || deliverer._id}/earnings`
                      }
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
    </>
  );
}