import React from "react";
import { Button } from "@/components/ui/button";
import { AlertCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";

const NotFoundPage = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#fefcf5] via-[#f7f5f0] to-[#f9f9f9] dark:from-[#0f172a] dark:via-[#1b263b] dark:to-[#111827] p-4">
      <div className="w-full max-w-md glass-card border border-primary shadow-soft p-6 flex flex-col items-center space-y-4">
        {/* Error Icon */}
        <AlertCircle className="w-12 h-12 text-red-500" />

        {/* Title */}
        <h2 className="text-2xl font-extrabold text-center text-primary">
          Oops! Page Not Found
        </h2>

        {/* Message */}
        <p className="text-muted text-center text-sm">
          The page you are looking for doesn’t exist or has been moved.
        </p>

        {/* Go Home Button */}
        <Button
          onClick={() => navigate("/")}
          className="w-full py-2 rounded-full shadow-md hover:shadow-lg transition-all button-primary text-text"
        >
          Go to Home
        </Button>
      </div>
    </div>
  );
};

export default NotFoundPage;