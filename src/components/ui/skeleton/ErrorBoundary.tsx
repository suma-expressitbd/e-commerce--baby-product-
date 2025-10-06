'use client';
import React from 'react';

interface ErrorBoundaryState {
    error: Error | null;
    errorInfo: React.ErrorInfo | null;
}

class ErrorBoundary extends React.Component<{}, ErrorBoundaryState> {
    state: ErrorBoundaryState = { error: null, errorInfo: null };

    static getDerivedStateFromError(error: Error) {
        return { error };
    }

    componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
        console.error('Error caught in boundary:', error, errorInfo);
        this.setState({ error, errorInfo });
    }

    render() {
        if (this.state.error) {
            return (
                <div>
                    <h2>Something went wrong.</h2>
                    <p>{this.state.error.message}</p>
                    <pre>{this.state.errorInfo?.componentStack}</pre>
                </div>
            );
        }
        return this.props.children;
    }
}

export default ErrorBoundary;