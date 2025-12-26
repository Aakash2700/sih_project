import React from 'react';

interface LoadingWaveProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const LoadingWave: React.FC<LoadingWaveProps> = ({ size = 'md', className = '' }) => {
  const sizeClasses = {
    sm: 'w-32 h-8',
    md: 'w-48 h-12', 
    lg: 'w-64 h-16'
  };

  const barSizes = {
    sm: 'w-3 h-2',
    md: 'w-4 h-3',
    lg: 'w-5 h-4'
  };

  return (
    <div className={`loading-wave ${sizeClasses[size]} ${className}`}>
      <div className={`loading-bar ${barSizes[size]}`}></div>
      <div className={`loading-bar ${barSizes[size]}`}></div>
      <div className={`loading-bar ${barSizes[size]}`}></div>
      <div className={`loading-bar ${barSizes[size]}`}></div>
      <div className={`loading-bar ${barSizes[size]}`}></div>
      <div className={`loading-bar ${barSizes[size]}`}></div>
    </div>
  );
};

export default LoadingWave;

