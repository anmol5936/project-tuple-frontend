import { useQuery } from '@tanstack/react-query';
import { Calendar, Clock, MapPin, AlertCircle } from 'lucide-react';
import { delivererApi } from '../../lib/api';

type Schedule = {
  _id: string;
  date: string;
  status: string;
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
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <p className="text-xl font-semibold text-red-500">
            Failed to load schedule. Please try again later.
          </p>
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

  if (!schedule) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-xl font-medium text-gray-900">No Schedule Found</h3>
          <p className="text-gray-600 mt-2">There is no delivery schedule available for today.</p>
        </div>
      </div>
    );
  }

  const statusColors = {
    Pending: 'bg-yellow-100 text-yellow-800',
    'In Progress': 'bg-blue-100 text-blue-800',
    Completed: 'bg-green-100 text-green-800',
    Cancelled: 'bg-red-100 text-red-800',
  };

  const statusColor = statusColors[schedule.status as keyof typeof statusColors] || 'bg-gray-100 text-gray-800';

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Today's Schedule</h1>
          <p className="text-gray-600 mt-2">Delivery schedule and route information</p>
        </div>

        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="p-6">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center">
                <Calendar className="w-6 h-6 text-blue-500 mr-2" />
                <span className="text-lg font-medium">
                  {new Date(schedule.date).toLocaleDateString('en-US', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })}
                </span>
              </div>
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${statusColor}`}>
                {schedule.status}
              </span>
            </div>

            <div className="border-t border-gray-100 pt-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h2 className="text-lg font-semibold text-gray-900 mb-4">Route Details</h2>
                  <div className="space-y-3">
                    <div>
                      <label className="text-sm font-medium text-gray-600">Route Name</label>
                      <p className="mt-1 text-gray-900">{schedule.routeId?.routeName || 'N/A'}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-600">Description</label>
                      <p className="mt-1 text-gray-900">
                        {schedule.routeId?.routeDescription || 'N/A'}
                      </p>
                    </div>
                  </div>
                </div>

                <div>
                  <h2 className="text-lg font-semibold text-gray-900 mb-4">Area Information</h2>
                  <div className="space-y-3">
                    <div>
                      <label className="text-sm font-medium text-gray-600">Area Name</label>
                      <p className="mt-1 text-gray-900">{schedule.areaId?.name || 'N/A'}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-600">Location</label>
                      <div className="mt-1 flex items-center text-gray-900">
                        <MapPin className="w-4 h-4 text-gray-400 mr-1" />
                        <span>
                          {schedule.areaId?.city && schedule.areaId?.state
                            ? `${schedule.areaId.city}, ${schedule.areaId.state}`
                            : 'N/A'}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-gray-50 px-6 py-4">
            <div className="flex items-center text-sm text-gray-600">
              <Clock className="w-4 h-4 mr-2" />
              <span>
                Last updated: {new Date(schedule.updatedAt).toLocaleTimeString()}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Schedule;
