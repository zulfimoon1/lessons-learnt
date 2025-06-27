
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { VolumeIcon, MicIcon } from "lucide-react";

const VoiceTeacherTools: React.FC = () => (
  <div className="space-y-4 md:space-y-6">
    <Card>
      <CardHeader className="pb-3 md:pb-6">
        <CardTitle className="flex items-center gap-2 text-lg md:text-xl">
          <VolumeIcon className="w-4 h-4 md:w-5 md:h-5 text-orange-600" />
          Teacher Voice Management
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3 md:space-y-4 pt-0">
        <div className="bg-orange-50 rounded-lg p-3 md:p-4">
          <h3 className="font-semibold text-orange-800 mb-2 text-sm md:text-base">Advanced Voice Tools:</h3>
          <ul className="space-y-1 text-xs md:text-sm text-orange-700">
            <li>• Automatic transcription with 95% accuracy</li>
            <li>• Playback speed control (0.5x to 2x)</li>
            <li>• Emotional tone analysis and alerts</li>
            <li>• Smart categorization and search</li>
            <li>• Priority flagging for urgent messages</li>
          </ul>
        </div>

        <div className="bg-white border-2 border-orange-200 rounded-lg p-3 md:p-4">
          <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
            <div className="flex items-center gap-2 min-w-0">
              <div className="w-8 h-8 md:w-10 md:h-10 bg-orange-100 rounded-full flex items-center justify-center flex-shrink-0">
                <MicIcon className="w-4 h-4 md:w-5 md:h-5 text-orange-600" />
              </div>
              <div className="min-w-0">
                <p className="font-medium text-sm md:text-base truncate">Emma S. - Math Feedback</p>
                <p className="text-xs md:text-sm text-gray-600">High engagement detected</p>
              </div>
            </div>
            <Badge className="bg-green-100 text-green-800 text-xs flex-shrink-0">Positive</Badge>
          </div>
          
          <div className="bg-gray-50 rounded-lg p-3 mb-3">
            <p className="text-xs md:text-sm italic text-gray-700">
              "I was really struggling with quadratic equations, but your basketball example made it click! I actually understand parabolas now!"
            </p>
          </div>
          
          <div className="flex flex-wrap gap-2">
            <Button size="sm" variant="outline" className="text-xs">Play 1.5x</Button>
            <Button size="sm" variant="outline" className="text-xs">Reply</Button>
            <Button size="sm" variant="outline" className="text-xs">Add Note</Button>
          </div>
        </div>
      </CardContent>
    </Card>
  </div>
);

export default React.memo(VoiceTeacherTools);
