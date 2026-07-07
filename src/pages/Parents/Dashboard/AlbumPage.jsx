import React, { useState, useEffect, useContext, useCallback } from "react";
import {
  MdMoreVert,
  MdCheckCircle,
  MdClose,
  MdSelectAll,
  MdDownload,
  MdLoop,
  MdDelete,
  MdWarning,
} from "react-icons/md";
import JSZip from "jszip";
import { saveAs } from "file-saver";

import { UserContext } from "@/context/UserContext";
import { deleteAlbumMediaItem, getAlbumMedia } from "@/api/Parents/home";
import { getMediaUrl } from "@/lib/mediaUrl";
import MediaViewer from "../Home/components/MediaViewer";

export default function AlbumPage() {
  const { selectedEntity } = useContext(UserContext);

  const [allMedia, setAllMedia] = useState([]);
  const [selected, setSelected] = useState([]);
  const [activeMedia, setActiveMedia] = useState(null);
  const [currentMediaIndex, setCurrentMediaIndex] = useState(0);
  const [showMediaViewer, setShowMediaViewer] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const fetchAlbumMedia = useCallback(async () => {
    if (!selectedEntity?.subUserId) {
      setAllMedia([]);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      let mediaItems = [];
      let page = 1;
      const limit = 50;
      let hasMore = true;

      while (hasMore && mediaItems.length < 1500) {
        const res = await getAlbumMedia(selectedEntity.subUserId, page, limit);

        const formatted = res.media.map((m, index) => ({
          key: `${m.postId}-${m.src}`, // unique key
          postId: m.postId,
          src: getMediaUrl(m.src),
          rawSrc: m.src, // 🔴 IMPORTANT
          thumbnailUrl: getMediaUrl(m.thumbnailUrl),
          poster: m.poster
            ? getMediaUrl(m.poster)
            : getMediaUrl(m.thumbnailUrl),
          type: m.type,
        }));

        mediaItems.push(...formatted);
        hasMore = res.hasMore;
        page++;
      }

      setAllMedia(mediaItems);
      setSelected([]);
    } catch (err) {
      console.error("Failed to load album:", err);
      setError("Failed to load memories. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }, [selectedEntity?.subUserId]);

  useEffect(() => {
    fetchAlbumMedia();
  }, [fetchAlbumMedia]);

  const openMediaViewer = (index) => {
    setCurrentMediaIndex(index);
    setActiveMedia({
      media: allMedia,
      username: selectedEntity?.name || "Family Member",
      childName: selectedEntity?.name || "Family Member",
      userImage: selectedEntity?.profileImageUrl || null,
      time: "From Album",
    });
    setShowMediaViewer(true);

    const range = 3;
    for (
      let i = Math.max(0, index - range);
      i < Math.min(allMedia.length, index + range + 1);
      i++
    ) {
      if (i !== index) {
        const img = new Image();
        img.src = allMedia[i].src;
        if (allMedia[i].type === "video" && allMedia[i].poster) {
          const posterImg = new Image();
          posterImg.src = allMedia[i].poster;
        }
      }
    }
  };

  const closeMediaViewer = () => setShowMediaViewer(false);

  const nextMedia = () => {
    if (currentMediaIndex < allMedia.length - 1) {
      setCurrentMediaIndex((prev) => prev + 1);
    }
  };

  const prevMedia = () => {
    if (currentMediaIndex > 0) {
      setCurrentMediaIndex((prev) => prev - 1);
    }
  };

  const toggleSelect = (index) => {
    setSelected((prev) =>
      prev.includes(index) ? prev.filter((i) => i !== index) : [...prev, index]
    );
  };

  const selectAll = () => setSelected(allMedia.map((_, i) => i));
  const deselectAll = () => setSelected([]);

  const handleDownloadSelected = async () => {
    const indices = selected.length > 0 ? selected : allMedia.map((_, i) => i);
    if (indices.length === 0) return;

    setIsDownloading(true);
    const zip = new JSZip();

    try {
      for (const idx of indices) {
        const media = allMedia[idx];
        try {
          const response = await fetch(media.src);
          if (!response.ok) continue;
          const blob = await response.blob();
          const ext = media.type === "video" ? "mp4" : "jpg";
          zip.file(`memory-${idx + 1}.${ext}`, blob);
        } catch (e) {
          console.warn(`Download failed for item ${idx}`, e);
        }
      }
      const zipBlob = await zip.generateAsync({ type: "blob" });
      saveAs(zipBlob, `Family-Album-${indices.length}-memories.zip`);
    } catch (err) {
      alert("Some items could not be downloaded.");
    } finally {
      setIsDownloading(false);
    }
  };

  // Delete handlers
  const confirmDelete = () => {
    if (selected.length === 0) return;
    setShowDeleteConfirm(true);
  };

  const cancelDelete = () => setShowDeleteConfirm(false);

   const executeDelete = async () => {
    if (selected.length === 0) return;
    setIsDeleting(true);
    setShowDeleteConfirm(false);

    const itemsToDelete = selected.map((idx) => {
      const m = allMedia[idx];
      return { postId: m.postId, src: m.rawSrc, type: m.type };
    });

    const deleteKeySet = new Set(itemsToDelete.map(i => `${i.postId}-${i.src}`));

    // Optimistic UI update
    setAllMedia(prev => prev.filter(m => !deleteKeySet.has(`${m.postId}-${m.rawSrc}`)));
    setSelected([]);

    try {
      await deleteAlbumMediaItem(selectedEntity.subUserId, itemsToDelete);
    } catch (err) {
      console.error("Delete failed:", err);
      alert("Failed to delete memories. Reloading album.");
      await fetchAlbumMedia(); // rollback
    } finally {
      setIsDeleting(false);
    }
  };




  const MediaCard = ({ media, index }) => {
    const isSelected = selected.includes(index);
    const thumbSrc = media.poster || media.thumbnailUrl || media.src;

    return (
      <div
        className="break-inside-avoid mb-4 relative rounded-xl overflow-hidden shadow-lg cursor-pointer hover:scale-105 transition-transform duration-300 group"
        onClick={() =>
          selected.length > 0 ? toggleSelect(index) : openMediaViewer(index)
        }
      >
        <div className="relative w-full pt-[133%] bg-gray-200">
          <div className="absolute inset-0 bg-gray-300" />

          <img
            src={thumbSrc}
            alt="Memory"
            loading="lazy"
            className="absolute inset-0 w-full h-full object-cover transition-opacity duration-700 opacity-0"
            onLoad={(e) => (e.currentTarget.style.opacity = "1")}
            onError={(e) => {
              const img = e.currentTarget;
              img.onerror = null;
              if (img.src !== "https://placehold.co/600x800?text=Not+Found") {
                img.src = "https://placehold.co/600x800?text=Not+Found";
              }
            }}
          />

          {media.type === "video" && (
            <>
              <div className="absolute inset-0 flex items-center justify-center bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <div className="bg-white/90 rounded-full p-4 shadow-2xl">
                  <svg
                    className="w-12 h-12 text-blue-600 ml-1"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M8 5v14l11-7z" />
                  </svg>
                </div>
              </div>

              <div className="absolute bottom-3 left-3 bg-black/70 text-white text-xs px-3 py-1.5 rounded-full flex items-center gap-1">
                <svg
                  className="w-4 h-4"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M8 5v14l11-7z" />
                </svg>
                <span>Video</span>
              </div>
            </>
          )}
        </div>

        <div className="absolute top-3 right-3 z-10">
          <button
            onClick={(e) => {
              e.stopPropagation();
              toggleSelect(index);
            }}
            className={`p-2 rounded-full backdrop-blur-md shadow-lg transition-all ${
              isSelected
                ? "bg-blue-600 text-white"
                : "bg-white/80 text-gray-700 hover:bg-white"
            }`}
          >
            <MdCheckCircle size={28} />
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Header with Always-Visible Delete Button */}
      <header className="flex justify-between items-center mb-8">
        <h1 className="text-4xl font-bold">Family Album</h1>
        <div className="flex items-center gap-4">
          {/* Delete Button - Always visible */}
          <button
            onClick={confirmDelete}
            disabled={selected.length === 0 || isDeleting}
            className="p-3 rounded-full transition-all disabled:opacity-40 disabled:cursor-not-allowed
              bg-red-600 text-white hover:bg-red-700 shadow-lg"
            title={
              selected.length === 0
                ? "Select items to delete"
                : "Delete selected"
            }
          >
            {isDeleting ? (
              <MdLoop className="animate-spin" size={24} />
            ) : (
              <MdDelete size={24} />
            )}
          </button>

          <MdMoreVert size={28} className="text-gray-600" />
        </div>
      </header>

      {/* Selection Toolbar (Download, Select All, etc.) */}
      {selected.length > 0 && (
        <div className="sticky top-4 z-20 bg-white p-4 shadow-xl rounded-xl mb-6 flex justify-between items-center">
          <span className="font-semibold">{selected.length} selected</span>
          <div className="flex items-center gap-6">
            <button onClick={selectAll} title="Select all">
              <MdSelectAll
                size={24}
                className="text-gray-700 hover:text-black"
              />
            </button>

            <button
              onClick={handleDownloadSelected}
              disabled={isDownloading}
              title="Download selected"
            >
              {isDownloading ? (
                <MdLoop className="animate-spin" size={24} />
              ) : (
                <MdDownload
                  size={24}
                  className="text-gray-700 hover:text-black"
                />
              )}
            </button>

            <button onClick={deselectAll} title="Clear selection">
              <MdClose size={24} className="text-gray-700 hover:text-black" />
            </button>
          </div>
        </div>
      )}

      {/* Loading */}
      {isLoading && (
        <div className="py-32 text-center">
          <MdLoop className="animate-spin text-6xl mx-auto text-blue-600" />
          <p className="mt-6 text-lg text-gray-600">
            Loading your precious memories…
          </p>
        </div>
      )}

      {/* Error */}
      {error && !isLoading && (
        <div className="py-32 text-center">
          <p className="text-red-600 text-lg">{error}</p>
        </div>
      )}

      {/* Grid */}
      {!isLoading && !error && allMedia.length > 0 && (
        <section className="columns-2 sm:columns-3 md:columns-4 lg:columns-5 gap-4">
          {allMedia.map((media, index) => (
            <MediaCard key={media.key || index} media={media} index={index} />
          ))}
        </section>
      )}

      {/* Empty */}
      {!isLoading && !error && allMedia.length === 0 && (
        <div className="py-32 text-center">
          <p className="text-gray-500 text-lg">No memories in the album yet.</p>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 px-4">
          <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full">
            <div className="flex items-center gap-4 mb-6">
              <MdWarning size={48} className="text-red-500" />
              <h3 className="text-2xl font-bold">Delete Memories?</h3>
            </div>
            <p className="text-gray-700 mb-8 leading-relaxed">
              Are you sure you want to permanently delete{" "}
              <strong>{selected.length}</strong> selected{" "}
              {selected.length > 1 ? "memories" : "memory"}?
              <br />
              <span className="text-red-600 font-semibold">
                This cannot be undone.
              </span>
            </p>
            <div className="flex justify-end gap-4">
              <button
                onClick={cancelDelete}
                className="px-6 py-3 rounded-lg bg-gray-200 hover:bg-gray-300 transition font-medium"
              >
                Cancel
              </button>
              <button
                onClick={executeDelete}
                disabled={isDeleting}
                className="px-6 py-3 rounded-lg bg-red-600 text-white hover:bg-red-700 disabled:opacity-70 transition font-medium flex items-center gap-2"
              >
                {isDeleting ? (
                  <>
                    <MdLoop className="animate-spin" />
                    Deleting...
                  </>
                ) : (
                  "Delete Permanently"
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Media Viewer */}
      {showMediaViewer && (
        <MediaViewer
          activePostMedia={activeMedia}
          currentMediaIndex={currentMediaIndex}
          closeMediaViewer={closeMediaViewer}
          nextMedia={nextMedia}
          prevMedia={prevMedia}
        />
      )}
    </div>
  );
}
