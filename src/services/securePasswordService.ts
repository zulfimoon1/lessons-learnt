
import bcrypt from 'bcryptjs';

export const hashPassword = async (password: string): Promise<string> => {
  try {
    const saltRounds = 12;
    const hashedPassword = await bcrypt.hash(password, saltRounds);
    return hashedPassword;
  } catch (error) {
    console.error('Error hashing password:', error);
    throw new Error('Failed to hash password');
  }
};

export const verifyPassword = async (password: string, hashedPassword: string): Promise<boolean> => {
  try {
    return await bcrypt.compare(password, hashedPassword);
  } catch (error) {
    console.error('Error verifying password:', error);
    return false;
  }
};

export const validatePasswordStrength = (password: string): {
  isValid: boolean;
  score: number;
  feedback: string[];
} => {
  const feedback: string[] = [];
  let score = 0;

  if (password.length >= 8) score += 20;
  else feedback.push('Password should be at least 8 characters long');

  if (/[A-Z]/.test(password)) score += 20;
  else feedback.push('Add uppercase letters');

  if (/[a-z]/.test(password)) score += 20;
  else feedback.push('Add lowercase letters');

  if (/\d/.test(password)) score += 20;
  else feedback.push('Add numbers');

  if (/[^A-Za-z0-9]/.test(password)) score += 20;
  else feedback.push('Add special characters');

  return {
    isValid: score >= 60,
    score,
    feedback
  };
};
