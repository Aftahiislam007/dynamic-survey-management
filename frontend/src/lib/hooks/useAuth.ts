import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/lib/store/authStore';
import { UserType } from '@/types/auth';

export const useAuth = () => {
  const router = useRouter();
  const { user, isAuthenticated, isLoading, logout } = useAuthStore();

  useEffect(() => {
    // Initialize auth from localStorage
    const token = localStorage.getItem('token');
    const userStr = localStorage.getItem('user');
    
    if (token && userStr) {
      useAuthStore.getState().setToken(token);
      useAuthStore.getState().setUser(JSON.parse(userStr));
    }
  }, []);

  const requireAuth = (requiredRole?: UserType) => {
    if (!isAuthenticated) {
      router.push('/login');
      return false;
    }

    if (requiredRole && user?.userType !== requiredRole) {
      router.push('/unauthorized');
      return false;
    }

    return true;
  };

  const isAdmin = user?.userType === UserType.ADMIN || user?.userType === UserType.SUPER_ADMIN;
  const isOfficer = user?.userType === UserType.OFFICER;

  return {
    user,
    isAuthenticated,
    isLoading,
    isAdmin,
    isOfficer,
    requireAuth,
    logout,
  };
};