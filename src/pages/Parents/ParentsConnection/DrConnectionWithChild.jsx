// src/pages/DrConnectionWithChild.jsx
import React, { useState, useEffect, useContext } from "react";
import { motion } from "framer-motion";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { toast } from "sonner";
import {
  Loader2,
  User2,
  Clock,
  Paperclip,
  FileText,
  Search,
  AlertCircle,
  Lock,
} from "lucide-react";

import { UserContext } from "@/context/UserContext";
import DoctorCard from "./components/DoctorCard";
import SearchResultCard from "./components/SearchResultCard";
import AccessLogCard from "./components/AccessLogCard";
import EmptyState from "./components/EmptyState";

// UPDATED IMPORTS — CLEAR & MEANINGFUL NAMES
import {
  searchDoctorByUserCode,
  sendParentToDoctorRequest,
  getChildLinkedDoctors,
  getChildIncomingDoctorRequests,
  getParentSentRequestsToDoctors,
  getChildAccessLogs,
  updateDoctorPermissionsForChild,
  acceptDoctorRequestAsParent,
  rejectDoctorRequestAsParent,
  cancelParentSentRequest,
} from "@/api/Doctor/DrToParents";

export default function DrConnectionWithChild() {
  const { user, selectedEntity, isReadOnly } = useContext(UserContext);

  const [doctorCode, setDoctorCode] = useState("");
  const [foundDoctor, setFoundDoctor] = useState(null);
  const [linkedDoctors, setLinkedDoctors] = useState([]);
  const [pendingRequests, setPendingRequests] = useState([]);
  const [sentRequests, setSentRequests] = useState([]);
  const [accessLogs, setAccessLogs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("linked");
  const [error, setError] = useState(null);
  const [searchLoading, setSearchLoading] = useState(false);
  const [isSmallScreen, setIsSmallScreen] = useState(false);

  // Responsive
  useEffect(() => {
    const check = () => setIsSmallScreen(window.innerHeight < 600);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  // BLOCK NON-PARENTS
  if (user?.role !== "parent") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-slate-900 dark:to-slate-800 flex items-center justify-center p-4">
        <Card className="max-w-md w-full glass-card border border-primary shadow-2xl">
          <CardContent className="p-12 text-center space-y-6">
            <Lock className="w-20 h-20 text-red-500 mx-auto" />
            <h1 className="text-3xl font-bold text-text">Access Denied</h1>
            <p className="text-lg text-muted">
              Only parents can view this page.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  // FETCH ALL DATA
  const fetchData = async () => {
    if (!selectedEntity?.subUserId) {
      toast.error("Please select a child first");
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const [linked, incoming, sent, logs] = await Promise.all([
        getChildLinkedDoctors(selectedEntity.subUserId),
        getChildIncomingDoctorRequests(selectedEntity.subUserId),
        getParentSentRequestsToDoctors(selectedEntity.subUserId),
        getChildAccessLogs(selectedEntity.subUserId, { take: 20 }),
      ]);

      setLinkedDoctors(Array.isArray(linked) ? linked : []);
      setPendingRequests(Array.isArray(incoming) ? incoming : []);
      setSentRequests(Array.isArray(sent) ? sent : []);
      setAccessLogs(Array.isArray(logs) ? logs : []);
    } catch (err) {
      const msg = err?.message || "Failed to load data";
      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (selectedEntity?.subUserId) fetchData();
  }, [selectedEntity?.subUserId]);

  // SEARCH DOCTOR
  const handleSearch = async () => {
    if (isReadOnly) return toast.info("View Only — Search disabled");
    if (!doctorCode.trim()) return toast.error("Enter doctor ID");

    try {
      setSearchLoading(true);
      setError(null);
      const doctor = await searchDoctorByUserCode(doctorCode.trim());
      setFoundDoctor(doctor);
    } catch (err) {
      setFoundDoctor(null);
      const msg = err?.message || "Doctor not found";
      setError(msg);
      toast.error(msg);
    } finally {
      setSearchLoading(false);
    }
  };

  // SEND REQUEST (Parent → Doctor)
  const handleSendRequest = async () => {
    if (isReadOnly) return toast.info("View Only — Send disabled");
    if (!foundDoctor?.userCode) return toast.error("No doctor selected");

    try {
      setLoading(true);
      await sendParentToDoctorRequest(selectedEntity.subUserId, foundDoctor.userCode);
      toast.success("Request sent successfully!");
      setDoctorCode("");
      setFoundDoctor(null);
      await fetchData();
    } catch (err) {
      const msg = err?.message || "Failed to send request";
      if (msg.includes("already")) toast.error("Request already sent");
      else toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  // CANCEL SENT REQUEST
  const handleCancelRequest = async (doctorUserCode) => {
    if (isReadOnly) return toast.info("View Only — Cancel disabled");

    try {
      setLoading(true);
      await cancelParentSentRequest(selectedEntity.subUserId, doctorUserCode);
      toast.success("Request canceled");
      await fetchData();
    } catch (err) {
      toast.error(err?.message || "Failed to cancel");
    } finally {
      setLoading(false);
    }
  };

  // TOGGLE PERMISSION
  const handleTogglePermission = async (doctorUserCode, field) => {
    if (isReadOnly) return toast.info("View Only — Permissions disabled");

    const doctor = linkedDoctors.find((d) => d.doctor.userCode === doctorUserCode);
    if (!doctor) return;

    const updated = {
      ...doctor.permissions,
      [field]: !doctor.permissions?.[field],
    };

    try {
      setLoading(true);
      await updateDoctorPermissionsForChild(selectedEntity.subUserId, doctorUserCode, updated);
      toast.success("Permissions updated");
      await fetchData();
    } catch (err) {
      toast.error("Failed to update permissions");
    } finally {
      setLoading(false);
    }
  };

  // ACCEPT DOCTOR REQUEST
  const handleAcceptRequest = async (doctorUserCode) => {
    if (isReadOnly) return toast.info("View Only — Accept disabled");

    try {
      setLoading(true);
      await acceptDoctorRequestAsParent(selectedEntity.subUserId, doctorUserCode, {
        vaccination: true,
        medicines: true,
        prescription: true,
        medicalReports: true,
        growth: true,
      });
      toast.success("Doctor request accepted!");
      await fetchData();
    } catch (err) {
      toast.error("Failed to accept");
    } finally {
      setLoading(false);
    }
  };

  // REJECT DOCTOR REQUEST
  const handleRejectRequest = async (doctorUserCode) => {
    if (isReadOnly) return toast.info("View Only — Reject disabled");

    try {
      setLoading(true);
      await rejectDoctorRequestAsParent(selectedEntity.subUserId, doctorUserCode);
      toast.success("Request rejected");
      await fetchData();
    } catch (err) {
      toast.error("Failed to reject");
    } finally {
      setLoading(false);
    }
  };

  const tabConfig = [
    { id: "linked", label: "Linked", count: linkedDoctors.length, icon: User2 },
    { id: "requests", label: "Requests", count: pendingRequests.length, icon: Clock },
    { id: "sent", label: "Sent", count: sentRequests.length, icon: Paperclip },
    { id: "logs", label: "Logs", count: accessLogs.length, icon: FileText },
  ];

  return (
    <div className="min-h-screen  w-full">
      <div className={` mx-auto px-1.5 sm:px-3 md:px-4 lg:px-6 py-3 ${isSmallScreen ? "px-1" : ""}`}>
        {/* VIEW-ONLY BANNER */}
        {isReadOnly && (
          <Card className="mb-3 bg-amber-50 border border-amber-300 text-amber-800 rounded-xl shadow-soft">
            <CardContent className={`p-2 flex items-center justify-center gap-1.5 ${isSmallScreen ? "p-1.5" : ""}`}>
              <Lock className={`w-4 h-4 ${isSmallScreen ? "w-3.5 h-3.5" : ""}`} />
              <span className={`font-medium ${isSmallScreen ? "text-xs" : "text-sm"}`}>
                View Only — All actions disabled
              </span>
            </CardContent>
          </Card>
        )}

        <Card className={`mb-3 rounded-xl shadow-soft glass-card border border-primary w-full ${isSmallScreen ? "mb-2" : ""}`}>
          <CardHeader>
            <CardTitle className={`text-text font-semibold text-center ${isSmallScreen ? "text-sm" : "text-base"}`}>
              Doctors Hub
            </CardTitle>
          </CardHeader>
        </Card>

        <div className={`space-y-3 ${isSmallScreen ? "space-y-2" : ""}`}>
          {/* ERROR */}
          {error && (
            <Card className="bg-accent/10 border border-accent rounded-lg">
              <CardContent className={`p-2 flex items-start ${isSmallScreen ? "p-1.5" : ""}`}>
                <AlertCircle className={`w-4 h-4 text-accent mr-1.5 mt-0.5 ${isSmallScreen ? "w-3 h-3" : ""}`} />
                <span className={`text-accent ${isSmallScreen ? "text-xs" : "text-sm"}`}>{error}</span>
              </CardContent>
            </Card>
          )}

          {/* SEARCH SECTION */}
          {!isReadOnly && (
            <Card className={`glass-card border border-primary rounded-xl shadow-soft ${isSmallScreen ? "p-1.5" : "p-2 sm:p-3"}`}>
              <CardContent className="p-2">
                <h3 className={`text-primary font-medium mb-2 ${isSmallScreen ? "text-sm" : "text-base"}`}>
                  Find a Doctor
                </h3>
                <div className={`flex flex-col sm:flex-row gap-1.5 mb-2 ${isSmallScreen ? "gap-1" : ""}`}>
                  <Input
                    value={doctorCode}
                    onChange={(e) => setDoctorCode(e.target.value)}
                    placeholder="Enter Doctor ID (e.g., DR9537764156)"
                    className={`flex-1 bg-input border border-primary rounded-lg px-2 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-primary ${
                      isSmallScreen ? "text-xs py-1" : "text-sm"
                    }`}
                  />
                  <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                    <Button
                      onClick={handleSearch}
                      disabled={searchLoading}
                      className={`button-primary text-text rounded-lg min-w-[100px] shadow-soft hover:shadow-lg transition-all ${
                        isSmallScreen ? "text-xs py-1 min-w-[80px]" : "text-sm"
                      }`}
                    >
                      {searchLoading ? (
                        <Loader2 className={`w-3 h-3 animate-spin ${isSmallScreen ? "w-2.5 h-2.5" : ""}`} />
                      ) : (
                        <>
                          <Search className={`w-3 h-3 mr-1 ${isSmallScreen ? "w-2.5 h-2.5" : ""}`} />
                          Search
                        </>
                      )}
                    </Button>
                  </motion.div>
                </div>

                {foundDoctor && (
                  <SearchResultCard
                    type="Doctor"
                    entity={foundDoctor}
                    onSendRequest={handleSendRequest}
                    loading={loading}
                  />
                )}
              </CardContent>
            </Card>
          )}

          {/* MAIN TABS */}
          <Card className={`glass-card border border-primary rounded-xl shadow-soft w-full ${isSmallScreen ? "p-1.5" : "p-2 sm:p-3"}`}>
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <div className={`px-2 pt-2 pb-1.5 mb-3 ${isSmallScreen ? "px-1.5 pb-1" : ""}`}>
                <TabsList className={`flex w-full h-20 p-1 rounded-lg bg-input ${isSmallScreen ? "p-0.5" : ""}`}>
                  {tabConfig.map((tab) => {
                    const Icon = tab.icon;
                    return (
                      <TabsTrigger
                        key={tab.id}
                        value={tab.id}
                        className={`
                          flex flex-1 flex-col items-center justify-center 
                          py-2 px-0.5 rounded-md transition-all duration-200
                          min-h-[60px] mx-0.5 border-2 border-transparent
                          ${
                            activeTab === tab.id
                              ? "bg-primary/10 text-primary shadow-soft border-primary/30"
                              : "text-muted hover:text-text hover:bg-input hover:border-primary/20"
                          }
                          ${isSmallScreen ? "min-h-[50px] py-1.5 px-0.5" : ""}
                        `}
                      >
                        <div className={`flex flex-col items-center justify-center space-y-1 w-full ${isSmallScreen ? "space-y-0.5" : ""}`}>
                          <div className="relative flex items-center justify-center">
                            <Icon className={`w-4 h-4 ${isSmallScreen ? "w-3 h-3" : ""}`} />
                            {tab.count > 0 && (
                              <span
                                className={`
                                  absolute -top-2 -right-2 flex items-center justify-center 
                                  min-w-[16px] h-[16px] rounded-full text-[8px] font-bold
                                  border-2 border-text
                                  ${activeTab === tab.id ? "bg-accent/10 text-text" : "bg-primary/10 text-text"}
                                  ${isSmallScreen ? "min-w-[14px] h-[14px] text-[7px] -top-1.5 -right-1.5" : ""}
                                `}
                              >
                                {tab.count > 99 ? "99+" : tab.count}
                              </span>
                            )}
                          </div>
                          <span className={`font-semibold leading-tight text-center ${isSmallScreen ? "text-xs" : "text-sm"}`}>
                            {tab.label}
                          </span>
                        </div>
                      </TabsTrigger>
                    );
                  })}
                </TabsList>
              </div>

              <div className={`w-full px-2 pb-2 ${isSmallScreen ? "px-1.5 pb-1.5" : ""}`}>
                {/* LINKED */}
                <TabsContent value="linked" className="mt-0 w-full">
                  <div className={`flex flex-col sm:flex-row sm:items-center sm:justify-between w-full mb-3 gap-1.5 ${isSmallScreen ? "mb-2 gap-1" : ""}`}>
                    <h3 className={`text-primary font-bold flex items-center ${isSmallScreen ? "text-base" : "text-lg"}`}>
                      <User2 className={`w-4 h-4 mr-1.5 ${isSmallScreen ? "w-3 h-3" : ""}`} />
                      Linked Doctors
                    </h3>
                    <span className={`text-muted bg-input px-2 py-1 rounded-full font-medium ${isSmallScreen ? "text-xs px-1.5 py-0.5" : "text-sm"}`}>
                      {linkedDoctors.length} connected
                    </span>
                  </div>

                  {linkedDoctors.length === 0 ? (
                    <div className="w-full py-6">
                      <EmptyState icon={User2} title="No doctors linked yet" description="Search for a doctor above to get started" />
                    </div>
                  ) : (
                    <div className={`w-full space-y-2 ${isSmallScreen ? "space-y-1.5" : ""}`}>
                      {linkedDoctors.map((item) => (
                        <div key={item.doctor?.userCode} className="w-full">
                          <DoctorCard
                            doctor={item.doctor}
                            type="linked"
                            permissions={item.permissions}
                            onPermissionChange={handleTogglePermission}
                            loading={loading}
                            isReadOnly={isReadOnly}
                          />
                        </div>
                      ))}
                    </div>
                  )}
                </TabsContent>

                {/* REQUESTS */}
                <TabsContent value="requests" className="mt-0 w-full">
                  <div className={`flex flex-col sm:flex-row sm:items-center sm:justify-between w-full mb-3 gap-1.5 ${isSmallScreen ? "mb-2 gap-1" : ""}`}>
                    <h3 className={`text-primary font-bold flex items-center ${isSmallScreen ? "text-base" : "text-lg"}`}>
                      <Clock className={`w-4 h-4 mr-1.5 ${isSmallScreen ? "w-3 h-3" : ""}`} />
                      Pending Requests
                    </h3>
                    <span className={`text-muted bg-input px-2 py-1 rounded-full font-medium ${isSmallScreen ? "text-xs px-1.5 py-0.5" : "text-sm"}`}>
                      {pendingRequests.length} waiting
                    </span>
                  </div>

                  {pendingRequests.length === 0 ? (
                    <div className="w-full py-6">
                      <EmptyState icon={Clock} title="No pending requests" description="Doctors will appear here when they request access" />
                    </div>
                  ) : (
                    <div className={`w-full space-y-2 ${isSmallScreen ? "space-y-1.5" : ""}`}>
                      {pendingRequests.map((item) => (
                        <div key={item.doctor?.userCode} className="w-full">
                          <DoctorCard
                            doctor={item.doctor}
                            type="pending"
                            onAction={(action, code) => {
                              if (action === "accept") handleAcceptRequest(code);
                              if (action === "reject") handleRejectRequest(code);
                            }}
                            loading={loading}
                            isReadOnly={isReadOnly}
                          />
                        </div>
                      ))}
                    </div>
                  )}
                </TabsContent>

                {/* SENT */}
                <TabsContent value="sent" className="mt-0 w-full">
                  <div className={`flex flex-col sm:flex-row sm:items-center sm:justify-between w-full mb-3 gap-1.5 ${isSmallScreen ? "mb-2 gap-1" : ""}`}>
                    <h3 className={`text-primary font-bold flex items-center ${isSmallScreen ? "text-base" : "text-lg"}`}>
                      <Paperclip className={`w-4 h-4 mr-1.5 ${isSmallScreen ? "w-3 h-3" : ""}`} />
                      Sent Requests
                    </h3>
                    <span className={`text-muted bg-input px-2 py-1 rounded-full font-medium ${isSmallScreen ? "text-xs px-1.5 py-0.5" : "text-sm"}`}>
                      {sentRequests.length} sent
                    </span>
                  </div>

                  {sentRequests.length === 0 ? (
                    <div className="w-full py-6">
                      <EmptyState icon={Paperclip} title="No sent requests" description="Your sent requests will appear here" />
                    </div>
                  ) : (
                    <div className={`w-full space-y-2 ${isSmallScreen ? "space-y-1.5" : ""}`}>
                      {sentRequests.map((item) => (
                        <div key={item.doctor?.userCode} className="w-full">
                          <DoctorCard
                            doctor={item.doctor}
                            type="sent"
                            onAction={(_, code) => handleCancelRequest(code)}
                            loading={loading}
                            isReadOnly={isReadOnly}
                          />
                        </div>
                      ))}
                    </div>
                  )}
                </TabsContent>

                {/* LOGS */}
                <TabsContent value="logs" className="mt-0 w-full">
                  <div className={`flex flex-col sm:flex-row sm:items-center sm:justify-between w-full mb-3 gap-1.5 ${isSmallScreen ? "mb-2 gap-1" : ""}`}>
                    <h3 className={`text-primary font-bold flex items-center ${isSmallScreen ? "text-base" : "text-lg"}`}>
                      <FileText className={`w-4 h-4 mr-1.5 ${isSmallScreen ? "w-3 h-3" : ""}`} />
                      Access Logs
                    </h3>
                    <span className={`text-muted bg-input px-2 py-1 rounded-full font-medium ${isSmallScreen ? "text-xs px-1.5 py-0.5" : "text-sm"}`}>
                      {accessLogs.length} entries
                    </span>
                  </div>

                  {accessLogs.length === 0 ? (
                    <div className="w-full py-6">
                      <EmptyState icon={FileText} title="No access logs" description="Logs appear when doctors view data" />
                    </div>
                  ) : (
                    <div className={`w-full space-y-2 ${isSmallScreen ? "space-y-1.5" : ""}`}>
                      {accessLogs.map((log) => (
                        <div key={log.id} className="w-full">
                          <AccessLogCard log={log} />
                        </div>
                      ))}
                    </div>
                  )}
                </TabsContent>
              </div>
            </Tabs>
          </Card>

          {/* GLOBAL LOADING */}
          {loading && (
            <div className="flex justify-center py-4">
              <Loader2 className={`w-4 h-4 animate-spin text-primary ${isSmallScreen ? "w-3 h-3" : ""}`} />
              <span className={`ml-1.5 text-muted ${isSmallScreen ? "text-xs" : "text-sm"}`}>Loading...</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}