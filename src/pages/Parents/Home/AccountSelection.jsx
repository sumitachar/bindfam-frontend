// AccountSelectionPage.jsx
import React, { useContext, } from "react";
import { useNavigate } from "react-router-dom";
import { UserContext } from "@/context/UserContext";

import UserProfileSection from "./components/UserProfileSection";
import ChildProfilesAndConnections from "./components/ChildProfilesAndConnections";

export default function AccountSelectionPage() {
  const {
    user,
    setUser,
    subUsers,
    accessibleSubUsers,
    selectSubUser,
    softDeleteSubUser,
    refreshSubUsers,
    refreshAccessibleSubUsers,
    isMainUser,
    logout,
    selectedEntity,
    refreshParentDashboard,
    searchParent,
    sendConnectionRequest,
    acceptConnection,
    rejectConnection,
    cancelConnection,
    updateShared,
  } = useContext(UserContext);

  const navigate = useNavigate();

  // Shared state passed down
  const sharedState = {
    user,
    setUser,
    subUsers,
    accessibleSubUsers,
    selectSubUser,
    softDeleteSubUser,
    refreshSubUsers,
    refreshAccessibleSubUsers,
    isMainUser,
    logout,
    selectedEntity,
    refreshParentDashboard,
    searchParent,
    sendConnectionRequest,
    acceptConnection,
    rejectConnection,
    cancelConnection,
    updateShared,
    navigate,
  };

  return (
    <div className="min-h-screen w-full py-4 px-4 sm:px-6">
      <UserProfileSection user={user} setUser={setUser} />
      <ChildProfilesAndConnections sharedState={sharedState} />
    </div>
  );
}