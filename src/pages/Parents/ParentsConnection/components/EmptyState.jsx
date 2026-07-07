import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";

const EmptyState = ({ icon: Icon, title, description }) => {
  const [isSmallScreen, setIsSmallScreen] = useState(false);

  useEffect(() => {
    const checkDevice = () => setIsSmallScreen(window.innerHeight < 600);
    checkDevice();
    window.addEventListener("resize", checkDevice);
    return () => window.removeEventListener("resize", checkDevice);
  }, []);

  return (
    <motion.div
      className={`text-center py-6 px-3 ${isSmallScreen ? "py-4 px-2" : ""}`}
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
    >
      <div className={`inline-flex items-center justify-center w-10 h-10 bg-input rounded-full mb-2 ${isSmallScreen ? "w-8 h-8 mb-1.5" : ""}`}>
        <Icon className={`text-muted ${isSmallScreen ? "text-lg" : "text-xl"}`} />
      </div>
      <h3 className={`text-text font-medium mb-1 ${isSmallScreen ? "text-sm" : "text-base"}`}>{title}</h3>
      <p className={`text-muted max-w-md mx-auto ${isSmallScreen ? "text-xs" : "text-sm"}`}>{description}</p>
    </motion.div>
  );
};

export default EmptyState;