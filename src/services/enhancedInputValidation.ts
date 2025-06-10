
// Enhanced input validation with threat detection
export const enhancedValidateInput = {
  // Enhanced name validation with stricter patterns
  validateName: (name: string): { isValid: boolean; message?: string } => {
    if (!name || typeof name !== 'string') {
      return { isValid: false, message: 'Name is required' };
    }
    
    const trimmed = name.trim();
    if (trimmed.length < 2) {
      return { isValid: false, message: 'Name must be at least 2 characters long' };
    }
    
    if (trimmed.length > 50) { // Reduced from 100 for better security
      return { isValid: false, message: 'Name must be less than 50 characters' };
    }
    
    // Stricter pattern - only basic Latin letters, spaces, hyphens, apostrophes
    const nameRegex = /^[a-zA-Z\s\-']{2,50}$/;
    if (!nameRegex.test(trimmed)) {
      return { isValid: false, message: 'Name contains invalid characters. Only letters, spaces, hyphens, and apostrophes are allowed' };
    }
    
    // Check for suspicious patterns
    const suspiciousPatterns = [
      /(.)\1{4,}/, // More than 4 repeated characters
      /^\s*$/, // Only whitespace
      /(script|javascript|vbscript|onload|onerror)/i // Script injection attempts
    ];
    
    for (const pattern of suspiciousPatterns) {
      if (pattern && pattern.test(trimmed)) {
        return { isValid: false, message: 'Name contains suspicious patterns' };
      }
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
    
    if (trimmed.length > 100) { // Reduced from 200
      return { isValid: false, message: 'School name must be less than 100 characters' };
    }
    
    // Stricter pattern for school names
    const schoolRegex = /^[a-zA-Z0-9\s\-'.&()]{2,100}$/;
    if (!schoolRegex.test(trimmed)) {
      return { isValid: false, message: 'School name contains invalid characters' };
    }
    
    // Enhanced suspicious pattern detection with proper null checking
    const threatCheck = enhancedValidateInput.detectAdvancedThreats(trimmed);
    if (threatCheck && threatCheck.isSuspicious) {
      return { isValid: false, message: 'School name contains suspicious content' };
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
    
    if (trimmed.length > 10) { // Reduced from 20
      return { isValid: false, message: 'Grade must be less than 10 characters' };
    }
    
    // Stricter grade validation
    const gradeRegex = /^[a-zA-Z0-9\s\-]{1,10}$/;
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
    
    if (trimmed.length > 100) { // Reduced from 254
      return { isValid: false, message: 'Email must be less than 100 characters' };
    }
    
    // Enhanced email validation with stricter rules
    const emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;
    if (!emailRegex.test(trimmed)) {
      return { isValid: false, message: 'Please enter a valid email address' };
    }
    
    // Check for suspicious email patterns
    const suspiciousEmailPatterns = [
      /10minutemail|tempmail|guerrillamail|mailinator/i, // Temporary email services
      /test@test|admin@admin|root@root/i, // Common test emails
      /(script|javascript|<|>)/i // Script injection attempts
    ];
    
    for (const pattern of suspiciousEmailPatterns) {
      if (pattern && pattern.test(trimmed)) {
        return { isValid: false, message: 'Email address appears to be invalid or suspicious' };
      }
    }
    
    return { isValid: true };
  },

  // Enhanced sanitization with stronger filtering
  sanitizeText: (input: string): string => {
    if (!input || typeof input !== 'string') {
      return '';
    }
    
    return input
      .trim()
      // Remove all control characters except newlines and tabs
      .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F-\x9F]/g, '')
      // Remove all HTML tags and script content
      .replace(/<[^>]*>/g, '')
      // Remove potential XSS characters more aggressively
      .replace(/[<>'"`;\\&]/g, '')
      // Remove potential SQL injection characters
      .replace(/['"`;\\]/g, '')
      // Remove unicode control characters
      .replace(/[\u0000-\u001F\u007F-\u009F]/g, '')
      // Normalize whitespace
      .replace(/\s+/g, ' ')
      // Limit length
      .substring(0, 1000);
  },

  // Enhanced threat detection with machine learning-like patterns
  detectAdvancedThreats: (input: string): { isSuspicious: boolean; reason?: string; severity?: number } => {
    if (!input || typeof input !== 'string') {
      return { isSuspicious: false };
    }
    
    const lowerInput = input.toLowerCase();
    
    // Critical threat patterns (immediate block)
    const criticalPatterns = [
      { pattern: /<script|javascript:|data:text\/html|vbscript:/i, reason: 'Script injection attempt', severity: 10 },
      { pattern: /union\s+select|drop\s+table|delete\s+from|insert\s+into|update\s+set/i, reason: 'SQL injection attempt', severity: 10 },
      { pattern: /\.\.\//g, reason: 'Path traversal attempt', severity: 9 },
      { pattern: /eval\s*\(|function\s*\(|setTimeout\s*\(/i, reason: 'Code execution attempt', severity: 9 },
      { pattern: /on\w+\s*=|style\s*=.*expression/i, reason: 'Event handler injection', severity: 8 }
    ];
    
    // High-risk patterns
    const highRiskPatterns = [
      { pattern: /\bhex\b|\bchar\b|\bascii\b|\bconcat\b/i, reason: 'SQL encoding attempt', severity: 7 },
      { pattern: /\b(and|or)\s+\d+\s*=\s*\d+/i, reason: 'SQL boolean injection', severity: 7 },
      { pattern: /\bxmlhttprequest\b|fetch\s*\(|\.send\s*\(/i, reason: 'AJAX injection attempt', severity: 6 },
      { pattern: /document\.|window\.|location\./i, reason: 'DOM manipulation attempt', severity: 6 }
    ];
    
    // Medium-risk patterns
    const mediumRiskPatterns = [
      { pattern: /\b(select|from|where|order|group)\b/i, reason: 'SQL-like syntax', severity: 4 },
      { pattern: /\b(alert|confirm|prompt)\s*\(/i, reason: 'Dialog injection attempt', severity: 4 },
      { pattern: /%[0-9a-f]{2}/gi, reason: 'URL encoding detected', severity: 3 },
      { pattern: /&#\d+;|&\w+;/g, reason: 'HTML entity encoding', severity: 3 }
    ];
    
    // Check all patterns in order of severity
    const allPatterns = [...criticalPatterns, ...highRiskPatterns, ...mediumRiskPatterns];
    
    for (const patternData of allPatterns) {
      if (!patternData || !patternData.pattern) continue; // Handle potential undefined
      
      const { pattern, reason, severity } = patternData;
      // Add comprehensive null check for pattern
      if (pattern && typeof pattern.test === 'function' && pattern.test(input)) {
        return { isSuspicious: true, reason, severity };
      }
    }
    
    // Additional heuristic checks
    const suspiciousCharMatches = input.match(/[<>'"`;\\&]/g);
    const suspiciousCharCount = suspiciousCharMatches ? suspiciousCharMatches.length : 0;
    if (suspiciousCharCount > 3) {
      return { isSuspicious: true, reason: 'High concentration of suspicious characters', severity: 5 };
    }
    
    // Check for excessive length (potential buffer overflow)
    if (input.length > 1000) {
      return { isSuspicious: true, reason: 'Input exceeds safe length limits', severity: 6 };
    }
    
    return { isSuspicious: false };
  },

  // Password complexity validation
  validatePasswordComplexity: (password: string): { isValid: boolean; message?: string; score?: number } => {
    if (!password) {
      return { isValid: false, message: 'Password is required', score: 0 };
    }
    
    let score = 0;
    const issues: string[] = [];
    
    // Length check
    if (password.length < 12) {
      issues.push('at least 12 characters');
    } else {
      score += 2;
    }
    
    // Character variety checks
    if (!/[a-z]/.test(password)) {
      issues.push('lowercase letters');
    } else {
      score += 1;
    }
    
    if (!/[A-Z]/.test(password)) {
      issues.push('uppercase letters');
    } else {
      score += 1;
    }
    
    if (!/[0-9]/.test(password)) {
      issues.push('numbers');
    } else {
      score += 1;
    }
    
    if (!/[!@#$%^&*()_+\-=\[\]{}|;:,.<>?]/.test(password)) {
      issues.push('special characters');
    } else {
      score += 2;
    }
    
    // Common password checks
    const commonPasswords = ['password', '123456', 'qwerty', 'admin', 'letmein'];
    if (commonPasswords.some(common => password.toLowerCase().includes(common))) {
      issues.push('should not contain common words');
      score -= 2;
    }
    
    // Sequential characters check
    if (/(.)\1{2,}/.test(password) || /abc|123|qwe/i.test(password)) {
      issues.push('should not contain sequential or repeated characters');
      score -= 1;
    }
    
    if (issues.length > 0) {
      return {
        isValid: false,
        message: `Password must include: ${issues.join(', ')}`,
        score: Math.max(0, score)
      };
    }
    
    return { isValid: true, score };
  }
};
