import { useQuery } from '@tanstack/react-query';
import { BarChart3, Newspaper, FileText, CreditCard } from 'lucide-react';
import { customerApi } from '../../lib/api';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { Card } from '../../components/ui/Card';
import { PageHeader } from '../../components/ui/PageHeader';
import { useAuth } from '../../contexts/AuthContext';

export default function CustomerDashboard() {
  const { user } = useAuth();

  const { data: subscriptions } = useQuery({
    queryKey: ['subscriptions'],
    queryFn: customerApi.getSubscriptions,
  });

  console.log('Subscriptions:', subscriptions);

  const { data: bills } = useQuery({
    queryKey: ['bills'],
    queryFn: customerApi.getBills,
  });

  const calculateMonthlySpend = () => {
    if (!subscriptions?.subscriptions || subscriptions.subscriptions.length === 0) {
      return 0;
    }

    return subscriptions.subscriptions.reduce((acc, sub) => {
      if (sub.publicationId && typeof sub.publicationId.price === 'number') {
        return acc + (sub.publicationId.price * sub.quantity);
      }
      return acc;
    }, 0);
  };

  const stats = [
    {
      name: 'Active Subscriptions',
      value: subscriptions?.subscriptions?.length || 0,
      icon: Newspaper,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100',
    },
    {
      name: 'Pending Bills',
      value: bills?.bills?.filter(bill => bill.status === 'Pending')?.length || 0,
      icon: FileText,
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-100',
    },
    {
      name: 'Total Due',
      value: bills?.bills?.reduce((acc, bill) => acc + (bill.outstandingAmount || 0), 0) || 0,
      icon: CreditCard,
      color: 'text-red-600',
      bgColor: 'bg-red-100',
      formatter: (value: number) => `₹${value.toFixed(2)}`,
    },
    {
      name: 'Monthly Spend',
      value: calculateMonthlySpend(),
      icon: BarChart3,
      color: 'text-green-600',
      bgColor: 'bg-green-100',
      formatter: (value: number) => `₹${value.toFixed(2)}`,
    },
  ];

  return (
    <DashboardLayout>
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <PageHeader 
            title={`Welcome back, ${user?.firstName || 'User'}!`}
            subtitle="View your subscription overview and recent activities"
          />

          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4 mt-8">
            {stats.map((stat) => (
              <Card key={stat.name} className="overflow-hidden transform transition-all duration-200 hover:scale-[1.02]">
                <Card.Content className="p-6">
                  <div className="flex items-center">
                    <div className={`rounded-xl ${stat.bgColor} p-3`}>
                      <stat.icon className={`h-6 w-6 ${stat.color}`} />
                    </div>
                  </div>
                  <div className="mt-4">
                    <p className="text-sm font-medium text-gray-600">{stat.name}</p>
                    <p className="mt-2 text-2xl font-bold text-gray-900">
                      {stat.formatter ? stat.formatter(stat.value) : stat.value}
                    </p>
                  </div>
                </Card.Content>
              </Card>
            ))}
          </div>

          <div className="mt-8">
            <Card className="overflow-hidden shadow-lg">
              <Card.Header className="px-6 py-4 bg-white border-b border-gray-100">
                <h2 className="text-lg font-semibold text-gray-900">Active Subscriptions</h2>
              </Card.Header>
              <Card.Content>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Publication
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Quantity
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Price
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Status
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {subscriptions?.subscriptions && subscriptions.subscriptions.length > 0 ? (
                        subscriptions.subscriptions.map((subscription) => (
                          <tr key={subscription._id} className="hover:bg-gray-50 transition-colors">
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm font-medium text-gray-900">
                                {subscription.publicationId?.name || "Unknown Publication"}
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {subscription.quantity}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {subscription.publicationId?.price 
                                ? `₹${(subscription.publicationId.price * subscription.quantity).toFixed(2)}`
                                : "N/A"}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                subscription.status?.toLowerCase() === 'active' 
                                  ? 'bg-green-100 text-green-800'
                                  : 'bg-yellow-100 text-yellow-800'
                              }`}>
                                {subscription.status?.charAt(0).toUpperCase() + subscription.status?.slice(1).toLowerCase() || "Unknown"}
                              </span>
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan={4} className="px-6 py-8 text-center text-sm text-gray-500 bg-gray-50">
                            <Newspaper className="mx-auto h-8 w-8 text-gray-400 mb-2" />
                            No active subscriptions found
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </Card.Content>
            </Card>
          </div>

          <div className="mt-8">
            <Card className="overflow-hidden shadow-lg">
              <Card.Header className="px-6 py-4 bg-white border-b border-gray-100">
                <h2 className="text-lg font-semibold text-gray-900">Recent Bills</h2>
              </Card.Header>
              <Card.Content>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Bill Number
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Date
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Amount
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Due Date
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Status
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {bills?.bills && bills.bills.length > 0 ? (
                        bills.bills.slice(0, 5).map((bill) => (
                          <tr key={bill._id || bill.id} className="hover:bg-gray-50 transition-colors">
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm font-medium text-gray-900">
                                {bill.billNumber}
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {bill.billDate ? new Date(bill.billDate).toLocaleDateString() : "N/A"}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {typeof bill.totalAmount === 'number' ? `₹${bill.totalAmount.toFixed(2)}` : "N/A"}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {bill.dueDate ? new Date(bill.dueDate).toLocaleDateString() : "N/A"}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                bill.status === 'Paid' 
                                  ? 'bg-green-100 text-green-800'
                                  : bill.status === 'Pending'
                                  ? 'bg-yellow-100 text-yellow-800'
                                  : 'bg-red-100 text-red-800'
                              }`}>
                                {bill.status || "Unknown"}
                              </span>
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan={5} className="px-6 py-8 text-center text-sm text-gray-500 bg-gray-50">
                            <FileText className="mx-auto h-8 w-8 text-gray-400 mb-2" />
                            No bills found
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </Card.Content>
            </Card>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}