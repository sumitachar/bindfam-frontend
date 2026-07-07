// src/components/StoriesSection.jsx
import React, { useRef } from "react";
import { motion } from "framer-motion";
import { Plus, Play } from "lucide-react";

const StoriesSection = ({
  stories = [],
  openStory,
  handleCreateStory,
  selectedEntity,
  isReadOnly,
}) => {
  const inputRef = useRef(null);

  const handleStoryClick = () => {
    if (isReadOnly) return;
    inputRef.current?.click();
  };

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;

    const mediaFiles = files;
    const mediaTypes = files.map((file) =>
      file.type.startsWith("image/") ? "image" : "video"
    );
    const captions = files.map(() => ""); // empty captions

    handleCreateStory?.(mediaFiles, captions, mediaTypes);

    // Reset input
    e.target.value = "";
  };

  return (
    <div className="mb-4 overflow-x-auto scrollbar-hide">
      <div className="flex gap-4 px-2 py-1">
        {/* Add Story Button */}
        {!isReadOnly && selectedEntity && (
          <motion.div
            whileTap={{ scale: 0.95 }}
            onClick={handleStoryClick}
            className="flex flex-col items-center cursor-pointer group"
          >
            <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-primary to-accent p-0.5 shadow-lg">
              <div className="w-full h-full rounded-full bg-background flex items-center justify-center">
                <Plus className="w-8 h-8 text-primary" />
              </div>
            </div>
            <p className="text-xs mt-2 text-muted-foreground font-medium">Add Story</p>
          </motion.div>
        )}

        {/* Stories List */}
        {stories.map((story, i) => (
          <motion.div
            key={story.id}
            whileTap={{ scale: 0.95 }}
            onClick={() => openStory(story, i)}
            className="flex flex-col items-center cursor-pointer group"
          >
            <div
              className={`relative w-16 h-16 rounded-full p-0.5 transition-all ${
                story.hasNew
                  ? "bg-gradient-to-tr from-primary to-accent shadow-lg"
                  : "bg-border"
              }`}
            >
              <div className="w-full h-full rounded-full overflow-hidden bg-background">
                {story.type === "video" ? (
                  <>
                    <img
                      src={story.image}
                      alt={story.username}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.target.style.display = "none";
                      }}
                    />
                    {/* Play Icon Overlay */}
                    <div className="absolute rounded-full inset-0 flex items-center justify-center bg-black/30">
                      <Play className="w-8 h-8 text-white drop-shadow-lg" fill="white" />
                    </div>
                  </>
                ) : (
                  <img
                    src={story.image}
                    alt={story.username}
                    className="w-full h-full object-cover"
                  />
                )}
              </div>
            </div>

            <p className="text-xs mt-2 text-center w-16 truncate font-medium text-foreground">
              {story.username}
            </p>

            {/* New Story Indicator Dot */}
            {story.hasNew && (
              <div className="absolute top-5 -right-1 w-3 h-3 bg-primary rounded-full ring-2 ring-background" />
            )}
          </motion.div>
        ))}

        {/* Hidden File Input */}
        <input
          ref={inputRef}
          type="file"
          accept="image/*,video/*"
          multiple
          className="hidden"
          onChange={handleFileChange}
        />
      </div>
    </div>
  );
};

export default StoriesSection;