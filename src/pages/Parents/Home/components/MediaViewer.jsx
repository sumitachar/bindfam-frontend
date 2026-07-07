// src/components/MediaViewer.jsx
import React, { useRef, useState, useEffect } from "react";
import { motion } from "framer-motion";
import { X, Play } from "lucide-react";
import { getMediaUrl } from "@/lib/mediaUrl";

const MediaViewer = ({
  activePostMedia,
  currentMediaIndex,
  closeMediaViewer,
  nextMedia,
  prevMedia,
  openShareDialog,
}) => {
  // ------------------ HOOKS (ALWAYS TOP) ------------------
  const touchStartX = useRef(0);
  const [isLoading, setIsLoading] = useState(true);

  // ------------------ SAFE DATA ------------------
  const mediaList = activePostMedia?.media || [];
  const hasMedia = mediaList.length > 0;
  const currentMedia = mediaList[currentMediaIndex];

  const resolvedType = currentMedia?.mediaType || currentMedia?.type;

  const mediaSrc = getMediaUrl(currentMedia?.src || currentMedia?.mediaUrl);
  const userImageSrc = getMediaUrl(activePostMedia?.userImage);

  // ------------------ EFFECTS ------------------
  useEffect(() => {
    if (!mediaSrc) return;
    setIsLoading(true);
  }, [mediaSrc, currentMediaIndex]);

  // 🛡️ loader safety (never stuck)
  useEffect(() => {
    if (!mediaSrc) return;

    const timeout = setTimeout(() => {
      setIsLoading(false);
    }, 6000);

    return () => clearTimeout(timeout);
  }, [mediaSrc]);

  // ------------------ TOUCH ------------------
  const handleTouchStart = (e) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = (e) => {
    const diff = touchStartX.current - e.changedTouches[0].clientX;

    if (Math.abs(diff) > 50) {
      if (diff > 0 && currentMediaIndex < mediaList.length - 1) {
        nextMedia();
      }
      if (diff < 0 && currentMediaIndex > 0) {
        prevMedia();
      }
    }
  };

  // ------------------ FINAL GUARD (SAFE) ------------------
  if (!activePostMedia || !hasMedia) return null;

  // ------------------ RENDER ------------------
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 bg-black/95 flex"
      onClick={closeMediaViewer}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      <div
        className="relative w-full h-full flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* ================= HEADER ================= */}
        <div className="absolute top-0 left-0 right-0 z-40 p-4 flex justify-between bg-black/70">
          <div className="flex gap-3 text-white">
            <img
              src={userImageSrc || "/placeholder.png"}
              className="w-10 h-10 rounded-full object-cover"
              onError={(e) => {
                e.currentTarget.src = "/placeholder.png";
              }}
            />
            <div>
              <p className="font-semibold">
                {activePostMedia.childName || activePostMedia.username}
              </p>
              <p className="text-xs">{activePostMedia.time}</p>
            </div>
          </div>

          <button
            onClick={(e) => {
              e.stopPropagation();
              closeMediaViewer();
            }}
          >
            <X className="text-white" />
          </button>
        </div>

        {/* ================= PROGRESS ================= */}
        {mediaList.length > 1 && (
          <div className="absolute top-16 left-4 right-4 z-30 flex gap-1">
            {mediaList.map((_, i) => (
              <div
                key={i}
                className="flex-1 h-1 bg-white/30 rounded-full overflow-hidden"
              >
                <motion.div
                  className="h-full bg-white"
                  initial={{ width: i < currentMediaIndex ? "100%" : "0%" }}
                  animate={{
                    width: i <= currentMediaIndex ? "100%" : "0%",
                  }}
                  transition={{ duration: 0.3 }}
                />
              </div>
            ))}
          </div>
        )}

        {/* ================= MEDIA ================= */}
        <div className="flex-1 flex items-center justify-center relative overflow-hidden">
          {isLoading && (
            <div className="absolute z-20">
              <div className="w-12 h-12 border-4 border-white border-t-transparent rounded-full animate-spin" />
            </div>
          )}

          {resolvedType === "image" && (
            <img
              src={mediaSrc}
              className="max-w-[95vw] max-h-[85vh] object-contain rounded-lg"
              onLoad={() => setIsLoading(false)}
              onError={() => setIsLoading(false)}
            />
          )}

          {resolvedType === "video" && (
            <video
              src={mediaSrc}
              controls
              autoPlay
              playsInline
              className="max-w-[95vw] max-h-[85vh] object-contain rounded-lg bg-black"
              onLoadedData={() => setIsLoading(false)}
            />
          )}
        </div>

        {/* ================= NAV ================= */}
        {mediaList.length > 1 && (
          <>
            {currentMediaIndex > 0 && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  prevMedia();
                }}
                className="absolute left-4 top-1/2 text-white text-4xl select-none"
              >
                ‹
              </button>
            )}

            {currentMediaIndex < mediaList.length - 1 && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  nextMedia();
                }}
                className="absolute right-4 top-1/2 text-white text-4xl select-none"
              >
                ›
              </button>
            )}
          </>
        )}
      </div>
    </motion.div>
  );
};

export default MediaViewer;
