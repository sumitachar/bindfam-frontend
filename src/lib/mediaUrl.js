// src/lib/mediaUrl.js

const API_BASE_URL =
  import.meta.env.VITE_API_URL?.replace(/\/$/, "") || "";

export function getMediaUrl(url) {
  if (!url) return "";

  // Already absolute (http / https)
  if (url.startsWith("http://") || url.startsWith("https://")) {
    return url;
  }

  // Ensure leading slash
  const safePath = url.startsWith("/") ? url : `/${url}`;

  return `${API_BASE_URL}${safePath}`;
}
// src/lib/mediaUrl.js
export const PLACEHOLDER_IMAGE = "https://placehold.co/150x150";



export function getSafeMediaSrc(media) {
  if (!media) return PLACEHOLDER_IMAGE;

  // string হলে ধরে নাও already URL
  if (typeof media === "string") {
    return getMediaUrl(media);
  }

  // image → full URL বানাও
  if (media.mediaType === "image") {
    return media.mediaUrl
      ? getMediaUrl(media.mediaUrl)
      : PLACEHOLDER_IMAGE;
  }

  // video → thumbnail only
  if (media.mediaType === "video") {
    return media.thumbnailUrl
      ? getMediaUrl(media.thumbnailUrl)
      : PLACEHOLDER_IMAGE;
  }

  return PLACEHOLDER_IMAGE;
}



export function getVideoThumbnail(media) {
  if (!media || media.mediaType !== "video") return PLACEHOLDER_IMAGE;
  if (media.thumbnailUrl) return getMediaUrl(media.thumbnailUrl);
  return PLACEHOLDER_IMAGE;
}

export function getPlayableVideoUrl(media) {
  if (!media || !media.mediaUrl) return "";
  if (media.mediaUrl.startsWith("http://") || media.mediaUrl.startsWith("https://")) return media.mediaUrl;
  return getMediaUrl(media.mediaUrl);
}

