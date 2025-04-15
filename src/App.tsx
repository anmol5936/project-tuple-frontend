import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './contexts/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import LoginPage from './pages/auth/LoginPage';
import RegisterPage from './pages/auth/RegisterPage';
import CustomerDashboard from './pages/customer/Dashboard';
import DelivererDashboard from './pages/deliverer/Dashboard';
import ManagerDashboard from './pages/manager/Dashboard';
import RoleSelection from './components/RoleSelection';
import PaymentHistory from './pages/customer/PaymentHistory';
import Subscriptions from './pages/customer/Subscriptions';
import Bills from './pages/customer/Bills';
import Settings from './pages/customer/Settings';
import Profile from './pages/customer/Profile';




const queryClient = new QueryClient();



function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Router>
        <AuthProvider>
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<RoleSelection />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />

            <Route path='/profile' element={<Profile />} />

            {/* Protected Routes */}
            <Route
              path="/customer/*"
              element={
                <ProtectedRoute allowedRoles={['Customer']}>
                  <Routes>
                    <Route path="/" element={<CustomerDashboard />} />
                    <Route path="payments" element={<PaymentHistory />} />
                    <Route path="subscriptions" element={<Subscriptions/>} />
                    <Route path="bills" element={<Bills/>} />
                    <Route path="settings" element={<Settings/>}/>
                  </Routes>
                </ProtectedRoute>
              }
            />
            <Route
              path="/deliverer/*"
              element={
                <ProtectedRoute allowedRoles={['Deliverer']}>
                  <DelivererDashboard />

                </ProtectedRoute>
              }
            />
            <Route
              path="/manager/*"
              element={
                <ProtectedRoute allowedRoles={['Manager']}>
                  <ManagerDashboard />
                </ProtectedRoute>
              }
            />

            {/* Default Route */}
            <Route path="/" element={<Navigate to="/login" replace />} />
          </Routes>
          <Toaster position="top-right" />
        </AuthProvider>
      </Router>
    </QueryClientProvider>
  );
}

export default App;