// components/ChildProfilesAndConnections.jsx
import React, { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { motion } from "framer-motion";
import {
  Baby, Sparkles, Plus, Trash2, X, Search, Users, Check, XCircle,
  UserPlus, Share2, Eye, Edit3, UserIcon
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import * as Dialog from "@radix-ui/react-dialog";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";
import * as Toast from "@radix-ui/react-toast";
import { CreateChildProfilePage } from "../CreateChildProfilePage";
import EditProfileModal from "./EditProfileModal";
import { updateSubUserProfileImage } from "@/api/Auth/auth";

const FallbackAvatar = () => (
  <div className="w-full h-full flex items-center justify-center bg-input rounded-lg">
    <Baby className="w-12 h-12 text-primary" />
  </div>
);

const SubUserSkeleton = () => (
  <div className="p-2 rounded-xl shadow-soft border border-primary bg-input animate-pulse">
    <div className="w-full h-32 rounded-lg bg-input mb-2"></div>
    <div className="h-4 w-3/4 bg-input rounded mb-1"></div>
    <div className="h-3 w-1/2 bg-input rounded"></div>
  </div>
);

export default function ChildProfilesAndConnections({ sharedState }) {
  const {
    user,
    subUsers,
    accessibleSubUsers,
    selectSubUser,
    softDeleteSubUser,
    refreshSubUsers,
    refreshAccessibleSubUsers,
    isMainUser,
    refreshParentDashboard,
    searchParent,
    sendConnectionRequest,
    acceptConnection,
    rejectConnection,
    cancelConnection,
    updateShared,
    navigate,
  } = sharedState;

  const [modalOpened, setModalOpened] = useState(false);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [subUserToDelete, setSubUserToDelete] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [toastOpen, setToastOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [childEditOpened, setChildEditOpened] = useState(false);
  const [childToEdit, setChildToEdit] = useState(null);

  const [searchCode, setSearchCode] = useState("");
  const [foundParent, setFoundParent] = useState(null);
  const [connectionLoading, setConnectionLoading] = useState(false);
  const [activeConnectionTab, setActiveConnectionTab] = useState("connected");
  const [shareModalOpen, setShareModalOpen] = useState(false);
  const [selectedConnection, setSelectedConnection] = useState(null);
  const [selectedSubUsersToShare, setSelectedSubUsersToShare] = useState([]);

  const [dashboard, setDashboard] = useState({ incoming: [], outgoing: [], accepted: [] });
  const [dashboardLoading, setDashboardLoading] = useState(true);

  const isMountedRef = useRef(true);
  const profileImageInputRefs = useRef({});

  useEffect(() => {
    isMountedRef.current = true;
    return () => { isMountedRef.current = false; };
  }, []);

  useEffect(() => {
    if (isMainUser && user?.userCode) {
      const load = async () => {
        setDashboardLoading(true);
        try {
          const dash = await refreshParentDashboard();
          if (isMountedRef.current) {
            setDashboard(dash || { incoming: [], outgoing: [], accepted: [] });
          }
        } finally {
          if (isMountedRef.current) setDashboardLoading(false);
        }
      };
      load();
    } else {
      setDashboardLoading(false);
    }
  }, [isMainUser, user?.userCode, refreshParentDashboard]);

  // এখন শুধু profileImageUrl ব্যবহার করো — Azure SAS URL
  const getImageUrl = useCallback((subUser) => {
    return subUser?.profileImageUrl || null;
  }, []);

  const handleSubUserSelect = async (subUserId) => {
    try {
      await selectSubUser(subUserId);
      navigate("/home/");
    } catch (err) {
      setToastMessage("Error selecting profile");
      setToastOpen(true);
    }
  };

  const handleSoftDelete = (subUserId, subUserName) => {
    setSubUserToDelete({ id: subUserId, name: subUserName });
    setDeleteConfirmOpen(true);
  };

  const confirmDelete = async () => {
    if (!subUserToDelete) return;
    try {
      await softDeleteSubUser(subUserToDelete.id);
      await refreshSubUsers();
      await refreshAccessibleSubUsers();
      setToastMessage(`${subUserToDelete.name}'s profile deleted`);
      setToastOpen(true);
    } catch (err) {
      setToastMessage("Failed to delete profile");
      setToastOpen(true);
    } finally {
      setDeleteConfirmOpen(false);
      setSubUserToDelete(null);
    }
  };

  const handleModalClose = async () => {
    setModalOpened(false);
    if (isMainUser) {
      setIsLoading(true);
      try {
        await refreshSubUsers();
        await refreshAccessibleSubUsers();
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handleSearchParent = async () => {
    if (!searchCode.trim()) {
      setToastMessage("Please enter a valid userCode");
      setToastOpen(true);
      return;
    }
    try {
      const parent = await searchParent(searchCode);
      setFoundParent({ ...parent, connectionStatus: null });
      setToastMessage(`Parent found: ${parent.name}`);
      setToastOpen(true);
    } catch (err) {
      setToastMessage("Parent not found");
      setToastOpen(true);
      setFoundParent(null);
    }
  };

  const handleSendRequest = async () => {
    if (!foundParent?.userCode) return;
    try {
      setConnectionLoading(true);
      await sendConnectionRequest(foundParent.userCode);
      setToastMessage(`Request sent to ${foundParent.name}`);
      setToastOpen(true);
      setSearchCode("");
      setFoundParent(null);
    } finally {
      setConnectionLoading(false);
    }
  };

  const handleAcceptRequest = async (connectionId) => {
    try {
      setConnectionLoading(true);
      await acceptConnection(connectionId, []);
      setToastMessage("Request accepted");
      setToastOpen(true);
      const dash = await refreshParentDashboard();
      if (isMountedRef.current) setDashboard(dash || { incoming: [], outgoing: [], accepted: [] });
    } finally {
      setConnectionLoading(false);
    }
  };

  const handleRejectRequest = async (connectionId) => {
    try {
      setConnectionLoading(true);
      await rejectConnection(connectionId);
      setToastMessage("Request rejected");
      setToastOpen(true);
      const dash = await refreshParentDashboard();
      if (isMountedRef.current) setDashboard(dash || { incoming: [], outgoing: [], accepted: [] });
    } finally {
      setConnectionLoading(false);
    }
  };

  const handleCancelRequest = async (connectionId) => {
    try {
      setConnectionLoading(true);
      await cancelConnection(connectionId);
      setToastMessage("Request cancelled");
      setToastOpen(true);
      const dash = await refreshParentDashboard();
      if (isMountedRef.current) setDashboard(dash || { incoming: [], outgoing: [], accepted: [] });
    } finally {
      setConnectionLoading(false);
    }
  };

  const openShareModal = (connection) => {
    setSelectedConnection(connection);
    const already = connection.sharedSubUsers?.map((s) => s.subUserId) ?? [];
    setSelectedSubUsersToShare(already);
    setShareModalOpen(true);
  };

  const handleUpdateShare = async () => {
    if (!selectedConnection) return;
    try {
      setConnectionLoading(true);
      await updateShared(selectedConnection.id, selectedSubUsersToShare);
      setToastMessage("Shared children updated");
      setToastOpen(true);
      setShareModalOpen(false);
      const dash = await refreshParentDashboard();
      if (isMountedRef.current) setDashboard(dash || { incoming: [], outgoing: [], accepted: [] });
    } finally {
      setConnectionLoading(false);
    }
  };

  const openChildEditModal = (subUser) => {
    setChildToEdit(subUser);
    setChildEditOpened(true);
  };

  // Profile Image Change – Azure এর জন্য
  const handleChildProfileImageChange = useCallback(
    async (subUserId, event) => {
      if (!isMainUser) return;
      const file = event.target.files[0];
      if (!file) return;

      setIsLoading(true);
      try {
        const response = await updateSubUserProfileImage(subUserId, file);
        // response এ profileImageUrl আসবে (যদি backend থেকে দেয়)
        await refreshSubUsers();
        await refreshAccessibleSubUsers();
        setToastMessage("Profile picture updated!");
        setToastOpen(true);
      } catch (err) {
        setToastMessage("Failed to update profile picture");
        setToastOpen(true);
      } finally {
        setIsLoading(false);
        if (profileImageInputRefs.current[subUserId]) {
          profileImageInputRefs.current[subUserId].value = "";
        }
      }
    },
    [isMainUser, refreshSubUsers, refreshAccessibleSubUsers]
  );

  const subUserItems = useMemo(() => {
    return subUsers.map((subUser) => {
      const imageUrl = getImageUrl(subUser); 

      return (
        <motion.div
          key={subUser.subUserId}
          className="glass-card rounded-xl shadow-soft border border-primary overflow-hidden p-2 flex flex-col"
        >
          <input
            type="file"
            accept="image/*"
            ref={(el) => (profileImageInputRefs.current[subUser.subUserId] = el)}
            onChange={(e) => handleChildProfileImageChange(subUser.subUserId, e)}
            className="hidden"
          />

          <div className="relative h-32 w-full mb-2 group">
            {imageUrl ? (
              <img
                src={imageUrl}
                alt={subUser.name}
                className="w-full h-full object-cover rounded-lg"
              />
            ) : (
              <FallbackAvatar />
            )}

            {isMainUser && (
              <div
                className="absolute inset-0 bg-black/60 rounded-lg opacity-0 group-hover:opacity-100 transition-all duration-300 flex items-center justify-center cursor-pointer"
                onClick={() => profileImageInputRefs.current[subUser.subUserId]?.click()}
              >
                <div className="bg-white/95 text-primary px-4 py-2 rounded-full text-sm font-semibold flex items-center gap-2 shadow-lg">
                  <Edit3 className="w-4 h-4" />
                  Change Photo
                </div>
              </div>
            )}
          </div>

          <h3 className="text-center font-semibold text-text">{subUser.name}</h3>
          <div className="flex justify-center gap-2 mt-1">
            {subUser.ageFormatted && (
              <span className="bg-input text-primary px-2 py-0.5 rounded-full text-xs">
                {subUser.ageFormatted}
              </span>
            )}
            {subUser.gender && (
              <span className="bg-input text-primary px-2 py-0.5 rounded-full text-xs">
                {subUser.gender}
              </span>
            )}
          </div>

          <div className="grid grid-cols-3 gap-2 mt-3">
            <Button
              className="button-primary rounded-full px-2 py-1 text-xs"
              onClick={() => handleSubUserSelect(subUser.subUserId)}
              disabled={isLoading}
            >
              Select
            </Button>

            {isMainUser && (
              <>
                <Button
                  className="bg-blue-500/20 text-blue-600 hover:bg-blue-500/30 rounded-full px-2 py-1 text-xs flex items-center justify-center gap-1"
                  onClick={() => openChildEditModal(subUser)}
                  disabled={isLoading}
                >
                  <Edit3 className="w-3.5 h-3.5" />
                  Edit
                </Button>

                <Button
                  className="bg-red-500/20 text-red-600 hover:bg-red-500/30 rounded-full px-2 py-1 text-xs flex items-center justify-center"
                  onClick={() => handleSoftDelete(subUser.subUserId, subUser.name)}
                  disabled={isLoading}
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </Button>
              </>
            )}
          </div>
        </motion.div>
      );
    });
  }, [subUsers, getImageUrl, isLoading, isMainUser, handleSubUserSelect, openChildEditModal, handleChildProfileImageChange]);

    return (
    <>
      {/* ==== CHILD PROFILES ==== */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="glass-card border border-primary rounded-2xl shadow-soft p-3"
      >
        <div className="flex justify-between items-center mb-3">
          <div className="flex items-center gap-2">
            <Baby className="w-5 h-5 text-primary" />
            <h2 className="font-semibold text-text text-base">Profiles</h2>
          </div>
          {isMainUser && (
            <Button
              onClick={() => setModalOpened(true)}
              className="flex items-center gap-1 button-primary rounded-full px-2 py-1 text-sm hover:shadow-lg transition-all"
              disabled={isLoading}
            >
              <Plus className="w-4 h-4" /> Add Member
            </Button>
          )}
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {Array.from({ length: 2 }).map((_, i) => (
              <SubUserSkeleton key={i} />
            ))}
          </div>
        ) : subUsers.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {subUserItems}
          </div>
        ) : (
          <div className="text-center py-3">
            <div className="inline-flex items-center justify-center w-10 h-10 bg-input rounded-full mb-2">
              <Sparkles className="w-5 h-5 text-primary" />
            </div>
            <h3 className="text-sm font-medium text-text">No profiles yet</h3>
            <p className="text-muted text-xs mb-2">
              Get started by adding your first profile
            </p>
          </div>
        )}
      </motion.div>

      {/* ==== FAMILY CONNECTIONS ==== */}
      {isMainUser && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="glass-card border border-primary rounded-2xl shadow-soft p-3 mt-4"
        >
          <div className="flex justify-between items-center mb-3">
            <div className="flex items-center gap-2">
              <Users className="w-5 h-5 text-primary" />
              <h2 className="font-semibold text-text text-base">
                Family Connections
              </h2>
            </div>
          </div>

          {/* ---- Search parent ---- */}
          <div className="mb-4">
            <h3 className="text-sm font-medium text-primary mb-2">
              Find a Parent
            </h3>
            <div className="flex items-center gap-2 w-full">
              <Input
                type="text"
                value={searchCode}
                onChange={(e) => setSearchCode(e.target.value)}
                placeholder="Enter parent userCode (e.g., PR123456789)"
                className="flex-1 bg-input border border-primary text-text text-sm rounded-full"
              />
              <Button
                onClick={handleSearchParent}
                className="button-primary rounded-full px-3 py-1 text-sm hover:shadow-lg transition-all whitespace-nowrap"
                disabled={connectionLoading}
              >
                <Search className="w-4 h-4 mr-1" /> Search
              </Button>
            </div>

            {foundParent && (
              <div className="mt-2 flex justify-center">
                <ParentCard
                  parent={foundParent}
                  onSendRequest={handleSendRequest}
                  isLoading={connectionLoading}
                />
              </div>
            )}
          </div>

          {/* ---- Tabs ---- */}
          <div className="flex gap-2 mb-3 overflow-x-auto">
            {["connected", "incoming", "outgoing", "shared"].map((tab) => (
              <Button
                key={tab}
                variant={activeConnectionTab === tab ? "default" : "outline"}
                className={`px-3 py-1 text-sm rounded-full ${
                  activeConnectionTab === tab
                    ? "bg-primary font-extrabold"
                    : "border-primary text-primary hover:bg-input"
                }`}
                onClick={() => setActiveConnectionTab(tab)}
              >
                {tab === "connected" && "Connected"}
                {tab === "incoming" && "Incoming"}
                {tab === "outgoing" && "Outgoing"}
                {tab === "shared" && "Shared Children"}
              </Button>
            ))}
          </div>

          {/* ---- Tab content ---- */}
          {connectionLoading || dashboardLoading ? (
            <div className="text-center py-3">
              <svg
                className="animate-spin w-5 h-5 text-primary mx-auto"
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
              <p className="text-muted text-sm mt-2">Loading...</p>
            </div>
          ) : (
            <>
              {/* Connected */}
              {activeConnectionTab === "connected" && (
                <div className="space-y-2">
                  {dashboard.accepted?.length === 0 ? (
                    <p className="text-muted text-sm text-center">
                      No active connections.
                    </p>
                  ) : (
                    dashboard.accepted.map((conn) => {
                      const isOwner = conn.ownerCode === user.userCode;
                      const other = isOwner ? conn.connectedParent : conn.owner;
                      return (
                        <div
                          key={conn.id}
                          className="p-3 bg-input rounded-lg flex justify-between items-center"
                        >
                          <span className="text-text text-sm">
                            {isOwner ? "Shared with" : "Shared by"}{" "}
                            <strong>{other?.name || "Unknown"}</strong> (
                            {other?.userCode || "N/A"})
                          </span>
                          {isOwner && (
                            <Button
                              onClick={() => openShareModal(conn)}
                              className="button-primary rounded-full px-3 py-1 text-sm"
                            >
                              <Share2 className="w-4 h-4" />
                            </Button>
                          )}
                        </div>
                      );
                    })
                  )}
                </div>
              )}

              {/* Incoming */}
              {activeConnectionTab === "incoming" && (
                <div className="space-y-3">
                  {dashboard.incoming?.length === 0 ? (
                    <p className="text-muted text-sm text-center">
                      No incoming requests.
                    </p>
                  ) : (
                    dashboard.incoming.map((req) => {
                      const parent = req.owner || {};
                      const requestedDate = new Date(
                        req.requestedAt
                      ).toLocaleString();

                      return (
                        <div
                          key={req.id}
                          className="flex flex-col sm:flex-row items-center justify-between bg-input rounded-2xl p-4 shadow-sm hover:shadow-md transition-all"
                        >
                          <ParentInfoCard
                            parent={parent}
                            requestedDate={requestedDate}
                          />

                          <div className="flex items-center gap-3 mt-3 sm:mt-0">
                            <span className="px-2 py-1 text-xs rounded-full bg-yellow-100 text-yellow-700">
                              Pending
                            </span>
                            <div className="flex gap-2">
                              <Button
                                onClick={() => handleAcceptRequest(req.id)}
                                className="button-primary rounded-full p-2 hover:shadow-lg transition-all"
                                disabled={connectionLoading}
                              >
                                <Check className="w-4 h-4" />
                              </Button>
                              <Button
                                onClick={() => handleRejectRequest(req.id)}
                                className="button-accent rounded-full p-2 hover:shadow-lg transition-all"
                                disabled={connectionLoading}
                              >
                                <XCircle className="w-4 h-4" />
                              </Button>
                            </div>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              )}

              {/* Outgoing */}
              {activeConnectionTab === "outgoing" && (
                <div className="space-y-3">
                  {dashboard.outgoing?.length === 0 ? (
                    <p className="text-muted text-sm text-center">
                      No outgoing requests.
                    </p>
                  ) : (
                    dashboard.outgoing.map((req) => {
                      const parent = req.connectedParent || {};
                      const requestedDate = new Date(
                        req.requestedAt
                      ).toLocaleString();

                      const profileImageUrl = parent.profileImage
                        ? `${API_URL}/${parent.profileImage
                            .replace(/^\/+/, "")
                            .replace(/^[Uu]ploads\//, "")}?v=${
                            parent.updatedAt || ""
                          }`
                        : null;

                      return (
                        <div
                          key={req.id}
                          className="flex flex-col sm:flex-row items-center justify-between bg-input rounded-2xl p-4 shadow-sm hover:shadow-md transition-all"
                        >
                          <div className="flex items-center gap-4 w-full sm:w-auto">
                            <div className="w-12 h-12 rounded-full bg-input flex items-center justify-center border border-primary overflow-hidden">
                              {profileImageUrl ? (
                                <img
                                  src={profileImageUrl}
                                  alt={parent.name}
                                  className="w-full h-full object-cover"
                                  onError={(e) => {
                                    e.currentTarget.style.display = "none";
                                    e.currentTarget.nextElementSibling.style.display =
                                      "flex";
                                  }}
                                />
                              ) : null}
                              <div
                                className={`w-full h-full flex items-center justify-center ${
                                  profileImageUrl ? "hidden" : "flex"
                                }`}
                              >
                                <UserIcon className="w-6 h-6 text-primary" />
                              </div>
                            </div>

                            <div className="flex flex-col">
                              <span className="font-semibold text-text text-sm sm:text-base">
                                {parent.name || "Unknown Parent"}
                              </span>
                              <span className="text-muted text-xs">
                                {parent.userCode}
                              </span>
                              <span className="text-xs text-muted">
                                Sent: {requestedDate}
                              </span>
                            </div>
                          </div>

                          <div className="flex items-center gap-3 mt-3 sm:mt-0">
                            <span
                              className={`px-2 py-1 text-xs rounded-full ${
                                req.status === "pending"
                                  ? "bg-yellow-100 text-yellow-700"
                                  : "bg-green-100 text-green-700"
                              }`}
                            >
                              {req.status.charAt(0).toUpperCase() +
                                req.status.slice(1)}
                            </span>

                            <Button
                              onClick={() => handleCancelRequest(req.id)}
                              className="button-accent rounded-full px-3 py-1 text-sm"
                              disabled={connectionLoading}
                            >
                              Cancel
                            </Button>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              )}

              {/* Shared children */}
              {activeConnectionTab === "shared" && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {accessibleSubUsers
                    .filter((su) => su.sharedBy)
                    .map((subUser) => (
                      <AccessibleSubUserCard
                        key={subUser.subUserId}
                        subUser={subUser}
                        getImageUrl={getImageUrl}
                        onSelect={handleSubUserSelect}
                      />
                    ))}
                  {accessibleSubUsers.filter((su) => su.sharedBy).length ===
                    0 && (
                    <p className="text-muted text-sm text-center col-span-2">
                      No children shared with you.
                    </p>
                  )}
                </div>
              )}
            </>
          )}
        </motion.div>
      )}

      {/* ==== SHARE MODAL ==== */}
      <Dialog.Root open={shareModalOpen} onOpenChange={setShareModalOpen}>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 bg-black/60 backdrop-blur-sm" />
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="fixed inset-0 flex items-center justify-center p-4"
          >
            <Dialog.Content className="glass-card border border-primary w-full max-w-md rounded-2xl shadow-soft p-4 max-h-[90vh] overflow-y-auto">
              <VisuallyHidden>
                <Dialog.Title>Share Children with Parent</Dialog.Title>
              </VisuallyHidden>

              <div className="flex justify-between items-center mb-3">
                <h2 className="font-semibold text-text text-base">
                  Share Children with{" "}
                  {selectedConnection?.connectedParent?.name ||
                    selectedConnection?.owner?.name}
                </h2>
                <Dialog.Close asChild>
                  <Button variant="ghost" className="text-primary p-1">
                    <X className="w-4 h-4" />
                  </Button>
                </Dialog.Close>
              </div>

              <div className="space-y-2">
                {subUsers.map((su) => (
                  <label
                    key={su.subUserId}
                    className="flex items-center gap-2 p-2 bg-input rounded-lg cursor-pointer"
                  >
                    <input
                      type="checkbox"
                      checked={selectedSubUsersToShare.includes(su.subUserId)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedSubUsersToShare((prev) => [
                            ...prev,
                            su.subUserId,
                          ]);
                        } else {
                          setSelectedSubUsersToShare((prev) =>
                            prev.filter((id) => id !== su.subUserId)
                          );
                        }
                      }}
                      className="w-4 h-4 text-primary"
                    />
                    <span className="text-text text-sm">{su.name}</span>
                  </label>
                ))}
              </div>

              <div className="flex gap-2 mt-4">
                <Dialog.Close asChild>
                  <Button variant="outline" className="flex-1">
                    Cancel
                  </Button>
                </Dialog.Close>
                <Button
                  onClick={handleUpdateShare}
                  className="flex-1 button-primary"
                  disabled={connectionLoading}
                >
                  Update Share
                </Button>
              </div>
            </Dialog.Content>
          </motion.div>
        </Dialog.Portal>
      </Dialog.Root>

      {/* CHILD EDIT MODAL */}
      <EditProfileModal
        editOpened={childEditOpened}
        setEditOpened={setChildEditOpened}
        selectedEntity={childToEdit}
        setSelectedEntity={setChildToEdit}
        fetchData={async () => {
          await refreshSubUsers();
          await refreshAccessibleSubUsers();
        }}
        loading={isLoading}
      />

      {/* CREATE CHILD MODAL */}
      {isMainUser && (
        <CreateChildProfilePage
          opened={modalOpened}
          onClose={handleModalClose}
        />
      )}

      {/* DELETE CONFIRM */}
      <Dialog.Root open={deleteConfirmOpen} onOpenChange={setDeleteConfirmOpen}>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 bg-black/60 backdrop-blur-sm" />
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="fixed inset-0 flex items-center justify-center p-4"
          >
            <Dialog.Content className="glass-card border border-primary w-full max-w-md rounded-2xl shadow-soft p-4">
              <VisuallyHidden>
                <Dialog.Title>Confirm Delete Profile</Dialog.Title>
              </VisuallyHidden>

              <div className="flex justify-between items-center mb-3">
                <h2 className="font-semibold text-text text-base">
                  Confirm Delete
                </h2>
                <Dialog.Close asChild>
                  <Button
                    variant="ghost"
                    className="text-primary hover:bg-input rounded-full p-1"
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </Dialog.Close>
              </div>
              <p className="text-muted text-sm">
                Are you sure you want to delete {subUserToDelete?.name}'s
                profile? This action cannot be undone.
              </p>
              <div className="flex gap-2 mt-3">
                <Dialog.Close asChild>
                  <Button
                    variant="outline"
                    className="flex-1 border border-primary text-primary hover:bg-input rounded-full text-sm"
                  >
                    Cancel
                  </Button>
                </Dialog.Close>
                <Button
                  onClick={confirmDelete}
                  className="flex-1 button-accent rounded-full text-sm hover:shadow-lg transition-all"
                  disabled={isLoading}
                >
                  Delete
                </Button>
              </div>
            </Dialog.Content>
          </motion.div>
        </Dialog.Portal>
      </Dialog.Root>

      {/* TOAST */}
      <Toast.Provider swipeDirection="right">
        <Toast.Root
          open={toastOpen}
          onOpenChange={setToastOpen}
          className="glass-card rounded-xl p-3 shadow-soft border border-primary"
        >
          <Toast.Description className="text-text text-sm">
            {toastMessage}
          </Toast.Description>
          <Toast.Close className="absolute top-2 right-2 text-primary">
            ×
          </Toast.Close>
        </Toast.Root>
        <Toast.Viewport className="fixed bottom-4 right-4" />
      </Toast.Provider>

      <style>{`
         @media (max-width: 640px) {
           .grid-cols-2 { grid-template-columns: 1fr; }
           .max-w-5xl { max-width: 100%; }
         }
         @media (min-width: 1024px) {
           .grid-cols-3 { grid-template-columns: repeat(3, minmax(0, 1fr)); }
         }
       `}</style>
    </>
  );
}