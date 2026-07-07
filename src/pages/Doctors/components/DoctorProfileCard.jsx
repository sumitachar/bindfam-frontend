import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Camera, Edit3 } from "lucide-react";
import { FallbackUserSVG } from "./PatientCard";

const DoctorProfileCard = ({
  user,
  formData,
  setFormData,
  setEditOpened,
  getUserImageUrl,
  userImageError,
  setUserImageError,
  uploadingImage,
  handleImageUpload,
  fileInputRef,
  getUserGradient,
}) => {
  const [isSmallScreen, setIsSmallScreen] = useState(false);

  useEffect(() => {
    const checkDevice = () => {
      setIsSmallScreen(window.innerHeight < 600);
    };
    checkDevice();
    window.addEventListener("resize", checkDevice);
    return () => window.removeEventListener("resize", checkDevice);
  }, []);

  const calculateAge = (dob) => {
    if (!dob) return "";
    const birthDate = new Date(dob);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const m = today.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) age--;
    return age;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="glass-card rounded-lg shadow-soft border border-primary overflow-hidden"
    >
      <div className={`relative h-20 ${getUserGradient(user?.userCode)} backdrop-blur-md ${isSmallScreen ? "h-16" : ""}`}>
        <div className="absolute -bottom-8 left-3">
          <label className="cursor-pointer relative group">
            {getUserImageUrl && !userImageError ? (
              <img
                key={formData?.profileImage}
                src={getUserImageUrl()}
                alt="Profile"
                className={`rounded-full border-2 border-primary shadow-soft object-cover ${isSmallScreen ? "w-12 h-12" : "w-14 h-14"}`}
                onError={() => {
                  console.error("User image failed to load:", getUserImageUrl());
                  setUserImageError(true);
                }}
              />
            ) : (
              <div className={`rounded-full border-2 border-primary shadow-soft flex ${isSmallScreen ? "w-12 h-12" : "w-14 h-14"}`}>
                <FallbackUserSVG className="w-full h-full" />
              </div>
            )}
            <input
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              className="hidden"
              ref={fileInputRef}
            />
            <div className={`absolute bottom-0 right-0 bg-input rounded-full p-1 shadow-soft group-hover:bg-input/80 transition-colors ${isSmallScreen ? "p-0.5" : ""}`}>
              {uploadingImage ? (
                <div className={`animate-spin border-2 border-primary border-t-transparent rounded-full ${isSmallScreen ? "w-3 h-3" : "w-4 h-4"}`} />
              ) : (
                <Camera className={`text-primary ${isSmallScreen ? "w-3 h-3" : "w-4 h-4"}`} />
              )}
            </div>
          </label>
        </div>
      </div>

      <div className={`pt-8 pb-3 px-3 ${isSmallScreen ? "pt-6 pb-2 px-2" : ""}`}>
        <h2 className={`text-text font-semibold mb-1 ${isSmallScreen ? "text-base" : "text-lg"}`}>
          🩺 Dr. {formData.name}
        </h2>
        <h2 className={`text-text font-semibold mb-1 ${isSmallScreen ? "text-sm" : "text-base"}`}>
          {user?.userCode}
        </h2>
        <p className={`text-primary text-xs mb-1.5 ${isSmallScreen ? "text-xs" : ""}`}>
          {formData.email}
        </p>
        <div className={`flex flex-wrap gap-1.5 mb-1.5 ${isSmallScreen ? "gap-1" : ""}`}>
          {formData.mobile && (
            <span className={`inline-flex items-center bg-primary/10 text-primary px-1.5 py-0.5 rounded-full text-xs ${isSmallScreen ? "text-xs px-1" : ""}`}>
              📱 {formData.mobile}
            </span>
          )}
          {formData.dob && (
            <span className={`inline-flex items-center bg-primary/10 text-primary px-1.5 py-0.5 rounded-full text-xs ${isSmallScreen ? "text-xs px-1" : ""}`}>
              🎂 {formData.dob} ({calculateAge(formData.dob)} yrs)
            </span>
          )}
        </div>
        <p className={`text-primary mb-1.5 italic border-l-2 border-primary pl-2 py-0.5 bg-input rounded-r text-xs ${isSmallScreen ? "text-xs pl-1.5" : ""}`}>
          {formData.bio}
        </p>
        <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
          <button
            onClick={() => setEditOpened(true)}
            className={`button-primary text-text rounded-lg shadow-soft hover:shadow-lg transition-all text-xs py-1 px-3 flex items-center ${isSmallScreen ? "text-xs py-0.5 px-2" : ""}`}
            aria-label="Edit profile"
          >
            <Edit3 className={`mr-1 ${isSmallScreen ? "w-3 h-3" : "w-4 h-4"}`} /> Edit Profile
          </button>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default DoctorProfileCard;