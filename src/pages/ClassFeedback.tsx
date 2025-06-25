
import React from 'react';
import { useParams } from 'react-router-dom';

const ClassFeedback: React.FC = () => {
  const { scheduleId } = useParams();

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="container mx-auto">
        <h1 className="text-3xl font-bold mb-6">Class Feedback</h1>
        <p className="text-muted-foreground">
          Class feedback for schedule ID: {scheduleId}
        </p>
      </div>
    </div>
  );
};

export default ClassFeedback;
