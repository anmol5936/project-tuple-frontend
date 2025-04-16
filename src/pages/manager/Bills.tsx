import React, { useState, useEffect } from 'react';
import { FileText, Loader2, Calendar, AlertCircle, CheckCircle2, RefreshCw } from 'lucide-react';
import { managerApi } from '../../lib/api';

interface Bill {
  _id: string;
  billNumber: string;
  userId: {
    firstName: string;
    lastName: string;
    email: string;
  };
  totalAmount: number;
  outstandingAmount: number;
  status: string;
  billDate: string;
  dueDate: string;
}

export function ManagerBills() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [month, setMonth] = useState(new Date().getMonth() + 1);
  const [year, setYear] = useState(new Date().getFullYear());
  const [bills, setBills] = useState<Bill[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  const fetchBills = async () => {
    try {
      setRefreshing(true);
      const response = await managerApi.getBills({ month, year });
      console.log('Fetched bills:', response.bills);
      setBills(response.bills);
    } catch (err) {
      console.error('Error fetching bills:', err);
    } finally {
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchBills();
  }, [month, year]);

  const handleGenerateBills = async () => {
    try {
      setLoading(true);
      setError(null);
      setSuccess(null);

      const response = await managerApi.generateBills({ month, year });
      
      // Fetch updated bills
      await fetchBills();

      setSuccess(`Successfully generated ${response.billIds.length} bills`);

      // Send payment reminders for overdue bills
      await managerApi.sendPaymentReminders();

    } catch (err) {
      setError('Failed to generate bills. Please try again.');
      console.error('Error generating bills:', err);
    } finally {
      setLoading(false);
    }
  };

  const monthOptions = [
    { value: 1, label: 'January' },
    { value: 2, label: 'February' },
    { value: 3, label: 'March' },
    { value: 4, label: 'April' },
    { value: 5, label: 'May' },
    { value: 6, label: 'June' },
    { value: 7, label: 'July' },
    { value: 8, label: 'August' },
    { value: 9, label: 'September' },
    { value: 10, label: 'October' },
    { value: 11, label: 'November' },
    { value: 12, label: 'December' }
  ];

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'paid':
        return 'text-green-600 bg-green-100';
      case 'partially paid':
        return 'text-yellow-600 bg-yellow-100';
      case 'unpaid':
        return 'text-red-600 bg-red-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  return (
    <div className="space-y-8">
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <FileText className="w-6 h-6 text-blue-500" />
            Generate Monthly Bills
          </h1>
          <button
            onClick={fetchBills}
            disabled={refreshing}
            className="p-2 text-gray-600 hover:text-blue-600 transition-colors"
            title="Refresh bills"
          >
            <RefreshCw className={`w-5 h-5 ${refreshing ? 'animate-spin' : ''}`} />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div>
            <label htmlFor="month" className="block text-sm font-medium text-gray-700 mb-2">
              <Calendar className="w-4 h-4 inline-block mr-1" />
              Month
            </label>
            <select
              id="month"
              value={month}
              onChange={(e) => setMonth(Number(e.target.value))}
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
              disabled={loading}
            >
              {monthOptions.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="year" className="block text-sm font-medium text-gray-700 mb-2">
              <Calendar className="w-4 h-4 inline-block mr-1" />
              Year
            </label>
            <input
              type="number"
              id="year"
              value={year}
              onChange={(e) => setYear(Number(e.target.value))}
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
              min={2000}
              max={2100}
              disabled={loading}
            />
          </div>
        </div>

        <button
          onClick={handleGenerateBills}
          disabled={loading}
          className="w-full sm:w-auto px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? (
            <>
              <Loader2 className="w-5 h-5 inline-block animate-spin mr-2" />
              Generating Bills...
            </>
          ) : (
            'Generate Bills'
          )}
        </button>

        {error && (
          <div className="mt-4 p-4 bg-red-50 rounded-md">
            <div className="flex items-center">
              <AlertCircle className="w-5 h-5 text-red-400 mr-2" />
              <p className="text-sm text-red-700">{error}</p>
            </div>
          </div>
        )}

        {success && (
          <div className="mt-4 p-4 bg-green-50 rounded-md">
            <div className="flex items-center">
              <CheckCircle2 className="w-5 h-5 text-green-400 mr-2" />
              <p className="text-sm text-green-700">{success}</p>
            </div>
          </div>
        )}
      </div>

      {/* Bills Table */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Generated Bills</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Bill Number</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Customer</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Outstanding</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Due Date</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {bills.map((bill) => (
                <tr key={bill._id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {bill.billNumber}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {`${bill.userId.firstName} ${bill.userId.lastName}`}
                    <div className="text-xs text-gray-400">{bill.userId.email}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    ₹{bill.totalAmount.toFixed(2)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    ₹{bill.outstandingAmount.toFixed(2)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(bill.status)}`}>
                      {bill.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(bill.dueDate).toLocaleDateString()}
                  </td>
                </tr>
              ))}
              {bills.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-6 py-4 text-center text-sm text-gray-500">
                    No bills found for the selected period
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}