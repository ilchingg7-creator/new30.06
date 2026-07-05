'use client';

import { Component, type ErrorInfo, type ReactNode } from 'react';
import { AlertTriangle, RotateCcw } from 'lucide-react';
import { translations, getDefaultLanguage, type Language } from '../../platform/i18n';

interface ErrorBoundaryProps {
  children: ReactNode;
  language?: Language;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    // In production, this could send to an error reporting service.
    // For now, log to console for debugging.
    if (typeof console !== 'undefined') {
      console.error('ErrorBoundary caught:', error, errorInfo);
    }
  }

  handleReload = (): void => {
    if (typeof window !== 'undefined') {
      window.location.reload();
    }
  };

  render(): ReactNode {
    if (!this.state.hasError) {
      return this.props.children;
    }

    const lang = this.props.language ?? (typeof window !== 'undefined' ? getDefaultLanguage() : 'ru');
    const t = translations[lang];

    return (
      <div className="error-boundary-overlay">
        <div className="error-boundary-card">
          <div className="error-boundary-icon">
            <AlertTriangle aria-hidden="true" size={40} />
          </div>
          <h2 className="error-boundary-title">{t.errorBoundaryTitle}</h2>
          <p className="error-boundary-body">{t.errorBoundaryBody}</p>
          {this.state.error && (
            <details className="error-boundary-details">
              <summary>Stack trace</summary>
              <pre>{this.state.error.message}</pre>
            </details>
          )}
          <button type="button" className="error-boundary-btn" onClick={this.handleReload}>
            <RotateCcw aria-hidden="true" size={16} />
            {t.errorBoundaryReload}
          </button>
        </div>
      </div>
    );
  }
}
