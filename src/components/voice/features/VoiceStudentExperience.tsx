
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MicIcon } from "lucide-react";
import VoiceDemoCard from '../VoiceDemoCard';

const VoiceStudentExperience: React.FC = () => (
  <div className="space-y-4 md:space-y-6">
    <Card>
      <CardHeader className="pb-3 md:pb-6">
        <CardTitle className="flex items-center gap-2 text-lg md:text-xl">
          <MicIcon className="w-4 h-4 md:w-5 md:h-5 text-purple-600" />
          Student Voice Experience
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 md:gap-4">
          <VoiceDemoCard
            title="Express True Feelings"
            description="Share authentic emotions about lessons"
            mockTranscription="I was so confused at first, but when you used the pizza example for fractions, I finally got it! My face literally lit up - I wish you could have seen it!"
            variant="student"
          />
          
          <VoiceDemoCard
            title="Quick Class Feedback"
            description="Instant thoughts after each lesson"
            mockTranscription="Today's science experiment was incredible! The volcano reaction was way cooler than I expected. Can we do more hands-on experiments like this?"
            variant="student"
          />
        </div>
        
        <div className="mt-4 md:mt-6 bg-purple-50 rounded-lg p-3 md:p-4">
          <h3 className="font-semibold text-purple-800 mb-2 text-sm md:text-base">Why Students Love Voice:</h3>
          <ul className="space-y-1 text-xs md:text-sm text-purple-700">
            <li>• Express complex thoughts without worrying about spelling</li>
            <li>• Share excitement and emotions naturally</li>
            <li>• Faster than typing on mobile devices</li>
            <li>• Perfect for students with dyslexia or writing difficulties</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  </div>
);

export default React.memo(VoiceStudentExperience);
