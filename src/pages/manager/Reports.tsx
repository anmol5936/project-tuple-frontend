import React, { useState, useEffect } from 'react';
import { BarChart3, Loader2, Calendar, AlertCircle, CheckCircle2, DollarSign, Users, TrendingUp, Wallet, RefreshCw } from 'lucide-react';
import { managerApi } from '../../lib/api';

interface FinancialReport {
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
}

interface DeliveryReport {
  totalDeliveries: number;
  successfulDeliveries: number;
  failedDeliveries: number;
  skippedDeliveries: number;
  publications: Record<string, {
    name: string;
    totalDelivered: number;
    revenue: number;
  }>;
}

export function Reports() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [month, setMonth] = useState(new Date().getMonth() + 1);
  const [year, setYear] = useState(new Date().getFullYear());
  const [financialReport, setFinancialReport] = useState<FinancialReport | null>(null);
  const [deliveryReport, setDeliveryReport] = useState<DeliveryReport | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [delivererLength, setDelivererLength] = useState(0);

  const fetchReports = async () => {
    try {
      setRefreshing(true);
      const [financialRes, deliveryRes] = await Promise.all([
        managerApi.generateFinancialReport({ month, year }),
        managerApi.generateDeliveryReport({ month, year })
      ]);
      const { deliverers } = await managerApi.getDeliverers();
      console.log('Deliverers:', deliverers);
      setDelivererLength(deliverers.length);
      setFinancialReport(financialRes.report);
      console.log('Financial Report:', financialRes.report);
      setDeliveryReport(deliveryRes.report);
      console.log('Delivery Report:', deliveryRes.report);
    } catch (err) {
      console.error('Error fetching reports:', err);
    } finally {
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, [month, year]);

  const handleProcessDelivererPayments = async () => {
    try {
      setLoading(true);
      setError(null);
      setSuccess(null);

      await managerApi.processDelivererPayments({ month, year });
      setSuccess('Deliverer payments processed successfully');

      // Refresh reports
      await fetchReports();
    } catch (err) {
      setError('Failed to process deliverer payments. Please try again.');
      console.error('Error processing payments:', err);
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
    <div className="space-y-8 mt-8">
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <BarChart3 className="w-6 h-6 text-blue-500" />
            Financial Reports
          </h1>
          <button
            onClick={fetchReports}
            disabled={refreshing}
            className="p-2 text-gray-600 hover:text-blue-600 transition-colors"
            title="Refresh reports"
          >
            <RefreshCw className={`w-5 h-5 ${refreshing ? 'animate-spin' : ''}`} />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div>
            <label htmlFor="report-month" className="block text-sm font-medium text-gray-700 mb-2">
              <Calendar className="w-4 h-4 inline-block mr-1" />
              Month
            </label>
            <select
              id="report-month"
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
            <label htmlFor="report-year" className="block text-sm font-medium text-gray-700 mb-2">
              <Calendar className="w-4 h-4 inline-block mr-1" />
              Year
            </label>
            <input
              type="number"
              id="report-year"
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
          onClick={handleProcessDelivererPayments}
          disabled={loading}
          className="w-full sm:w-auto px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed"
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

      {financialReport && (
        <>
          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Gross Revenue</p>
                  <p className="text-2xl font-bold text-gray-900">₹{financialReport.summary.grossRevenue.toFixed(2)}</p>
                </div>
                <DollarSign className="w-8 h-8 text-green-500" />
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Expenses</p>
                  <p className="text-2xl font-bold text-gray-900">₹{financialReport.summary.totalExpenses.toFixed(2)}</p>
                </div>
                <Wallet className="w-8 h-8 text-red-500" />
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Net Revenue</p>
                  <p className="text-2xl font-bold text-gray-900">₹{financialReport.summary.netRevenue.toFixed(2)}</p>
                </div>
                <TrendingUp className="w-8 h-8 text-blue-500" />
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Active Deliverers</p>
                  <p className="text-2xl font-bold text-gray-900">{delivererLength}</p>
                </div>
                <Users className="w-8 h-8 text-purple-500" />
              </div>
            </div>
          </div>

          {/* Detailed Reports */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Financial Details */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Financial Overview</h3>
              <div className="space-y-4">
                <div className="border-b pb-4">
                  <h4 className="text-sm font-medium text-gray-600 mb-2">Billing Summary</h4>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div>Total Bills:</div>
                    <div className="text-right font-medium">{financialReport.billing.totalBills}</div>
                    <div>Paid Bills:</div>
                    <div className="text-right font-medium text-green-600">{financialReport.billing.paidBills}</div>
                    <div>Partially Paid:</div>
                    <div className="text-right font-medium text-yellow-600">{financialReport.billing.partiallyPaidBills}</div>
                    <div>Unpaid Bills:</div>
                    <div className="text-right font-medium text-red-600">{financialReport.billing.unpaidBills}</div>
                  </div>
                </div>

                <div className="border-b pb-4">
                  <h4 className="text-sm font-medium text-gray-600 mb-2">Payment Methods</h4>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    {Object.entries(financialReport.payments.byMethod).map(([method, amount]) => (
                      <React.Fragment key={method}>
                        <div>{method}:</div>
                        <div className="text-right font-medium">₹{amount.toFixed(2)}</div>
                      </React.Fragment>
                    ))}
                  </div>
                </div>

                <div>
                  <h4 className="text-sm font-medium text-gray-600 mb-2">Deliverer Payments</h4>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div>Total Paid:</div>
                    <div className="text-right font-medium">₹{financialReport.delivererPayments.totalPaid.toFixed(2)}</div>
                    <div>Pending Payments:</div>
                    <div className="text-right font-medium">{financialReport.delivererPayments.pendingPayments}</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Delivery Report */}
            {deliveryReport && (
              <div className="bg-white rounded-lg shadow-md p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Delivery Overview</h3>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-green-50 p-4 rounded-lg">
                      <div className="text-sm text-green-600">Successful Deliveries</div>
                      <div className="text-2xl font-bold text-green-700">{deliveryReport.successfulDeliveries}</div>
                    </div>
                    <div className="bg-red-50 p-4 rounded-lg">
                      <div className="text-sm text-red-600">Failed Deliveries</div>
                      <div className="text-2xl font-bold text-red-700">{deliveryReport.failedDeliveries}</div>
                    </div>
                  </div>

                  <div className="border-t pt-4">
                    <h4 className="text-sm font-medium text-gray-600 mb-2">Publication Performance</h4>
                    <div className="space-y-2">
                      {Object.entries(deliveryReport.publications).map(([id, pub]) => (
                        <div key={id} className="flex justify-between text-sm">
                          <span>{pub.name}</span>
                          <span className="font-medium">₹{pub.revenue.toFixed(2)}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}