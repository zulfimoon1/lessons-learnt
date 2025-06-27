
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { HeartIcon } from "lucide-react";

const VoiceWellness: React.FC = () => (
  <div className="space-y-4 md:space-y-6">
    <Card>
      <CardHeader className="pb-3 md:pb-6">
        <CardTitle className="flex items-center gap-2 text-lg md:text-xl">
          <HeartIcon className="w-4 h-4 md:w-5 md:h-5 text-red-600" />
          Emotional Intelligence & Wellness
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3 md:space-y-4 pt-0">
        <div className="bg-red-50 rounded-lg p-3 md:p-4">
          <h3 className="font-semibold text-red-800 mb-2 text-sm md:text-base">AI-Powered Emotional Detection:</h3>
          <ul className="space-y-1 text-xs md:text-sm text-red-700">
            <li>• Analyze tone and pace to detect distress</li>
            <li>• Flag messages indicating anxiety or sadness</li>
            <li>• Identify students who need extra support</li>
            <li>• Generate wellness alerts for counselors</li>
          </ul>
        </div>

        <div className="space-y-3">
          <div className="bg-white border-2 border-yellow-200 rounded-lg p-3 md:p-4">
            <div className="flex items-center justify-between mb-2 flex-wrap gap-2">
              <p className="font-medium text-gray-900 text-sm md:text-base">Sarah M. - Wellness Alert</p>
              <Badge className="bg-yellow-100 text-yellow-800 text-xs">Medium Priority</Badge>
            </div>
            <p className="text-xs md:text-sm text-gray-700 italic mb-2">
              Voice analysis detected: slow speech, lower energy, keywords: "tired", "overwhelmed"
            </p>
            <Button size="sm" className="bg-yellow-600 hover:bg-yellow-700 text-white text-xs">
              Schedule Check-in
            </Button>
          </div>

          <div className="bg-white border-2 border-red-200 rounded-lg p-3 md:p-4">
            <div className="flex items-center justify-between mb-2 flex-wrap gap-2">
              <p className="font-medium text-gray-900 text-sm md:text-base">Anonymous Student</p>
              <Badge className="bg-red-100 text-red-800 text-xs">High Priority</Badge>
            </div>
            <p className="text-xs md:text-sm text-gray-700 italic mb-2">
              Emotional distress detected: trembling voice, keywords: "can't handle", "giving up"
            </p>
            <Button size="sm" className="bg-red-600 hover:bg-red-700 text-white text-xs">
              Immediate Intervention
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  </div>
);

export default React.memo(VoiceWellness);
