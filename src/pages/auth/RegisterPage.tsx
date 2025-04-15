import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Link, useNavigate } from 'react-router-dom';
import { Newspaper } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { authApi } from '../../lib/api';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';

interface RegisterFormData {
  username: string;
  password: string;
  email: string;
  firstName: string;
  lastName: string;
  role: 'Customer' | 'Deliverer' | 'Manager';
  phone?: string;
  area?: {
    name: string;
    city: string;
    state: string;
    postalCodes?: string[];
  };
}

export default function RegisterPage() {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [showAreaFields, setShowAreaFields] = useState(false);
  const [postalCodes, setPostalCodes] = useState<string[]>([]);
  const [postalCodeInput, setPostalCodeInput] = useState('');
  const { register, handleSubmit, watch, formState: { errors } } = useForm<RegisterFormData>();
  
  const selectedRole = watch('role');
  
  // Show area fields for Deliverer and Manager roles
  useState(() => {
    if (selectedRole === 'Deliverer' || selectedRole === 'Manager' || selectedRole === 'Customer') {
      setShowAreaFields(true);
    } else {
      setShowAreaFields(false);
    }
  });

  const addPostalCode = () => {
    if (postalCodeInput.trim()) {
      setPostalCodes([...postalCodes, postalCodeInput.trim()]);
      setPostalCodeInput('');
    }
  };

  const removePostalCode = (index: number) => {
    const updatedCodes = [...postalCodes];
    updatedCodes.splice(index, 1);
    setPostalCodes(updatedCodes);
  };

  const onSubmit = async (data: RegisterFormData) => {
    try {
      setIsLoading(true);
      
      // Add postal codes to the form data if area is present
      if (showAreaFields && data.area) {
        data.area.postalCodes = postalCodes;
      }
      
      await authApi.register(data);
      toast.success('Registration successful! Please login.');
      navigate('/login');
    } catch (error) {
      console.error('Registration failed:', error);
      toast.error('Registration failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center">
          <Newspaper className="h-12 w-12 text-blue-600" />
        </div>
        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
          Create your account
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          Already have an account?{' '}
          <Link to="/login" className="font-medium text-blue-600 hover:text-blue-500">
            Sign in
          </Link>
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="firstName" className="block text-sm font-medium text-gray-700">
                  First Name
                </label>
                <div className="mt-1">
                  <Input
                    id="firstName"
                    type="text"
                    {...register('firstName', { required: 'First name is required' })}
                    error={errors.firstName?.message}
                  />
                </div>
              </div>

              <div>
                <label htmlFor="lastName" className="block text-sm font-medium text-gray-700">
                  Last Name
                </label>
                <div className="mt-1">
                  <Input
                    id="lastName"
                    type="text"
                    {...register('lastName', { required: 'Last name is required' })}
                    error={errors.lastName?.message}
                  />
                </div>
              </div>
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                Email
              </label>
              <div className="mt-1">
                <Input
                  id="email"
                  type="email"
                  {...register('email', { 
                    required: 'Email is required',
                    pattern: {
                      value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                      message: 'Invalid email address'
                    }
                  })}
                  error={errors.email?.message}
                />
              </div>
            </div>

            <div>
              <label htmlFor="username" className="block text-sm font-medium text-gray-700">
                Username
              </label>
              <div className="mt-1">
                <Input
                  id="username"
                  type="text"
                  {...register('username', { required: 'Username is required' })}
                  error={errors.username?.message}
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                Password
              </label>
              <div className="mt-1">
                <Input
                  id="password"
                  type="password"
                  {...register('password', { 
                    required: 'Password is required',
                    minLength: {
                      value: 8,
                      message: 'Password must be at least 8 characters'
                    }
                  })}
                  error={errors.password?.message}
                />
              </div>
            </div>

            <div>
              <label htmlFor="role" className="block text-sm font-medium text-gray-700">
                Role
              </label>
              <div className="mt-1">
                <select
                  id="role"
                  className="block w-full rounded-md border border-gray-300 bg-white py-2 px-3 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500 sm:text-sm"
                  {...register('role', { required: 'Role is required' })}
                  onChange={(e) => {
                    const value = e.target.value as 'Customer' | 'Deliverer' | 'Manager';
                    setShowAreaFields(value === 'Deliverer' || value === 'Manager' || value === 'Customer');
                  }}
                >
                  <option value="Customer">Customer</option>
                  <option value="Deliverer">Deliverer</option>
                  <option value="Manager">Manager</option>
                </select>
                {errors.role && (
                  <p className="mt-1 text-sm text-red-500">{errors.role.message}</p>
                )}
              </div>
            </div>

            <div>
              <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
                Phone (optional)
              </label>
              <div className="mt-1">
                <Input
                  id="phone"
                  type="tel"
                  {...register('phone')}
                  error={errors.phone?.message}
                />
              </div>
            </div>

            {showAreaFields && (
              <div className="space-y-4 border border-gray-200 rounded-md p-4">
                <h3 className="font-medium text-gray-900">Area Information</h3>
                
                <div>
                  <label htmlFor="areaName" className="block text-sm font-medium text-gray-700">
                    Area Name
                  </label>
                  <div className="mt-1">
                    <Input
                      id="areaName"
                      type="text"
                      {...register('area.name', { required: showAreaFields ? 'Area name is required' : false })}
                      error={errors.area?.name?.message}
                    />
                  </div>
                </div>
                
                <div>
                  <label htmlFor="areaCity" className="block text-sm font-medium text-gray-700">
                    City
                  </label>
                  <div className="mt-1">
                    <Input
                      id="areaCity"
                      type="text"
                      {...register('area.city', { required: showAreaFields ? 'City is required' : false })}
                      error={errors.area?.city?.message}
                    />
                  </div>
                </div>
                
                <div>
                  <label htmlFor="areaState" className="block text-sm font-medium text-gray-700">
                    State
                  </label>
                  <div className="mt-1">
                    <Input
                      id="areaState"
                      type="text"
                      {...register('area.state', { required: showAreaFields ? 'State is required' : false })}
                      error={errors.area?.state?.message}
                    />
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Postal Codes
                  </label>
                  <div className="mt-1 flex">
                    <Input
                      type="text"
                      value={postalCodeInput}
                      onChange={(e) => setPostalCodeInput(e.target.value)}
                      placeholder="Add postal code"
                      className="flex-grow"
                    />
                    <Button
                      type="button"
                      onClick={addPostalCode}
                      className="ml-2"
                      variant="outline"
                    >
                      Add
                    </Button>
                  </div>
                  
                  {postalCodes.length > 0 && (
                    <div className="mt-2">
                      <div className="flex flex-wrap gap-2">
                        {postalCodes.map((code, index) => (
                          <div key={index} className="bg-blue-100 text-blue-800 text-sm rounded-full px-3 py-1 flex items-center">
                            {code}
                            <button
                              type="button"
                              onClick={() => removePostalCode(index)}
                              className="ml-1 text-blue-600 hover:text-blue-800"
                            >
                              &times;
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            <div>
              <Button type="submit" className="w-full" isLoading={isLoading}>
                Create account
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}