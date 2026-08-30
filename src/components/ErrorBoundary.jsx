import { Component } from "react";
import CommonButton from "./CommanButton";

export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { error: null };
  }

  static getDerivedStateFromError(error) {
    return { error };
  }

  componentDidCatch(error, info) {
    console.error("Unhandled UI error:", error, info.componentStack);
  }

  handleReset = () => {
    this.setState({ error: null });
  };

  render() {
    if (this.state.error) {
      return (
        <div className="flex grow flex-col items-center justify-center gap-5 text-center p-8 sm:p-14 min-h-[60vh]">
          <div className="w-16 h-16 rounded-2xl bg-rose-500/10 border border-rose-200 flex items-center justify-center text-3xl shadow-sm animate-bounce">
            ⚠️
          </div>
          <div className="max-w-md space-y-2">
            <h1 className="font-manrope text-2xl font-bold text-slate-800">
              Something went wrong
            </h1>
            <p className="text-xs text-slate-500 leading-relaxed">
              {this.state.error.message || "An unexpected error occurred while loading this view."}
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-3 pt-2">
            <button
              type="button"
              onClick={this.handleReset}
              className="px-5 py-2.5 rounded-xl border border-slate-200 bg-white text-slate-700 text-xs font-bold hover:bg-slate-50 shadow-sm"
            >
              Try Again
            </button>
            <button
              type="button"
              onClick={() => window.location.assign("/")}
              className="px-5 py-2.5 rounded-xl glossy-gradient-btn text-white text-xs font-bold shadow-md shadow-blue-500/25"
            >
              Return to Home
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}
