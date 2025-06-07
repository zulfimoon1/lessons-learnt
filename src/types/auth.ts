
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
