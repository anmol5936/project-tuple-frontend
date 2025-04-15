import React, { useEffect, useState } from 'react';
import { Wallet, Calendar, TrendingUp, AlertCircle, DollarSign } from 'lucide-react';
import { delivererApi } from '../../lib/api';

type Earnings = {
  month: number;
  year: number;
  amount: number;
  status: string;
  commissionRate: number;
};

 function Earnings() {
  const [earnings, setEarnings] = useState<Earnings | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedMonth, setSelectedMonth] = useState(() => new Date().getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(() => new Date().getFullYear());

  useEffect(() => {
    const fetchEarnings = async () => {
      try {
        setLoading(true);
        const data = await delivererApi.getEarnings({
          month: selectedMonth,
          year: selectedYear
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

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <p className="text-xl font-semibold text-red-500">{error}</p>
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

  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 5 }, (_, i) => currentYear - i);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR'
    }).format(amount);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center mb-8">
          <Wallet className="w-8 h-8 text-blue-500 mr-3" />
          <h1 className="text-3xl font-bold text-gray-900">Earnings Dashboard</h1>
        </div>

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

            {earnings && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-blue-50 rounded-lg p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-blue-900">Total Earnings</h3>
                    <DollarSign className="w-6 h-6 text-blue-500" />
                  </div>
                  <p className="text-3xl font-bold text-blue-700">{formatCurrency(earnings.amount)}</p>
                  <div className="mt-2 text-sm text-blue-600">
                    For {months[earnings.month - 1]} {earnings.year}
                  </div>
                </div>

                <div className="bg-green-50 rounded-lg p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-green-900">Commission Rate</h3>
                    <TrendingUp className="w-6 h-6 text-green-500" />
                  </div>
                  <p className="text-3xl font-bold text-green-700">{earnings.commissionRate}%</p>
                  <div className="mt-2 text-sm text-green-600">
                    Standard commission rate
                  </div>
                </div>

                <div className="md:col-span-2 bg-gray-50 rounded-lg p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-gray-900">Payment Status</h3>
                    <div className={`px-3 py-1 rounded-full text-sm font-medium 
                      ${earnings.status === 'Paid' ? 'bg-green-100 text-green-800' : 
                        earnings.status === 'Pending' ? 'bg-yellow-100 text-yellow-800' : 
                        'bg-red-100 text-red-800'}`}>
                      {earnings.status}
                    </div>
                  </div>
                  <div className="text-sm text-gray-600">
                    {earnings.status === 'Paid' ? 
                      'Your earnings have been processed and paid.' :
                      earnings.status === 'Pending' ? 
                      'Your earnings are being processed and will be paid soon.' :
                      'There might be an issue with your payment. Please contact support.'}
                  </div>
                </div>
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

        <div className="text-sm text-gray-600">
          <p>Note: Earnings are calculated based on 2.5% commission of the total value of publications delivered.</p>
        </div>
      </div>
    </div>
  );
}

export default Earnings;