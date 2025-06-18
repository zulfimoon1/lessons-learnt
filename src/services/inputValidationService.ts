class InputValidationService {
  // XSS Protection
  sanitizeInput(input: string): string {
    if (!input) return '';
    
    return input
      .replace(/[<>]/g, '') // Remove < and >
      .replace(/javascript:/gi, '') // Remove javascript: protocol
      .replace(/on\w+\s*=/gi, '') // Remove event handlers
      .replace(/expression\s*\(/gi, '') // Remove CSS expressions
      .trim();
  }

  // SQL Injection Protection
  sanitizeSearchQuery(query: string): string {
    if (!query) return '';
    
    return query
      .replace(/[';--]/g, '') // Remove SQL injection patterns
      .replace(/\b(union|select|insert|update|delete|drop|create|alter)\b/gi, '') // Remove SQL keywords
      .trim()
      .slice(0, 100); // Limit length
  }

  // Email validation
  validateEmail(email: string): boolean {
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return emailRegex.test(email) && email.length <= 254;
  }

  // Password strength validation
  validatePassword(password: string): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];
    
    if (password.length < 8) {
      errors.push('Password must be at least 8 characters long');
    }
    
    if (!/[A-Z]/.test(password)) {
      errors.push('Password must contain at least one uppercase letter');
    }
    
    if (!/[a-z]/.test(password)) {
      errors.push('Password must contain at least one lowercase letter');
    }
    
    if (!/\d/.test(password)) {
      errors.push('Password must contain at least one number');
    }
    
    if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
      errors.push('Password must contain at least one special character');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  // School name validation
  validateSchoolName(name: string): boolean {
    if (!name || name.length < 2 || name.length > 100) return false;
    
    // Allow letters, numbers, spaces, and common punctuation
    const schoolNameRegex = /^[a-zA-Z0-9\s'.\-]+$/;
    return schoolNameRegex.test(name);
  }

  // Student/Teacher name validation
  validatePersonName(name: string): boolean {
    if (!name || name.length < 2 || name.length > 50) return false;
    
    // Allow letters, spaces, hyphens, and apostrophes
    const nameRegex = /^[a-zA-Z\s'.\-]+$/;
    return nameRegex.test(name);
  }

  // Grade validation
  validateGrade(grade: string): boolean {
    const validGrades = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12'];
    return validGrades.includes(grade);
  }

  // Phone number validation (optional field)
  validatePhoneNumber(phone: string): boolean {
    if (!phone) return true; // Optional field
    
    // Simple international phone number format
    const phoneRegex = /^\+?[\d\s\-()]{10,15}$/;
    return phoneRegex.test(phone);
  }

  // Text content validation (for feedback, comments, etc.)
  validateTextContent(content: string, maxLength: number = 1000): boolean {
    if (!content) return true; // Optional field
    
    return content.length <= maxLength && 
           !this.containsSuspiciousContent(content);
  }

  private containsSuspiciousContent(content: string): boolean {
    const suspiciousPatterns = [
      /javascript:/gi,
      /<script/gi,
      /on\w+\s*=/gi,
      /expression\s*\(/gi,
      /<iframe/gi,
      /<object/gi,
      /<embed/gi
    ];

    return suspiciousPatterns.some(pattern => pattern.test(content));
  }
}

export const inputValidationService = new InputValidationService();
