
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, Send } from "lucide-react";
import StarRating from "@/components/StarRating";
import EmotionalStateSelector from "@/components/EmotionalStateSelector";

interface LessonFeedbackFormProps {
  onSubmit: (data: any) => void;
  onCancel: () => void;
}

const LessonFeedbackForm = ({ onSubmit, onCancel }: LessonFeedbackFormProps) => {
  const [formData, setFormData] = useState({
    subject: "",
    lessonTopic: "",
    understanding: 0,
    interest: 0,
    educationalGrowth: 0,
    emotionalState: "",
    whatWorkedWell: "",
    whatWasConfusing: "",
    howToImprove: "",
    additionalComments: ""
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  const isFormValid = formData.subject && formData.lessonTopic && formData.understanding > 0;

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={onCancel}
          className="text-gray-600 hover:text-gray-900"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </Button>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Share Your Learning Experience</h1>
          <p className="text-gray-600">Help your teacher understand how to make lessons even better</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Basic Information */}
        <Card className="bg-white/80 backdrop-blur-sm border-blue-100">
          <CardHeader>
            <CardTitle className="text-xl text-gray-900">Lesson Details</CardTitle>
            <CardDescription>Tell us about today's lesson</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="subject" className="text-gray-700 font-medium">Subject</Label>
                <Select onValueChange={(value) => setFormData(prev => ({ ...prev, subject: value }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select subject" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="mathematics">Mathematics</SelectItem>
                    <SelectItem value="science">Science</SelectItem>
                    <SelectItem value="english">English</SelectItem>
                    <SelectItem value="history">History</SelectItem>
                    <SelectItem value="art">Art</SelectItem>
                    <SelectItem value="music">Music</SelectItem>
                    <SelectItem value="physical-education">Physical Education</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="lessonTopic" className="text-gray-700 font-medium">Lesson Topic</Label>
                <Input
                  id="lessonTopic"
                  placeholder="e.g., Fractions, Photosynthesis, Shakespeare"
                  value={formData.lessonTopic}
                  onChange={(e) => setFormData(prev => ({ ...prev, lessonTopic: e.target.value }))}
                  className="border-gray-200"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Understanding and Engagement */}
        <Card className="bg-white/80 backdrop-blur-sm border-green-100">
          <CardHeader>
            <CardTitle className="text-xl text-gray-900">Learning Assessment</CardTitle>
            <CardDescription>Rate your learning experience</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <Label className="text-gray-700 font-medium">How well did you understand the lesson content?</Label>
              <StarRating
                rating={formData.understanding}
                onRatingChange={(rating) => setFormData(prev => ({ ...prev, understanding: rating }))}
                labels={["Very Confused", "Confused", "Somewhat Clear", "Clear", "Very Clear"]}
              />
            </div>

            <div>
              <Label className="text-gray-700 font-medium">How interesting was the lesson?</Label>
              <StarRating
                rating={formData.interest}
                onRatingChange={(rating) => setFormData(prev => ({ ...prev, interest: rating }))}
                labels={["Very Boring", "Boring", "Okay", "Interesting", "Very Interesting"]}
              />
            </div>

            <div>
              <Label className="text-gray-700 font-medium">How much do you feel you learned educationally?</Label>
              <StarRating
                rating={formData.educationalGrowth}
                onRatingChange={(rating) => setFormData(prev => ({ ...prev, educationalGrowth: rating }))}
                labels={["Learned Nothing", "Learned Little", "Learned Some", "Learned Much", "Learned A Lot"]}
              />
            </div>
          </CardContent>
        </Card>

        {/* Emotional State */}
        <Card className="bg-white/80 backdrop-blur-sm border-purple-100">
          <CardHeader>
            <CardTitle className="text-xl text-gray-900">Emotional Wellbeing</CardTitle>
            <CardDescription>How did you feel during the lesson?</CardDescription>
          </CardHeader>
          <CardContent>
            <EmotionalStateSelector
              selectedState={formData.emotionalState}
              onStateChange={(state) => setFormData(prev => ({ ...prev, emotionalState: state }))}
            />
          </CardContent>
        </Card>

        {/* Detailed Feedback */}
        <Card className="bg-white/80 backdrop-blur-sm border-indigo-100">
          <CardHeader>
            <CardTitle className="text-xl text-gray-900">Detailed Feedback</CardTitle>
            <CardDescription>Help your teacher understand what worked and what could be improved</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="whatWorkedWell" className="text-gray-700 font-medium">What worked well in this lesson?</Label>
              <Textarea
                id="whatWorkedWell"
                placeholder="What did you enjoy? What helped you learn?"
                value={formData.whatWorkedWell}
                onChange={(e) => setFormData(prev => ({ ...prev, whatWorkedWell: e.target.value }))}
                className="border-gray-200 min-h-[100px]"
              />
            </div>

            <div>
              <Label htmlFor="whatWasConfusing" className="text-gray-700 font-medium">What was confusing or difficult?</Label>
              <Textarea
                id="whatWasConfusing"
                placeholder="What parts were hard to understand?"
                value={formData.whatWasConfusing}
                onChange={(e) => setFormData(prev => ({ ...prev, whatWasConfusing: e.target.value }))}
                className="border-gray-200 min-h-[100px]"
              />
            </div>

            <div>
              <Label htmlFor="howToImprove" className="text-gray-700 font-medium">How could the teacher make the lesson better?</Label>
              <Textarea
                id="howToImprove"
                placeholder="Your suggestions for improvement..."
                value={formData.howToImprove}
                onChange={(e) => setFormData(prev => ({ ...prev, howToImprove: e.target.value }))}
                className="border-gray-200 min-h-[100px]"
              />
            </div>

            <div>
              <Label htmlFor="additionalComments" className="text-gray-700 font-medium">Any other comments?</Label>
              <Textarea
                id="additionalComments"
                placeholder="Anything else you'd like to share..."
                value={formData.additionalComments}
                onChange={(e) => setFormData(prev => ({ ...prev, additionalComments: e.target.value }))}
                className="border-gray-200 min-h-[80px]"
              />
            </div>
          </CardContent>
        </Card>

        {/* Submit Button */}
        <div className="flex justify-center pt-6">
          <Button 
            type="submit" 
            disabled={!isFormValid}
            size="lg"
            className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-8 py-4 text-lg font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Send className="w-5 h-5 mr-2" />
            Submit Feedback
          </Button>
        </div>
      </form>
    </div>
  );
};

export default LessonFeedbackForm;
