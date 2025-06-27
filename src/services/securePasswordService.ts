
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

  // Length check (minimum 12 characters for admin accounts)
  if (password.length >= 12) score += 25;
  else feedback.push('Password should be at least 12 characters long');

  if (password.length >= 16) score += 10; // Bonus for longer passwords

  // Character variety checks
  if (/[A-Z]/.test(password)) score += 20;
  else feedback.push('Add uppercase letters');

  if (/[a-z]/.test(password)) score += 20;
  else feedback.push('Add lowercase letters');

  if (/\d/.test(password)) score += 15;
  else feedback.push('Add numbers');

  if (/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) score += 20;
  else feedback.push('Add special characters');

  // Check for patterns and common weaknesses
  const weakPatterns = [
    'password', '123456', 'qwerty', 'admin', 'letmein', 
    'welcome', 'monkey', 'dragon', 'master', 'login'
  ];
  
  const hasWeakPattern = weakPatterns.some(pattern => 
    password.toLowerCase().includes(pattern)
  );
  
  if (hasWeakPattern) {
    score -= 30;
    feedback.push('Avoid common words and patterns');
  }

  // Check for keyboard patterns
  const keyboardPatterns = ['qwerty', 'asdf', '1234', 'abcd'];
  const hasKeyboardPattern = keyboardPatterns.some(pattern => 
    password.toLowerCase().includes(pattern)
  );
  
  if (hasKeyboardPattern) {
    score -= 20;
    feedback.push('Avoid keyboard patterns');
  }

  // Check for repeated characters
  if (/(.)\1{2,}/.test(password)) {
    score -= 15;
    feedback.push('Avoid repeating characters');
  }

  return {
    isValid: score >= 80 && password.length >= 12,
    score: Math.max(0, Math.min(100, score)),
    feedback
  };
};

export const generateSecurePassword = (): string => {
  const lowercase = 'abcdefghijklmnopqrstuvwxyz';
  const uppercase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const numbers = '0123456789';
  const symbols = '!@#$%^&*()_+-=[]{}|;:,.<>?';
  
  let password = '';
  
  // Ensure at least one character from each category
  password += lowercase[Math.floor(Math.random() * lowercase.length)];
  password += uppercase[Math.floor(Math.random() * uppercase.length)];
  password += numbers[Math.floor(Math.random() * numbers.length)];
  password += symbols[Math.floor(Math.random() * symbols.length)];
  
  // Fill the rest randomly (minimum 12, target 16 characters)
  const allChars = lowercase + uppercase + numbers + symbols;
  const targetLength = 16;
  
  for (let i = password.length; i < targetLength; i++) {
    password += allChars[Math.floor(Math.random() * allChars.length)];
  }
  
  // Shuffle the password to avoid predictable patterns
  return password.split('').sort(() => Math.random() - 0.5).join('');
};
