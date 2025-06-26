import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BarChart, MessageSquare, TrendingUp } from "lucide-react";
import HierarchicalFeedbackAnalytics from "./HierarchicalFeedbackAnalytics";

interface FeedbackData {
  teacher_name: string;
  lesson_topic: string;
  class_date: string;
  subject: string;
  avg_understanding: number;
  avg_interest: number;
  avg_growth: number;
  total_responses: number;
}

interface FeedbackAnalyticsProps {
  school: string;
}

const FeedbackAnalytics: React.FC<FeedbackAnalyticsProps> = ({ school }) => {
  return (
    <div className="space-y-6">
      <Tabs defaultValue="hierarchical" className="space-y-4">
        <TabsList className="bg-white/90 backdrop-blur-sm border border-gray-200/50">
          <TabsTrigger value="hierarchical" className="flex items-center gap-2">
            <TrendingUp className="w-4 h-4" />
            Teacher Analytics
          </TabsTrigger>
          <TabsTrigger value="overview" className="flex items-center gap-2">
            <BarChart className="w-4 h-4" />
            Overview Charts
          </TabsTrigger>
        </TabsList>

        <TabsContent value="hierarchical">
          <Card className="bg-white/90 backdrop-blur-sm border-gray-200/50 shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageSquare className="w-5 h-5" />
                Detailed Teacher Performance Analysis
              </CardTitle>
            </CardHeader>
            <CardContent>
              <HierarchicalFeedbackAnalytics school={school} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="overview">
          <Card className="bg-white/90 backdrop-blur-sm border-gray-200/50 shadow-lg">
            <CardHeader>
              <CardTitle>Performance Charts (Legacy View)</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-center text-muted-foreground py-8">
                Chart view available for future enhancements
              </p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default FeedbackAnalytics;
