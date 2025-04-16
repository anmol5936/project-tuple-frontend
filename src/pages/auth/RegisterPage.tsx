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

      if (!isCustomerRole) {
        delete data.address;
      }

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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50">
      <div className="absolute inset-0 z-0 bg-[radial-gradient(circle_500px_at_50%_200px,#e3f2fd,transparent)]" />
      
      <div className="relative py-12 px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl">
          <div className="text-center">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-xl bg-blue-100">
              <Newspaper className="h-8 w-8 text-blue-600" />
            </div>
            <h2 className="mt-6 text-3xl font-bold tracking-tight text-gray-900">
              Create your account
            </h2>
            <p className="mt-2 text-sm text-gray-600">
              Already have an account?{' '}
              <Link to="/login" className="font-medium text-blue-600 hover:text-blue-500 transition-colors">
                Sign in
              </Link>
            </p>
          </div>

          <div className="mt-8">
            <div className="rounded-2xl bg-white/80 backdrop-blur-xl shadow-xl ring-1 ring-gray-900/5">
              <div className="p-8">
                <form className="space-y-8" onSubmit={handleSubmit(onSubmit)}>
                  {/* Basic Information */}
                  <div className="space-y-6">
                    <h3 className="text-lg font-medium text-gray-900">Basic Information</h3>
                    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
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
                            className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
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
                            className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
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
                          className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
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
                          className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
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
                          className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
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
                          className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Area Information */}
                  {showAreaFields && (
                    <div className="space-y-6">
                      <div className="border border-gray-200 rounded-xl p-6 bg-gray-50/50">
                        <h3 className="text-lg font-medium text-gray-900 mb-6">Area Information</h3>
                        <div className="space-y-4">
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
                                className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
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
                                className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
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
                                className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
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
                                className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
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
                                    <div key={index} className="bg-blue-50 text-blue-700 text-sm rounded-full px-3 py-1 flex items-center">
                                      {code}
                                      <button
                                        type="button"
                                        onClick={() => removePostalCode(index)}
                                        className="ml-1.5 text-blue-600 hover:text-blue-800 transition-colors"
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
                      </div>
                    </div>
                  )}

                  {/* Customer Address */}
                  {isCustomerRole && (
                    <div className="space-y-6">
                      <div className="border border-gray-200 rounded-xl p-6 bg-gray-50/50">
                        <h3 className="text-lg font-medium text-gray-900 mb-6">Address Information</h3>
                        <div className="space-y-4">
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
                                className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                              />
                            </div>
                          </div>

                          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
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
                                  className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
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
                                  className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                />
                              </div>
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
                                className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
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
                                className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Deliverer Bank Details */}
                  {isDelivererRole && (
                    <div className="space-y-6">
                      <div className="border border-gray-200 rounded-xl p-6 bg-gray-50/50">
                        <h3 className="text-lg font-medium text-gray-900 mb-6">Bank Details</h3>
                        <div className="space-y-4">
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
                                className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
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
                                className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
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
                                className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
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
                                className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
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
                                className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  <div>
                    <Button
                      type="submit"
                      className="w-full bg-blue-600 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-blue-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 transition-colors duration-200"
                      isLoading={isLoading}
                    >
                      Create account
                    </Button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}