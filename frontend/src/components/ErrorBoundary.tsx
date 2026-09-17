import { Component } from 'react';
import type { ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
}

interface State {
  error: Error | null;
}

/**
 * Catches render-time crashes so a broken page shows a recovery screen rather
 * than a blank document.
 *
 * This must stay a class component: React has no hook equivalent of
 * `componentDidCatch`.
 */
export class ErrorBoundary extends Component<Props, State> {
  state: State = { error: null };

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  componentDidCatch(error: Error, info: ErrorInfo): void {
    // Kept to the console in development; wire an error reporter in here.
    console.error('Unhandled render error', error, info.componentStack);
  }

  private handleReload = (): void => {
    window.location.reload();
  };

  render(): ReactNode {
    const { error } = this.state;

    if (!error) return this.props.children;

    return (
      <div className="error-page">
        <p className="error-page__code">Something went wrong</p>
        <h1 className="error-page__title">This page could not be displayed</h1>
        <p className="error-page__description">
          An unexpected error stopped the page from rendering. Reloading usually clears it.
        </p>

        {import.meta.env.DEV && <pre className="error-page__detail">{error.message}</pre>}

        <button type="button" className="btn btn--primary btn--md" onClick={this.handleReload}>
          <span>Reload the page</span>
        </button>
      </div>
    );
  }
}
