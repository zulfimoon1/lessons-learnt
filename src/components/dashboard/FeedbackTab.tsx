
import React from "react";
import LessonFeedbackForm from "@/components/LessonFeedbackForm";

const FeedbackTab: React.FC = () => {
  return (
    <div className="space-y-6">
      <div className="bg-card p-6 rounded-lg border">
        <h2 className="text-xl font-semibold mb-4">Student Feedback</h2>
        <p className="text-muted-foreground mb-6">
          View and manage student feedback for your lessons and classes.
        </p>
        <LessonFeedbackForm />
      </div>
    </div>
  );
};

export default FeedbackTab;
