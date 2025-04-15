import { ReactNode, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Menu,
  X,
  LogOut,
  User,
  Bell
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { Button } from '../ui/Button';
import Sidebar from './Sidebar';

interface DashboardLayoutProps {
  children: ReactNode;
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  const handleProfileClick = () => {
    navigate('/profile');
  };

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Mobile sidebar */}
      <div className="lg:hidden">
        {sidebarOpen && (
          <div className="fixed inset-0 z-40 flex">
            <div className="fixed inset-0 bg-gray-600 bg-opacity-75" onClick={() => setSidebarOpen(false)} />
            <div className="relative flex w-full max-w-xs flex-1 flex-col bg-white">
              <div className="absolute top-0 right-0 -mr-12 pt-2">
                <button
                  type="button"
                  className="ml-1 flex h-10 w-10 items-center justify-center rounded-full focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white"
                  onClick={() => setSidebarOpen(false)}
                >
                  <span className="sr-only">Close sidebar</span>
                  <X className="h-6 w-6 text-white" />
                </button>
              </div>
              <Sidebar />
            </div>
          </div>
        )}
      </div>

      {/* Static sidebar for desktop */}
      <div className="hidden lg:fixed lg:inset-y-0 lg:flex lg:w-64 lg:flex-col">
        <Sidebar />
      </div>

      {/* Main content */}
      <div className="lg:pl-64 flex flex-col min-h-screen">
        {/* Top navigation */}
        <div className="sticky top-0 z-10 bg-white shadow">
          <div className="flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8">
            <button
              type="button"
              className="lg:hidden -m-2.5 p-2.5 text-gray-700"
              onClick={() => setSidebarOpen(true)}
            >
              <span className="sr-only">Open sidebar</span>
              <Menu className="h-6 w-6" />
            </button>

            <div className="flex items-center gap-4">
              <button className="p-2 text-gray-500 hover:text-gray-700">
                <Bell className="h-6 w-6" />
              </button>
              
              <div className="relative">
                <button 
                  className="flex items-center gap-2 text-sm"
                  onClick={handleProfileClick} // Add click handler
                >
                  <div className="h-8 w-8 rounded-full bg-gray-200 flex items-center justify-center">
                    <User className="h-5 w-5 text-gray-500" />
                  </div>
                  <span className="hidden sm:block font-medium text-gray-700">
                    {user?.firstName} {user?.lastName}
                  </span>
                </button>
              </div>

              <Button
                variant="ghost"
                size="sm"
                className="flex items-center gap-2"
                onClick={handleLogout}
              >
                <LogOut className="h-5 w-5" />
                <span className="hidden sm:block">Logout</span>
              </Button>
            </div>
          </div>
        </div>

        {/* Main content area */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}