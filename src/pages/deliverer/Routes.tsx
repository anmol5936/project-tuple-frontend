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
        <div className="text-center">
          <Loader2 className="w-10 h-10 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600 font-medium">Loading routes...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-red-50 rounded-lg p-6 max-w-md w-full text-center shadow-sm">
          <div className="w-12 h-12 rounded-full bg-red-100 mx-auto mb-4 flex items-center justify-center">
            <RouteIcon className="w-6 h-6 text-red-600" />
          </div>
          <h2 className="text-xl font-semibold text-red-900 mb-2">Failed to Load Routes</h2>
          <p className="text-red-600 mb-6">Please try again later.</p>
          <button
            onClick={() => window.location.reload()}
            className="px-6 py-2.5 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors duration-200 font-medium shadow-sm hover:shadow focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-between mb-8 border-b border-gray-200 pb-6">
          <div className="flex items-center">
            <div className="bg-blue-100 rounded-lg p-3 mr-4">
              <RouteIcon className="w-8 h-8 text-blue-600" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Delivery Routes</h1>
              <p className="text-gray-600 mt-1">Manage and view all available delivery routes</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {routes.map((route) => (
            <div
              key={route._id}
              className="bg-white rounded-lg shadow-sm hover:shadow-md transition-all duration-200 transform hover:-translate-y-1 overflow-hidden"
            >
              <div className="h-2 bg-gradient-to-r from-blue-500 to-blue-600" />
              <div className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h2 className="text-xl font-semibold text-gray-900 line-clamp-1">{route.routeName}</h2>
                    <p className="text-gray-600 mt-2 text-sm line-clamp-2">{route.routeDescription}</p>
                  </div>
                  <div className="bg-blue-50 rounded-lg p-2 ml-4 flex-shrink-0">
                    <MapPin className="w-6 h-6 text-blue-600" />
                  </div>
                </div>

                <div className="mt-6 pt-4 border-t border-gray-100 space-y-3">
                  <div className="flex items-center text-gray-600">
                    <span className="text-sm font-medium w-20">Area</span>
                    <span className="text-sm ml-2 flex-1">{route.areaId?.name || 'N/A'}</span>
                  </div>
                  <div className="flex items-center text-gray-600">
                    <span className="text-sm font-medium w-20">Location</span>
                    <span className="text-sm ml-2 flex-1">
                      {route.areaId?.city && route.areaId?.state
                        ? `${route.areaId.city}, ${route.areaId.state}`
                        : 'N/A'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {routes.length === 0 && (
          <div className="bg-white rounded-lg shadow-sm p-12 text-center max-w-lg mx-auto mt-8">
            <div className="bg-gray-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-6">
              <RouteIcon className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No Routes Found</h3>
            <p className="text-gray-600">There are currently no delivery routes assigned to you.</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default DelivererRoutes;