'use client';

import React, { useEffect, useState } from 'react';
import { useAuth } from '@/lib/hooks/useAuth';
import { surveyService } from '@/lib/api/surveys';
import { submissionService } from '@/lib/api/submissions';
import { Survey, SurveyStatus } from '@/types/survey';
import { Submission } from '@/types/submission';
import LayoutWrapper from '@/components/common/LayoutWrapper';
import Header from '@/components/common/Header';
import SurveyList from '@/components/surveys/SurveyList';
import { 
  BarChart3, 
  FileText, 
  Users, 
  CheckCircle,
  PlusCircle,
  AlertCircle
} from 'lucide-react';
import Link from 'next/link';
import toast from 'react-hot-toast';

const AdminDashboard: React.FC = () => {
  const { requireAuth, user } = useAuth();
  const [stats, setStats] = useState({
    totalSurveys: 0,
    activeSurveys: 0,
    totalSubmissions: 0,
    recentSubmissions: 0,
  });
  const [recentSurveys, setRecentSurveys] = useState<Survey[]>([]);
  const [recentSubmissions, setRecentSubmissions] = useState<Submission[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!requireAuth()) return;

    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    setIsLoading(true);
    try {
      // Fetch surveys
      const surveysResponse = await surveyService.getAll({ page: 1, limit: 5 });
      const activeSurveys = await surveyService.getByStatus(SurveyStatus.ACTIVE);
      
      // Fetch recent submissions (you might need to adjust based on your API)
      const submissionsResponse = await submissionService.getAll(1, { page: 1, limit: 5 });

      setRecentSurveys(surveysResponse.data);
      setRecentSubmissions(submissionsResponse.data);

      setStats({
        totalSurveys: surveysResponse.total,
        activeSurveys: activeSurveys.length,
        totalSubmissions: submissionsResponse.total,
        recentSubmissions: submissionsResponse.data.length,
      });
    } catch (error) {
      toast.error('Failed to load dashboard data');
    } finally {
      setIsLoading(false);
    }
  };

  const statCards = [
    {
      title: 'Total Surveys',
      value: stats.totalSurveys,
      icon: FileText,
      color: 'bg-blue-500',
      textColor: 'text-blue-600',
      bgColor: 'bg-blue-50',
    },
    {
      title: 'Active Surveys',
      value: stats.activeSurveys,
      icon: CheckCircle,
      color: 'bg-green-500',
      textColor: 'text-green-600',
      bgColor: 'bg-green-50',
    },
    {
      title: 'Total Submissions',
      value: stats.totalSubmissions,
      icon: Users,
      color: 'bg-purple-500',
      textColor: 'text-purple-600',
      bgColor: 'bg-purple-50',
    },
    {
      title: 'Recent Activity',
      value: stats.recentSubmissions,
      icon: BarChart3,
      color: 'bg-orange-500',
      textColor: 'text-orange-600',
      bgColor: 'bg-orange-50',
    },
  ];

  if (isLoading) {
    return (
      <LayoutWrapper>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading dashboard...</p>
          </div>
        </div>
      </LayoutWrapper>
    );
  }

  return (
    <LayoutWrapper>
      <Header title="Admin Dashboard" />
      
      <div className="p-6">
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">
            Welcome back, {user?.name}!
          </h1>
          <p className="text-gray-600 mt-2">
            Here's what's happening with your surveys today.
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {statCards.map((stat, index) => (
            <div key={index} className={`card p-6 ${stat.bgColor}`}>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                  <p className="text-2xl font-bold mt-2">{stat.value}</p>
                </div>
                <div className={`p-3 rounded-full ${stat.bgColor}`}>
                  <stat.icon className={`h-6 w-6 ${stat.textColor}`} />
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Quick Actions */}
        <div className="mb-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
          <div className="flex space-x-4">
            <Link
              href="/admin/surveys/create"
              className="flex items-center space-x-2 btn-primary"
            >
              <PlusCircle className="h-5 w-5" />
              <span>Create New Survey</span>
            </Link>
            <Link
              href="/admin/surveys"
              className="flex items-center space-x-2 btn-secondary"
            >
              <FileText className="h-5 w-5" />
              <span>View All Surveys</span>
            </Link>
          </div>
        </div>

        {/* Recent Surveys */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="card p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Recent Surveys</h3>
              <Link
                href="/admin/surveys"
                className="text-sm text-primary-600 hover:text-primary-700"
              >
                View all
              </Link>
            </div>
            <SurveyList surveys={recentSurveys} compact />
          </div>

          {/* Recent Submissions */}
          <div className="card p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Recent Submissions</h3>
              <Link
                href="/admin/submissions"
                className="text-sm text-primary-600 hover:text-primary-700"
              >
                View all
              </Link>
            </div>
            {recentSubmissions.length > 0 ? (
              <div className="space-y-4">
                {recentSubmissions.map((submission) => (
                  <div
                    key={submission.id}
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                  >
                    <div>
                      <p className="font-medium text-gray-900">
                        Submission #{submission.id}
                      </p>
                      <p className="text-sm text-gray-600">
                        {new Date(submission.submittedAt).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="text-sm text-gray-500">
                      Survey #{submission.surveyId}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">No submissions yet</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </LayoutWrapper>
  );
};

export default AdminDashboard;