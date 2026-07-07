// src/components/PostCreation.jsx
import React, { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Image,
  Video,
  X,
  Send,
  Calendar,
  Play,
  User as UserIcon,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";

const PostCreation = ({
  profileImageUrl,
  userName,
  imageError,
  handleImageError,
  onCreateMemory,
  isReadOnly,
}) => {
  const [postText, setPostText] = useState("");
  const [memoryDate, setMemoryDate] = useState(null);
  const [mediaPreviews, setMediaPreviews] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showMediaLimitModal, setShowMediaLimitModal] = useState(false);
  const [oversizeFileName, setOversizeFileName] = useState("");
  const [oversizeFileType, setOversizeFileType] = useState("");

  // Gallery carousel states
  const [showGallery, setShowGallery] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);

  const fileInputRef = useRef(null);
  const videoInputRef = useRef(null);
  const carouselRef = useRef(null);

  const openGalleryAtIndex = (index) => {
    setCurrentIndex(index);
    setShowGallery(true);
  };

  useEffect(() => {
    if (showGallery && carouselRef.current && mediaPreviews.length > 0) {
      const itemWidth = carouselRef.current.offsetWidth;
      carouselRef.current.scrollTo({
        left: currentIndex * itemWidth,
        behavior: "smooth",
      });
    }
  }, [currentIndex, showGallery, mediaPreviews.length]);

  // --------------------- HANDLE MEDIA SELECT ---------------------
  const handleMediaSelect = (e, type) => {
    const files = Array.from(e.target.files);
    if (!files || files.length === 0) return;

    if (mediaPreviews.length + files.length > 10) {
      setShowMediaLimitModal(true);
      e.target.value = "";
      return;
    }

    const filteredFiles = files.filter((file) => {
      if (type === "image" && file.size > 10 * 1024 * 1024) {
        setOversizeFileName(file.name);
        setOversizeFileType("image");
        setShowMediaLimitModal(true);
        return false;
      }
      if (type === "video" && file.size > 200 * 1024 * 1024) {
        setOversizeFileName(file.name);
        setOversizeFileType("video");
        setShowMediaLimitModal(true);
        return false;
      }
      return true;
    });

    const newPreviews = filteredFiles.map((file) => ({
      src: URL.createObjectURL(file),
      type,
      file,
      caption: "",
    }));

    setMediaPreviews((prev) => [...prev, ...newPreviews]);
    e.target.value = "";
  };

  // --------------------- REMOVE SINGLE MEDIA ---------------------
  const handleRemoveMedia = (index) => {
    URL.revokeObjectURL(mediaPreviews[index].src);
    const newPreviews = mediaPreviews.filter((_, i) => i !== index);
    setMediaPreviews(newPreviews);

    if (newPreviews.length === 0) {
      setShowGallery(false);
    } else if (currentIndex >= newPreviews.length) {
      setCurrentIndex(newPreviews.length - 1);
    }
  };

  // --------------------- CAPTION CHANGE ---------------------
  const handleCaptionChange = (index, caption) => {
    setMediaPreviews((prev) =>
      prev.map((m, i) => (i === index ? { ...m, caption } : m)),
    );
  };

  // --------------------- SUBMIT POST ---------------------
  const handleSubmit = async () => {
    if (isSubmitting) return;
    if (!postText.trim() && mediaPreviews.length === 0) return;

    setIsSubmitting(true);
    try {
      const memoryData = {
        text: postText.trim(),
        memoryDate: memoryDate ? memoryDate.toISOString().split("T")[0] : "",
        media: mediaPreviews.map((m) => ({
          file: m.file,
          type: m.type,
          caption: m.caption.trim(),
        })),
      };
      await onCreateMemory(memoryData);

      mediaPreviews.forEach((m) => URL.revokeObjectURL(m.src));
      setPostText("");
      setMemoryDate(null);
      setMediaPreviews([]);
    } catch (err) {
      console.error("Failed to create memory:", err);
      setShowMediaLimitModal(true);
    } finally {
      setIsSubmitting(false);
    }
  };

  const hasContent = postText.trim() || mediaPreviews.length > 0;

  // --------------------- MEDIA GRID RENDER ---------------------
  const renderMediaGrid = () => {
    const count = mediaPreviews.length;
    if (count === 0) return null;

    let gridClass = "grid-cols-1";
    if (count === 2) gridClass = "grid-cols-2";
    if (count >= 3) gridClass = "grid-cols-2 sm:grid-cols-3";

    const visiblePreviews = mediaPreviews.slice(0, 4);
    const hasMore = count > 4;

    return (
      <div className="mb-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-bold text-primary tracking-tight uppercase">
            Media Library ({count}/10)
          </span>
          <button
            onClick={() => {
              mediaPreviews.forEach((m) => URL.revokeObjectURL(m.src));
              setMediaPreviews([]);
            }}
            className="text-[10px] font-bold text-primary/60 hover:text-red-500 transition-colors uppercase"
          >
            Clear All
          </button>
        </div>

        <div
          className={`grid gap-2 rounded-2xl overflow-hidden ${gridClass} cursor-pointer`}
          onClick={() => openGalleryAtIndex(0)}
        >
          {visiblePreviews.map((media, index) => {
            const isLastVisible = index === 3 && hasMore;

            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className={`relative group bg-input overflow-hidden aspect-square ${
                  count === 1 ? "aspect-video sm:aspect-[21/9]" : ""
                }`}
                onClick={(e) => {
                  e.stopPropagation();
                  openGalleryAtIndex(index);
                }}
              >
                {media.type === "image" ? (
                  <img
                    src={media.src}
                    alt={`Preview ${index + 1}`}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                  />
                ) : (
                  <div className="w-full h-full relative">
                    <video
                      src={media.src}
                      className="w-full h-full object-cover"
                      muted
                    />
                    <div className="absolute inset-0 flex items-center justify-center bg-black/10">
                      <Play className="w-8 h-8 text-white fill-white/20" />
                    </div>
                  </div>
                )}

                <div className="absolute inset-x-0 bottom-0 p-2 bg-gradient-to-t from-black/60 to-transparent translate-y-4 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300">
                  <input
                    type="text"
                    placeholder="Add caption..."
                    className="w-full text-[10px] px-2 py-1.5 rounded-lg bg-white/20 backdrop-blur-md border border-white/30 text-white placeholder-white/70 outline-none focus:ring-1 focus:ring-white/50"
                    value={media.caption}
                    onChange={(e) => {
                      e.stopPropagation();
                      handleCaptionChange(index, e.target.value);
                    }}
                    onClick={(e) => e.stopPropagation()}
                  />
                </div>

                <motion.button
                  whileTap={{ scale: 0.9 }}
                  className="absolute top-2 right-2 bg-white/90 text-primary rounded-full p-1.5 shadow-lg opacity-0 group-hover:opacity-100 transition-opacity z-10 hover:bg-red-500 hover:text-white"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleRemoveMedia(index);
                  }}
                >
                  <X className="w-3 h-3" />
                </motion.button>

                {isLastVisible && (
                  <div className="absolute inset-0 bg-black/50 backdrop-blur-[3px] flex items-center justify-center pointer-events-none">
                    <p className="text-white text-xl font-black">
                      +{count - 3}
                    </p>
                  </div>
                )}
              </motion.div>
            );
          })}
        </div>

        <p className="text-[9px] text-slate-400 text-center mt-2">
          Tap any media to view full gallery • {count} item
          {count > 1 ? "s" : ""}
        </p>
      </div>
    );
  };

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="glass-card rounded-2xl shadow-soft border border-primary p-3 mb-4" // Reduced padding from p-4 to p-3
      >
        <div>
          {/* Profile Header - More Compact */}
          <div className="flex items-center space-x-3 mb-3">
            <div className="w-8 h-8 rounded-full bg-input flex items-center justify-center overflow-hidden flex-shrink-0 border border-primary shadow-sm">
              {profileImageUrl && !imageError ? (
                <img
                  src={profileImageUrl}
                  alt={userName}
                  onError={handleImageError}
                  className="w-full h-full object-cover"
                />
              ) : (
                <UserIcon className="w-4 h-4 text-primary" />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[10px] font-bold text-primary uppercase tracking-widest truncate">
                {userName || "User"}
              </p>
            </div>
          </div>

          {/* Text Input - Reduced min-height */}
          <div className="mb-2">
            <textarea
              placeholder="What's a memory you want to keep forever?"
              value={postText}
              onChange={(e) => setPostText(e.target.value)}
              className="w-full bg-transparent border-none text-sm focus:ring-0 placeholder:text-slate-400 resize-none min-h-[40px]"
            />
          </div>

          {/* Media Grid */}
          {renderMediaGrid()}

          {/* RESPONSIVE FOOTER - Compact & Combined */}
          <div className="flex flex-wrap items-center justify-between gap-2 pt-3 border-t border-primary/10">
            {/* Media & Date Section */}
            <div className="flex items-center gap-2">
              {/* Photo Button */}
              <button
                onClick={() => fileInputRef.current?.click()}
                className="p-2 rounded-full bg-primary/5 text-primary hover:bg-primary/10 transition-colors border border-primary/10"
              >
                <Image className="w-4 h-4" />
              </button>

              {/* Video Button */}
              <button
                onClick={() => videoInputRef.current?.click()}
                className="p-2 rounded-full bg-primary/5 text-primary hover:bg-primary/10 transition-colors border border-primary/10"
              >
                <Video className="w-4 h-4" />
              </button>

              {/* COMPACT DATE SELECTOR PILL */}
              <div
                className="relative group cursor-pointer"
                /* This ensures clicking anywhere on the div triggers the hidden input */
                onClick={() =>
                  document.getElementById("memory-date-input").showPicker()
                }
              >
                <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-primary/5 border border-primary/20 text-primary group-hover:bg-primary/10 transition-colors">
                  <Calendar className="w-3.5 h-3.5" />
                  <span className="text-[10px] font-bold uppercase whitespace-nowrap">
                    {memoryDate
                      ? memoryDate.toLocaleDateString(undefined, {
                          month: "short",
                          day: "numeric",
                        })
                      : "Date"}
                  </span>
                </div>

                <input
                  id="memory-date-input"
                  type="date"
                  value={
                    memoryDate ? memoryDate.toISOString().split("T")[0] : ""
                  }
                  max={new Date().toISOString().split("T")[0]}
                  onChange={(e) => {
                    const selected = new Date(e.target.value);
                    if (!isNaN(selected)) setMemoryDate(selected);
                  }}
                  /* We keep the input here but hide it completely; the onClick above handles the trigger */
                  className="absolute inset-0 w-full h-full opacity-0 pointer-events-none"
                />
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-3 ml-auto">
              {hasContent && (
                <button
                  onClick={() => {
                    setMediaPreviews([]);
                    setPostText("");
                    setMemoryDate(null);
                  }}
                  className="text-[10px] font-bold uppercase text-slate-400 hover:text-red-500"
                >
                  Discard
                </button>
              )}

              <Button
                onClick={handleSubmit}
                disabled={!hasContent || isSubmitting}
                className="button-primary rounded-full px-4 h-9 shadow-md disabled:opacity-50"
              >
                <span className="text-xs font-bold uppercase tracking-wider">
                  {isSubmitting ? "..." : "Save"}
                </span>
                {!isSubmitting && <Send className="ml-2 w-3.5 h-3.5" />}
              </Button>
            </div>
          </div>

          {/* Hidden Inputs remain the same */}
          <input
            type="file"
            ref={fileInputRef}
            accept="image/*"
            multiple
            className="hidden"
            onChange={(e) => handleMediaSelect(e, "image")}
          />
          <input
            type="file"
            ref={videoInputRef}
            accept="video/*"
            multiple
            className="hidden"
            onChange={(e) => handleMediaSelect(e, "video")}
          />
        </div>
      </motion.div>

      {/* Media Limit Modal */}
      <Dialog open={showMediaLimitModal} onOpenChange={setShowMediaLimitModal}>
        <DialogContent className="sm:max-w-md glass-card p-8 rounded-3xl border-primary/30">
          <div className="flex flex-col items-center text-center">
            <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mb-4">
              <X className="w-8 h-8 text-red-500" />
            </div>
            <DialogTitle className="text-xl font-black text-primary uppercase">
              {oversizeFileName ? "File Too Large" : "Limit Reached"}
            </DialogTitle>
            <DialogDescription className="mt-4 text-sm font-medium text-slate-500 leading-relaxed px-4">
              {oversizeFileName
                ? `"${oversizeFileName}" exceeds the ${oversizeFileType === "image" ? "10MB" : "200MB"} limit.`
                : "Maximum 10 media items per memory."}
            </DialogDescription>
            <Button
              className="button-primary w-full mt-8 py-6 rounded-2xl text-base"
              onClick={() => {
                setShowMediaLimitModal(false);
                setOversizeFileName("");
                setOversizeFileType("");
              }}
            >
              Got it
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* FULL SCREEN CAROUSEL GALLERY */}
      <Dialog open={showGallery} onOpenChange={setShowGallery}>
        <DialogContent className="max-w-full w-screen h-screen p-0 bg-black rounded-none overflow-hidden border-none">
          <DialogTitle className="sr-only">Media Gallery</DialogTitle>
          <div className="relative w-full h-full group">
            {/* Header Info */}
            <div className="absolute top-0 left-0 right-0 z-[60] p-4 sm:p-6 flex justify-between items-start pointer-events-none">
              <div className="bg-black/70 backdrop-blur-lg rounded-2xl px-4 py-2 pointer-events-auto">
                <h3 className="text-white font-bold text-sm">Media Gallery</h3>
                <p className="text-white/60 text-[10px] font-medium">
                  {mediaPreviews.length > 0
                    ? `${currentIndex + 1} of ${mediaPreviews.length}`
                    : "No items"}
                </p>
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="rounded-full bg-white/10 hover:bg-white/20 text-white backdrop-blur-md pointer-events-auto"
                onClick={() => setShowGallery(false)}
              >
                <X className="w-5 h-5" />
              </Button>
            </div>

            {/* NAVIGATION BUTTONS (Visible on Hover / Desktop) */}
            {mediaPreviews.length > 1 && (
              <>
                <button
                  className="absolute left-4 top-1/2 -translate-y-1/2 z-[60] p-3 rounded-full bg-black/40 hover:bg-black/60 text-white backdrop-blur-md transition-all opacity-0 group-hover:opacity-100 hidden md:flex items-center justify-center"
                  onClick={() => {
                    const prevIndex = currentIndex - 1;
                    if (prevIndex >= 0) {
                      carouselRef.current.scrollTo({
                        left: prevIndex * carouselRef.current.clientWidth,
                        behavior: "smooth",
                      });
                    }
                  }}
                >
                  <ChevronLeft className="w-8 h-8" />
                </button>

                <button
                  className="absolute right-4 top-1/2 -translate-y-1/2 z-[60] p-3 rounded-full bg-black/40 hover:bg-black/60 text-white backdrop-blur-md transition-all opacity-0 group-hover:opacity-100 hidden md:flex items-center justify-center"
                  onClick={() => {
                    const nextIndex = currentIndex + 1;
                    if (nextIndex < mediaPreviews.length) {
                      carouselRef.current.scrollTo({
                        left: nextIndex * carouselRef.current.clientWidth,
                        behavior: "smooth",
                      });
                    }
                  }}
                >
                  <ChevronRight className="w-8 h-8" />
                </button>
              </>
            )}

            {/* Main Swipeable Carousel Area */}
            <div
              ref={carouselRef}
              className="w-full h-full flex snap-x snap-mandatory overflow-x-auto scrollbar-none"
              style={{ scrollSnapType: "x mandatory" }}
              onScroll={(e) => {
                const scrollLeft = e.currentTarget.scrollLeft;
                const width = e.currentTarget.clientWidth;
                const newIndex = Math.round(scrollLeft / width);
                if (newIndex !== currentIndex) setCurrentIndex(newIndex);
              }}
            >
              {mediaPreviews.map((media, index) => (
                <div
                  key={index}
                  className="w-full h-full flex-shrink-0 snap-center flex items-center justify-center px-4"
                >
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="relative max-w-full max-h-[85vh] flex items-center justify-center"
                  >
                    {media.type === "image" ? (
                      <img
                        src={media.src}
                        alt={`Preview ${index}`}
                        className="max-w-full max-h-full object-contain rounded-lg shadow-2xl"
                      />
                    ) : (
                      <video
                        src={media.src}
                        className="max-w-full max-h-full object-contain rounded-lg shadow-2xl"
                        controls
                        autoPlay
                        muted
                      />
                    )}

                    {/* Individual Remove Button per Image */}
                    <motion.button
                      whileTap={{ scale: 0.9 }}
                      className="absolute top-4 right-4 bg-red-600/80 text-white rounded-full p-2 shadow-xl backdrop-blur-md hover:bg-red-600 transition-colors"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleRemoveMedia(index);
                      }}
                    >
                      <X className="w-4 h-4" />
                    </motion.button>
                  </motion.div>
                </div>
              ))}
            </div>

            {/* Bottom Pagination Dots */}
            {mediaPreviews.length > 1 && (
              <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex gap-2 z-[60]">
                {mediaPreviews.map((_, i) => (
                  <div
                    key={i}
                    className={`h-1.5 rounded-full transition-all duration-300 ${
                      i === currentIndex ? "bg-white w-6" : "bg-white/30 w-1.5"
                    }`}
                  />
                ))}
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default PostCreation;
