
import React from "react";
import LessonFeedbackForm from "@/components/LessonFeedbackForm";
import { useLanguage } from "@/contexts/LanguageContext";

const FeedbackTab: React.FC = () => {
  const { t } = useLanguage();

  return (
    <div className="space-y-6">
      <div className="bg-card p-6 rounded-lg border">
        <h2 className="text-xl font-semibold mb-4">
          Share Your Thoughts About Class
        </h2>
        <p className="text-muted-foreground mb-6">
          Tell us how your classes are going! Your thoughts help make school even better.
        </p>
        <LessonFeedbackForm />
      </div>
    </div>
  );
};

export default FeedbackTab;
