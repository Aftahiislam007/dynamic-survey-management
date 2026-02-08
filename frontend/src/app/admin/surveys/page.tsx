'use client';

import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { surveyService } from '@/lib/api/surveys';
import LayoutWrapper from '@/components/common/LayoutWrapper';
import Header from '@/components/common/Header';
import SurveyList from '@/components/surveys/SurveyList';
import Button from '@/components/ui/Button';
import Modal from '@/components/ui/Modal';
import { Plus, AlertCircle, Loader2 } from 'lucide-react';
import Link from 'next/link';
import toast from 'react-hot-toast';

const AdminSurveysPage: React.FC = () => {
  const queryClient = useQueryClient();
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [surveyToDelete, setSurveyToDelete] = useState<number | null>(null);

  const {
    data: surveys,
    isLoading,
    error,
  } = useQuery({
    queryKey: ['surveys'],
    queryFn: () => surveyService.getAll(),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => surveyService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['surveys'] });
      toast.success('Survey deleted successfully');
      setDeleteModalOpen(false);
    },
    onError: () => {
      toast.error('Failed to delete survey');
    },
  });

  const handleDeleteClick = (id: number) => {
    setSurveyToDelete(id);
    setDeleteModalOpen(true);
  };

  const confirmDelete = () => {
    if (surveyToDelete) {
      deleteMutation.mutate(surveyToDelete);
    }
  };

  if (isLoading) {
    return (
      <LayoutWrapper>
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-primary-600" />
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
      <Header title="Survey Management" />
      
      <div className="p-6">
        {/* Header with Actions */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Surveys</h1>
            <p className="text-gray-600 mt-1">
              Create and manage survey forms for officers to fill out
            </p>
          </div>
          
          <Link href="/admin/surveys/create">
            <Button icon={<Plus className="h-4 w-4" />}>
              Create New Survey
            </Button>
          </Link>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="card p-4">
            <div className="text-2xl font-bold text-gray-900">
              {surveys?.data?.length || 0}
            </div>
            <div className="text-sm text-gray-600">Total Surveys</div>
          </div>
          <div className="card p-4">
            <div className="text-2xl font-bold text-green-600">
              {surveys?.data?.filter(s => s.status === 'ACTIVE').length || 0}
            </div>
            <div className="text-sm text-gray-600">Active Surveys</div>
          </div>
          <div className="card p-4">
            <div className="text-2xl font-bold text-gray-600">
              {surveys?.data?.filter(s => s.status === 'DRAFT').length || 0}
            </div>
            <div className="text-sm text-gray-600">Draft Surveys</div>
          </div>
          <div className="card p-4">
            <div className="text-2xl font-bold text-blue-600">
              {surveys?.data?.reduce((acc, s) => acc + (s.submissionsCount || 0), 0) || 0}
            </div>
            <div className="text-sm text-gray-600">Total Submissions</div>
          </div>
        </div>

        {/* Survey List */}
        <SurveyList
          surveys={surveys?.data || []}
          onDelete={handleDeleteClick}
          isAdmin={true}
        />
      </div>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        title="Delete Survey"
        size="sm"
      >
        <div className="space-y-4">
          <div className="flex items-center justify-center w-12 h-12 bg-red-100 rounded-full mx-auto">
            <AlertCircle className="h-6 w-6 text-red-600" />
          </div>
          
          <div className="text-center">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Are you sure?
            </h3>
            <p className="text-gray-600">
              This will permanently delete the survey and all associated data.
              This action cannot be undone.
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
              Delete Survey
            </Button>
          </div>
        </div>
      </Modal>
    </LayoutWrapper>
  );
};

export default AdminSurveysPage;