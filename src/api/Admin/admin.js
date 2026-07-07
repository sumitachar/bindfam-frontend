import api from "../base";

/* =====================================================
   Dashboard / Statistics APIs
===================================================== */

// মূল স্ট্যাটিস্টিক্স (ড্যাশবোর্ডের জন্য) - সময় ফিল্টার সহ
export const getAdminStats = async (params = {}) => {
  try {
    const res = await api.get("/admin/stats", { params });
    return res.data;
  } catch (error) {
    console.error("Error fetching admin stats:", error);
    throw error;
  }
};

// ডেভেলপমেন্ট/টেস্টিং এর জন্য (কোনো লগইন ছাড়াই কাজ করে)
export const getDevStats = async (params = {}) => {
  try {
    const res = await api.get("/admin/dev-stats", { params });
    return res.data;
  } catch (error) {
    console.error("Error fetching dev stats:", error);
    throw error;
  }
};

// রোল অনুযায়ী ইউজার কাউন্ট (parents, doctors, admins)
export const getUsersCountByRole = async () => {
  try {
    const res = await api.get("/admin/users/counts");
    return res.data;
  } catch (error) {
    console.error("Error fetching users count by role:", error);
    throw error;
  }
};

// সাম্প্রতিক লগইন / অ্যাকটিভিটি লগ
export const getRecentActivity = async (
  limit = 10,
  page = 1,
  from,
  to
) => {
  try {
    const res = await api.get("/admin/recent-activity", {
      params: {
        limit,
        page,
        ...(from && { from }),
        ...(to && { to }),
      },
    });

    return res.data;
  } catch (error) {
    console.error("Error fetching recent activity:", error);
    throw error;
  }
};

/* =====================================================
   Users Management APIs (ManageUsers.jsx)
===================================================== */

// ইউজার লিস্ট (pagination + search + role + status)
export const getAdminUsers = async (params = {}) => {
  try {
    const res = await api.get("/admin/users", { params });
    return res.data;
  } catch (error) {
    console.error("Error fetching admin users:", error);
    throw error;
  }
};

// নতুন ইউজার তৈরি
export const createAdminUser = async (payload) => {
  try {
    const res = await api.post("/admin/users", payload);
    return res.data;
  } catch (error) {
    console.error("Error creating admin user:", error);
    throw error;
  }
};

// ইউজার আপডেট
export const updateAdminUser = async (id, payload) => {
  try {
    const res = await api.put(`/admin/users/${id}`, payload);
    return res.data;
  } catch (error) {
    console.error("Error updating admin user:", error);
    throw error;
  }
};

// ইউজার ডিলিট
export const deleteAdminUser = async (id) => {
  try {
    const res = await api.delete(`/admin/users/${id}`);
    return res.data;
  } catch (error) {
    console.error("Error deleting admin user:", error);
    throw error;
  }
};

// Active / Inactive স্ট্যাটাস টগল
export const toggleAdminUserStatus = async (id, isActive) => {
  try {
    const res = await api.patch(`/admin/users/${id}/status`, { isActive });
    return res.data;
  } catch (error) {
    console.error("Error toggling user status:", error);
    throw error;
  }
};

/* =====================================================
   Optional / Future APIs
===================================================== */

// (অপশনাল) ভবিষ্যতে যদি পেন্ডিং ডাক্তারদের লিস্ট চান
export const getPendingDoctors = async () => {
  try {
    const res = await api.get("/admin/pending-doctors"); // যদি এই API বানান
    return res.data;
  } catch (error) {
    console.error("Error fetching pending doctors:", error);
    throw error;
  }
};

// (অপশনাল) সব ইউজার লিস্ট + লগইন কাউন্ট
export const getAllUsersWithLoginCount = async () => {
  try {
    const res = await api.get("/admin/all-users"); // যদি এই API বানান
    return res.data;
  } catch (error) {
    console.error("Error fetching all users with login count:", error);
    throw error;
  }
};


// ==============================
// Admin recent activity (logins)
// ==============================
export const getUserActivities = async (limit, page, from, to) => {
  const params = {
    limit,
    page,
  };

  if (from) params.from = from;
  if (to) params.to = to;

  const response = await api.get("/user-activity", {
    params,
  });

  return response.data;
};