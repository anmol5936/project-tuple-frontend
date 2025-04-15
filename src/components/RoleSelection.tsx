import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Newspaper, Users, Truck, UserCog } from 'lucide-react';

function RoleSelection() {
  const navigate = useNavigate();
  const [selectedRole, setSelectedRole] = useState<'Customer' | 'Deliverer' | 'Manager'>('Customer');

  const roleConfig = {
    Customer: {
      icon: Users,
      color: 'text-green-600',
      bgColor: 'bg-green-100',
      description: 'Subscribe to newspapers and magazines for home delivery'
    },
    Deliverer: {
      icon: Truck, 
      color: 'text-blue-600',
      bgColor: 'bg-blue-100',
      description: 'Manage your delivery routes and track deliveries'
    },
    Manager: {
      icon: UserCog,
      color: 'text-purple-600',
      bgColor: 'bg-purple-100',
      description: 'Oversee operations and manage subscriptions'
    }
  };

  const handleContinue = () => {
    navigate(`/login?role=${selectedRole.toLowerCase()}`);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center">
          <Newspaper className="h-12 w-12 text-blue-600" />
        </div>
        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
          Welcome to NewsDelivery
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          Please select your role to continue
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          <div className="space-y-4">
            {(Object.keys(roleConfig) as Array<keyof typeof roleConfig>).map((role) => {
              const { icon: Icon, color, bgColor, description } = roleConfig[role];
              return (
                <button
                  key={role}
                  onClick={() => setSelectedRole(role)}
                  className={`w-full p-4 rounded-lg border-2 transition-all ${
                    selectedRole === role 
                      ? `border-${color.split('-')[1]}-600 ${bgColor}` 
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-center">
                    <Icon className={`h-6 w-6 ${color}`} />
                    <div className="ml-3 text-left">
                      <p className="text-sm font-medium text-gray-900">{role}</p>
                      <p className="text-sm text-gray-500">{description}</p>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>

          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">
                  Continue as {selectedRole}
                </span>
              </div>
            </div>
          </div>

          <div className="mt-6 space-y-4">
            <button
              onClick={handleContinue}
              className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
            >
              Continue to Login
            </button>
            <button
              onClick={() => navigate(`/register?role=${selectedRole.toLowerCase()}`)}
              className="w-full flex justify-center py-3 px-4 border-2 border-blue-600 rounded-md shadow-sm text-sm font-medium text-blue-600 bg-white hover:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
            >
              Create New Account
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default RoleSelection;