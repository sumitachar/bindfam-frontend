import React, { useState, useEffect, useContext } from "react";
import { motion } from "framer-motion";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { toast } from "sonner";
import { Loader2, User2, Users, Clock, Paperclip, FileText, Search, AlertCircle } from "lucide-react";
import { UserContext } from "@/context/UserContext";
import {
  searchDoctorByUserCode,
  requestDoctorAccess,
  getSubUserDoctors,
  updateDoctorPermissions,
  getDoctorRequests,
  acceptDoctorRequest,
  rejectDoctorRequest,
  cancelDoctorRequest,
  getSentDoctorRequests,
  getSubUserAccessLogs,
} from "@/api/Parents/parentstoDr";
import {
  searchParentByUserCode,
  requestParentConnection,
  getSubUserParents,
  acceptParentRequest,
  rejectParentRequest,
  cancelParentRequest,
  getSentParentRequests,
  getParentRequests,
  getParentAccessLogs,
} from "@/api/Parents/parenttoParent";
import ConnectionCard from "./components/ConnectionCard";
import SearchResultCard from "./components/SearchResultCard";
import AccessLogCard from "./components/AccessLogCard";
import EmptyState from "./components/EmptyState";

const Connections = ({ connectionType }) => {
  const { user, selectedEntity } = useContext(UserContext);
  const [searchCode, setSearchCode] = useState("");
  const [foundEntity, setFoundEntity] = useState(null);
  const [linkedEntities, setLinkedEntities] = useState([]);
  const [pendingRequests, setPendingRequests] = useState([]);
  const [sentRequests, setSentRequests] = useState([]);
  const [accessLogs, setAccessLogs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("linked");
  const [error, setError] = useState(null);
  const [searchLoading, setSearchLoading] = useState(false);
  const [isSmallScreen, setIsSmallScreen] = useState(false);

  useEffect(() => {
    const checkDevice = () => setIsSmallScreen(window.innerHeight < 600);
    checkDevice();
    window.addEventListener("resize", checkDevice);
    return () => window.removeEventListener("resize", checkDevice);
  }, []);

  if (user?.role !== "parent") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-slate-900 dark:to-slate-800 w-full">
        <div className={`w-full max-w-[100vw] mx-auto px-1.5 sm:px-3 md:px-4 lg:px-6 py-3 box-border ${isSmallScreen ? "px-1" : ""}`}>
          <Card className={`mb-3 rounded-xl shadow-soft glass-card border border-primary w-full ${isSmallScreen ? "mb-2" : ""}`}>
            <CardHeader>
              <CardTitle className={`text-text font-semibold text-center ${isSmallScreen ? "text-sm" : "text-base"}`}>
                🚫 Access Denied
              </CardTitle>
            </CardHeader>
          </Card>
          <div className="flex flex-col items-center justify-center min-h-[50vh]">
            <Card className={`glass-card border border-primary p-2 sm:p-3 max-w-sm w-full shadow-soft ${isSmallScreen ? "p-1.5" : ""}`}>
              <div className="flex flex-col items-center">
                <User2 className={`w-6 h-6 text-accent mb-1.5 ${isSmallScreen ? "w-5 h-5" : ""}`} />
                <h2 className={`text-text font-semibold text-center ${isSmallScreen ? "text-sm" : "text-base"} mb-1`}>
                  Access Restricted
                </h2>
                <p className={`text-muted text-center ${isSmallScreen ? "text-xs" : "text-sm"}`}>
                  You must be a parent to access this page.
                </p>
              </div>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  const fetchData = async () => {
    if (!selectedEntity?.subUserId) {
      console.error("No selectedEntity.subUserId available");
      toast.error("Please select a sub-user first", { className: "toast" });
      return;
    }
    try {
      setLoading(true);
      setError(null);
      const promises =
        connectionType === "doctor"
          ? [
              getSubUserDoctors(selectedEntity.subUserId),
              getDoctorRequests(selectedEntity.subUserId),
              getSentDoctorRequests(selectedEntity.subUserId),
              getSubUserAccessLogs(selectedEntity.subUserId, { take: 20 }),
            ]
          : [
              getSubUserParents(selectedEntity.subUserId),
              getParentRequests(selectedEntity.subUserId),
              getSentParentRequests(selectedEntity.subUserId),
              getParentAccessLogs(selectedEntity.subUserId, { take: 20 }),
            ];
      const [linkedData, requestsData, sentRequestsData, logsData] = await Promise.all(promises);
      setLinkedEntities(linkedData || []);
      setPendingRequests(requestsData || []);
      setSentRequests(sentRequestsData || []);
      setAccessLogs(logsData || []);
    } catch (err) {
      console.error("Fetch error:", err.message, err.response?.data);
      setError(`Failed to fetch data: ${err.message}`);
      toast.error(`Failed to fetch data: ${err.message}`, { className: "toast" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [selectedEntity?.subUserId, connectionType]);

  const handleSearch = async () => {
    if (!searchCode) {
      toast.error(`Please enter a ${connectionType} userCode`, { className: "toast" });
      return;
    }
    try {
      setSearchLoading(true);
      setError(null);
      const entity =
        connectionType === "doctor"
          ? await searchDoctorByUserCode(searchCode)
          : await searchParentByUserCode(searchCode);
      setFoundEntity(entity);
    } catch (err) {
      console.error("Search error:", err.message, err.response?.data);
      setError(`${connectionType.charAt(0).toUpperCase() + connectionType.slice(1)} not found or not a ${connectionType}`);
      toast.error(`${connectionType.charAt(0).toUpperCase() + connectionType.slice(1)} not found or not a ${connectionType}`, { className: "toast" });
      setFoundEntity(null);
    } finally {
      setSearchLoading(false);
    }
  };

  const handleSendRequest = async () => {
    if (!foundEntity?.userCode || !selectedEntity?.subUserId) {
      toast.error(`No ${connectionType} selected or sub-user not found`, { className: "toast" });
      return;
    }
    try {
      setLoading(true);
      setError(null);
      connectionType === "doctor"
        ? await requestDoctorAccess(selectedEntity.subUserId, foundEntity.userCode)
        : await requestParentConnection(selectedEntity.subUserId, foundEntity.userCode);
      toast.success(`✅ Request sent successfully!`, { className: "toast" });
      setSearchCode("");
      setFoundEntity(null);
      await fetchData();
    } catch (err) {
      console.error("Send request error:", err.message, err.response?.data);
      if (err?.response?.data?.message?.includes("already sent")) {
        setError(`Request already sent, waiting for ${connectionType} response`);
        toast.error(`Request already sent, waiting for ${connectionType} response`, { className: "toast" });
      } else {
        setError(`Failed to send request`);
        toast.error(`Failed to send request`, { className: "toast" });
      }
    } finally {
      setLoading(false);
    }
  };

  const handleCancelRequest = async (entityId) => {
    if (!selectedEntity?.subUserId) {
      toast.error("No sub-user selected", { className: "toast" });
      return;
    }
    try {
      setLoading(true);
      setError(null);
      connectionType === "doctor"
        ? await cancelDoctorRequest(selectedEntity.subUserId, entityId)
        : await cancelParentRequest(selectedEntity.subUserId);
      toast.success(`✅ ${connectionType.charAt(0).toUpperCase() + connectionType.slice(1)} request canceled!`, { className: "toast" });
      await fetchData();
    } catch (err) {
      console.error("Cancel request error:", err.message, err.response?.data);
      setError("Failed to cancel request");
      toast.error("Failed to cancel request", { className: "toast" });
    } finally {
      setLoading(false);
    }
  };

  const handleTogglePermission = async (doctorUserCode, field) => {
    if (connectionType !== "doctor") return;
    const doctor = linkedEntities.find((d) => d.doctor.userCode === doctorUserCode);
    if (!doctor) {
      toast.error("Doctor not found", { className: "toast" });
      return;
    }
    const updatedPermissions = {
      ...doctor.permissions,
      [field]: !doctor.permissions?.[field],
    };
    try {
      setLoading(true);
      setError(null);
      await updateDoctorPermissions(selectedEntity.subUserId, doctorUserCode, updatedPermissions);
      toast.success("✅ Permissions updated successfully!", { className: "toast" });
      await fetchData();
    } catch (err) {
      console.error("Permission update error:", err.message, err.response?.data);
      setError("Failed to update permissions");
      toast.error("Failed to update permissions", { className: "toast" });
    } finally {
      setLoading(false);
    }
  };

  const handleAcceptRequest = async (entityId) => {
    if (!selectedEntity?.subUserId) {
      toast.error("No sub-user selected", { className: "toast" });
      return;
    }
    try {
      setLoading(true);
      setError(null);
      if (connectionType === "doctor") {
        await acceptDoctorRequest(selectedEntity.subUserId, entityId, {
          vaccination: true,
          medicines: true,
          prescription: true,
          medicalReports: true,
          growth: true,
        });
      } else {
        await acceptParentRequest(selectedEntity.subUserId, entityId);
      }
      toast.success(`✅ ${connectionType.charAt(0).toUpperCase() + connectionType.slice(1)} request accepted!`, { className: "toast" });
      await fetchData();
    } catch (err) {
      console.error("Accept request error:", err.message, err.response?.data);
      setError("Failed to accept request");
      toast.error("Failed to accept request", { className: "toast" });
    } finally {
      setLoading(false);
    }
  };

  const handleRejectRequest = async (entityId) => {
    if (!selectedEntity?.subUserId) {
      toast.error("No sub-user selected", { className: "toast" });
      return;
    }
    try {
      setLoading(true);
      setError(null);
      connectionType === "doctor"
        ? await rejectDoctorRequest(selectedEntity.subUserId, entityId)
        : await rejectParentRequest(selectedEntity.subUserId, entityId);
      toast.success(`✅ ${connectionType.charAt(0).toUpperCase() + connectionType.slice(1)} request rejected!`, { className: "toast" });
      await fetchData();
    } catch (err) {
      console.error("Reject request error:", err.message, err.response?.data);
      setError("Failed to reject request");
      toast.error("Failed to reject request", { className: "toast" });
    } finally {
      setLoading(false);
    }
  };

  const tabConfig = [
    { id: "linked", label: "Linked", count: linkedEntities.length, icon: connectionType === "doctor" ? User2 : Users },
    { id: "requests", label: "Requests", count: pendingRequests.length, icon: Clock },
    { id: "sent", label: "Sent", count: sentRequests.length, icon: Paperclip },
    { id: "logs", label: "Logs", count: accessLogs.length, icon: FileText },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-slate-900 dark:to-slate-800 w-full">
      <div className={` mx-auto px-1.5 sm:px-3 md:px-4 lg:px-6 py-3 box-border ${isSmallScreen ? "px-1" : ""}`}>
        <Card className={`mb-3 rounded-xl shadow-soft glass-card border border-primary w-full ${isSmallScreen ? "mb-2" : ""}`}>
          <CardHeader>
            <CardTitle className={`text-text font-semibold text-center ${isSmallScreen ? "text-sm" : "text-base"}`}>
              {connectionType === "doctor" ? "🩺 Doctors Hub" : "👨‍👩‍👧 Family Connections"}
            </CardTitle>
          </CardHeader>
        </Card>

        <div className={`space-y-3 ${isSmallScreen ? "space-y-2" : ""}`}>
          {error && (
            <Card className="bg-accent/10 border border-accent rounded-lg">
              <CardContent className={`p-2 flex items-start ${isSmallScreen ? "p-1.5" : ""}`}>
                <AlertCircle className={`w-4 h-4 text-accent mr-1.5 mt-0.5 ${isSmallScreen ? "w-3 h-3" : ""}`} />
                <span className={`text-accent ${isSmallScreen ? "text-xs" : "text-sm"}`}>{error}</span>
              </CardContent>
            </Card>
          )}

          <Card className={`glass-card border border-primary rounded-xl shadow-soft ${isSmallScreen ? "p-1.5" : "p-2 sm:p-3"}`}>
            <CardContent className="p-2">
              <h3 className={`text-primary font-medium mb-2 ${isSmallScreen ? "text-sm" : "text-base"}`}>
                Find a {connectionType.charAt(0).toUpperCase() + connectionType.slice(1)}
              </h3>
              <div className={`flex flex-col sm:flex-row gap-1.5 mb-2 ${isSmallScreen ? "gap-1" : ""}`}>
                <Input
                  type="text"
                  value={searchCode}
                  onChange={(e) => setSearchCode(e.target.value)}
                  placeholder={`Enter ${connectionType.charAt(0).toUpperCase() + connectionType.slice(1)} ID (e.g., ${
                    connectionType === "doctor" ? "DR9537764156" : "PR123456789"
                  })`}
                  className={`flex-1 bg-input border border-primary rounded-lg px-2 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-primary ${
                    isSmallScreen ? "text-xs py-1" : "text-sm"
                  }`}
                />
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Button
                    className={`button-primary text-text rounded-lg min-w-[100px] shadow-soft hover:shadow-lg transition-all ${
                      isSmallScreen ? "text-xs py-1 min-w-[80px]" : "text-sm"
                    }`}
                    onClick={handleSearch}
                    disabled={searchLoading}
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

              {foundEntity && (
                <SearchResultCard type={connectionType} entity={foundEntity} onSendRequest={handleSendRequest} loading={loading} />
              )}
            </CardContent>
          </Card>

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
                          min-h-[60px] mx-0.5
                          border-2 border-transparent
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
                                  ${
                                    activeTab === tab.id
                                      ? "bg-accent/10 text-text shadow-sm"
                                      : "bg-primary/10 text-text shadow-sm"
                                  }
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
                <TabsContent value="linked" className="mt-0 w-full">
                  <div className={`flex flex-col sm:flex-row sm:items-center sm:justify-between w-full mb-3 gap-1.5 ${isSmallScreen ? "mb-2 gap-1" : ""}`}>
                    <h3 className={`text-primary font-bold flex items-center ${isSmallScreen ? "text-base" : "text-lg"}`}>
                      {connectionType === "doctor" ? (
                        <User2 className={`w-4 h-4 mr-1.5 ${isSmallScreen ? "w-3 h-3" : ""}`} />
                      ) : (
                        <Users className={`w-4 h-4 mr-1.5 ${isSmallScreen ? "w-3 h-3" : ""}`} />
                      )}
                      Linked {connectionType === "doctor" ? "Doctors" : "Parents"}
                    </h3>
                    <div className="flex items-center gap-2">
                      <span className={`text-muted bg-input px-2 py-1 rounded-full font-medium ${isSmallScreen ? "text-xs px-1.5 py-0.5" : "text-sm"}`}>
                        {linkedEntities.length} connected
                      </span>
                    </div>
                  </div>
                  {linkedEntities.length === 0 ? (
                    <div className="w-full py-6">
                      <EmptyState
                        icon={connectionType === "doctor" ? User2 : Users}
                        title={`No ${connectionType === "doctor" ? "doctors" : "parents"} linked yet`}
                        description={`Search for a ${connectionType} above to get started`}
                      />
                    </div>
                  ) : (
                    <div className={`w-full space-y-2 ${isSmallScreen ? "space-y-1.5" : ""}`}>
                      {linkedEntities.map((item) => (
                        <div key={item[connectionType]?.userCode} className="w-full">
                          <ConnectionCard
                            type={connectionType}
                            entity={item[connectionType]}
                            status="linked"
                            permissions={connectionType === "doctor" ? item.permissions : undefined}
                            onPermissionChange={connectionType === "doctor" ? handleTogglePermission : undefined}
                            loading={loading}
                          />
                        </div>
                      ))}
                    </div>
                  )}
                </TabsContent>

                <TabsContent value="requests" className="mt-0 w-full">
                  <div className={`flex flex-col sm:flex-row sm:items-center sm:justify-between w-full mb-3 gap-1.5 ${isSmallScreen ? "mb-2 gap-1" : ""}`}>
                    <h3 className={`text-primary font-bold flex items-center ${isSmallScreen ? "text-base" : "text-lg"}`}>
                      <Clock className={`w-4 h-4 mr-1.5 ${isSmallScreen ? "w-3 h-3" : ""}`} />
                      Pending Requests
                    </h3>
                    <div className="flex items-center gap-2">
                      <span className={`text-muted bg-input px-2 py-1 rounded-full font-medium ${isSmallScreen ? "text-xs px-1.5 py-0.5" : "text-sm"}`}>
                        {pendingRequests.length} waiting
                      </span>
                    </div>
                  </div>
                  {pendingRequests.length === 0 ? (
                    <div className="w-full py-6">
                      <EmptyState
                        icon={Clock}
                        title="No pending requests"
                        description={`${connectionType === "doctor" ? "Doctors" : "Parents"} will appear here when they request access`}
                      />
                    </div>
                  ) : (
                    <div className={`w-full space-y-2 ${isSmallScreen ? "space-y-1.5" : ""}`}>
                      {pendingRequests.map((item) => (
                        <div key={item[connectionType]?.userCode || item.connectionId} className="w-full">
                          <ConnectionCard
                            type={connectionType}
                            entity={{ ...item[connectionType], connectionId: item.connectionId }}
                            status="pending"
                            onAction={(action, id) => {
                              if (action === "accept") handleAcceptRequest(id);
                              if (action === "reject") handleRejectRequest(id);
                            }}
                            loading={loading}
                          />
                        </div>
                      ))}
                    </div>
                  )}
                </TabsContent>

                <TabsContent value="sent" className="mt-0 w-full">
                  <div className={`flex flex-col sm:flex-row sm:items-center sm:justify-between w-full mb-3 gap-1.5 ${isSmallScreen ? "mb-2 gap-1" : ""}`}>
                    <h3 className={`text-primary font-bold flex items-center ${isSmallScreen ? "text-base" : "text-lg"}`}>
                      <Paperclip className={`w-4 h-4 mr-1.5 ${isSmallScreen ? "w-3 h-3" : ""}`} />
                      Sent Requests
                    </h3>
                    <div className="flex items-center gap-2">
                      <span className={`text-muted bg-input px-2 py-1 rounded-full font-medium ${isSmallScreen ? "text-xs px-1.5 py-0.5" : "text-sm"}`}>
                        {sentRequests.length} sent
                      </span>
                    </div>
                  </div>
                  {sentRequests.length === 0 ? (
                    <div className="w-full py-6">
                      <EmptyState
                        icon={Paperclip}
                        title="No sent requests"
                        description={`Your sent requests will appear here`}
                      />
                    </div>
                  ) : (
                    <div className={`w-full space-y-2 ${isSmallScreen ? "space-y-1.5" : ""}`}>
                      {sentRequests.map((item) => (
                        <div key={item[connectionType]?.userCode || item.connectionId} className="w-full">
                          <ConnectionCard
                            type={connectionType}
                            entity={{ ...item[connectionType], connectionId: item.connectionId }}
                            status="sent"
                            onAction={(action, id) => action === "cancel" && handleCancelRequest(id)}
                            loading={loading}
                          />
                        </div>
                      ))}
                    </div>
                  )}
                </TabsContent>

                <TabsContent value="logs" className="mt-0 w-full">
                  <div className={`flex flex-col sm:flex-row sm:items-center sm:justify-between w-full mb-3 gap-1.5 ${isSmallScreen ? "mb-2 gap-1" : ""}`}>
                    <h3 className={`text-primary font-bold flex items-center ${isSmallScreen ? "text-base" : "text-lg"}`}>
                      <FileText className={`w-4 h-4 mr-1.5 ${isSmallScreen ? "w-3 h-3" : ""}`} />
                      Access Logs
                    </h3>
                    <div className="flex items-center gap-2">
                      <span className={`text-muted bg-input px-2 py-1 rounded-full font-medium ${isSmallScreen ? "text-xs px-1.5 py-0.5" : "text-sm"}`}>
                        {accessLogs.length} entries
                      </span>
                    </div>
                  </div>
                  {accessLogs.length === 0 ? (
                    <div className="w-full py-6">
                      <EmptyState
                        icon={FileText}
                        title="No access logs"
                        description="Access logs will appear here when actions are logged"
                      />
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
};

export default Connections;