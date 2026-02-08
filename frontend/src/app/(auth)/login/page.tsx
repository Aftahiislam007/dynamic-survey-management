'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { authService } from '@/lib/api/auth';
import { useAuthStore } from '@/lib/store/authStore';
import { UserType } from '@/types/auth';
import toast from 'react-hot-toast';
import { LogIn, Shield, Users } from 'lucide-react';

const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  userType: z.nativeEnum(UserType),
});

type LoginFormData = z.infer<typeof loginSchema>;

const LoginPage: React.FC = () => {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuthStore();

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      userType: UserType.ADMIN,
    },
  });

  const selectedUserType = watch('userType');

  const onSubmit = async (data: LoginFormData) => {
    setIsLoading(true);
    try {
      let response;
      if (data.userType === UserType.OFFICER) {
        response = await authService.officerLogin({
          email: data.email,
          password: data.password,
        });
      } else {
        response = await authService.login({
          email: data.email,
          password: data.password,
        });
      }

      login(response.user, response.access_token);
      toast.success('Login successful!');

      // Redirect based on user type
      if (data.userType === UserType.ADMIN || data.userType === UserType.SUPER_ADMIN) {
        router.push('/admin/dashboard');
      } else {
        router.push('/officer/dashboard');
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Login failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center">
          <div className="h-12 w-12 rounded-full bg-primary-600 flex items-center justify-center">
            <LogIn className="h-7 w-7 text-white" />
          </div>
        </div>
        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
          Survey Management System
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          Sign in to your account
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          {/* User Type Selection */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Login as
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setValue('userType', UserType.ADMIN)}
                className={`p-4 border rounded-lg flex flex-col items-center transition-colors ${
                  selectedUserType === UserType.ADMIN
                    ? 'border-primary-500 bg-primary-50'
                    : 'border-gray-300 hover:border-gray-400'
                }`}
              >
                <Shield className={`h-6 w-6 mb-2 ${
                  selectedUserType === UserType.ADMIN ? 'text-primary-600' : 'text-gray-400'
                }`} />
                <span className="text-sm font-medium">Admin</span>
                <span className="text-xs text-gray-500 mt-1">Manage surveys</span>
              </button>

              <button
                type="button"
                onClick={() => setValue('userType', UserType.OFFICER)}
                className={`p-4 border rounded-lg flex flex-col items-center transition-colors ${
                  selectedUserType === UserType.OFFICER
                    ? 'border-primary-500 bg-primary-50'
                    : 'border-gray-300 hover:border-gray-400'
                }`}
              >
                <Users className={`h-6 w-6 mb-2 ${
                  selectedUserType === UserType.OFFICER ? 'text-primary-600' : 'text-gray-400'
                }`} />
                <span className="text-sm font-medium">Officer</span>
                <span className="text-xs text-gray-500 mt-1">Submit surveys</span>
              </button>
            </div>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                Email address
              </label>
              <input
                id="email"
                type="email"
                {...register('email')}
                className="input-field mt-1"
                placeholder="Enter your email"
              />
              {errors.email && (
                <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>
              )}
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                Password
              </label>
              <input
                id="password"
                type="password"
                {...register('password')}
                className="input-field mt-1"
                placeholder="Enter your password"
              />
              {errors.password && (
                <p className="mt-1 text-sm text-red-600">{errors.password.message}</p>
              )}
            </div>

            <input type="hidden" {...register('userType')} />

            <div>
              <button
                type="submit"
                disabled={isLoading}
                className="w-full btn-primary"
              >
                {isLoading ? 'Signing in...' : 'Sign in'}
              </button>
            </div>
          </form>

          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">Demo Credentials</span>
              </div>
            </div>

            <div className="mt-6 grid grid-cols-2 gap-3 text-xs">
              <div className="p-3 bg-gray-50 rounded">
                <p className="font-medium">Admin</p>
                <p className="text-gray-600">admin@example.com</p>
                <p className="text-gray-600">password: admin123</p>
              </div>
              <div className="p-3 bg-gray-50 rounded">
                <p className="font-medium">Officer</p>
                <p className="text-gray-600">officer@example.com</p>
                <p className="text-gray-600">password: officer123</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;