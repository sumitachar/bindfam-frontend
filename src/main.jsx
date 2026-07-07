import { StrictMode, useEffect, useContext } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter, useNavigate } from "react-router-dom";
import "./index.css";
import App from "./App.jsx";
import { ErrorProvider } from "./context/ErrorContext";
import { Toaster } from "sonner";
import ErrorBoundary from "./pages/Parents/Home/components/ErrorBoundary";
import api from "./api/base";
import { UserContext, UserProvider } from "./context/UserContext";

// 🔹 Custom hook to log global JS errors
function useGlobalErrorLogger() {
  // ✅ useContext safely inside UserProvider
  const context = useContext(UserContext);
  const user = context?.user;
  const selectedEntity = context?.selectedEntity;

  useEffect(() => {
    const handler = (message, source, lineno, colno, error) => {
      api.post("/error-logs", {
        type: "JS_RUNTIME_ERROR",
        message,
        source,
        lineno,
        colno,
        stack: error?.stack,
        url: window.location.pathname,
        userAgent: navigator.userAgent,
        time: new Date().toISOString(),
        userCode: user?.userCode || null,
        subUserId: selectedEntity?.subUserId || null,
      }).catch(() => {
        // silent fail
      });
    };

    window.addEventListener("error", handler);
    return () => window.removeEventListener("error", handler);
  }, [user, selectedEntity]);
}

// 🔹 Inner App wrapped with ErrorBoundary + Toaster
const InnerApp = () => {
  useGlobalErrorLogger(); // ✅ UserContext is available here

  return (
    <ErrorBoundary>
      <Toaster position="top-center" richColors />
      <App />
    </ErrorBoundary>
  );
};

// 🔹 Root component wrapped with providers
const RootWithProviders = ({ navigate }) => {
  return (
    <ErrorProvider>
      <UserProvider navigate={navigate}>
        <InnerApp />
      </UserProvider>
    </ErrorProvider>
  );
};

// 🔹 Hook wrapper for useNavigate
function InnerRoot() {
  const navigate = useNavigate();
  return <RootWithProviders navigate={navigate} />;
}

// 🔹 Main render
createRoot(document.getElementById("root")).render(
  <StrictMode>
    <BrowserRouter basename="/app">
      <InnerRoot />
    </BrowserRouter>
  </StrictMode>
);
