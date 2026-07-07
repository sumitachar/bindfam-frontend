import React, {
  createContext,
  useState,
  useEffect,
  useCallback,
  useMemo,
} from "react";
import {
  loginUser,
  logoutUser,
  refreshToken,
  getProfile,
  getSubUsers,
  createSubUser as createSubUserApi,
  toggleSubUserStatus as toggleSubUserStatusApi,
  softDeleteSubUser as softDeleteSubUserApi,
  hardDeleteSubUser as hardDeleteSubUserApi,
} from "@/api/Auth/auth";
import api from "@/api/base";

// Parent-to-parent API functions
import {
  searchParentByUserCode,
  sendParentConnectionRequest,
  acceptParentConnection,
  rejectParentConnection,
  cancelParentConnection,
  updateSharedSubUsers,
  getParentDashboard,
  getAccessibleSubUsers,
} from "@/api/Parents/parenttoParent";

export const UserContext = createContext();

export const UserProvider = ({ children, navigate }) => {
  // ────────────────────────────────────────────────────────
  // Core user state
  // ────────────────────────────────────────────────────────
  const [user, setUser] = useState(null);
  const [subUsers, setSubUsers] = useState([]); // Owned sub-users (parents only)
  const [selectedEntity, setSelectedEntity] = useState(null); // Current child/patient
  const [isReadOnly, setIsReadOnly] = useState(false); // true = view-only (shared)
  const [loading, setLoading] = useState(true);
  const [isInitialized, setIsInitialized] = useState(false);

  // ────────────────────────────────────────────────────────
  // Parent-to-parent connection state
  // ────────────────────────────────────────────────────────
  const [accessibleSubUsers, setAccessibleSubUsers] = useState([]); // Owned + shared (parents), Patients (doctors)
  const [incomingRequests, setIncomingRequests] = useState([]);
  const [outgoingRequests, setOutgoingRequests] = useState([]);
  const [sharedByMe, setSharedByMe] = useState([]); // Connections where I am owner
  const [sharedToMe, setSharedToMe] = useState([]); // Connections where I am connectedParent

  // NEW: Doctor-specific professional fields
  // UserProvider-এর ভিতরে
  const [doctorAdvanceData, setdoctorAdvanceData] = useState({
    specialization: "",
    qualification: "",
    registrationNumber: "",
    experienceYears: null,
    clinics: [], 
  });

  const BASE_PATH = import.meta.env.VITE_BASE_PATH || "";

  // ────────────────────────────────────────────────────────
  // Token validation
  // ────────────────────────────────────────────────────────
  const validateToken = (token) => {
    if (!token) return false;
    try {
      const payload = JSON.parse(atob(token.split(".")[1]));
      return payload?.userCode && payload.exp > Math.floor(Date.now() / 1000);
    } catch {
      return false;
    }
  };

  // ────────────────────────────────────────────────────────
  // Refresh owned sub-users (parents only)
  // ────────────────────────────────────────────────────────
  const refreshSubUsers = useCallback(async () => {
    try {
      const res = await getSubUsers();
      const subList = Array.isArray(res) ? res : res?.data || [];
      setSubUsers((prev) =>
        JSON.stringify(prev) !== JSON.stringify(subList) ? subList : prev
      );

      // Keep selectedEntity in sync
      setSelectedEntity((prev) => {
        if (!prev) return null;
        const updated = subList.find((u) => u.subUserId === prev.subUserId);
        if (!updated) {
          localStorage.removeItem("selectedEntityId");
          setIsReadOnly(false);
          return null;
        }
        return updated;
      });

      return subList;
    } catch (err) {
      console.error("Failed to refresh owned sub-users:", err);
      throw err;
    }
  }, []);

  // ────────────────────────────────────────────────────────
  // Refresh accessible sub-users (owned + shared for parents, patients for doctors)
  // ────────────────────────────────────────────────────────
  const refreshAccessibleSubUsers = useCallback(async () => {
    try {
      const list = await getAccessibleSubUsers();
      setAccessibleSubUsers(Array.isArray(list) ? list : []);
    } catch (err) {
      console.warn("refreshAccessibleSubUsers error:", err);
      setAccessibleSubUsers([]);
    }
  }, []);

  // ────────────────────────────────────────────────────────
  // Refresh parent dashboard (requests + connections)
  // ────────────────────────────────────────────────────────
  const refreshParentDashboard = useCallback(async () => {
    try {
      const dash = await getParentDashboard();
      setIncomingRequests(dash.incoming ?? []);
      setOutgoingRequests(dash.outgoing ?? []);
      setSharedByMe(dash.accepted ?? []);
      setSharedToMe(dash.accepted ?? []);
      return dash;
    } catch (err) {
      console.error("refreshParentDashboard error:", err);
      return { incoming: [], outgoing: [], accepted: [] };
    }
  }, []);

  // ────────────────────────────────────────────────────────
  // Authentication initialization
  // ────────────────────────────────────────────────────────
useEffect(() => {
  const initAuth = async () => {
    if (isInitialized) return;

    const token = localStorage.getItem("accessToken");
    const refreshTokenValue = localStorage.getItem("refreshToken");
    const storedSubUserId = localStorage.getItem("selectedEntityId");

    // -------------------------------
    // Token validation / refresh
    // -------------------------------
    if (!token || !validateToken(token)) {
      if (refreshTokenValue) {
        try {
          const newToken = await handleRefresh();
          api.defaults.headers.common.Authorization = `Bearer ${newToken}`;
        } catch {
          handleLogout();
          setLoading(false);
          setIsInitialized(true);
          return;
        }
      } else {
        handleLogout();
        setLoading(false);
        setIsInitialized(true);
        return;
      }
    } else {
      api.defaults.headers.common.Authorization = `Bearer ${token}`;
    }

    try {
      // -------------------------------
      // Fetch profile
      // -------------------------------
      const profileRes = await getProfile();
      const profile = profileRes?.data || profileRes;
      setUser(profile);

      let ownedSubUsers = [];

      // -------------------------------
      // Load owned sub-users (PARENT only)
      // -------------------------------
      if (profile.role === "parent") {
        ownedSubUsers = await refreshSubUsers();
      }

      // -------------------------------
      // Load all accessible sub-users
      // parents → owned + shared
      // doctors → patients
      // -------------------------------
      const allAccessible = await getAccessibleSubUsers();
      setAccessibleSubUsers(allAccessible);

      // -------------------------------
      // 🔒 SAFE selectedEntity restore (role-aware)
      // -------------------------------
      if (storedSubUserId) {
        // Find the entity in accessible list
        const matched = allAccessible.find(
          (u) => u.subUserId === storedSubUserId
        );

        if (matched) {
          setSelectedEntity(matched);
          // Read-only only if parent & it's a shared child
          setIsReadOnly(
            profile.role === "parent" &&
            !ownedSubUsers.some(
              (o) => o.subUserId === storedSubUserId
            )
          );
        } else {
          // Invalid / deleted entity
          localStorage.removeItem("selectedEntityId");
          setSelectedEntity(null);
          setIsReadOnly(false);
        }
      } else {
        // First login / doctor / no stored entity
        setSelectedEntity(null);
        setIsReadOnly(false);
      }

      // -------------------------------
      // Parent dashboard data
      // -------------------------------
      if (profile.role === "parent") {
        await refreshParentDashboard();
      }

    } catch (err) {
      console.warn("Profile fetch failed:", err);
      try {
        const newToken = await handleRefresh();
        api.defaults.headers.common.Authorization = `Bearer ${newToken}`;
        const profileRes = await getProfile();
        setUser(profileRes?.data || profileRes);
      } catch {
        handleLogout();
      }
    } finally {
      setLoading(false);
      setIsInitialized(true);
    }
  };

  initAuth();
}, [
  isInitialized,
  refreshSubUsers,
  refreshParentDashboard,
  getAccessibleSubUsers,
]);



  // ────────────────────────────────────────────────────────
  // Login
  // ────────────────────────────────────────────────────────
  const login = async (identifier, password, role) => {
  try {
    // ✅ VERY IMPORTANT: clear previous child selection
    localStorage.removeItem("selectedEntityId");

    const data = await loginUser(identifier, password, role);
    if (!data?.accessToken) throw new Error("No access token received");

    localStorage.setItem("accessToken", data.accessToken);
    localStorage.setItem("refreshToken", data.refreshToken);
    api.defaults.headers.common.Authorization = `Bearer ${data.accessToken}`;

    const profileRes = await getProfile();
    const profile = profileRes?.data || profileRes;
    setUser(profile);

    // Parent specific loads
    if (profile.role === "parent") {
      await refreshSubUsers();
      await refreshParentDashboard();
    }

    await refreshAccessibleSubUsers();

    // 🔒 ensure clean selection on login
    setSelectedEntity(null);
    setIsReadOnly(false);

    setIsInitialized(true);
    return profile;
  } catch (err) {
    console.error("Login failed:", err);
    throw err;
  }
};


  // ────────────────────────────────────────────────────────
  // Token refresh
  // ────────────────────────────────────────────────────────
  const handleRefresh = async () => {
    try {
      const refreshTokenValue = localStorage.getItem("refreshToken");
      if (!refreshTokenValue) throw new Error("No refresh token available");

      const data = await refreshToken(refreshTokenValue);
      if (data?.accessToken) {
        localStorage.setItem("accessToken", data.accessToken);
        api.defaults.headers.common[
          "Authorization"
        ] = `Bearer ${data.accessToken}`;
        return data.accessToken;
      }
      throw new Error("No access token from refresh");
    } catch (err) {
      console.error("Token refresh failed:", err);
      handleLogout();
      if (navigate) navigate(`${BASE_PATH}/login/`);
      throw err;
    }
  };

  // ────────────────────────────────────────────────────────
  // Logout – clear everything
  // ────────────────────────────────────────────────────────
  const handleLogout = () => {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    localStorage.removeItem("selectedEntityId");
    setUser(null);
    setSubUsers([]);
    setSelectedEntity(null);
    setIsReadOnly(false);
    setAccessibleSubUsers([]);
    setIncomingRequests([]);
    setOutgoingRequests([]);
    setSharedByMe([]);
    setSharedToMe([]);
    setIsInitialized(false);
  };

  const logout = async () => {
    try {
      await logoutUser();
    } catch {
      console.warn("Logout API failed");
    } finally {
      handleLogout();
      if (navigate) navigate(`${BASE_PATH}/login/`);
    }
  };

  // ────────────────────────────────────────────────────────
  // Sub-user selection (owned vs shared → read-only)
  // ────────────────────────────────────────────────────────
  const selectSubUser = useCallback(
    (subUserId) => {
      const owned = subUsers.find((u) => u.subUserId === subUserId);
      if (owned) {
        setSelectedEntity(owned);
        setIsReadOnly(false);
        localStorage.setItem("selectedEntityId", subUserId);
        return;
      }

      const shared = accessibleSubUsers.find((u) => u.subUserId === subUserId);
      if (shared) {
        setSelectedEntity(shared);
        setIsReadOnly(user?.role === "parent"); 
        localStorage.setItem("selectedEntityId", subUserId);
        return;
      }

      setSelectedEntity(null);
      setIsReadOnly(false);
      localStorage.removeItem("selectedEntityId");
    },
    [subUsers, accessibleSubUsers, user?.role]
  );

  // ────────────────────────────────────────────────────────
  // Sub-user CRUD helpers
  // ────────────────────────────────────────────────────────
  const createSubUser = async (userData) => {
    const res = await createSubUserApi(userData);
    await refreshSubUsers();
    await refreshAccessibleSubUsers();
    return res;
  };

  const toggleSubUserStatus = async (subUserId, isActive) => {
    const res = await toggleSubUserStatusApi(subUserId, isActive);
    await refreshSubUsers();
    return res;
  };

  const softDeleteSubUser = async (subUserId) => {
    const res = await softDeleteSubUserApi(subUserId);
    await refreshSubUsers();
    await refreshAccessibleSubUsers();
    if (selectedEntity?.subUserId === subUserId) {
      setSelectedEntity(null);
      setIsReadOnly(false);
      localStorage.removeItem("selectedEntityId");
    }
    return res;
  };

  const hardDeleteSubUser = async (subUserId) => {
    const res = await hardDeleteSubUserApi(subUserId);
    await refreshSubUsers();
    await refreshAccessibleSubUsers();
    if (selectedEntity?.subUserId === subUserId) {
      setSelectedEntity(null);
      setIsReadOnly(false);
      localStorage.removeItem("selectedEntityId");
    }
    return res;
  };

  // ────────────────────────────────────────────────────────
  // Parent-to-parent actions
  // ────────────────────────────────────────────────────────
  const searchParent = async (code) => {
    return await searchParentByUserCode(code);
  };

  const sendConnectionRequest = async (targetCode) => {
    await sendParentConnectionRequest(targetCode);
    await refreshParentDashboard();
  };

  const acceptConnection = async (connId, subUserIds = []) => {
    await acceptParentConnection(connId, subUserIds);
    await Promise.all([refreshParentDashboard(), refreshAccessibleSubUsers()]);
  };

  const rejectConnection = async (connId) => {
    await rejectParentConnection(connId);
    await refreshParentDashboard();
  };

  const cancelConnection = async (connId) => {
    await cancelParentConnection(connId);
    await Promise.all([refreshParentDashboard(), refreshAccessibleSubUsers()]);
  };

  const updateShared = async (connId, subUserIds) => {
    await updateSharedSubUsers(connId, subUserIds);
    await Promise.all([refreshParentDashboard(), refreshAccessibleSubUsers()]);
  };

  // ────────────────────────────────────────────────────────
  // Memoized context value
  // ────────────────────────────────────────────────────────
  const contextValue = useMemo(
    () => ({
      user,
      setUser,
      subUsers,
      selectedEntity,
      isReadOnly,
      loading,
      login,
      logout,
      refresh: handleRefresh,
      selectSubUser,
      createSubUser,
      toggleSubUserStatus,
      softDeleteSubUser,
      hardDeleteSubUser,
      refreshSubUsers,
      setSelectedEntity,
      doctorAdvanceData,
      setdoctorAdvanceData,
      isMainUser: user?.role === "parent",
      isDoctor: user?.role === "doctor",

      // Parent-to-parent data & actions
      accessibleSubUsers,
      incomingRequests,
      outgoingRequests,
      sharedByMe,
      sharedToMe,
      refreshParentDashboard,
      refreshAccessibleSubUsers,
      searchParent,
      sendConnectionRequest,
      acceptConnection,
      rejectConnection,
      cancelConnection,
      updateShared,
    }),
    [
      user,
      subUsers,
      selectedEntity,
      isReadOnly,
      loading,
      selectSubUser,
      accessibleSubUsers,
      incomingRequests,
      outgoingRequests,
      sharedByMe,
      sharedToMe,
      refreshParentDashboard,
      refreshAccessibleSubUsers,
      doctorAdvanceData,
      setdoctorAdvanceData,
    ]
  );

  return (
    <UserContext.Provider value={contextValue}>{children}</UserContext.Provider>
  );
};
