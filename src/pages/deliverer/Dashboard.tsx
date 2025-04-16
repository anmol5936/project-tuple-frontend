import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Map, Package, CreditCard, CheckCircle } from 'lucide-react';
import { delivererApi } from '../../lib/api';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { Card } from '../../components/ui/Card';
import { PageHeader } from '../../components/ui/PageHeader';
import { useAuth } from '../../contexts/AuthContext';
import { DELIVERER_ROUTES } from '../../lib/api';

export default function DelivererDashboard() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: schedule, isLoading: isScheduleLoading, error: scheduleError } = useQuery({
    queryKey: ['schedule'],
    queryFn: delivererApi.getSchedule,
  });

  console.log('Schedule:', schedule);

  const { data: deliveryItems, isLoading: isItemsLoading, error: itemsError } = useQuery({
    queryKey: ['deliveryItems'],
    queryFn: delivererApi.getDeliveryItems,
  });

  console.log('Delivery Items:', deliveryItems);

  const { data: earnings, isLoading: isEarningsLoading, error: earningsError } = useQuery({
    queryKey: ['earnings'],
    queryFn: () =>
      delivererApi.getEarnings({
        month: new Date().getMonth() + 1,
        year: new Date().getFullYear(),
      }),
  });

  // Mutation for updating delivery status
  const updateStatusMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: typeof DELIVERER_ROUTES.UPDATE_DELIVERY_STATUS.request }) =>
      delivererApi.updateDeliveryStatus(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['deliveryItems'] });
    },
    onError: (error: any) => {
      console.error('Update status error:', error);
      alert(error.response?.data?.message || 'Failed to update status. Please try again.');
    },
  });

  // Mutation for uploading delivery proof
  const uploadProofMutation = useMutation({
    mutationFn: (data: typeof DELIVERER_ROUTES.UPLOAD_DELIVERY_PROOF.request) =>
      delivererApi.uploadDeliveryProof(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['deliveryItems'] });
    },
    onError: (error: any) => {
      console.error('Upload proof error:', error);
      alert(error.response?.data?.message || 'Failed to upload photo proof. Please try again.');
    },
  });

  const handleStatusUpdate = (itemId: string, status: 'Delivered' | 'Failed' | 'Skipped', deliveryNotes?: string) => {
    updateStatusMutation.mutate({
      id: itemId,
      data: { status, deliveryNotes: deliveryNotes || '' },
    });
  };

  const handleUploadProof = (itemId: string, file: File) => {
    if (!file || file.size === 0) {
      alert('Please select a valid image file.');
      return;
    }
    uploadProofMutation.mutate({
      itemId,
      photo: file,
    });
  };

  const stats = [
    {
      name: "Today's Deliveries",
      value: deliveryItems?.items?.length || 0,
      icon: Package,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100',
    },
    {
      name: 'Completed',
      value: deliveryItems?.items?.filter((item) => item.status === 'Delivered').length || 0,
      icon: CheckCircle,
      color: 'text-green-600',
      bgColor: 'bg-green-100',
    },
    {
      name: 'Route Stops',
      value: new Set(deliveryItems?.items?.map((item) => item.addressId?.streetAddress)).size || 0,
      icon: Map,
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-100',
    },
    {
      name: 'Monthly Earnings',
      value: earnings?.earnings?.amount || 0,
      icon: CreditCard,
      color: 'text-purple-600',
      bgColor: 'bg-purple-100',
      formatter: (value: number) => `₹${value.toFixed(2)}`,
    },
  ];

  if (isScheduleLoading || isItemsLoading || isEarningsLoading) {
    return <DashboardLayout>Loading...</DashboardLayout>;
  }

  if (scheduleError || itemsError || earningsError) {
    return (
      <DashboardLayout>
        <div className="text-red-600">
          Error: {scheduleError?.message || itemsError?.message || earningsError?.message}
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <PageHeader
        title={`Welcome, ${user?.firstName || 'User'}!`}
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
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Action
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Photo Proof
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {deliveryItems?.items?.length > 0 ? (
                    deliveryItems.items.map((item) => (
                      <tr key={item._id}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {item.publicationId?.name || 'N/A'}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-500">
                          {item.addressId?.streetAddress
                            ? `${item.addressId.streetAddress}, ${item.addressId.city}`
                            : 'N/A'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {item.subscriptionId?.quantity || 0}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-500">
                          {item.subscriptionId?.deliveryPreferences?.placement || 'None'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span
                            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                              item.status === 'Delivered'
                                ? 'bg-green-100 text-green-800'
                                : item.status === 'Failed'
                                ? 'bg-red-100 text-red-800'
                                : item.status === 'Skipped'
                                ? 'bg-gray-100 text-gray-800'
                                : 'bg-yellow-100 text-yellow-800'
                            }`}
                          >
                            {item.status || 'Pending'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          {item.status === 'Pending' ? (
                            <div className="flex space-x-2">
                              <button
                                onClick={() => handleStatusUpdate(item._id, 'Delivered')}
                                className="px-3 py-1 text-sm font-medium text-white bg-green-600 rounded-md hover:bg-green-700"
                                disabled={updateStatusMutation.isPending}
                              >
                                Delivered
                              </button>
                              <button
                                onClick={() => handleStatusUpdate(item._id, 'Failed')}
                                className="px-3 py-1 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700"
                                disabled={updateStatusMutation.isPending}
                              >
                                Failed
                              </button>
                              <button
                                onClick={() => handleStatusUpdate(item._id, 'Skipped')}
                                className="px-3 py-1 text-sm font-medium text-white bg-gray-600 rounded-md hover:bg-gray-700"
                                disabled={updateStatusMutation.isPending}
                              >
                                Skipped
                              </button>
                            </div>
                          ) : (
                            <span className="text-gray-500">Status Updated</span>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          {item.status === 'Delivered' && !item.photoProof ? (
                            <input
                              type="file"
                              accept="image/*"
                              onChange={(e) => {
                                if (e.target.files?.[0]) {
                                  handleUploadProof(item._id, e.target.files[0]);
                                }
                              }}
                              disabled={uploadProofMutation.isPending}
                              className="text-sm text-gray-900 file:mr-4 file:py-1 file:px-3 file:rounded-md file:border-0 file:text-sm file:font-medium file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                            />
                          ) : item.photoProof ? (
                            <span className="text-green-600">Photo Uploaded</span>
                          ) : (
                            <span className="text-gray-500">No Photo</span>
                          )}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={7} className="px-6 py-4 text-sm text-gray-500 text-center">
                        No delivery items found for today.
                      </td>
                    </tr>
                  )}
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
              {schedule?.schedule ? (
                <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4">
                  <div className="flex">
                    <div className="flex-shrink-0">
                      <Map className="h-5 w-5 text-yellow-400" />
                    </div>
                    <div className="ml-3">
                      <h3 className="text-sm font-medium text-yellow-800">Route Details</h3>
                      <div className="mt-2 text-sm text-yellow-700">
                        <p>Area: {schedule.schedule.areaId?.name || 'N/A'}</p>
                        <p>City: {schedule.schedule.areaId?.city || 'N/A'}</p>
                        <p>Route Name: {schedule.schedule.routeId?.routeName || 'N/A'}</p>
                        <p>Description: {schedule.schedule.routeId?.routeDescription || 'N/A'}</p>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <p className="text-sm text-gray-500">No route information available for today.</p>
              )}
            </div>
          </Card.Content>
        </Card>
      </div>
    </DashboardLayout>
  );
}