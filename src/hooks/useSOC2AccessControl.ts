
import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { mfaEnforcementService } from '@/services/security/mfaEnforcementService';
import { accessControlMonitorService } from '@/services/security/accessControlMonitorService';

interface AccessControlState {
  mfaRequired: boolean;
  mfaValid: boolean;
  requiresSetup: boolean;
  privilegedAccess: boolean;
  accessPatterns: any[];
  lastMFACheck: Date | null;
}

export const useSOC2AccessControl = () => {
  const { teacher, student } = useAuth();
  const [accessState, setAccessState] = useState<AccessControlState>({
    mfaRequired: false,
    mfaValid: true,
    requiresSetup: false,
    privilegedAccess: false,
    accessPatterns: [],
    lastMFACheck: null
  });

  useEffect(() => {
    const checkAccessControl = () => {
      const currentUser = teacher || student;
      if (!currentUser) {
        setAccessState({
          mfaRequired: false,
          mfaValid: true,
          requiresSetup: false,
          privilegedAccess: false,
          accessPatterns: [],
          lastMFACheck: null
        });
        return;
      }

      const userRole = teacher?.role || 'student';
      const mfaRequirement = mfaEnforcementService.checkMFARequirement(
        currentUser.id, 
        userRole,
        teacher ? 'teacher' : 'student'
      );
      
      const mfaStatus = mfaEnforcementService.validateMFAStatus(
        currentUser.id, 
        userRole
      );

      const isPrivileged = ['admin', 'doctor', 'platform_admin'].includes(userRole);
      const patterns = accessControlMonitorService.getAccessPatterns();

      setAccessState({
        mfaRequired: mfaRequirement.isRequired,
        mfaValid: mfaStatus.isValid,
        requiresSetup: mfaStatus.requiresSetup,
        privilegedAccess: isPrivileged,
        accessPatterns: patterns,
        lastMFACheck: new Date()
      });

      // Monitor this access check
      accessControlMonitorService.monitorAccess(
        currentUser.id,
        userRole,
        'dashboard',
        'access_check',
        true
      );
    };

    checkAccessControl();
    
    // Check every 5 minutes
    const interval = setInterval(checkAccessControl, 5 * 60 * 1000);
    
    return () => clearInterval(interval);
  }, [teacher, student]);

  const recordResourceAccess = (resource: string, action: string, success: boolean = true) => {
    const currentUser = teacher || student;
    if (!currentUser) return;

    const userRole = teacher?.role || 'student';
    accessControlMonitorService.monitorAccess(
      currentUser.id,
      userRole,
      resource,
      action,
      success
    );
  };

  const validateAccess = (resource: string, action: string): boolean => {
    const currentUser = teacher || student;
    if (!currentUser) return false;

    const userRole = teacher?.role || 'student';
    return accessControlMonitorService.validateRoleBasedAccess(userRole, resource, action);
  };

  return {
    ...accessState,
    recordResourceAccess,
    validateAccess
  };
};
