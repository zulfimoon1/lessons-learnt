
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  CheckCircle, 
  Clock, 
  Users, 
  BookOpen, 
  Target,
  ArrowRight,
  Star,
  Trophy
} from 'lucide-react';
import OptimizedButton from '@/components/shared/OptimizedButton';
import OptimizedCard from '@/components/shared/OptimizedCard';
import ProgressiveDisclosure from './ProgressiveDisclosure';

interface OnboardingTask {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  estimatedTime: string;
  priority: 'high' | 'medium' | 'low';
  completed: boolean;
  userType: 'student' | 'teacher' | 'both';
  category: 'setup' | 'learning' | 'advanced';
  onComplete: () => void;
}

interface InteractiveOnboardingFlowProps {
  userType: 'student' | 'teacher';
  onComplete: () => void;
}

const InteractiveOnboardingFlow: React.FC<InteractiveOnboardingFlowProps> = ({
  userType,
  onComplete
}) => {
  const [completedTasks, setCompletedTasks] = useState<string[]>([]);
  const [currentCategory, setCurrentCategory] = useState<'setup' | 'learning' | 'advanced'>('setup');
  const [showCelebration, setShowCelebration] = useState(false);

  const studentTasks: OnboardingTask[] = [
    {
      id: 'profile-setup',
      title: 'Complete Your Profile',
      description: 'Add your photo and personal information to personalize your experience',
      icon: <Users className="w-5 h-5" />,
      estimatedTime: '2 min',
      priority: 'high',
      completed: false,
      userType: 'student',
      category: 'setup',
      onComplete: () => handleTaskComplete('profile-setup')
    },
    {
      id: 'first-feedback',
      title: 'Submit Your First Feedback',
      description: 'Try our voice feedback feature and share your thoughts about a recent class',
      icon: <BookOpen className="w-5 h-5" />,
      estimatedTime: '3 min',
      priority: 'high',
      completed: false,
      userType: 'student',
      category: 'learning',
      onComplete: () => handleTaskComplete('first-feedback')
    },
    {
      id: 'wellness-checkin',
      title: 'Complete Wellness Check-in',
      description: 'Take a moment to check in with yourself and explore wellbeing resources',
      icon: <Target className="w-5 h-5" />,
      estimatedTime: '2 min',
      priority: 'medium',
      completed: false,
      userType: 'student',
      category: 'learning',
      onComplete: () => handleTaskComplete('wellness-checkin')
    },
    {
      id: 'explore-analytics',
      title: 'Explore Your Analytics',
      description: 'Discover insights about your learning progress and engagement patterns',
      icon: <Star className="w-5 h-5" />,
      estimatedTime: '5 min',
      priority: 'low',
      completed: false,
      userType: 'student',
      category: 'advanced',
      onComplete: () => handleTaskComplete('explore-analytics')
    }
  ];

  const teacherTasks: OnboardingTask[] = [
    {
      id: 'class-setup',
      title: 'Create Your First Class',
      description: 'Set up a class schedule and invite students to start collecting feedback',
      icon: <BookOpen className="w-5 h-5" />,
      estimatedTime: '5 min',
      priority: 'high',
      completed: false,
      userType: 'teacher',
      category: 'setup',
      onComplete: () => handleTaskComplete('class-setup')
    },
    {
      id: 'invite-students',
      title: 'Invite Your Students',
      description: 'Send invitations to your students so they can join your classes',
      icon: <Users className="w-5 h-5" />,
      estimatedTime: '3 min',
      priority: 'high',
      completed: false,
      userType: 'teacher',
      category: 'setup',
      onComplete: () => handleTaskComplete('invite-students')
    },
    {
      id: 'review-feedback',
      title: 'Review Student Feedback',
      description: 'Learn how to analyze and respond to student feedback effectively',
      icon: <Target className="w-5 h-5" />,
      estimatedTime: '4 min',
      priority: 'medium',
      completed: false,
      userType: 'teacher',
      category: 'learning',
      onComplete: () => handleTaskComplete('review-feedback')
    },
    {
      id: 'ai-insights',
      title: 'Explore AI Insights',
      description: 'Discover how AI can help you understand student needs and improve teaching',
      icon: <Star className="w-5 h-5" />,
      estimatedTime: '6 min',
      priority: 'low',
      completed: false,
      userType: 'teacher',
      category: 'advanced',
      onComplete: () => handleTaskComplete('ai-insights')
    }
  ];

  const tasks = userType === 'student' ? studentTasks : teacherTasks;
  const filteredTasks = tasks.filter(task => 
    task.userType === userType || task.userType === 'both'
  );

  const handleTaskComplete = (taskId: string) => {
    if (!completedTasks.includes(taskId)) {
      setCompletedTasks(prev => [...prev, taskId]);
      
      // Show celebration for high priority tasks
      const task = tasks.find(t => t.id === taskId);
      if (task?.priority === 'high') {
        setShowCelebration(true);
        setTimeout(() => setShowCelebration(false), 3000);
      }
    }
  };

  const getCategoryTasks = (category: 'setup' | 'learning' | 'advanced') => {
    return filteredTasks.filter(task => task.category === category);
  };

  const getCategoryProgress = (category: 'setup' | 'learning' | 'advanced') => {
    const categoryTasks = getCategoryTasks(category);
    const completedCount = categoryTasks.filter(task => completedTasks.includes(task.id)).length;
    return categoryTasks.length > 0 ? (completedCount / categoryTasks.length) * 100 : 0;
  };

  const getTotalProgress = () => {
    const completedCount = completedTasks.length;
    return filteredTasks.length > 0 ? (completedCount / filteredTasks.length) * 100 : 0;
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800 border-red-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  useEffect(() => {
    if (completedTasks.length === filteredTasks.length) {
      setTimeout(() => {
        onComplete();
      }, 2000);
    }
  }, [completedTasks, filteredTasks, onComplete]);

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      {/* Celebration Animation */}
      {showCelebration && (
        <div className="fixed inset-0 z-50 flex items-center justify-center pointer-events-none">
          <div className="animate-scale-in">
            <div className="bg-green-500 text-white rounded-full p-4 shadow-lg">
              <Trophy className="w-8 h-8" />
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <OptimizedCard>
        <CardHeader>
          <CardTitle className="flex items-center gap-3">
            <div className="bg-blue-100 rounded-full p-2">
              <BookOpen className="w-6 h-6 text-blue-600" />
            </div>
            Welcome to Your {userType === 'student' ? 'Learning' : 'Teaching'} Journey
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-600 mb-4">
            Complete these tasks to get the most out of your experience. Don't worry - you can always come back to finish later!
          </p>
          
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">Overall Progress</span>
              <span className="text-sm text-gray-500">
                {completedTasks.length} of {filteredTasks.length} completed
              </span>
            </div>
            <Progress value={getTotalProgress()} className="h-3" />
          </div>
        </CardContent>
      </OptimizedCard>

      {/* Category Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        {(['setup', 'learning', 'advanced'] as const).map((category) => {
          const progress = getCategoryProgress(category);
          const taskCount = getCategoryTasks(category).length;
          
          return (
            <OptimizedButton
              key={category}
              variant={currentCategory === category ? "default" : "outline"}
              onClick={() => setCurrentCategory(category)}
              className="flex items-center gap-2 whitespace-nowrap"
            >
              <span className="capitalize">{category}</span>
              <Badge variant="outline" className="bg-white">
                {Math.round(progress)}%
              </Badge>
            </OptimizedButton>
          );
        })}
      </div>

      {/* Task List */}
      <div className="grid gap-4">
        {getCategoryTasks(currentCategory).map((task) => {
          const isCompleted = completedTasks.includes(task.id);
          
          return (
            <Card 
              key={task.id} 
              className={`transition-all duration-200 ${
                isCompleted 
                  ? 'bg-green-50 border-green-200' 
                  : 'hover:shadow-md cursor-pointer'
              }`}
            >
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div className="flex gap-3 flex-1">
                    <div className={`p-2 rounded-full ${
                      isCompleted ? 'bg-green-100' : 'bg-blue-100'
                    }`}>
                      {isCompleted ? (
                        <CheckCircle className="w-5 h-5 text-green-600" />
                      ) : (
                        task.icon
                      )}
                    </div>
                    
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className={`font-semibold ${
                          isCompleted ? 'text-green-800' : 'text-gray-900'
                        }`}>
                          {task.title}
                        </h3>
                        <Badge className={getPriorityColor(task.priority)}>
                          {task.priority}
                        </Badge>
                      </div>
                      
                      <p className="text-sm text-gray-600 mb-2">
                        {task.description}
                      </p>
                      
                      <div className="flex items-center gap-4 text-xs text-gray-500">
                        <div className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {task.estimatedTime}
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  {!isCompleted && (
                    <OptimizedButton
                      size="sm"
                      onClick={task.onComplete}
                      className="bg-blue-600 hover:bg-blue-700 text-white"
                    >
                      Start <ArrowRight className="w-3 h-3 ml-1" />
                    </OptimizedButton>
                  )}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Completion Message */}
      {completedTasks.length === filteredTasks.length && (
        <OptimizedCard className="bg-gradient-to-r from-green-50 to-blue-50 border-green-200">
          <CardContent className="text-center py-8">
            <div className="mb-4">
              <div className="bg-green-100 rounded-full p-4 w-16 h-16 mx-auto flex items-center justify-center">
                <Trophy className="w-8 h-8 text-green-600" />
              </div>
            </div>
            <h3 className="text-xl font-bold text-green-800 mb-2">
              Congratulations! 🎉
            </h3>
            <p className="text-green-700 mb-4">
              You've completed your onboarding journey. You're all set to make the most of your {userType === 'student' ? 'learning' : 'teaching'} experience!
            </p>
            <OptimizedButton
              onClick={onComplete}
              className="bg-green-600 hover:bg-green-700 text-white"
              size="lg"
            >
              Continue to Dashboard
            </OptimizedButton>
          </CardContent>
        </OptimizedCard>
      )}
    </div>
  );
};

export default InteractiveOnboardingFlow;
