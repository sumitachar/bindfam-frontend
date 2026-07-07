import React, { useContext, useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { User, Calendar, Baby, Upload, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { UserContext } from "@/context/UserContext";
import { createSubUser } from "@/api/Auth/auth";
import * as Toast from "@radix-ui/react-toast";

const relationOptions = [
  { value: "Father", label: "Father" },
  { value: "Mother", label: "Mother" },
  { value: "Son", label: "Son" },
  { value: "Daughter", label: "Daughter" },
  { value: "Nephew", label: "Nephew" },
  { value: "Niece", label: "Niece" },
  { value: "Grandson", label: "Grandson" },
  { value: "Granddaughter", label: "Granddaughter" },
  { value: "Other", label: "Other" },
];

export function CreateChildProfilePage({ opened, onClose }) {
  const { refreshChildProfiles } = useContext(UserContext);
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [toastOpen, setToastOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState("");

  const [formData, setFormData] = useState({
    name: "",
    dateOfBirth: "",
    gender: "",
    relationOfMember: "",
    profileImage: null,
  });

  const fileInputRef = useRef(null);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    const files = e.target.files;

    if (name === "profileImage" && files && files[0]) {
      const file = files[0];
      setFormData((prev) => ({ ...prev, profileImage: file }));
      setPreview(URL.createObjectURL(file));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Required validation
      if (!formData.name.trim()) {
        throw new Error("Child's name is required.");
      }

      if (!formData.dateOfBirth) {
        throw new Error("Date of Birth is required.");
      }

      if (!formData.gender) {
        throw new Error("Gender is required.");
      }

      // Date validation
      const dob = new Date(formData.dateOfBirth);
      if (isNaN(dob.getTime())) {
        throw new Error("Invalid date format.");
      }
      if (dob > new Date()) {
        throw new Error("Date of Birth cannot be in the future.");
      }

      // Prepare FormData for multipart upload
      const formDataObj = new FormData();
      formDataObj.append("name", formData.name.trim());
      formDataObj.append("dateOfBirth", formData.dateOfBirth); // YYYY-MM-DD format from <input type="date">
      formDataObj.append("gender", formData.gender);

      // Optional fields
      if (formData.relationOfMember) {
        formDataObj.append("relationOfMember", formData.relationOfMember);
      }
      if (formData.profileImage) {
        formDataObj.append("profileImage", formData.profileImage);
      }

      await createSubUser(formDataObj);
      await refreshChildProfiles?.();

      // Success toast & reset
      setToastMessage("Child profile created successfully!");
      setToastOpen(true);

      // Reset form
      setFormData({
        name: "",
        dateOfBirth: "",
        gender: "",
        relationOfMember: "",
        profileImage: null,
      });
      setPreview(null);
      if (fileInputRef.current) fileInputRef.current.value = "";

      onClose();
    } catch (err) {
      const msg =
        err?.response?.data?.message ||
        err?.message ||
        "Failed to create profile.";
      setToastMessage(msg);
      setToastOpen(true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {opened && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            className="glass-card border border-primary-50 w-full max-w-lg rounded-2xl shadow-xl p-6 max-h-[90vh] overflow-y-auto"
            initial={{ y: -50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -50, opacity: 0 }}
          >
            {/* Header */}
            <div className="flex justify-between items-center border-b border-primary-50 pb-2 mb-4">
              <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                Add Child Profile <Baby className="w-5 h-5 text-primary" />
              </h2>
              <Button variant="ghost" onClick={onClose} className="p-1 text-primary">
                <X className="w-6 h-6" />
              </Button>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Profile Image */}
              <div className="flex flex-col items-center">
                <label className="relative w-24 h-24 cursor-pointer">
                  <input
                    type="file"
                    name="profileImage"
                    accept="image/*"
                    className="hidden"
                    ref={fileInputRef}
                    onChange={handleInputChange}
                  />
                  <div className="w-24 h-24 rounded-full border-2 border-dashed border-primary-50 flex items-center justify-center hover:bg-gray-50 overflow-hidden transition">
                    {preview ? (
                      <img
                        src={preview}
                        alt="Preview"
                        className="w-full h-full object-cover rounded-full"
                      />
                    ) : (
                      <Upload className="w-6 h-6 text-primary" />
                    )}
                  </div>
                </label>
                <p className="text-xs text-primary mt-2">Upload Photo (Optional)</p>
              </div>

              {/* Name */}
              <div>
                <label className="text-sm font-medium text-primary mb-1 block">
                  Child's Name *
                </label>
                <div className="flex items-center bg-gray-input border border-primary-50 rounded-lg px-3 py-2">
                  <User className="w-5 h-5 text-primary mr-2" />
                  <input
                    type="text"
                    name="name"
                    placeholder="Enter name"
                    value={formData.name}
                    onChange={handleInputChange}
                    className="w-full outline-none text-sm text-gray-900 bg-transparent"
                    required
                  />
                </div>
              </div>

              {/* Date of Birth */}
              <div>
                <label className="text-sm font-medium text-primary mb-1 block">
                  Date of Birth *
                </label>
                <div className="flex items-center bg-gray-input border border-primary-50 rounded-lg px-3 py-2">
                  <Calendar className="w-5 h-5 text-primary mr-2" />
                  <input
                    type="date"
                    name="dateOfBirth"
                    value={formData.dateOfBirth}
                    onChange={handleInputChange}
                    max={new Date().toISOString().split("T")[0]} // Prevent future dates
                    className="w-full outline-none text-sm text-gray-900 bg-transparent"
                    required
                  />
                </div>
              </div>

              {/* Gender */}
              <div>
                <label className="text-sm font-medium text-primary mb-1 block">
                  Gender *
                </label>
                <div className="flex items-center bg-gray-input border border-primary-50 rounded-lg px-3 py-2">
                  <Baby className="w-5 h-5 text-primary mr-2" />
                  <select
                    name="gender"
                    value={formData.gender}
                    onChange={handleInputChange}
                    className="w-full outline-none text-sm text-gray-900 bg-transparent"
                    required
                  >
                    <option value="">Select gender</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                  </select>
                </div>
              </div>

              {/* Relation of Member - NEW FIELD */}
              <div>
                <label className="text-sm font-medium text-primary mb-1 block">
                  Relation to You (Optional)
                </label>
                <div className="flex items-center bg-gray-input border border-primary-50 rounded-lg px-3 py-2">
                  <User className="w-5 h-5 text-primary mr-2" />
                  <select
                    name="relationOfMember"
                    value={formData.relationOfMember}
                    onChange={handleInputChange}
                    className="w-full outline-none text-sm text-gray-900 bg-transparent"
                  >
                    <option value="">Select relation</option>
                    {relationOptions.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Submit Button */}
              <Button
                type="submit"
                disabled={loading}
                className="w-full button-primary rounded-full text-sm hover:shadow-lg transition-all disabled:opacity-50"
              >
                {loading ? "Saving..." : "Save Profile"}
              </Button>
            </form>

            {/* Toast Notification */}
            <Toast.Provider swipeDirection="right">
              <Toast.Root
                open={toastOpen}
                onOpenChange={setToastOpen}
                className="bg-white rounded-xl p-4 shadow-lg border border-primary-50 data-[state=open]:animate-in data-[state=closed]:animate-out transition"
              >
                <Toast.Description className="text-gray-900">
                  {toastMessage}
                </Toast.Description>
                <Toast.Close className="absolute top-2 right-2 text-primary text-xl leading-none">
                  ×
                </Toast.Close>
              </Toast.Root>
              <Toast.Viewport className="fixed bottom-4 right-4 flex flex-col gap-2 w-80 max-w-full" />
            </Toast.Provider>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}