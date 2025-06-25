
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { AlertCircle, Cloud, CloudOff, CheckCircle, Clock } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useOfflineCapabilities } from '@/hooks/useOfflineCapabilities';
import { useLanguage } from '@/contexts/LanguageContext';

interface OfflineAwareFeedbackFormProps {
  classScheduleId: string;
  studentId?: string;
  studentName?: string;
  onSubmit?: (data: any) => void;
  className?: string;
}

const OfflineAwareFeedbackForm: React.FC<OfflineAwareFeedbackFormProps> = ({
  classScheduleId,
  studentId,
  studentName,
  onSubmit,
  className
}) => {
  const { t } = useLanguage();
  const { toast } = useToast();
  const { 
    isOnline, 
    syncStatus, 
    storeOfflineOperation, 
    syncPendingOperations 
  } = useOfflineCapabilities();

  const [formData, setFormData] = useState({
    understanding: 3,
    interest: 3,
    educational_growth: 3,
    emotional_state: 'neutral',
    what_went_well: '',
    suggestions: '',
    additional_comments: ''
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  // Handle form submission (online or offline)
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    const feedbackData = {
      ...formData,
      class_schedule_id: classScheduleId,
      student_id: studentId,
      student_name: studentName,
      is_anonymous: !studentId,
      submitted_at: new Date().toISOString()
    };

    try {
      if (isOnline) {
        // Try to submit directly if online
        // This would normally use your existing feedback service
        console.log('📤 Submitting feedback online:', feedbackData);
        
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        toast({
          title: "Feedback Submitted",
          description: "Your feedback has been submitted successfully.",
        });
      } else {
        // Store for offline sync if offline
        await storeOfflineOperation('feedback', feedbackData, 'insert');
        
        toast({
          title: "Feedback Saved Offline",
          description: "Your feedback will be submitted when you're back online.",
          variant: "default"
        });
      }

      // Reset form
      setFormData({
        understanding: 3,
        interest: 3,
        educational_growth: 3,
        emotional_state: 'neutral',
        what_went_well: '',
        suggestions: '',
        additional_comments: ''
      });

      onSubmit?.(feedbackData);
    } catch (error) {
      console.error('Error submitting feedback:', error);
      
      // If online submission fails, store offline
      if (isOnline) {
        await storeOfflineOperation('feedback', feedbackData, 'insert');
        toast({
          title: "Submission Failed",
          description: "Feedback saved offline and will be submitted later.",
          variant: "destructive"
        });
      } else {
        toast({
          title: "Error",
          description: "Unable to save feedback. Please try again.",
          variant: "destructive"
        });
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  // Manual sync trigger
  const handleManualSync = async () => {
    if (!isOnline) {
      toast({
        title: "No Connection",
        description: "Please check your internet connection and try again.",
        variant: "destructive"
      });
      return;
    }

    try {
      const result = await syncPendingOperations();
      
      if (result.success) {
        toast({
          title: "Sync Successful",
          description: `Successfully synced ${result.synced} items.`,
        });
      } else {
        toast({
          title: "Sync Partially Failed",
          description: `Synced ${result.synced} items, but ${result.errors.length} failed.`,
          variant: "destructive"
        });
      }
    } catch (error) {
      toast({
        title: "Sync Failed",
        description: "Unable to sync pending items. Please try again later.",
        variant: "destructive"
      });
    }
  };

  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            {t('feedback.title') || 'Lesson Feedback'}
            {isOnline ? (
              <Cloud className="w-4 h-4 text-green-600" />
            ) : (
              <CloudOff className="w-4 h-4 text-orange-600" />
            )}
          </CardTitle>
          
          <div className="flex items-center gap-2">
            <Badge variant={isOnline ? "default" : "secondary"}>
              {isOnline ? 'Online' : 'Offline'}
            </Badge>
            
            {syncStatus.pendingOperations > 0 && (
              <Badge variant="outline" className="flex items-center gap-1">
                <Clock className="w-3 h-3" />
                {syncStatus.pendingOperations} pending
              </Badge>
            )}
          </div>
        </div>
        
        {!isOnline && (
          <div className="bg-orange-50 border border-orange-200 p-3 rounded-lg">
            <div className="flex items-center gap-2 text-orange-800">
              <AlertCircle className="w-4 h-4" />
              <span className="text-sm font-medium">Working Offline</span>
            </div>
            <p className="text-sm text-orange-700 mt-1">
              Your feedback will be saved locally and submitted when you're back online.
            </p>
          </div>
        )}
      </CardHeader>

      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Rating inputs */}
          <div className="grid gap-4 md:grid-cols-3">
            <div>
              <label className="text-sm font-medium mb-2 block">
                Understanding (1-5)
              </label>
              <input
                type="range"
                min="1"
                max="5"
                value={formData.understanding}
                onChange={(e) => setFormData({...formData, understanding: parseInt(e.target.value)})}
                className="w-full"
              />
              <div className="text-center text-sm text-gray-600 mt-1">
                {formData.understanding}
              </div>
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">
                Interest (1-5)
              </label>
              <input
                type="range"
                min="1"
                max="5"
                value={formData.interest}
                onChange={(e) => setFormData({...formData, interest: parseInt(e.target.value)})}
                className="w-full"
              />
              <div className="text-center text-sm text-gray-600 mt-1">
                {formData.interest}
              </div>
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">
                Growth (1-5)
              </label>
              <input
                type="range"
                min="1"
                max="5"
                value={formData.educational_growth}
                onChange={(e) => setFormData({...formData, educational_growth: parseInt(e.target.value)})}
                className="w-full"
              />
              <div className="text-center text-sm text-gray-600 mt-1">
                {formData.educational_growth}
              </div>
            </div>
          </div>

          {/* Text feedback */}
          <div>
            <label className="text-sm font-medium mb-2 block">
              What went well?
            </label>
            <Textarea
              value={formData.what_went_well}
              onChange={(e) => setFormData({...formData, what_went_well: e.target.value})}
              placeholder="Share what you enjoyed about the lesson..."
              className="min-h-[80px]"
            />
          </div>

          <div>
            <label className="text-sm font-medium mb-2 block">
              Suggestions for improvement
            </label>
            <Textarea
              value={formData.suggestions}
              onChange={(e) => setFormData({...formData, suggestions: e.target.value})}
              placeholder="How could the lesson be improved?"
              className="min-h-[80px]"
            />
          </div>

          {/* Action buttons */}
          <div className="flex gap-2 justify-between">
            <Button
              type="submit"
              disabled={isSubmitting}
              className="flex-1"
            >
              {isSubmitting ? (
                "Submitting..."
              ) : isOnline ? (
                <>
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Submit Feedback
                </>
              ) : (
                <>
                  <CloudOff className="w-4 h-4 mr-2" />
                  Save Offline
                </>
              )}
            </Button>

            {syncStatus.pendingOperations > 0 && (
              <Button
                type="button"
                variant="outline"
                onClick={handleManualSync}
                disabled={!isOnline || syncStatus.isSyncing}
              >
                {syncStatus.isSyncing ? "Syncing..." : "Sync Now"}
              </Button>
            )}
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default OfflineAwareFeedbackForm;
