'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import LayoutWrapper from '@/components/common/LayoutWrapper';
import Header from '@/components/common/Header';
import SurveyForm from '@/components/surveys/SurveyForm';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';

const CreateSurveyPage: React.FC = () => {
  const router = useRouter();

  const handleSuccess = () => {
    router.push('/admin/surveys');
  };

  return (
    <LayoutWrapper>
      <Header title="Create New Survey" />
      
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

        <div className="max-w-4xl mx-auto">
          <div className="mb-8">
            <h1 className="text-2xl font-bold text-gray-900">Create New Survey</h1>
            <p className="text-gray-600 mt-2">
              Create a survey form and add fields for officers to fill out
            </p>
          </div>

          <SurveyForm onSuccess={handleSuccess} />
        </div>
      </div>
    </LayoutWrapper>
  );
};

export default CreateSurveyPage;