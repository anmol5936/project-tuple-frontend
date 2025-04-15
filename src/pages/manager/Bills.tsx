import React, { useState } from 'react';
import { FileText, Loader2, Calendar, AlertCircle, CheckCircle2 } from 'lucide-react';
import { managerApi } from '../../lib/api';

export function ManagerBills() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [month, setMonth] = useState(new Date().getMonth() + 1);
  const [year, setYear] = useState(new Date().getFullYear());

  const handleGenerateBills = async () => {
    try {
      setLoading(true);
      setError(null);
      setSuccess(null);

      const response = await managerApi.generateBills({ month, year });
      setSuccess(`Successfully generated ${response.billIds.length} bills`);

      // Generate financial report for the same period
      const { report } = await managerApi.generateFinancialReport({ month, year });

      // Update success message with billing summary
      setSuccess(prev => `${prev}\n\nBilling Summary:
        • Total Billed Amount: ₹${report.billing.totalBilled.toFixed(2)}
        • Total Bills: ${report.billing.totalBills}
        • Unpaid Bills: ${report.billing.unpaidBills}
        • Partially Paid: ${report.billing.partiallyPaidBills}
        • Fully Paid: ${report.billing.paidBills}`);

    } catch (err) {
      setError('Failed to generate bills. Please try again.');
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

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
            <FileText className="w-8 h-8 text-blue-500" />
            Generate Monthly Bills
          </h1>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
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
              <div className="flex items-start">
                <CheckCircle2 className="w-5 h-5 text-green-400 mr-2 mt-0.5" />
                <div className="text-sm text-green-700 whitespace-pre-line">{success}</div>
              </div>
            </div>
          )}
        </div>

        <div className="mt-8 bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Important Information</h2>
          <ul className="space-y-2 text-gray-600">
            <li className="flex items-start">
              <span className="mr-2">•</span>
              Bills are generated for all active subscriptions in the selected month
            </li>
            <li className="flex items-start">
              <span className="mr-2">•</span>
              The system automatically calculates the total amount based on publication prices and delivery days
            </li>
            <li className="flex items-start">
              <span className="mr-2">•</span>
              Customers with outstanding dues for more than one month will receive a reminder message
            </li>
            <li className="flex items-start">
              <span className="mr-2">•</span>
              Subscriptions with dues outstanding for more than two months will be automatically suspended
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}