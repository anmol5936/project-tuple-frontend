import { NavLink } from 'react-router-dom';
import { 
  Newspaper,
  Users,
  FileText,
  Map,
  Calendar,
  CreditCard,
  Settings,
  BarChart
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

const roleNavItems = {
  Customer: [
    { name: 'Dashboard', href: '/customer', icon: BarChart },
    { name: 'Subscriptions', href: '/customer/subscriptions', icon: Newspaper },
    { name: 'Bills', href: '/customer/bills', icon: FileText },
    { name: 'Payment History', href: '/customer/payments', icon: CreditCard },
    { name: 'Settings', href: '/customer/settings', icon: Settings },
  ],
  Deliverer: [
    { name: 'Dashboard', href: '/deliverer', icon: BarChart },
    { name: 'Route', href: '/deliverer/route', icon: Map },
    { name: 'Schedule', href: '/deliverer/schedule', icon: Calendar },
    { name: 'Earnings', href: '/deliverer/earnings', icon: CreditCard },
    { name: 'Settings', href: '/deliverer/settings', icon: Settings },
  ],
  Manager: [
    { name: 'Dashboard', href: '/manager', icon: BarChart },
    { name: 'Customers', href: '/manager/customers', icon: Users },
    { name: 'Deliverers', href: '/manager/deliverers', icon: Users },
    { name: 'Publications', href: '/manager/publications', icon: Newspaper },
    { name: 'Bills', href: '/manager/bills', icon: FileText },
    { name: 'Reports', href: '/manager/reports', icon: BarChart },
    { name: 'Settings', href: '/manager/settings', icon: Settings },
  ],
};

export default function Sidebar() {
  const { user } = useAuth();
  const navItems = user?.role ? roleNavItems[user.role as keyof typeof roleNavItems] : [];

  return (
    <div className="flex h-full flex-col bg-white border-r border-gray-200">
      <div className="flex h-16 items-center gap-2 px-6 border-b border-gray-200">
        <Newspaper className="h-8 w-8 text-blue-600" />
        <span className="text-xl font-semibold text-gray-900">NewsAgency</span>
      </div>

      <nav className="flex-1 space-y-1 px-4 py-4">
        {navItems.map((item) => (
          <NavLink
            key={item.name}
            to={item.href}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                isActive
                  ? 'bg-blue-50 text-blue-700'
                  : 'text-gray-700 hover:bg-gray-50'
              }`
            }
          >
            <item.icon className="h-5 w-5 flex-shrink-0" />
            {item.name}
          </NavLink>
        ))}
      </nav>

      <div className="border-t border-gray-200 p-4">
        <div className="flex items-center gap-3">
          <div className="flex-shrink-0">
            <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center">
              <Users className="h-6 w-6 text-gray-500" />
            </div>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-700">
              {user?.firstName} {user?.lastName}
            </p>
            <p className="text-xs text-gray-500">{user?.role}</p>
          </div>
        </div>
      </div>
    </div>
  );
}