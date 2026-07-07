// src/components/StoryViewer.jsx
import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Trash2, Pause, Play } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

const StoryViewer = ({
  activeStory,
  stories,
  currentStoryIndex,
  closeStory,
  nextStory,
  prevStory,
  onDeleteStory,
  isOwner = false,
}) => {
  const [progress, setProgress] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [isVideoPlaying, setIsVideoPlaying] = useState(true);
  const [isDeleting, setIsDeleting] = useState(false);

  const intervalRef = useRef(null);
  const videoRef = useRef(null);

  const storyDuration = 7000;

  // ---------------- RESET ON STORY CHANGE ----------------
  useEffect(() => {
    setProgress(0);
    setIsPaused(false);
    setIsVideoPlaying(true);
    setIsDeleting(false);
  }, [currentStoryIndex]);

  // ---------------- PROGRESS TIMER ----------------
  useEffect(() => {
    if (!activeStory || isPaused) {
      if (intervalRef.current) clearInterval(intervalRef.current);
      return;
    }

    intervalRef.current = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(intervalRef.current);
          setTimeout(nextStory, 200);
          return 0;
        }
        return prev + 100 / (storyDuration / 100);
      });
    }, 100);

    return () => clearInterval(intervalRef.current);
  }, [activeStory, isPaused, nextStory]);

  // ---------------- VIDEO CONTROL ----------------
  useEffect(() => {
    if (!videoRef.current || activeStory?.type !== "video") return;

    if (!isPaused && isVideoPlaying) {
      videoRef.current.play().catch(() => {});
    } else {
      videoRef.current.pause();
    }

    videoRef.current.onended = () => {
      clearInterval(intervalRef.current);
      setTimeout(nextStory, 200);
    };

    return () => {
      if (videoRef.current) {
        videoRef.current.onended = null;
        videoRef.current.pause();
      }
    };
  }, [activeStory, isPaused, isVideoPlaying, nextStory]);

  const handleHold = () => {
    setIsPaused(true);
    setIsVideoPlaying(false);
  };

  const handleRelease = () => {
    setIsPaused(false);
    setIsVideoPlaying(true);
  };

  // ---------------- GUARD ----------------
  if (!activeStory || !activeStory.raw) return null;

  const storyData = activeStory.raw;
  const firstMedia = storyData.media?.[0];
  if (!firstMedia) return null;

  const getFullMediaUrl = (path) => {
    if (!path) return "";
    const cleanPath = path.startsWith("/") ? path.slice(1) : path;
    return `${import.meta.env.VITE_API_URL}/${cleanPath}`;
  };

  const mediaUrl = getFullMediaUrl(firstMedia.mediaUrl);
  const thumbnailUrl = getFullMediaUrl(firstMedia.thumbnailUrl);
  const isVideo = activeStory.type === "video";

  const timeAgo = storyData.createdAt
    ? formatDistanceToNow(new Date(storyData.createdAt), { addSuffix: true })
    : "just now";

  // ---------------- DELETE HANDLER (FIXED) ----------------
  const handleDelete = async (e) => {
    e.preventDefault();
    e.stopPropagation();


    if (!window.confirm("Delete this story? This action cannot be undone.")) {
      return;
    }

    setIsDeleting(true);

    try {
      await onDeleteStory(activeStory.id);
    } catch (err) {
      console.error("Delete failed:", err);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <AnimatePresence>
      {activeStory && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 bg-black flex flex-col"
          onMouseDown={handleHold}
          onMouseUp={handleRelease}
          onMouseLeave={handleRelease}
          onTouchStart={handleHold}
          onTouchEnd={handleRelease}
        >
          {/* ---------------- PROGRESS BARS ---------------- */}
          <div className="absolute top-3 left-3 right-3 flex gap-1 z-50">
            {stories.map((_, i) => (
              <div
                key={i}
                className="flex-1 h-1 bg-white/30 rounded-full overflow-hidden"
              >
                <motion.div
                  className="h-full bg-white"
                  animate={{
                    width:
                      i < currentStoryIndex
                        ? "100%"
                        : i === currentStoryIndex
                        ? `${progress}%`
                        : "0%",
                  }}
                  transition={{ duration: 0.1, ease: "linear" }}
                />
              </div>
            ))}
          </div>

          {/* ---------------- HEADER (Z-INDEX FIX) ---------------- */}
          <div
            className="absolute top-14 left-4 right-4 z-[100] flex items-center justify-between"
            onMouseDown={(e) => e.stopPropagation()}
            onTouchStart={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full ring-4 ring-white overflow-hidden">
                <img
                  src={activeStory.image}
                  alt={activeStory.username}
                  className="w-full h-full object-cover"
                />
              </div>
              <div>
                <p className="text-white font-semibold">{activeStory.username}</p>
                <p className="text-white/70 text-sm">{timeAgo}</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              {isOwner && (
                <button
                  type="button"
                  onClick={handleDelete}
                  onMouseDown={(e) => e.stopPropagation()}
                  onTouchStart={(e) => e.stopPropagation()}
                  disabled={isDeleting}
                  className="z-[110] pointer-events-auto
                             text-white p-3 bg-red-600 rounded-full
                             hover:bg-red-700 disabled:opacity-50"
                >
                  {isDeleting ? (
                    <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <Trash2 className="w-6 h-6" />
                  )}
                </button>
              )}

              <button
                onClick={closeStory}
                className="text-white p-3 bg-white/20 rounded-full"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
          </div>

          {/* ---------------- MEDIA ---------------- */}
          <div className="flex-1 flex items-center justify-center px-4 py-8">
            {isVideo ? (
              <div className="relative">
                <video
                  ref={videoRef}
                  src={mediaUrl}
                  poster={thumbnailUrl}
                  className="max-h-[85vh] rounded-2xl object-contain"
                  playsInline
                />
                {isPaused && (
                  <div className="absolute inset-0  flex items-center justify-center bg-black/50">
                    <Play className="w-20 h-20 text-white" />
                  </div>
                )}
              </div>
            ) : (
              <img
                src={mediaUrl}
                className="max-h-[85vh] rounded-2xl object-contain"
                alt="story"
              />
            )}
          </div>

          {/* ---------------- NAVIGATION AREAS ---------------- */}
          {stories.length > 1 && (
            <>
              <button
                className="absolute left-0 top-0 bottom-0 w-1/3 z-40"
                onClick={(e) => {
                  e.stopPropagation();
                  prevStory();
                }}
              />
              <button
                className="absolute right-0 top-0 bottom-0 w-1/3 z-40"
                onClick={(e) => {
                  e.stopPropagation();
                  nextStory();
                }}
              />
            </>
          )}

          {/* ---------------- PAUSE INDICATOR ---------------- */}
          {isPaused && (
            <div className="absolute bottom-10 left-1/2 -translate-x-1/2 z-50">
              <Pause className="w-8 h-8 text-white" />
            </div>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default StoryViewer;
