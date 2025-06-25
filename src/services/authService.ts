
// Basic auth service for SOC2 monitoring
export interface User {
  id: string;
  email?: string;
  role?: string;
}

export const getCurrentUser = (): User | null => {
  // This is a placeholder implementation
  // In a real implementation, this would get the current user from your auth system
  try {
    const userData = localStorage.getItem('current_user');
    return userData ? JSON.parse(userData) : null;
  } catch {
    return null;
  }
};

export const setCurrentUser = (user: User | null): void => {
  if (user) {
    localStorage.setItem('current_user', JSON.stringify(user));
  } else {
    localStorage.removeItem('current_user');
  }
};
