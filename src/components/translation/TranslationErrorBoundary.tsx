
import React, { Component, ErrorInfo, ReactNode } from 'react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertTriangle } from 'lucide-react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
  errorInfo?: ErrorInfo;
}

class TranslationErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Translation Error:', error, errorInfo);
    
    // Log translation errors for monitoring
    this.logTranslationError(error, errorInfo);
    
    this.setState({
      error,
      errorInfo
    });
  }

  private logTranslationError(error: Error, errorInfo: ErrorInfo) {
    // In production, send to monitoring service
    const errorReport = {
      message: error.message,
      stack: error.stack,
      componentStack: errorInfo.componentStack,
      timestamp: new Date().toISOString(),
      type: 'translation_error'
    };
    
    console.warn('Translation Error Report:', errorReport);
    
    // Store locally for debugging
    try {
      const existingErrors = JSON.parse(localStorage.getItem('translation_errors') || '[]');
      existingErrors.push(errorReport);
      localStorage.setItem('translation_errors', JSON.stringify(existingErrors.slice(-50))); // Keep last 50 errors
    } catch (e) {
      console.warn('Could not store translation error:', e);
    }
  }

  public render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <Alert variant="destructive" className="m-4">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            <strong>Translation Error</strong>
            <p className="mt-2">
              Something went wrong with the translation system. The page will continue to work, 
              but some text might appear in English instead of Lithuanian.
            </p>
            {process.env.NODE_ENV === 'development' && this.state.error && (
              <details className="mt-2">
                <summary className="cursor-pointer">Technical Details</summary>
                <pre className="mt-2 text-xs overflow-auto">
                  {this.state.error.message}
                  {this.state.errorInfo?.componentStack}
                </pre>
              </details>
            )}
          </AlertDescription>
        </Alert>
      );
    }

    return this.props.children;
  }
}

export default TranslationErrorBoundary;
