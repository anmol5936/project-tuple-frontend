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

  const { data: deliveryItems, isLoading: isItemsLoading, error: itemsError } = useQuery({
    queryKey: ['deliveryItems'],
    queryFn: delivererApi.getDeliveryItems,
  });

  const { data: earnings, isLoading: isEarningsLoading, error: earningsError } = useQuery({
    queryKey: ['earnings'],
    queryFn: () =>
      delivererApi.getEarnings({
        month: new Date().getMonth() + 1,
        year: new Date().getFullYear(),
      }),
  });

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
      gradient: 'from-blue-500 to-blue-600',
    },
    {
      name: 'Completed',
      value: deliveryItems?.items?.filter((item) => item.status === 'Delivered').length || 0,
      icon: CheckCircle,
      color: 'text-green-600',
      bgColor: 'bg-green-100',
      gradient: 'from-green-500 to-green-600',
    },
    {
      name: 'Route Stops',
      value: new Set(deliveryItems?.items?.map((item) => item.addressId?.streetAddress)).size || 0,
      icon: Map,
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-100',
      gradient: 'from-yellow-500 to-yellow-600',
    },
    {
      name: 'Monthly Earnings',
      value: earnings?.earnings?.amount || 0,
      icon: CreditCard,
      color: 'text-purple-600',
      bgColor: 'bg-purple-100',
      gradient: 'from-purple-500 to-purple-600',
      formatter: (value: number) => `₹${value.toFixed(2)}`,
    },
  ];

  if (isScheduleLoading || isItemsLoading || isEarningsLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="animate-pulse text-lg font-medium text-gray-600">Loading...</div>
        </div>
      </DashboardLayout>
    );
  }

  if (scheduleError || itemsError || earningsError) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-red-600 bg-red-50 px-4 py-3 rounded-lg shadow-sm">
            Error: {scheduleError?.message || itemsError?.message || earningsError?.message}
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <PageHeader
          title={`Welcome, ${user?.firstName || 'User'}!`}
          subtitle={`Today's delivery schedule and route information`}
          className="mb-8"
        />

        {/* Stats Grid */}
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4 mb-8">
          {stats.map((stat) => (
            <Card key={stat.name} className="overflow-hidden transform transition-all duration-200 hover:scale-105">
              <div className={`h-1 bg-gradient-to-r ${stat.gradient}`} />
              <Card.Content className="p-6">
                <div className="flex items-center justify-between">
                  <div className={`rounded-lg ${stat.bgColor} p-3`}>
                    <stat.icon className={`h-6 w-6 ${stat.color}`} />
                  </div>
                  <p className="text-2xl font-bold text-gray-900">
                    {stat.formatter ? stat.formatter(stat.value) : stat.value}
                  </p>
                </div>
                <p className="mt-4 text-sm font-medium text-gray-600">{stat.name}</p>
              </Card.Content>
            </Card>
          ))}
        </div>

        {/* Route Information */}
        <div className="mb-8">
          <Card className="overflow-hidden">
            <div className="h-1 bg-gradient-to-r from-yellow-500 to-yellow-600" />
            <Card.Header className="bg-white border-b border-gray-100">
              <h2 className="text-lg font-semibold text-gray-900">Route Information</h2>
            </Card.Header>
            <Card.Content className="bg-white">
              <div className="prose max-w-none">
                {schedule?.schedule ? (
                  <div className="bg-yellow-50 rounded-lg p-4">
                    <div className="flex">
                      <div className="flex-shrink-0">
                        <Map className="h-5 w-5 text-yellow-600" />
                      </div>
                      <div className="ml-4">
                        <h3 className="text-sm font-semibold text-gray-900">Route Details</h3>
                        <div className="mt-2 space-y-2">
                          <p className="text-sm text-gray-600">
                            <span className="font-medium">Area:</span> {schedule.schedule.areaId?.name || 'N/A'}
                          </p>
                          <p className="text-sm text-gray-600">
                            <span className="font-medium">City:</span> {schedule.schedule.areaId?.city || 'N/A'}
                          </p>
                          <p className="text-sm text-gray-600">
                            <span className="font-medium">Route Name:</span>{' '}
                            {schedule.schedule.routeId?.routeName || 'N/A'}
                          </p>
                          <p className="text-sm text-gray-600">
                            <span className="font-medium">Description:</span>{' '}
                            {schedule.schedule.routeId?.routeDescription || 'N/A'}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <p className="text-sm text-gray-500 text-center py-4">
                    No route information available for today.
                  </p>
                )}
              </div>
            </Card.Content>
          </Card>
        </div>

        {/* Today's Schedule */}
        <Card className="overflow-hidden">
          <div className="h-1 bg-gradient-to-r from-blue-500 to-blue-600" />
          <Card.Header className="bg-white border-b border-gray-100">
            <h2 className="text-lg font-semibold text-gray-900">Today's Schedule</h2>
          </Card.Header>
          <Card.Content className="bg-white p-0">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
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
                      <tr key={item._id} className="hover:bg-gray-50 transition-colors duration-150">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
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
                            className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${
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
                                className="px-3 py-1 text-sm font-medium text-white bg-green-600 rounded-md hover:bg-green-700 transition-colors duration-150"
                                disabled={updateStatusMutation.isPending}
                              >
                                Delivered
                              </button>
                              <button
                                onClick={() => handleStatusUpdate(item._id, 'Failed')}
                                className="px-3 py-1 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700 transition-colors duration-150"
                                disabled={updateStatusMutation.isPending}
                              >
                                Failed
                              </button>
                              <button
                                onClick={() => handleStatusUpdate(item._id, 'Skipped')}
                                className="px-3 py-1 text-sm font-medium text-white bg-gray-600 rounded-md hover:bg-gray-700 transition-colors duration-150"
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
                              className="text-sm text-gray-900 file:mr-4 file:py-1.5 file:px-3 file:rounded-md file:border-0 file:text-sm file:font-medium file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 transition-colors duration-150"
                            />
                          ) : item.photoProof ? (
                            <span className="text-green-600 font-medium">Photo Uploaded</span>
                          ) : (
                            <span className="text-gray-500">No Photo</span>
                          )}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={7} className="px-6 py-8 text-sm text-gray-500 text-center bg-gray-50">
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
    </DashboardLayout>
  );
}