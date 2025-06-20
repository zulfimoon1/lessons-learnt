import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Calendar, User, School, BookOpen, Heart, Brain } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface WeeklySummary {
  id: string;
  student_name: string;
  school: string;
  grade: string;
  week_start_date: string;
  academic_concerns: string;
  emotional_concerns: string;
  submitted_at: string;
}

const WeeklySummaryReview = () => {
  const [summaries, setSummaries] = useState<WeeklySummary[]>([]);
  const [selectedSummary, setSelectedSummary] = useState<WeeklySummary | null>(null);
  const [responseText, setResponseText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    loadSummaries();
  }, []);

  const loadSummaries = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('weekly_summaries')
        .select('*')
        .order('submitted_at', { ascending: false });

      if (error) {
        console.error("Error loading summaries:", error);
        toast({
          title: "Error",
          description: "Failed to load weekly summaries",
          variant: "destructive",
        });
      } else {
        setSummaries(data || []);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleSummarySelect = (summary: WeeklySummary) => {
    setSelectedSummary(summary);
    setResponseText(''); // Clear response text when selecting a new summary
  };

  const handleResponseChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setResponseText(e.target.value);
  };

  const handleSubmitResponse = async () => {
    if (!selectedSummary) {
      toast({
        title: "Error",
        description: "No summary selected",
        variant: "destructive",
      });
      return;
    }

    if (!responseText.trim()) {
      toast({
        title: "Error",
        description: "Response cannot be empty",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      // Simulate sending a response (replace with actual logic)
      await new Promise(resolve => setTimeout(resolve, 1000));

      toast({
        title: "Response Sent",
        description: `Response sent to ${selectedSummary.student_name}`,
      });

      // Clear selected summary and response text
      setSelectedSummary(null);
      setResponseText('');
    } catch (error) {
      console.error("Error sending response:", error);
      toast({
        title: "Error",
        description: "Failed to send response",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-blue-500" />
            Weekly Summary Review
          </CardTitle>
          <CardDescription>
            Review and respond to weekly summaries submitted by students
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Summary List */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Weekly Summaries</h3>
              {isLoading ? (
                <p>Loading summaries...</p>
              ) : (
                <div className="space-y-2">
                  {summaries.length === 0 ? (
                    <p>No summaries found.</p>
                  ) : (
                    summaries.map((summary) => (
                      <Button
                        key={summary.id}
                        variant={selectedSummary?.id === summary.id ? "secondary" : "outline"}
                        className="w-full justify-start"
                        onClick={() => handleSummarySelect(summary)}
                      >
                        <div className="flex items-center gap-2">
                          <User className="w-4 h-4" />
                          {summary.student_name}
                        </div>
                      </Button>
                    ))
                  )}
                </div>
              )}
            </div>

            {/* Response Form */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Response</h3>
              {selectedSummary ? (
                <div className="space-y-2">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    <div>
                      <span className="text-sm font-medium">Student:</span>
                      <p className="text-sm">{selectedSummary.student_name}</p>
                    </div>
                    <div>
                      <span className="text-sm font-medium">School:</span>
                      <p className="text-sm">{selectedSummary.school}</p>
                    </div>
                    <div>
                      <span className="text-sm font-medium">Grade:</span>
                      <p className="text-sm">{selectedSummary.grade}</p>
                    </div>
                    <div>
                      <span className="text-sm font-medium">Week Start:</span>
                      <p className="text-sm">{selectedSummary.week_start_date}</p>
                    </div>
                  </div>
                  <div>
                    <span className="text-sm font-medium">Academic Concerns:</span>
                    <p className="text-sm">{selectedSummary.academic_concerns || 'None'}</p>
                  </div>
                  <div>
                    <span className="text-sm font-medium">Emotional Concerns:</span>
                    <p className="text-sm">{selectedSummary.emotional_concerns || 'None'}</p>
                  </div>
                  <div>
                    <Label htmlFor="response">Your Response</Label>
                    <Textarea
                      id="response"
                      placeholder="Enter your response here"
                      value={responseText}
                      onChange={handleResponseChange}
                    />
                  </div>
                  <Button onClick={handleSubmitResponse} disabled={isLoading} className="w-full">
                    {isLoading ? "Sending..." : "Send Response"}
                  </Button>
                </div>
              ) : (
                <p>Select a summary to view and respond.</p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default WeeklySummaryReview;
