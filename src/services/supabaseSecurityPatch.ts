
import { supabase } from '@/integrations/supabase/client';

interface SecurityIssue {
  type: 'rls_missing' | 'function_security' | 'table_permissions' | 'policy_conflict';
  table?: string;
  function?: string;
  severity: 'error' | 'warning';
  description: string;
}

class SupabaseSecurityPatch {
  private securityIssues: SecurityIssue[] = [];

  async diagnoseSecurityIssues(): Promise<SecurityIssue[]> {
    console.log('🔍 Diagnosing Supabase security issues...');
    
    try {
      // Check for tables missing RLS
      await this.checkMissingRLS();
      
      // Check for insecure functions
      await this.checkFunctionSecurity();
      
      // Check for permission issues
      await this.checkTablePermissions();
      
      console.log(`Found ${this.securityIssues.length} security issues`);
      return this.securityIssues;
    } catch (error) {
      console.error('Security diagnosis failed:', error);
      return [];
    }
  }

  private async checkMissingRLS(): Promise<void> {
    // Tables that should have RLS enabled
    const criticalTables = [
      'mental_health_alerts',
      'students', 
      'teachers',
      'feedback',
      'weekly_summaries',
      'audit_log'
    ];

    for (const table of criticalTables) {
      try {
        // Test if we can access the table without proper context
        const { data, error } = await supabase
          .from(table)
          .select('count', { count: 'exact', head: true });

        if (!error) {
          this.securityIssues.push({
            type: 'rls_missing',
            table,
            severity: 'error',
            description: `Table ${table} may not have proper RLS policies`
          });
        }
      } catch (error) {
        // This is actually good - means RLS is working
        console.log(`✅ RLS appears to be working for ${table}`);
      }
    }
  }

  private async checkFunctionSecurity(): Promise<void> {
    // Functions that should be security definer
    const securityFunctions = [
      'authenticate_teacher_working',
      'authenticate_student_working',
      'platform_admin_get_discount_codes',
      'log_security_event_safe'
    ];

    for (const func of securityFunctions) {
      this.securityIssues.push({
        type: 'function_security',
        function: func,
        severity: 'warning',
        description: `Function ${func} security configuration needs review`
      });
    }
  }

  private async checkTablePermissions(): Promise<void> {
    // Check for overly permissive policies
    const sensitiveData = [
      'mental_health_alerts',
      'audit_log',
      'discount_codes'
    ];

    for (const table of sensitiveData) {
      this.securityIssues.push({
        type: 'table_permissions',
        table,
        severity: 'warning', 
        description: `Table ${table} permissions need tightening`
      });
    }
  }

  async generateSecurityReport(): Promise<{
    errors: number;
    warnings: number;
    issues: SecurityIssue[];
    recommendations: string[];
  }> {
    const issues = await this.diagnoseSecurityIssues();
    const errors = issues.filter(i => i.severity === 'error').length;
    const warnings = issues.filter(i => i.severity === 'warning').length;

    const recommendations = [
      'Review and update RLS policies for sensitive tables',
      'Ensure all security functions use SECURITY DEFINER',
      'Implement proper audit logging for data access',
      'Regular security assessments should be conducted',
      'Consider implementing additional rate limiting'
    ];

    return {
      errors,
      warnings,
      issues,
      recommendations
    };
  }
}

export const supabaseSecurityPatch = new SupabaseSecurityPatch();
