import React, { Component, ReactNode, ErrorInfo } from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
    };
  }

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.warn('ErrorBoundary caught an error:', error, errorInfo);
  }

  private handleReload = () => {
    this.setState({ hasError: false, error: null });
    window.location.reload();
  };

  private handleReset = () => {
    this.setState({ hasError: false, error: null });
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-slate-950 text-white flex flex-col items-center justify-center p-6 text-center">
          <div className="w-16 h-16 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center mb-4 text-amber-500">
            <AlertTriangle className="w-8 h-8" />
          </div>
          <h2 className="text-xl font-bold text-slate-100 mb-2">कुछ अप्रत्याशित समस्या आई (Something went wrong)</h2>
          <p className="text-sm text-slate-400 max-w-md mb-6">
            एप्लिकेशन को सुरक्षित रीलोड करें या पुनः प्रयास करें। आपका डेटा पूरी तरह सुरक्षित है।
          </p>
          <div className="flex gap-3">
            <button
              onClick={this.handleReset}
              className="px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-sm font-medium transition cursor-pointer"
            >
              पुनः प्रयास करें (Try Again)
            </button>
            <button
              onClick={this.handleReload}
              className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-sm font-bold flex items-center gap-2 transition cursor-pointer"
            >
              <RefreshCw className="w-4 h-4" />
              ऐप रीलोड करें (Reload)
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
