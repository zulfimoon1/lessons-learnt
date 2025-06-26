
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
  needs_password_change?: boolean;
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
  studentLogin: (fullName: string, school: string, grade: string, password: string) => Promise<{ student?: Student; error?: string }>;
  studentSignup: (fullName: string, school: string, grade: string, password: string) => Promise<{ student?: Student; error?: string }>;
  logout: () => void;
  csrfToken?: string;
  setTeacher: (teacher: Teacher | null) => void;
  setStudent: (student: Student | null) => void;
}

export interface AuthResult {
  user?: any;
  error?: string;
}

export interface LoginCredentials {
  email?: string;
  fullName?: string;
  password: string;
  school?: string;
  grade?: string;
}

export interface SecurityEvent {
  type: 'login_success' | 'login_failed' | 'logout' | 'unauthorized_access' | 'suspicious_activity' | 'rate_limit_exceeded' | 'session_restored' | 'session_error' | 'storage_error' | 'csrf_violation' | 'test_admin_created' | 'forced_password_reset';
  userId?: string;
  timestamp: string;
  details: string;
  userAgent: string;
  ipAddress?: string;
  sessionId?: string;
  errorStack?: string;
}
