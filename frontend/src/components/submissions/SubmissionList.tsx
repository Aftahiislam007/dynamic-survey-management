import React, { useState } from 'react';
import { Submission } from '@/types/submission';
import { format } from 'date-fns';
import { Search, Filter, Download, Eye, Trash2, User, Calendar, FileText } from 'lucide-react';

interface SubmissionListProps {
  submissions: Submission[];
  surveyId?: number;
  onView?: (submission: Submission) => void;
  onDelete?: (id: number) => void;
  showFilters?: boolean;
}

const SubmissionList: React.FC<SubmissionListProps> = ({
  submissions,
  surveyId,
  onView,
  onDelete,
  showFilters = true,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [dateFilter, setDateFilter] = useState<'ALL' | 'TODAY' | 'WEEK' | 'MONTH'>('ALL');
  const [expandedSubmission, setExpandedSubmission] = useState<number | null>(null);

  const filteredSubmissions = submissions.filter(submission => {
    // Search filter
    const matchesSearch = 
      submission.user?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      submission.user?.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      `submission-${submission.id}`.includes(searchTerm.toLowerCase());

    // Date filter
    const submissionDate = new Date(submission.submittedAt);
    const now = new Date();
    let matchesDate = true;
    
    if (dateFilter !== 'ALL') {
      const dayDiff = Math.floor((now.getTime() - submissionDate.getTime()) / (1000 * 60 * 60 * 24));
      
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

    return matchesSearch && matchesDate;
  });

  const toggleExpand = (id: number) => {
    setExpandedSubmission(expandedSubmission === id ? null : id);
  };

  const handleExport = () => {
    const csvContent = [
      ['ID', 'Submitted By', 'Email', 'Survey ID', 'Submitted At', 'Number of Answers'],
      ...filteredSubmissions.map(sub => [
        sub.id,
        sub.user?.name || 'N/A',
        sub.user?.email || 'N/A',
        sub.surveyId,
        format(new Date(sub.submittedAt), 'yyyy-MM-dd HH:mm:ss'),
        Object.keys(sub.answers || {}).length
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `submissions_${format(new Date(), 'yyyy-MM-dd')}.csv`;
    a.click();
  };

  const formatAnswerValue = (value: any): string => {
    if (Array.isArray(value)) {
      return value.join(', ');
    }
    if (value === null || value === undefined) {
      return 'N/A';
    }
    return String(value);
  };

  return (
    <div className="space-y-6">
      {showFilters && (
        <div className="card p-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search submissions..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="input-field pl-10"
              />
            </div>

            <div className="flex flex-wrap gap-2">
              <div className="relative">
                <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <select
                  value={dateFilter}
                  onChange={(e) => setDateFilter(e.target.value as any)}
                  className="input-field pl-10"
                >
                  <option value="ALL">All Time</option>
                  <option value="TODAY">Today</option>
                  <option value="WEEK">Last Week</option>
                  <option value="MONTH">Last Month</option>
                </select>
              </div>

              <button
                onClick={handleExport}
                className="flex items-center space-x-2 btn-secondary"
              >
                <Download className="h-4 w-4" />
                <span>Export</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {filteredSubmissions.length === 0 ? (
        <div className="card p-8 text-center">
          <div className="mx-auto w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
            <FileText className="h-8 w-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            No submissions found
          </h3>
          <p className="text-gray-600">
            {searchTerm || dateFilter !== 'ALL'
              ? 'Try adjusting your filters or search term'
              : 'No submissions have been made yet'}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredSubmissions.map((submission) => (
            <div key={submission.id} className="card overflow-hidden">
              {/* Submission Header */}
              <div 
                className="p-4 hover:bg-gray-50 cursor-pointer"
                onClick={() => toggleExpand(submission.id)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="flex-shrink-0 w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center">
                      <User className="h-5 w-5 text-primary-600" />
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900">
                        {submission.user?.name || 'Anonymous User'}
                      </h4>
                      <p className="text-sm text-gray-600">
                        {submission.user?.email || 'No email provided'}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-6">
                    <div className="text-right">
                      <div className="text-sm text-gray-500">Submitted</div>
                      <div className="text-sm font-medium text-gray-900">
                        {format(new Date(submission.submittedAt), 'MMM dd, yyyy HH:mm')}
                      </div>
                    </div>

                    <div className="flex items-center space-x-2">
                      {onView && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onView(submission);
                          }}
                          className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg"
                          title="View details"
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                      )}
                      
                      {onDelete && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onDelete(submission.id);
                          }}
                          className="p-2 text-red-600 hover:text-red-800 hover:bg-red-50 rounded-lg"
                          title="Delete submission"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      )}

                      <div className="w-4">
                        <svg
                          className={`h-4 w-4 text-gray-400 transform transition-transform ${
                            expandedSubmission === submission.id ? 'rotate-180' : ''
                          }`}
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Expanded Content */}
              {expandedSubmission === submission.id && (
                <div className="border-t border-gray-200 p-6 bg-gray-50">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h5 className="text-sm font-medium text-gray-700 mb-3">Submission Information</h5>
                      <dl className="space-y-2">
                        <div className="flex justify-between">
                          <dt className="text-sm text-gray-600">Submission ID</dt>
                          <dd className="text-sm font-medium">#{submission.id}</dd>
                        </div>
                        <div className="flex justify-between">
                          <dt className="text-sm text-gray-600">Survey ID</dt>
                          <dd className="text-sm font-medium">#{submission.surveyId}</dd>
                        </div>
                        <div className="flex justify-between">
                          <dt className="text-sm text-gray-600">Submitted At</dt>
                          <dd className="text-sm font-medium">
                            {format(new Date(submission.submittedAt), 'PPpp')}
                          </dd>
                        </div>
                        <div className="flex justify-between">
                          <dt className="text-sm text-gray-600">Total Answers</dt>
                          <dd className="text-sm font-medium">
                            {Object.keys(submission.answers || {}).length}
                          </dd>
                        </div>
                      </dl>
                    </div>

                    <div>
                      <h5 className="text-sm font-medium text-gray-700 mb-3">User Information</h5>
                      <dl className="space-y-2">
                        <div className="flex justify-between">
                          <dt className="text-sm text-gray-600">Name</dt>
                          <dd className="text-sm font-medium">{submission.user?.name || 'N/A'}</dd>
                        </div>
                        <div className="flex justify-between">
                          <dt className="text-sm text-gray-600">Email</dt>
                          <dd className="text-sm font-medium">{submission.user?.email || 'N/A'}</dd>
                        </div>
                        <div className="flex justify-between">
                          <dt className="text-sm text-gray-600">User Type</dt>
                          <dd className="text-sm font-medium capitalize">
                            {submission.user?.userType?.toLowerCase() || 'N/A'}
                          </dd>
                        </div>
                      </dl>
                    </div>
                  </div>

                  {/* Answers Section */}
                  {submission.answers && Object.keys(submission.answers).length > 0 && (
                    <div className="mt-6">
                      <h5 className="text-sm font-medium text-gray-700 mb-3">Answers</h5>
                      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                        <table className="min-w-full divide-y divide-gray-200">
                          <thead className="bg-gray-50">
                            <tr>
                              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Field
                              </th>
                              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Answer
                              </th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-gray-200">
                            {Object.entries(submission.answers).map(([fieldId, answer]) => (
                              <tr key={fieldId}>
                                <td className="px-4 py-3 text-sm font-medium text-gray-900">
                                  Field #{fieldId}
                                </td>
                                <td className="px-4 py-3 text-sm text-gray-700">
                                  {formatAnswerValue(answer)}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default SubmissionList;