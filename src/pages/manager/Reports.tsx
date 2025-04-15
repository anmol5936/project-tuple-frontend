import React, { useState } from 'react';
import { BarChart3, Loader2, Calendar, AlertCircle, CheckCircle2, DollarSign, Users, TrendingUp, Wallet } from 'lucide-react';
import { managerApi } from '../../lib/api';

type FinancialReport = {
  period: {
    month: number;
    year: number;
  };
  billing: {
    totalBilled: number;
    totalBills: number;
    unpaidBills: number;
    partiallyPaidBills: number;
    paidBills: number;
  };
  payments: {
    totalReceived: number;
    totalPayments: number;
    byMethod: Record<string, number>;
  };
  delivererPayments: {
    totalPaid: number;
    totalDeliverers: number;
    pendingPayments: number;
  };
  summary: {
    grossRevenue: number;
    totalExpenses: number;
    netRevenue: number;
  };
};

export function Reports() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [month, setMonth] = useState(new Date().getMonth() + 1);
  const [year, setYear] = useState(new Date().getFullYear());
  const [report, setReport] = useState<FinancialReport | null>(null);

  const handleGenerateReport = async () => {
    try {
      setLoading(true);
      setError(null);
      setSuccess(null);

      const { report: financialReport } = await managerApi.generateFinancialReport({ month, year });
      setReport(financialReport);
      setSuccess('Financial report generated successfully');
    } catch (err) {
      setError('Failed to generate financial report. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleProcessDelivererPayments = async () => {
    try {
      setLoading(true);
      setError(null);
      setSuccess(null);

      await managerApi.processDelivererPayments({ month, year });
      setSuccess('Deliverer payments processed successfully');

      // Refresh the report to show updated numbers
      const { report: updatedReport } = await managerApi.generateFinancialReport({ month, year });
      setReport(updatedReport);
    } catch (err) {
      setError('Failed to process deliverer payments. Please try again.');
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
            <BarChart3 className="w-8 h-8 text-blue-500" />
            Financial Reports
          </h1>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
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

          <div className="flex flex-col sm:flex-row gap-4">
            <button
              onClick={handleGenerateReport}
              disabled={loading}
              className="flex-1 px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 inline-block animate-spin mr-2" />
                  Generating Report...
                </>
              ) : (
                'Generate Report'
              )}
            </button>

            <button
              onClick={handleProcessDelivererPayments}
              disabled={loading}
              className="flex-1 px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 inline-block animate-spin mr-2" />
                  Processing Payments...
                </>
              ) : (
                'Process Deliverer Payments'
              )}
            </button>
          </div>

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

        {report && (
          <div className="space-y-8">
            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-white rounded-lg shadow-md p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Gross Revenue</p>
                    <p className="text-2xl font-bold text-gray-900">₹{report.summary.grossRevenue.toFixed(2)}</p>
                  </div>
                  <DollarSign className="w-8 h-8 text-green-500" />
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-md p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Total Expenses</p>
                    <p className="text-2xl font-bold text-gray-900">₹{report.summary.totalExpenses.toFixed(2)}</p>
                  </div>
                  <Wallet className="w-8 h-8 text-red-500" />
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-md p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Net Revenue</p>
                    <p className="text-2xl font-bold text-gray-900">₹{report.summary.netRevenue.toFixed(2)}</p>
                  </div>
                  <TrendingUp className="w-8 h-8 text-blue-500" />
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-md p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Active Deliverers</p>
                    <p className="text-2xl font-bold text-gray-900">{report.delivererPayments.totalDeliverers}</p>
                  </div>
                  <Users className="w-8 h-8 text-purple-500" />
                </div>
              </div>
            </div>

            {/* Detailed Reports */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Billing Details */}
              <div className="bg-white rounded-lg shadow-md p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Billing Overview</h3>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Total Bills</span>
                    <span className="font-medium">{report.billing.totalBills}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Paid Bills</span>
                    <span className="font-medium text-green-600">{report.billing.paidBills}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Partially Paid</span>
                    <span className="font-medium text-yellow-600">{report.billing.partiallyPaidBills}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Unpaid Bills</span>
                    <span className="font-medium text-red-600">{report.billing.unpaidBills}</span>
                  </div>
                  <div className="pt-3 border-t">
                    <div className="flex justify-between">
                      <span className="text-gray-900 font-medium">Total Billed Amount</span>
                      <span className="font-bold">₹{report.billing.totalBilled.toFixed(2)}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Deliverer Payments */}
              <div className="bg-white rounded-lg shadow-md p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Deliverer Payments</h3>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Total Deliverers</span>
                    <span className="font-medium">{report.delivererPayments.totalDeliverers}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Total Paid</span>
                    <span className="font-medium text-green-600">₹{report.delivererPayments.totalPaid.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Pending Payments</span>
                    <span className="font-medium text-yellow-600">₹{report.delivererPayments.pendingPayments.toFixed(2)}</span>
                  </div>
                  <div className="pt-3 border-t">
                    <div className="flex justify-between">
                      <span className="text-gray-900 font-medium">Commission Rate</span>
                      <span className="font-bold">2.5%</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}