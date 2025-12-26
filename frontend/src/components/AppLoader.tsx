import React from 'react';
import LoadingWave from './LoadingWave';

const AppLoader: React.FC = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="text-center">
        <LoadingWave size="lg" />
        <p className="mt-4 text-muted-foreground">Loading Smart Water Monitoring...</p>
      </div>
    </div>
  );
};

export default AppLoader;

