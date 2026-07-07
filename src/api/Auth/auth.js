// api/auth.js
import api from "../base";

export const registerUser = async (name, mobile, password, role, isOtpVerification, sessionId, otp) => {
  try {
    const payload = { name, mobile, password, role };

    // If OTP verification is enabled, include these fields
    if (isOtpVerification) {
      payload.sessionId = sessionId;
      payload.otp = otp;
    }

    const res = await api.post("/auth/register", payload);
    return res.data;
  } catch (err) {
    throw err;
  }
};


export const sendOtp = async (mobile) => {
  try {
    const res = await api.post("/auth/send-otp", { mobile });
    return res.data;
  } catch (err) {
    throw err;
  }
};


export const verifyOtp = async (sessionId, otp) => {
  try {
    const res = await api.post("/auth/verify-otp", { sessionId, otp });
    return res.data;
  } catch (err) {
    throw err;
  }
};


export const loginUser = async (identifier, password, role) => {
  try {
    const res = await api.post("/auth/login", { identifier, password, role });
    return res.data;
  } catch (err) {
    throw err;
  }
};


export const refreshToken = async (refreshToken) => {
  try {
    const res = await api.post(
      "/auth/refresh",
      {},
      { headers: { Authorization: `Bearer ${refreshToken}` } }
    );
    return res.data;
  } catch (err) {
    throw new Error(err.response?.data?.message || "Failed to refresh token");
  }
};

export const getProfile = async () => {
  try {
    const res = await api.get("/auth/profile");
    return res.data;
  } catch (err) {
    throw new Error(err.response?.data?.message || "Failed to get profile");
  }
};

export const logoutUser = async () => {
  try {
    const res = await api.post("/auth/logout");
    return res.data;
  } catch (err) {
    throw new Error(err.response?.data?.message || "Failed to logout");
  }
};

export const updateProfile = async (data) => {
  try {
    if (!data.userCode) throw new Error("userCode is required");
    const res = await api.put(`/users/${data.userCode}`, data);
    return res.data;
  } catch (err) {
    throw new Error(err.response?.data?.message || "Failed to update profile");
  }
};

export const uploadProfileImage = async (userCode, file) => {
  try {
    const formData = new FormData();
    formData.append("profileImage", file);
    const res = await api.post(`/users/${userCode}/profile-image`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
      timeout: 30000,
    });
    return res.data;
  } catch (err) {
    throw new Error(
      err.response?.data?.message || "Failed to upload profile image"
    );
  }
};

export const changePassword = async (userId, newPassword) => {
  try {
    const res = await api.patch(`/users/${userId}/change-password`, {
      newPassword,
    });
    return res.data;
  } catch (err) {
    throw new Error(err.response?.data?.message || "Failed to change password");
  }
};

export const validatePassword = async (userId, password) => {
  try {
    const res = await api.post(`/users/${userId}/validate-password`, {
      password,
    });
    return res.data;
  } catch (err) {
    throw new Error(err.response?.data?.message || "Failed to validate password");
  }
};


// Forgot Password - Step 1: Request OTP
export const forgotPasswordRequestOtp = async (mobile, role = "parent") => {
  try {
    const res = await api.post("/auth/forgot-password/request-otp", { mobile, role });
    return res.data;
  } catch (err) {
    throw new Error(err.response?.data?.message || "Failed to send OTP");
  }
};

// Forgot Password - Step 2: Verify OTP & Reset Password
export const forgotPasswordVerify = async (mobile, role, sessionId, otp, newPassword) => {
  try {
    const res = await api.post("/auth/forgot-password/verify", {
      mobile,
      role,
      sessionId,
      otp,
      newPassword,
    });
    return res.data;
  } catch (err) {
    throw new Error(err.response?.data?.message || "Failed to reset password");
  }
};

export const toggleUserStatus = async (userId, isActive) => {
  try {
    const res = await api.patch(`/users/${userId}/status`, { isActive });
    return res.data;
  } catch (err) {
    throw new Error(
      err.response?.data?.message || "Failed to toggle user status"
    );
  }
};

export const softDeleteUser = async (userId) => {
  try {
    const res = await api.delete(`/users/${userId}/soft`);
    return res.data;
  } catch (err) {
    throw new Error(
      err.response?.data?.message || "Failed to soft delete user"
    );
  }
};

export const hardDeleteUser = async (userId) => {
  try {
    const res = await api.delete(`/users/${userId}`);
    return res.data;
  } catch (err) {
    throw new Error(
      err.response?.data?.message || "Failed to hard delete user"
    );
  }
};

export const getSubUsers = async () => {
  try {
    const res = await api.get(`/sub-users`);
    return res.data;
  } catch (err) {
    throw new Error(err.response?.data?.message || "Failed to get sub-users");
  }
};

export const createSubUser = async (formDataObj) => {
  try {
    const res = await api.post("/sub-users", formDataObj, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return res.data;
  } catch (err) {
    throw new Error(
      err.response?.data?.message || "Failed to create sub-user"
    );
  }
};

export const updateSubUser = async (subUserId, updateData) => {
  try {
    const mappedData = {
      name: updateData.name,
      dateOfBirth: updateData.dateOfBirth || null,
      gender: updateData.gender || null,
    };
    const res = await api.patch(`/sub-users/${subUserId}`, mappedData);
    return res.data;
  } catch (err) {
    throw new Error(err.response?.data?.message || "Failed to update sub-user");
  }
};

export const updateSubUserProfileImage = async (subUserId, file) => {
  try {
    const formData = new FormData();
    formData.append("profileImage", file);
    const res = await api.patch(`/sub-users/${subUserId}/profile-image`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return res.data;
  } catch (err) {
    throw new Error(
      err.response?.data?.message || "Failed to update sub-user profile image"
    );
  }
};

export const softDeleteSubUser = async (subUserId) => {
  try {
    const res = await api.delete(`/sub-users/soft/${subUserId}`);
    return res.data;
  } catch (err) {
    throw new Error(
      err.response?.data?.message || "Failed to soft delete sub-user"
    );
  }
};

export const hardDeleteSubUser = async (subUserId) => {
  try {
    const res = await api.delete(`/sub-users/hard/${subUserId}`);
    return res.data;
  } catch (err) {
    throw new Error(
      err.response?.data?.message || "Failed to hard delete sub-user"
    );
  }
};

export const toggleSubUserStatus = async (subUserId, isActive) => {
  try {
    const res = await api.patch(`/sub-users/${subUserId}/status`, { isActive });
    return res.data;
  } catch (err) {
    throw new Error(
      err.response?.data?.message || "Failed to toggle sub-user status"
    );
  }
};

export const requestDoctorAccess = async (subUserId, doctorId) => {
  try {
    const res = await api.post(`/sub-users/${subUserId}/request-doctor`, {
      doctorId,
    });
    return res.data;
  } catch (err) {
    throw new Error(
      err.response?.data?.message || "Failed to request doctor access"
    );
  }
};

export const acceptDoctorRequest = async (subUserId, doctorId, permissions) => {
  try {
    const res = await api.post(`/sub-users/${subUserId}/accept-doctor`, {
      doctorId,
      permissions,
    });
    return res.data;
  } catch (err) {
    throw new Error(
      err.response?.data?.message || "Failed to accept doctor request"
    );
  }
};

export const rejectDoctorRequest = async (subUserId, doctorId) => {
  try {
    const res = await api.post(`/sub-users/${subUserId}/reject-doctor`, {
      doctorId,
    });
    return res.data;
  } catch (err) {
    throw new Error(
      err.response?.data?.message || "Failed to reject doctor request"
    );
  }
};

export const getSubUserDoctors = async (subUserId) => {
  try {
    const res = await api.get(`/sub-users/${subUserId}/doctors`);
    return res.data;
  } catch (err) {
    throw new Error(
      err.response?.data?.message || "Failed to get sub-user doctors"
    );
  }
};

export const updateDoctorPermissions = async (
  subUserId,
  doctorId,
  permissions
) => {
  try {
    const res = await api.put(
      `/sub-users/${subUserId}/doctors/${doctorId}/permissions`,
      { permissions }
    );
    return res.data;
  } catch (err) {
    throw new Error(
      err.response?.data?.message || "Failed to update doctor permissions"
    );
  }
};

// NEW: API functions for doctor-specific profile
export const getDoctorProfile = async (userCode) => {
  const res = await api.get(`/users/doctor/${userCode}/profile`);
  return res.data;
};

export const updateDoctorProfile = async (userCode, data) => {
  const res = await api.patch(`/users/doctor/${userCode}/profile`, data);
  return res.data;
};