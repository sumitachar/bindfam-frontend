import api from "../base";

/**
 * Create or get conversation between doctor and subUser
 */
export const getOrCreateConversation = async (data) => {
  try {
    const res = await api.post("/chat/conversation", data);
    return res.data;
  } catch (error) {
    console.error("Error creating/fetching conversation:", error);
    throw error;
  }
};

/**
 * Get conversation by doctor + subUser
 */
export const getConversation = async (doctorId, subUserId) => {
  try {
    const res = await api.get(
      `/chat/conversation/${doctorId}/${subUserId}`
    );
    return res.data;
  } catch (error) {
    console.error("Error fetching conversation:", error);
    throw error;
  }
};

/**
 * Get all conversations for Doctor
 */
export const getDoctorConversations = async (doctorId) => {
  try {
    const res = await api.get(`/chat/doctor/${doctorId}`);
    return res.data;
  } catch (error) {
    console.error("Error fetching doctor conversations:", error);
    throw error;
  }
};


/**
 * Clear (delete) all messages in a conversation
 */
export const clearConversationMessages = async (conversationId) => {
  try {
    const res = await api.delete(`/chat/messages/${conversationId}`);
    return res.data;
  } catch (error) {
    console.error("Error clearing messages:", error);
    throw error;
  }
};

/**
 * Get all conversations for SubUser
 */
export const getSubUserConversations = async (subUserId) => {
  try {
    const res = await api.get(`/chat/subuser/${subUserId}`);
    return res.data;
  } catch (error) {
    console.error("Error fetching subUser conversations:", error);
    throw error;
  }
};

/**
 * Send Message
 */
export const sendMessage = async (data) => {
  try {
    const res = await api.post("/chat/message", data);
    return res.data;
  } catch (error) {
    console.error("Error sending message:", error);
    throw error;
  }
};

/**
 * Get Messages by Conversation ID
 */
export const getMessages = async (conversationId) => {
  try {
    const res = await api.get(`/chat/messages/${conversationId}`);
    return res.data;
  } catch (error) {
    console.error("Error fetching messages:", error);
    throw error;
  }
};
