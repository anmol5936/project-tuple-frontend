import React, { useEffect, useState } from 'react';
import { Newspaper, Plus, PauseCircle, XCircle } from 'lucide-react';
import { customerApi } from '../../lib/api';

// Updated interface to match the actual data structure
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

// Function to get user token from localStorage
const getUserToken = async (): Promise<UserToken> => {
  const token = localStorage.getItem('user');
  if (!token) {
    throw new Error('User token not found in localStorage.');
  }
  console.log('User token:', token);
  return JSON.parse(token) as UserToken;
};

// Updated to match the actual API response
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

// Updated to match the actual API response
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

  // Fetch initial data and user token
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Get publications and subscriptions data
        const pubsResponse = await customerApi.getPublications();
        const subsResponse = await customerApi.getSubscriptions();
        const userToken = await getUserToken();
        
        console.log('Publications:', pubsResponse.publications);
        console.log('Subscriptions:', subsResponse.subscriptions);
        
        setPublications(pubsResponse.publications || []);
        setSubscriptions(subsResponse.subscriptions || []);
        
        // Set addressId from user data if available
        if (userToken && userToken.defaultAddress && userToken.defaultAddress.id) {
          setAddressId(userToken.defaultAddress.id);
        } else {
          // Try to get the first address from the subscription data if available
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

      // Refresh subscriptions
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
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <p className="text-gray-600">Loading...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">My Subscriptions</h1>
          <button
            onClick={() => setShowNewSubscription(true)}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-blue-700 transition-colors"
          >
            <Plus size={20} />
            New Subscription
          </button>
        </div>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        {showNewSubscription && (
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <h2 className="text-xl font-semibold mb-4">New Subscription</h2>
            <div className="grid gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Publication
                </label>
                <select
                  value={selectedPublication}
                  onChange={(e) => setSelectedPublication(e.target.value)}
                  className="w-full border border-gray-300 rounded-md px-3 py-2"
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
                  className="w-full border border-gray-300 rounded-md px-3 py-2"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Delivery Placement
                </label>
                <select
                  value={placement}
                  onChange={(e) => setPlacement(e.target.value)}
                  className="w-full border border-gray-300 rounded-md px-3 py-2"
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
                  className="w-full border border-gray-300 rounded-md px-3 py-2"
                  rows={4}
                />
              </div>
              <div className="flex gap-2 justify-end">
                <button
                  onClick={() => {
                    setShowNewSubscription(false);
                    setError('');
                  }}
                  className="px-4 py-2 text-gray-600 hover:text-gray-800"
                >
                  Cancel
                </button>
                <button
                  onClick={handleCreateSubscription}
                  disabled={!selectedPublication || !placement || !addressId}
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors disabled:bg-gray-400"
                >
                  Subscribe
                </button>
              </div>
            </div>
          </div>
        )}

        <div className="grid gap-6">
          {subscriptions && subscriptions.length > 0 && subscriptions.map((subscription) => (
            // Make sure we're using _id instead of id
            <div key={subscription._id} className="bg-white rounded-lg shadow-md p-6">
              <div className="flex justify-between items-start">
                <div className="flex gap-4">
                  <div className="p-3 bg-blue-100 rounded-lg">
                    <Newspaper className="text-blue-600" size={24} />
                  </div>
                  <div>
                    {/* Check if publicationId exists and has name property */}
                    <h3 className="text-lg font-semibold">
                      {subscription.publicationId && subscription.publicationId.name 
                        ? subscription.publicationId.name 
                        : "Unknown Publication"}
                    </h3>
                    <p className="text-gray-600">
                      {subscription.quantity} {subscription.quantity > 1 ? 'copies' : 'copy'} •{' '}
                      {subscription.publicationId && subscription.publicationId.language
                        ? subscription.publicationId.language 
                        : "Unknown language"}
                    </p>
                    {/* Check if addressId exists */}
                    {subscription.addressId && (
                      <p className="text-sm text-gray-500 mt-1">
                        Delivers to: {subscription.addressId.streetAddress},{' '}
                        {subscription.addressId.city}
                      </p>
                    )}
                    {/* We don't seem to have deliverer data in the response */}
                    {/* Removed the deliverer section */}
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => handlePauseSubscription(subscription._id)}
                    className="p-2 text-gray-600 hover:text-yellow-600 transition-colors"
                    title="Pause Delivery"
                  >
                    <PauseCircle size={20} />
                  </button>
                  <button
                    onClick={() => handleCancelSubscription(subscription._id)}
                    className="p-2 text-gray-600 hover:text-red-600 transition-colors"
                    title="Cancel Subscription"
                  >
                    <XCircle size={20} />
                  </button>
                </div>
              </div>
              <div className="mt-4 pt-4 border-t border-gray-100">
                {/* Calculate cost based on publication price and quantity */}
                {subscription.publicationId && subscription.publicationId.price && (
                  <p className="text-sm text-gray-600">
                    Monthly cost: ₹{subscription.publicationId.price * subscription.quantity}
                  </p>
                )}
                <p className="text-sm text-gray-600">
                  Status:{' '}
                  <span
                    className={`font-medium ${
                      subscription.status.toLowerCase() === 'active'
                        ? 'text-green-600'
                        : subscription.status.toLowerCase() === 'paused'
                          ? 'text-yellow-600'
                          : 'text-red-600'
                    }`}
                  >
                    {subscription.status.charAt(0).toUpperCase() + subscription.status.slice(1).toLowerCase()}
                  </span>
                </p>
                {/* Display delivery preferences if available */}
                {subscription.deliveryPreferences && (
                  <p className="text-sm text-gray-600 mt-1">
                    Delivery: {subscription.deliveryPreferences.placement} 
                    {subscription.deliveryPreferences.additionalInstructions && 
                      ` - ${subscription.deliveryPreferences.additionalInstructions}`}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>

        {(!subscriptions || subscriptions.length === 0) && (
          <div className="text-center py-12">
            <Newspaper className="mx-auto text-gray-400 mb-4" size={48} />
            <h3 className="text-lg font-medium text-gray-900">No subscriptions yet</h3>
            <p className="text-gray-600 mt-1">
              Start by subscribing to your favorite publications
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

export default Subscriptions;