
export interface Teacher {
  id: string;
  name: string;
  email: string;
  school: string;
  role: 'teacher' | 'admin';
}

export interface Student {
  id: string;
  full_name: string;
  school: string;
  grade: string;
  email?: string; // Make email optional since it's not always available
}

export interface AuthContextType {
  teacher: Teacher | null;
  student: Student | null;
  isLoading: boolean;
  teacherLogin: (
    email: string, 
    password: string, 
    name?: string, 
    school?: string,
    role?: 'teacher' | 'admin'
  ) => Promise<{ error?: string; teacher?: Teacher }>;
  studentLogin: (fullName: string, school: string, grade: string, password: string) => Promise<{ error?: string; student?: Student }>;
  studentSimpleLogin: (fullName: string, password: string) => Promise<{ error?: string; student?: Student }>;
  studentSignup: (fullName: string, school: string, grade: string, password: string) => Promise<{ error?: string; student?: Student }>;
  logout: () => void;
}

// Add interface for feedback summary data
export interface TeacherFeedbackSummary {
  teacher_id: string;
  teacher_name: string;
  subject: string;
  class_date: string;
  avg_understanding: number;
  avg_interest: number;
  avg_educational_growth: number;
  total_feedback: number;
  lesson_topic: string;
}
