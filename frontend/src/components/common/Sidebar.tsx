'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  LayoutDashboard, 
  FileText, 
  Users, 
  BarChart3,
  Settings,
  LogOut,
  ChevronLeft,
  User,
  Shield,
  Briefcase
} from 'lucide-react';
import { useAuth } from '@/lib/hooks/useAuth';
import { UserType } from '@/types/auth';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  userType: UserType;
}

const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose, userType }) => {
  const pathname = usePathname();
  const { user, logout } = useAuth();

  const isAdmin = userType === 'ADMIN' || userType === 'SUPER_ADMIN';
  const isOfficer = userType === 'OFFICER';

  const adminNavItems = [
    {
      name: 'Dashboard',
      href: '/admin/dashboard',
      icon: LayoutDashboard,
    },
    {
      name: 'Surveys',
      href: '/admin/surveys',
      icon: FileText,
    },
    {
      name: 'Submissions',
      href: '/admin/submissions',
      icon: Users,
    },
    {
      name: 'Analytics',
      href: '/admin/analytics',
      icon: BarChart3,
    },
    {
      name: 'Settings',
      href: '/admin/settings',
      icon: Settings,
    },
  ];

  const officerNavItems = [
    {
      name: 'Dashboard',
      href: '/officer/dashboard',
      icon: LayoutDashboard,
    },
    {
      name: 'My Surveys',
      href: '/officer/surveys',
      icon: FileText,
    },
    {
      name: 'Submissions',
      href: '/officer/submissions',
      icon: Users,
    },
    {
      name: 'Profile',
      href: '/officer/profile',
      icon: User,
    },
  ];

  const navItems = isAdmin ? adminNavItems : officerNavItems;

  return (
    <>
      {/* Mobile sidebar backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 lg:hidden bg-black bg-opacity-50 transition-opacity"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed inset-y-0 left-0 z-50 w-64 bg-white border-r border-gray-200 
          transform transition-transform duration-300 ease-in-out
          lg:translate-x-0 lg:static lg:inset-0
          ${isOpen ? 'translate-x-0' : '-translate-x-full'}
        `}
      >
        {/* Logo and Close Button */}
        <div className="flex items-center justify-between h-16 px-4 border-b border-gray-200">
          <div className="flex items-center space-x-2">
            <div className="h-8 w-8 rounded-lg bg-primary-600 flex items-center justify-center">
              {isAdmin ? (
                <Shield className="h-5 w-5 text-white" />
              ) : (
                <Briefcase className="h-5 w-5 text-white" />
              )}
            </div>
            <span className="font-semibold text-gray-900">
              {isAdmin ? 'Admin Panel' : 'Officer Panel'}
            </span>
          </div>
          
          <button
            onClick={onClose}
            className="lg:hidden text-gray-500 hover:text-gray-700"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
        </div>

        {/* User Profile */}
        <div className="px-4 py-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="h-10 w-10 rounded-full bg-primary-100 flex items-center justify-center">
              <User className="h-5 w-5 text-primary-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-900">{user?.name}</p>
              <p className="text-xs text-gray-500">{user?.email}</p>
              <span className="inline-block mt-1 px-2 py-1 text-xs font-medium bg-gray-100 text-gray-800 rounded-full capitalize">
                {userType?.toLowerCase()}
              </span>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-2 py-4 space-y-1">
          {navItems.map((item) => {
            const isActive = pathname.startsWith(item.href);
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`
                  flex items-center px-3 py-2 text-sm font-medium rounded-lg
                  transition-colors duration-150
                  ${isActive
                    ? 'bg-primary-50 text-primary-700'
                    : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
                  }
                `}
                onClick={onClose}
              >
                <item.icon className={`h-5 w-5 mr-3 ${isActive ? 'text-primary-600' : 'text-gray-400'}`} />
                {item.name}
              </Link>
            );
          })}
        </nav>

        {/* Logout Button */}
        <div className="px-4 py-4 border-t border-gray-200">
          <button
            onClick={logout}
            className="flex items-center w-full px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-50 hover:text-red-700 rounded-lg transition-colors duration-150"
          >
            <LogOut className="h-5 w-5 mr-3" />
            Logout
          </button>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;