'use client';

import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { submissionService } from '@/lib/api/submissions';
import { surveyService } from '@/lib/api/surveys';
import LayoutWrapper from '@/components/common/LayoutWrapper';
import Header from '@/components/common/Header';
import SubmissionList from '@/components/submissions/SubmissionList';
import Button from '@/components/ui/Button';
import Modal from '@/components/ui/Modal';
import { 
  FileText, 
  Filter, 
  Download, 
  Eye, 
  AlertCircle,
  ArrowLeft,
  BarChart3
} from 'lucide-react';
import Link from 'next/link';
import toast from 'react-hot-toast';

const AdminSubmissionsPage: React.FC = () => {
  const searchParams = useSearchParams();
  const queryClient = useQueryClient();
  const surveyId = searchParams.get('survey');
  
  const [selectedSurvey, setSelectedSurvey] = useState<any>(null);
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [selectedSubmission, setSelectedSubmission] = useState<any>(null);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [submissionToDelete, setSubmissionToDelete] = useState<number | null>(null);

  // Fetch submissions
  const {
    data: submissionsData,
    isLoading,
    error,
  } = useQuery({
    queryKey: ['submissions', surveyId],
    queryFn: () => {
      if (surveyId) {
        return submissionService.getAll(parseInt(surveyId), { page: 1, limit: 50 });
      }
      // In a real app, you might have an endpoint to get all submissions
      return Promise.resolve({ data: [], total: 0, page: 1, limit: 50 });
    },
  });

  // Fetch survey details if surveyId is provided
  const { data: survey } = useQuery({
    queryKey: ['survey', surveyId],
    queryFn: () => surveyService.getById(parseInt(surveyId!)),
    enabled: !!surveyId,
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => submissionService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['submissions', surveyId] });
      toast.success('Submission deleted successfully');
      setDeleteModalOpen(false);
    },
    onError: () => {
      toast.error('Failed to delete submission');
    },
  });

  useEffect(() => {
    if (survey) {
      setSelectedSurvey(survey);
    }
  }, [survey]);

  const handleViewSubmission = (submission: any) => {
    setSelectedSubmission(submission);
    setViewModalOpen(true);
  };

  const handleDeleteClick = (id: number) => {
    setSubmissionToDelete(id);
    setDeleteModalOpen(true);
  };

  const confirmDelete = () => {
    if (submissionToDelete) {
      deleteMutation.mutate(submissionToDelete);
    }
  };

  const submissions = submissionsData?.data || [];

  return (
    <LayoutWrapper>
      <Header title="Survey Submissions" />
      
      <div className="p-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <div className="flex items-center space-x-2 mb-2">
              {surveyId && (
                <Link
                  href="/admin/submissions"
                  className="text-gray-600 hover:text-gray-900"
                >
                  <ArrowLeft className="h-4 w-4" />
                </Link>
              )}
              <h1 className="text-2xl font-bold text-gray-900">
                {surveyId ? `Submissions: ${selectedSurvey?.title}` : 'All Submissions'}
              </h1>
            </div>
            <p className="text-gray-600">
              {surveyId 
                ? `View all submissions for this survey`
                : 'View and manage all survey submissions'}
            </p>
          </div>
          
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              icon={<BarChart3 className="h-4 w-4" />}
            >
              Analytics
            </Button>
            <Button
              variant="secondary"
              icon={<Download className="h-4 w-4" />}
            >
              Export All
            </Button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="card p-4">
            <div className="text-2xl font-bold text-gray-900">
              {submissions.length}
            </div>
            <div className="text-sm text-gray-600">Total Submissions</div>
          </div>
          <div className="card p-4">
            <div className="text-2xl font-bold text-green-600">
              {submissions.filter(s => {
                const date = new Date(s.submittedAt);
                const now = new Date();
                const dayDiff = (now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24);
                return dayDiff <= 7;
              }).length}
            </div>
            <div className="text-sm text-gray-600">Last 7 Days</div>
          </div>
          <div className="card p-4">
            <div className="text-2xl font-bold text-blue-600">
              {new Set(submissions.map(s => s.submittedBy)).size}
            </div>
            <div className="text-sm text-gray-600">Unique Officers</div>
          </div>
          <div className="card p-4">
            <div className="text-2xl font-bold text-purple-600">
              {selectedSurvey?.fields?.length || 'N/A'}
            </div>
            <div className="text-sm text-gray-600">Survey Fields</div>
          </div>
        </div>

        {/* Survey Info Card (if viewing specific survey) */}
        {surveyId && selectedSurvey && (
          <div className="card p-4 mb-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-medium text-gray-900">{selectedSurvey.title}</h3>
                <p className="text-sm text-gray-600 mt-1">
                  {selectedSurvey.description || 'No description'}
                </p>
              </div>
              <div className="text-right">
                <div className="text-sm text-gray-500">Survey Status</div>
                <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                  selectedSurvey.status === 'ACTIVE' 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-gray-100 text-gray-800'
                }`}>
                  {selectedSurvey.status}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Submissions List */}
        {isLoading ? (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
          </div>
        ) : error ? (
          <div className="card p-8 text-center">
            <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Error loading submissions
            </h3>
            <p className="text-gray-600">Please try again later</p>
          </div>
        ) : (
          <SubmissionList
            submissions={submissions}
            surveyId={surveyId ? parseInt(surveyId) : undefined}
            onView={handleViewSubmission}
            onDelete={handleDeleteClick}
          />
        )}
      </div>

      {/* View Submission Modal */}
      <Modal
        isOpen={viewModalOpen}
        onClose={() => setViewModalOpen(false)}
        title="Submission Details"
        size="xl"
      >
        {selectedSubmission && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <h4 className="text-sm font-medium text-gray-700 mb-2">Submission Info</h4>
                  <dl className="space-y-2">
                    <div className="flex justify-between">
                      <dt className="text-sm text-gray-600">Submission ID</dt>
                      <dd className="text-sm font-medium">#{selectedSubmission.id}</dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="text-sm text-gray-600">Survey ID</dt>
                      <dd className="text-sm font-medium">#{selectedSubmission.surveyId}</dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="text-sm text-gray-600">Submitted At</dt>
                      <dd className="text-sm font-medium">
                        {new Date(selectedSubmission.submittedAt).toLocaleString()}
                      </dd>
                    </div>
                  </dl>
                </div>

                <div>
                  <h4 className="text-sm font-medium text-gray-700 mb-2">Officer Info</h4>
                  <dl className="space-y-2">
                    <div className="flex justify-between">
                      <dt className="text-sm text-gray-600">Name</dt>
                      <dd className="text-sm font-medium">
                        {selectedSubmission.user?.name || 'N/A'}
                      </dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="text-sm text-gray-600">Email</dt>
                      <dd className="text-sm font-medium">
                        {selectedSubmission.user?.email || 'N/A'}
                      </dd>
                    </div>
                  </dl>
                </div>
              </div>

              <div>
                <h4 className="text-sm font-medium text-gray-700 mb-2">Survey Info</h4>
                {selectedSurvey && (
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <dt className="text-sm text-gray-600">Survey Title</dt>
                      <dd className="text-sm font-medium">{selectedSurvey.title}</dd>
                    </div>
                    {selectedSurvey.description && (
                      <div>
                        <dt className="text-sm text-gray-600 mb-1">Description</dt>
                        <dd className="text-sm text-gray-700">
                          {selectedSurvey.description}
                        </dd>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Answers Section */}
            {selectedSubmission.answers && Object.keys(selectedSubmission.answers).length > 0 && (
              <div>
                <h4 className="text-sm font-medium text-gray-700 mb-3">Answers</h4>
                <div className="bg-gray-50 rounded-lg border border-gray-200 overflow-hidden">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-100">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Field ID
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Answer
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {Object.entries(selectedSubmission.answers).map(([fieldId, answer]) => (
                        <tr key={fieldId}>
                          <td className="px-4 py-3 text-sm font-medium text-gray-900">
                            Field #{fieldId}
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-700">
                            {Array.isArray(answer) ? answer.join(', ') : String(answer)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            <div className="flex justify-end pt-4">
              <Button
                variant="outline"
                onClick={() => setViewModalOpen(false)}
              >
                Close
              </Button>
            </div>
          </div>
        )}
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        title="Delete Submission"
        size="sm"
      >
        <div className="space-y-4">
          <div className="flex items-center justify-center w-12 h-12 bg-red-100 rounded-full mx-auto">
            <AlertCircle className="h-6 w-6 text-red-600" />
          </div>
          
          <div className="text-center">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Delete Submission?
            </h3>
            <p className="text-gray-600">
              This will permanently delete this submission. This action cannot be undone.
            </p>
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <Button
              variant="outline"
              onClick={() => setDeleteModalOpen(false)}
              disabled={deleteMutation.isPending}
            >
              Cancel
            </Button>
            <Button
              variant="danger"
              onClick={confirmDelete}
              loading={deleteMutation.isPending}
            >
              Delete Submission
            </Button>
          </div>
        </div>
      </Modal>
    </LayoutWrapper>
  );
};

export default AdminSubmissionsPage;