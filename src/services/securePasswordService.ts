
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
    
    // Ensure we have valid inputs
    if (!password || !hashedPassword) {
      console.error('Missing password or hash');
      return false;
    }
    
    // Validate hash format
    if (!hashedPassword.startsWith('$2b$') && !hashedPassword.startsWith('$2a$')) {
      console.error('Invalid hash format - not bcrypt');
      return false;
    }
    
    // Test the bcrypt library directly with a known working example
    console.log('Testing bcrypt with known values...');
    const testHash = await bcrypt.hash('test123', 12);
    const testResult = await bcrypt.compare('test123', testHash);
    console.log('Bcrypt test with known values:', testResult);
    
    if (!testResult) {
      console.error('CRITICAL: bcrypt library is not working correctly');
      return false;
    }
    
    // Now test the actual password
    console.log('Testing actual password against stored hash...');
    const result = await bcrypt.compare(password, hashedPassword);
    console.log('Actual bcrypt.compare result:', result);
    
    // Additional debug: try with string conversion
    const stringPassword = String(password);
    const stringHash = String(hashedPassword);
    console.log('Testing with explicit string conversion...');
    const stringResult = await bcrypt.compare(stringPassword, stringHash);
    console.log('String conversion result:', stringResult);
    
    return result || stringResult;
    
  } catch (error) {
    console.error('Password verification error:', error);
    console.error('Error type:', typeof error);
    console.error('Error message:', error.message);
    console.error('Error stack:', error.stack);
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

// Helper function to generate a fresh hash for testing
export const generateTestHash = async (password: string = 'admin123'): Promise<string> => {
  console.log('Generating fresh hash for:', password);
  const hash = await hashPassword(password);
  console.log('Generated hash:', hash);
  return hash;
};
