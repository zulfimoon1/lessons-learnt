
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { 
  GraduationCapIcon, 
  LogOutIcon, 
  StarIcon, 
  MessageCircleIcon,
  BellIcon,
  TrendingUpIcon,
  UsersIcon,
  BookOpenIcon
} from "lucide-react";

interface TeacherData {
  name: string;
  email: string;
}

interface TeacherDashboardProps {
  teacher: TeacherData;
  feedbackData: any[];
  onLogout: () => void;
}

const TeacherDashboard = ({ teacher, feedbackData, onLogout }: TeacherDashboardProps) => {
  const [selectedFeedback, setSelectedFeedback] = useState<any>(null);

  // Calculate dashboard stats
  const totalFeedback = feedbackData.length;
  const averageUnderstanding = feedbackData.reduce((acc, fb) => acc + fb.understanding, 0) / totalFeedback || 0;
  const averageInterest = feedbackData.reduce((acc, fb) => acc + fb.interest, 0) / totalFeedback || 0;
  const recentFeedback = feedbackData.filter(fb => {
    const feedbackDate = new Date(fb.date);
    const today = new Date();
    const diffTime = Math.abs(today.getTime() - feedbackDate.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays <= 7;
  }).length;

  const renderStars = (rating: number) => {
    return [...Array(5)].map((_, i) => (
      <StarIcon key={i} className={`w-4 h-4 ${i < rating ? 'text-yellow-500 fill-current' : 'text-gray-300'}`} />
    ));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-sm border-b border-blue-100">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center">
                <GraduationCapIcon className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Teacher Dashboard</h1>
                <p className="text-gray-600">Welcome back, {teacher.name}</p>
              </div>
            </div>
            <Button 
              onClick={onLogout}
              variant="outline"
              className="border-red-200 text-red-600 hover:bg-red-50"
            >
              <LogOutIcon className="w-4 h-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="bg-white/70 backdrop-blur-sm border-blue-100">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Feedback</CardTitle>
              <MessageCircleIcon className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalFeedback}</div>
            </CardContent>
          </Card>

          <Card className="bg-white/70 backdrop-blur-sm border-green-100">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Avg Understanding</CardTitle>
              <BookOpenIcon className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{averageUnderstanding.toFixed(1)}/5</div>
            </CardContent>
          </Card>

          <Card className="bg-white/70 backdrop-blur-sm border-purple-100">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Avg Interest</CardTitle>
              <TrendingUpIcon className="h-4 w-4 text-purple-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{averageInterest.toFixed(1)}/5</div>
            </CardContent>
          </Card>

          <Card className="bg-white/70 backdrop-blur-sm border-orange-100">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">This Week</CardTitle>
              <BellIcon className="h-4 w-4 text-orange-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{recentFeedback}</div>
            </CardContent>
          </Card>
        </div>

        {/* Feedback Table */}
        <Card className="bg-white/70 backdrop-blur-sm border-gray-200">
          <CardHeader>
            <CardTitle>Recent Feedback Submissions</CardTitle>
            <CardDescription>
              Review and analyze student feedback from your lessons
            </CardDescription>
          </CardHeader>
          <CardContent>
            {feedbackData.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                No feedback submissions yet. Students can submit feedback from the main app.
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Subject</TableHead>
                    <TableHead>Topic</TableHead>
                    <TableHead>Understanding</TableHead>
                    <TableHead>Interest</TableHead>
                    <TableHead>Emotional State</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {feedbackData.map((feedback) => (
                    <TableRow key={feedback.id}>
                      <TableCell>{feedback.date}</TableCell>
                      <TableCell className="font-medium">{feedback.subject}</TableCell>
                      <TableCell>{feedback.lessonTopic}</TableCell>
                      <TableCell>
                        <div className="flex">
                          {renderStars(feedback.understanding)}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex">
                          {renderStars(feedback.interest)}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="capitalize">
                          {feedback.emotionalState}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => setSelectedFeedback(feedback)}
                        >
                          View Details
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        {/* Detailed Feedback Modal/Card */}
        {selectedFeedback && (
          <Card className="mt-6 bg-white/70 backdrop-blur-sm border-gray-200">
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle>Detailed Feedback</CardTitle>
                  <CardDescription>
                    {selectedFeedback.subject} - {selectedFeedback.lessonTopic} ({selectedFeedback.date})
                  </CardDescription>
                </div>
                <Button 
                  size="sm" 
                  variant="outline"
                  onClick={() => setSelectedFeedback(null)}
                >
                  Close
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <h4 className="font-medium text-gray-700 mb-2">Understanding</h4>
                  <div className="flex">
                    {renderStars(selectedFeedback.understanding)}
                    <span className="ml-2 text-sm text-gray-600">
                      {selectedFeedback.understanding}/5
                    </span>
                  </div>
                </div>
                <div>
                  <h4 className="font-medium text-gray-700 mb-2">Interest Level</h4>
                  <div className="flex">
                    {renderStars(selectedFeedback.interest)}
                    <span className="ml-2 text-sm text-gray-600">
                      {selectedFeedback.interest}/5
                    </span>
                  </div>
                </div>
                <div>
                  <h4 className="font-medium text-gray-700 mb-2">Educational Growth</h4>
                  <div className="flex">
                    {renderStars(selectedFeedback.educationalGrowth)}
                    <span className="ml-2 text-sm text-gray-600">
                      {selectedFeedback.educationalGrowth}/5
                    </span>
                  </div>
                </div>
              </div>
              
              <div>
                <h4 className="font-medium text-gray-700 mb-2">Emotional State</h4>
                <Badge variant="outline" className="capitalize">
                  {selectedFeedback.emotionalState}
                </Badge>
              </div>

              {selectedFeedback.suggestions && (
                <div>
                  <h4 className="font-medium text-gray-700 mb-2">Student Suggestions</h4>
                  <p className="text-gray-600 bg-gray-50 p-3 rounded-lg border">
                    {selectedFeedback.suggestions}
                  </p>
                </div>
              )}

              {selectedFeedback.additionalComments && (
                <div>
                  <h4 className="font-medium text-gray-700 mb-2">Additional Comments</h4>
                  <p className="text-gray-600 bg-gray-50 p-3 rounded-lg border">
                    {selectedFeedback.additionalComments}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default TeacherDashboard;
