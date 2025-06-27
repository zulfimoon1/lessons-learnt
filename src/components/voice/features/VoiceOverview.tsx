
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircleIcon } from "lucide-react";

const VoiceOverview: React.FC = () => (
  <div className="space-y-4 md:space-y-6">
    <Card className="bg-gradient-to-r from-purple-600 to-blue-600 text-white">
      <CardHeader className="pb-3 md:pb-6">
        <CardTitle className="text-xl md:text-2xl font-bold text-center">
          🎤 Voice-Powered Education Platform
        </CardTitle>
      </CardHeader>
      <CardContent className="text-center space-y-3 md:space-y-4 pt-0">
        <p className="text-lg md:text-xl text-white/90">
          The first educational platform designed for the voice-first generation
        </p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 md:gap-4 mt-4 md:mt-6">
          <div className="bg-white/10 rounded-lg p-3 md:p-4">
            <CheckCircleIcon className="w-6 h-6 md:w-8 md:h-8 mx-auto mb-2" />
            <h3 className="font-semibold mb-1 text-sm md:text-base">Faster Feedback</h3>
            <p className="text-xs md:text-sm text-white/80">Students share thoughts 3x faster than typing</p>
          </div>
          <div className="bg-white/10 rounded-lg p-3 md:p-4">
            <CheckCircleIcon className="w-6 h-6 md:w-8 md:h-8 mx-auto mb-2" />
            <h3 className="font-semibold mb-1 text-sm md:text-base">Emotional Context</h3>
            <p className="text-xs md:text-sm text-white/80">Capture tone and emotion that text can't convey</p>
          </div>
          <div className="bg-white/10 rounded-lg p-3 md:p-4">
            <CheckCircleIcon className="w-6 h-6 md:w-8 md:h-8 mx-auto mb-2" />
            <h3 className="font-semibold mb-1 text-sm md:text-base">Inclusive Learning</h3>
            <p className="text-xs md:text-sm text-white/80">Perfect for students with writing challenges</p>
          </div>
        </div>
      </CardContent>
    </Card>
  </div>
);

export default React.memo(VoiceOverview);
