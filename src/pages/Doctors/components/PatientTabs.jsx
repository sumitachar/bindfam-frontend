// src/pages/components/PatientTabs.jsx
import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Users, Clock, Send } from "lucide-react";
import { PatientCard } from "./PatientCard";

const PatientTabs = ({
  activeTab,
  setActiveTab,
  linkedPatients = [],
  pendingRequests = [],
  sentRequests = [],
  loading = false,
  handlePatientClick,
  handleAcceptRequest,
  handleRejectRequest,
  handleCancelRequest,
}) => {
  const [isSmallScreen, setIsSmallScreen] = useState(false);

  useEffect(() => {
    const checkDevice = () => {
      setIsSmallScreen(window.innerWidth < 420 || window.innerHeight < 600);
    };
    checkDevice();
    window.addEventListener("resize", checkDevice);
    return () => window.removeEventListener("resize", checkDevice);
  }, []);

  const normalizePatient = (patient) => ({
    name: patient?.subUser?.name || "Unknown",
    subUserId: patient?.subUser?.subUserId || "N/A",
    profileImage: patient?.subUser?.profileImagePath || "",
    age: patient?.subUser?.age || 0,
    gender: patient?.subUser?.gender || "N/A",
    dateOfBirth: patient?.subUser?.dateOfBirth || "",
    permissions: patient?.permissions || {},
    parentUserCode: patient?.requestedByUser?.userCode || "",
    status: patient.status || "unknown",
    requestedByUser: patient.requestedByUser || null,
    rawItem: patient,
  });

  const getCount = (arr) => (Array.isArray(arr) ? arr.length : 0);

  const renderEmptyState = (icon, title, message) => (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="text-center py-6"
    >
      <div className="inline-flex items-center justify-center w-10 h-10 bg-input rounded-full mb-2">
        {icon}
      </div>
      <h3 className="text-text font-medium text-sm mb-1">{title}</h3>
      <p className="text-primary text-xs">{message}</p>
    </motion.div>
  );

  const renderPatients = (patients = [], type) => {
    if (!Array.isArray(patients) || patients.length === 0) {
      return renderEmptyState(
        type === "linked" ? <Users className="w-5 h-5 text-primary" /> :
        type === "requests" ? <Clock className="w-5 h-5 text-primary" /> :
        <Send className="w-5 h-5 text-primary" />,
        type === "linked" ? "No patients linked" :
        type === "requests" ? "No pending requests" :
        "No sent requests",
        "Nothing to show here yet"
      );
    }

    return (
      <div className="space-y-2">
        {patients.map((item) => {
          const patient = normalizePatient(item);
          const key = patient.subUserId || Math.random();

          return (
            <PatientCard
              key={key}
              patient={patient}
              type={type}
              onClick={() => type === "linked" && handlePatientClick?.(item)}
              onAction={(action) => {
                if (type === "requests") {
                  if (action === "accept") handleAcceptRequest?.(item);
                  if (action === "reject") handleRejectRequest?.(item);
                }
                if (type === "sent" && action === "cancel") {
                  handleCancelRequest?.(item);
                }
              }}
              loading={loading}
              isSmallScreen={isSmallScreen}
            />
          );
        })}
      </div>
    );
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
    >
      {/* 🔹 Tabs */}
      <div className="px-2 pt-2">
        <div
          className={`
            flex gap-1 glass-card border border-primary rounded-lg p-1
            ${isSmallScreen ? "overflow-x-auto scrollbar-hide" : ""}
          `}
        >
          {[
            { id: "linked", label: "Linked", count: getCount(linkedPatients), icon: <Users className="w-4 h-4" /> },
            { id: "requests", label: "Requests", count: getCount(pendingRequests), icon: <Clock className="w-4 h-4" /> },
            { id: "sent", label: "Sent", count: getCount(sentRequests), icon: <Send className="w-4 h-4" /> },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`
                flex items-center justify-center gap-1
                px-3 py-1 rounded-md text-xs font-medium whitespace-nowrap
                min-w-[90px]
                transition-all
                ${
                  activeTab === tab.id
                    ? "button-primary text-white"
                    : "text-primary hover:bg-input"
                }
              `}
            >
              {!isSmallScreen && tab.icon}
              <span>{tab.label}</span>
              <span className="opacity-80">({tab.count})</span>
            </button>
          ))}
        </div>
      </div>

      {/* 🔹 Content */}
      <div className="px-2 pb-3 mt-2">
        {loading ? (
          <div className="flex justify-center items-center py-6">
            <div className="w-5 h-5 animate-spin border-2 border-primary border-t-transparent rounded-full" />
            <span className="ml-2 text-primary text-sm">Loading...</span>
          </div>
        ) : (
          <>
            {activeTab === "linked" && renderPatients(linkedPatients, "linked")}
            {activeTab === "requests" && renderPatients(pendingRequests, "requests")}
            {activeTab === "sent" && renderPatients(sentRequests, "sent")}
          </>
        )}
      </div>
    </motion.div>
  );
};

export default PatientTabs;
