import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { surveyService } from '@/lib/api/surveys';
import { CreateSurveyDto, SurveyStatus } from '@/types/survey';
import FieldBuilder from './FieldBuilder';
import toast from 'react-hot-toast';

const surveySchema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().optional(),
  status: z.nativeEnum(SurveyStatus).default(SurveyStatus.DRAFT),
});

type SurveyFormData = z.infer<typeof surveySchema>;

interface SurveyFormProps {
  onSuccess?: () => void;
  initialData?: Partial<CreateSurveyDto>;
}

const SurveyForm: React.FC<SurveyFormProps> = ({ onSuccess, initialData }) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [surveyId, setSurveyId] = useState<number | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SurveyFormData>({
    resolver: zodResolver(surveySchema),
    defaultValues: initialData,
  });

  const onSubmit = async (data: SurveyFormData) => {
    setIsSubmitting(true);
    try {
      const response = await surveyService.create(data);
      setSurveyId(response.id);
      toast.success('Survey created successfully!');
      if (onSuccess) onSuccess();
    } catch (error) {
      toast.error('Failed to create survey');
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div className="card p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Survey Details</h2>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Title *
              </label>
              <input
                type="text"
                {...register('title')}
                className="input-field"
                placeholder="Enter survey title"
              />
              {errors.title && (
                <p className="mt-1 text-sm text-red-600">{errors.title.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description
              </label>
              <textarea
                {...register('description')}
                className="input-field min-h-[100px]"
                placeholder="Enter survey description"
                rows={3}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Status
              </label>
              <select
                {...register('status')}
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
        </div>

        <div className="flex justify-end space-x-3">
          <button
            type="button"
            onClick={() => window.history.back()}
            className="btn-secondary"
            disabled={isSubmitting}
          >
            Cancel
          </button>
          <button
            type="submit"
            className="btn-primary"
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Creating...' : 'Create Survey'}
          </button>
        </div>
      </form>

      {surveyId && (
        <div className="mt-8">
          <FieldBuilder surveyId={surveyId.toString()} />
        </div>
      )}
    </div>
  );
};

export default SurveyForm;