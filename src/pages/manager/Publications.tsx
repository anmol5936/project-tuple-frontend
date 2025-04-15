import React, { useEffect, useState } from 'react';
import { Newspaper, Loader2, MapPin, Plus, Edit2, X } from 'lucide-react';
import { managerApi } from '../../lib/api';
import { useAuth } from '../../contexts/AuthContext';

type Area = {
  id: string;
  name: string;
  city: string;
  state: string;
};

type Publication = {
  id: string;
  name: string;
  language: string;
  description: string;
  price: number;
  publicationType: string;
  publicationDays: string[];
  areas: Array<{
    id: string;
    name: string;
    city: string;
  }>;
};

type PublicationFormData = {
  name: string;
  language: string;
  description: string;
  price: number;
  publicationType: string;
  publicationDays: string[];
  areaId: string;
};

export function Publications() {
  const { user } = useAuth();
  const [areas, setAreas] = useState<Area[]>([]);
  const [publications, setPublications] = useState<Publication[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedArea, setSelectedArea] = useState<string>('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPublication, setEditingPublication] = useState<Publication | null>(null);
  const [formData, setFormData] = useState<PublicationFormData>({
    name: '',
    language: '',
    description: '',
    price: 0,
    publicationType: '',
    publicationDays: [],
    areaId: '',
  });
  const [formErrors, setFormErrors] = useState<Partial<PublicationFormData>>({});

  useEffect(() => {
    if (user) {
      fetchData();
    }
  }, [user]);

  const fetchData = async () => {
    try {
      // Set areas from token
      const userAreas = (user?.areas || []).map((area: any) => ({
        id: area._id,
        name: area.name,
        city: area.city,
        state: area.state,
      }));
      setAreas(userAreas);

      // Set default areaId if only one area exists
      if (userAreas.length === 1) {
        setFormData((prev) => ({ ...prev, areaId: userAreas[0].id }));
      }

      // Fetch publications
      const publicationsResponse = await managerApi.getPublications();
      setPublications(publicationsResponse.publications);

      console.log('Areas from token:', userAreas);
      console.log('Publications:', publicationsResponse.publications);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch publications. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const validateForm = (): boolean => {
    const errors: Partial<PublicationFormData> = {};

    if (!formData.name.trim()) {
      errors.name = 'Publication name is required';
    }
    if (!formData.language.trim()) {
      errors.language = 'Language is required';
    }
    if (!formData.publicationType) {
      errors.publicationType = 'Publication type is required';
    }
    if (formData.price <= 0) {
      errors.price = 'Price must be greater than 0';
    }
    if (formData.publicationDays.length === 0) {
      errors.publicationDays = 'At least one publication day is required';
    }
    if (!editingPublication && !formData.areaId) {
      errors.areaId = 'Area is required';
    }
    if (!editingPublication && formData.areaId && !areas.some((area) => area.id === formData.areaId)) {
      errors.areaId = 'Selected area is invalid';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setFormErrors({});

    if (!validateForm()) {
      return;
    }

    try {
      if (editingPublication) {
        // For updates, exclude areaId since backend expects areas array
        const { areaId, ...updateData } = formData;
        console.log("editingPublication", editingPublication);
        await managerApi.updatePublication(editingPublication._id, updateData);
      } else {
        console.log('Sending addPublication with data:', formData);
        await managerApi.addPublication(formData);
      }
      setIsModalOpen(false);
      setEditingPublication(null);
      resetForm();
      fetchData();
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Failed to save publication. Please try again.';
      setError(errorMessage);
      console.error('Add publication error:', err.response?.data);
    }
  };

  const handleEdit = (publication: Publication) => {
    setEditingPublication(publication);
    setFormData({
      name: publication.name,
      language: publication.language,
      description: publication.description,
      price: publication.price,
      publicationType: publication.publicationType,
      publicationDays: publication.publicationDays,
      areaId: publication.areas[0]?.id || '',
    });
    setIsModalOpen(true);
  };

  const resetForm = () => {
    setFormData({
      name: '',
      language: '',
      description: '',
      price: 0,
      publicationType: '',
      publicationDays: [],
      areaId: areas.length === 1 ? areas[0].id : '',
    });
    setFormErrors({});
  };

  const getPublications = () => {
    if (selectedArea === 'all') {
      return publications;
    }
    return publications.filter((pub) =>
      pub.areas.some((area) => area.id === selectedArea)
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
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

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <MapPin className="w-5 h-5 text-gray-500" />
              <select
                value={selectedArea}
                onChange={(e) => setSelectedArea(e.target.value)}
                className="block rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
              >
                <option value="all">All Areas</option>
                {areas.map((area) => (
                  <option key={area.id} value={area.id}>
                    {area.name} - {area.city}
                  </option>
                ))}
              </select>
            </div>

            <button
              onClick={() => {
                resetForm();
                setIsModalOpen(true);
              }}
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Publication
            </button>
          </div>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-md text-sm text-red-700">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {getPublications().map((publication) => (
            <div
              key={publication.id}
              className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    {publication.name}
                  </h3>
                  <div className="space-y-2">
                    <p className="text-sm text-gray-600">{publication.description || 'No description'}</p>
                    <p className="text-sm text-gray-600">
                      <span className="font-medium">Type:</span> {publication.publicationType}
                    </p>
                    <p className="text-sm text-gray-600">
                      <span className="font-medium">Language:</span> {publication.language}
                    </p>
                    <p className="text-sm text-gray-600">
                      <span className="font-medium">Days:</span>{' '}
                      {publication.publicationDays.join(', ')}
                    </p>
                    <p className="text-sm font-medium text-blue-600">
                      ₹{publication.price.toFixed(2)} per issue
                    </p>
                    <p className="text-sm text-gray-600">
                      <span className="font-medium">Areas:</span>{' '}
                      {publication.areas.map((area) => area.name).join(', ')}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => handleEdit(publication)}
                  className="p-2 text-gray-400 hover:text-blue-500"
                >
                  <Edit2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Publication Form Modal */}
        {isModalOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-lg max-w-2xl w-full p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold">
                  {editingPublication ? 'Edit Publication' : 'Add New Publication'}
                </h2>
                <button
                  onClick={() => {
                    setIsModalOpen(false);
                    setEditingPublication(null);
                    resetForm();
                  }}
                  className="text-gray-400 hover:text-gray-500"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Name</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm ${
                      formErrors.name ? 'border-red-500' : ''
                    }`}
                    required
                  />
                  {formErrors.name && (
                    <p className="mt-1 text-sm text-red-600">{formErrors.name}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Language</label>
                  <input
                    type="text"
                    value={formData.language}
                    onChange={(e) => setFormData({ ...formData, language: e.target.value })}
                    className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm ${
                      formErrors.language ? 'border-red-500' : ''
                    }`}
                    required
                  />
                  {formErrors.language && (
                    <p className="mt-1 text-sm text-red-600">{formErrors.language}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Description</label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                    rows={3}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Price</label>
                  <input
                    type="number"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: Number(e.target.value) })}
                    className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm ${
                      formErrors.price ? 'border-red-500' : ''
                    }`}
                    required
                    min="0.01"
                    step="0.01"
                  />
                  {formErrors.price && (
                    <p className="mt-1 text-sm text-red-600">{formErrors.price}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Publication Type</label>
                  <select
                    value={formData.publicationType}
                    onChange={(e) => setFormData({ ...formData, publicationType: e.target.value })}
                    className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm ${
                      formErrors.publicationType ? 'border-red-500' : ''
                    }`}
                    required
                  >
                    <option value="">Select type</option>
                    <option value="Daily">Daily</option>
                    <option value="Weekly">Weekly</option>
                    <option value="Monthly">Monthly</option>
                    <option value="Quarterly">Quarterly</option>
                  </select>
                  {formErrors.publicationType && (
                    <p className="mt-1 text-sm text-red-600">{formErrors.publicationType}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Publication Days</label>
                  <div className="mt-2 grid grid-cols-2 gap-2">
                    {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].map(
                      (day) => (
                        <label key={day} className="inline-flex items-center">
                          <input
                            type="checkbox"
                            checked={formData.publicationDays.includes(day)}
                            onChange={(e) => {
                              const days = e.target.checked
                                ? [...formData.publicationDays, day]
                                : formData.publicationDays.filter((d) => d !== day);
                              setFormData({ ...formData, publicationDays: days });
                            }}
                            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                          />
                          <span className="ml-2 text-sm text-gray-600">{day}</span>
                        </label>
                      )
                    )}
                  </div>
                  {formErrors.publicationDays && (
                    <p className="mt-1 text-sm text-red-600">{formErrors.publicationDays}</p>
                  )}
                </div>

                {!editingPublication && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Area</label>
                    <select
                      value={formData.areaId}
                      onChange={(e) => setFormData({ ...formData, areaId: e.target.value })}
                      className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm ${
                        formErrors.areaId ? 'border-red-500' : ''
                      }`}
                      required
                    >
                      <option value="">Select area</option>
                      {areas.map((area) => (
                        <option key={area.id} value={area.id}>
                          {area.name} - {area.city}
                        </option>
                      ))}
                    </select>
                    {formErrors.areaId && (
                      <p className="mt-1 text-sm text-red-600">{formErrors.areaId}</p>
                    )}
                  </div>
                )}

                <div className="flex justify-end gap-3 mt-6">
                  <button
                    type="button"
                    onClick={() => {
                      setIsModalOpen(false);
                      setEditingPublication(null);
                      resetForm();
                    }}
                    className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
                  >
                    {editingPublication ? 'Update' : 'Create'} Publication
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {getPublications().length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">
              No publications available{selectedArea !== 'all' ? ' for the selected area' : ''}.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

export default Publications;