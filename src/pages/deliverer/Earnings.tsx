import React, { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Wallet, Calendar, TrendingUp, AlertCircle, DollarSign, ChevronLeft, ChevronRight } from 'lucide-react';
import { delivererApi } from '../../lib/api';

type Earning = {
  month: number;
  year: number;
  amount: number;
  status: string;
  commissionRate: number;
};

function Earnings() {
  const [earnings, setEarnings] = useState<Earning[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedMonth, setSelectedMonth] = useState(() => new Date().getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(() => new Date().getFullYear());
  const [page, setPage] = useState(1);
  const limit = 10;

  // Fetch earnings
  useEffect(() => {
    const fetchEarnings = async () => {
      try {
        setLoading(true);
        const data = await delivererApi.getEarnings({
          month: selectedMonth,
          year: selectedYear,
        });
        setEarnings(data.earnings);
      } catch (err) {
        setError('Failed to load earnings data. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchEarnings();
  }, [selectedMonth, selectedYear]);

  console.log('Earnings:', earnings);

  // Fetch payment history
  const { data: paymentHistory, isLoading: isPaymentLoading, error: paymentError } = useQuery({
    queryKey: ['paymentHistory', page],
    queryFn: () => delivererApi.getPaymentHistory({ page, limit }),
  });

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
    }).format(amount);
  };

  const formatMonthYear = (month: number, year: number) => {
    const months = [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December',
    ];
    return `${months[month - 1]} ${year}`;
  };

  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December',
  ];

  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 5 }, (_, i) => currentYear - i);

  // Calculate total earnings amount for the selected period
  const totalEarningsAmount = earnings.reduce((total, earning) => total + earning.amount, 0);

  // Get commission rate from the first earning record (assuming it's the same for all records in the period)
  const commissionRate = earnings.length > 0 ? earnings[0].commissionRate : 0;

  // Determine overall status
  const getOverallStatus = () => {
    if (earnings.length === 0) return 'Pending';
    if (earnings.every(e => e.status === 'Paid')) return 'Paid';
    if (earnings.some(e => e.status === 'Failed')) return 'Failed';
    return 'Pending';
  };
  
  const overallStatus = getOverallStatus();

  if (loading || isPaymentLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500" />
      </div>
    );
  }

  if (error || paymentError) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <p className="text-xl font-semibold text-red-500">{error || paymentError?.message || 'An error occurred'}</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-4 px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center mb-8">
          <Wallet className="w-8 h-8 text-blue-500 mr-3" />
          <h1 className="text-3xl font-bold text-gray-900">Earnings Dashboard</h1>
        </div>

        {/* Earnings Section */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden mb-6">
          <div className="p-6">
            <div className="flex flex-wrap gap-4 mb-6">
              <div className="flex-1">
                <label htmlFor="month" className="block text-sm font-medium text-gray-700 mb-1">
                  Select Month
                </label>
                <select
                  id="month"
                  value={selectedMonth}
                  onChange={(e) => setSelectedMonth(Number(e.target.value))}
                  className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                >
                  {months.map((month, index) => (
                    <option key={month} value={index + 1}>
                      {month}
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex-1">
                <label htmlFor="year" className="block text-sm font-medium text-gray-700 mb-1">
                  Select Year
                </label>
                <select
                  id="year"
                  value={selectedYear}
                  onChange={(e) => setSelectedYear(Number(e.target.value))}
                  className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                >
                  {years.map((year) => (
                    <option key={year} value={year}>
                      {year}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {earnings.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-blue-50 rounded-lg p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-blue-900">Total Earnings</h3>
                    <DollarSign className="w-6 h-6 text-blue-500" />
                  </div>
                  <p className="text-3xl font-bold text-blue-700">{formatCurrency(totalEarningsAmount)}</p>
                  <div className="mt-2 text-sm text-blue-600">
                    For {months[selectedMonth - 1]} {selectedYear}
                  </div>
                </div>

                <div className="bg-green-50 rounded-lg p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-green-900">Commission Rate</h3>
                    <TrendingUp className="w-6 h-6 text-green-500" />
                  </div>
                  <p className="text-3xl font-bold text-green-700">{commissionRate}%</p>
                  <div className="mt-2 text-sm text-green-600">
                    Standard commission rate
                  </div>
                </div>

                <div className="md:col-span-2 bg-gray-50 rounded-lg p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-gray-900">Payment Status</h3>
                    <div
                      className={`px-3 py-1 rounded-full text-sm font-medium ${
                        overallStatus === 'Paid'
                          ? 'bg-green-100 text-green-800'
                          : overallStatus === 'Pending'
                          ? 'bg-yellow-100 text-yellow-800'
                          : 'bg-red-100 text-red-800'
                      }`}
                    >
                      {overallStatus}
                    </div>
                  </div>
                  <div className="text-sm text-gray-600">
                    {overallStatus === 'Paid'
                      ? 'Your earnings have been processed and paid.'
                      : overallStatus === 'Pending'
                      ? 'Your earnings are being processed and will be paid soon.'
                      : 'There might be an issue with your payment. Please contact support.'}
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-gray-500">No earnings data available for the selected period.</p>
              </div>
            )}
          </div>

          <div className="bg-gray-50 px-6 py-4">
            <div className="flex items-center text-sm text-gray-600">
              <Calendar className="w-4 h-4 mr-2" />
              <span>Last updated: {new Date().toLocaleString()}</span>
            </div>
          </div>
        </div>

        {/* Payment History Section */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden mb-6">
          <div className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-gray-900">Payment History</h2>
              <DollarSign className="w-6 h-6 text-blue-500" />
            </div>
            {paymentHistory?.payments?.length > 0 ? (
              <>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Payment ID
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Amount
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Period
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Method
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Status
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {paymentHistory.payments.map((payment) => (
                        <tr key={payment._id}>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {payment._id?.slice(-6) || 'N/A'}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {formatCurrency(payment.amount)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {formatMonthYear(payment.paymentMonth, payment.paymentYear)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {payment.paymentMethod || 'N/A'}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span
                              className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                payment.status === 'Paid'
                                  ? 'bg-green-100 text-green-800'
                                  : payment.status === 'Pending'
                                  ? 'bg-yellow-100 text-yellow-800'
                                  : 'bg-red-100 text-red-800'
                              }`}
                            >
                              {payment.status || 'N/A'}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <div className="flex justify-between items-center mt-4">
                  <button
                    onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
                    disabled={page === 1}
                    className="flex items-center px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed"
                  >
                    <ChevronLeft className="w-4 h-4 mr-1" />
                    Previous
                  </button>
                  <span className="text-sm text-gray-600">
                    Page {paymentHistory.pagination.page} of {paymentHistory.pagination.pages}
                  </span>
                  <button
                    onClick={() => setPage((prev) => prev + 1)}
                    disabled={page === paymentHistory.pagination.pages}
                    className="flex items-center px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed"
                  >
                    Next
                    <ChevronRight className="w-4 h-4 ml-1" />
                  </button>
                </div>
              </>
            ) : (
              <p className="text-sm text-gray-500">No payment history available.</p>
            )}
          </div>
        </div>

        <div className="text-sm text-gray-600">
          <p>Note: Earnings are calculated based on {commissionRate || 2.5}% commission of the total value of publications delivered.</p>
        </div>
      </div>
    </div>
  );
}

export default Earnings;