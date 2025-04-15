import React, { useEffect, useState } from 'react';
import { Newspaper, Plus, PauseCircle, XCircle } from 'lucide-react';
import { customerApi } from '../../lib/api';

type Publication = {
  id: string;
  name: string;
  language: string;
  description: string;
  price: number;
  publicationType: string;
  publicationDays: string[];
};

type Subscription = {
  id: string;
  publication: {
    name: string;
    language: string;
    price: number;
  };
  quantity: number;
  status: string;
  address: {
    streetAddress: string;
    city: string;
    state: string;
    postalCode: string;
  };
  deliverer: {
    firstName: string;
    lastName: string;
    phone: string;
  };
};

function Subscriptions() {
  const [publications, setPublications] = useState<Publication[]>([]);
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [showNewSubscription, setShowNewSubscription] = useState(false);
  const [selectedPublication, setSelectedPublication] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Fetch initial data
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [pubsResponse, subsResponse] = await Promise.all([
          customerApi.getPublications(),
          customerApi.getSubscriptions()
        ]);
        setPublications(pubsResponse.publications);
        setSubscriptions(subsResponse.subscriptions);
      } catch (err) {
        setError('Failed to load data. Please try again later.');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleCreateSubscription = async () => {
    try {
      await customerApi.createSubscription({
        publicationId: selectedPublication,
        quantity,
        addressId: '1', // You would typically get this from user profile or selection
        deliveryPreferences: {
          placement: 'Front door',
          additionalInstructions: ''
        }
      });
      
      // Refresh subscriptions
      const subsResponse = await customerApi.getSubscriptions();
      setSubscriptions(subsResponse.subscriptions);
      setShowNewSubscription(false);
      setSelectedPublication('');
      setQuantity(1);
    } catch (err) {
      setError('Failed to create subscription. Please try again.');
    }
  };

  const handleCancelSubscription = async (id: string) => {
    try {
      await customerApi.cancelSubscription(id);
      // Refresh subscriptions
      const subsResponse = await customerApi.getSubscriptions();
      setSubscriptions(subsResponse.subscriptions);
    } catch (err) {
      setError('Failed to cancel subscription. Please try again.');
    }
  };

  const handlePauseSubscription = async (id: string) => {
    try {
      const today = new Date();
      const endDate = new Date();
      endDate.setDate(today.getDate() + 7); // Default 1 week pause

      await customerApi.requestPause({
        subscriptionId: id,
        startDate: today.toISOString().split('T')[0],
        endDate: endDate.toISOString().split('T')[0],
      });
      
      // Refresh subscriptions
      const subsResponse = await customerApi.getSubscriptions();
      setSubscriptions(subsResponse.subscriptions);
    } catch (err) {
      setError('Failed to pause subscription. Please try again.');
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
                    <option key={pub.id} value={pub.id}>
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
              <div className="flex gap-2 justify-end">
                <button
                  onClick={() => setShowNewSubscription(false)}
                  className="px-4 py-2 text-gray-600 hover:text-gray-800"
                >
                  Cancel
                </button>
                <button
                  onClick={handleCreateSubscription}
                  disabled={!selectedPublication}
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors disabled:bg-gray-400"
                >
                  Subscribe
                </button>
              </div>
            </div>
          </div>
        )}

        <div className="grid gap-6">
          {subscriptions.map((subscription) => (
            <div key={subscription.id} className="bg-white rounded-lg shadow-md p-6">
              <div className="flex justify-between items-start">
                <div className="flex gap-4">
                  <div className="p-3 bg-blue-100 rounded-lg">
                    <Newspaper className="text-blue-600" size={24} />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold">{subscription.publication.name}</h3>
                    <p className="text-gray-600">
                      {subscription.quantity} {subscription.quantity > 1 ? 'copies' : 'copy'} •{' '}
                      {subscription.publication.language}
                    </p>
                    <p className="text-sm text-gray-500 mt-1">
                      Delivers to: {subscription.address.streetAddress},{' '}
                      {subscription.address.city}
                    </p>
                    <p className="text-sm text-gray-500">
                      Deliverer: {subscription.deliverer.firstName}{' '}
                      {subscription.deliverer.lastName} • {subscription.deliverer.phone}
                    </p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => handlePauseSubscription(subscription.id)}
                    className="p-2 text-gray-600 hover:text-yellow-600 transition-colors"
                    title="Pause Delivery"
                  >
                    <PauseCircle size={20} />
                  </button>
                  <button
                    onClick={() => handleCancelSubscription(subscription.id)}
                    className="p-2 text-gray-600 hover:text-red-600 transition-colors"
                    title="Cancel Subscription"
                  >
                    <XCircle size={20} />
                  </button>
                </div>
              </div>
              <div className="mt-4 pt-4 border-t border-gray-100">
                <p className="text-sm text-gray-600">
                  Monthly cost: ₹{subscription.publication.price * subscription.quantity}
                </p>
                <p className="text-sm text-gray-600">
                  Status:{' '}
                  <span
                    className={`font-medium ${
                      subscription.status === 'active'
                        ? 'text-green-600'
                        : subscription.status === 'paused'
                        ? 'text-yellow-600'
                        : 'text-red-600'
                    }`}
                  >
                    {subscription.status.charAt(0).toUpperCase() + subscription.status.slice(1)}
                  </span>
                </p>
              </div>
            </div>
          ))}
        </div>

        {subscriptions.length === 0 && (
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