"use client";

import React from "react";

type Props = {
  children: React.ReactNode;
  fallback?: React.ReactNode;
};

type State = {
  hasError: boolean;
};

export class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(): State {
    return { hasError: true };
  }

  componentDidCatch(error: unknown) {
    // Log for debugging, avoid exposing internal details in UI.
    // eslint-disable-next-line no-console
    console.error("ErrorBoundary caught:", error);
  }

  render() {
    if (this.state.hasError) {
      return (
        this.props.fallback ?? (
          <div className="min-h-[40vh] flex flex-col items-center justify-center text-center p-6">
            <p className="text-white text-lg font-semibold">Something went wrong. Please try again.</p>
            <button
              type="button"
              onClick={() => window.location.reload()}
              className="mt-4 px-4 py-2 rounded-lg bg-cyan-500 text-black font-medium"
            >
              Refresh
            </button>
          </div>
        )
      );
    }
    return this.props.children;
  }
}
