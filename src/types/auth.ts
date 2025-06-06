
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
  studentSignup: (fullName: string, school: string, grade: string, password: string) => Promise<{ error?: string; student?: Student }>;
  logout: () => void;
}
