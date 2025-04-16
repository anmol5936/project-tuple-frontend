import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { format } from 'date-fns';
import { 
  ClipboardList, 
  CheckCircle, 
  XCircle,
  AlertCircle,
  Search,
  Filter,
  RefreshCw
} from 'lucide-react';
import { managerApi } from '../../lib/api';
import { Card } from '../../components/ui/Card';
import { PageHeader } from '../../components/ui/PageHeader';
import { Button } from '../../components/ui/Button';

type SubscriptionRequest = {
  _id: string;
  requestType: 'New' | 'Update' | 'Cancel';
  userId: {
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
  } | null;
  publicationId: {
    _id: string;
    name: string;
    language: string;
    price: number;
  } | null;
  subscriptionId?: {
    _id: string;
    areaId: string;
    publicationId: string;
  };
  newQuantity?: number;
  newAddressId?: {
    _id: string;
    streetAddress: string;
    city: string;
    state: string;
    areaId?: string;
    deliveryInstructions?: string;
  } | null;
  deliveryPreferences?: {
    placement: string;
    additionalInstructions?: string;
  };
  status: 'Pending' | 'Approved' | 'Rejected';
  requestDate: string;
  effectiveDate: string;
  comments?: string;
};

export default function SubscriptionRequests() {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [isLoading, setIsLoading] = useState(false);
  const [errorRequests, setErrorRequests] = useState<string[]>([]);

  const { data, refetch, isLoading: requestsLoading } = useQuery({
    queryKey: ['subscription-requests'],
    queryFn: managerApi.getSubscriptionRequests,
  });

  console.log('Subscription Requests:', data);

  // Extract requests array from data
  const requests = data?.requests || [];

  const filteredRequests = requests.filter(request => {
    if (!request || !request.userId) return false;
    
    const customerName = request.userId 
      ? `${request.userId.firstName} ${request.userId.lastName}` 
      : '';
    
    // Check if publicationId exists before accessing it
    const publicationName = request.publicationId?.name || '';

    const searchMatch = 
      customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      publicationName.toLowerCase().includes(searchTerm.toLowerCase());

    const statusMatch = filterStatus === 'all' || 
      request.status.toLowerCase() === filterStatus.toLowerCase();

    return searchMatch && statusMatch;
  });

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'approved':
        return 'bg-green-100 text-green-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-yellow-100 text-yellow-800';
    }
  };

  const handleApprove = async (_id: string) => {
    if (!_id) {
      alert('Invalid request ID');
      return;
    }
    try {
      setIsLoading(true);
      console.log('Approving request with ID:', _id);
      const response = await managerApi.handleSubscriptionRequest(_id, { status: 'Approved' });
      console.log('Approve response:', response);
      setErrorRequests(prev => prev.filter(id => id !== _id));
      await refetch();
      alert('Request approved successfully');
    } catch (error: any) {
      console.error('Error approving request:', error);
      setErrorRequests(prev => [...prev, _id]);
      alert(error.response?.data?.message || 'Failed to approve request');
    } finally {
      setIsLoading(false);
    }
  };

  const handleReject = async (_id: string) => {
    if (!_id) {
      alert('Invalid request ID');
      return;
    }
    const comments = window.prompt('Please provide a reason for rejection:');
    if (comments !== null) {
      try {
        setIsLoading(true);
        console.log('Rejecting request with ID:', _id, 'Comments:', comments);
        const response = await managerApi.handleSubscriptionRequest(_id, { status: 'Rejected', comments });
        console.log('Reject response:', response);
        setErrorRequests(prev => prev.filter(id => id !== _id));
        await refetch();
        alert('Request rejected successfully');
      } catch (error: any) {
        console.error('Error rejecting request:', error);
        setErrorRequests(prev => [...prev, _id]);
        alert(error.response?.data?.message || 'Failed to reject request');
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handleRetry = async (_id: string) => {
    await handleApprove(_id);
  };

  const pendingCount = requests.filter(r => r?.status === 'Pending').length;
  const approvedCount = requests.filter(r => r?.status === 'Approved').length;
  const rejectedCount = requests.filter(r => r?.status === 'Rejected').length;

  return (
    <>
      <PageHeader
        title="Subscription Requests"
        subtitle="Review and manage subscription requests from customers"
      />

      {/* Summary Cards */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-3 mb-8">
        <Card>
          <Card.Content className="p-6">
            <div className="flex items-center justify-between">
              <div className="bg-yellow-100 rounded-full p-3">
                <ClipboardList className="h-6 w-6 text-yellow-600" />
              </div>
              <div className="text-right">
                <p className="text-sm font-medium text-gray-500">Pending Requests</p>
                <p className="text-2xl font-semibold text-gray-900">{pendingCount}</p>
              </div>
            </div>
          </Card.Content>
        </Card>

        <Card>
          <Card.Content className="p-6">
            <div className="flex items-center justify-between">
              <div className="bg-green-100 rounded-full p-3">
                <CheckCircle className="h-6 w-6 text-green-600" />
              </div>
              <div className="text-right">
                <p className="text-sm font-medium text-gray-500">Approved</p>
                <p className="text-2xl font-semibold text-gray-900">{approvedCount}</p>
              </div>
            </div>
          </Card.Content>
        </Card>

        <Card>
          <Card.Content className="p-6">
            <div className="flex items-center justify-between">
              <div className="bg-red-100 rounded-full p-3">
                <XCircle className="h-6 w-6 text-red-600" />
              </div>
              <div className="text-right">
                <p className="text-sm font-medium text-gray-500">Rejected</p>
                <p className="text-2xl font-semibold text-gray-900">{rejectedCount}</p>
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
                    placeholder="Search by customer or publication..."
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
                  <option value="pending">Pending</option>
                  <option value="approved">Approved</option>
                  <option value="rejected">Rejected</option>
                </select>
              </div>
            </div>
          </Card.Content>
        </Card>
      </div>

      {/* Requests List */}
      <div className="space-y-6">
        {requestsLoading || isLoading ? (
          <Card>
            <Card.Content className="p-8 text-center text-gray-500">
              Loading requests...
            </Card.Content>
          </Card>
        ) : filteredRequests.length === 0 ? (
          <Card>
            <Card.Content className="p-8 text-center text-gray-500">
              No subscription requests found
            </Card.Content>
          </Card>
        ) : (
          filteredRequests.map((request) => (
            <Card key={request._id}>
              <Card.Content className="p-6">
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
                  <div className="mb-4 lg:mb-0">
                    <div className="flex items-center gap-2">
                      <h3 className="text-lg font-semibold text-gray-900">
                        {request.userId ? `${request.userId.firstName} ${request.userId.lastName}` : 'Unknown Customer'}
                      </h3>
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(request.status)}`}>
                        {request.status}
                      </span>
                    </div>
                    <div className="mt-2 space-y-2">
                      <p className="text-sm text-gray-500">
                        Request Type: <span className="font-medium">{request.requestType}</span>
                      </p>
                      <p className="text-sm text-gray-500">
                        Publication: <span className="font-medium">{request.publicationId?.name || 'Unknown'}</span>
                      </p>
                      {request.newQuantity && (
                        <p className="text-sm text-gray-500">
                          Quantity: <span className="font-medium">{request.newQuantity}</span>
                        </p>
                      )}
                      <p className="text-sm text-gray-500">
                        Request Date: <span className="font-medium">{format(new Date(request.requestDate), 'PPP')}</span>
                      </p>
                      <p className="text-sm text-gray-500">
                        Effective Date: <span className="font-medium">{format(new Date(request.effectiveDate), 'PPP')}</span>
                      </p>
                      {request.newAddressId ? (
                        <p className="text-sm text-gray-500">
                          Address: <span className="font-medium">{`${request.newAddressId.streetAddress}, ${request.newAddressId.city}, ${request.newAddressId.state}`}</span>
                        </p>
                      ) : request.requestType === 'New' && (
                        <p className="text-sm text-yellow-500">
                          <AlertCircle className="h-4 w-4 inline mr-1" />
                          No address specified
                        </p>
                      )}
                      {request.deliveryPreferences?.additionalInstructions && (
                        <p className="text-sm text-gray-500">
                          Delivery Instructions: <span className="font-medium">{request.deliveryPreferences.additionalInstructions}</span>
                        </p>
                      )}
                      {request.comments && (
                        <div className="flex items-start gap-2 text-sm text-gray-500">
                          <AlertCircle className="h-5 w-5 text-gray-400 mt-0.5" />
                          <p>{request.comments}</p>
                        </div>
                      )}
                      {errorRequests.includes(request._id) && (
                        <div className="flex items-start gap-2 text-sm text-red-500">
                          <AlertCircle className="h-5 w-5 mt-0.5" />
                          <p>Failed to process request. Please retry.</p>
                        </div>
                      )}
                    </div>
                  </div>

                  {request.status === 'Pending' && (
                    <div className="flex gap-4">
                      <Button
                        variant="success"
                        size="sm"
                        onClick={() => handleApprove(request._id)}
                        disabled={isLoading}
                      >
                        <CheckCircle className="h-4 w-4 mr-2" />
                        Approve
                      </Button>
                      <Button
                        variant="danger"
                        size="sm"
                        onClick={() => handleReject(request._id)}
                        disabled={isLoading}
                      >
                        <XCircle className="h-4 w-4 mr-2" />
                        Reject
                      </Button>
                      {errorRequests.includes(request._id) && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleRetry(request._id)}
                          disabled={isLoading}
                        >
                          <RefreshCw className="h-4 w-4 mr-2" />
                          Retry
                        </Button>
                      )}
                    </div>
                  )}
                </div>
              </Card.Content>
            </Card>
          ))
        )}
      </div>
    </>
  );
}