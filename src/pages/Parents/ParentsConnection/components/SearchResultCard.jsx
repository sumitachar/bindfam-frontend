import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, User2, Paperclip } from "lucide-react";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:4000";

const FallbackImage = () => (
  <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-primary/10 flex items-center justify-center">
    <User2 className="w-7 h-7 text-primary" />
  </div>
);

const SearchResultCard = ({
  type = "User",
  entity = {},
  onSendRequest = () => {},
  loading = false,
}) => {
  const [imageError, setImageError] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);

  const getImageUrl = (profileImage) => {
    if (!profileImage) return null;
    const imagePath = profileImage.replace(/^\/+/, "").replace(/^[Uu]ploads\//i, "");
    return `${API_URL}/${imagePath}?t=${new Date().getTime()}`;
  };

  const imageUrl = getImageUrl(entity?.profileImage);

  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      transition={{ type: "spring", stiffness: 200, damping: 15 }}
      className="w-full"
    >
      <Card className="overflow-hidden border border-border/50 backdrop-blur-md bg-gradient-to-br from-background/80 to-background/50 shadow-md hover:shadow-lg transition-all duration-300 rounded-2xl">
        <CardContent className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
          
          {/* Left - Profile Section */}
          <div className="flex items-center gap-3 sm:gap-4">
            {imageUrl && !imageError ? (
              <div className="relative">
                <img
                  src={imageUrl}
                  alt={entity?.name || "Profile"}
                  className="w-14 h-14 sm:w-16 sm:h-16 rounded-full object-cover border border-border shadow-sm"
                  onError={() => setImageError(true)}
                  onLoad={() => setImageLoaded(true)}
                />
                {!imageLoaded && (
                  <div className="absolute inset-0 flex items-center justify-center bg-muted/30 rounded-full">
                    <Loader2 className="w-5 h-5 text-primary animate-spin" />
                  </div>
                )}
              </div>
            ) : (
              <FallbackImage />
            )}

            {/* Info Section */}
            <div>
              <h3 className="font-semibold text-text text-sm sm:text-base leading-tight">
                {entity?.name || "Unknown"}
              </h3>
              <p className="text-muted-foreground text-xs sm:text-sm truncate">
                {entity?.userCode || "N/A"}
              </p>
              <div className="flex flex-wrap gap-1 mt-1">
                <span className="text-primary bg-primary/10 px-2 py-0.5 rounded-full text-[10px] sm:text-xs font-medium">
                  {entity?.role || type}
                </span>
                {entity?.experienceYears !== undefined && (
                  <span className="bg-secondary/10 text-secondary px-2 py-0.5 rounded-full text-[10px] sm:text-xs font-medium">
                    {entity.experienceYears} yrs exp
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Right - Action Button */}
          <div className="w-full sm:w-auto">
            <motion.div whileTap={{ scale: 0.96 }}>
              <Button
                onClick={onSendRequest}
                disabled={loading}
                className="w-full sm:w-auto text-sm px-4 py-2 rounded-xl bg-primary text-primary-foreground shadow-sm hover:shadow-md transition-all duration-200 flex items-center justify-center"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" /> Sending...
                  </>
                ) : (
                  <>
                    <Paperclip className="w-4 h-4 mr-2" /> Send Request
                  </>
                )}
              </Button>
            </motion.div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default SearchResultCard;
