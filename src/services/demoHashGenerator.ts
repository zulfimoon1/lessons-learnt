
import bcrypt from 'bcryptjs';

// Generate the correct bcrypt hash for demo123
export const generateDemoHash = async (): Promise<string> => {
  try {
    console.log('=== GENERATING DEMO HASH FOR demo123 ===');
    const password = 'demo123';
    const saltRounds = 12;
    
    const hash = await bcrypt.hash(password, saltRounds);
    console.log('Generated hash for demo123:', hash);
    
    // Verify it immediately
    const verification = await bcrypt.compare(password, hash);
    console.log('Hash verification test:', verification);
    
    if (!verification) {
      throw new Error('Generated hash failed verification');
    }
    
    return hash;
  } catch (error) {
    console.error('Demo hash generation failed:', error);
    throw error;
  }
};

// Test function to verify the demo hash works
export const testDemoHash = async (hash: string): Promise<boolean> => {
  try {
    const result = await bcrypt.compare('demo123', hash);
    console.log('Demo hash test result:', result);
    return result;
  } catch (error) {
    console.error('Demo hash test failed:', error);
    return false;
  }
};

// Pre-generated working hash for demo123 (backup)
export const WORKING_DEMO_HASH = '$2a$12$LQv3c1yqBwEHxv03ibjHVOVhqkqvlWBBHG6EsG8BPqTBaJt9z8ZFu';
