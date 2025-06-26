
import React, { Component, ErrorInfo, ReactNode } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertTriangle, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { enhancedSecurityValidationService } from '@/services/enhancedSecurityValidationService';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  errorMessage: string;
}

class MentalHealthErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, errorMessage: '' };
  }

  static getDerivedStateFromError(error: Error): State {
    return {
      hasError: true,
      errorMessage: error.message || 'An unexpected error occurred'
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Mental Health component error:', error, errorInfo);
    
    // Log security event for component errors that might indicate tampering
    enhancedSecurityValidationService.logSecurityEvent({
      type: 'suspicious_activity',
      details: `Mental health component error: ${error.message}`,
      severity: 'medium'
    });
  }

  handleRetry = () => {
    this.setState({ hasError: false, errorMessage: '' });
  };

  render() {
    if (this.state.hasError) {
      return (
        <Card className="w-full border-red-200 bg-red-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-red-800">
              <AlertTriangle className="w-5 h-5" />
              Mental Health Data Error
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-red-700">
              An error occurred while loading mental health data. This has been logged for security review.
            </p>
            <p className="text-sm text-red-600">
              Error: {this.state.errorMessage}
            </p>
            <Button 
              onClick={this.handleRetry}
              variant="outline" 
              className="border-red-300 text-red-700 hover:bg-red-100"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Try Again
            </Button>
          </CardContent>
        </Card>
      );
    }

    return this.props.children;
  }
}

export default MentalHealthErrorBoundary;
