import { useState, useCallback } from "react";

export function useErrorHandler() {
  const [error, setError] = useState("");

  const showError = useCallback(
    (err, fallback = "Something went wrong") => {
      const message =
        err?.response?.data?.message ||
        err?.message ||
        fallback;

      setError(message);
    },
    []
  );

  const clearError = useCallback(() => {
    setError("");
  }, []);

  return {
    error,
    showError,
    clearError,
  };
}
