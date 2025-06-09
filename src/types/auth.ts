
export interface Teacher {
  id: string;
  name: string;
  email: string;
  school: string;
  role: 'teacher' | 'admin' | 'doctor';
  specialization?: string;
  license_number?: string;
  is_available?: boolean;
}

export interface Student {
  id: string;
  full_name: string;
  school: string;
  grade: string;
}

export interface LiveChatSession {
  id: string;
  student_id: string | null;
  student_name: string;
  school: string;
  grade: string;
  is_anonymous: boolean;
  status: 'waiting' | 'active' | 'ended';
  doctor_id: string | null;
  started_at: string | null;
  ended_at: string | null;
  created_at: string;
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
    role?: 'teacher' | 'admin' | 'doctor'
  ) => Promise<{ teacher?: Teacher; error?: string }>;
  studentLogin: (fullName: string, password: string) => Promise<{ student?: Student; error?: string }>;
  studentSignup: (fullName: string, school: string, grade: string, password: string) => Promise<{ student?: Student; error?: string }>;
  logout: () => void;
}
