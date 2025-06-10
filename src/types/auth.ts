
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

export interface AuthResponse<T> {
  data?: T;
  error?: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface StudentLoginCredentials {
  fullName: string;
  password: string;
}

export interface SignupData {
  name: string;
  email: string;
  school: string;
  role: 'teacher' | 'admin' | 'doctor';
  password: string;
}

export interface StudentSignupData {
  fullName: string;
  school: string;
  grade: string;
  password: string;
}
