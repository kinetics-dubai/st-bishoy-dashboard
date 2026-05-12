import React from 'react';
import { Button, Result } from 'antd';
import { useTranslation } from 'react-i18next';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    // Log detailed error information
    console.error('Error caught by boundary:', {
      error: error.toString(),
      stack: error.stack,
      componentStack: errorInfo.componentStack,
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent,
      url: window.location.href
    });

    // Store error info for potential error reporting service
    this.setState({ errorInfo });

    // Optional: Send error to error reporting service
    // this.reportError(error, errorInfo);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
    window.location.href = '/dashboard';
  };

  handleReload = () => {
    window.location.reload();
  };

  reportError = (error, errorInfo) => {
    // Placeholder for error reporting service integration
    // Example: Sentry.captureException(error, { extra: errorInfo });
    if (import.meta.env.DEV) {
      console.warn('Error reporting not configured in development');
    }
  };

  render() {
    if (this.state.hasError) {
      return <ErrorFallback 
        onReset={this.handleReset} 
        onReload={this.handleReload}
        error={this.state.error}
        isDevelopment={import.meta.env.DEV}
      />;
    }

    return this.props.children;
  }
}

function ErrorFallback({ onReset, onReload, error, isDevelopment }) {
  const { t } = useTranslation();

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <Result
        status="error"
        title={t('error.somethingWentWrong', 'Something went wrong')}
        subTitle={t('error.pageError', 'An unexpected error occurred while rendering this page.')}
        extra={[
          <Button key="dashboard" type="primary" onClick={onReset} style={{ background: '#6B1A1A' }}>
            {t('error.returnToDashboard', 'Return to Dashboard')}
          </Button>,
          <Button key="reload" onClick={onReload}>
            {t('error.reloadPage', 'Reload Page')}
          </Button>
        ]}
      >
        {isDevelopment && error && (
          <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded">
            <h4 className="text-red-800 font-semibold mb-2">Development Error Details:</h4>
            <pre className="text-xs text-red-700 overflow-auto max-h-40">
              {error.toString()}
              {error.stack}
            </pre>
          </div>
        )}
      </Result>
    </div>
  );
}

export default ErrorBoundary;
