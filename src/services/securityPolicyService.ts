
interface SecurityPolicy {
  id: string;
  name: string;
  description: string;
  enabled: boolean;
  rules: SecurityRule[];
  lastUpdated: number;
}

interface SecurityRule {
  id: string;
  condition: string;
  action: 'allow' | 'deny' | 'log' | 'challenge';
  priority: number;
}

interface PolicyViolation {
  policyId: string;
  ruleId: string;
  timestamp: number;
  details: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  userId?: string;
  ipAddress?: string;
}

class SecurityPolicyService {
  private policies: Map<string, SecurityPolicy> = new Map();
  private violations: PolicyViolation[] = [];

  constructor() {
    this.initializeDefaultPolicies();
  }

  private initializeDefaultPolicies(): void {
    // Authentication Policy
    const authPolicy: SecurityPolicy = {
      id: 'auth-policy',
      name: 'Authentication Security',
      description: 'Manages login security and session protection',
      enabled: true,
      rules: [
        {
          id: 'max-login-attempts',
          condition: 'failed_login_attempts > 5',
          action: 'deny',
          priority: 1
        },
        {
          id: 'session-timeout',
          condition: 'session_idle > 30_minutes',
          action: 'deny',
          priority: 2
        },
        {
          id: 'concurrent-sessions',
          condition: 'concurrent_sessions > 3',
          action: 'challenge',
          priority: 3
        }
      ],
      lastUpdated: Date.now()
    };

    // Input Validation Policy
    const inputPolicy: SecurityPolicy = {
      id: 'input-policy',
      name: 'Input Validation',
      description: 'Validates and sanitizes all user input',
      enabled: true,
      rules: [
        {
          id: 'sql-injection-check',
          condition: 'contains_sql_keywords',
          action: 'deny',
          priority: 1
        },
        {
          id: 'xss-check',
          condition: 'contains_script_tags',
          action: 'deny',
          priority: 1
        },
        {
          id: 'file-upload-check',
          condition: 'unsafe_file_type',
          action: 'deny',
          priority: 2
        }
      ],
      lastUpdated: Date.now()
    };

    // Rate Limiting Policy
    const rateLimitPolicy: SecurityPolicy = {
      id: 'rate-limit-policy',
      name: 'Rate Limiting',
      description: 'Controls request frequency and prevents abuse',
      enabled: true,
      rules: [
        {
          id: 'api-rate-limit',
          condition: 'requests_per_minute > 60',
          action: 'deny',
          priority: 1
        },
        {
          id: 'admin-action-limit',
          condition: 'admin_actions_per_hour > 100',
          action: 'log',
          priority: 2
        }
      ],
      lastUpdated: Date.now()
    };

    this.policies.set(authPolicy.id, authPolicy);
    this.policies.set(inputPolicy.id, inputPolicy);
    this.policies.set(rateLimitPolicy.id, rateLimitPolicy);
  }

  // Evaluate a request against all policies
  async evaluateRequest(context: {
    userId?: string;
    ipAddress?: string;
    action: string;
    data?: any;
    sessionInfo?: any;
  }): Promise<{
    allowed: boolean;
    violations: PolicyViolation[];
    actions: string[];
  }> {
    const violations: PolicyViolation[] = [];
    const actions: string[] = [];
    let allowed = true;

    for (const policy of this.policies.values()) {
      if (!policy.enabled) continue;

      for (const rule of policy.rules) {
        const violates = await this.evaluateRule(rule, context);
        
        if (violates) {
          const violation: PolicyViolation = {
            policyId: policy.id,
            ruleId: rule.id,
            timestamp: Date.now(),
            details: `Rule '${rule.id}' violated: ${rule.condition}`,
            severity: this.determineSeverity(rule),
            userId: context.userId,
            ipAddress: context.ipAddress
          };

          violations.push(violation);
          this.violations.push(violation);
          actions.push(rule.action);

          if (rule.action === 'deny') {
            allowed = false;
          }
        }
      }
    }

    return { allowed, violations, actions };
  }

  private async evaluateRule(rule: SecurityRule, context: any): Promise<boolean> {
    // Simplified rule evaluation - in production, use a proper rule engine
    const condition = rule.condition.toLowerCase();

    if (condition.includes('failed_login_attempts')) {
      return this.checkFailedLoginAttempts(context);
    }

    if (condition.includes('session_idle')) {
      return this.checkSessionTimeout(context);
    }

    if (condition.includes('concurrent_sessions')) {
      return this.checkConcurrentSessions(context);
    }

    if (condition.includes('requests_per_minute')) {
      return this.checkRequestRate(context);
    }

    if (condition.includes('contains_sql_keywords')) {
      return this.checkSQLInjection(context);
    }

    if (condition.includes('contains_script_tags')) {
      return this.checkXSS(context);
    }

    return false;
  }

  private checkFailedLoginAttempts(context: any): boolean {
    // Check against stored failed attempts
    const attempts = localStorage.getItem(`failed_attempts_${context.ipAddress}`) || '0';
    return parseInt(attempts) > 5;
  }

  private checkSessionTimeout(context: any): boolean {
    if (!context.sessionInfo?.lastActivity) return false;
    const idleTime = Date.now() - context.sessionInfo.lastActivity;
    return idleTime > (30 * 60 * 1000); // 30 minutes
  }

  private checkConcurrentSessions(context: any): boolean {
    // Simplified check - in production, track active sessions
    return false;
  }

  private checkRequestRate(context: any): boolean {
    const key = `requests_${context.ipAddress}_${Math.floor(Date.now() / 60000)}`;
    const requests = parseInt(localStorage.getItem(key) || '0');
    return requests > 60;
  }

  private checkSQLInjection(context: any): boolean {
    const sqlKeywords = ['SELECT', 'INSERT', 'UPDATE', 'DELETE', 'DROP', 'UNION'];
    const data = JSON.stringify(context.data || {}).toUpperCase();
    return sqlKeywords.some(keyword => data.includes(keyword));
  }

  private checkXSS(context: any): boolean {
    const data = JSON.stringify(context.data || {}).toLowerCase();
    return data.includes('<script') || data.includes('javascript:') || data.includes('on\w+\s*=');
  }

  private determineSeverity(rule: SecurityRule): 'low' | 'medium' | 'high' | 'critical' {
    if (rule.priority === 1) return 'critical';
    if (rule.priority === 2) return 'high';
    if (rule.priority === 3) return 'medium';
    return 'low';
  }

  // Policy management methods
  getAllPolicies(): SecurityPolicy[] {
    return Array.from(this.policies.values());
  }

  getPolicy(id: string): SecurityPolicy | undefined {
    return this.policies.get(id);
  }

  updatePolicy(policy: SecurityPolicy): void {
    policy.lastUpdated = Date.now();
    this.policies.set(policy.id, policy);
  }

  enablePolicy(id: string): void {
    const policy = this.policies.get(id);
    if (policy) {
      policy.enabled = true;
      policy.lastUpdated = Date.now();
    }
  }

  disablePolicy(id: string): void {
    const policy = this.policies.get(id);
    if (policy) {
      policy.enabled = false;
      policy.lastUpdated = Date.now();
    }
  }

  getViolations(limit: number = 100): PolicyViolation[] {
    return this.violations.slice(-limit);
  }

  clearViolations(): void {
    this.violations = [];
  }

  getSecurityReport(): {
    totalPolicies: number;
    activePolicies: number;
    totalViolations: number;
    criticalViolations: number;
    lastViolation?: number;
  } {
    const activePolicies = Array.from(this.policies.values()).filter(p => p.enabled).length;
    const criticalViolations = this.violations.filter(v => v.severity === 'critical').length;
    const lastViolation = this.violations.length > 0 ? 
      Math.max(...this.violations.map(v => v.timestamp)) : undefined;

    return {
      totalPolicies: this.policies.size,
      activePolicies,
      totalViolations: this.violations.length,
      criticalViolations,
      lastViolation
    };
  }
}

export const securityPolicyService = new SecurityPolicyService();
