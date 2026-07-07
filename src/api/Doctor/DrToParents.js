// src/api/Doctor/DrToParents.js
import api from "../base";

// ========================
// DOCTOR → PARENT FLOWS
// ========================

// Search patient by SubUserId
export const searchPatientBySubUserId = async (subUserId) => {
  try {
    const res = await api.get(`/sub-users/search/patient/${subUserId}`);
    return res.data;
  } catch (err) {
    console.error("Search patient failed:", err.response?.data || err.message);
    throw err.response?.data || err;
  }
};

export const searchPatientsByParentMobile = async (mobile) => {
  try {
    const res = await api.get(`/sub-users/search/by-mobile/${mobile}`);
    return res.data; // Should return array
  } catch (err) {
    console.error("Search by mobile failed:", err);
    throw err.response?.data || err;
  }
};

// Doctor sends request to parent
export const sendDoctorToParentRequest = async (subUserId, parentUserCode) => {
  try {
    const res = await api.post(`/sub-users/${subUserId}/connect/parent`, { parentUserCode });
    return res.data;
  } // sendDoctorToParentRequest ফাংশনের catch ব্লক
  catch (err) {
    console.error("Send request to parent failed:", err.response?.data || err.message);

    const msg = err.response?.data?.message || err.message;

    if (msg === 'REQUEST_ALREADY_SENT') {
      toast.error("You have already sent a request to this parent");
    } else if (msg === 'ALREADY_CONNECTED') {
      toast.error("You are already connected with this child");
    } else {
      toast.error(msg || "Failed to send request");
    }

    throw err.response?.data || err;
  }
};

// Get doctor’s sent requests (doctor → parent)
export const getDoctorSentRequestsToParents = async (doctorUserCode) => {
  try {
    const res = await api.get(`/sub-users/doctor/${doctorUserCode}/requests/sent`);
    return res.data;
  } catch (err) {
    console.error("Get doctor sent requests failed:", err.response?.data || err.message);
    throw err.response?.data || err;
  }
};

// Cancel a sent request (doctor → parent)
export const cancelDoctorSentRequest = async (subUserId, targetParentCode) => {
  try {
    const res = await api.post(`/sub-users/${subUserId}/connection/cancel`, { targetCode: targetParentCode });
    return res.data;
  } catch (err) {
    console.error("Cancel sent request failed:", err.response?.data || err.message);
    throw err.response?.data || err;
  }
};

// Accept incoming parent request (doctor accepts)
export const acceptParentRequestAsDoctor = async (subUserId, parentUserCode, permissions = {}) => {
  try {
    const res = await api.post(`/sub-users/${subUserId}/connection/accept`, {
      targetCode: parentUserCode,
      permissions,
    });
    return res.data;
  } catch (err) {
    console.error("Accept parent request failed:", err.response?.data || err.message);
    throw err.response?.data || err;
  }
};

// Reject incoming parent request
export const rejectParentRequestAsDoctor = async (subUserId, parentUserCode) => {
  try {
    const res = await api.post(`/sub-users/${subUserId}/connection/reject`, { targetCode: parentUserCode });
    return res.data;
  } catch (err) {
    console.error("Reject parent request failed:", err.response?.data || err.message);
    throw err.response?.data || err;
  }
};

// Get all connected patients for doctor
export const getDoctorConnectedPatients = async (doctorUserCode) => {
  try {
    const res = await api.get(`/sub-users/doctor/${doctorUserCode}/patients`);
    return res.data;
  } catch (err) {
    console.error("Get doctor patients failed:", err.response?.data || err.message);
    throw err.response?.data || err;
  }
};

// Get pending incoming requests for doctor (parent → doctor)
export const getDoctorIncomingRequestsFromParents = async (doctorUserCode) => {
  try {
    const res = await api.get(`/sub-users/doctor/${doctorUserCode}/requests/pending`);
    return res.data;
  } catch (err) {
    console.error("Get incoming requests failed:", err.response?.data || err.message);
    throw err.response?.data || err;
  }
};

// Log doctor access to patient data
export const logDoctorAccessToPatient = async (doctorUserCode, subUserId, action, context = {}) => {
  try {
    const res = await api.post(`/sub-users/access/log/${doctorUserCode}`, { subUserId, action, context });
    return res.data;
  } catch (err) {
    console.error("Log doctor access failed:", err.response?.data || err.message);
    throw err.response?.data || err;
  }
};

// Get doctor access logs
export const getDoctorAccessLogsForPatient = async (doctorUserCode, options = {}) => {
  try {
    const res = await api.get(`/sub-users/doctor/${doctorUserCode}/access-logs`, { params: options });
    return res.data;
  } catch (err) {
    console.error("Get doctor logs failed:", err.response?.data || err.message);
    throw err.response?.data || err;
  }
};

// ========================
// PARENT → DOCTOR FLOWS
// ========================

// Search doctor by userCode
export const searchDoctorByUserCode = async (code) => {
  try {
    const res = await api.get(`/sub-users/search/doctor/${code}`);
    return res.data;
  } catch (err) {
    console.error("Search doctor failed:", err.response?.data || err.message);
    throw err.response?.data || err;
  }
};

// Parent sends request to doctor
export const sendParentToDoctorRequest = async (subUserId, doctorUserCode) => {
  try {
    const res = await api.post(`/sub-users/${subUserId}/connect/doctor`, { doctorUserCode });
    return res.data;
  } catch (err) {
    console.error("Request doctor access failed:", err.response?.data || err.message);
    throw err.response?.data || err;
  }
};

// Parent gets their sent requests (to doctors)
export const getParentSentRequestsToDoctors = async (subUserId) => {
  try {
    const res = await api.get(`/sub-users/${subUserId}/requests/sent`);
    return res.data;
  } catch (err) {
    console.error("Get parent sent requests failed:", err.response?.data || err.message);
    throw err.response?.data || err;
  }
};

// Cancel a sent request (parent → doctor)
export const cancelParentSentRequest = async (subUserId, doctorUserCode) => {
  try {
    const res = await api.post(`/sub-users/${subUserId}/connection/cancel`, { targetCode: doctorUserCode });
    return res.data;
  } catch (err) {
    console.error("Cancel parent request failed:", err.response?.data || err.message);
    throw err.response?.data || err;
  }
};

// Accept doctor request (parent accepts)
export const acceptDoctorRequestAsParent = async (subUserId, doctorUserCode, permissions = {}) => {
  try {
    const res = await api.post(`/sub-users/${subUserId}/connection/accept`, {
      targetCode: doctorUserCode,
      permissions,
    });
    return res.data;
  } catch (err) {
    console.error("Accept doctor request failed:", err.response?.data || err.message);
    throw err.response?.data || err;
  }
};

// Reject doctor request
export const rejectDoctorRequestAsParent = async (subUserId, doctorUserCode) => {
  try {
    const res = await api.post(`/sub-users/${subUserId}/connection/reject`, { targetCode: doctorUserCode });
    return res.data;
  } catch (err) {
    console.error("Reject doctor request failed:", err.response?.data || err.message);
    throw err.response?.data || err;
  }
};

// Get all linked doctors for a child
export const getChildLinkedDoctors = async (subUserId) => {
  try {
    const res = await api.get(`/sub-users/${subUserId}/doctors`);
    return res.data;
  } catch (err) {
    console.error("Get child doctors failed:", err.response?.data || err.message);
    throw err.response?.data || err;
  }
};

// Get pending doctor requests for child (doctor → parent)
export const getChildIncomingDoctorRequests = async (subUserId) => {
  try {
    const res = await api.get(`/sub-users/${subUserId}/requests/pending`);
    return res.data;
  } catch (err) {
    console.error("Get child requests failed:", err.response?.data || err.message);
    throw err.response?.data || err;
  }
};

// Update doctor permissions
export const updateDoctorPermissionsForChild = async (subUserId, doctorUserCode, permissions) => {
  try {
    const res = await api.put(`/sub-users/${subUserId}/doctors/${doctorUserCode}/permissions`, { permissions });
    return res.data;
  } catch (err) {
    console.error("Update permissions failed:", err.response?.data || err.message);
    throw err.response?.data || err;
  }
};

// Get access logs for child
export const getChildAccessLogs = async (subUserId, options = {}) => {
  try {
    const res = await api.get(`/sub-users/${subUserId}/access-logs`, { params: options });
    return res.data;
  } catch (err) {
    console.error("Get access logs failed:", err.response?.data || err.message);
    throw err.response?.data || err;
  }
};
