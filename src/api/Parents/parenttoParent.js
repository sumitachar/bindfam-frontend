import api from "../base";

/**
 * Search for a parent by userCode
 */
export const searchParentByUserCode = async (userCode) => {
  try {
    const res = await api.get(`/sub-users/search/parent/${userCode}`);
    if (res.data.role !== "parent") {
      throw new Error("User is not a parent");
    }
    return res.data;
  } catch (err) {
    console.error("Search parent error:", {
      message: err.message,
      response: err.response ? err.response.data : null,
      userCode,
    });
    throw new Error(err.response && err.response.data && err.response.data.message
      ? err.response.data.message
      : "Failed to search parent"
    );
  }
};

/**
 * Send a parent-to-parent connection request
 */
export const sendParentConnectionRequest = async (targetParentCode) => {
  try {
    const res = await api.post("/sub-users/family/connection/request", {
      targetParentCode: targetParentCode,
    });
    return res.data;
  } catch (err) {
    console.error("Send connection request error:", {
      message: err.message,
      response: err.response ? err.response.data : null,
      targetParentCode,
    });
    throw new Error(err.response && err.response.data && err.response.data.message
      ? err.response.data.message
      : "Failed to send connection request"
    );
  }
};

/**
 * Accept a parent connection request
 */
export const acceptParentConnection = async (connectionId, shareSubUserIds) => {
  if (shareSubUserIds === undefined) shareSubUserIds = [];
  try {
    const res = await api.post(`/sub-users/family/connection/${connectionId}/accept`, {
      shareSubUserIds: shareSubUserIds,
    });
    return res.data;
  } catch (err) {
    console.error("Accept connection error:", {
      message: err.message,
      response: err.response ? err.response.data : null,
      connectionId,
      shareSubUserIds,
    });
    throw new Error(err.response && err.response.data && err.response.data.message
      ? err.response.data.message
      : "Failed to accept connection"
    );
  }
};

/**
 * Reject a parent connection request
 */
export const rejectParentConnection = async (connectionId) => {
  try {
    const res = await api.post(`/sub-users/family/connection/${connectionId}/reject`);
    return res.data;
  } catch (err) {
    console.error("Reject connection error:", {
      message: err.message,
      response: err.response ? err.response.data : null,
      connectionId,
    });
    throw new Error(err.response && err.response.data && err.response.data.message
      ? err.response.data.message
      : "Failed to reject connection"
    );
  }
};

/**
 * Cancel a connection (owner or connected parent)
 */
export const cancelParentConnection = async (connectionId) => {
  try {
    const res = await api.post(`/sub-users/family/connection/${connectionId}/cancel`);
    return res.data;
  } catch (err) {
    console.error("Cancel connection error:", {
      message: err.message,
      response: err.response ? err.response.data : null,
      connectionId,
    });
    throw new Error(err.response && err.response.data && err.response.data.message
      ? err.response.data.message
      : "Failed to cancel connection"
    );
  }
};

/**
 * Update shared sub-users in an accepted connection
 */
export const updateSharedSubUsers = async (connectionId, subUserIds) => {
  try {
    const res = await api.post(`/sub-users/family/connection/${connectionId}/share`, {
      subUserIds: subUserIds,
    });
    return res.data;
  } catch (err) {
    console.error("Update shared sub-users error:", {
      message: err.message,
      response: err.response ? err.response.data : null,
      connectionId,
      subUserIds,
    });
    throw new Error(err.response && err.response.data && err.response.data.message
      ? err.response.data.message
      : "Failed to update shared children"
    );
  }
};

/**
 * Get parent dashboard: incoming, outgoing, accepted connections + shared sub-users
 */
export const getParentDashboard = async () => {
  try {
    const res = await api.get("/sub-users/family/connections");
    return res.data;
  } catch (err) {
    console.error("Get parent dashboard error:", {
      message: err.message,
      response: err.response ? err.response.data : null,
    });
    throw new Error(err.response && err.response.data && err.response.data.message
      ? err.response.data.message
      : "Failed to load parent dashboard"
    );
  }
};

/**
 * Get all sub-users accessible to this parent (owned + shared by others)
 */
export const getAccessibleSubUsers = async () => {
  try {
    const res = await api.get("/sub-users/accessible");
    const data = res.data;
    return Array.isArray(data) ? data : [];
  } catch (err) {
    console.warn("No accessible sub-users (this is normal)", {
      status: err.response ? err.response.status : null,
      message: err.response && err.response.data && err.response.data.message
        ? err.response.data.message
        : err.message,
    });
    return [];
  }
};

/**
 * [REMOVED] getAcceptedFamilyConnections
 * → Use getParentDashboard() and filter `accepted` array instead.
 */