
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
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
            Review weekly summaries submitted by students
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
                          <Badge variant="outline" className="ml-auto">
                            {new Date(summary.week_start_date).toLocaleDateString()}
                          </Badge>
                        </div>
                      </Button>
                    ))
                  )}
                </div>
              )}
            </div>

            {/* Summary Details */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Summary Details</h3>
              {selectedSummary ? (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <div>
                        <span className="text-sm font-medium text-gray-600">Student:</span>
                        <p className="text-sm">{selectedSummary.student_name}</p>
                      </div>
                      <div>
                        <span className="text-sm font-medium text-gray-600">School:</span>
                        <p className="text-sm">{selectedSummary.school}</p>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div>
                        <span className="text-sm font-medium text-gray-600">Grade:</span>
                        <p className="text-sm">{selectedSummary.grade}</p>
                      </div>
                      <div>
                        <span className="text-sm font-medium text-gray-600">Week Start:</span>
                        <p className="text-sm">{new Date(selectedSummary.week_start_date).toLocaleDateString()}</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-3">
                    <div className="p-3 bg-blue-50 rounded-lg">
                      <span className="text-sm font-medium text-blue-800 flex items-center gap-2">
                        <BookOpen className="w-4 h-4" />
                        Academic Concerns:
                      </span>
                      <p className="text-sm text-blue-700 mt-1">
                        {selectedSummary.academic_concerns || 'None reported'}
                      </p>
                    </div>
                    
                    <div className="p-3 bg-purple-50 rounded-lg">
                      <span className="text-sm font-medium text-purple-800 flex items-center gap-2">
                        <Heart className="w-4 h-4" />
                        Emotional Concerns:
                      </span>
                      <p className="text-sm text-purple-700 mt-1">
                        {selectedSummary.emotional_concerns || 'None reported'}
                      </p>
                    </div>
                    
                    <div className="text-xs text-gray-500">
                      Submitted: {new Date(selectedSummary.submitted_at).toLocaleString()}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8">
                  <BookOpen className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-500">Select a summary to view details</p>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default WeeklySummaryReview;
