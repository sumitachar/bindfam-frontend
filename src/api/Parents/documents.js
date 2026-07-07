// src/api/Parents/documents.ts

import api from "../base";

export const addDocument = async (data) => {
  try {
    const res = await api.post("/documents", data, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return res.data;
  } catch (error) {
    console.error("Error adding document:", error);
    throw error;
  }
};

export const getDocuments = async (subUserId) => {
  try {
    const res = await api.get(`/documents/subuser/${subUserId}`);
    return res.data;
  } catch (error) {
    console.error("Error fetching documents:", error);
    throw error;
  }
};

export const getDocumentById = async (id) => {
  try {
    const res = await api.get(`/documents/${id}`);
    return res.data;
  } catch (error) {
    console.error("Error fetching document by ID:", error);
    throw error;
  }
};

export const updateDocument = async (id, data) => {
  try {
    const res = await api.put(`/documents/${id}`, data, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return res.data;
  } catch (error) {
    console.error("Error updating document:", error);
    throw error;
  }
};

export const deleteDocument = async (id) => {

  try {
    const res = await api.delete(`/documents/${id}`);
    return res.data; 
  } catch (error) {
    console.error("Error deleting document:", error);
    throw error;
  }
};

export const getDocumentViewUrl = (documentId) => {
  const baseUrl = import.meta.env.VITE_API_URL || "http://localhost:5000";
  return `${baseUrl}/documents/view/${documentId}`;
};