import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SearchResultCard } from "./PatientCard";

const PatientSearchSection = ({
  patientCode,
  setPatientCode,
  foundPatient,
  loading,
  handleSearch,
  handleSendRequest,
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

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={`px-3 pt-2 pb-1 ${isSmallScreen ? "px-2 pt-1.5 pb-0.5" : ""}`}
    >
      <h3 className={`text-text font-medium mb-3 ${isSmallScreen ? "text-base" : "text-lg"}`}>
        Find a Patient
      </h3>
      <div className={`flex space-x-2 mb-3 ${isSmallScreen ? "space-x-1.5" : ""}`}>
        <input
          type="text"
          value={patientCode}
          onChange={(e) => setPatientCode(e.target.value)}
          placeholder="Enter Patient ID (e.g., SUB123456)"
          className={`flex-1 bg-input border border-primary rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-text ${isSmallScreen ? "text-xs px-2 py-1" : ""}`}
        />
        <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
          <Button
            className={`button-primary text-text rounded-lg shadow-soft flex items-center justify-center hover:shadow-lg transition-all ${isSmallScreen ? "text-xs py-1 px-2" : "px-3 py-1.5"}`}
            onClick={handleSearch}
            disabled={loading}
            aria-label="Search patient"
          >
            {loading ? (
              <div className={`w-4 h-4 border-2 border-text border-t-transparent rounded-full animate-spin ${isSmallScreen ? "w-3 h-3" : ""}`} />
            ) : (
              <Search className={`w-4 h-4 ${isSmallScreen ? "w-3 h-3" : ""}`} />
            )}
          </Button>
        </motion.div>
      </div>

      {foundPatient && (
        <SearchResultCard
          patient={foundPatient}
          onSendRequest={handleSendRequest}
          loading={loading}
          isSmallScreen={isSmallScreen}
        />
      )}
    </motion.div>
  );
};

export default PatientSearchSection;