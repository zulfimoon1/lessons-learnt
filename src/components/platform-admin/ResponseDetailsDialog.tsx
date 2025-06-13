
import React from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { getTrafficLightColor } from "@/components/EmotionalStateSelector";

interface FeedbackResponse {
  id: string;
  student_name: string;
  school: string;
  grade: string;
  subject: string;
  class_date: string;
  understanding: number;
  interest: number;
  educational_growth: number;
  emotional_state: string;
  what_went_well: string;
  suggestions: string;
  additional_comments: string;
  is_anonymous: boolean;
  submitted_at: string;
}

interface ResponseDetailsDialogProps {
  response: FeedbackResponse | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const ResponseDetailsDialog: React.FC<ResponseDetailsDialogProps> = ({
  response,
  open,
  onOpenChange
}) => {
  if (!response) return null;

  const getEmotionalStateDisplay = (state: string) => {
    const colorClasses = getTrafficLightColor(state);
    
    return (
      <span className={`px-3 py-1 rounded-md text-sm font-medium border ${colorClasses}`}>
        {state}
      </span>
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3">
            Response Details
            {response.is_anonymous && (
              <Badge variant="secondary" className="text-xs">Anonymous</Badge>
            )}
          </DialogTitle>
          <DialogDescription>
            Detailed view of student feedback response
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Student Information */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-gray-600">Student</label>
              <p className="text-sm">{response.student_name}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-600">School</label>
              <p className="text-sm">{response.school}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-600">Grade</label>
              <p className="text-sm">
                <Badge variant="outline">{response.grade}</Badge>
              </p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-600">Subject</label>
              <p className="text-sm">{response.subject}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-600">Class Date</label>
              <p className="text-sm">{new Date(response.class_date).toLocaleDateString()}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-600">Submitted</label>
              <p className="text-sm">{new Date(response.submitted_at).toLocaleString()}</p>
            </div>
          </div>

          <Separator />

          {/* Ratings */}
          <div className="space-y-4">
            <h3 className="font-medium">Ratings</h3>
            <div className="grid grid-cols-3 gap-4">
              <div className="text-center p-3 bg-gray-50 rounded-lg">
                <p className="text-sm font-medium text-gray-600">Understanding</p>
                <p className="text-2xl font-bold text-blue-600">{response.understanding}/5</p>
              </div>
              <div className="text-center p-3 bg-gray-50 rounded-lg">
                <p className="text-sm font-medium text-gray-600">Interest</p>
                <p className="text-2xl font-bold text-green-600">{response.interest}/5</p>
              </div>
              <div className="text-center p-3 bg-gray-50 rounded-lg">
                <p className="text-sm font-medium text-gray-600">Educational Growth</p>
                <p className="text-2xl font-bold text-purple-600">{response.educational_growth}/5</p>
              </div>
            </div>
          </div>

          <Separator />

          {/* Emotional State */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-600">Emotional State</label>
            <div>{getEmotionalStateDisplay(response.emotional_state)}</div>
          </div>

          <Separator />

          {/* Text Responses */}
          <div className="space-y-4">
            <h3 className="font-medium">Written Responses</h3>
            
            {response.what_went_well && (
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-600">What went well?</label>
                <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                  <p className="text-sm text-gray-800">{response.what_went_well}</p>
                </div>
              </div>
            )}

            {response.suggestions && (
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-600">Suggestions for improvement</label>
                <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                  <p className="text-sm text-gray-800">{response.suggestions}</p>
                </div>
              </div>
            )}

            {response.additional_comments && (
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-600">Additional comments</label>
                <div className="p-3 bg-gray-50 border border-gray-200 rounded-lg">
                  <p className="text-sm text-gray-800">{response.additional_comments}</p>
                </div>
              </div>
            )}

            {!response.what_went_well && !response.suggestions && !response.additional_comments && (
              <p className="text-sm text-gray-500 italic">No written responses provided</p>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ResponseDetailsDialog;
