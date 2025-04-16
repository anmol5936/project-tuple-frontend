import { useQuery } from '@tanstack/react-query';
import { MapPin, Route as RouteIcon, Loader2 } from 'lucide-react';
import { delivererApi } from '../../lib/api';

type Route = {
  _id: string;
  routeName: string;
  routeDescription: string;
  areaId: {
    name: string;
    city: string;
    state: string;
  };
};

function DelivererRoutes() {
  const { data, isLoading, error } = useQuery({
    queryKey: ['routes'],
    queryFn: delivererApi.getRoutes,
  });

  const routes: Route[] = data?.routes || [];

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-red-500 text-center">
          <p className="text-xl font-semibold">Failed to load routes. Please try again later.</p>
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
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center mb-8">
          <RouteIcon className="w-8 h-8 text-blue-500 mr-3" />
          <h1 className="text-3xl font-bold text-gray-900">Delivery Routes</h1>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {routes.map((route) => (
            <div
              key={route._id}
              className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow"
            >
              <div className="flex items-start justify-between">
                <div>
                  <h2 className="text-xl font-semibold text-gray-900">{route.routeName}</h2>
                  <p className="text-gray-600 mt-2">{route.routeDescription}</p>
                </div>
                <MapPin className="w-6 h-6 text-blue-500 flex-shrink-0" />
              </div>

              <div className="mt-4 pt-4 border-t border-gray-100">
                <div className="flex items-center text-gray-600">
                  <span className="font-medium">Area:</span>
                  <span className="ml-2">{route.areaId?.name || 'N/A'}</span>
                </div>
                <div className="flex items-center text-gray-600 mt-1">
                  <span className="font-medium">Location:</span>
                  <span className="ml-2">
                    {route.areaId?.city && route.areaId?.state
                      ? `${route.areaId.city}, ${route.areaId.state}`
                      : 'N/A'}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {routes.length === 0 && (
          <div className="text-center py-12">
            <RouteIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-medium text-gray-900">No Routes Found</h3>
            <p className="text-gray-600 mt-2">There are currently no delivery routes assigned.</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default DelivererRoutes;