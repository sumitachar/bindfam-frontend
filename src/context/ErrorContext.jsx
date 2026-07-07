import React, { createContext, useContext, useState } from "react";

const ErrorContext = createContext();

export const ErrorProvider = ({ children }) => {
  const [error, setError] = useState(null);

  const showError = (message) => {
    setError(message);
  };

  const clearError = () => {
    setError(null);
  };

  return (
    <ErrorContext.Provider value={{ error, showError, clearError }}>
      {children}

      {/* 🔴 CENTRAL ERROR MODAL */}
      {error && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 w-full max-w-sm shadow-lg">
            <h2 className="text-lg font-bold text-red-600 mb-3">Error</h2>
            <p className="text-sm text-gray-700 dark:text-gray-200">
              {error}
            </p>
            <button
              onClick={clearError}
              className="mt-5 w-full rounded-full button-primary py-2 text-white"
            >
              OK
            </button>
          </div>
        </div>
      )}
    </ErrorContext.Provider>
  );
};

export const useError = () => useContext(ErrorContext);
