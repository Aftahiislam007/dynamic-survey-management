'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { surveyService } from '@/lib/api/surveys';
import { fieldService } from '@/lib/api/fields';
import LayoutWrapper from '@/components/common/LayoutWrapper';
import Header from '@/components/common/Header';
import FieldBuilder from '@/components/surveys/FieldBuilder';
import Button from '@/components/ui/Button';
import Modal from '@/components/ui/Modal';
import Input from '@/components/ui/Input';
import { 
  ArrowLeft, 
  Edit2, 
  Save, 
  X, 
  AlertCircle,
  FileText,
  Settings,
  Fields
} from 'lucide-react';
import Link from 'next/link';
import toast from 'react-hot-toast';
import { SurveyStatus } from '@/types/survey';

const EditSurveyPage: React.FC = () => {
  const params = useParams();
  const router = useRouter();
  const queryClient = useQueryClient();
  const surveyId = params.id as string;

  const [editMode, setEditMode] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState<SurveyStatus>(SurveyStatus.DRAFT);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);

  const {
    data: survey,
    isLoading,
    error,
  } = useQuery({
    queryKey: ['survey', surveyId],
    queryFn: () => surveyService.getById(parseInt(surveyId)),
    enabled: !!surveyId,
  });

  const updateMutation = useMutation({
    mutationFn: () =>
      surveyService.update(parseInt(surveyId), {
        title,
        description,
        status,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['survey', surveyId] });
      queryClient.invalidateQueries({ queryKey: ['surveys'] });
      setEditMode(false);
      toast.success('Survey updated successfully');
    },
    onError: () => {
      toast.error('Failed to update survey');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: () => surveyService.delete(parseInt(surveyId)),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['surveys'] });
      toast.success('Survey deleted successfully');
      router.push('/admin/surveys');
    },
    onError: () => {
      toast.error('Failed to delete survey');
    },
  });

  const statusUpdateMutation = useMutation({
    mutationFn: (newStatus: SurveyStatus) =>
      surveyService.updateStatus(parseInt(surveyId), newStatus),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['survey', surveyId] });
      queryClient.invalidateQueries({ queryKey: ['surveys'] });
      toast.success('Status updated successfully');
    },
    onError: () => {
      toast.error('Failed to update status');
    },
  });

  useEffect(() => {
    if (survey) {
      setTitle(survey.title);
      setDescription(survey.description || '');
      setStatus(survey.status);
    }
  }, [survey]);

  const handleSave = () => {
    updateMutation.mutate();
  };

  const handleCancel = () => {
    if (survey) {
      setTitle(survey.title);
      setDescription(survey.description || '');
      setStatus(survey.status);
    }
    setEditMode(false);
  };

  const handleStatusChange = (newStatus: SurveyStatus) => {
    statusUpdateMutation.mutate(newStatus);
  };

  const handleDelete = () => {
    deleteMutation.mutate();
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

  if (error || !survey) {
    return (
      <LayoutWrapper>
        <div className="p-6">
          <div className="text-center py-12">
            <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Survey not found</h2>
            <p className="text-gray-600 mb-6">The survey you're looking for doesn't exist.</p>
            <Link href="/admin/surveys" className="btn-primary">
              Back to Surveys
            </Link>
          </div>
        </div>
      </LayoutWrapper>
    );
  }

  return (
    <LayoutWrapper>
      <Header title={`Survey: ${survey.title}`} />
      
      <div className="p-6">
        <div className="mb-6">
          <Link
            href="/admin/surveys"
            className="inline-flex items-center text-sm text-gray-600 hover:text-gray-900"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Surveys
          </Link>
        </div>

        <div className="max-w-6xl mx-auto">
          {/* Survey Header */}
          <div className="card p-6 mb-6">
            <div className="flex items-start justify-between mb-6">
              <div className="flex-1">
                {editMode ? (
                  <div className="space-y-4">
                    <Input
                      label="Survey Title"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      required
                    />
                    <Input
                      label="Description"
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      as="textarea"
                      rows={3}
                    />
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Status
                      </label>
                      <select
                        value={status}
                        onChange={(e) => setStatus(e.target.value as SurveyStatus)}
                        className="input-field"
                      >
                        {Object.values(SurveyStatus).map((status) => (
                          <option key={status} value={status}>
                            {status.charAt(0) + status.slice(1).toLowerCase()}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                ) : (
                  <div>
                    <h1 className="text-2xl font-bold text-gray-900 mb-2">
                      {survey.title}
                    </h1>
                    {survey.description && (
                      <p className="text-gray-600 mb-4">{survey.description}</p>
                    )}
                    <div className="flex items-center space-x-4 text-sm text-gray-500">
                      <span className="px-3 py-1 bg-gray-100 rounded-full">
                        {survey.status}
                      </span>
                      <span>Created: {new Date(survey.createdAt).toLocaleDateString()}</span>
                      <span>ID: #{survey.id}</span>
                      <span>{survey.submissionsCount || 0} submissions</span>
                    </div>
                  </div>
                )}
              </div>

              <div className="flex items-center space-x-2 ml-4">
                {editMode ? (
                  <>
                    <Button
                      variant="outline"
                      onClick={handleCancel}
                      disabled={updateMutation.isPending}
                    >
                      <X className="h-4 w-4 mr-2" />
                      Cancel
                    </Button>
                    <Button
                      onClick={handleSave}
                      loading={updateMutation.isPending}
                    >
                      <Save className="h-4 w-4 mr-2" />
                      Save Changes
                    </Button>
                  </>
                ) : (
                  <>
                    <Button
                      variant="outline"
                      onClick={() => setEditMode(true)}
                    >
                      <Edit2 className="h-4 w-4 mr-2" />
                      Edit
                    </Button>
                    
                    {/* Quick Status Change */}
                    <div className="relative">
                      <select
                        value={status}
                        onChange={(e) => handleStatusChange(e.target.value as SurveyStatus)}
                        className="input-field text-sm"
                        disabled={statusUpdateMutation.isPending}
                      >
                        {Object.values(SurveyStatus).map((s) => (
                          <option key={s} value={s}>
                            Set to {s.toLowerCase()}
                          </option>
                        ))}
                      </select>
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* Navigation Tabs */}
            <div className="border-b border-gray-200">
              <nav className="-mb-px flex space-x-8">
                <button className="border-b-2 border-primary-500 text-primary-600 px-1 py-2 text-sm font-medium">
                  <div className="flex items-center">
                    <Fields className="h-4 w-4 mr-2" />
                    Fields & Questions
                  </div>
                </button>
                <Link
                  href={`/admin/submissions?survey=${survey.id}`}
                  className="text-gray-500 hover:text-gray-700 px-1 py-2 text-sm font-medium"
                >
                  <div className="flex items-center">
                    <FileText className="h-4 w-4 mr-2" />
                    Submissions ({survey.submissionsCount || 0})
                  </div>
                </Link>
                <button className="text-gray-500 hover:text-gray-700 px-1 py-2 text-sm font-medium">
                  <div className="flex items-center">
                    <Settings className="h-4 w-4 mr-2" />
                    Settings
                  </div>
                </button>
              </nav>
            </div>
          </div>

          {/* Field Builder */}
          <div className="mb-6">
            <FieldBuilder surveyId={surveyId} />
          </div>

          {/* Danger Zone */}
          <div className="card border border-red-200">
            <div className="p-6">
              <h3 className="text-lg font-medium text-red-700 mb-2">Danger Zone</h3>
              <p className="text-sm text-red-600 mb-4">
                Once you delete a survey, there is no going back. Please be certain.
              </p>
              <Button
                variant="danger"
                onClick={() => setDeleteModalOpen(true)}
                disabled={deleteMutation.isPending}
              >
                Delete this survey
              </Button>
            </div>
          </div>
        </div>
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
              Delete "{survey.title}"?
            </h3>
            <p className="text-gray-600">
              This will permanently delete the survey, all its fields, and {survey.submissionsCount || 0} submissions.
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
              onClick={handleDelete}
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

export default EditSurveyPage;