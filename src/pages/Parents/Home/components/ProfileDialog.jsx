import React from "react";
import { motion } from "framer-motion";
import * as Dialog from "@radix-ui/react-dialog";
import { Camera, User, X } from "lucide-react";
import { Button } from "@/components/ui/button";

const ProfileDialog = ({
  profileDialogOpened,
  closeProfileDialog,
  profileImageUrl,
  userName,
  imageError,
  handleImageError,
  handleProfileImageChange,
  handleNameChange,
  profileImageInputRef,
}) => {
  return (
    <Dialog.Root open={profileDialogOpened} onOpenChange={closeProfileDialog}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/60 backdrop-blur-sm" />
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          transition={{ duration: 0.3 }}
          className="fixed inset-0 flex items-center justify-center"
        >
          <Dialog.Content className="glass-card max-w-md w-full rounded-2xl shadow-soft border border-primary p-4">
            <div className="flex flex-col items-center mb-3">
              <div className="w-16 h-16 rounded-full overflow-hidden mx-auto mb-2 shadow-md border border-primary">
                {profileImageUrl && !imageError ? (
                  <img
                    src={profileImageUrl}
                    alt={userName}
                    onError={handleImageError}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-input">
                    <User className="text-primary w-8 h-8" />
                  </div>
                )}
              </div>
              <h2 className="text-base font-semibold text-text text-center">{userName}</h2>
              <p className="text-muted text-sm text-center">@{userName.toLowerCase().replace(/\s/g, "_")}</p>
            </div>
            <div className="flex flex-col items-center space-y-2">
              <input
                type="file"
                ref={profileImageInputRef}
                accept="image/*"
                className="hidden"
                onChange={handleProfileImageChange}
              />
              <Button
                onClick={() => profileImageInputRef.current?.click()}
                className="button-primary rounded-full px-3 py-1 text-sm hover:shadow-lg transition-all flex items-center"
              >
                <Camera className="w-4 h-4 mr-1" /> Change Photo
              </Button>
              <Button
                onClick={handleNameChange}
                className="border border-primary text-primary hover:bg-input rounded-full px-3 py-1 text-sm transition-all"
              >
                Edit Name
              </Button>
              <Dialog.Close asChild>
                <Button className="bg-accent/20 text-accent rounded-full px-3 py-1 text-sm hover:bg-accent/30 transition-all">
                  Close
                </Button>
              </Dialog.Close>
            </div>
          </Dialog.Content>
        </motion.div>
      </Dialog.Portal>
    </Dialog.Root>
  );
};

export default ProfileDialog;