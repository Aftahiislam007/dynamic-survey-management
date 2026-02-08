import React from 'react';
import { Survey, SurveyStatus } from '@/types/survey';
import { format } from 'date-fns';
import { 
  FileText, 
  Users, 
  Calendar, 
  CheckCircle, 
  Clock, 
  Archive,
  Edit2,
  Trash2,
  Eye
} from 'lucide-react';
import Link from 'next/link';

interface SurveyCardProps {
  survey: Survey;
  onDelete?: (id: number) => void;
  showActions?: boolean;
  isAdmin?: boolean;
}

const SurveyCard: React.FC<SurveyCardProps> = ({ 
  survey, 
  onDelete, 
  showActions = true,
  isAdmin = false 
}) => {
  const statusColors: Record<SurveyStatus, string> = {
    [SurveyStatus.DRAFT]: 'bg-gray-100 text-gray-800',
    [SurveyStatus.ACTIVE]: 'bg-green-100 text-green-800',
    [SurveyStatus.INACTIVE]: 'bg-yellow-100 text-yellow-800',
    [SurveyStatus.ARCHIVED]: 'bg-red-100 text-red-800',
  };

  const statusIcons: Record<SurveyStatus, React.ReactNode> = {
    [SurveyStatus.DRAFT]: <Clock className="h-4 w-4" />,
    [SurveyStatus.ACTIVE]: <CheckCircle className="h-4 w-4" />,
    [SurveyStatus.INACTIVE]: <Clock className="h-4 w-4" />,
    [SurveyStatus.ARCHIVED]: <Archive className="h-4 w-4" />,
  };

  const getStatusDisplay = (status: SurveyStatus) => {
    const statusMap: Record<SurveyStatus, string> = {
      [SurveyStatus.DRAFT]: 'Draft',
      [SurveyStatus.ACTIVE]: 'Active',
      [SurveyStatus.INACTIVE]: 'Inactive',
      [SurveyStatus.ARCHIVED]: 'Archived',
    };
    return statusMap[status] || status;
  };

  return (
    <div className="card hover:shadow-lg transition-shadow duration-200">
      <div className="p-6">
        <div className="flex justify-between items-start mb-4">
          <div>
            <div className="flex items-center space-x-2 mb-2">
              <FileText className="h-5 w-5 text-primary-600" />
              <h3 className="text-lg font-semibold text-gray-900">
                {survey.title}
              </h3>
            </div>
            {survey.description && (
              <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                {survey.description}
              </p>
            )}
          </div>
          <span
            className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${statusColors[survey.status]}`}
          >
            {statusIcons[survey.status]}
            <span className="ml-1">{getStatusDisplay(survey.status)}</span>
          </span>
        </div>

        <div className="grid grid-cols-2 gap-4 mb-4">
          <div className="flex items-center text-sm text-gray-600">
            <Calendar className="h-4 w-4 mr-2" />
            <span>
              {format(new Date(survey.createdAt), 'MMM dd, yyyy')}
            </span>
          </div>
          <div className="flex items-center text-sm text-gray-600">
            <Users className="h-4 w-4 mr-2" />
            <span>{survey.submissionsCount || 0} submissions</span>
          </div>
          <div className="col-span-2">
            <div className="flex items-center text-sm text-gray-600">
              <div className="mr-2">Fields:</div>
              <div className="flex flex-wrap gap-1">
                {survey.fields?.slice(0, 3).map((field, index) => (
                  <span
                    key={index}
                    className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded"
                  >
                    {field.label}
                  </span>
                ))}
                {survey.fields && survey.fields.length > 3 && (
                  <span className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded">
                    +{survey.fields.length - 3} more
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>

        {showActions && (
          <div className="flex justify-between items-center pt-4 border-t border-gray-200">
            <div className="flex space-x-2">
              {isAdmin ? (
                <>
                  <Link
                    href={`/admin/surveys/${survey.id}`}
                    className="flex items-center space-x-1 text-sm text-primary-600 hover:text-primary-700"
                  >
                    <Edit2 className="h-4 w-4" />
                    <span>Edit</span>
                  </Link>
                  <Link
                    href={`/admin/submissions?survey=${survey.id}`}
                    className="flex items-center space-x-1 text-sm text-gray-600 hover:text-gray-700"
                  >
                    <Eye className="h-4 w-4" />
                    <span>View Submissions</span>
                  </Link>
                </>
              ) : (
                <Link
                  href={`/officer/surveys/${survey.id}`}
                  className="flex items-center space-x-1 text-sm btn-primary"
                >
                  <FileText className="h-4 w-4" />
                  <span>Take Survey</span>
                </Link>
              )}
            </div>

            {isAdmin && onDelete && (
              <button
                onClick={() => onDelete(survey.id)}
                className="text-red-600 hover:text-red-800 p-1"
                title="Delete survey"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default SurveyCard;