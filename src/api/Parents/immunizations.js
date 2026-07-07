import api from "../base";

/* ===============================
   📌 Predefined Vaccines API
================================= */

// ✅ Get all predefined vaccines
export const getPredefinedVaccines = async () => {
  try {
    const res = await api.get("/predefined-vaccines");
    return res.data;
  } catch (error) {
    console.error("❌ Error fetching predefined vaccines:", error);
    throw error;
  }
};

// ✅ Get vaccine by ID
export const getPredefinedVaccineById = async (id) => {
  try {
    const res = await api.get(`/predefined-vaccines/${id}`);
    return res.data;
  } catch (error) {
    console.error(`❌ Error fetching predefined vaccine (ID: ${id}):`, error);
    throw error;
  }
};

// ✅ Add new predefined vaccine
export const addPredefinedVaccine = async (data) => {
  try {
    const res = await api.post("/predefined-vaccines", data);
    return res.data;
  } catch (error) {
    console.error("❌ Error adding predefined vaccine:", error);
    throw error;
  }
};

// ✅ Update predefined vaccine
export const updatePredefinedVaccine = async (id, data) => {
  try {
    const res = await api.put(`/predefined-vaccines/${id}`, data);
    return res.data;
  } catch (error) {
    console.error(`❌ Error updating predefined vaccine (ID: ${id}):`, error);
    throw error;
  }
};

// ✅ Delete predefined vaccine
export const deletePredefinedVaccine = async (id) => {
  try {
    const res = await api.delete(`/predefined-vaccines/${id}`);
    return res.data;
  } catch (error) {
    console.error(`❌ Error deleting predefined vaccine (ID: ${id}):`, error);
    throw error;
  }
};

// ✅ NEW → Get vaccines grouped by age
export const getPredefinedVaccinesGroupedByAge = async () => {
  try {
    const res = await api.get("/predefined-vaccines/grouped/by-age");
    return res.data;
  } catch (error) {
    console.error("❌ Error fetching grouped vaccines by age:", error);
    throw error;
  }
};

/* ===============================
   📌 Immunizations API
================================= */

// ✅ Add immunization record
export const addImmunization = async (data) => {
  try {
    const res = await api.post("/immunizations", data);
    return res.data;
  } catch (error) {
    console.error("❌ Error adding immunization:", error);
    throw error;
  }
};

// ✅ Get all immunizations for a child
export const getImmunizations = async (subUserId, includeRecommended = false) => {
  try {
    const res = await api.get(`/immunizations/subuser/${subUserId}`, {
      params: { includeRecommended },
    });
    return res.data;
  } catch (error) {
    console.error(`❌ Error fetching immunizations (subUserId: ${subUserId}):`, error);
    throw error;
  }
};

// ✅ Get single immunization record
export const getImmunizationById = async (id) => {
  try {
    const res = await api.get(`/immunizations/${id}`);
    return res.data;
  } catch (error) {
    console.error(`❌ Error fetching immunization by ID (ID: ${id}):`, error);
    throw error;
  }
};

// ✅ Update immunization record
export const updateImmunization = async (id, data) => {
  try {
    const res = await api.patch(`/immunizations/${id}`, data); // Changed to patch to match backend @Patch
    return res.data;
  } catch (error) {
    console.error(`❌ Error updating immunization (ID: ${id}):`, error);
    throw error;
  }
};

// ✅ Delete immunization record
export const deleteImmunization = async (id) => {
  try {
    const res = await api.delete(`/immunizations/${id}`);
    return res.data;
  } catch (error) {
    console.error(`❌ Error deleting immunization (ID: ${id}):`, error);
    throw error;
  }
};

// ✅ Get recommended vaccines (based on age + schedule)
export const getRecommendedVaccines = async (subUserId) => {
  try {
    const res = await api.get(`/immunizations/recommended/${subUserId}`);
    return res.data;
  } catch (error) {
    console.error(`❌ Error fetching recommended vaccines (subUserId: ${subUserId}):`, error);
    throw error;
  }
};