'use client';

import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { surveyService } from '@/lib/api/surveys';
import LayoutWrapper from '@/components/common/LayoutWrapper';
import Header from '@/components/common/Header';
import SurveyList from '@/components/surveys/SurveyList';
import { 
  FileText, 
  CheckCircle, 
  Clock, 
  AlertCircle,
  BarChart3,
  Filter
} from 'lucide-react';
import { useAuth } from '@/lib/hooks/useAuth';

const OfficerDashboard: React.FC = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'ALL' | 'ACTIVE' | 'COMPLETED'>('ALL');

  const {
    data: surveys,
    isLoading,
    error,
  } = useQuery({
    queryKey: ['officer-surveys'],
    queryFn: () => surveyService.getActive(),
  });

  // Filter surveys based on active tab
  const filteredSurveys = surveys?.filter(survey => {
    if (activeTab === 'ACTIVE') {
      return survey.status === 'ACTIVE';
    }
    // For completed, you would need to check which surveys the officer has submitted
    // This is a placeholder - implement based on your backend
    return true;
  }) || [];

  const stats = {
    total: surveys?.length || 0,
    active: surveys?.filter(s => s.status === 'ACTIVE').length || 0,
    completed: 0, // You would calculate this from submissions
  };

  if (isLoading) {
    return (
      <LayoutWrapper>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
        </div>
      </LayoutWrapper>
    );
  }

  if (error) {
    return (
      <LayoutWrapper>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Error loading surveys</h3>
            <p className="text-gray-600">Please try again later</p>
          </div>
        </div>
      </LayoutWrapper>
    );
  }

  return (
    <LayoutWrapper>
      <Header title="Officer Dashboard" />
      
      <div className="p-6">
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">
            Welcome, {user?.name}!
          </h1>
          <p className="text-gray-600 mt-2">
            Here are the surveys available for you to complete.
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="card p-6 bg-blue-50">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-blue-600">Total Available</p>
                <p className="text-2xl font-bold mt-2">{stats.total}</p>
              </div>
              <div className="p-3 rounded-full bg-blue-100">
                <FileText className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="card p-6 bg-green-50">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-green-600">Active Surveys</p>
                <p className="text-2xl font-bold mt-2">{stats.active}</p>
              </div>
              <div className="p-3 rounded-full bg-green-100">
                <CheckCircle className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </div>

          <div className="card p-6 bg-purple-50">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-purple-600">Completed</p>
                <p className="text-2xl font-bold mt-2">{stats.completed}</p>
              </div>
              <div className="p-3 rounded-full bg-purple-100">
                <BarChart3 className="h-6 w-6 text-purple-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="mb-6">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8">
              <button
                onClick={() => setActiveTab('ALL')}
                className={`py-2 px-1 border-b-2 text-sm font-medium ${
                  activeTab === 'ALL'
                    ? 'border-primary-500 text-primary-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <div className="flex items-center">
                  <FileText className="h-4 w-4 mr-2" />
                  All Surveys ({stats.total})
                </div>
              </button>
              <button
                onClick={() => setActiveTab('ACTIVE')}
                className={`py-2 px-1 border-b-2 text-sm font-medium ${
                  activeTab === 'ACTIVE'
                    ? 'border-primary-500 text-primary-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <div className="flex items-center">
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Active ({stats.active})
                </div>
              </button>
              <button
                onClick={() => setActiveTab('COMPLETED')}
                className={`py-2 px-1 border-b-2 text-sm font-medium ${
                  activeTab === 'COMPLETED'
                    ? 'border-primary-500 text-primary-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <div className="flex items-center">
                  <Clock className="h-4 w-4 mr-2" />
                  Completed ({stats.completed})
                </div>
              </button>
            </nav>
          </div>
        </div>

        {/* Survey List */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">
              {activeTab === 'ALL' && 'All Surveys'}
              {activeTab === 'ACTIVE' && 'Active Surveys'}
              {activeTab === 'COMPLETED' && 'Completed Surveys'}
            </h2>
            <div className="flex items-center space-x-2">
              <button className="flex items-center space-x-1 text-sm text-gray-600 hover:text-gray-900">
                <Filter className="h-4 w-4" />
                <span>Sort By</span>
              </button>
            </div>
          </div>

          {filteredSurveys.length === 0 ? (
            <div className="card p-8 text-center">
              <div className="mx-auto w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                {activeTab === 'COMPLETED' ? (
                  <CheckCircle className="h-8 w-8 text-green-400" />
                ) : (
                  <FileText className="h-8 w-8 text-gray-400" />
                )}
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                {activeTab === 'COMPLETED' 
                  ? 'No completed surveys' 
                  : 'No surveys available'}
              </h3>
              <p className="text-gray-600">
                {activeTab === 'COMPLETED'
                  ? 'You haven\'t completed any surveys yet'
                  : 'Check back later for new surveys'}
              </p>
            </div>
          ) : (
            <SurveyList
              surveys={filteredSurveys}
              showFilters={false}
              compact={false}
            />
          )}
        </div>

        {/* Quick Tips */}
        <div className="card p-6 bg-gray-50 border border-gray-200">
          <h3 className="text-sm font-medium text-gray-900 mb-3">Quick Tips</h3>
          <ul className="text-sm text-gray-600 space-y-2">
            <li className="flex items-start">
              <CheckCircle className="h-4 w-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
              <span>Click on any survey card to start filling it out</span>
            </li>
            <li className="flex items-start">
              <Clock className="h-4 w-4 text-blue-500 mr-2 mt-0.5 flex-shrink-0" />
              <span>You can save your progress and return later</span>
            </li>
            <li className="flex items-start">
              <AlertCircle className="h-4 w-4 text-yellow-500 mr-2 mt-0.5 flex-shrink-0" />
              <span>Required fields are marked with a red asterisk (*)</span>
            </li>
          </ul>
        </div>
      </div>
    </LayoutWrapper>
  );
};

export default OfficerDashboard;