import { NavLink } from 'react-router-dom';
import { 
  Newspaper,
  Users,
  FileText,
  Map,
  Calendar,
  CreditCard,
  Settings,
  BarChart,
  GitPullRequest,
  GitGraph
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

const roleNavItems = {
  Customer: [
    { name: 'Dashboard', href: '/customer', icon: BarChart },
    { name: 'Subscriptions', href: '/customer/subscriptions', icon: Newspaper },
    { name: 'Bills', href: '/customer/bills', icon: FileText },
  ],
  Deliverer: [
    { name: 'Dashboard', href: '/deliverer', icon: BarChart },
    { name: 'Route', href: '/deliverer/route', icon: Map },
    { name: 'Schedule', href: '/deliverer/schedule', icon: Calendar },
    { name: 'Earnings', href: '/deliverer/earnings', icon: CreditCard },
  ],
  Manager: [
    { name: 'Dashboard', href: '/manager', icon: BarChart },
    { name: 'Customers', href: '/manager/customers', icon: Users },
    { name: 'Deliverers', href: '/manager/deliverers', icon: Users },
    { name: 'Publications', href: '/manager/publications', icon: Newspaper },
    { name: 'Bills', href: '/manager/bills', icon: FileText },
    { name: 'Reports', href: '/manager/reports', icon: BarChart },
    { name: 'Subscription-Request', href: '/manager/subscription-requests', icon: GitPullRequest },
    { name: 'Analytics', href: '/manager/analytics', icon: GitGraph },
  ],
};

export default function Sidebar() {
  const { user } = useAuth();
  const navItems = user?.role ? roleNavItems[user.role as keyof typeof roleNavItems] : [];

  return (
    <div className="flex h-full flex-col bg-white border-r border-gray-200">
      <div className="flex h-16 items-center gap-3 px-6 border-b border-gray-200">
        <div className="p-1.5 bg-blue-50 rounded-lg">
          <Newspaper className="h-7 w-7 text-blue-600" />
        </div>
        <span className="text-xl font-semibold bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent">
          NewsAgency
        </span>
      </div>

      <nav className="flex-1 space-y-0.5 px-3 py-">
        {navItems.map((item) => (
          <NavLink
            key={item.name}
            to={item.href}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-6 text-sm font-medium rounded-lg transition-all duration-200 ${
                isActive
                  ? 'bg-blue-50 text-blue-700 shadow-sm'
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
              }`
            }
          >
            <item.icon className="h-5 w-5 flex-shrink-0" />
            {item.name}
          </NavLink>
        ))}
      </nav>

      <div className="border-t border-gray-200 p-4 mx-3 mb-3 rounded-lg bg-gray-50">
        <div className="flex items-center gap-3">
          <div className="flex-shrink-0">
            <div className="h-10 w-10 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center">
              <Users className="h-5 w-5 text-white" />
            </div>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-900">
              {user?.firstName} {user?.lastName}
            </p>
            <p className="text-xs text-gray-500 mt-0.5">{user?.role}</p>
          </div>
        </div>
      </div>
    </div>
  );
}