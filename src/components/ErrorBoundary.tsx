import { Component, type ErrorInfo, type ReactNode } from "react";

interface ErrorBoundaryProps {
  children: ReactNode;
}

interface ErrorBoundaryState {
  error: Error | null;
}

/**
 * Catches render-time errors anywhere below it so a bug in one screen
 * (e.g. a data-shape mismatch) shows a recoverable message instead of
 * silently unmounting the entire app to a blank page.
 */
export default class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  state: ErrorBoundaryState = { error: null };

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error("Unhandled UI error:", error, info.componentStack);
  }

  handleReset = () => {
    this.setState({ error: null });
  };

  render() {
    if (this.state.error) {
      return (
        <div className="flex grow flex-col items-center justify-center gap-4 text-center p-10">
          <span className="text-4xl">⚠️</span>
          <h1 className="font-manrope text-xl font-bold text-green-text-1">
            Something went wrong on this page
          </h1>
          <p className="text-[12px] text-muted-green max-w-sm">
            {this.state.error.message || "An unexpected error occurred."}
          </p>
          <div className="flex gap-3">
            <button
              type="button"
              onClick={this.handleReset}
              className="rounded-[10px] border border-border-grey px-5 py-2.5 text-[13px] font-semibold text-green-text-1 hover:bg-gray-50"
            >
              Try again
            </button>
            <button
              type="button"
              onClick={() => window.location.assign("/")}
              className="rounded-[10px] bg-accent text-white px-5 py-2.5 text-[13px] font-semibold"
            >
              Go home
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
