// src/api/Doctor/DoctorPrescribe.js
import api from "../base";

// Search user by mobile number
export const searchUserByMobile = async (mobile, role = 'parent') => {
  try {
    const res = await api.get(`/users/search/mobile/${mobile}?role=${role}`);
    return res.data;
  } catch (error) {
    // If user not found, return empty array
    if (error.response?.status === 404) {
      return [];
    }
    throw error;
  }
};

// Create a new user
export const createUser = async (userData) => {
  try {
    const res = await api.post('/users', userData);
    return res.data;
  } catch (error) {
    throw error;
  }
};

// Get subusers by parent code
export const getSubUsersByParentCode = async (parentUserCode) => {
  try {
    const res = await api.get(`/sub-users/doctor/${parentUserCode}/subusers`);
    return res.data;
  } catch (error) {
    throw error;
  }
};

// Create subuser
export const createSubUser = async (parentUserCode, subUserData) => {
  try {
    const formData = new FormData();
    formData.append('name', subUserData.name);
    formData.append('gender', subUserData.gender);
    formData.append('dateOfBirth', subUserData.dateOfBirth);
    formData.append('relationOfMember', subUserData.relationOfMember);
    
    const res = await api.post(`/sub-users/doctor-create/${parentUserCode}`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return res.data;
  } catch (error) {
    throw error;
  }
};

// Get detailed subuser info
export const getSubUserDetails = async (subUserId) => {
  const res = await api.get(`/sub-users/search/patient/${subUserId}`);
  return res.data.subUser; 
};

// Create prescription
export const createPrescription = async (prescriptionData) => {
  try {
    const res = await api.post('/prescriptions/doctor-create', prescriptionData);
    return res.data;
  } catch (error) {
    throw error;
  }
};



// Get prescriptions by subUserId - Doctor view with doctor relation
export const getPrescriptionsBySubUser = async (subUserId) => {
  try {
    const res = await api.get(`/prescriptions/doctor/subuser/${subUserId}`);
    return res.data;
  } catch (error) {
    console.error("Error fetching prescriptions:", error);
    return [];
  }
};


export const quickInit = async (mobile) => {
  try {
    const res = await api.post('/prescriptions/quick-init', { mobile });
    return res.data;
  } catch (error) {
    throw error;
  }
};

export const quickSave = async (data) => {
  try {
    const res = await api.post('/prescriptions/quick-prescribe', data);
    return res.data;
  } catch (error) {
    throw error;
  }
};

// src/api/Doctor/DoctorPrescribe.js — নিচে যোগ করুন

// Get all clinics of the logged-in doctor
export const getDoctorClinics = async () => {
  try {
    const res = await api.get('/users/doctor/me/clinics'); 
    return res.data;
  } catch (error) {
    console.error('Error fetching doctor clinics:', error);
    throw error;
  }
};

// Add a new clinic
export const addDoctorClinic = async (clinicData) => {
  try {
    const res = await api.post('/users/doctor/me/clinics', clinicData);
    return res.data;
  } catch (error) {
    console.error('Error adding clinic:', error);
    throw error;
  }
};

// Update a clinic
export const updateDoctorClinic = async (clinicId, clinicData) => {
  try {
    const res = await api.patch(`/users/doctor/me/clinics/${clinicId}`, clinicData);
    return res.data;
  } catch (error) {
    console.error('Error updating clinic:', error);
    throw error;
  }
};

// Delete a clinic
export const deleteDoctorClinic = async (clinicId) => {
  try {
    const res = await api.delete(`/users/doctor/me/clinics/${clinicId}`);
    return res.data;
  } catch (error) {
    console.error('Error deleting clinic:', error);
    throw error;
  }
};