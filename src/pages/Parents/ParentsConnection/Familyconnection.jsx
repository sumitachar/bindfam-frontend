import React, { useState, useEffect, useContext } from "react";
import { motion } from "framer-motion";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { toast } from "sonner";
import {
  Loader2,
  Users,
  Clock,
  Paperclip,
  FileText,
  Search,
  AlertCircle,
} from "lucide-react";
import { UserContext } from "@/context/UserContext";
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
import SearchResultCard from "./components/SearchResultCard";
import AccessLogCard from "./components/AccessLogCard";
import EmptyState from "./components/EmptyState";

export default function FamilyConnection() {
  const { user, selectedEntity } = useContext(UserContext);
  const [parentCode, setParentCode] = useState("");
  const [foundParent, setFoundParent] = useState(null);
  const [linkedParents, setLinkedParents] = useState([]);
  const [pendingRequests, setPendingRequests] = useState([]);
  const [sentRequests, setSentRequests] = useState([]);
  const [accessLogs, setAccessLogs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("linked");
  const [error, setError] = useState(null);
  const [searchLoading, setSearchLoading] = useState(false);
  const [isSmallScreen, setIsSmallScreen] = useState(false);

  // Responsive check
  useEffect(() => {
    const checkDevice = () => setIsSmallScreen(window.innerHeight < 600);
    checkDevice();
    window.addEventListener("resize", checkDevice);
    return () => window.removeEventListener("resize", checkDevice);
  }, []);

  // Only Parent access
  if (user?.role !== "parent") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-slate-900 dark:to-slate-800">
        <Card className="glass-card border border-primary p-4 max-w-md text-center">
          <CardTitle className="text-primary text-lg font-semibold">
            🚫 Access Restricted
          </CardTitle>
          <p className="text-muted text-sm mt-2">
            Only parent users can access family connections.
          </p>
        </Card>
      </div>
    );
  }

  // Fetch all connection data
  const fetchData = async () => {
    if (!selectedEntity?.subUserId) {
      toast.error("Please select a sub-user first");
      return;
    }
    try {
      setLoading(true);
      const [linked, requests, sent, logs] = await Promise.all([
        getSubUserParents(selectedEntity.subUserId),
        getParentRequests(selectedEntity.subUserId),
        getSentParentRequests(selectedEntity.subUserId),
        getParentAccessLogs(selectedEntity.subUserId, { take: 20 }),
      ]);
      setLinkedParents(linked || []);
      setPendingRequests(requests || []);
      setSentRequests(sent || []);
      setAccessLogs(logs || []);
    } catch (err) {
      console.error(err);
      toast.error("Failed to fetch connections");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [selectedEntity?.subUserId]);

  // 🔍 Search by userCode
  const handleSearch = async () => {
    if (!parentCode) return toast.error("Enter parent user code");
    try {
      setSearchLoading(true);
      const parent = await searchParentByUserCode(parentCode);
      if (parent.role !== "parent") {
        toast.error("This user is not a parent");
        setFoundParent(null);
      } else {
        setFoundParent(parent);
      }
    } catch {
      toast.error("Parent not found");
      setFoundParent(null);
    } finally {
      setSearchLoading(false);
    }
  };

  // 📩 Send connection request
  const handleSendRequest = async () => {
    if (!foundParent?.userCode) return toast.error("No parent selected");
    try {
      setLoading(true);
      await requestParentConnection(selectedEntity.subUserId, foundParent.userCode);
      toast.success("Request sent successfully!");
      setFoundParent(null);
      setParentCode("");
      fetchData();
    } catch (err) {
      console.error(err);
      toast.error("Failed to send request");
    } finally {
      setLoading(false);
    }
  };

  // ✅ Accept request
  const handleAccept = async (userCode) => {
    try {
      setLoading(true);
      await acceptParentRequest(selectedEntity.subUserId, userCode);
      toast.success("Request accepted");
      fetchData();
    } catch {
      toast.error("Error accepting request");
    } finally {
      setLoading(false);
    }
  };

  // ❌ Reject request
  const handleReject = async (userCode) => {
    try {
      setLoading(true);
      await rejectParentRequest(selectedEntity.subUserId, userCode);
      toast.success("Request rejected");
      fetchData();
    } catch {
      toast.error("Error rejecting request");
    } finally {
      setLoading(false);
    }
  };

  // 🚫 Cancel sent request
  const handleCancel = async (userCode) => {
    try {
      setLoading(true);
      await cancelParentRequest(selectedEntity.subUserId, userCode);
      toast.success("Request canceled");
      fetchData();
    } catch {
      toast.error("Error canceling request");
    } finally {
      setLoading(false);
    }
  };

  const tabConfig = [
    { id: "linked", label: "Connected", count: linkedParents.length, icon: Users },
    { id: "requests", label: "Requests", count: pendingRequests.length, icon: Clock },
    { id: "sent", label: "Sent", count: sentRequests.length, icon: Paperclip },
    { id: "logs", label: "Logs", count: accessLogs.length, icon: FileText },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-slate-900 dark:to-slate-800 w-full">
      <div className=" mx-auto px-3 sm:px-6 py-4">
        <Card className="rounded-xl glass-card border border-primary shadow-soft mb-4">
          <CardHeader>
            <CardTitle className="text-center text-primary text-lg font-semibold">
              👨‍👩‍👧 Family Connections
            </CardTitle>
          </CardHeader>
        </Card>

        {/* Search Section */}
        <Card className="glass-card border border-primary rounded-xl shadow-soft mb-3">
          <CardContent className="p-3">
            <h3 className="text-primary font-medium mb-2">Find a Parent</h3>
            <div className="flex flex-col sm:flex-row gap-2">
              <Input
                type="text"
                value={parentCode}
                onChange={(e) => setParentCode(e.target.value)}
                placeholder="Enter Parent ID (e.g., PR123456789)"
                className="flex-1 bg-input border border-primary rounded-lg px-3 py-2 text-sm focus:ring-primary"
              />
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button
                  onClick={handleSearch}
                  disabled={searchLoading}
                  className="button-primary text-text shadow-soft min-w-[100px]"
                >
                  {searchLoading ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <>
                      <Search className="w-4 h-4 mr-1" /> Search
                    </>
                  )}
                </Button>
              </motion.div>
            </div>

            {foundParent && (
              <SearchResultCard
                parent={foundParent}
                onSendRequest={handleSendRequest}
                loading={loading}
              />
            )}
          </CardContent>
        </Card>

        {/* Tabs Section */}
        <Card className="glass-card border border-primary rounded-xl shadow-soft">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <div className="px-2 pt-2">
              <TabsList className="flex w-full bg-input rounded-lg h-20">
                {tabConfig.map((tab) => {
                  const Icon = tab.icon;
                  return (
                    <TabsTrigger
                      key={tab.id}
                      value={tab.id}
                      className={`flex-1 flex flex-col items-center justify-center py-2 px-1 rounded-md ${
                        activeTab === tab.id
                          ? "bg-primary/10 text-primary"
                          : "text-muted hover:text-text"
                      }`}
                    >
                      <Icon className="w-4 h-4 mb-1" />
                      <span className="font-semibold text-sm">
                        {tab.label} ({tab.count})
                      </span>
                    </TabsTrigger>
                  );
                })}
              </TabsList>
            </div>

            <div className="px-3 pb-3">
              {/* Linked Parents */}
              <TabsContent value="linked">
                {linkedParents.length === 0 ? (
                  <EmptyState
                    icon={Users}
                    title="No connected parents yet"
                    description="Search for a parent above to connect"
                  />
                ) : (
                  linkedParents.map((item) => (
                    <ParentCard
                      key={item.parent?.userCode}
                      parent={item.parent}
                      type="linked"
                    />
                  ))
                )}
              </TabsContent>

              {/* Pending Requests */}
              <TabsContent value="requests">
                {pendingRequests.length === 0 ? (
                  <EmptyState
                    icon={Clock}
                    title="No pending requests"
                    description="Incoming connection requests will appear here"
                  />
                ) : (
                  pendingRequests.map((item) => (
                    <ParentCard
                      key={item.parent?.userCode}
                      parent={item.parent}
                      type="pending"
                      onAction={(action, code) => {
                        if (action === "accept") handleAccept(code);
                        if (action === "reject") handleReject(code);
                      }}
                    />
                  ))
                )}
              </TabsContent>

              {/* Sent Requests */}
              <TabsContent value="sent">
                {sentRequests.length === 0 ? (
                  <EmptyState
                    icon={Paperclip}
                    title="No sent requests"
                    description="Your sent requests will appear here"
                  />
                ) : (
                  sentRequests.map((item) => (
                    <ParentCard
                      key={item.parent?.userCode}
                      parent={item.parent}
                      type="sent"
                      onAction={(action, code) => {
                        if (action === "cancel") handleCancel(code);
                      }}
                    />
                  ))
                )}
              </TabsContent>

              {/* Access Logs */}
              <TabsContent value="logs">
                {accessLogs.length === 0 ? (
                  <EmptyState
                    icon={FileText}
                    title="No access logs yet"
                    description="Connection activity will appear here"
                  />
                ) : (
                  accessLogs.map((log) => (
                    <AccessLogCard key={log.id} log={log} />
                  ))
                )}
              </TabsContent>
            </div>
          </Tabs>
        </Card>

        {loading && (
          <div className="flex justify-center py-4">
            <Loader2 className="w-5 h-5 animate-spin text-primary mr-2" />
            <span className="text-muted text-sm">Loading...</span>
          </div>
        )}
      </div>
    </div>
  );
}
