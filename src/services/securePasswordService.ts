
import bcrypt from 'bcryptjs';

const SALT_ROUNDS = 12;

// Ensure Buffer is available for bcryptjs
if (typeof window !== 'undefined' && !(window as any).Buffer) {
  console.error('Buffer polyfill not loaded - bcrypt may not work correctly');
}

export const hashPassword = async (password: string): Promise<string> => {
  try {
    console.log('=== HASHING PASSWORD ===');
    console.log('Input password:', password);
    console.log('Salt rounds:', SALT_ROUNDS);
    console.log('bcryptjs version check:', typeof bcrypt.hash);
    
    const salt = await bcrypt.genSalt(SALT_ROUNDS);
    console.log('Generated salt:', salt);
    
    const hash = await bcrypt.hash(password, salt);
    console.log('Generated hash:', hash);
    console.log('Hash length:', hash.length);
    
    // Immediate verification test
    const immediateTest = await bcrypt.compare(password, hash);
    console.log('Immediate verification test:', immediateTest);
    
    return hash;
  } catch (error) {
    console.error('Password hashing error:', error);
    throw new Error('Failed to hash password');
  }
};

export const verifyPassword = async (password: string, hashedPassword: string): Promise<boolean> => {
  try {
    console.log('=== BCRYPT VERIFICATION DEBUG ===');
    console.log('bcryptjs available:', typeof bcrypt.compare);
    console.log('Buffer available:', typeof Buffer !== 'undefined');
    console.log('Window Buffer available:', typeof (window as any)?.Buffer !== 'undefined');
    
    console.log('Input password:', password);
    console.log('Input password type:', typeof password);
    console.log('Input password length:', password?.length);
    
    console.log('Stored hash:', hashedPassword);
    console.log('Stored hash type:', typeof hashedPassword);
    console.log('Stored hash length:', hashedPassword?.length);
    
    // Basic validation
    if (!password || !hashedPassword) {
      console.error('Missing password or hash');
      return false;
    }
    
    // Validate hash format
    const hashRegex = /^\$2[ab]\$\d{2}\$.{53}$/;
    if (!hashRegex.test(hashedPassword)) {
      console.error('Invalid bcrypt hash format:', hashedPassword);
      return false;
    }
    
    console.log('Performing bcrypt verification...');
    const result = await bcrypt.compare(password.trim(), hashedPassword.trim());
    console.log('Bcrypt.compare result:', result);
    
    return result;
    
  } catch (error) {
    console.error('Password verification error:', error);
    console.error('Error details:', {
      name: error.name,
      message: error.message,
      stack: error.stack
    });
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

// Test function to verify bcrypt is working
export const testBcryptEnvironment = async (): Promise<boolean> => {
  try {
    console.log('=== TESTING BCRYPT ENVIRONMENT ===');
    const testPassword = 'test123';
    const testHash = await bcrypt.hash(testPassword, 10);
    console.log('Test hash generated:', testHash);
    
    const testVerify = await bcrypt.compare(testPassword, testHash);
    console.log('Test verification result:', testVerify);
    
    return testVerify;
  } catch (error) {
    console.error('Bcrypt environment test failed:', error);
    return false;
  }
};
