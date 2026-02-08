import React, { useState } from 'react';
import { Survey, SurveyStatus } from '@/types/survey';
import SurveyCard from './SurveyCard';
import { Search, Filter, X, Download } from 'lucide-react';
import { format } from 'date-fns';

interface SurveyListProps {
  surveys: Survey[];
  onDelete?: (id: number) => void;
  isAdmin?: boolean;
  compact?: boolean;
  showFilters?: boolean;
}

const SurveyList: React.FC<SurveyListProps> = ({ 
  surveys, 
  onDelete, 
  isAdmin = false,
  compact = false,
  showFilters = true 
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<SurveyStatus | 'ALL'>('ALL');
  const [dateFilter, setDateFilter] = useState<'ALL' | 'TODAY' | 'WEEK' | 'MONTH'>('ALL');

  const filteredSurveys = surveys.filter(survey => {
    // Search filter
    const matchesSearch = 
      survey.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      survey.description?.toLowerCase().includes(searchTerm.toLowerCase());

    // Status filter
    const matchesStatus = statusFilter === 'ALL' || survey.status === statusFilter;

    // Date filter
    const surveyDate = new Date(survey.createdAt);
    const now = new Date();
    let matchesDate = true;
    
    if (dateFilter !== 'ALL') {
      const dayDiff = Math.floor((now.getTime() - surveyDate.getTime()) / (1000 * 60 * 60 * 24));
      
      switch (dateFilter) {
        case 'TODAY':
          matchesDate = dayDiff === 0;
          break;
        case 'WEEK':
          matchesDate = dayDiff <= 7;
          break;
        case 'MONTH':
          matchesDate = dayDiff <= 30;
          break;
      }
    }

    return matchesSearch && matchesStatus && matchesDate;
  });

  const statusOptions: Array<{ value: SurveyStatus | 'ALL'; label: string }> = [
    { value: 'ALL', label: 'All Status' },
    { value: SurveyStatus.DRAFT, label: 'Draft' },
    { value: SurveyStatus.ACTIVE, label: 'Active' },
    { value: SurveyStatus.INACTIVE, label: 'Inactive' },
    { value: SurveyStatus.ARCHIVED, label: 'Archived' },
  ];

  const dateOptions = [
    { value: 'ALL', label: 'All Time' },
    { value: 'TODAY', label: 'Today' },
    { value: 'WEEK', label: 'Last Week' },
    { value: 'MONTH', label: 'Last Month' },
  ];

  const handleExport = () => {
    const csvContent = [
      ['ID', 'Title', 'Status', 'Description', 'Created At', 'Submissions'],
      ...filteredSurveys.map(survey => [
        survey.id,
        survey.title,
        survey.status,
        survey.description || '',
        format(new Date(survey.createdAt), 'yyyy-MM-dd'),
        survey.submissionsCount || 0
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `surveys_${format(new Date(), 'yyyy-MM-dd')}.csv`;
    a.click();
  };

  if (compact) {
    return (
      <div className="space-y-3">
        {filteredSurveys.map((survey) => (
          <div
            key={survey.id}
            className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100"
          >
            <div className="flex-1">
              <h4 className="font-medium text-gray-900">{survey.title}</h4>
              <p className="text-sm text-gray-600 truncate">
                {survey.description || 'No description'}
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                survey.status === SurveyStatus.ACTIVE 
                  ? 'bg-green-100 text-green-800' 
                  : 'bg-gray-100 text-gray-800'
              }`}>
                {survey.status}
              </span>
              <span className="text-sm text-gray-500">
                {survey.submissionsCount || 0} subs
              </span>
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {showFilters && (
        <div className="card p-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search surveys..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="input-field pl-10"
              />
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm('')}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>

            <div className="flex flex-wrap gap-2">
              <div className="relative">
                <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value as SurveyStatus | 'ALL')}
                  className="input-field pl-10"
                >
                  {statusOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>

              <select
                value={dateFilter}
                onChange={(e) => setDateFilter(e.target.value as any)}
                className="input-field"
              >
                {dateOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>

              <button
                onClick={handleExport}
                className="flex items-center space-x-2 btn-secondary"
              >
                <Download className="h-4 w-4" />
                <span>Export</span>
              </button>
            </div>
          </div>

          {(searchTerm || statusFilter !== 'ALL' || dateFilter !== 'ALL') && (
            <div className="mt-4 flex items-center justify-between">
              <p className="text-sm text-gray-600">
                Showing {filteredSurveys.length} of {surveys.length} surveys
              </p>
              <button
                onClick={() => {
                  setSearchTerm('');
                  setStatusFilter('ALL');
                  setDateFilter('ALL');
                }}
                className="text-sm text-primary-600 hover:text-primary-700"
              >
                Clear filters
              </button>
            </div>
          )}
        </div>
      )}

      {filteredSurveys.length === 0 ? (
        <div className="card p-8 text-center">
          <div className="mx-auto w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
            <Search className="h-8 w-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            No surveys found
          </h3>
          <p className="text-gray-600">
            {searchTerm || statusFilter !== 'ALL' || dateFilter !== 'ALL'
              ? 'Try adjusting your filters or search term'
              : 'No surveys have been created yet'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredSurveys.map((survey) => (
            <SurveyCard
              key={survey.id}
              survey={survey}
              onDelete={onDelete}
              isAdmin={isAdmin}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default SurveyList;