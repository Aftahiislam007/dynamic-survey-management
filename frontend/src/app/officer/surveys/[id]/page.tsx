'use client';

import React from 'react';
import { useParams } from 'next/navigation';
import LayoutWrapper from '@/components/common/LayoutWrapper';
import Header from '@/components/common/Header';
import SubmissionForm from '@/components/submissions/SubmissionForm';
import { useAuth } from '@/lib/hooks/useAuth';

const OfficerSurveyDetailPage: React.FC = () => {
  const params = useParams();
  const { requireAuth } = useAuth();
  const surveyId = parseInt(params.id as string);

  // Ensure officer is authenticated
  if (!requireAuth()) {
    return null;
  }

  return (
    <LayoutWrapper>
      <Header title="Survey Submission" />
      
      <div className="p-6">
        <SubmissionForm 
          surveyId={surveyId}
          onSuccess={() => {
            // Could navigate to a success page or back to dashboard
          }}
        />
      </div>
    </LayoutWrapper>
  );
};

export default OfficerSurveyDetailPage;