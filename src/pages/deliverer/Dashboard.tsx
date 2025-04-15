import { useQuery } from '@tanstack/react-query';
import { Map, Package, CreditCard, CheckCircle } from 'lucide-react';
import { delivererApi } from '../../lib/api';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { Card } from '../../components/ui/Card';
import { PageHeader } from '../../components/ui/PageHeader';
import { useAuth } from '../../contexts/AuthContext';

export default function DelivererDashboard() {
  const { user } = useAuth();

  const { data: schedule } = useQuery({
    queryKey: ['schedule'],
    queryFn: delivererApi.getSchedule,
  });

  const { data: deliveryItems } = useQuery({
    queryKey: ['deliveryItems'],
    queryFn: delivererApi.getDeliveryItems,
  });

  const { data: earnings } = useQuery({
    queryKey: ['earnings'],
    queryFn: () => delivererApi.getEarnings({
      month: new Date().getMonth() + 1,
      year: new Date().getFullYear(),
    }),
  });

  const stats = [
    {
      name: 'Today\'s Deliveries',
      value: deliveryItems?.items.length || 0,
      icon: Package,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100',
    },
    {
      name: 'Completed',
      value: deliveryItems?.items.filter(item => item.status === 'Delivered').length || 0,
      icon: CheckCircle,
      color: 'text-green-600',
      bgColor: 'bg-green-100',
    },
    {
      name: 'Route Stops',
      value: new Set(deliveryItems?.items.map(item => item.address.streetAddress)).size || 0,
      icon: Map,
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-100',
    },
    {
      name: 'Monthly Earnings',
      value: earnings?.earnings.amount || 0,
      icon: CreditCard,
      color: 'text-purple-600',
      bgColor: 'bg-purple-100',
      formatter: (value: number) => `₹${value.toFixed(2)}`,
    },
  ];

  return (
    <DashboardLayout>
      <PageHeader 
        title={`Welcome, ${user?.firstName}!`}
        subtitle={`Today's delivery schedule and route information`}
      />

      {/* Stats Grid */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.name} className="overflow-hidden">
            <Card.Content className="p-6">
              <div className="flex items-center">
                <div className={`rounded-full ${stat.bgColor} p-3`}>
                  <stat.icon className={`h-6 w-6 ${stat.color}`} />
                </div>
              </div>
              <div className="mt-4">
                <p className="text-sm font-medium text-gray-500">{stat.name}</p>
                <p className="mt-1 text-2xl font-semibold text-gray-900">
                  {stat.formatter ? stat.formatter(stat.value) : stat.value}
                </p>
              </div>
            </Card.Content>
          </Card>
        ))}
      </div>

      {/* Today's Schedule */}
      <div className="mt-8">
        <Card>
          <Card.Header>
            <h2 className="text-lg font-medium text-gray-900">Today's Schedule</h2>
          </Card.Header>
          <Card.Content>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead>
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Publication
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Address
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Quantity
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Instructions
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {deliveryItems?.items.map((item) => (
                    <tr key={item.id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {item.publication.name}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500">
                        {item.address.streetAddress}, {item.address.city}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {item.subscription.quantity}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500">
                        {item.subscription.deliveryPreferences?.placement}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          item.status === 'Delivered' 
                            ? 'bg-green-100 text-green-800'
                            : item.status === 'Failed'
                            ? 'bg-red-100 text-red-800'
                            : 'bg-yellow-100 text-yellow-800'
                        }`}>
                          {item.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card.Content>
        </Card>
      </div>

      {/* Route Information */}
      <div className="mt-8">
        <Card>
          <Card.Header>
            <h2 className="text-lg font-medium text-gray-900">Route Information</h2>
          </Card.Header>
          <Card.Content>
            <div className="prose max-w-none">
              <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <Map className="h-5 w-5 text-yellow-400" />
                  </div>
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-yellow-800">Route Details</h3>
                    <div className="mt-2 text-sm text-yellow-700">
                      <p>Area: {schedule?.schedule.area.name}</p>
                      <p>City: {schedule?.schedule.area.city}</p>
                      <p>Route Name: {schedule?.schedule.route.routeName}</p>
                      <p>Description: {schedule?.schedule.route.routeDescription}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </Card.Content>
        </Card>
      </div>
    </DashboardLayout>
  );
}