"use client";

import React, { ReactNode, Suspense } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import ErrorFabblack from "./error-fallback";
import LoadingFallback from "./loading-fallback";

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
  suspenseFallback?: ReactNode;
  className?: string;
}

interface ErrorBoundaryState {
  hasError: boolean;
}

class ErrorBoundary extends React.Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  constructor(props: ErrorBoundaryProps) {
    super(props);

    this.state = { hasError: false };
  }

  static getDerivedStateFromError(_: Error): ErrorBoundaryState {
    return { hasError: true };
  }

  handleTryAgainClick = (): void => {
    this.setState({ hasError: false });
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div
          className={cn(
            "flex flex-col items-center w-full h-full gap-3 py-6",
            this.props.className
          )}
        >
          <ErrorFabblack />
          <Button
            size="sm"
            variant="secondary"
            onClick={this.handleTryAgainClick}
          >
            Try again?
          </Button>
        </div>
      );
    }

    return (
      <Suspense
        fallback={
          this.props.suspenseFallback || <LoadingFallback className="py-6" />
        }
      >
        {this.props.children}
      </Suspense>
    );
  }
}

export default ErrorBoundary;
