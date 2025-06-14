
import React from 'react';
import { AlertTriangle, Clock } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface RateLimitWarningProps {
  remainingAttempts: number;
  lockoutUntil?: number;
  className?: string;
}

const RateLimitWarning: React.FC<RateLimitWarningProps> = ({ 
  remainingAttempts, 
  lockoutUntil, 
  className = '' 
}) => {
  const formatLockoutTime = (timestamp: number) => {
    const minutes = Math.ceil((timestamp - Date.now()) / (1000 * 60));
    return minutes > 1 ? `${minutes} minutes` : '1 minute';
  };

  if (lockoutUntil && Date.now() < lockoutUntil) {
    return (
      <Alert variant="destructive" className={className}>
        <AlertTriangle className="h-4 w-4" />
        <AlertDescription>
          Account temporarily locked due to too many failed attempts. 
          Try again in {formatLockoutTime(lockoutUntil)}.
        </AlertDescription>
      </Alert>
    );
  }

  if (remainingAttempts <= 2 && remainingAttempts > 0) {
    return (
      <Alert variant="destructive" className={className}>
        <Clock className="h-4 w-4" />
        <AlertDescription>
          Warning: {remainingAttempts} login attempt{remainingAttempts === 1 ? '' : 's'} remaining before account lockout.
        </AlertDescription>
      </Alert>
    );
  }

  return null;
};

export default RateLimitWarning;
