// Enhanced input validation and sanitization service
export const validateInput = {
  validateName: (name: string): { isValid: boolean; message?: string } => {
    if (!name || typeof name !== 'string') {
      return { isValid: false, message: 'Name is required' };
    }
    
    const trimmed = name.trim();
    if (trimmed.length < 2) {
      return { isValid: false, message: 'Name must be at least 2 characters long' };
    }
    
    if (trimmed.length > 100) {
      return { isValid: false, message: 'Name must be less than 100 characters' };
    }
    
    // Allow letters, spaces, hyphens, and apostrophes only
    const nameRegex = /^[a-zA-Z\s\-']+$/;
    if (!nameRegex.test(trimmed)) {
      return { isValid: false, message: 'Name can only contain letters, spaces, hyphens, and apostrophes' };
    }
    
    return { isValid: true };
  },

  validateSchool: (school: string): { isValid: boolean; message?: string } => {
    if (!school || typeof school !== 'string') {
      return { isValid: false, message: 'School name is required' };
    }
    
    const trimmed = school.trim();
    if (trimmed.length < 2) {
      return { isValid: false, message: 'School name must be at least 2 characters long' };
    }
    
    if (trimmed.length > 200) {
      return { isValid: false, message: 'School name must be less than 200 characters' };
    }
    
    // Allow letters, numbers, spaces, and common school name characters
    const schoolRegex = /^[a-zA-Z0-9\s\-'.&]+$/;
    if (!schoolRegex.test(trimmed)) {
      return { isValid: false, message: 'School name contains invalid characters' };
    }
    
    return { isValid: true };
  },

  validateGrade: (grade: string): { isValid: boolean; message?: string } => {
    if (!grade || typeof grade !== 'string') {
      return { isValid: false, message: 'Grade is required' };
    }
    
    const trimmed = grade.trim();
    if (trimmed.length < 1) {
      return { isValid: false, message: 'Grade is required' };
    }
    
    if (trimmed.length > 20) {
      return { isValid: false, message: 'Grade must be less than 20 characters' };
    }
    
    // Allow common grade formats: Grade 1, 1st Grade, Year 7, Class 5A, etc.
    const gradeRegex = /^[a-zA-Z0-9\s\-]+$/;
    if (!gradeRegex.test(trimmed)) {
      return { isValid: false, message: 'Grade contains invalid characters' };
    }
    
    return { isValid: true };
  },

  validateEmail: (email: string): { isValid: boolean; message?: string } => {
    if (!email || typeof email !== 'string') {
      return { isValid: false, message: 'Email is required' };
    }
    
    const trimmed = email.trim().toLowerCase();
    if (trimmed.length < 5) {
      return { isValid: false, message: 'Email must be at least 5 characters long' };
    }
    
    if (trimmed.length > 254) {
      return { isValid: false, message: 'Email must be less than 254 characters' };
    }
    
    // Enhanced email validation
    const emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;
    if (!emailRegex.test(trimmed)) {
      return { isValid: false, message: 'Please enter a valid email address' };
    }
    
    return { isValid: true };
  },

  // Enhanced sanitization that preserves necessary characters while removing dangerous ones
  sanitizeText: (input: string): string => {
    if (!input || typeof input !== 'string') {
      return '';
    }
    
    return input
      .trim()
      // Remove null bytes and control characters except newlines and tabs
      .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '')
      // Remove potential XSS characters
      .replace(/[<>]/g, '')
      // Remove potential SQL injection characters (keeping necessary punctuation)
      .replace(/['"`;\\]/g, '')
      // Normalize whitespace
      .replace(/\s+/g, ' ');
  },

  // Validate against common attack patterns
  detectSuspiciousInput: (input: string): { isSuspicious: boolean; reason?: string } => {
    if (!input || typeof input !== 'string') {
      return { isSuspicious: false };
    }
    
    const suspiciousPatterns = [
      { pattern: /<script|javascript:|data:/i, reason: 'Potential XSS attack' },
      { pattern: /union\s+select|drop\s+table|insert\s+into/i, reason: 'Potential SQL injection' },
      { pattern: /\.\.\//g, reason: 'Potential path traversal' },
      { pattern: /eval\s*\(|function\s*\(/i, reason: 'Potential code injection' },
      { pattern: /on\w+\s*=/i, reason: 'Potential event handler injection' }
    ];
    
    for (const { pattern, reason } of suspiciousPatterns) {
      if (pattern.test(input)) {
        return { isSuspicious: true, reason };
      }
    }
    
    return { isSuspicious: false };
  }
};
