// components/UserProfileSection.jsx
import React, { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { Camera, Edit3, User as UserIcon, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import * as Dialog from "@radix-ui/react-dialog";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";
import * as Toast from "@radix-ui/react-toast";
import { uploadProfileImage, updateProfile } from "@/api/Auth/auth";

const FallbackUserSVG = ({ className = "" }) => (
  <div
    className={`flex items-center justify-center bg-input rounded-full border border-primary ${className}`}
  >
    <UserIcon className="w-1/2 h-1/2 text-primary" />
  </div>
);

const UserProfileSkeleton = () => (
  <div className="glass-card rounded-2xl shadow-soft overflow-hidden w-full animate-pulse">
    <div className="relative h-20 bg-input"></div>
    <div className="pt-8 pb-3 px-3">
      <div className="h-5 w-3/4 bg-input rounded mb-2"></div>
      <div className="h-4 w-1/2 bg-input rounded mb-2"></div>
      <div className="h-7 w-20 bg-input rounded-lg"></div>
    </div>
  </div>
);

export default function UserProfileSection({ user, setUser }) {
  const [isUserLoading, setIsUserLoading] = useState(true);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    mobile: "",
    dob: "",
    bio: "Write your bio here...",
    userCode: "",
  });
  const [editOpened, setEditOpened] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [userImageError, setUserImageError] = useState(false);
  const [userImageLoaded, setUserImageLoaded] = useState(false);
  const [toastOpen, setToastOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const fileInputRef = useRef(null);

  const getUserGradient = (userCode) => {
    // 1. Initial Check
    if (!userCode) {
      console.warn("No userCode provided, returning default purple gradient.");
      return { background: "linear-gradient(135deg, #6b21a8, #7c3aed)" };
    }

    // 2. Generate Hash
    let hash = 0;
    for (let i = 0; i < userCode.length; i++) {
      hash = userCode.charCodeAt(i) + ((hash << 5) - hash);
    }

    // 3. Calculate Hues
    // Math.abs ensures we don't get negative hue values
    const hue1 = Math.abs(hash % 360);
    const hue2 = (hue1 + 40) % 360;

    // 4. Construct CSS
    const gradientString = `linear-gradient(135deg, hsl(${hue1}, 75%, 50%), hsl(${hue2}, 70%, 45%))`;

    return { background: gradientString };
  };

  // Test it
  // getUserGradient("PR2803031018");

  const getUserImageUrl = user?.profileImageUrl || null;

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || "",
        email: user.email || "",
        mobile: user.mobile || "",
        dob: user.dob || "",
        bio: user.bio || "Write your bio here...",
        userCode: user.userCode || "",
      });

      setIsUserLoading(false);
    }
  }, [user]);

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    try {
      setUploadingImage(true);

      const response = await uploadProfileImage(user.userCode, file);

      setUser((prev) => ({
        ...prev,
        profileImageUrl: response.profileImageUrl + "&t=" + Date.now(),
      }));

      // ✅ ADD THIS
      setUserImageError(false);
      setUserImageLoaded(true);

      setToastMessage("Profile image updated successfully");
      setToastOpen(true);
    } catch (err) {
      setToastMessage("Failed to upload image");
      setToastOpen(true);
    } finally {
      setUploadingImage(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleSaveProfile = async () => {
    try {
      const payload = {
        name: formData.name,
        email: formData.email,
        mobile: formData.mobile,
        bio: formData.bio,
        dob: formData.dob || null,
      };

      const response = await updateProfile({
        ...payload,
        userCode: user.userCode,
      });

      setUser((prev) => ({
        ...prev,
        ...response,
        profileImageUrl: prev.profileImageUrl,
      }));

      setToastMessage("Profile updated successfully");
      setToastOpen(true);
      setEditOpened(false);
    } catch (err) {
      setToastMessage(
        "Failed to update profile: " + (err.message || "Unknown error"),
      );
      setToastOpen(true);
    }
  };

  if (isUserLoading) return <UserProfileSkeleton />;

  return (
    <>
      <motion.div className="glass-card border border-primary rounded-2xl shadow-soft overflow-hidden mb-4">
        {/* The style prop here is what makes the dynamic gradient visible */}
        <div
          className="relative rounded-2xl p-5 transition-all duration-500 ease-in-out"
          style={getUserGradient(user?.userCode)}
        >
          {/* Glass overlay for extra depth */}
          <div className="absolute inset-0 bg-white/5 backdrop-blur-[1px] pointer-events-none" />

          <div className="relative z-10 grid grid-cols-1 sm:grid-cols-3 gap-4 items-center">
            <div className="flex justify-center sm:justify-start">
              <label className="relative cursor-pointer group">
                {getUserImageUrl && !userImageError ? (
                  <img
                    src={getUserImageUrl}
                    alt="Profile"
                    className="w-20 h-20 rounded-full border-4 border-white/30 shadow-md object-cover"
                    onError={() => setUserImageError(true)}
                  />
                ) : (
                  <FallbackUserSVG className="w-20 h-20 rounded-full border-4 border-white/30 shadow-md bg-white/10" />
                )}

                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                  ref={fileInputRef}
                />
                <motion.div
                  whileHover={{ scale: 1.1 }}
                  className="absolute bottom-0 right-0 bg-white rounded-full p-1.5 shadow-lg border border-primary/20"
                >
                  {uploadingImage ? (
                    <div className="animate-spin w-4 h-4 border-2 border-primary border-t-transparent rounded-full" />
                  ) : (
                    <Camera className="w-4 h-4 text-primary" />
                  )}
                </motion.div>
              </label>
            </div>

            {/* Changed text-black to text-white for better readability on gradients */}
            <div className="col-span-2 text-white">
              <motion.h2
                initial={{ y: 40 }}
                animate={{ y: 0 }}
                transition={{ type: "spring", stiffness: 100 }}
                className="text-2xl font-black flex flex-col sm:flex-row sm:items-baseline gap-1 sm:gap-2"
              >
                <span className="text-lg font-medium opacity-80">Welcome,</span>
                <span className="drop-shadow-[0_2px_10px_rgba(255,255,255,0.3)]">
                  {formData.name?.split(" ")[0] || "User"}
                </span>
              </motion.h2>
              <p className="text-sm opacity-90 font-medium">
                {formData.email || "No email"}
              </p>
              <div className="flex flex-wrap gap-2 mt-3">
                {formData.userCode && (
                  <span className="bg-white/20 border border-white/20 backdrop-blur-md px-3 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider">
                    Code: {formData.userCode}
                  </span>
                )}
                {formData.mobile && (
                  <span className="bg-white/20 border border-white/20 backdrop-blur-md px-3 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider">
                    Mobile: {formData.mobile}
                  </span>
                )}
                {formData.dob && (
                  <span className="bg-white/20 border border-white/20 backdrop-blur-md px-3 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider">
                    DOB: {formData.dob}
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Bio and Action section stays outside the gradient on a clean white background */}
        <div className="px-5 py-4 bg-white/50">
          {formData.bio && formData.bio !== "Write your bio here..." && (
            <p className="text-slate-600 italic text-sm leading-relaxed mb-3">
              "{formData.bio}"
            </p>
          )}

          <div className="flex justify-end items-center w-full">
            <Button
              onClick={() => setEditOpened(true)}
              className="button-primary rounded-full px-5 py-1 text-xs font-semibold hover:shadow-lg transition-all"
            >
              <Edit3 className="w-3.5 h-3.5 mr-2" /> Edit Profile
            </Button>
          </div>
        </div>
      </motion.div>

      {/* Edit Profile Modal */}
      <Dialog.Root open={editOpened} onOpenChange={setEditOpened}>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100]" />
          <div className="fixed inset-0 flex items-center justify-center p-4 z-[101]">
            <Dialog.Content asChild>
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="glass-card border border-primary w-full max-w-md rounded-2xl shadow-soft p-4 max-h-[90vh] overflow-y-auto"
              >
                <VisuallyHidden>
                  <Dialog.Title>Edit Profile</Dialog.Title>
                </VisuallyHidden>
                <div className="flex justify-between items-center mb-3">
                  <h2 className="font-semibold text-text flex items-center gap-1 text-base">
                    <Edit3 className="w-4 h-4 text-primary" /> Edit Profile
                  </h2>
                  <Dialog.Close asChild>
                    <Button
                      variant="ghost"
                      className="text-primary hover:bg-input rounded-full p-1"
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </Dialog.Close>
                </div>
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    handleSaveProfile();
                  }}
                  className="space-y-3"
                >
                  <div>
                    <label className="block text-sm font-medium text-primary mb-1">
                      Full Name
                    </label>
                    <Input
                      value={formData.name}
                      onChange={(e) =>
                        setFormData({ ...formData, name: e.target.value })
                      }
                      className="w-full bg-input border border-primary text-text text-sm rounded-full"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-primary mb-1">
                      Email Address
                    </label>
                    <Input
                      type="email"
                      value={formData.email}
                      onChange={(e) =>
                        setFormData({ ...formData, email: e.target.value })
                      }
                      className="w-full bg-input border border-primary text-text text-sm rounded-full"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-primary mb-1">
                      Mobile Number
                    </label>
                    <Input
                      type="tel"
                      value={formData.mobile}
                      onChange={(e) =>
                        setFormData({ ...formData, mobile: e.target.value })
                      }
                      className="w-full bg-input border border-primary text-text text-sm rounded-full"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-primary mb-1">
                      Date of Birth
                    </label>
                    <Input
                      type="date"
                      value={formData.dob}
                      onChange={(e) =>
                        setFormData({ ...formData, dob: e.target.value })
                      }
                      className="w-full bg-input border border-primary text-text text-sm rounded-full"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-primary mb-1">
                      Bio
                    </label>
                    <Textarea
                      value={formData.bio}
                      onChange={(e) =>
                        setFormData({ ...formData, bio: e.target.value })
                      }
                      className="w-full bg-input border border-primary text-text text-sm rounded-lg"
                      rows={3}
                    />
                  </div>
                  <div className="flex gap-2 pt-1">
                    <Dialog.Close asChild>
                      <Button
                        variant="outline"
                        className="flex-1 border border-primary text-primary hover:bg-input rounded-full text-sm"
                      >
                        Cancel
                      </Button>
                    </Dialog.Close>
                    <Button
                      type="submit"
                      className="flex-1 button-primary rounded-full text-sm hover:shadow-lg transition-all"
                    >
                      Save Changes
                    </Button>
                  </div>
                </form>
              </motion.div>
            </Dialog.Content>
          </div>
        </Dialog.Portal>
      </Dialog.Root>

      <Toast.Provider swipeDirection="right">
        <Toast.Root
          open={toastOpen}
          onOpenChange={setToastOpen}
          className="glass-card rounded-xl p-3 shadow-soft border border-primary"
        >
          <Toast.Description className="text-text text-sm">
            {toastMessage}
          </Toast.Description>
          <Toast.Close className="absolute top-2 right-2 text-primary">
            ×
          </Toast.Close>
        </Toast.Root>
        <Toast.Viewport className="fixed bottom-4 right-4" />
      </Toast.Provider>
    </>
  );
}
