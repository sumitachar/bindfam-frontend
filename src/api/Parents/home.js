// src/api/posts.js
// Updated for infinite scroll (2 posts per page)

import api from "../base";

// ================= CREATE POST ==================
export const createPost = async (postData) => {

  const { subUserId, text, memoryDate, media = [], visibleToSubUserIds = [] } = postData;

  if (!subUserId) {
    throw new Error("subUserId is required");
  }

  const formData = new FormData();

  if (text?.trim()) {
    formData.append("text", text.trim());
  }

  if (memoryDate) {
    formData.append("memoryDate", memoryDate);
  }

  const captions = [];
  const mediaTypes = [];

  media.forEach((item) => {
    if (item.file) {
      formData.append("media", item.file);
      captions.push(item.caption?.trim() || "");
      mediaTypes.push(item.type === "video" ? "video" : "image");
    }
  });

  formData.append("captions", JSON.stringify(captions));
  formData.append("mediaTypes", JSON.stringify(mediaTypes));

  if (visibleToSubUserIds.length > 0) {
    formData.append("visibleToSubUserIds", JSON.stringify(visibleToSubUserIds));
  }

  try {
    const response = await api.post(`/posts?subUserId=${subUserId}`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
      timeout: 60000,
    });

    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || "Failed to create post. Please try again.");
  }
};

// ================= GET ALL POSTS BY SUBUSER (WITH PAGINATION) ==================
export const getPostsBySubUser = async (subUserId, filters = {}, page = 1, limit = 2) => {
  if (!subUserId) {
    throw new Error("subUserId is required");
  }

  try {
    const params = new URLSearchParams();
    params.append("page", page);
    params.append("limit", limit);

    const res = await api.get(`/posts/by-subuser/${subUserId}?${params.toString()}`);
    return res.data; // Expected: { posts: [...], hasMore: boolean }
  } catch (err) {
    throw err;
  }
};

// src/api/Parents/album.ts  (or wherever you keep API functions)

export const getAlbumMedia = async (
  subUserId, page = 1, limit = 50
) => {
  if (!subUserId) throw new Error("subUserId is required");

  const params = new URLSearchParams();
  params.append("page", page.toString());
  params.append("limit", limit.toString());

  const res = await api.get(
    `/posts/by-subuser/${subUserId}/album-media?${params.toString()}`
  );
  return res.data; // { media: [...], hasMore: boolean, total: number }
};

// ================= GET FILTERED POSTS (WITH PAGINATION) ==================
export const getPostsBySubUserFilter = async (subUserId, filters = {}, page = 1, limit = 2) => {
  if (!subUserId) {
    throw new Error("subUserId is required");
  }

  try {
    const params = new URLSearchParams();
    params.append("page", page);
    params.append("limit", limit);

    if (filters.from) params.append("from", filters.from);
    if (filters.to) params.append("to", filters.to);

    const queryString = params.toString();
    const url = `/posts/by-subuser/${subUserId}/filter${queryString ? `?${queryString}` : ""}`;

    const res = await api.get(url);
    return res.data; // Expected: { posts: [...], hasMore: boolean }
  } catch (err) {
    throw err;
  }
};

// ================= DELETE POST ==================
export const deletePost = async (postId, subUserId) => {
  try {
    const res = await api.delete(`/posts/${postId}/${subUserId}`);
    return res.data;
  } catch (err) {
    throw err;
  }
};

// ================= GET SINGLE POST (FULL MEDIA) ==================
export const getPostById = async (postId, subUserId) => {
  if (!postId || !subUserId) {
    throw new Error("postId and subUserId are required");
  }

  try {
    const res = await api.get(`/posts/${postId}?subUserId=${subUserId}`);
    return res.data;
  } catch (err) {
    console.error("Get post by id error:", err.response?.data || err.message);
    throw err;
  }
};

// src/api/stories.js (or wherever your API functions are)

// ================= Stories APIs ==================

// Create story - FULLY UPDATED FOR NEW BACKEND LOGIC
export const createStory = async (storyData) => {
  try {
    const formData = new FormData();

    const { subUserId } = storyData;
    if (!subUserId) {
      throw new Error('subUserId is required');
    }

    // Optional text
    if (storyData.text?.trim()) {
      formData.append('text', storyData.text.trim());
    }

    // Media files + captions + mediaTypes (order must match exactly!)
    if (storyData.media && storyData.media.length > 0) {
      storyData.media.forEach((item, index) => {
        // The actual File/Blob object
        formData.append('media', item.file); // ← Must be File or Blob, not URL

        // Caption for this specific media
        formData.append('captions', item.caption || '');

        // Explicit media type (critical for video thumbnail generation)
        formData.append('mediaTypes', item.type); // 'image' or 'video'
      });
    }

    // Visibility (Close Friends) - send as JSON string
    if (storyData.visibleToSubUserIds && storyData.visibleToSubUserIds.length > 0) {
      formData.append('visibleToSubUserIds', JSON.stringify(storyData.visibleToSubUserIds));
    }

    const res = await api.post(`/stories?subUserId=${subUserId}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    return res.data;
  } catch (err) {
    console.error('Create story error:', err.response?.data || err.message);
    throw new Error(err.response?.data?.message || 'Failed to create story');
  }
};

// Get active stories for a sub-user
export const getStoriesBySubUser = async (subUserId) => {
  try {
    const res = await api.get(`/stories/subuser/${subUserId}`);
    return res.data;
  } catch (err) {
    console.error('Get stories error:', err.response?.data || err.message);
    throw err;
  }
};

// Get single story by ID (with access check)
export const getStoryById = async (storyId, requestingSubUserId) => {
  try {
    const res = await api.get(`/stories/${storyId}?subUserId=${requestingSubUserId}`);
    return res.data;
  } catch (err) {
    console.error('Get story error:', err.response?.data || err.message);
    throw err;
  }
};

// Mark story as viewed
export const viewStory = async (storyId, viewerSubUserId) => {
  try {
    const res = await api.post(`/stories/view/${storyId}?viewerSubUserId=${viewerSubUserId}`);
    return res.data;
  } catch (err) {
    console.error('View story error:', err.response?.data || err.message);
    throw err;
  }
};

// Delete story - CORRECT ROUTE WITH TWO PATH PARAMS
export const deleteStory = async (storyId, subUserId) => {
  try {
    const res = await api.delete(`/stories/${storyId}/${subUserId}`);
    return res.data;
  } catch (err) {
    console.error('Delete story error:', err.response?.data || err.message);
    throw new Error(err.response?.data?.message || 'Failed to delete story');
  }
};

// Bonus: Delete multiple media from album (posts route)
export const deleteAlbumMediaItem = async (subUserId, items) => {
  if (!subUserId || !Array.isArray(items) || items.length === 0) {
    throw new Error("subUserId and media items are required");
  }

  try {
    const res = await api.delete(`/posts/media/${subUserId}`, {
      data: { items },
    });
    return res.data;
  } catch (err) {
    console.error("Delete media error:", err.response?.data || err.message);
    throw new Error(err.response?.data?.message || "Failed to delete memories");
  }
};