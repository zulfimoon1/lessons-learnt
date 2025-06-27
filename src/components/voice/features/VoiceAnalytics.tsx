
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUpIcon } from "lucide-react";

const VoiceAnalytics: React.FC = () => (
  <div className="space-y-4 md:space-y-6">
    <Card>
      <CardHeader className="pb-3 md:pb-6">
        <CardTitle className="flex items-center gap-2 text-lg md:text-xl">
          <TrendingUpIcon className="w-4 h-4 md:w-5 md:h-5 text-blue-600" />
          Voice Analytics Dashboard
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3 md:space-y-4 pt-0">
        <div className="grid grid-cols-3 gap-2 md:gap-4">
          <div className="bg-blue-50 rounded-lg p-3 md:p-4 text-center">
            <p className="text-xl md:text-2xl font-bold text-blue-600">73%</p>
            <p className="text-xs md:text-sm text-blue-800">Voice Adoption</p>
          </div>
          <div className="bg-green-50 rounded-lg p-3 md:p-4 text-center">
            <p className="text-xl md:text-2xl font-bold text-green-600">+127%</p>
            <p className="text-xs md:text-sm text-green-800">Feedback Volume</p>
          </div>
          <div className="bg-purple-50 rounded-lg p-3 md:p-4 text-center">
            <p className="text-xl md:text-2xl font-bold text-purple-600">4.8/5</p>
            <p className="text-xs md:text-sm text-purple-800">Satisfaction</p>
          </div>
        </div>

        <div className="bg-blue-50 rounded-lg p-3 md:p-4">
          <h3 className="font-semibold text-blue-800 mb-2 text-sm md:text-base">Voice vs Text Insights:</h3>
          <ul className="space-y-1 text-xs md:text-sm text-blue-700">
            <li>• Voice messages are 40% more detailed than text</li>
            <li>• Students share emotions 5x more in voice</li>
            <li>• Voice feedback has 85% higher engagement scores</li>
            <li>• Teachers respond 2x faster to voice messages</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  </div>
);

export default React.memo(VoiceAnalytics);
