import React, { useState } from "react";
import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { User2, Check, Trash2, Loader2 } from "lucide-react";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:4000";

const DoctorFallbackImage = ({ className = "" }) => (
  <div
    className={`flex items-center justify-center bg-input rounded-full ${className}`}
  >
    <User2 className="text-primary text-lg" />
  </div>
);

const DoctorCard = ({
  doctor,
  type,
  onAction,
  loading,
  permissions,
  onPermissionChange,
}) => {
  const [imageError, setImageError] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [isSmallScreen, setIsSmallScreen] = useState(false);

  React.useEffect(() => {
    const checkDevice = () => {
      setIsSmallScreen(window.innerHeight < 600);
    };
    checkDevice();
    window.addEventListener("resize", checkDevice);
    return () => window.removeEventListener("resize", checkDevice);
  }, []);

  const getDoctorImageUrl = (profileImage) => {
    if (!profileImage) return null;
    const imagePath = profileImage
      .replace(/^\/+/, "")
      .replace(/^[Uu]ploads\//i, "");
    return `${API_URL}/${imagePath}?t=${new Date().getTime()}`;
  };

  const imageUrl = getDoctorImageUrl(doctor?.profileImage);

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
    >
      <Card
        className={`glass-card border border-primary rounded-lg shadow-soft ${
          isSmallScreen ? "p-1.5" : "p-2"
        }`}
      >
        <CardContent className={`p-2 ${isSmallScreen ? "p-1.5" : ""}`}>
          <div
            className={`flex items-start mb-2 ${isSmallScreen ? "mb-1.5" : ""}`}
          >
            <div className="relative mr-2 shrink-0">
              {imageUrl && !imageError ? (
                <>
                  <img
                    src={imageUrl}
                    alt={doctor?.name || "Doctor"}
                    className={`rounded-full object-cover shadow-soft ${
                      isSmallScreen ? "w-10 h-10" : "w-12 h-12"
                    }`}
                    onError={() => {
                      console.error("Image failed to load:", imageUrl);
                      setImageError(true);
                    }}
                    onLoad={() => {
                      setImageLoaded(true);
                    }}
                  />
                  {!imageLoaded && (
                    <div
                      className={`absolute inset-0 flex items-center justify-center bg-input rounded-full ${
                        isSmallScreen ? "w-10 h-10" : "w-12 h-12"
                      }`}
                    >
                      <Loader2
                        className={`w-4 h-4 animate-spin text-primary ${
                          isSmallScreen ? "w-3 h-3" : ""
                        }`}
                      />
                    </div>
                  )}
                </>
              ) : (
                <div
                  className={`rounded-full shadow-soft flex ${
                    isSmallScreen ? "w-10 h-10" : "w-12 h-12"
                  }`}
                >
                  <DoctorFallbackImage className="w-full h-full" />
                </div>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <h3
                className={`font-semibold text-text truncate ${
                  isSmallScreen ? "text-xs" : "text-sm"
                }`}
              >
                {doctor?.name || "Unknown"}
              </h3>
              <p
                className={`text-muted truncate mt-0.5 ${
                  isSmallScreen ? "text-xs" : "text-sm"
                }`}
              >
                {doctor?.userCode || "N/A"}
              </p>
              <p
                className={`text-primary bg-primary/10 px-1.5 py-0.5 rounded-full inline-block mt-0.5 text-xs ${
                  isSmallScreen ? "text-xs px-1" : ""
                }`}
              >
                {doctor?.role || "Doctor"}
              </p>
            </div>
          </div>

          {type === "linked" && permissions && (
            <div
              className={`border-t border-primary/20 pt-2 mt-1.5 ${
                isSmallScreen ? "pt-1.5 mt-1" : ""
              }`}
            >
              <h4
                className={`text-primary font-medium mb-1.5 ${
                  isSmallScreen ? "text-xs" : "text-sm"
                }`}
              >
                Access Permissions
              </h4>
              <div className="grid grid-cols-2 gap-1.5">
                {["vaccination","medicalReports", "medicines", "prescription", "growth"].map(
                  (perm) => (
                    <label key={perm} className="flex items-center space-x-1.5">
                      <Checkbox
                        checked={permissions[perm] || false}
                        onCheckedChange={() =>
                          onPermissionChange(doctor.userCode, perm)
                        }
                        disabled={loading}
                        className={`rounded border-primary text-primary focus:ring-primary ${
                          isSmallScreen ? "w-3.5 h-3.5" : "w-4 h-4"
                        }`}
                      />
                      <span
                        className={`text-text capitalize truncate ${
                          isSmallScreen ? "text-xs" : "text-sm"
                        }`}
                      >
                        {perm === "vaccination"
                          ? "Vaccines"
                          : perm === "medicalReports"
                          ? "Medical Reports"
                          : perm === "medicines"
                          ? "Medications"
                          : perm === "prescription"
                          ? "Prescriptions"
                          : "Growth"}
                      </span>
                    </label>
                  )
                )}
              </div>
            </div>
          )}

          {type === "pending" && (
            <div
              className={`flex space-x-1.5 mt-2 ${
                isSmallScreen ? "mt-1.5" : ""
              }`}
            >
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Button
                  className={`button-primary text-text flex-1 rounded-lg shadow-soft hover:shadow-lg transition-all ${
                    isSmallScreen ? "text-xs py-1" : "text-sm py-1.5"
                  }`}
                  onClick={() => onAction("accept", doctor.userCode)}
                  disabled={loading}
                >
                  <Check
                    className={`w-3 h-3 mr-1 ${
                      isSmallScreen ? "w-2.5 h-2.5" : ""
                    }`}
                  />{" "}
                  Accept
                </Button>
              </motion.div>
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Button
                  className={`cancel-button text-text flex-1 rounded-lg shadow-soft hover:shadow-lg transition-all ${
                    isSmallScreen ? "text-xs py-1" : "text-sm py-1.5"
                  }`}
                  onClick={() => onAction("reject", doctor.userCode)}
                  disabled={loading}
                >
                  <Trash2
                    className={`w-3 h-3 mr-1 ${
                      isSmallScreen ? "w-2.5 h-2.5" : ""
                    }`}
                  />{" "}
                  Reject
                </Button>
              </motion.div>
            </div>
          )}

          {type === "sent" && (
            <div className={`mt-2 ${isSmallScreen ? "mt-1.5" : ""}`}>
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Button
                  className={`border-primary text-primary hover:bg-input w-full rounded-lg shadow-soft hover:shadow-lg transition-all ${
                    isSmallScreen ? "text-xs py-1" : "text-sm py-1.5"
                  }`}
                  onClick={() => onAction("cancel", doctor.userCode)}
                  disabled={loading}
                >
                  <Trash2
                    className={`w-3 h-3 mr-1 ${
                      isSmallScreen ? "w-2.5 h-2.5" : ""
                    }`}
                  />{" "}
                  Cancel Request
                </Button>
              </motion.div>
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default DoctorCard;
