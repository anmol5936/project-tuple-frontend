import React, { useEffect, useState } from 'react';
import { LineChart, BarChart, PieChart, Line, Bar, Pie, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Loader2, AlertCircle } from 'lucide-react';
import { managerApi } from '../../lib/api';

interface DeliveryReport {
  reportData: {
    totalDeliveries: number;
    successfulDeliveries: number;
    failedDeliveries: number;
    skippedDeliveries: number;
  };
  publications: any[];
}

interface FinancialReport {
  billing: {
    totalBilled: number;
    totalBills: number;
    unpaidBills: number;
    partiallyPaidBills: number;
    paidBills: number;
  };
  payments: {
    byMethod: Record<string, number>;
    totalPayments: number;
    totalReceived: number;
  };
  summary: {
    grossRevenue: number;
    netRevenue: number;
    totalExpenses: number;
  };
}

interface Publication {
  _id: string;
  name: string;
  language: string;
  price: number;
  publicationType: string;
}

interface Customer {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  subscriptions: any[];
}

function App() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deliveryData, setDeliveryData] = useState<DeliveryReport | null>(null);
  const [financialData, setFinancialData] = useState<FinancialReport | null>(null);
  const [publications, setPublications] = useState<Publication[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Get current month and year
        const now = new Date();
        const currentMonth = now.getMonth() + 1;
        const currentYear = now.getFullYear();

        // Fetch all required data
        const [
          deliveryReport,
          financialReport,
          publicationsData,
          customersData
        ] = await Promise.all([
          managerApi.generateDeliveryReport({ month: currentMonth, year: currentYear }),
          managerApi.generateFinancialReport({ month: currentMonth, year: currentYear }),
          managerApi.getPublications(),
          managerApi.getCustomers()
        ]);

        setDeliveryData(deliveryReport.report);
        setFinancialData(financialReport.report);
        setPublications(publicationsData.publications);
        setCustomers(customersData.customers);
        
      } catch (err) {
        setError('Failed to fetch analytics data');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-red-500">{error}</div>
      </div>
    );
  }

  // Prepare data for charts with null checks
  const deliveryStatusData = [
    { name: 'Successful', value: deliveryData?.reportData?.successfulDeliveries || 0 },
    { name: 'Failed', value: deliveryData?.reportData?.failedDeliveries || 0 },
    { name: 'Skipped', value: deliveryData?.reportData?.skippedDeliveries || 0 }
  ].filter(item => item.value > 0);

  // If all values are 0, add placeholder data
  const hasDeliveryData = deliveryStatusData.length > 0;
  if (!hasDeliveryData) {
    deliveryStatusData.push({ name: 'No Data', value: 1 });
  }

  const publicationRevenueData = publications.map(pub => ({
    name: pub.name,
    price: pub.price,
    type: pub.publicationType
  }));

  const paymentMethodData = Object.entries(financialData?.payments?.byMethod || {}).map(([method, amount]) => ({
    name: method || 'Unknown',
    amount: amount || 0
  }));

  // If payment method data is empty, add placeholder
  const hasPaymentData = paymentMethodData.length > 0;
  if (!hasPaymentData) {
    paymentMethodData.push({ name: 'No Payments', amount: 1 });
  }

  const billingStatusData = [
    { name: 'Total Bills', value: financialData?.billing?.totalBills || 0 },
    { name: 'Unpaid', value: financialData?.billing?.unpaidBills || 0 },
    { name: 'Partially Paid', value: financialData?.billing?.partiallyPaidBills || 0 },
    { name: 'Paid', value: financialData?.billing?.paidBills || 0 }
  ];

  const EmptyChartMessage = ({ message }: { message: string }) => (
    <div className="h-full flex flex-col items-center justify-center text-gray-500">
      <AlertCircle className="w-12 h-12 mb-2" />
      <p>{message}</p>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <h1 className="text-3xl font-bold mb-8">Newspaper Distribution Analytics</h1>
      
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-lg font-semibold mb-2">Total Revenue</h3>
          <p className="text-2xl">₹{(financialData?.summary?.grossRevenue || 0).toLocaleString()}</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-lg font-semibold mb-2">Total Deliveries</h3>
          <p className="text-2xl">{(deliveryData?.reportData?.totalDeliveries || 0).toLocaleString()}</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-lg font-semibold mb-2">Active Publications</h3>
          <p className="text-2xl">{publications.length}</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-lg font-semibold mb-2">Total Customers</h3>
          <p className="text-2xl">{customers.length}</p>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Delivery Status Chart */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-4">Delivery Status Distribution</h2>
          <div className="h-80">
            {hasDeliveryData ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={deliveryStatusData}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={100}
                    fill={hasDeliveryData ? "#8884d8" : "#cbd5e1"}
                    label
                  >
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <EmptyChartMessage message="No delivery data available for this period" />
            )}
          </div>
        </div>

        {/* Publication Revenue Chart */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-4">Publication Pricing</h2>
          <div className="h-80">
            {publicationRevenueData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={publicationRevenueData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="price" fill="#82ca9d" name="Price (₹)" />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <EmptyChartMessage message="No publications data available" />
            )}
          </div>
        </div>

        {/* Payment Methods Chart */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-4">Payment Methods Distribution</h2>
          <div className="h-80">
            {hasPaymentData ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={paymentMethodData}
                    dataKey="amount"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={100}
                    fill={hasPaymentData ? "#82ca9d" : "#cbd5e1"}
                    label
                  >
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <EmptyChartMessage message="No payment data available for this period" />
            )}
          </div>
        </div>

        {/* Billing Status Chart */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-4">Billing Status</h2>
          <div className="h-80">
            {billingStatusData.some(item => item.value > 0) ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={billingStatusData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="value" fill="#8884d8" />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <EmptyChartMessage message="No billing data available for this period" />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;