import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Link } from 'react-router-dom';
import { Newspaper } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';

interface LoginFormData {
  username: string;
  password: string;
}

export default function LoginPage() {
  const { login } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const { register, handleSubmit, formState: { errors } } = useForm<LoginFormData>();

  const onSubmit = async (data: LoginFormData) => {
    try {
      setIsLoading(true);
      await login(data.username, data.password);
    } catch (error) {
      console.error('Login failed:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen ">

      <div className="relative flex min-h-screen flex-col items-center justify-center px-6 py-12">
        <div className="w-full max-w-xl space-y-12">
          <div className="text-center">
            <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500 to-blue-600 shadow-xl">
              <Newspaper className="h-12 w-12 text-white" />
            </div>
            <h2 className="mt-8 text-4xl font-bold tracking-tight text-gray-900">
              Welcome back
            </h2>
            <p className="mt-3 text-lg text-gray-600">
              Don't have an account?{' '}
              <Link to="/register" className="font-medium text-blue-600 hover:text-blue-500 transition-colors">
                Create one now
              </Link>
            </p>
          </div>

          <div className="mt-10">
            <div className="overflow-hidden rounded-2xl bg-white/90 backdrop-blur-xl shadow-2xl ring-1 ring-gray-900/5">
              <div className="p-8 sm:p-10">
                <form className="space-y-8" onSubmit={handleSubmit(onSubmit)}>
                  <div className="space-y-6">
                    <div>
                      <label htmlFor="username" className="block text-base font-medium text-gray-700 mb-2">
                        Username
                      </label>
                      <Input
                        id="username"
                        type="text"
                        autoComplete="username"
                        className="block w-full appearance-none rounded-xl border border-gray-300 px-4 py-3 text-base shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500"
                        {...register('username', { required: 'Username is required' })}
                        error={errors.username?.message}
                      />
                    </div>

                    <div>
                      <label htmlFor="password" className="block text-base font-medium text-gray-700 mb-2">
                        Password
                      </label>
                      <Input
                        id="password"
                        type="password"
                        autoComplete="current-password"
                        className="block w-full appearance-none rounded-xl border border-gray-300 px-4 py-3 text-base shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500"
                        {...register('password', { required: 'Password is required' })}
                        error={errors.password?.message}
                      />
                    </div>
                  </div>

                  <div>
                    <Button
                      type="submit"
                      className="w-full rounded-xl bg-gradient-to-r from-blue-500 to-blue-600 px-8 py-3.5 text-base font-semibold text-white shadow-lg hover:from-blue-600 hover:to-blue-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 transition-all duration-200"
                      isLoading={isLoading}
                    >
                      Sign in
                    </Button>
                  </div>
                </form>
              </div>
            </div>

            <div className="mt-6 text-center text-sm text-gray-600">
              By signing in, you agree to our{' '}
              <Link to="/terms" className="font-medium text-blue-600 hover:text-blue-500 transition-colors">
                Terms of Service
              </Link>{' '}
              and{' '}
              <Link to="/privacy" className="font-medium text-blue-600 hover:text-blue-500 transition-colors">
                Privacy Policy
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}