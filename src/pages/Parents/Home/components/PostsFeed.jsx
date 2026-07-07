// src/components/PostsFeed.jsx
import React from "react";
import { motion } from "framer-motion";
import { Calendar, Play } from "lucide-react";
import { format } from "date-fns";
import ShareActions from "./ShareActions";
import { getMediaUrl, getSafeMediaSrc } from "@/lib/mediaUrl";

const PostsFeed = ({
  posts,
  openMediaViewer,
  removeHashtags,
  isReadOnly,
  lastPostRef,
  handleShare,
  handleDeletePost,
  currentPostId,
  setCurrentPostId,
  profileImageUrl,
  userName,
  imageError,
  handleImageError,
}) => {
  const maxThumbnails = 4;

  if (!posts || posts.length === 0) {
    return (
      <p className="text-center text-muted-foreground mt-5">No memories yet.</p>
    );
  }

  return (
    <div className="space-y-6">
      {posts.map((post, index) => {
        const visibleMedia = post.media?.slice(0, maxThumbnails) || [];
        const isLastPost = index === posts.length - 1;
        const postRef = isLastPost ? lastPostRef : null;

        return (
          <motion.div
            key={post.id}
            ref={postRef}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="glass-card rounded-2xl shadow-soft border border-primary/30 overflow-hidden backdrop-blur-sm"
          >
            {/* ================= HEADER ================= */}
            <div className="p-5 pb-3 flex justify-between items-start">
              <div className="flex items-start gap-4">
                {profileImageUrl && !imageError ? (
                  <img
                    src={profileImageUrl}
                    alt={userName}
                    onError={handleImageError}
                    className="w-10 h-10 object-cover rounded-full border-2 border-primary"
                  />
                ) : (
                  <div className="w-4 h-4 bg-input rounded-full" />
                )}

                <div>
                  <p className="font-bold text-lg text-foreground">
                    {post.childName || "Unknown User"}
                  </p>

                  {post.memoryDate && (
                    <div className="flex items-center gap-2 text-sm text-primary mt-1">
                      <Calendar className="w-4 h-4" />
                      <span className="font-medium">
                        Event:{" "}
                        {format(new Date(post.memoryDate), "MMMM d, yyyy")}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              <ShareActions
                postId={post.id}
                isOpen={currentPostId === post.id}
                onOpenChange={(open) => setCurrentPostId(open ? post.id : null)}
                handleShare={handleShare}
                handleDeletePost={handleDeletePost}
                isReadOnly={isReadOnly}
              />
            </div>

            {/* ================= TEXT ================= */}
            {post.text && (
              <div className="px-5 pb-4">
                <p className="text-foreground leading-relaxed whitespace-pre-wrap text-base">
                  {removeHashtags(post.text)}
                </p>
              </div>
            )}

            {/* ================= MEDIA ================= */}
            <div className="px-2 pb-2">
              {visibleMedia.length === 1 ? (
                <div
                  className="rounded-xl overflow-hidden cursor-pointer relative"
                  onClick={(e) => {
                    e.stopPropagation();
                    openMediaViewer(post, 0); 
                  }}
                >
                  {visibleMedia[0].mediaType === "image" ? (
                    <img
                      src={getMediaUrl(visibleMedia[0].mediaUrl)}
                      crossOrigin="anonymous"
                      alt={visibleMedia[0].caption || "Memory"}
                      className="w-full max-h-[600px] object-contain bg-black/5 rounded-xl"
                      onError={(e) => {
                        console.error(
                          "❌ Image load failed:",
                          visibleMedia[0].mediaUrl
                        );
                        e.currentTarget.src =
                          "https://placehold.co/600x400?text=Image+Error";
                      }}
                    />
                  ) : (
                    <div className="relative">
                      <video
                        src={getMediaUrl(visibleMedia[0].mediaUrl)}
                        poster={getSafeMediaSrc(visibleMedia[0].thumbnailUrl)}
                        className="w-full max-h-[600px] object-contain bg-black rounded-xl"
                        preload="metadata"
                        // controls বাদ দিয়েছি যাতে onClick কাজ করে
                      />
                      <div
                        className="absolute inset-0 flex items-center justify-center bg-black/30 hover:bg-black/50 transition"
                        onClick={(e) => {
                          e.stopPropagation();
                          openMediaViewer(post, 0); // ভিডিও ক্লিক করলে MediaViewer খুলবে
                        }}
                      >
                        <Play className="w-16 h-16 text-white drop-shadow-2xl" />
                      </div>
                    </div>
                  )}

                  {visibleMedia[0].caption && (
                    <p className="text-center text-sm text-muted-foreground italic mt-2 px-4">
                      {visibleMedia[0].caption}
                    </p>
                  )}
                </div>
              ) : (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                  {visibleMedia.map((media, i) => {
                    const thumbSrc = getMediaUrl(
                      media.thumbnailUrl || media.mediaUrl
                    );

                    return (
                      <div
                        key={media.id || i}
                        className="relative aspect-square rounded-xl overflow-hidden cursor-pointer group"
                        onClick={(e) => {
                          e.stopPropagation();
                          openMediaViewer(post, i);
                        }}
                      >
                        <img
                          src={thumbSrc}
                          crossOrigin="anonymous"
                          alt={media.caption || `Media ${i + 1}`}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                          onError={(e) => {
                            e.currentTarget.src =
                              "https://placehold.co/400x400?text=Media";
                          }}
                        />

                        {media.mediaType === "video" && (
                          <div className="absolute inset-0 flex items-center justify-center bg-black/40">
                            <Play className="w-12 h-12 text-white" />
                          </div>
                        )}

                        {i === maxThumbnails - 1 &&
                          post.totalMediaCount > maxThumbnails && (
                            <div className="absolute inset-0 bg-black/70 flex items-center justify-center">
                              <span className="text-white text-4xl font-bold">
                                +{post.totalMediaCount - maxThumbnails}
                              </span>
                            </div>
                          )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* ================= TIME ================= */}
            <p className="text-xs text-muted-foreground px-5 pb-3">
              Posted on: {post.time || "Just now"}
            </p>
          </motion.div>
        );
      })}
    </div>
  );
};

export default PostsFeed;