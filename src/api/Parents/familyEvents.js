// src/api/familyEvents.js
import api from "../base";

// === FAMILY EVENTS ===
export const createEvent = async (data) => {
  try {
    const res = await api.post("/family-events", data);
    return res.data;
  } catch (error) {
    console.error("Error creating event:", error.response?.data || error);
    throw error;
  }
};

export const getAllEvents = async () => {
  try {
    const res = await api.get("/family-events");
    return res.data;
  } catch (error) {
    console.error("Error fetching events:", error.response?.data || error);
    throw error;
  }
};

export const getEventsByDate = async (date) => {
  try {
    const res = await api.get(`/family-events/date/${date}`);
    return res.data;
  } catch (error) {
    console.error("Error fetching events by date:", error.response?.data || error);
    throw error;
  }
};

export const getUpcomingEvents = async (days = 7) => {
  try {
    const res = await api.get(`/family-events/upcoming?days=${days}`);
    return res.data;
  } catch (error) {
    console.error("Error fetching upcoming events:", error.response?.data || error);
    throw error;
  }
};

export const getSpecialDates = async () => {
  try {
    const res = await api.get("/family-events/special-dates");
    return res.data;
  } catch (error) {
    console.error("Error fetching special dates:", error.response?.data || error);
    throw error;
  }
};

export const suggestBestTime = async (date, duration, members) => {
  try {
    const res = await api.get(
      `/family-events/suggest-time?date=${date}&duration=${duration}&members=${members}`
    );
    return res.data;
  } catch (error) {
    console.error("Error suggesting time:", error.response?.data || error);
    throw error;
  }
};

export const respondToRSVP = async (eventId, rsvpData) => {
  try {
    const res = await api.post(`/family-events/${eventId}/rsvp`, rsvpData);
    return res.data;
  } catch (error) {
    console.error("Error responding to RSVP:", error.response?.data || error);
    throw error;
  }
};

export const deleteEvent = async (id) => {
  try {
    const res = await api.delete(`/family-events/${id}`);
    return res.data;
  } catch (error) {
    console.error("Error deleting event:", error.response?.data || error);
    throw error;
  }
};

// === CONNECTED PARENTS ===
export const getConnectedParents = async () => {
  try {
    const res = await api.get("/sub-users/family/connections");
    return res.data; 
  } catch (error) {
    console.error("Error fetching connected parents:", error.response?.data || error);
    return [];
  }
};

export const updateEvent = async (id, data) => {
  try {
    const res = await api.patch(`/family-events/${id}`, data);
    return res.data;
  } catch (error) {
    console.error("Error updating event:", error.response?.data || error);
    throw error;
  }
};