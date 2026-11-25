import { Component, ErrorInfo, ReactNode } from 'react';
import { RefreshCw } from 'lucide-react';

interface ErrorBoundaryProps {
  children: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  state: ErrorBoundaryState = { hasError: false };

  static getDerivedStateFromError(): ErrorBoundaryState {
    return { hasError: true };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('KAK ZONE UI Error:', error, info);
  }

  handleReload = () => {
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div
          dir="rtl"
          className="min-h-screen bg-[#090909] text-[#F8F5EF] flex flex-col items-center justify-center px-6 text-center"
        >
          <div className="max-w-md w-full bg-[#171717] border border-[#F5B418]/35 rounded-2xl p-6 space-y-4">
            <h1 className="font-display text-xl font-extrabold text-[#F5B418]">
              حدث خطأ غير متوقع في عرض المنيو
            </h1>
            <p className="text-sm text-[#A8A29E] leading-relaxed">
              برجاء إعادة تحميل الصفحة للمتابعة واستعراض قائمة طعام KAK ZONE.
            </p>
            <button
              type="button"
              onClick={this.handleReload}
              className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-[#DC1013] hover:bg-[#B91C1C] text-white text-sm font-bold transition-colors cursor-pointer"
            >
              <RefreshCw className="w-4 h-4" />
              <span>إعادة تحميل الصفحة</span>
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
