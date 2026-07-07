// src/pages/HomePage.jsx
import React, {
  useContext,
  useState,
  useRef,
  useEffect,
  useCallback,
  useMemo,
} from "react";
import { motion } from "framer-motion";
import * as Toast from "@radix-ui/react-toast";
import PostCreation from "./components/PostCreation";
import StoriesSection from "./components/StoriesSection";
import StoryViewer from "./components/StoryViewer";
import ErrorBoundary from "./components/ErrorBoundary";
import PostsFeed from "./components/PostsFeed";
import MediaViewer from "./components/MediaViewer";
import { UserContext } from "@/context/UserContext";
import {
  createPost,
  getPostsBySubUserFilter,
  createStory,
  getStoriesBySubUser,
  viewStory,
  deletePost,
  getPostsBySubUser,
  deleteStory,
  getPostById,
} from "@/api/Parents/home";
import { getSubUsers } from "@/api/Auth/auth";
import { Calendar, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import DateRangeFilter from "./components/DateRangeFilter";
import { getPresetDateRange, PRESET_RANGES } from "@/lib/date-presets";
import { getMediaUrl, getPlayableVideoUrl } from "@/lib/mediaUrl";

const baseUrl = import.meta.env.VITE_API_URL;

const PLACEHOLDER_IMAGE = "https://placehold.co/150x150";

const FullPageSpinner = () => (
  <div className="min-h-[60vh] w-full flex flex-col items-center justify-center gap-3">
    <div className="w-10 h-10 rounded-full border-4 border-primary border-t-transparent animate-spin" />
    <p className="text-sm text-muted-foreground">Loading memories...</p>
  </div>
);

const ActionSpinner = () => (
  <div className="absolute inset-0 flex items-center justify-center z-50 rounded-2xl bg-gradient-to-br from-gray-200/70 to-gray-800/70">
    <div className="flex flex-col items-center gap-4">
      <div className="w-16 h-16 border-4 border-t-blue-400 border-b-blue-400 border-l-white border-r-white rounded-full animate-spin" />
      <p className="text-white text-base font-semibold drop-shadow-lg">
        Saving your memory...
      </p>
    </div>
  </div>
);

const HomePage = () => {
  const {
    selectedEntity,
    setSelectedEntity,
    user,
    isReadOnly,
    accessibleSubUsers,
  } = useContext(UserContext);

  const [posts, setPosts] = useState([]);
  const [stories, setStories] = useState([]);
  const [subUsers, setSubUsers] = useState([]);
  const [visibleToSubUserIds, setVisibleToSubUserIds] = useState([]);
  const [activeStory, setActiveStory] = useState(null);
  const [currentStoryIndex, setCurrentStoryIndex] = useState(0);

  const [currentPostId, setCurrentPostId] = useState(null);

  const [expandedPost, setExpandedPost] = useState(null);
  const [activePostMedia, setActivePostMedia] = useState(null);
  const [currentMediaIndex, setCurrentMediaIndex] = useState(0);
  const [imageError, setImageError] = useState(false);

  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [isActionLoading, setIsActionLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(1);

  const [dateRange, setDateRange] = useState({ from: "", to: "" });
  const [isFilterApplied, setIsFilterApplied] = useState(false);
  const [isFilterLoading, setIsFilterLoading] = useState(false);
  const [activePresetLabel, setActivePresetLabel] = useState("");

  const [toastOpen, setToastOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState("");

  const observerRef = useRef();
  const lastSelectedEntityId = useRef(null);

  // ==================== MEDIA VIEWER LOGIC ====================
  useEffect(() => {
    if (activePostMedia?.media?.length === 0) {
      setActivePostMedia(null);
      setCurrentMediaIndex(0);
    }
  }, [activePostMedia]);

  const getImageUrl = useCallback((urlOrObject) => {
    if (!urlOrObject) return PLACEHOLDER_IMAGE;
    if (typeof urlOrObject === "string") return urlOrObject;
    return urlOrObject.profileImageUrl || PLACEHOLDER_IMAGE;
  }, []);

  const profileImageUrl = useMemo(
    () => selectedEntity && getImageUrl(selectedEntity),
    [selectedEntity, getImageUrl]
  );

  const userName = useMemo(
    () => selectedEntity?.name || "Your Name",
    [selectedEntity]
  );

  const handleImageError = useCallback(() => setImageError(true), []);

  // ==================== LOAD POSTS WITH PAGINATION ====================
  const loadPosts = useCallback(
    async (pageNum = 1, append = false) => {
      if (!selectedEntity?.subUserId) return;

      if (pageNum === 1) {
        setIsLoading(true);
      } else {
        setIsLoadingMore(true);
      }

      try {
        const filters = {};
        if (dateRange.from) filters.from = dateRange.from;
        if (dateRange.to) filters.to = dateRange.to;

        const apiCall =
          Object.keys(filters).length > 0
            ? getPostsBySubUserFilter
            : getPostsBySubUser;

        const response = await apiCall(
          selectedEntity.subUserId,
          filters,
          pageNum,
          2
        );

        const { posts: newPosts, hasMore: serverHasMore } = response;

        const THUMB_LIMIT = 4;

        const formattedPosts = newPosts
          .filter((post) => post.id && !post.isDeleted)
          .map((post) => ({
            id: post.id,
            username: selectedEntity.name,
            userImage:
              post.subUser?.profileImageUrl || selectedEntity.profileImageUrl,
            text: post.text || "",
            memoryDate: post.memoryDate ? new Date(post.memoryDate) : null,
            media: (post.media || []).slice(0, THUMB_LIMIT).map((m) => ({
              id: m.id,
              mediaUrl: m.mediaUrl || "",
              thumbnailUrl: m.thumbnailUrl
                ? getMediaUrl(m.thumbnailUrl)
                : PLACEHOLDER_IMAGE,
              mediaType: m.mediaType || "image",
              caption: m.caption || "",
            })),
            totalMediaCount: post.totalMediaCount || (post.media || []).length,
            time: post.updatedAt
              ? new Date(post.updatedAt).toLocaleString()
              : "",
            childName: post.subUser?.name || selectedEntity.name,
          }));

        setPosts((prev) =>
          append ? [...prev, ...formattedPosts] : formattedPosts
        );
        setHasMore(serverHasMore);
        setPage(pageNum + 1);
      } catch (error) {
        console.error("Error loading posts:", error);
        setToastMessage("Failed to load memories.");
        setToastOpen(true);
      } finally {
        setIsLoading(false);
        setIsLoadingMore(false);
        setIsFilterLoading(false);
      }
    },
    [selectedEntity?.subUserId, dateRange]
  );

  useEffect(() => {
    if (selectedEntity?.subUserId) {
      setPosts([]);
      setPage(1);
      setHasMore(true);
      loadPosts(1, false);
    }
  }, [selectedEntity?.subUserId, dateRange, loadPosts]);

  const lastPostElementRef = useCallback(
    (node) => {
      if (isLoading || isLoadingMore) return;
      if (observerRef.current) observerRef.current.disconnect();

      observerRef.current = new IntersectionObserver(
        (entries) => {
          if (entries[0].isIntersecting && hasMore) {
            loadPosts(page, true);
          }
        },
        { threshold: 0.1 }
      );

      if (node) observerRef.current.observe(node);
    },
    [isLoading, isLoadingMore, hasMore, page, loadPosts]
  );

  // ==================== FETCH SUBUSERS & STORIES ====================
  useEffect(() => {
    const fetchInitialData = async () => {
      if (!selectedEntity?.subUserId) return;

      try {
        const [subUsersResponse, storiesResponse] = await Promise.all([
          getSubUsers(),
          getStoriesBySubUser(selectedEntity.subUserId).catch(() => []),
        ]);

        // Normalize sub-users
        const subUsersData = Array.isArray(subUsersResponse)
          ? subUsersResponse
          : subUsersResponse?.data || [];
        setSubUsers(subUsersData);

        // Accessible sub-users logic
        const availableSubUsers = isReadOnly
          ? accessibleSubUsers
          : subUsersData;
        const availableSubUserIds = availableSubUsers.map((s) => s.subUserId);

        let targetSubUser = selectedEntity;
        if (!availableSubUserIds.includes(targetSubUser.subUserId)) {
          targetSubUser = availableSubUsers[0] || null;
          if (
            targetSubUser &&
            lastSelectedEntityId.current !== targetSubUser.subUserId
          ) {
            lastSelectedEntityId.current = targetSubUser.subUserId;
            setSelectedEntity(targetSubUser);
          }
        }

        // Normalize stories
        const rawStories = Array.isArray(storiesResponse)
          ? storiesResponse
          : storiesResponse?.data || [];

        // Helper: Convert relative proxy path → full API URL
        const getFullMediaUrl = (path) => {
          if (!path) return PLACEHOLDER_IMAGE;
          const cleanPath = path.startsWith("/") ? path.slice(1) : path;
          return `${import.meta.env.VITE_API_URL}/${cleanPath}`;
        };

        // Format stories with correct full URLs
        const formattedStories = rawStories
          .filter((s) => s.id && s.media && s.media.length > 0)
          .map((s) => {
            const firstMedia = s.media[0];

            const previewImage =
              (firstMedia?.thumbnailUrl &&
                getFullMediaUrl(firstMedia.thumbnailUrl)) ||
              (firstMedia?.mediaUrl && getFullMediaUrl(firstMedia.mediaUrl)) ||
              PLACEHOLDER_IMAGE;

            return {
              id: s.id,
              username: s.subUser?.name || targetSubUser?.name || "User",
              image: previewImage,
              type: firstMedia?.mediaType || "image",
              hasNew: !s.views?.some(
                (v) => v.viewer?.subUserId === targetSubUser?.subUserId
              ),
              raw: s, // Critical: pass full story for StoryViewer
            };
          });

        setStories(formattedStories);
      } catch (error) {
        console.error("Error fetching initial data:", error);
        setToastMessage("Failed to load profiles or stories.");
        setToastOpen(true);
      }
    };

    fetchInitialData();
  }, [
    selectedEntity?.subUserId,
    isReadOnly,
    accessibleSubUsers,
    setSelectedEntity,
  ]);

  // ==================== FILTER HANDLERS ====================
  const handleApplyFilter = useCallback((filterRange) => {
    setDateRange(filterRange);
    setIsFilterApplied(true);
    setIsFilterLoading(true);

    const matchingPreset = PRESET_RANGES.find((p) => {
      if (p.value === "custom") return false;
      const r = getPresetDateRange(p.value);
      return r.from === filterRange.from && r.to === filterRange.to;
    });
    setActivePresetLabel(
      matchingPreset ? matchingPreset.label : "Custom Range"
    );

    setToastMessage("Filter applied");
    setToastOpen(true);
  }, []);

  const handleClearFilter = useCallback(() => {
    setDateRange({ from: "", to: "" });
    setIsFilterApplied(false);
    setActivePresetLabel("");
    setIsFilterLoading(true);
    setToastMessage("Filter cleared");
    setToastOpen(true);
  }, []);

  // ==================== CORE FUNCTIONS ====================
  const handleCreateMemory = useCallback(
    async (memoryData) => {
      if (isReadOnly) return;

      if (!memoryData.text && memoryData.media.length === 0) {
        setToastMessage("Please add text or media.");
        setToastOpen(true);
        return;
      }

      if (!selectedEntity?.subUserId) {
        setToastMessage("No profile selected.");
        setToastOpen(true);
        return;
      }

      setIsActionLoading(true);

      try {
        const postData = {
          subUserId: selectedEntity.subUserId,
          text: memoryData.text,
          memoryDate: memoryData.memoryDate,
          media: memoryData.media.map((m) => ({
            file: m.file,
            type: m.type,
            caption: m.caption || "",
          })),
          visibleToSubUserIds: visibleToSubUserIds.length
            ? visibleToSubUserIds
            : [],
        };

        const createdPost = await createPost(postData);

        const THUMB_LIMIT = 4;

        const formattedPost = {
          id: createdPost.id,
          username: selectedEntity.name,
          userImage:
            createdPost.subUser?.profileImageUrl ||
            selectedEntity.profileImageUrl,
          text: createdPost.text || "",
          memoryDate: createdPost.memoryDate
            ? new Date(createdPost.memoryDate)
            : null,
          media: (createdPost.media || []).slice(0, THUMB_LIMIT).map((m) => ({
            id: m.id,
            mediaUrl: m.mediaUrl || "",
            thumbnailUrl: m.thumbnailUrl || m.mediaUrl || "",
            mediaType: m.mediaType || "image",
            caption: m.caption || "",
          })),
          totalMediaCount:
            createdPost.totalMediaCount || (createdPost.media || []).length,
          time: createdPost.updatedAt
            ? new Date(createdPost.updatedAt).toLocaleString()
            : "",
          childName: createdPost.subUser?.name || selectedEntity.name,
        };

        setPosts((prev) => [formattedPost, ...prev]);

        setToastMessage("Memory saved forever!");
        setToastOpen(true);
      } catch (error) {
        console.error(error);
        setToastMessage("Failed to save memory.");
        setToastOpen(true);
      } finally {
        setIsActionLoading(false);
      }
    },
    [selectedEntity, visibleToSubUserIds, isReadOnly]
  );

  const handleCreateStory = useCallback(
    async (mediaFiles, captions = [], mediaTypes = []) => {
      if (isReadOnly) return;

      if (
        !mediaFiles ||
        mediaFiles.length === 0 ||
        !selectedEntity?.subUserId
      ) {
        setToastMessage("Please select media and profile.");
        setToastOpen(true);
        return;
      }

      setIsActionLoading(true);
      try {
        const storyData = {
          subUserId: selectedEntity.subUserId,
          text: "",
          media: mediaFiles.map((file, index) => ({
            file: file,
            caption: captions[index] || "",
            type:
              mediaTypes[index] ||
              (file.type.startsWith("video/") ? "video" : "image"),
          })),
          visibleToSubUserIds: visibleToSubUserIds.length
            ? visibleToSubUserIds
            : [],
        };

        const createdStory = await createStory(storyData);

        const firstMedia = createdStory.media?.[0];

        // Same helper as above
        const getFullMediaUrl = (path) => {
          if (!path) return URL.createObjectURL(mediaFiles[0]);
          const cleanPath = path.startsWith("/") ? path.slice(1) : path;
          return `${import.meta.env.VITE_API_URL}/${cleanPath}`;
        };

        const previewUrl =
          (firstMedia?.thumbnailUrl &&
            getFullMediaUrl(firstMedia.thumbnailUrl)) ||
          (firstMedia?.mediaUrl && getFullMediaUrl(firstMedia.mediaUrl)) ||
          URL.createObjectURL(mediaFiles[0]);

        const formattedStory = {
          id: createdStory.id,
          username: userName,
          image: previewUrl,
          type:
            firstMedia?.mediaType ||
            (mediaFiles[0].type.startsWith("video/") ? "video" : "image"),
          hasNew: true,
          raw: createdStory,
        };

        setStories((prev) => [formattedStory, ...prev]);
        setToastMessage("Story added!");
        setToastOpen(true);
      } catch (error) {
        console.error("Story upload failed:", error);
        setToastMessage(error.message || "Failed to add story.");
        setToastOpen(true);
      } finally {
        setIsActionLoading(false);
      }
    },
    [selectedEntity, userName, visibleToSubUserIds, isReadOnly]
  );

  const handleDeletePost = useCallback(
    async (postId) => {
      if (isReadOnly) return;

      if (!selectedEntity?.subUserId) {
        setToastMessage("No profile selected.");
        setToastOpen(true);
        return;
      }
      setIsActionLoading(true);
      try {
        await deletePost(postId, selectedEntity.subUserId);
        setPosts((prev) => prev.filter((p) => p.id !== postId));
        setCurrentPostId(null);
        setToastMessage("Post deleted.");
        setToastOpen(true);
      } catch (error) {
        setToastMessage("Failed to delete post.");
        setToastOpen(true);
      } finally {
        setIsActionLoading(false);
      }
    },
    [selectedEntity, isReadOnly]
  );


const handleShare = useCallback(
  (platform) => {
    if (!currentPostId || posts.length === 0) {
      setToastMessage("No post selected to share.");
      setToastOpen(true);
      return;
    }

    const shareUrl = `${baseUrl}/posts/share/${currentPostId}`;

    const post = posts.find((p) => p.id === currentPostId);

    let shareText = "Check out this beautiful memory 💕";

    if (post?.text?.trim()) {
      shareText =
        post.text.length > 120
          ? post.text.substring(0, 120) + "..."
          : post.text;
    }

    /** -----------------------------
     *  PLATFORM SPECIFIC SHARE
     *  ----------------------------- */
    const handlePlatformShare = (platformName) => {
      switch (platformName) {
        /** ✅ FACEBOOK */
        case "Facebook":
          window.open(
            `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(
              shareUrl
            )}`,
            "_blank",
            "width=600,height=400"
          );
          break;

        /** ⚠️ INSTAGRAM (COPY ONLY) */
        case "Instagram": {
          const instagramMessage = `${shareText}\n\n${shareUrl}`;

          if (navigator.clipboard?.writeText) {
            navigator.clipboard.writeText(instagramMessage).then(() => {
              setToastMessage(
                "Copied! Open Instagram and paste it in your story or bio."
              );
              setToastOpen(true);
            });
          } else {
            const textArea = document.createElement("textarea");
            textArea.value = instagramMessage;
            document.body.appendChild(textArea);
            textArea.select();
            document.execCommand("copy");
            document.body.removeChild(textArea);

            setToastMessage(
              "Copied! Open Instagram and paste it in your story or bio."
            );
            setToastOpen(true);
          }
          break;
        }

        /** ✅ TWITTER / X */
        case "Twitter":
          window.open(
            `https://twitter.com/intent/tweet?text=${encodeURIComponent(
              shareText
            )}&url=${encodeURIComponent(
              shareUrl
            )}&hashtags=SharedMemories`,
            "_blank",
            "width=550,height=420"
          );
          break;

        /** ✅ WHATSAPP */
        case "WhatsApp":
          window.open(
            `https://wa.me/?text=${encodeURIComponent(
              `${shareText}\n\n${shareUrl}`
            )}`,
            "_blank"
          );
          break;

        /** ✅ TELEGRAM */
        case "Telegram":
          window.open(
            `https://t.me/share/url?url=${encodeURIComponent(
              shareUrl
            )}&text=${encodeURIComponent(shareText)}`,
            "_blank"
          );
          break;

        /** ✅ COPY LINK */
        case "Copy Link":
          navigator.clipboard.writeText(shareUrl).then(() => {
            setToastMessage("Link copied to clipboard!");
            setToastOpen(true);
          });
          break;

        default:
          setToastMessage(`Sharing to ${platformName} is not supported.`);
          setToastOpen(true);
      }
    };

    /** -----------------------------
     *  NATIVE SHARE (MOBILE)
     *  ----------------------------- */
    const isMobile =
      /Android|iPhone|iPad|iPod/i.test(navigator.userAgent) &&
      navigator.share;

    if (isMobile) {
      navigator
        .share({
          title: "Shared Memory",
          text: shareText,
          url: shareUrl,
        })
        .catch(() => handlePlatformShare(platform));
    } else {
      handlePlatformShare(platform);
    }

    setCurrentPostId(null);
  },
  [
    currentPostId,
    posts,
    baseUrl,          // ✅ IMPORTANT FIX
    setToastMessage,
    setToastOpen,
  ]
);


  // ==================== MEDIA VIEWER ====================
  const openMediaViewer = useCallback(
    async (post, index) => {
      setActivePostMedia(post);
      setCurrentMediaIndex(index);

      try {
        const fullPost = await getPostById(post.id, selectedEntity.subUserId);
        const formattedPost = {
          ...post,
          media: (fullPost.media || []).map((m) => ({
            type: m.mediaType,
            src:
              m.mediaType === "video"
                ? getPlayableVideoUrl(m)
                : getMediaUrl(m.mediaUrl),
            caption: m.caption || "",
          })),
        };
        setActivePostMedia(formattedPost);
      } catch (err) {
        console.error("Failed to load full media", err);
      }
    },
    [selectedEntity]
  );

  const closeMediaViewer = useCallback(() => {
    setActivePostMedia(null);
    setCurrentMediaIndex(0);
  }, []);

  const openStory = useCallback(
    async (story, index) => {
      if (!selectedEntity?.subUserId) return;

      setActiveStory(story);
      setCurrentStoryIndex(index);

      if (story.hasNew) {
        try {
          await viewStory(story.id, selectedEntity.subUserId);
          setStories((prev) =>
            prev.map((s) => (s.id === story.id ? { ...s, hasNew: false } : s))
          );
        } catch (e) {}
      }
    },
    [selectedEntity]
  );

  const closeStory = useCallback(() => setActiveStory(null), []);

  const toggleExpandPost = useCallback(
    (postId) => setExpandedPost(expandedPost === postId ? null : postId),
    [expandedPost]
  );

  const removeHashtags = useCallback(
    (text) => text.replace(/#[^\s]+/g, "").trim(),
    []
  );

  const nextMedia = useCallback(() => {
    if (currentMediaIndex < activePostMedia?.media.length - 1) {
      setCurrentMediaIndex(currentMediaIndex + 1);
    }
  }, [currentMediaIndex, activePostMedia]);

  const prevMedia = useCallback(() => {
    if (currentMediaIndex > 0) {
      setCurrentMediaIndex(currentMediaIndex - 1);
    }
  }, [currentMediaIndex]);

  // ==================== RENDER ====================
  return (
    <ErrorBoundary>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.4 }}
        className="min-h-screen w-full py-4 px-3 sm:px-4 relative"
      >
        <div className="w-full mx-auto min-w-0">
          <div className="w-full h-0" aria-hidden="true">
            <div className="w-[768px] max-w-full" />
          </div>

          {isLoading ? (
            <FullPageSpinner />
          ) : (
            <div className="flex flex-col gap-4">
              {isReadOnly && (
                <div className="bg-amber-50 border border-amber-300 text-amber-800 px-4 py-2.5 rounded-xl text-center text-sm font-medium flex items-center justify-center gap-2">
                  <svg
                    className="w-5 h-5"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                    <path
                      fillRule="evenodd"
                      d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                  <span>View Only — Editing is disabled</span>
                </div>
              )}

              <StoriesSection
                stories={stories}
                openStory={openStory}
                handleCreateStory={isReadOnly ? undefined : handleCreateStory}
                selectedEntity={selectedEntity}
                visibleToSubUserIds={visibleToSubUserIds}
                isReadOnly={isReadOnly}
              />

              {!isReadOnly && (
                <div className="relative">
                  {isActionLoading && <ActionSpinner />}
                  <PostCreation
                    profileImageUrl={profileImageUrl}
                    userName={userName}
                    imageError={imageError}
                    handleImageError={handleImageError}
                    onCreateMemory={handleCreateMemory}
                    onCancel={() => {}}
                    isReadOnly={isReadOnly}
                  />
                </div>
              )}

              <div className="flex items-center justify-between mb-2">
                <div>
                  <h1 className="text-2xl font-bold text-foreground">
                    Memories
                  </h1>
                  {isFilterApplied && activePresetLabel && (
                    <p className="text-sm text-muted-foreground mt-1">
                      Showing {activePresetLabel.toLowerCase()}
                      {dateRange.from && dateRange.to && (
                        <>
                          {" "}
                          ({format(new Date(dateRange.from), "MMM d")} -{" "}
                          {format(new Date(dateRange.to), "MMM d, yyyy")})
                        </>
                      )}
                    </p>
                  )}
                </div>

                <DateRangeFilter
                  dateRange={dateRange}
                  setDateRange={setDateRange}
                  isFilterApplied={isFilterApplied}
                  setIsFilterApplied={setIsFilterApplied}
                  onApply={handleApplyFilter}
                  onClear={handleClearFilter}
                />
              </div>

              <PostsFeed
                posts={posts}
                expandedPost={expandedPost}
                profileImageUrl={profileImageUrl}
                toggleExpandPost={toggleExpandPost}
                openMediaViewer={openMediaViewer}
                removeHashtags={removeHashtags}
                isReadOnly={isReadOnly}
                lastPostRef={posts.length > 0 ? lastPostElementRef : null}
                handleShare={handleShare}
                handleDeletePost={handleDeletePost}
                currentPostId={currentPostId}
                setCurrentPostId={setCurrentPostId}
              />

              {isLoadingMore && (
                <div className="py-12 flex flex-col items-center gap-3">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
                  <p className="text-sm text-muted-foreground">
                    Loading more memories...
                  </p>
                </div>
              )}

              {!hasMore && posts.length > 0 && (
                <p className="text-center text-muted-foreground py-8">
                  You've reached the end of memories ✨
                </p>
              )}

              {posts.length === 0 && !isLoading && (
                <div className="glass-card rounded-xl shadow-soft border border-primary p-8 text-center">
                  <div className="flex flex-col items-center justify-center gap-3">
                    <Calendar className="w-12 h-12 text-muted-foreground opacity-50" />
                    <div>
                      <h3 className="text-lg font-semibold text-foreground mb-1">
                        {isFilterApplied
                          ? "No memories found"
                          : "No memories yet"}
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        {isFilterApplied
                          ? "Try changing your date range filter or clear it to see all memories."
                          : "Create your first memory to get started!"}
                      </p>
                    </div>
                    {isFilterApplied && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handleClearFilter}
                        className="mt-2"
                      >
                        <X className="w-4 h-4 mr-2" />
                        Clear Filter
                      </Button>
                    )}
                  </div>
                </div>
              )}

              <MediaViewer
                activePostMedia={activePostMedia}
                currentMediaIndex={currentMediaIndex}
                closeMediaViewer={closeMediaViewer}
                nextMedia={nextMedia}
                prevMedia={prevMedia}
              />
            </div>
          )}
        </div>

        <StoryViewer
          activeStory={activeStory}
          stories={stories}
          currentStoryIndex={currentStoryIndex}
          closeStory={closeStory}
          nextStory={() => {
            if (currentStoryIndex < stories.length - 1) {
              setCurrentStoryIndex(currentStoryIndex + 1);
              setActiveStory(stories[currentStoryIndex + 1]);
            } else closeStory();
          }}
          prevStory={() => {
            if (currentStoryIndex > 0) {
              setCurrentStoryIndex(currentStoryIndex - 1);
              setActiveStory(stories[currentStoryIndex - 1]);
            }
          }}
          onDeleteStory={async (storyId) => {
            try {
              await deleteStory(storyId, selectedEntity.subUserId);

              setStories((prev) => {
                const updated = prev.filter((s) => s.id !== storyId);

                // যদি সব story শেষ
                if (updated.length === 0) {
                  closeStory();
                  return [];
                }

                // যদি current story delete হয়
                if (activeStory?.id === storyId) {
                  const newIndex = Math.min(
                    currentStoryIndex,
                    updated.length - 1
                  );

                  setCurrentStoryIndex(newIndex);
                  setActiveStory(updated[newIndex]);
                }

                return updated;
              });

              setToastMessage("Story deleted");
              setToastOpen(true);
            } catch (err) {
              console.error(err);
              setToastMessage("Failed to delete story.");
              setToastOpen(true);
            }
          }}
          isOwner={!isReadOnly}
        />

        <Toast.Provider swipeDirection="right">
          <Toast.Root
            open={toastOpen}
            onOpenChange={setToastOpen}
            className="glass-card rounded-xl p-4 shadow-soft border border-primary bg-background/95 backdrop-blur-sm"
          >
            <Toast.Description className="text-foreground text-sm">
              {toastMessage}
            </Toast.Description>
            <Toast.Close className="absolute top-3 right-3 text-primary hover:bg-primary/10 p-1 rounded-full transition-colors">
              ×
            </Toast.Close>
          </Toast.Root>
          <Toast.Viewport className="fixed bottom-4 right-4 z-50" />
        </Toast.Provider>
      </motion.div>
    </ErrorBoundary>
  );
};

export default HomePage;
