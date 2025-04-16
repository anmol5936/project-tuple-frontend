import React, { useEffect, useState } from 'react';
import { Newspaper, Plus, PauseCircle, XCircle, Loader2 } from 'lucide-react';
import { customerApi } from '../../lib/api';

interface UserToken {
  id: string;
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  areas: Array<{
    _id: string;
    name: string;
    city: string;
    state: string;
  }>;
}

const getUserToken = async (): Promise<UserToken> => {
  const token = localStorage.getItem('user');
  if (!token) {
    throw new Error('User token not found in localStorage.');
  }
  console.log('User token:', token);
  return JSON.parse(token) as UserToken;
};

type Publication = {
  _id: string;
  name: string;
  language: string;
  description: string;
  price: number;
  publicationType: string;
  publicationDays: string[];
  areas: string[];
  isActive: boolean;
  managerId: string;
  createdAt: string;
  updatedAt: string;
  __v: number;
};

type Subscription = {
  _id: string;
  userId: string;
  publicationId: {
    _id: string;
    name: string;
    language: string;
    description: string;
    price: number;
    publicationType: string;
    publicationDays: string[];
    areas: string[];
    isActive: boolean;
    managerId: string;
    createdAt: string;
    updatedAt: string;
    __v: number;
  };
  quantity: number;
  startDate: string;
  status: string;
  addressId: {
    _id: string;
    userId: string;
    streetAddress: string;
    city: string;
    state: string;
    postalCode: string;
    areaId: string;
    isDefault: boolean;
    isActive: boolean;
    deliveryInstructions: string;
    __v: number;
  };
  deliveryPreferences: {
    placement: string;
    additionalInstructions: string;
  };
  createdAt: string;
  updatedAt: string;
  __v: number;
};

function Subscriptions() {
  const [publications, setPublications] = useState<Publication[]>([]);
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [showNewSubscription, setShowNewSubscription] = useState(false);
  const [selectedPublication, setSelectedPublication] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [placement, setPlacement] = useState('Front door');
  const [additionalInstructions, setAdditionalInstructions] = useState('');
  const [addressId, setAddressId] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const pubsResponse = await customerApi.getPublications();
        const subsResponse = await customerApi.getSubscriptions();
        const userToken = await getUserToken();
        
        console.log('Publications:', pubsResponse.publications);
        console.log('Subscriptions:', subsResponse.subscriptions);
        
        setPublications(pubsResponse.publications || []);
        setSubscriptions(subsResponse.subscriptions || []);
        
        if (userToken && userToken.defaultAddress && userToken.defaultAddress.id) {
          setAddressId(userToken.defaultAddress.id);
        } else {
          const firstSub = subsResponse.subscriptions && subsResponse.subscriptions[0];
          if (firstSub && firstSub.addressId && firstSub.addressId._id) {
            setAddressId(firstSub.addressId._id);
          } else {
            setError('No default address found in user profile.');
          }
        }
      } catch (err: any) {
        console.error('Error fetching data:', err);
        setError(err.message || 'Failed to load data. Please try again later.');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleCreateSubscription = async () => {
    if (!selectedPublication) {
      setError('Please select a publication.');
      return;
    }
    if (!addressId) {
      setError('No valid address found.');
      return;
    }
    if (!placement) {
      setError('Please specify a delivery placement.');
      return;
    }
    try {
      await customerApi.createSubscription({
        publicationId: selectedPublication,
        quantity,
        addressId,
        deliveryPreferences: {
          placement,
          additionalInstructions,
        },
      });

      const subsResponse = await customerApi.getSubscriptions();
      setSubscriptions(subsResponse.subscriptions);
      setShowNewSubscription(false);
      setSelectedPublication('');
      setQuantity(1);
      setPlacement('Front door');
      setAdditionalInstructions('');
      setError('');
    } catch (err: any) {
      setError(err.message || 'Failed to create subscription. Please try again.');
    }
  };

  const handleCancelSubscription = async (id: string) => {
    try {
      await customerApi.cancelSubscription(id);
      const subsResponse = await customerApi.getSubscriptions();
      setSubscriptions(subsResponse.subscriptions);
      setError('');
    } catch (err: any) {
      setError(err.message || 'Failed to cancel subscription. Please try again.');
    }
  };

  const handlePauseSubscription = async (id: string) => {
    try {
      const today = new Date();
      const endDate = new Date();
      endDate.setDate(today.getDate() + 7);

      await customerApi.requestPause({
        subscriptionId: id,
        startDate: today.toISOString().split('T')[0],
        endDate: endDate.toISOString().split('T')[0],
      });

      const subsResponse = await customerApi.getSubscriptions();
      setSubscriptions(subsResponse.subscriptions);
      setError('');
    } catch (err: any) {
      setError(err.message || 'Failed to pause subscription. Please try again.');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 flex items-center justify-center">
        <div className="bg-white p-4 rounded-xl shadow-lg">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-8 gap-4">
          <div className="flex items-center gap-3">
            <div className="bg-white p-2 rounded-xl shadow-md">
              <Newspaper className="w-8 h-8 text-blue-600" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900">My Subscriptions</h1>
          </div>
          <button
            onClick={() => setShowNewSubscription(true)}
            className="inline-flex items-center px-4 py-2.5 border border-transparent rounded-xl shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 transform transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
          >
            <Plus className="w-4 h-4 mr-2" />
            New Subscription
          </button>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700 animate-fadeIn">
            {error}
          </div>
        )}

        {showNewSubscription && (
          <div className="bg-white rounded-xl shadow-lg p-6 mb-6 border border-gray-100">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">New Subscription</h2>
            <div className="grid gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Publication
                </label>
                <select
                  value={selectedPublication}
                  onChange={(e) => setSelectedPublication(e.target.value)}
                  className="w-full rounded-xl border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                >
                  <option value="">Select a publication</option>
                  {publications.map((pub) => (
                    <option key={pub._id} value={pub._id}>
                      {pub.name} ({pub.language}) - ₹{pub.price}/month
                    </option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Quantity
                </label>
                <input
                  type="number"
                  min="1"
                  value={quantity}
                  onChange={(e) => setQuantity(parseInt(e.target.value))}
                  className="w-full rounded-xl border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Delivery Placement
                </label>
                <select
                  value={placement}
                  onChange={(e) => setPlacement(e.target.value)}
                  className="w-full rounded-xl border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                >
                  <option value="Front door">Front Door</option>
                  <option value="Mailbox">Mailbox</option>
                  <option value="Gate">Gate</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Additional Instructions
                </label>
                <textarea
                  value={additionalInstructions}
                  onChange={(e) => setAdditionalInstructions(e.target.value)}
                  placeholder="E.g., Leave at the back door"
                  className="w-full rounded-xl border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  rows={4}
                />
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t">
                <button
                  onClick={() => {
                    setShowNewSubscription(false);
                    setError('');
                  }}
                  className="px-4 py-2.5 border border-gray-300 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleCreateSubscription}
                  disabled={!selectedPublication || !placement || !addressId}
                  className="px-4 py-2.5 border border-transparent rounded-xl shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 transform transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                >
                  Subscribe
                </button>
              </div>
            </div>
          </div>
        )}

        <div className="grid gap-6">
          {subscriptions && subscriptions.length > 0 ? (
            subscriptions.map((subscription) => (
              <div 
                key={subscription._id} 
                className="bg-white rounded-xl shadow-sm p-6 hover:shadow-md transition-all duration-200 border border-gray-100"
              >
                <div className="flex justify-between items-start">
                  <div className="flex gap-4">
                    <div className="p-3 bg-blue-50 rounded-xl">
                      <Newspaper className="text-blue-600 w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">
                        {subscription.publicationId?.name || "Unknown Publication"}
                      </h3>
                      <p className="text-gray-600">
                        {subscription.quantity} {subscription.quantity > 1 ? 'copies' : 'copy'} •{' '}
                        {subscription.publicationId?.language || "Unknown language"}
                      </p>
                      {subscription.addressId && (
                        <p className="text-sm text-gray-500 mt-1">
                          Delivers to: {subscription.addressId.streetAddress},{' '}
                          {subscription.addressId.city}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handlePauseSubscription(subscription._id)}
                      className="p-2 text-gray-400 hover:text-yellow-600 transition-colors rounded-lg hover:bg-gray-50"
                      title="Pause Delivery"
                    >
                      <PauseCircle className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => handleCancelSubscription(subscription._id)}
                      className="p-2 text-gray-400 hover:text-red-600 transition-colors rounded-lg hover:bg-gray-50"
                      title="Cancel Subscription"
                    >
                      <XCircle className="w-5 h-5" />
                    </button>
                  </div>
                </div>
                
                <div className="mt-4 pt-4 border-t border-gray-100">
                  {subscription.publicationId?.price && (
                    <p className="text-sm text-gray-600">
                      Monthly cost: ₹{(subscription.publicationId.price * subscription.quantity).toFixed(2)}
                    </p>
                  )}
                  <p className="text-sm text-gray-600">
                    Status:{' '}
                    <span className={`font-medium ${
                      subscription.status.toLowerCase() === 'active'
                        ? 'text-green-600'
                        : subscription.status.toLowerCase() === 'paused'
                          ? 'text-yellow-600'
                          : 'text-red-600'
                    }`}>
                      {subscription.status.charAt(0).toUpperCase() + subscription.status.slice(1).toLowerCase()}
                    </span>
                  </p>
                  {subscription.deliveryPreferences && (
                    <p className="text-sm text-gray-600 mt-1">
                      Delivery: {subscription.deliveryPreferences.placement}
                      {subscription.deliveryPreferences.additionalInstructions && 
                        ` - ${subscription.deliveryPreferences.additionalInstructions}`}
                    </p>
                  )}
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-12 bg-white rounded-xl shadow-sm border border-gray-100">
              <Newspaper className="mx-auto text-gray-400 mb-4 w-12 h-12" />
              <h3 className="text-lg font-medium text-gray-900">No subscriptions yet</h3>
              <p className="text-gray-600 mt-1">
                Start by subscribing to your favorite publications
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Subscriptions;