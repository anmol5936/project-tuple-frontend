import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
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
  address?: {
    streetAddress: string;
    city: string;
    state: string;
    postalCode: string;
    deliveryInstructions?: string;
  };
  bankDetails?: {
    accountName: string;
    accountNumber: string;
    bankName: string;
    ifscCode: string;
  };
  commissionRate?: number;
}

export default function RegisterPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [isLoading, setIsLoading] = useState(false);
  const [showAreaFields, setShowAreaFields] = useState(false);
  const [isCustomerRole, setIsCustomerRole] = useState(false);
  const [isDelivererRole, setIsDelivererRole] = useState(false);
  const [postalCodes, setPostalCodes] = useState<string[]>([]);
  const [postalCodeInput, setPostalCodeInput] = useState('');

  const { register, handleSubmit, setValue, formState: { errors } } = useForm<RegisterFormData>();

  useEffect(() => {
    const role = searchParams.get('role');
    if (role) {
      const capitalizedRole = role.charAt(0).toUpperCase() + role.slice(1) as 'Customer' | 'Deliverer' | 'Manager';
      setValue('role', capitalizedRole);
      console.log('Role:', capitalizedRole);
      setShowAreaFields(true);
      setIsCustomerRole(capitalizedRole === 'Customer');
      setIsDelivererRole(capitalizedRole === 'Deliverer');
    } else {
      navigate('/');
    }
  }, [searchParams, setValue, navigate]);

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

      if (showAreaFields && data.area) {
        data.area.postalCodes = postalCodes;
      }

      // Remove address if not Customer role
      if (!isCustomerRole) {
        delete data.address;
      }

      // Remove bankDetails if not Deliverer role
      if (!isDelivererRole) {
        delete data.bankDetails;
        delete data.commissionRate;
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

            <input type="hidden" {...register('role')} />

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
                              ×
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {isCustomerRole && (
              <div className="space-y-4 border border-gray-200 rounded-md p-4">
                <h3 className="font-medium text-gray-900">Address Information</h3>

                <div>
                  <label htmlFor="streetAddress" className="block text-sm font-medium text-gray-700">
                    Street Address
                  </label>
                  <div className="mt-1">
                    <Input
                      id="streetAddress"
                      type="text"
                      {...register('address.streetAddress', {
                        required: isCustomerRole ? 'Street address is required' : false
                      })}
                      error={errors.address?.streetAddress?.message}
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="addressCity" className="block text-sm font-medium text-gray-700">
                    City
                  </label>
                  <div className="mt-1">
                    <Input
                      id="addressCity"
                      type="text"
                      {...register('address.city', {
                        required: isCustomerRole ? 'City is required' : false
                      })}
                      error={errors.address?.city?.message}
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="addressState" className="block text-sm font-medium text-gray-700">
                    State
                  </label>
                  <div className="mt-1">
                    <Input
                      id="addressState"
                      type="text"
                      {...register('address.state', {
                        required: isCustomerRole ? 'State is required' : false
                      })}
                      error={errors.address?.state?.message}
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="postalCode" className="block text-sm font-medium text-gray-700">
                    Postal Code
                  </label>
                  <div className="mt-1">
                    <Input
                      id="postalCode"
                      type="text"
                      {...register('address.postalCode', {
                        required: isCustomerRole ? 'Postal code is required' : false
                      })}
                      error={errors.address?.postalCode?.message}
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="deliveryInstructions" className="block text-sm font-medium text-gray-700">
                    Delivery Instructions (optional)
                  </label>
                  <div className="mt-1">
                    <Input
                      id="deliveryInstructions"
                      type="text"
                      {...register('address.deliveryInstructions')}
                      error={errors.address?.deliveryInstructions?.message}
                    />
                  </div>
                </div>
              </div>
            )}

            {isDelivererRole && (
              <div className="space-y-4 border border-gray-200 rounded-md p-4">
                <h3 className="font-medium text-gray-900">Bank Details</h3>

                <div>
                  <label htmlFor="accountName" className="block text-sm font-medium text-gray-700">
                    Account Name
                  </label>
                  <div className="mt-1">
                    <Input
                      id="accountName"
                      type="text"
                      {...register('bankDetails.accountName', {
                        required: isDelivererRole ? 'Account name is required' : false
                      })}
                      error={errors.bankDetails?.accountName?.message}
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="accountNumber" className="block text-sm font-medium text-gray-700">
                    Account Number
                  </label>
                  <div className="mt-1">
                    <Input
                      id="accountNumber"
                      type="text"
                      {...register('bankDetails.accountNumber', {
                        required: isDelivererRole ? 'Account number is required' : false
                      })}
                      error={errors.bankDetails?.accountNumber?.message}
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="bankName" className="block text-sm font-medium text-gray-700">
                    Bank Name
                  </label>
                  <div className="mt-1">
                    <Input
                      id="bankName"
                      type="text"
                      {...register('bankDetails.bankName', {
                        required: isDelivererRole ? 'Bank name is required' : false
                      })}
                      error={errors.bankDetails?.bankName?.message}
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="ifscCode" className="block text-sm font-medium text-gray-700">
                    IFSC Code
                  </label>
                  <div className="mt-1">
                    <Input
                      id="ifscCode"
                      type="text"
                      {...register('bankDetails.ifscCode', {
                        required: isDelivererRole ? 'IFSC code is required' : false
                      })}
                      error={errors.bankDetails?.ifscCode?.message}
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="commissionRate" className="block text-sm font-medium text-gray-700">
                    Commission Rate (%)
                  </label>
                  <div className="mt-1">
                    <Input
                      id="commissionRate"
                      type="number"
                      step="0.1"
                      defaultValue="2.5"
                      {...register('commissionRate', {
                        valueAsNumber: true
                      })}
                      error={errors.commissionRate?.message}
                    />
                  </div>
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