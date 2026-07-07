import React, { useState } from "react";
import { motion } from "framer-motion";
import { User as UserIcon, Check, X, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { calculateCurrentAge } from "@/lib/utils";

// Fallback SVG for user images
const FallbackUserSVG = ({ className = "" }) => (
  <div
    className={`flex items-center justify-center bg-input rounded-full ${className}`}
  >
    <UserIcon className="w-1/2 h-1/2 text-primary" />
  </div>
);

// ---------------- Patient Card Component ----------------
const PatientCard = ({ patient, type, onAction, loading, onClick, isSmallScreen }) => {
  const [imageError, setImageError] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);

  const displayName = patient.subUser?.name || patient.name || "Unknown";
  const subUserId = patient.subUser?.subUserId || patient.subUserId;

  const isPendingRequest =
    (type === "requests" || type === "pending") &&
    patient.status === "pending";

  const getPatientImageUrl = (profileImage) => {
    if (!profileImage) return null;
    const imagePath = profileImage.replace(/^\/+/, "").replace(/^[Uu]ploads\//, "");
    const baseUrl = import.meta.env.VITE_API_URL || "http://localhost:4000";
    return `${baseUrl}/${imagePath}?t=${new Date().getTime()}`;
  };

  const imageUrl =
    getPatientImageUrl(patient.subUser?.profileImagePath || patient.profileImage);

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="glass-card rounded-lg shadow-soft overflow-hidden mb-3 transition-transform duration-200 hover:shadow-lg cursor-pointer border border-primary"
      onClick={onClick}
    >
      <div className={`p-2 ${isSmallScreen ? "p-1.5" : ""}`}>
        <div className={`flex items-center mb-3 ${isSmallScreen ? "mb-2" : ""}`}>
          {/* Profile Image */}
          <div className={`relative mr-3 ${isSmallScreen ? "w-12 h-12" : "w-14 h-14"}`}>
            {imageUrl && !imageError ? (
              <>
                <img
                  src={imageUrl}
                  alt={displayName}
                  className="w-full h-full rounded-full object-cover shadow-soft"
                  onError={() => setImageError(true)}
                  onLoad={() => setImageLoaded(true)}
                />
                {!imageLoaded && (
                  <div className="absolute inset-0 flex items-center justify-center bg-input rounded-full">
                    <div className={`w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin ${isSmallScreen ? "w-4 h-4" : ""}`}></div>
                  </div>
                )}
              </>
            ) : (
              <div className="w-full h-full rounded-full shadow-soft flex">
                <FallbackUserSVG className="w-full h-full" />
              </div>
            )}
          </div>

          {/* Patient Info */}
          <div className="flex-1 min-w-0">
            <h3 className={`font-semibold text-text truncate ${isSmallScreen ? "text-base" : "text-lg"}`}>
              {displayName}
            </h3>
            <p className={`text-xs text-primary truncate ${isSmallScreen ? "text-xs" : ""}`}>{subUserId}</p>
            {patient.subUser?.age !== undefined && (
              <p className={`text-xs text-primary ${isSmallScreen ? "text-xs" : ""}`}>
                Age: <span className="font-medium">{patient.subUser.age}</span>
              </p>
            )}
            <p className={`text-xs text-primary bg-primary/10 px-1.5 py-0.5 rounded-full inline-block mt-1 ${isSmallScreen ? "text-xs px-1" : ""}`}>
              Patient
            </p>
          </div>
        </div>

        {/* Pending Requests */}
        {isPendingRequest && (
          <div className={`flex space-x-2 mt-3 ${isSmallScreen ? "mt-2 space-x-1.5" : ""}`}>
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button
                variant="default"
                className={`button-primary text-text flex-1 rounded-lg shadow-soft hover:shadow-lg transition-all text-xs py-1.5 px-3 ${isSmallScreen ? "text-xs py-1 px-2" : ""}`}
                onClick={(e) => {
                  e.stopPropagation();
                  onAction("accept", patient.requestedByUser?.userCode);
                }}
                disabled={loading}
                aria-label="Accept request"
              >
                <Check className={`w-4 h-4 mr-1 ${isSmallScreen ? "w-3 h-3" : ""}`} /> Accept
              </Button>
            </motion.div>
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button
                variant="default"
                className={`button-secondary text-text flex-1 rounded-lg shadow-soft hover:shadow-lg transition-all text-xs py-1.5 px-3 ${isSmallScreen ? "text-xs py-1 px-2" : ""}`}
                onClick={(e) => {
                  e.stopPropagation();
                  onAction("reject", patient.requestedByUser?.userCode);
                }}
                disabled={loading}
                aria-label="Reject request"
              >
                <X className={`w-4 h-4 mr-1 ${isSmallScreen ? "w-3 h-3" : ""}`} /> Reject
              </Button>
            </motion.div>
          </div>
        )}

        {/* Sent Requests (Cancel) */}
        {type === "sent" && (
          <div className={`mt-3 ${isSmallScreen ? "mt-2" : ""}`}>
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button
                variant="default"
                className={`cancel-button text-text w-full rounded-lg shadow-soft hover:shadow-lg transition-all text-xs py-1.5 px-3 ${isSmallScreen ? "text-xs py-1 px-2" : ""}`}
                onClick={(e) => {
                  e.stopPropagation();
                  onAction("cancel", patient.subUser?.userCode);
                }}
                disabled={loading}
                aria-label="Cancel request"
              >
                <X className={`w-4 h-4 mr-1 ${isSmallScreen ? "w-3 h-3" : ""}`} /> Cancel Request
              </Button>
            </motion.div>
          </div>
        )}
      </div>
    </motion.div>
  );
};

// ---------------- Search Result Component ----------------
const SearchResultCard = ({ patient, onSendRequest, loading, isSmallScreen }) => {
  const [imageError, setImageError] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);

  const user = patient.subUser || {};

  const getPatientImageUrl = (profileImageUrl) => {
    if (!profileImageUrl) return null;
    const imagePath = profileImageUrl.replace(/^\/+/, "").replace(/^[Uu]ploads\//, "");
    const baseUrl = import.meta.env.VITE_API_URL || "http://localhost:4000";
    return `${baseUrl}/${imagePath}?t=${new Date().getTime()}`;
  };

  const imageUrl = getPatientImageUrl(user.profileImagePath || user.profileImage);

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={`glass-card rounded-lg shadow-soft p-2 mb-3 flex items-center cursor-pointer border border-primary ${isSmallScreen ? "p-1.5 mb-2" : ""}`}
    >
      {/* Profile Image */}
      <div className={`relative mr-2 ${isSmallScreen ? "w-10 h-10" : "w-12 h-12"}`}>
        {imageUrl && !imageError ? (
          <>
            <img
              src={imageUrl}
              alt={user.name}
              className="w-full h-full rounded-full object-cover shadow-soft"
              onError={() => setImageError(true)}
              onLoad={() => setImageLoaded(true)}
            />
            {!imageLoaded && (
              <div className="absolute inset-0 flex items-center justify-center bg-input rounded-full">
                <div className={`w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin ${isSmallScreen ? "w-3 h-3" : ""}`}></div>
              </div>
            )}
          </>
        ) : (
          <div className="w-full h-full rounded-full shadow-soft flex">
            <FallbackUserSVG className="w-full h-full" />
          </div>
        )}
      </div>

      {/* Patient Info */}
      <div className="flex-1 min-w-0">
        <h3 className={`font-medium text-text truncate ${isSmallScreen ? "text-xs" : "text-sm"}`}>{user.name}</h3>
        <p className={`text-xs text-primary truncate ${isSmallScreen ? "text-xs" : ""}`}>{user.subUserId}</p>
        {user.dateOfBirth && (
          <p className={`text-xs text-primary ${isSmallScreen ? "text-xs" : ""}`}>
            Age: <span className="font-medium">{calculateCurrentAge(user.dateOfBirth)}</span>
          </p>
        )}
      </div>

      {/* Send Request Button */}
      {!patient.isConnected && (
        <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
          <Button
            variant="default"
            className={`ml-2 button-primary text-text rounded-lg px-3 py-1 shadow-soft hover:shadow-lg transition-all text-xs ${isSmallScreen ? "text-xs px-2 py-0.5" : ""}`}
            onClick={onSendRequest}
            disabled={loading}
            aria-label="Send request"
          >
            {loading ? (
              <div className={`w-4 h-4 border-2 border-text border-t-transparent rounded-full animate-spin ${isSmallScreen ? "w-3 h-3" : ""}`} />
            ) : (
              <Send className={`w-4 h-4 ${isSmallScreen ? "w-3 h-3" : ""}`} />
            )}
          </Button>
        </motion.div>
      )}
    </motion.div>
  );
};

export { FallbackUserSVG, PatientCard, SearchResultCard };