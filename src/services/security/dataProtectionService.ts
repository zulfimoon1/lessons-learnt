interface EncryptionStatus {
  service: string;
  status: 'encrypted' | 'unencrypted' | 'unknown';
  algorithm?: string;
  keyManagement: string;
  lastChecked: Date;
}

interface DataClassification {
  table: string;
  classification: 'public' | 'internal' | 'confidential' | 'restricted';
  sensitiveFields: string[];
  encryptionRequired: boolean;
}

interface DLPAlert {
  id: string;
  timestamp: Date;
  type: 'unusual_access' | 'bulk_export' | 'sensitive_data_exposure';
  description: string;
  userId?: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  table: string;
  recordCount?: number;
}

class DataProtectionService {
  private readonly SENSITIVE_TABLES = [
    'students',
    'mental_health_alerts', 
    'weekly_summaries',
    'feedback'
  ];

  private readonly DATA_CLASSIFICATIONS: DataClassification[] = [
    {
      table: 'students',
      classification: 'confidential',
      sensitiveFields: ['full_name', 'password_hash'],
      encryptionRequired: true
    },
    {
      table: 'mental_health_alerts',
      classification: 'restricted',
      sensitiveFields: ['content', 'student_name'],
      encryptionRequired: true
    },
    {
      table: 'weekly_summaries',
      classification: 'confidential',
      sensitiveFields: ['emotional_concerns', 'academic_concerns', 'student_name'],
      encryptionRequired: true
    },
    {
      table: 'feedback',
      classification: 'internal',
      sensitiveFields: ['additional_comments', 'suggestions', 'student_name'],
      encryptionRequired: false
    },
    {
      table: 'teachers',
      classification: 'confidential',
      sensitiveFields: ['email', 'password_hash', 'name'],
      encryptionRequired: true
    }
  ];

  validateEncryptionAtRest(): EncryptionStatus[] {
    const statuses: EncryptionStatus[] = [];
    
    // Database encryption status
    statuses.push({
      service: 'Supabase Database',
      status: 'encrypted',
      algorithm: 'AES-256',
      keyManagement: 'Supabase Managed',
      lastChecked: new Date()
    });

    // Local storage encryption (for demo purposes)
    statuses.push({
      service: 'Browser Local Storage',
      status: 'unencrypted',
      algorithm: 'None',
      keyManagement: 'Not Applicable',
      lastChecked: new Date()
    });

    return statuses;
  }

  validateEncryptionInTransit(): EncryptionStatus[] {
    const statuses: EncryptionStatus[] = [];
    
    // HTTPS validation
    const isHTTPS = window.location.protocol === 'https:';
    statuses.push({
      service: 'Web Application',
      status: isHTTPS ? 'encrypted' : 'unencrypted',
      algorithm: isHTTPS ? 'TLS 1.2+' : 'None',
      keyManagement: 'Certificate Authority',
      lastChecked: new Date()
    });

    // Supabase API encryption
    statuses.push({
      service: 'Supabase API',
      status: 'encrypted',
      algorithm: 'TLS 1.2+',
      keyManagement: 'Supabase Managed',
      lastChecked: new Date()
    });

    return statuses;
  }

  getDataClassifications(): DataClassification[] {
    return this.DATA_CLASSIFICATIONS;
  }

  monitorDataAccess(
    table: string, 
    operation: string, 
    recordCount: number = 1, 
    userId?: string
  ): DLPAlert | null {
    const classification = this.DATA_CLASSIFICATIONS.find(c => c.table === table);
    if (!classification) return null;

    // Check for bulk operations on sensitive data
    if (recordCount > 50 && classification.classification === 'restricted') {
      return {
        id: crypto.randomUUID(),
        timestamp: new Date(),
        type: 'bulk_export',
        description: `Bulk ${operation} operation on ${table} (${recordCount} records)`,
        userId,
        severity: 'high',
        table,
        recordCount
      };
    }

    // Check for unusual access patterns
    if (operation === 'SELECT' && recordCount > 100) {
      return {
        id: crypto.randomUUID(),
        timestamp: new Date(),
        type: 'unusual_access',
        description: `Large data access: ${recordCount} records from ${table}`,
        userId,
        severity: 'medium',
        table,
        recordCount
      };
    }

    return null;
  }

  getEncryptionCompliance(): {
    compliantTables: number;
    totalTables: number;
    compliancePercentage: number;
    violations: string[];
  } {
    const totalTables = this.DATA_CLASSIFICATIONS.length;
    const compliantTables = this.DATA_CLASSIFICATIONS.filter(c => 
      !c.encryptionRequired || this.validateTableEncryption(c.table)
    ).length;

    const violations = this.DATA_CLASSIFICATIONS
      .filter(c => c.encryptionRequired && !this.validateTableEncryption(c.table))
      .map(c => `${c.table} requires encryption but is not properly protected`);

    return {
      compliantTables,
      totalTables,
      compliancePercentage: (compliantTables / totalTables) * 100,
      violations
    };
  }

  private validateTableEncryption(table: string): boolean {
    // For demo purposes, assume Supabase tables are encrypted
    // In production, this would check actual encryption status
    return this.SENSITIVE_TABLES.includes(table);
  }

  logDLPAlert(alert: DLPAlert): void {
    try {
      const existingAlerts = this.getStoredDLPAlerts();
      existingAlerts.push(alert);
      
      // Keep only recent alerts
      const recentAlerts = existingAlerts.slice(-500);
      localStorage.setItem('dlp_alerts', JSON.stringify(recentAlerts));
      
      console.log('DLP Alert logged:', alert);
    } catch (error) {
      console.error('Failed to log DLP alert:', error);
    }
  }

  getDLPAlerts(limit: number = 20): DLPAlert[] {
    try {
      const alerts = this.getStoredDLPAlerts();
      return alerts.slice(-limit).reverse();
    } catch (error) {
      console.error('Failed to get DLP alerts:', error);
      return [];
    }
  }

  private getStoredDLPAlerts(): DLPAlert[] {
    try {
      const stored = localStorage.getItem('dlp_alerts');
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      return [];
    }
  }

  performBackupIntegrityCheck(): {
    backupExists: boolean;
    lastBackup: Date | null;
    integrityValid: boolean;
    retentionCompliant: boolean;
  } {
    // Simulated backup validation for demo
    return {
      backupExists: true,
      lastBackup: new Date(Date.now() - 24 * 60 * 60 * 1000), // 24 hours ago
      integrityValid: true,
      retentionCompliant: true
    };
  }
}

export const dataProtectionService = new DataProtectionService();
