// src/api/Parents/medical-reports.js

import api from "../base";

export const addMedicalReport = async (data) => {
  try {
    const res = await api.post("/medical-reports", data, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return res.data;
  } catch (error) {
    console.error("Error adding medical report:", error);
    throw error;
  }
};

export const getMedicalReports = async (subUserId) => {
  try {
    const res = await api.get(`/medical-reports/subuser/${subUserId}`);
    return res.data;
  } catch (error) {
    console.error("Error fetching medical reports:", error);
    throw error;
  }
};

export const getMedicalReportById = async (id) => {
  try {
    const res = await api.get(`/medical-reports/${id}`);
    return res.data;
  } catch (error) {
    console.error("Error fetching medical report by ID:", error);
    throw error;
  }
};

export const updateMedicalReport = async (id, data) => {
  try {
    const res = await api.put(`/medical-reports/${id}`, data, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return res.data;
  } catch (error) {
    console.error("Error updating medical report:", error);
    throw error;
  }
};

export const deleteMedicalReport = async (id) => {
  try {
    const res = await api.delete(`/medical-reports/${id}`);
    return res.data;
  } catch (error) {
    console.error("Error deleting medical report:", error);
    throw error;
  }
};

// Direct URL for viewing (SAS URL from backend)
export const getMedicalReportViewUrl = (reportId) => {
  const baseUrl = import.meta.env.VITE_API_URL || "http://localhost:5000";
  return `${baseUrl}/medical-reports/view/${reportId}`;
};