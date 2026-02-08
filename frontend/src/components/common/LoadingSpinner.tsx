import React from 'react';
import { Loader2 } from 'lucide-react';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  text?: string;
  fullScreen?: boolean;
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  size = 'md',
  text,
  fullScreen = false,
}) => {
  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-8 w-8',
    lg: 'h-12 w-12',
  };

  if (fullScreen) {
    return (
      <div className="fixed inset-0 bg-white bg-opacity-75 flex flex-col items-center justify-center z-50">
        <Loader2 className={`${sizeClasses[size]} animate-spin text-primary-600`} />
        {text && <p className="mt-4 text-gray-600">{text}</p>}
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center p-8">
      <Loader2 className={`${sizeClasses[size]} animate-spin text-primary-600`} />
      {text && <p className="mt-2 text-gray-600">{text}</p>}
    </div>
  );
};

export default LoadingSpinner;