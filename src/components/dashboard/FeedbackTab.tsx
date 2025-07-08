
import React from "react";
import FeedbackFlow from "@/components/feedback/FeedbackFlow";
import { useLanguage } from "@/contexts/LanguageContext";

const FeedbackTab: React.FC = () => {
  const { t } = useLanguage();

  return (
    <div className="space-y-6">
      <FeedbackFlow />
    </div>
  );
};

export default FeedbackTab;
