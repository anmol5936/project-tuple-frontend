import React, { useEffect, useState } from 'react';
import { Receipt, CreditCard, X, ChevronDown, ChevronUp, AlertCircle } from 'lucide-react';
import { customerApi } from '../../lib/api';

type Bill = {
  id: string;
  billNumber: string;
  billDate: string;
  billMonth: number;
  billYear: number;
  totalAmount: number;
  outstandingAmount: number;
  status: string;
  dueDate: string;
};

type BillDetail = {
  bill: {
    id: string;
    billNumber: string;
    totalAmount: number;
    status: string;
  };
  items: Array<{
    publication: {
      name: string;
      price: number;
    };
    quantity: number;
    totalPrice: number;
  }>;
};

function CustomerBills() {
  const [bills, setBills] = useState<Bill[]>([]);
  const [selectedBill, setSelectedBill] = useState<string | null>(null);
  const [billDetails, setBillDetails] = useState<BillDetail | null>(null);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<'Cash' | 'Cheque' | 'Online' | 'UPI' | 'Card'>('Cash');
  const [paymentAmount, setPaymentAmount] = useState<number>(0);
  const [referenceNumber, setReferenceNumber] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchBills();
  }, []);

  const fetchBills = async () => {
    try {
      const response = await customerApi.getBills();
      console.log('Fetched bills:', response);
      setBills(response.bills);
    } catch (err) {
      setError('Failed to load bills. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const fetchBillDetails = async (billId: string) => {
    try {
      const response = await customerApi.getBillDetails(billId);
      setBillDetails(response);
    } catch (err) {
      setError('Failed to load bill details. Please try again.');
    }
  };

  const handleBillSelect = async (billId: string) => {
    if (selectedBill === billId) {
      setSelectedBill(null);
      setBillDetails(null);
    } else {
      setSelectedBill(billId);
      await fetchBillDetails(billId);
    }
  };

  const handlePayment = async () => {
    try {
      if (!selectedBill) return;

      await customerApi.makePayment({
        billId: selectedBill,
        amount: paymentAmount,
        paymentMethod,
        referenceNumber: referenceNumber || undefined
      });

      // Refresh bills after payment
      await fetchBills();
      setShowPaymentModal(false);
      setPaymentMethod('Cash');
      setPaymentAmount(0);
      setReferenceNumber('');
      setSelectedBill(null);
      setBillDetails(null);
    } catch (err) {
      setError('Failed to process payment. Please try again.');
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'paid':
        return 'text-green-600';
      case 'pending':
        return 'text-yellow-600';
      case 'overdue':
        return 'text-red-600';
      default:
        return 'text-gray-600';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <p className="text-gray-600">Loading...</p>
      </div>
    );
  }

  console.log('Bills:', bills); 

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">My Bills</h1>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4 flex items-center gap-2">
            <AlertCircle size={20} />
            {error}
          </div>
        )}

<div className="grid gap-4">
  {bills.map((bill) => (
    <div key={bill._id} className="bg-white rounded-lg shadow-md overflow-hidden">
      <div
        className="p-6 cursor-pointer hover:bg-gray-50 transition-colors"
        onClick={() => handleBillSelect(bill._id)}
      >
        <div className="flex justify-between items-start">
          <div className="flex gap-4">
            <div className="p-3 bg-blue-100 rounded-lg">
              <Receipt className="text-blue-600" size={24} />
            </div>
            <div>
              <h3 className="text-lg font-semibold">Bill #{bill.billNumber}</h3>
              <p className="text-gray-600">
                {formatDate(bill.billDate)}
              </p>
              <p className="text-sm text-gray-500">
                Due date: {formatDate(bill.dueDate)}
              </p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-lg font-semibold">₹{bill.totalAmount}</p>
            <p className={`text-sm font-medium ${getStatusColor(bill.status)}`}>
              {bill.status}
            </p>
            {bill.outstandingAmount > 0 && (
              <p className="text-sm text-red-600">
                Outstanding: ₹{bill.outstandingAmount}
              </p>
            )}
          </div>
        </div>
        <div className="flex justify-between items-center mt-4">
          <p className="text-sm text-gray-600">
            {bill.billMonth}/{bill.billYear}
          </p>
          {selectedBill === bill._id ? (
            <ChevronUp size={20} className="text-gray-400" />
          ) : (
            <ChevronDown size={20} className="text-gray-400" />
          )}
        </div>
      </div>

      {selectedBill === bill._id && billDetails && (
        <div className="border-t border-gray-100 p-6">
          <h4 className="font-medium text-gray-900 mb-4">Bill Details</h4>
          <div className="space-y-3">
            {billDetails.items.map((item, index) => (
              <div key={index} className="flex justify-between text-sm">
                <div>
                  <p className="text-gray-900">
                    {item.publicationId?.name || 'Unknown Publication'}
                  </p>
                  <p className="text-gray-500">
                    {item.quantity} {item.quantity > 1 ? 'copies' : 'copy'} × ₹
                    {item.publicationId?.price || 0}
                  </p>
                </div>
                <p className="text-gray-900">₹{item.totalPrice}</p>
              </div>
            ))}
            <div className="pt-3 border-t border-gray-100">
              <div className="flex justify-between font-medium">
                <p>Total Amount</p>
                <p>₹{billDetails.bill.totalAmount}</p>
              </div>
            </div>
          </div>

          {bill.status.toLowerCase() !== 'paid' && (
            <button
              onClick={() => {
                setPaymentAmount(bill.outstandingAmount);
                setShowPaymentModal(true);
              }}
              className="mt-6 w-full bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
            >
              <CreditCard size={20} />
              Pay Now
            </button>
          )}
        </div>
      )}
    </div>
  ))}

  {bills.length === 0 && (
    <div className="text-center py-12">
      <Receipt className="mx-auto text-gray-400 mb-4" size={48} />
      <h3 className="text-lg font-medium text-gray-900">No bills yet</h3>
      <p className="text-gray-600 mt-1">
        Your bills will appear here when they're generated
      </p>
    </div>
  )}
</div>

        {showPaymentModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-lg max-w-md w-full p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-semibold">Make Payment</h3>
                <button
                  onClick={() => setShowPaymentModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X size={24} />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Payment Method
                  </label>
                  <select
                    value={paymentMethod}
                    onChange={(e) => setPaymentMethod(e.target.value as typeof paymentMethod)}
                    className="w-full border border-gray-300 rounded-md px-3 py-2"
                  >
                    <option value="Cash">Cash</option>
                    <option value="Cheque">Cheque</option>
                    <option value="Online">Online</option>
                    <option value="UPI">UPI</option>
                    <option value="Card">Card</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Amount
                  </label>
                  <input
                    type="number"
                    value={paymentAmount}
                    onChange={(e) => setPaymentAmount(Number(e.target.value))}
                    className="w-full border border-gray-300 rounded-md px-3 py-2"
                  />
                </div>

                {paymentMethod !== 'Cash' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Reference Number
                    </label>
                    <input
                      type="text"
                      value={referenceNumber}
                      onChange={(e) => setReferenceNumber(e.target.value)}
                      className="w-full border border-gray-300 rounded-md px-3 py-2"
                      placeholder={`Enter ${paymentMethod} reference number`}
                    />
                  </div>
                )}

                <button
                  onClick={handlePayment}
                  className="w-full bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Complete Payment
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default CustomerBills;