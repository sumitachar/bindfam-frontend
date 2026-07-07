// src/pages/components/SentRequestCard.jsx
import React from "react";
import { motion } from "framer-motion";
import { User as UserIcon, X } from "lucide-react";
import { Button } from "@/components/ui/button";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:4000";

const SentRequestCard = ({ request, onCancel, isCancelling }) => {
  const profileImageUrl = request.parent?.profileImage
    ? `${API_URL}/${request.parent.profileImage
        .replace(/^\/+/, "")
        .replace(/^[Uu]ploads\//, "")}?v=${request.parent.updatedAt || ""}`
    : null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass-card rounded-xl shadow-soft border border-primary overflow-hidden p-2 flex items-center gap-3"
    >
      <div className="relative w-12 h-12 flex-shrink-0">
        {profileImageUrl ? (
          <img
            src={profileImageUrl}
            alt={request.parent.name}
            className="w-full h-full object-cover rounded-full"
            onError={(e) => {
              e.target.style.display = "none";
              e.target.nextSibling.classList.remove("hidden");
            }}
          />
        ) : null}

        <div
          className={`w-full h-full flex items-center justify-center rounded-full bg-input ${
            profileImageUrl ? "hidden" : ""
          }`}
        >
          <UserIcon className="w-6 h-6 text-primary" />
        </div>
      </div>

      <div className="flex-1 min-w-0">
        <p className="font-medium text-text text-sm truncate">{request.parent.name}</p>
        <p className="text-muted text-xs">{request.parent.userCode}</p>
      </div>

      <Button
        onClick={onCancel}
        disabled={isCancelling}
        className="button-accent rounded-full px-3 py-1 text-xs hover:shadow-md transition-all"
      >
        {isCancelling ? (
          <svg className="animate-spin w-4 h-4 text-white" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
          </svg>
        ) : (
          <>
            <X className="w-3 h-3 mr-1" />
            Cancel
          </>
        )}
      </Button>
    </motion.div>
  );
};

export default SentRequestCard;