// src/pages/MyPatientsPage.jsx
import React, {
  useContext,
  useEffect,
  useState,
  useCallback,
} from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import {
  Search,
  Baby,
  Users,
  Check,
  Clock,
  UserPlus,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

import { UserContext } from "@/context/UserContext";

import PatientTabs from "./components/PatientTabs";

import {
  searchPatientsByParentMobile,
  sendDoctorToParentRequest,
  cancelDoctorSentRequest,
  acceptParentRequestAsDoctor,
  rejectParentRequestAsDoctor,
  getDoctorConnectedPatients,
  getDoctorIncomingRequestsFromParents,
  getDoctorSentRequestsToParents,
} from "@/api/Doctor/DrToParents";

export default function MyPatientsPage() {
  const { user, setSelectedEntity } = useContext(UserContext);
  const navigate = useNavigate();

  const [linkedPatients, setLinkedPatients] = useState([]);
  const [incomingRequests, setIncomingRequests] = useState([]);
  const [sentRequests, setSentRequests] = useState([]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("linked");

  const [mobileNumber, setMobileNumber] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [searchLoading, setSearchLoading] = useState(false);

  const fetchData = useCallback(async () => {
    if (!user?.userCode || user?.role !== "doctor") return;

    try {
      setLoading(true);

      const [linkedRes, incomingRes, sentRes] = await Promise.all([
        getDoctorConnectedPatients(user.userCode),
        getDoctorIncomingRequestsFromParents(user.userCode),
        getDoctorSentRequestsToParents(user.userCode),
      ]);

      const normalize = (items) =>
        Array.isArray(items)
          ? items.map((item) => ({
              ...item,
              subUser: item.subUser || item,
              key:
                item.subUser?.subUserId || item.subUserId || `id-${Date.now()}`,
            }))
          : [];

      setLinkedPatients(normalize(linkedRes));
      setIncomingRequests(normalize(incomingRes));
      setSentRequests(normalize(sentRes));
    } catch (err) {
      toast.error("Failed to load patients data");
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [user?.userCode, user?.role]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleSearch = async () => {
    if (!mobileNumber.trim() || mobileNumber.length !== 10) {
      return toast.error("Enter a valid 10-digit mobile number");
    }

    try {
      setSearchLoading(true);
      const results = await searchPatientsByParentMobile(mobileNumber.trim());

      setSearchResults(results || []);

      if (results?.length > 0) {
        toast.success(`Found ${results.length} child${results.length > 1 ? "ren" : ""}`);
      } else {
        toast.info("No children registered under this mobile");
      }
    } catch (err) {
      toast.error(err?.message || "Failed to search");
      setSearchResults([]);
    } finally {
      setSearchLoading(false);
    }
  };

  const handleSendRequest = async (subUserId, parentUserCode) => {
    if (!subUserId || !parentUserCode) {
      return toast.error("Invalid patient");
    }

    try {
      setLoading(true);
      await sendDoctorToParentRequest(subUserId, parentUserCode);

      // Update search results instantly
      setSearchResults((prev) =>
        prev.map((item) =>
          item.subUser.subUserId === subUserId
            ? { ...item, requestSent: true }
            : item
        )
      );

      toast.success("Request sent!");
      await fetchData();
    } catch (err) {
      toast.error("Failed to send request");
    } finally {
      setLoading(false);
    }
  };

  const handleCancelRequest = async (patient) => {
    const subUserId = patient?.subUser?.subUserId;
    if (!subUserId) return;

    try {
      setLoading(true);
      await cancelDoctorSentRequest(subUserId);

      setSearchResults((prev) =>
        prev.map((item) =>
          item.subUser.subUserId === subUserId
            ? { ...item, requestSent: false }
            : item
        )
      );

      toast.success("Request canceled");
      await fetchData();
    } catch (err) {
      toast.error("Failed to cancel");
    } finally {
      setLoading(false);
    }
  };

  const handleAcceptRequest = async (patient) => {
    const subUserId = patient?.subUser?.subUserId;
    const parentUserCode = patient?.subUser?.user?.userCode;
    if (!subUserId || !parentUserCode) return toast.error("Invalid request");

    try {
      setLoading(true);
      await acceptParentRequestAsDoctor(subUserId, parentUserCode, {
        view_profile: true,
        update_vaccination: true,
        view_medicines: true,
        update_medicines: true,
        view_growth: true,
        update_growth: true,
      });
      toast.success("Request accepted!");
      await fetchData();
    } catch (err) {
      toast.error(err?.message || "Failed to accept");
    } finally {
      setLoading(false);
    }
  };

  const handleRejectRequest = async (patient) => {
    const subUserId = patient?.subUser?.subUserId;
    const parentUserCode = patient?.subUser?.user?.userCode;
    if (!subUserId || !parentUserCode) return;

    try {
      setLoading(true);
      await rejectParentRequestAsDoctor(subUserId, parentUserCode);
      toast.success("Request rejected");
      await fetchData();
    } catch (err) {
      toast.error("Failed to reject");
    } finally {
      setLoading(false);
    }
  };

  const handlePatientClick = (patient) => {
    const subUser = patient.subUser || patient;
    if (!subUser?.subUserId) return toast.error("Cannot open patient");

    const permissions = patient.permissions || {};

    const enrichedSubUser = {
      ...subUser,
      permissions,
      name: subUser.name || "Child",
    };

    setSelectedEntity(enrichedSubUser);
    navigate("/patient-details");
  };

  return (
    <div className="min-h-screen w-full py-6 px-4">
      <div className="mx-auto space-y-8 max-w-5xl">
        {/* SEARCH PATIENT BY MOBILE NUMBER */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-card border border-primary rounded-2xl shadow-soft p-6"
        >
          <h3 className="text-xl font-semibold text-primary mb-5 flex items-center gap-2">
            <Search className="w-6 h-6" /> Find Patient by Parent Mobile
          </h3>

          <div className="flex gap-4 mb-6">
            <Input
              type="tel"
              value={mobileNumber}
              onChange={(e) =>
                setMobileNumber(e.target.value.replace(/\D/g, "").slice(0, 10))
              }
              onKeyDown={(e) => e.key === "Enter" && handleSearch()}
              placeholder="Enter 10-digit mobile number"
              className="flex-1 bg-input border border-primary rounded-full text-base"
              disabled={searchLoading}
            />

            <Button
              onClick={handleSearch}
              disabled={searchLoading}
              className="button-primary rounded-full px-8"
            >
              {searchLoading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <Search className="w-5 h-5" />
              )}
            </Button>
          </div>

          {/* Search Results */}
          {searchResults.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-4"
            >
              <h4 className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
                Children Found ({searchResults.length})
              </h4>

              {searchResults.map((item) => (
                <motion.div
                  key={item.subUser.subUserId}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="p-6 bg-input/80 backdrop-blur-sm rounded-2xl border border-primary/20 shadow-soft"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
                    <div className="flex items-center gap-5 flex-1">
                      <div className="relative flex-shrink-0">
                        {item.subUser.profileImageUrl ? (
                          <img
                            src={item.subUser.profileImageUrl}
                            alt={item.subUser.name}
                            className="w-20 h-20 rounded-full object-cover border-4 border-white shadow-lg ring-2 ring-primary/20"
                          />
                        ) : (
                          <div className="w-20 h-20 rounded-full bg-gradient-to-br from-primary/10 to-primary/5 flex items-center justify-center">
                            <Baby className="w-10 h-10 text-primary" />
                          </div>
                        )}
                      </div>

                      <div className="flex-1">
                        <h3 className="text-xl font-bold text-text">
                          {item.subUser.name}
                        </h3>
                        <p className="text-sm text-muted-foreground mt-1 font-mono">
                          ID: <span className="text-primary">{item.subUser.subUserId}</span>
                        </p>
                        <p className="text-sm text-muted-foreground mt-1">
                          Parent: {item.parentName} • {mobileNumber}
                        </p>

                        {item.isConnected ? (
                          <div className="mt-4">
                            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-green-100 text-green-800">
                              <Check className="w-4 h-4" />
                              Connected – Access Granted
                            </span>
                          </div>
                        ) : item.requestSent ? (
                          <div className="mt-4">
                            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-amber-100 text-amber-800">
                              <Clock className="w-4 h-4" />
                              Request Sent – Awaiting Approval
                            </span>
                          </div>
                        ) : null}
                      </div>
                    </div>

                    <div className="flex justify-center sm:justify-end">
                      {!item.isConnected && !item.requestSent && (
                        <Button
                          onClick={() =>
                            handleSendRequest(
                              item.subUser.subUserId,
                              item.parentUserCode
                            )
                          }
                          disabled={loading}
                          size="lg"
                          className="min-w-[200px] rounded-full px-8 py-6 text-base font-medium button-primary shadow-lg flex items-center justify-center gap-2"
                        >
                          {loading ? (
                            <>
                              <Loader2 className="w-5 h-5 animate-spin" />
                              Sending...
                            </>
                          ) : (
                            <>
                              <UserPlus className="w-5 h-5" />
                              Send Access Request
                            </>
                          )}
                        </Button>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          )}

          {searchResults.length === 0 && mobileNumber && !searchLoading && (
            <div className="text-center py-10 text-muted-foreground">
              <Baby className="w-20 h-20 mx-auto mb-4 opacity-30" />
              <p>No children found for this mobile number.</p>
            </div>
          )}
        </motion.div>

        {/* MY PATIENTS TABS */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="glass-card border border-primary rounded-2xl shadow-soft overflow-hidden"
        >
          <div className="p-6 border-b border-primary/20">
            <h3 className="text-xl font-bold text-text flex items-center gap-3">
              <Users className="w-7 h-7 text-primary" /> My Patients
            </h3>
          </div>

          <PatientTabs
            activeTab={activeTab}
            setActiveTab={setActiveTab}
            linkedPatients={linkedPatients}
            pendingRequests={incomingRequests}
            sentRequests={sentRequests}
            loading={loading}
            handlePatientClick={handlePatientClick}
            handleAcceptRequest={handleAcceptRequest}
            handleRejectRequest={handleRejectRequest}
            handleCancelRequest={handleCancelRequest}
          />
        </motion.div>
      </div>
    </div>
  );
}