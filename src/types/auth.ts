
export interface Profile {
  id: string;
  full_name: string | null;
  school: string | null;
  grade: string | null;
  role: string;
  created_at: string;
  updated_at: string;
}

export interface TeacherProfile {
  id: string;
  name: string;
  email: string;
  school: string;
  role: 'teacher' | 'admin' | 'doctor';
  specialization?: string;
  license_number?: string;
  is_available?: boolean;
  created_at: string;
  updated_at: string;
}

// Legacy types for backward compatibility
export interface Teacher {
  id: string;
  name: string;
  email: string;
  school: string;
  role: 'teacher' | 'admin' | 'doctor';
  specialization?: string;
  license_number?: string;
  is_available?: boolean;
  created_at: string;
  updated_at: string;
}

export interface Student {
  id: string;
  full_name: string | null;
  school: string | null;
  grade: string | null;
  role: string;
  created_at: string;
  updated_at: string;
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
  user: any;
  profile: Profile | null;
  teacherProfile: TeacherProfile | null;
  teacher: Teacher | null; // Legacy compatibility
  student: Student | null; // Legacy compatibility
  isLoading: boolean;
  signUp: (email: string, password: string, userData: any) => Promise<{ error?: string }>;
  signIn: (email: string, password: string) => Promise<{ error?: string }>;
  signOut: () => Promise<void>;
  teacherLogin?: (
    email: string, 
    password: string, 
    name?: string, 
    school?: string, 
    role?: 'teacher' | 'admin' | 'doctor'
  ) => Promise<{ teacher?: Teacher; error?: string }>;
}
