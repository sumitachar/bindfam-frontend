// src/api/ChildCare/medicines.js

import api from "../base";

// Get all medicines (optionally by prescriptionId or subUserId)
export const getMedicines = async (prescriptionId, subUserId) => {
  try {
    const params = {};
    if (prescriptionId) {
      params.prescriptionId = prescriptionId;
    }
    if (subUserId) {
      params.subUserId = subUserId;
    }
    
    const res = await api.get("/medicines", { params });
    return res.data;
  } catch (error) {
    console.error("❌ Error fetching medicines:", error);
    throw error;
  }
};

// Get medicine by ID
export const getMedicineById = async (id) => {
  try {
    const res = await api.get(`/medicines/${id}`);
    return res.data;
  } catch (error) {
    console.error("❌ Error fetching medicine by ID:", error);
    throw error;
  }
};

// Add new medicine
export const addMedicine = async (data) => {
  try {
    const res = await api.post("/medicines", data);
    return res.data;
  } catch (error) {
    console.error("❌ Error adding medicine:", error);
    throw error;
  }
};

// Update medicine
export const updateMedicine = async (id, data) => {
  try {
    const res = await api.patch(`/medicines/${id}`, data);
    return res.data;
  } catch (error) {
    console.error("❌ Error updating medicine:", error);
    throw error;
  }
};

// Delete medicine
export const deleteMedicine = async (id) => {
  try {
    const res = await api.delete(`/medicines/${id}`);
    return res.data;
  } catch (error) {
    console.error("❌ Error deleting medicine:", error);
    throw error;
  }
};