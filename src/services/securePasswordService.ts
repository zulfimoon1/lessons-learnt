
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
    
    const hash = await bcrypt.hash(password, SALT_ROUNDS);
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
    
    // Clean inputs
    const cleanPassword = password.toString().trim();
    const cleanHash = hashedPassword.toString().trim();
    
    console.log('Clean password:', cleanPassword);
    console.log('Clean hash:', cleanHash);
    
    // Validate hash format - bcrypt hashes should be exactly 60 characters
    if (cleanHash.length !== 60) {
      console.error('Invalid hash length. Expected 60, got:', cleanHash.length);
      return false;
    }
    
    // Validate bcrypt hash format
    const hashRegex = /^\$2[ab]\$\d{2}\$.{53}$/;
    if (!hashRegex.test(cleanHash)) {
      console.error('Invalid bcrypt hash format:', cleanHash);
      return false;
    }
    
    console.log('Performing bcrypt verification...');
    const result = await bcrypt.compare(cleanPassword, cleanHash);
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

// Generate and test a hash for a given password
export const generateTestHash = async (password: string): Promise<string> => {
  try {
    console.log('=== GENERATING TEST HASH ===');
    console.log('Password:', password);
    
    const hash = await hashPassword(password);
    console.log('Generated hash:', hash);
    
    // Test the hash immediately
    const testResult = await verifyPassword(password, hash);
    console.log('Hash verification test:', testResult);
    
    if (!testResult) {
      throw new Error('Generated hash failed verification test');
    }
    
    return hash;
  } catch (error) {
    console.error('Generate test hash error:', error);
    throw error;
  }
};

// Create a known working hash for demo123
export const createDemoHash = async (): Promise<string> => {
  try {
    console.log('=== CREATING DEMO HASH ===');
    const demoPassword = 'demo123';
    const hash = await bcrypt.hash(demoPassword, 12);
    console.log('Demo hash created:', hash);
    
    // Verify it works
    const verification = await bcrypt.compare(demoPassword, hash);
    console.log('Demo hash verification:', verification);
    
    if (!verification) {
      throw new Error('Demo hash verification failed');
    }
    
    return hash;
  } catch (error) {
    console.error('Demo hash creation failed:', error);
    throw error;
  }
};
