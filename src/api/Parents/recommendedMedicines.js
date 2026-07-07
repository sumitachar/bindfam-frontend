// src/api/ChildCare/recommendedMedicines.js
import api from "../base";

// Get all recommended medicines (optionally filter by name)
export const getRecommendedMedicines = async (name) => {
  try {
    const res = await api.get("/recommended-medicines", {
      params: name ? { name } : {},
    });
    return res.data;
  } catch (error) {
    console.error("❌ Error fetching recommended medicines:", error);
    throw error;
  }
};

// Get recommended medicine by ID
export const getRecommendedMedicineById = async (id) => {
  try {
    const res = await api.get(`/recommended-medicines/${id}`);
    return res.data;
  } catch (error) {
    console.error("❌ Error fetching recommended medicine:", error);
    throw error;
  }
};
