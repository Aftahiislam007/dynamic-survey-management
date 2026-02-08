'use client';

import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { submissionService } from '@/lib/api/submissions';
import { surveyService } from '@/lib/api/surveys';
import { fieldService } from '@/lib/api/fields';
import { Survey, Field } from '@/types/survey';
import { useAuth } from '@/lib/hooks/useAuth';
import FieldRenderer from '@/components/surveys/FieldRenderer';
import { ArrowLeft, Send, Loader } from 'lucide-react';
import toast from 'react-hot-toast';
import Link from 'next/link';

interface SubmissionFormProps {
  surveyId: number;
  onSuccess?: () => void;
}

const SubmissionForm: React.FC<SubmissionFormProps> = ({ surveyId, onSuccess }) => {
  const [survey, setSurvey] = useState<Survey | null>(null);
  const [fields, setFields] = useState<Field[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { user } = useAuth();

  // Dynamically create validation schema based on fields
  const createValidationSchema = () => {
    const schema: any = {};

    fields.forEach(field => {
      let fieldSchema;
      
      switch (field.type) {
        case 'TEXT':
        case 'TEXTAREA':
          fieldSchema = z.string();
          if (field.required) fieldSchema = fieldSchema.min(1, `${field.label} is required`);
          break;
          
        case 'NUMBER':
          fieldSchema = z.number().or(z.string().transform(val => parseFloat(val)));
          if (field.required) fieldSchema = fieldSchema.refine(val => !isNaN(val) && val !== null && val !== undefined, `${field.label} is required`);
          break;
          
        case 'CHECKBOX':
          fieldSchema = z.array(z.string()).optional();
          if (field.required) fieldSchema = z.array(z.string()).min(1, `Please select at least one option for ${field.label}`);
          break;
          
        case 'RADIO':
        case 'SELECT':
          fieldSchema = z.string();
          if (field.required) fieldSchema = fieldSchema.min(1, `Please select an option for ${field.label}`);
          break;
          
        default:
          fieldSchema = z.string().optional();
      }

      schema[`answers[${field.id}]`] = fieldSchema;
    });

    return z.object(schema);
  };

  const validationSchema = createValidationSchema();
  type FormData = z.infer<typeof validationSchema>;

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
    reset,
  } = useForm<FormData>({
    resolver: zodResolver(validationSchema),
  });

  useEffect(() => {
    loadSurveyData();
  }, [surveyId]);

  const loadSurveyData = async () => {
    setIsLoading(true);
    try {
      const [surveyData, fieldData] = await Promise.all([
        surveyService.getById(surveyId),
        fieldService.getAll(surveyId.toString()),
      ]);

      setSurvey(surveyData);
      setFields(fieldData);

      // Initialize form values
      const initialValues: any = {};
      fieldData.forEach(field => {
        initialValues[`answers[${field.id}]`] = '';
      });
      reset(initialValues);
    } catch (error) {
      toast.error('Failed to load survey data');
    } finally {
      setIsLoading(false);
    }
  };

  const onSubmit = async (data: FormData) => {
    setIsSubmitting(true);
    try {
      // Transform data to match API expected format
      const answers: Record<string, any> = {};
      Object.entries(data).forEach(([key, value]) => {
        if (key.startsWith('answers[')) {
          const fieldId = key.match(/\[(.*?)\]/)?.[1];
          if (fieldId) {
            answers[fieldId] = value;
          }
        }
      });

      await submissionService.create(surveyId, { answers });
      toast.success('Survey submitted successfully!');
      
      if (onSuccess) {
        onSuccess();
      } else {
        // Navigate back to surveys list
        window.location.href = '/officer/dashboard';
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to submit survey');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader className="h-8 w-8 animate-spin text-primary-600" />
      </div>
    );
  }

  if (!survey) {
    return (
      <div className="text-center p-8">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Survey not found</h3>
        <p className="text-gray-600 mb-4">The survey you're looking for doesn't exist.</p>
        <Link href="/officer/dashboard" className="btn-primary">
          Back to Surveys
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <Link
          href="/officer/dashboard"
          className="inline-flex items-center text-sm text-primary-600 hover:text-primary-700 mb-4"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Surveys
        </Link>
        
        <div className="card p-6 mb-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">{survey.title}</h1>
          {survey.description && (
            <p className="text-gray-600 mb-4">{survey.description}</p>
          )}
          <div className="flex items-center justify-between text-sm text-gray-500">
            <span>Survey ID: #{survey.id}</span>
            <span>Required fields are marked with *</span>
          </div>
        </div>
      </div>

      {/* Progress Indicator */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-lg font-semibold text-gray-900">Survey Form</h2>
          <span className="text-sm text-gray-600">
            {fields.length} {fields.length === 1 ? 'question' : 'questions'}
          </span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div 
            className="bg-primary-600 h-2 rounded-full transition-all duration-300"
            style={{ 
              width: `${(Object.keys(watch()).filter(key => watch(key)).length / fields.length) * 100}%` 
            }}
          />
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
        <div className="card p-6 space-y-6">
          {fields.map((field, index) => (
            <div
              key={field.id}
              className="pb-6 border-b border-gray-200 last:border-b-0 last:pb-0"
            >
              <div className="flex items-start mb-4">
                <span className="flex-shrink-0 w-8 h-8 bg-primary-100 text-primary-600 rounded-full flex items-center justify-center text-sm font-medium mr-3">
                  {index + 1}
                </span>
                <div className="flex-1">
                  <FieldRenderer
                    field={field}
                    register={register}
                    errors={errors}
                    index={index}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Submission Info & Button */}
        <div className="card p-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h3 className="font-medium text-gray-900 mb-1">Submission Details</h3>
              <p className="text-sm text-gray-600">
                Submitting as: <span className="font-medium">{user?.name}</span> ({user?.email})
              </p>
              <p className="text-sm text-gray-600 mt-1">
                Survey responses cannot be edited after submission
              </p>
            </div>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex items-center justify-center space-x-2 btn-primary px-8"
            >
              {isSubmitting ? (
                <>
                  <Loader className="h-4 w-4 animate-spin" />
                  <span>Submitting...</span>
                </>
              ) : (
                <>
                  <Send className="h-4 w-4" />
                  <span>Submit Survey</span>
                </>
              )}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default SubmissionForm;