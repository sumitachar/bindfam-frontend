import React, { useRef, useState } from "react";
import { motion } from "framer-motion";
import { Camera, Edit3, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { calculateCurrentAge } from "@/lib/utils";

const FallbackUserSVG = ({ className }) => (
  <div
    className={`flex items-center justify-center bg-input rounded-xl border border-primary ${className}`}
  >
    <User className="w-1/2 h-1/2 text-primary" />
  </div>
);

const ProfileCard = ({
  profileImageUrl,
  userName = "Your Name",
  posts = [],
  imageError,
  imageLoaded,
  handleImageError,
  handleImageLoad,
  handleProfileImageChange,
  onEditClick,
  isReadOnly = false,
  selectedEntity
}) => {
  const [userImageError, setUserImageError] = useState(imageError);
  const [uploadingImage, setUploadingImage] = useState(false);
  const fileInputRef = useRef(null);

  const totalPhotos = posts.reduce(
    (acc, post) => acc + (post.media ? post.media.length : 0),
    0
  );

  const onImageUpload = async (e) => {
    if (isReadOnly) return;
    if (e.target.files && e.target.files[0]) {
      setUploadingImage(true);
      try {
        await handleProfileImageChange(e);
        setUserImageError(false);
      } catch (error) {
        console.error("Image upload failed:", error);
        setUserImageError(true);
      } finally {
        setUploadingImage(false);
      }
    }
  };

  const displayName = userName;
  const displayAge = selectedEntity?.dateOfBirth
    ? calculateCurrentAge(selectedEntity.dateOfBirth)
    : "Age not set";

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="glass-card rounded-xl shadow-soft border border-primary mb-3 overflow-hidden"
    >
      <div className="p-3">
        <div className="flex items-start justify-between mb-2">
          <div className="flex items-center space-x-2">
            {/* Profile Image */}
            <label
              className={`relative group ${isReadOnly ? "cursor-default" : "cursor-pointer"}`}
            >
              <div className="w-16 h-16 rounded-xl overflow-hidden shadow-md border-2 border-primary bg-input">
                {profileImageUrl && !userImageError ? (
                  <>
                    <img
                      src={profileImageUrl}
                      alt={displayName}
                      onError={() => {
                        setUserImageError(true);
                        handleImageError();
                      }}
                      onLoad={handleImageLoad}
                      className={`w-full h-full object-cover transition-opacity ${
                        imageLoaded ? "opacity-100" : "opacity-0"
                      }`}
                    />
                    {!imageLoaded && (
                      <div className="w-full h-full flex items-center justify-center">
                        <svg
                          className="animate-spin w-4 h-4 text-primary"
                          viewBox="0 0 24 24"
                        >
                          <circle
                            className="opacity-25"
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            strokeWidth="4"
                          />
                          <path
                            className="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
                          />
                        </svg>
                      </div>
                    )}
                  </>
                ) : (
                  <FallbackUserSVG className="w-full h-full" />
                )}
              </div>

              {/* Camera Icon */}
              {!isReadOnly && (
                <>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={onImageUpload}
                    className="hidden"
                    ref={fileInputRef}
                  />
                  <motion.div
                    className="absolute -bottom-1 -right-1 bg-input rounded-full p-1 shadow group-hover:bg-input/80 transition-colors"
                    whileHover={{ scale: 1.1 }}
                  >
                    {uploadingImage ? (
                      <svg
                        className="animate-spin w-3 h-3 text-primary"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        />
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
                        />
                      </svg>
                    ) : (
                      <Camera className="w-3 h-3 text-primary" />
                    )}
                  </motion.div>
                </>
              )}
            </label>

            {/* Name & Age */}
            <div className="min-w-0 flex-1">
              <h2 className="text-base font-semibold text-text truncate">
                {displayName}
              </h2>
              <p className="text-xs text-muted mt-0.5">{displayAge}</p>
            </div>
          </div>

          {/* Edit Button */}
          {!isReadOnly && (
            <Button
              className="button-primary rounded-full p-1.5 hover:shadow-lg transition-all"
              onClick={onEditClick}
            >
              <Edit3 className="w-3 h-3" />
            </Button>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default ProfileCard;