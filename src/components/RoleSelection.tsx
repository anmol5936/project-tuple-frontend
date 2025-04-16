import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Newspaper, Users, Truck, UserCog } from 'lucide-react';

function RoleSelection() {
  const navigate = useNavigate();
  const [selectedRole, setSelectedRole] = useState<'Customer' | 'Deliverer' | 'Manager'>('Customer');

  const roleConfig = {
    Customer: {
      icon: Users,
      color: 'text-emerald-600',
      bgColor: 'bg-emerald-50',
      borderColor: 'border-emerald-200',
      description: 'Subscribe to newspapers and magazines for home delivery'
    },
    Deliverer: {
      icon: Truck, 
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
      borderColor: 'border-blue-200',
      description: 'Manage your delivery routes and track deliveries'
    },
    Manager: {
      icon: UserCog,
      color: 'text-violet-600',
      bgColor: 'bg-violet-50',
      borderColor: 'border-violet-200',
      description: 'Oversee operations and manage subscriptions'
    }
  };

  const handleContinue = () => {
    navigate(`/login?role=${selectedRole.toLowerCase()}`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center">
          <div className="bg-white p-3 rounded-xl shadow-md">
            <Newspaper className="h-12 w-12 text-blue-600" />
          </div>
        </div>
        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
          Welcome to NewsDelivery
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600 max-w-sm mx-auto">
          Choose your role below to access personalized features and services
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow-lg sm:rounded-xl sm:px-10 border border-gray-100">
          <div className="space-y-4">
            {(Object.keys(roleConfig) as Array<keyof typeof roleConfig>).map((role) => {
              const { icon: Icon, color, bgColor, borderColor, description } = roleConfig[role];
              return (
                <button
                  key={role}
                  onClick={() => setSelectedRole(role)}
                  className={`w-full p-4 rounded-xl border-2 transition-all duration-200 transform hover:scale-[1.02] ${
                    selectedRole === role 
                      ? `${borderColor} ${bgColor} shadow-sm` 
                      : 'border-gray-100 hover:border-gray-200 hover:bg-gray-50'
                  }`}
                >
                  <div className="flex items-center">
                    <div className={`p-2 rounded-lg ${selectedRole === role ? bgColor : 'bg-gray-100'}`}>
                      <Icon className={`h-6 w-6 ${color}`} />
                    </div>
                    <div className="ml-4 text-left">
                      <p className={`text-sm font-semibold ${selectedRole === role ? color : 'text-gray-900'}`}>
                        {role}
                      </p>
                      <p className="text-sm text-gray-500 mt-0.5">{description}</p>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>

          <div className="mt-8">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-200" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-3 bg-white text-gray-500 font-medium">
                  Continue as {selectedRole}
                </span>
              </div>
            </div>
          </div>

          <div className="mt-6 space-y-4">
            <button
              onClick={handleContinue}
              className="w-full flex justify-center py-3 px-4 border border-transparent rounded-xl shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-200 transform hover:scale-[1.02]"
            >
              Continue to Login
            </button>
            <button
              onClick={() => navigate(`/register?role=${selectedRole.toLowerCase()}`)}
              className="w-full flex justify-center py-3 px-4 border-2 border-blue-600 rounded-xl text-sm font-medium text-blue-600 bg-white hover:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-200 transform hover:scale-[1.02]"
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