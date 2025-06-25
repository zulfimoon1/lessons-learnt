
import React, { memo, useState, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { MessageSquare, ThumbsUp, ThumbsDown, Send, Shield } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useDebounce, useOptimizedFilter } from "@/hooks/usePerformanceOptimization";

interface FeedbackItem {
  id: string;
  content: string;
  studentName: string;
  timestamp: string;
  sentiment: 'positive' | 'negative' | 'neutral';
  isSecure: boolean;
}

interface OptimizedFeedbackSystemProps {
  feedbackItems: FeedbackItem[];
  onSubmitFeedback?: (content: string) => void;
  className?: string;
}

const FeedbackCard = memo(({ feedback }: { feedback: FeedbackItem }) => (
  <Card className="mb-4 border-l-4 border-l-brand-teal">
    <CardContent className="p-4">
      <div className="flex justify-between items-start mb-2">
        <div className="flex items-center gap-2">
          <MessageSquare className="w-4 h-4 text-brand-teal" />
          <span className="font-medium">{feedback.studentName}</span>
          {feedback.isSecure && (
            <Badge variant="outline" className="text-xs">
              <Shield className="w-3 h-3 mr-1" />
              Secure
            </Badge>
          )}
        </div>
        <div className="flex items-center gap-2">
          {feedback.sentiment === 'positive' && <ThumbsUp className="w-4 h-4 text-green-500" />}
          {feedback.sentiment === 'negative' && <ThumbsDown className="w-4 h-4 text-red-500" />}
          <span className="text-xs text-gray-500">
            {new Date(feedback.timestamp).toLocaleDateString()}
          </span>
        </div>
      </div>
      <p className="text-sm text-gray-700">{feedback.content}</p>
    </CardContent>
  </Card>
));

FeedbackCard.displayName = "FeedbackCard";

const OptimizedFeedbackSystem = memo(({ 
  feedbackItems = [], 
  onSubmitFeedback,
  className 
}: OptimizedFeedbackSystemProps) => {
  const [newFeedback, setNewFeedback] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  // Debounced search to improve performance
  const debouncedSearch = useDebounce((term: string) => {
    setSearchTerm(term);
  }, 300);

  // Optimized filtering with memoization
  const filteredFeedback = useOptimizedFilter(
    feedbackItems,
    searchTerm,
    (item, term) => 
      item.content.toLowerCase().includes(term) ||
      item.studentName.toLowerCase().includes(term)
  );

  const handleSubmitFeedback = useCallback(async () => {
    if (!newFeedback.trim() || !onSubmitFeedback) return;

    setIsSubmitting(true);
    try {
      await onSubmitFeedback(newFeedback.trim());
      setNewFeedback('');
      toast({
        title: "Feedback Submitted",
        description: "Your feedback has been securely recorded",
      });
    } catch (error) {
      toast({
        title: "Submission Failed",
        description: "Failed to submit feedback. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  }, [newFeedback, onSubmitFeedback, toast]);

  return (
    <div className={className}>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageSquare className="w-5 h-5 text-brand-teal" />
            Secure Feedback System
            <Badge variant="outline" className="ml-auto">
              <Shield className="w-3 h-3 mr-1" />
              Enhanced Security
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {/* Feedback submission form */}
          {onSubmitFeedback && (
            <div className="mb-6 space-y-4">
              <Textarea
                placeholder="Share your feedback securely..."
                value={newFeedback}
                onChange={(e) => setNewFeedback(e.target.value)}
                className="min-h-[100px] border-brand-teal/30 focus:border-brand-teal"
              />
              <div className="flex justify-between items-center">
                <span className="text-xs text-gray-500">
                  All feedback is encrypted and securely stored
                </span>
                <Button 
                  onClick={handleSubmitFeedback}
                  disabled={!newFeedback.trim() || isSubmitting}
                  className="bg-brand-teal hover:bg-brand-dark"
                >
                  <Send className="w-4 h-4 mr-2" />
                  {isSubmitting ? 'Submitting...' : 'Submit Feedback'}
                </Button>
              </div>
            </div>
          )}

          {/* Search and filter */}
          <div className="mb-4">
            <input
              type="text"
              placeholder="Search feedback..."
              onChange={(e) => debouncedSearch(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-md focus:border-brand-teal focus:outline-none"
            />
          </div>

          {/* Feedback statistics */}
          <div className="grid grid-cols-3 gap-4 mb-6">
            <Card className="p-3 bg-green-50">
              <div className="text-center">
                <ThumbsUp className="w-6 h-6 text-green-600 mx-auto mb-1" />
                <p className="text-lg font-bold text-green-600">
                  {filteredFeedback.filter(f => f.sentiment === 'positive').length}
                </p>
                <p className="text-xs text-green-700">Positive</p>
              </div>
            </Card>
            <Card className="p-3 bg-red-50">
              <div className="text-center">
                <ThumbsDown className="w-6 h-6 text-red-600 mx-auto mb-1" />
                <p className="text-lg font-bold text-red-600">
                  {filteredFeedback.filter(f => f.sentiment === 'negative').length}
                </p>
                <p className="text-xs text-red-700">Needs Attention</p>
              </div>
            </Card>
            <Card className="p-3 bg-blue-50">
              <div className="text-center">
                <MessageSquare className="w-6 h-6 text-blue-600 mx-auto mb-1" />
                <p className="text-lg font-bold text-blue-600">{filteredFeedback.length}</p>
                <p className="text-xs text-blue-700">Total</p>
              </div>
            </Card>
          </div>

          {/* Feedback list */}
          <div className="max-h-96 overflow-y-auto">
            {filteredFeedback.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <MessageSquare className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>No feedback found</p>
              </div>
            ) : (
              filteredFeedback.map(feedback => (
                <FeedbackCard key={feedback.id} feedback={feedback} />
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
});

OptimizedFeedbackSystem.displayName = "OptimizedFeedbackSystem";

export default OptimizedFeedbackSystem;
