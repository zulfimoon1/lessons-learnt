
// Enhanced input validation service for security
export const validateInput = {
  // Sanitize text input to prevent XSS
  sanitizeText: (input: string): string => {
    return input
      .trim()
      .replace(/[<>\"'%;()&+]/g, '')
      .slice(0, 1000); // Prevent overly long inputs
  },

  // Validate name fields
  validateName: (name: string): { isValid: boolean; message?: string } => {
    const sanitized = name.trim();
    if (sanitized.length < 2) {
      return { isValid: false, message: 'Name must be at least 2 characters long' };
    }
    if (sanitized.length > 100) {
      return { isValid: false, message: 'Name must be less than 100 characters' };
    }
    if (!/^[a-zA-Z\s\-'\.]+$/.test(sanitized)) {
      return { isValid: false, message: 'Name contains invalid characters' };
    }
    return { isValid: true };
  },

  // Validate school names
  validateSchool: (school: string): { isValid: boolean; message?: string } => {
    const sanitized = school.trim();
    if (sanitized.length < 2) {
      return { isValid: false, message: 'School name must be at least 2 characters long' };
    }
    if (sanitized.length > 100) {
      return { isValid: false, message: 'School name must be less than 100 characters' };
    }
    return { isValid: true };
  },

  // Validate grade/class
  validateGrade: (grade: string): { isValid: boolean; message?: string } => {
    const sanitized = grade.trim();
    if (sanitized.length < 1) {
      return { isValid: false, message: 'Grade is required' };
    }
    if (sanitized.length > 20) {
      return { isValid: false, message: 'Grade must be less than 20 characters' };
    }
    return { isValid: true };
  },

  // Validate text content for feedback/comments
  validateTextContent: (content: string): { isValid: boolean; message?: string } => {
    const sanitized = content.trim();
    if (sanitized.length > 5000) {
      return { isValid: false, message: 'Content is too long (maximum 5000 characters)' };
    }
    return { isValid: true };
  }
};
