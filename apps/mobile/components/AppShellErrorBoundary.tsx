import { Component, type ErrorInfo, type ReactNode } from "react";
import { View } from "react-native";

import { AppShellErrorFallback } from "@/components/AppShellErrorFallback";

type AppShellErrorBoundaryProps = {
  children: ReactNode;
  onRetry?: () => void;
};

type AppShellErrorBoundaryState = {
  hasError: boolean;
  retryKey: number;
};

export class AppShellErrorBoundary extends Component<
  AppShellErrorBoundaryProps,
  AppShellErrorBoundaryState
> {
  state: AppShellErrorBoundaryState = { hasError: false, retryKey: 0 };

  static getDerivedStateFromError(): Partial<AppShellErrorBoundaryState> {
    return { hasError: true };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    if (__DEV__) {
      console.warn("[AppShellErrorBoundary]", error, info.componentStack);
    }
  }

  private handleRetry = () => {
    this.setState((prev) => ({
      hasError: false,
      retryKey: prev.retryKey + 1,
    }));
    this.props.onRetry?.();
  };

  render() {
    if (this.state.hasError) {
      return <AppShellErrorFallback onRetry={this.handleRetry} />;
    }

    return (
      <View key={this.state.retryKey} style={{ flex: 1 }}>
        {this.props.children}
      </View>
    );
  }
}
