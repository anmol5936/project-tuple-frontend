import { useQuery } from '@tanstack/react-query';
import { Calendar, Clock, MapPin, AlertCircle, Loader2,RouteIcon } from 'lucide-react';
import { delivererApi } from '../../lib/api';

type Schedule = {
  _id: string;
  date: string;
  status: string;
  updatedAt: string;
  routeId: {
    routeName: string;
    routeDescription: string;
  };
  areaId: {
    name: string;
    city: string;
    state: string;
  };
};

function Schedule() {
  const { data, isLoading, error } = useQuery({
    queryKey: ['schedule'],
    queryFn: delivererApi.getSchedule,
  });

  const schedule: Schedule | null = data?.schedule || null;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-10 h-10 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600 font-medium">Loading schedule...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-red-50 rounded-lg p-8 max-w-md w-full text-center shadow-sm">
          <div className="w-16 h-16 rounded-full bg-red-100 mx-auto mb-4 flex items-center justify-center">
            <AlertCircle className="w-8 h-8 text-red-600" />
          </div>
          <h2 className="text-2xl font-semibold text-red-900 mb-2">Failed to Load Schedule</h2>
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

  if (!schedule) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-sm p-12 text-center max-w-lg mx-auto">
          <div className="bg-gray-100 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-6">
            <Calendar className="w-10 h-10 text-gray-400" />
          </div>
          <h3 className="text-2xl font-semibold text-gray-900 mb-3">No Schedule Found</h3>
          <p className="text-gray-600">There is no delivery schedule available for today.</p>
        </div>
      </div>
    );
  }

  const statusConfig = {
    Pending: {
      color: 'bg-yellow-100 text-yellow-800',
      gradient: 'from-yellow-500 to-yellow-600',
    },
    'In Progress': {
      color: 'bg-blue-100 text-blue-800',
      gradient: 'from-blue-500 to-blue-600',
    },
    Completed: {
      color: 'bg-green-100 text-green-800',
      gradient: 'from-green-500 to-green-600',
    },
    Cancelled: {
      color: 'bg-red-100 text-red-800',
      gradient: 'from-red-500 to-red-600',
    },
  };

  const status = schedule.status as keyof typeof statusConfig;
  const { color: statusColor, gradient: statusGradient } = 
    statusConfig[status] || { color: 'bg-gray-100 text-gray-800', gradient: 'from-gray-500 to-gray-600' };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-between mb-8 border-b border-gray-200 pb-6">
          <div className="flex items-center">
            <div className="bg-blue-100 rounded-lg p-3 mr-4">
              <Calendar className="w-8 h-8 text-blue-600" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Today's Schedule</h1>
              <p className="text-gray-600 mt-1">Delivery schedule and route information</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          <div className="h-2 bg-gradient-to-r ${statusGradient}" />
          <div className="p-8">
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center space-x-4">
                <Calendar className="w-6 h-6 text-blue-600" />
                <span className="text-lg font-medium text-gray-900">
                  {new Date(schedule.date).toLocaleDateString('en-US', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })}
                </span>
              </div>
              <span className={`px-4 py-1.5 rounded-full text-sm font-medium ${statusColor}`}>
                {schedule.status}
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="bg-gray-50 rounded-lg p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <RouteIcon className="w-5 h-5 text-blue-600 mr-2" />
                  Route Details
                </h2>
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-gray-600 block mb-1">Route Name</label>
                    <p className="text-gray-900">{schedule.routeId?.routeName || 'N/A'}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600 block mb-1">Description</label>
                    <p className="text-gray-900">{schedule.routeId?.routeDescription || 'N/A'}</p>
                  </div>
                </div>
              </div>

              <div className="bg-gray-50 rounded-lg p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <MapPin className="w-5 h-5 text-blue-600 mr-2" />
                  Area Information
                </h2>
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-gray-600 block mb-1">Area Name</label>
                    <p className="text-gray-900">{schedule.areaId?.name || 'N/A'}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600 block mb-1">Location</label>
                    <p className="text-gray-900 flex items-center">
                      <MapPin className="w-4 h-4 text-gray-400 mr-2" />
                      {schedule.areaId?.city && schedule.areaId?.state
                        ? `${schedule.areaId.city}, ${schedule.areaId.state}`
                        : 'N/A'}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-gray-50 px-8 py-4 border-t border-gray-100">
            <div className="flex items-center text-sm text-gray-600">
              <Clock className="w-4 h-4 mr-2" />
              <span>Last updated: {new Date(schedule.updatedAt).toLocaleTimeString()}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Schedule;