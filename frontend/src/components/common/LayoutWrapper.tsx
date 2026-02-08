'use client';

import React, { useState, useEffect } from 'react';
import Sidebar from './Sidebar';
import { useAuth } from '@/lib/hooks/useAuth';
import { usePathname } from 'next/navigation';
import LoadingSpinner from './LoadingSpinner';

interface LayoutWrapperProps {
  children: React.ReactNode;
}

const LayoutWrapper: React.FC<LayoutWrapperProps> = ({ children }) => {
  const { user, isLoading } = useAuth();
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Close sidebar on mobile when route changes
  useEffect(() => {
    setSidebarOpen(false);
  }, [pathname]);

  if (isLoading) {
    return <LoadingSpinner />;
  }

  // If no user is logged in, don't show sidebar
  if (!user) {
    return <>{children}</>;
  }

  const isAdmin = user.userType === 'ADMIN' || user.userType === 'SUPER_ADMIN';
  const isOfficer = user.userType === 'OFFICER';

  return (
    <div className="min-h-screen bg-gray-50">
      <Sidebar 
        isOpen={sidebarOpen} 
        onClose={() => setSidebarOpen(false)} 
        userType={user.userType}
      />
      
      <div className={sidebarOpen ? 'lg:ml-64' : ''}>
        <div className="flex flex-col flex-1">
          <div className="flex-1">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
};

export default LayoutWrapper;