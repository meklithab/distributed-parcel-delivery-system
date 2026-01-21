import React from 'react';
import { Loader2 } from 'lucide-react';

interface LoadingSpinnerProps {
  size?: number;
  className?: string;
  color?: string;
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ size = 24, className = '', color = 'currentColor' }) => {
  return (
    <div className={`flex justify-center items-center ${className}`}>
      <Loader2 size={size} className="animate-spin text-primary" color={color} />
    </div>
  );
};
