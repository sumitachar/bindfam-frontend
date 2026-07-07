import React from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import api from "@/api/base";

class ErrorBoundary extends React.Component {
  state = {
    hasError: false,
    error: null,
  };

  static getDerivedStateFromError(error) {
    return {
      hasError: true,
      error,
    };
  }

  componentDidCatch(error, errorInfo) {
    console.error("ErrorBoundary caught an error:", error, errorInfo);

    // 🔴 SEND REACT RENDER ERROR TO BACKEND VIA AXIOS
    api.post("/error-logs", {
      type: "REACT_RENDER_ERROR",
      message: error.message,
      stack: error.stack,
      componentStack: errorInfo.componentStack,
      url: window.location.pathname,
      userAgent: navigator.userAgent,
      time: new Date().toISOString(),
    }).catch((err) => {
      // ❌ Never break the UI if logging fails
      console.warn("Failed to log error to backend:", err.message);
    });
  }

  handleRetry = () => {
    // Optionally redirect the user or refresh the state
    this.setState({ hasError: false, error: null });
    // window.location.reload(); // Uncomment if you want a hard reset
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex items-center justify-center min-h-[200px] w-full p-4">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="p-6 text-center text-accent glass-card rounded-xl shadow-soft border border-primary max-w-md w-full"
          >
            <h2 className="text-lg font-semibold text-text">
              Something went wrong 😢
            </h2>

            <p className="text-sm text-muted mt-2 bg-black/5 p-2 rounded border border-dashed border-primary/20 break-words">
              {this.state.error?.toString()}
            </p>

            <Button
              className="mt-4 button-primary rounded-full px-6 py-2 text-sm hover:shadow-lg transition-all"
              onClick={this.handleRetry}
            >
              Try Again
            </Button>
          </motion.div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;