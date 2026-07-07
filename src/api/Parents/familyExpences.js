// src/api/familyExpenses.js
import api from "../base";

// === FAMILY EXPENSES API ===


export const createExpense = async (data) => {
  try {
    const res = await api.post("/family-expenses", data);
    return res.data;
  } catch (error) {
    console.error("Error creating expense:", error.response?.data || error.message);
    throw error;
  }
};


export const getAllExpenses = async () => {
  try {
    const res = await api.get("/family-expenses");
    return res.data;
  } catch (error) {
    console.error("Error fetching expenses:", error.response?.data || error.message);
    throw error;
  }
};


export const getExpenseSummary = async (month) => {
  try {
    const res = await api.get("/family-expenses/summary", {
      params: month ? { month } : {},
    });
    return res.data;
  } catch (error) {
    console.error("Error fetching expense summary:", error.response?.data || error.message);
    throw error;
  }
};


export const getExpenseById = async (id) => {
  try {
    const res = await api.get(`/family-expenses/${id}`);
    return res.data;
  } catch (error) {
    console.error("Error fetching expense:", error.response?.data || error.message);
    throw error;
  }
};


export const updateExpense = async (id, data) => {
  try {
    const res = await api.patch(`/family-expenses/${id}`, data);
    return res.data;
  } catch (error) {
    console.error("Error updating expense:", error.response?.data || error.message);
    throw error;
  }
};


export const deleteExpense = async (id) => {
  try {
    const res = await api.delete(`/family-expenses/${id}`);
    return res.data;
  } catch (error) {
    console.error("Error deleting expense:", error.response?.data || error.message);
    throw error;
  }
};