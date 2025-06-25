interface ChangeRecord {
  id: string;
  timestamp: Date;
  changeType: 'configuration' | 'deployment' | 'security_update' | 'user_access' | 'system_setting';
  description: string;
  changedBy: string;
  affectedSystem: string;
  approvalStatus: 'pending' | 'approved' | 'rejected' | 'emergency';
  approvedBy?: string;
  rollbackPlan?: string;
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
  businessJustification: string;
  testingCompleted: boolean;
  metadata: Record<string, any>;
}

interface ChangeApproval {
  id: string;
  changeId: string;
  approver: string;
  decision: 'approved' | 'rejected';
  comments?: string;
  timestamp: Date;
}

class ChangeControlService {
  private readonly STORAGE_KEY = 'soc2_change_records';
  private readonly APPROVAL_KEY = 'soc2_change_approvals';

  logChange(change: Omit<ChangeRecord, 'id' | 'timestamp'>): string {
    const changeRecord: ChangeRecord = {
      id: crypto.randomUUID(),
      timestamp: new Date(),
      ...change
    };

    try {
      const existingChanges = this.getStoredChanges();
      existingChanges.push(changeRecord);
      
      // Keep only recent changes (last 1000)
      const recentChanges = existingChanges.slice(-1000);
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(recentChanges));
      
      console.log('Change Control - Change Logged:', changeRecord);
      
      // Auto-create approval workflow for high-risk changes
      if (changeRecord.riskLevel === 'high' || changeRecord.riskLevel === 'critical') {
        this.initiateApprovalWorkflow(changeRecord);
      }
      
      return changeRecord.id;
    } catch (error) {
      console.error('Failed to log change:', error);
      throw error;
    }
  }

  getChangeHistory(limit: number = 50): ChangeRecord[] {
    try {
      const changes = this.getStoredChanges();
      return changes.slice(-limit).reverse();
    } catch (error) {
      console.error('Failed to get change history:', error);
      return [];
    }
  }

  approveChange(changeId: string, approver: string, decision: 'approved' | 'rejected', comments?: string): void {
    const approval: ChangeApproval = {
      id: crypto.randomUUID(),
      changeId,
      approver,
      decision,
      comments,
      timestamp: new Date()
    };

    try {
      // Update change record
      const changes = this.getStoredChanges();
      const changeIndex = changes.findIndex(c => c.id === changeId);
      
      if (changeIndex !== -1) {
        changes[changeIndex].approvalStatus = decision;
        changes[changeIndex].approvedBy = approver;
        localStorage.setItem(this.STORAGE_KEY, JSON.stringify(changes));
      }

      // Store approval record
      const approvals = this.getStoredApprovals();
      approvals.push(approval);
      localStorage.setItem(this.APPROVAL_KEY, JSON.stringify(approvals.slice(-500)));
      
      console.log('Change Control - Approval Processed:', approval);
    } catch (error) {
      console.error('Failed to process approval:', error);
      throw error;
    }
  }

  getComplianceReport(): {
    totalChanges: number;
    pendingApprovals: number;
    emergencyChanges: number;
    highRiskChanges: number;
    complianceScore: number;
    recentViolations: string[];
  } {
    const changes = this.getStoredChanges();
    const last30Days = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const recentChanges = changes.filter(c => new Date(c.timestamp) > last30Days);
    
    const pendingApprovals = recentChanges.filter(c => c.approvalStatus === 'pending').length;
    const emergencyChanges = recentChanges.filter(c => c.approvalStatus === 'emergency').length;
    const highRiskChanges = recentChanges.filter(c => 
      c.riskLevel === 'high' || c.riskLevel === 'critical'
    ).length;
    
    // Calculate compliance score
    const totalRequiringApproval = recentChanges.filter(c => 
      c.riskLevel === 'high' || c.riskLevel === 'critical'
    ).length;
    const properlyApproved = recentChanges.filter(c => 
      (c.riskLevel === 'high' || c.riskLevel === 'critical') && 
      c.approvalStatus === 'approved'
    ).length;
    
    const complianceScore = totalRequiringApproval > 0 
      ? Math.round((properlyApproved / totalRequiringApproval) * 100)
      : 100;
    
    // Identify violations
    const recentViolations: string[] = [];
    recentChanges.forEach(change => {
      if (change.riskLevel === 'critical' && change.approvalStatus !== 'approved') {
        recentViolations.push(`Critical change ${change.id} lacks proper approval`);
      }
      if (!change.testingCompleted && change.riskLevel !== 'low') {
        recentViolations.push(`Change ${change.id} deployed without testing`);
      }
    });

    return {
      totalChanges: recentChanges.length,
      pendingApprovals,
      emergencyChanges,
      highRiskChanges,
      complianceScore,
      recentViolations: recentViolations.slice(0, 10)
    };
  }

  private initiateApprovalWorkflow(change: ChangeRecord): void {
    console.log(`Change Control - Approval workflow initiated for change ${change.id}`);
    // In a real implementation, this would trigger notifications to approvers
  }

  private getStoredChanges(): ChangeRecord[] {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      return [];
    }
  }

  private getStoredApprovals(): ChangeApproval[] {
    try {
      const stored = localStorage.getItem(this.APPROVAL_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      return [];
    }
  }

  // Monitor system changes automatically
  monitorSystemChanges(): void {
    // Monitor route changes
    const currentPath = window.location.pathname;
    const lastPath = sessionStorage.getItem('last_route');
    
    if (lastPath && lastPath !== currentPath) {
      this.logChange({
        changeType: 'system_setting',
        description: `Route change from ${lastPath} to ${currentPath}`,
        changedBy: 'system',
        affectedSystem: 'navigation',
        approvalStatus: 'approved',
        riskLevel: 'low',
        businessJustification: 'User navigation',
        testingCompleted: true,
        metadata: { previousRoute: lastPath, newRoute: currentPath }
      });
    }
    
    sessionStorage.setItem('last_route', currentPath);
  }

  // Log configuration changes
  logConfigurationChange(
    setting: string, 
    oldValue: any, 
    newValue: any, 
    changedBy: string,
    justification: string
  ): void {
    this.logChange({
      changeType: 'configuration',
      description: `Configuration change: ${setting}`,
      changedBy,
      affectedSystem: 'application_config',
      approvalStatus: 'approved',
      riskLevel: this.assessConfigRisk(setting),
      businessJustification: justification,
      testingCompleted: false,
      metadata: {
        setting,
        oldValue,
        newValue,
        changeTime: new Date().toISOString()
      }
    });
  }

  private assessConfigRisk(setting: string): 'low' | 'medium' | 'high' | 'critical' {
    const criticalSettings = ['auth', 'security', 'database', 'encryption'];
    const highRiskSettings = ['api', 'permissions', 'access'];
    const mediumRiskSettings = ['ui', 'features', 'monitoring'];
    
    const lowerSetting = setting.toLowerCase();
    
    if (criticalSettings.some(s => lowerSetting.includes(s))) return 'critical';
    if (highRiskSettings.some(s => lowerSetting.includes(s))) return 'high';
    if (mediumRiskSettings.some(s => lowerSetting.includes(s))) return 'medium';
    
    return 'low';
  }
}

export const changeControlService = new ChangeControlService();
