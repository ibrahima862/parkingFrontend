import { Component, ReactNode } from "react";


interface Props { children: ReactNode; }
interface State { hasError: boolean; }

export class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error: Error) {
    if (error.message.includes('removeChild') || error.message.includes('NotFoundError')) {
      this.setState({ hasError: false });
      return;
    }
    console.error(error);
  }

  render() {
    return this.state.hasError
      ? (
        <div className="min-h-screen bg-blue-50/40 flex flex-col items-center justify-center gap-4">
          <div className="w-12 h-12 bg-red-50 border border-red-100 rounded-xl flex items-center justify-center">
            <span className="text-red-500 text-xl">⚠</span>
          </div>
          <p className="text-[14px] font-semibold text-slate-700">Une erreur est survenue.</p>
          <button
            onClick={() => { this.setState({ hasError: false }); window.location.reload(); }}
            className="px-4 py-2.5 bg-blue-700 hover:bg-blue-800 text-white text-[13px] font-bold rounded-xl transition-colors"
          >
            Recharger la page
          </button>
        </div>
      )
      : this.props.children;
  }
}