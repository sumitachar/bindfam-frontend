import api from "../base";

export const addGrowthRecord = async (data) => {
  try {
    const res = await api.post("/growth", data);
    return res.data;
  } catch (error) {
    console.error("❌ Error adding growth record:", error);
    throw error;
  }
};

export const getGrowthRecords = async (subUserId) => {
  try {
    const res = await api.get(`/growth/subuser/${subUserId}`);
    return res.data;
  } catch (error) {
    console.error("❌ Error fetching growth records:", error);
    throw error;
  }
};

export const getGrowthRecordById = async (id) => {
  try {
    const res = await api.get(`/growth/${id}`);
    return res.data;
  } catch (error) {
    console.error("❌ Error fetching growth record by ID:", error);
    throw error;
  }
};

export const updateGrowthRecord = async (id, data) => {
  try {
    const res = await api.put(`/growth/${id}`, data);
    return res.data;
  } catch (error) {
    console.error("❌ Error updating growth record:", error);
    throw error;
  }
};

export const deleteGrowthRecord = async (id) => {
  try {
    const res = await api.delete(`/growth/${id}`);
    return res.data;
  } catch (error) {
    console.error("❌ Error deleting growth record:", error);
    throw error;
  }
};