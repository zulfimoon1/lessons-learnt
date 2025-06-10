import bcrypt from 'bcryptjs';

const SALT_ROUNDS = 12;

export const hashPassword = async (password: string): Promise<string> => {
  try {
    console.log('Hashing password with bcryptjs...');
    const salt = await bcrypt.genSalt(SALT_ROUNDS);
    const hash = await bcrypt.hash(password, salt);
    console.log('Password hashed successfully, length:', hash.length);
    return hash;
  } catch (error) {
    console.error('Password hashing error:', error);
    throw new Error('Failed to hash password');
  }
};

export const verifyPassword = async (password: string, hashedPassword: string): Promise<boolean> => {
  try {
    console.log('=== BCRYPT VERIFICATION DEBUG ===');
    console.log('Input password:', password);
    console.log('Input password length:', password.length);
    console.log('Stored hash:', hashedPassword);
    console.log('Stored hash length:', hashedPassword.length);
    console.log('Hash format check - starts with $2b$:', hashedPassword.startsWith('$2b$'));
    
    // Test the bcrypt library directly
    console.log('Testing bcrypt.compare directly...');
    const result = await bcrypt.compare(password, hashedPassword);
    console.log('bcrypt.compare result:', result);
    
    return result;
  } catch (error) {
    console.error('Password verification error:', error);
    console.error('Error type:', typeof error);
    console.error('Error message:', error.message);
    return false;
  }
};

export const validatePasswordStrength = (password: string): { isValid: boolean; message: string } => {
  if (password.length < 8) {
    return { isValid: false, message: 'Password must be at least 8 characters long' };
  }
  
  if (!/(?=.*[a-z])/.test(password)) {
    return { isValid: false, message: 'Password must contain at least one lowercase letter' };
  }
  
  if (!/(?=.*[A-Z])/.test(password)) {
    return { isValid: false, message: 'Password must contain at least one uppercase letter' };
  }
  
  if (!/(?=.*\d)/.test(password)) {
    return { isValid: false, message: 'Password must contain at least one number' };
  }
  
  return { isValid: true, message: 'Password is strong' };
};
