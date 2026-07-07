// src/api/Parents/prescriptions.js

import api from "../base";

const API_URL = import.meta.env.VITE_API_URL; // Keep for potential future use

// ========================================
// CRUD OPERATIONS (unchanged)
// ========================================
export const getPrescriptions = async (subUserId) => {
  try {
    const res = await api.get("/prescriptions/list", {
      params: subUserId ? { subUserId } : {},
    });
    return res.data;
  } catch (error) {
    console.error("Error fetching prescriptions:", error);
    throw error;
  }
};

export const getPrescriptionById = async (id) => {
  try {
    const res = await api.get(`/prescriptions/details/${id}`);
    return res.data;
  } catch (error) {
    console.error("Error fetching prescription by ID:", error);
    throw error;
  }
};

export const addPrescription = async (data) => {
  try {
    const res = await api.post("/prescriptions/create", data, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return res.data;
  } catch (error) {
    console.error("Error adding prescription:", error);
    throw error;
  }
};

export const updatePrescription = async (id, data) => {
  try {
    const res = await api.patch(`/prescriptions/update/${id}`, data, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return res.data;
  } catch (error) {
    console.error("Error updating prescription:", error);
    throw error;
  }
};

export const deletePrescription = async (id) => {
  try {
    await api.delete(`/prescriptions/delete/${id}`);
    return { success: true };
  } catch (error) {
    console.error("Error deleting prescription:", error);
    throw error;
  }
};

// ========================================
// NEW: Secure File URL via Azure (SAS)
// ========================================

/**
 * Get a temporary secure URL to view/download the prescription file
 * This triggers on-demand decryption for encrypted blobs
 * @param {number} prescriptionId - The prescription record ID
 * @returns {Promise<string>} Temporary SAS URL
 */
export const getPrescriptionSecureUrl = async (prescriptionId) => {
  if (!prescriptionId) {
    return "/images/fallback-prescription.png";
  }

  try {
    const res = await api.get(`/prescriptions/view/${prescriptionId}`);
    return res.data.url; // e.g. https://...blob.core.windows.net/...?sv=... (expires in ~10 min)
  } catch (error) {
    console.warn(`Failed to fetch secure URL for prescription ${prescriptionId}:`, error);
    return "/images/fallback-prescription.png";
  }
};

/**
 * For thumbnails/previews in cards — same as secure URL
 * You can optionally add cache busting if needed
 */
export const getPrescriptionPreviewUrl = async (prescriptionId) => {
  return await getPrescriptionSecureUrl(prescriptionId);
};

/**
 * For direct download — uses the same secure URL
 * Browser will handle download based on Content-Disposition from Azure
 */
export const getPrescriptionDownloadUrl = async (prescriptionId, fallbackFilename = "prescription") => {
  return await getPrescriptionSecureUrl(prescriptionId);
};

// Optional: Legacy fallbacks (if you still reference old paths somewhere)
export const getPrescriptionFileUrl = () => "/images/fallback-prescription.png";
export const getPrescriptionDownloadUrlLegacy = () => "/images/fallback-prescription.png";

