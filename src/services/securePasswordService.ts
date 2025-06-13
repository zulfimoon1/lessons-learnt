
import bcrypt from 'bcryptjs';

const SALT_ROUNDS = 12;

export const hashPassword = async (password: string): Promise<string> => {
  try {
    console.log('=== HASHING PASSWORD ===');
    console.log('Input password:', password);
    console.log('Salt rounds:', SALT_ROUNDS);
    
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
    console.log('=== DETAILED BCRYPT VERIFICATION DEBUG ===');
    console.log('Input password:', password);
    console.log('Input password type:', typeof password);
    console.log('Input password length:', password.length);
    console.log('Input password chars:', Array.from(password).map(c => c.charCodeAt(0)));
    
    console.log('Stored hash:', hashedPassword);
    console.log('Stored hash type:', typeof hashedPassword);
    console.log('Stored hash length:', hashedPassword.length);
    
    console.log('Hash format check - starts with $2a$ or $2b$:', 
      hashedPassword.startsWith('$2a$') || hashedPassword.startsWith('$2b$'));
    
    // Ensure we have valid inputs
    if (!password || !hashedPassword) {
      console.error('Missing password or hash');
      return false;
    }
    
    // Validate hash format more thoroughly
    const hashRegex = /^\$2[ab]\$\d{2}\$.{53}$/;
    if (!hashRegex.test(hashedPassword)) {
      console.error('Invalid bcrypt hash format');
      console.log('Hash regex test failed for:', hashedPassword);
      return false;
    }
    
    // Clean the inputs to ensure no extra whitespace or encoding issues
    const cleanPassword = String(password).trim();
    const cleanHash = String(hashedPassword).trim();
    
    console.log('Clean password:', cleanPassword);
    console.log('Clean hash:', cleanHash);
    
    console.log('Performing bcrypt verification...');
    const result = await bcrypt.compare(cleanPassword, cleanHash);
    console.log('Bcrypt.compare result:', result);
    
    // If it failed, let's try some diagnostic tests
    if (!result) {
      console.log('=== DIAGNOSTIC TESTS ===');
      
      // Test with hardcoded known working combinations
      const testHash = await bcrypt.hash('demo123', 12);
      console.log('Fresh test hash:', testHash);
      
      const testVerify = await bcrypt.compare('demo123', testHash);
      console.log('Fresh hash verification:', testVerify);
      
      // Test if there are any character encoding issues
      const utf8Password = Buffer.from(cleanPassword, 'utf8').toString();
      console.log('UTF8 conversion test:', utf8Password === cleanPassword);
    }
    
    return result;
    
  } catch (error) {
    console.error('Password verification error:', error);
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
export const generateTestHash = async (password: string = 'demo123'): Promise<string> => {
  console.log('Generating fresh hash for:', password);
  const hash = await hashPassword(password);
  console.log('Generated hash:', hash);
  return hash;
};
