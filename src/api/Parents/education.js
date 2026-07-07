import api from "../base";

export const addEducationalRecord = async (data) => {
  try {
    const res = await api.post("/education", data);
    return res.data;
  } catch (error) {
    console.error("❌ Error adding educational record:", error);
    throw error;
  }
};

export const getEducationalRecords = async (subUserId) => {
  try {
    const res = await api.get(`/education/subuser/${subUserId}`);
    return res.data;
  } catch (error) {
    console.error("❌ Error fetching educational records:", error);
    throw error;
  }
};

export const getEducationalRecordById = async (id) => {
  try {
    const res = await api.get(`/education/${id}`);
    return res.data;
  } catch (error) {
    console.error("❌ Error fetching educational record by ID:", error);
    throw error;
  }
};

export const updateEducationalRecord = async (id, data) => {
  try {
    const res = await api.put(`/education/${id}`, data);
    return res.data;
  } catch (error) {
    console.error("❌ Error updating educational record:", error);
    throw error;
  }
};

export const deleteEducationalRecord = async (id) => {
  try {
    const res = await api.delete(`/education/${id}`);
    return res.data;
  } catch (error) {
    console.error("❌ Error deleting educational record:", error);
    throw error;
  }
};