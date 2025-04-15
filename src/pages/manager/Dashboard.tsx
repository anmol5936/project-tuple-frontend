import { useQuery } from '@tanstack/react-query';
import { Users, Newspaper, FileText, TrendingUp } from 'lucide-react';
import { managerApi } from '../../lib/api';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { Card } from '../../components/ui/Card';
import { PageHeader } from '../../components/ui/PageHeader';
import { useAuth } from '../../contexts/AuthContext';

export default function ManagerDashboard() {
  const { user } = useAuth();
  const currentMonth = new Date().getMonth() + 1;
  const currentYear = new Date().getFullYear();

  const { data: customers } = useQuery({
    queryKey: ['customers'],
    queryFn: managerApi.getCustomers,
  });

  const { data: areas } = useQuery({
    queryKey: ['areas'],
    queryFn: managerApi.getAreas,
  });

  const { data: financialReport } = useQuery({
    queryKey: ['financialReport', currentMonth, currentYear],
    queryFn: () => managerApi.generateFinancialReport({
      month: currentMonth,
      year: currentYear,
    }),
  });

  const stats = [
    {
      name: 'Total Customers',
      value: customers?.customers.length || 0,
      icon: Users,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100',
    },
    {
      name: 'Active Subscriptions',
      value: customers?.customers.reduce((acc, customer) => 
        acc + customer.subscriptions.filter(sub => sub.status === 'Active').length, 0) || 0,
      icon: Newspaper,
      color: 'text-green-600',
      bgColor: 'bg-green-100',
    },
    {
      name: 'Pending Bills',
      value: financialReport?.report.billing.unpaidBills || 0,
      icon: FileText,
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-100',
    },
    {
      name: 'Monthly Revenue',
      value: financialReport?.report.summary.grossRevenue || 0,
      icon: TrendingUp,
      color: 'text-purple-600',
      bgColor: 'bg-purple-100',
      formatter: (value: number) => `₹${value.toFixed(2)}`,
    },
  ];

  return (
    <DashboardLayout>
      <PageHeader 
        title={`Welcome, ${user?.firstName}!`}
        subtitle="Monitor your agency's performance and manage operations"
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

      {/* Area Overview */}
      <div className="mt-8">
        <Card>
          <Card.Header>
            <h2 className="text-lg font-medium text-gray-900">Area Overview</h2>
          </Card.Header>
          <Card.Content>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead>
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Area Name
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      City
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Deliverers
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Publications
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {areas?.areas.map((area) => (
                    <tr key={area.id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {area.name}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {area.city}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {area.deliverers.length}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {area.publications.length}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card.Content>
        </Card>
      </div>

      {/* Financial Overview */}
      <div className="mt-8">
        <Card>
          <Card.Header>
            <h2 className="text-lg font-medium text-gray-900">Financial Overview</h2>
          </Card.Header>
          <Card.Content>
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              <div>
                <h3 className="text-sm font-medium text-gray-500">Billing Status</h3>
                <dl className="mt-2 space-y-2">
                  <div className="flex justify-between">
                    <dt className="text-sm text-gray-600">Total Bills</dt>
                    <dd className="text-sm font-medium text-gray-900">
                      {financialReport?.report.billing.totalBills}
                    </dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-sm text-gray-600">Unpaid Bills</dt>
                    <dd className="text-sm font-medium text-gray-900">
                      {financialReport?.report.billing.unpaidBills}
                    </dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-sm text-gray-600">Partially Paid</dt>
                    <dd className="text-sm font-medium text-gray-900">
                      {financialReport?.report.billing.partiallyPaidBills}
                    </dd>
                  </div>
                </dl>
              </div>

              <div>
                <h3 className="text-sm font-medium text-gray-500">Payments</h3>
                <dl className="mt-2 space-y-2">
                  <div className="flex justify-between">
                    <dt className="text-sm text-gray-600">Total Received</dt>
                    <dd className="text-sm font-medium text-gray-900">
                      ₹{financialReport?.report.payments.totalReceived.toFixed(2)}
                    </dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-sm text-gray-600">Number of Payments</dt>
                    <dd className="text-sm font-medium text-gray-900">
                      {financialReport?.report.payments.totalPayments}
                    </dd>
                  </div>
                </dl>
              </div>

              <div>
                <h3 className="text-sm font-medium text-gray-500">Summary</h3>
                <dl className="mt-2 space-y-2">
                  <div className="flex justify-between">
                    <dt className="text-sm text-gray-600">Gross Revenue</dt>
                    <dd className="text-sm font-medium text-gray-900">
                      ₹{financialReport?.report.summary.grossRevenue.toFixed(2)}
                    </dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-sm text-gray-600">Total Expenses</dt>
                    <dd className="text-sm font-medium text-gray-900">
                      ₹{financialReport?.report.summary.totalExpenses.toFixed(2)}
                    </dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-sm text-gray-600">Net Revenue</dt>
                    <dd className="text-sm font-medium text-text-gray-900">
                      ₹{financialReport?.report.summary.netRevenue.toFixed(2)}
                    </dd>
                  </div>
                </dl>
              </div>
            </div>
          </Card.Content>
        </Card>
      </div>
    </DashboardLayout>
  );
}