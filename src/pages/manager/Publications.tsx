import React, { useEffect, useState } from 'react';
import { Newspaper, Loader2, Users, MapPin } from 'lucide-react';
import { managerApi } from '../../lib/api';

type Area = {
  id: string;
  name: string;
  city: string;
  state: string;
  postalCodes: string[];
  publications: Publication[];
};

type Publication = {
  name: string;
  language: string;
  price: number;
  publicationType: string;
};

export function  Publications() {
  const [areas, setAreas] = useState<Area[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedArea, setSelectedArea] = useState<string>('all');

  useEffect(() => {
    const fetchAreas = async () => {
      try {
        const { areas } = await managerApi.getAreas();
        setAreas(areas);
      } catch (err) {
        setError('Failed to fetch publications. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchAreas();
  }, []);

  const getPublications = () => {
    if (selectedArea === 'all') {
      const allPublications = areas.flatMap(area => area.publications);
      return Array.from(
        new Map(allPublications.map(pub => [pub.name, pub])).values()
      );
    }
    return areas.find(area => area.id === selectedArea)?.publications || [];
  };

  const publications = getPublications();

  if (loading) {
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
          <p className="text-xl font-semibold">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-8 gap-4">
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
            <Newspaper className="w-8 h-8 text-blue-500" />
            Publications
          </h1>
          
          <div className="flex items-center gap-2">
            <MapPin className="w-5 h-5 text-gray-500" />
            <select
              value={selectedArea}
              onChange={(e) => setSelectedArea(e.target.value)}
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
            >
              <option value="all">All Areas</option>
              {areas.map((area) => (
                <option key={area.id} value={area.id}>
                  {area.name} - {area.city}, {area.state}
                </option>
              ))}
            </select>
          </div>
        </div>

        {selectedArea !== 'all' && (
          <div className="mb-6 bg-white rounded-lg shadow-sm p-4">
            <div className="flex items-center gap-2 text-gray-600">
              <Users className="w-5 h-5" />
              <span className="font-medium">
                Deliverers in {areas.find(a => a.id === selectedArea)?.name}:
              </span>
              <span>
                {areas.find(a => a.id === selectedArea)?.deliverers.length || 0}
              </span>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {publications.map((publication) => (
            <div
              key={publication.name}
              className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow"
            >
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    {publication.name}
                  </h3>
                  <div className="space-y-2">
                    <p className="text-sm text-gray-600">
                      <span className="font-medium">Type:</span>{' '}
                      {publication.publicationType}
                    </p>
                    <p className="text-sm text-gray-600">
                      <span className="font-medium">Language:</span>{' '}
                      {publication.language}
                    </p>
                    <p className="text-sm font-medium text-blue-600">
                      ₹{publication.price.toFixed(2)} per issue
                    </p>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {publications.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">
              No publications available for the selected area.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}