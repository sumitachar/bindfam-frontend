// src/api/utilityLists.js
import api from "../base";

// === UTILITY LISTS API ===

// Create a new utility list (card)
export const createUtilityList = async (data) => {
  try {
    const res = await api.post("/utility-lists", data);
    return res.data;
  } catch (error) {
    console.error(
      "Error creating utility list:",
      error.response?.data || error.message
    );
    throw error;
  }
};

// Get all utility lists with items
export const getAllUtilityLists = async () => {
  try {
    const res = await api.get("/utility-lists");
    return res.data;
  } catch (error) {
    console.error(
      "Error fetching utility lists:",
      error.response?.data || error.message
    );
    throw error;
  }
};

// Add item to a utility list
export const addUtilityItem = async (listId, data) => {
  try {
    const res = await api.post(`/utility-lists/${listId}/items`, data);
    return res.data;
  } catch (error) {
    console.error(
      "Error adding utility item:",
      error.response?.data || error.message
    );
    throw error;
  }
};

// Toggle item checked / unchecked
export const toggleUtilityItem = async (itemId) => {
  try {
    const res = await api.patch(`/utility-lists/items/${itemId}/toggle`);
    return res.data;
  } catch (error) {
    console.error(
      "Error toggling utility item:",
      error.response?.data || error.message
    );
    throw error;
  }
};

// Reset all items in a list (unchecked)
export const resetUtilityList = async (listId) => {
  try {
    const res = await api.patch(`/utility-lists/${listId}/reset`);
    return res.data;
  } catch (error) {
    console.error(
      "Error resetting utility list:",
      error.response?.data || error.message
    );
    throw error;
  }
};

// Delete a utility list
export const deleteUtilityList = async (listId) => {
  try {
    const res = await api.delete(`/utility-lists/${listId}`);
    return res.data;
  } catch (error) {
    console.error(
      "Error deleting utility list:",
      error.response?.data || error.message
    );
    throw error;
  }
};
// Delete a single utility item
export const deleteUtilityItem = async (itemId) => {
  try {
    const res = await api.delete(`/utility-lists/items/${itemId}`);
    return res.data;
  } catch (error) {
    console.error(
      "Error deleting utility item:",
      error.response?.data || error.message
    );
    throw error;
  }
};
