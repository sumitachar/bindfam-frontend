// src/pages/components/EditProfileModal.jsx
import * as Dialog from "@radix-ui/react-dialog";
import { motion } from "framer-motion";
import { toast } from "sonner";
import {
  Edit3,
  X,
  User,
  Mail,
  Phone,
  Calendar,
  FileText,
  Stethoscope,
  GraduationCap,
  IdCard,
  Briefcase,
  Building,
  Plus,
  Trash2,
} from "lucide-react";
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";

const EditProfileModal = ({
  editOpened,
  setEditOpened,
  formData,
  setFormData,
  doctorAdvanceData,
  setdoctorAdvanceData,
  handleSave,
  loading,
  isDoctor = false,
}) => {
  const [isSmallScreen, setIsSmallScreen] = useState(false);

  useEffect(() => {
    const checkDevice = () => {
      setIsSmallScreen(window.innerHeight < 600 || window.innerWidth < 380);
    };
    checkDevice();
    window.addEventListener("resize", checkDevice);
    return () => window.removeEventListener("resize", checkDevice);
  }, []);

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleDoctorChange = (field, value) => {
    setdoctorAdvanceData((prev) => ({ ...prev, [field]: value }));
  };

  // Add a new clinic
  const addClinic = () => {
    setdoctorAdvanceData((prev) => ({
      ...prev,
      clinics: [
        ...(prev.clinics || []),
        {
          clinicName: "",
          clinicAddress: "",
          phone: "",
          consultationFee: null,
          visitingDays: [], // ✅ separate array
          visitingTime: "", // ✅ separate string
          isOnline: false,
          isPrimary: (prev.clinics || []).length === 0, // first clinic is primary
        },
      ],
    }));
  };

  // Remove a clinic
  const removeClinic = (index) => {
    setdoctorAdvanceData((prev) => {
      const newClinics = (prev.clinics || []).filter((_, i) => i !== index);

      // Ensure at least one clinic remains primary
      if (newClinics.length > 0 && !newClinics.some((c) => c.isPrimary)) {
        newClinics[0].isPrimary = true;
      }

      return { ...prev, clinics: newClinics };
    });
  };

  // Update a clinic field
  const updateClinic = (index, field, value) => {
    setdoctorAdvanceData((prev) => {
      const newClinics = [...(prev.clinics || [])];

      if (field === "visitingDays" || field === "visitingTime") {
        newClinics[index] = {
          ...newClinics[index],
          [field]: value,
        };
      } else {
        newClinics[index] = { ...newClinics[index], [field]: value };

        // If setting isPrimary, update all other clinics
        if (field === "isPrimary" && value) {
          newClinics.forEach((c, i) => {
            c.isPrimary = i === index;
          });
        }
      }

      return { ...prev, clinics: newClinics };
    });
  };

  const validateAndSave = async (e) => {
    e.preventDefault();

    if (!formData.name?.trim()) {
      toast.error("Full name is required");
      return;
    }
    if (
      formData.email &&
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email.trim())
    ) {
      toast.error("Please enter a valid email address");
      return;
    }
    if (
      formData.mobile &&
      !/^(\+91)?[0-9]{10}$/.test(formData.mobile.replace(/\s/g, ""))
    ) {
      toast.error("Please enter a valid 10-digit mobile number");
      return;
    }

    if (isDoctor) {
      if (
        doctorAdvanceData.experienceYears !== null &&
        doctorAdvanceData.experienceYears !== "" &&
        (isNaN(doctorAdvanceData.experienceYears) ||
          doctorAdvanceData.experienceYears < 0)
      ) {
        toast.error("Experience years must be a valid non-negative number");
        return;
      }

      const clinics = doctorAdvanceData.clinics || [];

      if (clinics.length === 0) {
        toast.error("Please add at least one clinic");
        return;
      }

      for (const clinic of clinics) {
        if (!clinic.clinicName?.trim()) {
          toast.error("Clinic name is required for all clinics");
          return;
        }
      }
    }

    try {
      await handleSave();
    } catch (err) {
      console.error("Save failed:", err);
      toast.error(err.message || "Failed to update profile");
    }
  };

  return (
    <Dialog.Root open={editOpened} onOpenChange={setEditOpened}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50" />

        <Dialog.Content
          className={`fixed inset-0 z-50 flex items-center justify-center p-4 ${
            isSmallScreen ? "p-2" : "p-6"
          }`}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ duration: 0.2 }}
            className={`glass-card border border-primary w-full max-w-3xl rounded-2xl shadow-2xl overflow-hidden max-h-[90vh] ${
              isSmallScreen ? "max-h-[85vh]" : ""
            }`}
          >
            {/* Header */}
            <div className="flex items-center justify-between p-5 border-b border-primary/20 bg-gradient-to-r from-primary/10 to-primary/5">
              <Dialog.Title className="text-xl font-bold text-accent flex items-center gap-3">
                <Edit3 className="w-6 h-6 text-primary" />
                Edit Profile
              </Dialog.Title>
              <Dialog.Close asChild>
                <button
                  className="p-2 rounded-full hover:bg-input/80 transition-all"
                  aria-label="Close"
                >
                  <X className="w-5 h-5 text-primary" />
                </button>
              </Dialog.Close>
            </div>

            {/* Scrollable Form */}
            <form
              onSubmit={validateAndSave}
              className="p-5 space-y-6 overflow-y-auto max-h-[70vh]"
            >
              {/* General Information */}
              <div className="space-y-5">
                <h3 className="text-lg font-semibold text-primary flex items-center gap-2">
                  <User className="w-5 h-5" />
                  Personal Information
                </h3>

                {/* Full Name */}
                <div>
                  <label className="block text-sm font-medium text-primary mb-1.5">
                    Full Name <span className="text-red-500">*</span>
                  </label>
                  <div className="flex items-center bg-input border border-primary rounded-full px-4 py-3">
                    <User className="w-5 h-5 text-primary mr-3 flex-shrink-0" />
                    <input
                      type="text"
                      value={formData.name || ""}
                      onChange={(e) => handleChange("name", e.target.value)}
                      className="w-full bg-transparent outline-none text-text text-sm placeholder:text-muted"
                      placeholder="Dr. John Doe"
                      required
                    />
                  </div>
                </div>

                {/* Email */}
                <div>
                  <label className="block text-sm font-medium text-primary mb-1.5">
                    Email Address
                  </label>
                  <div className="flex items-center bg-input border border-primary rounded-full px-4 py-3">
                    <Mail className="w-5 h-5 text-primary mr-3 flex-shrink-0" />
                    <input
                      type="email"
                      value={formData.email || ""}
                      onChange={(e) => handleChange("email", e.target.value)}
                      className="w-full bg-transparent outline-none text-text text-sm placeholder:text-muted"
                      placeholder="doctor@example.com"
                    />
                  </div>
                </div>

                {/* Mobile */}
                <div>
                  <label className="block text-sm font-medium text-primary mb-1.5">
                    Mobile Number
                  </label>
                  <div className="flex items-center bg-input border border-primary rounded-full px-4 py-3">
                    <Phone className="w-5 h-5 text-primary mr-3 flex-shrink-0" />
                    <input
                      type="tel"
                      value={formData.mobile || ""}
                      onChange={(e) => handleChange("mobile", e.target.value)}
                      className="w-full bg-transparent outline-none text-text text-sm placeholder:text-muted"
                      placeholder="+919876543210"
                    />
                  </div>
                </div>

                {/* Date of Birth */}
                <div>
                  <label className="block text-sm font-medium text-primary mb-1.5">
                    Date of Birth
                  </label>
                  <div className="flex items-center bg-input border border-primary rounded-full px-4 py-3">
                    <Calendar className="w-5 h-5 text-primary mr-3 flex-shrink-0" />
                    <input
                      type="date"
                      value={formData.dob || ""}
                      onChange={(e) => handleChange("dob", e.target.value)}
                      className="w-full bg-transparent outline-none text-text text-sm"
                    />
                  </div>
                </div>

                {/* Bio */}
                <div>
                  <label className="block text-sm font-medium text-primary mb-1.5">
                    Professional Bio
                  </label>
                  <div className="flex items-start bg-input border border-primary rounded-2xl px-4 py-3 min-h-32">
                    <FileText className="w-5 h-5 text-primary mr-3 mt-1 flex-shrink-0" />
                    <textarea
                      value={formData.bio || ""}
                      onChange={(e) => handleChange("bio", e.target.value)}
                      rows={5}
                      className="w-full bg-transparent outline-none text-text text-sm placeholder:text-muted resize-none"
                      placeholder="Tell us about your experience and passion for child healthcare..."
                    />
                  </div>
                </div>
              </div>

              {/* Doctor Professional Details */}
              {isDoctor && (
                <div className="space-y-6 pt-6 border-t-2 border-primary/20">
                  <h3 className="text-lg font-semibold text-primary flex items-center gap-2">
                    <Stethoscope className="w-6 h-6" />
                    Professional Details
                  </h3>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    {/* Specialization */}
                    <div>
                      <label className="block text-sm font-medium text-primary mb-1.5">
                        Specialization
                      </label>
                      <div className="flex items-center bg-input border border-primary rounded-full px-4 py-3">
                        <Stethoscope className="w-5 h-5 text-primary mr-3 flex-shrink-0" />
                        <input
                          type="text"
                          value={doctorAdvanceData?.specialization || ""}
                          onChange={(e) =>
                            handleDoctorChange("specialization", e.target.value)
                          }
                          className="w-full bg-transparent outline-none text-text text-sm placeholder:text-muted"
                          placeholder="e.g., Pediatrics"
                        />
                      </div>
                    </div>

                    {/* Qualification */}
                    <div>
                      <label className="block text-sm font-medium text-primary mb-1.5">
                        Qualification
                      </label>
                      <div className="flex items-center bg-input border border-primary rounded-full px-4 py-3">
                        <GraduationCap className="w-5 h-5 text-primary mr-3 flex-shrink-0" />
                        <input
                          type="text"
                          value={doctorAdvanceData?.qualification || ""}
                          onChange={(e) =>
                            handleDoctorChange("qualification", e.target.value)
                          }
                          className="w-full bg-transparent outline-none text-text text-sm placeholder:text-muted"
                          placeholder="e.g., MBBS, MD"
                        />
                      </div>
                    </div>

                    {/* Registration Number */}
                    <div>
                      <label className="block text-sm font-medium text-primary mb-1.5">
                        Registration Number
                      </label>
                      <div className="flex items-center bg-input border border-primary rounded-full px-4 py-3">
                        <IdCard className="w-5 h-5 text-primary mr-3 flex-shrink-0" />
                        <input
                          type="text"
                          value={doctorAdvanceData?.registrationNumber || ""}
                          onChange={(e) =>
                            handleDoctorChange(
                              "registrationNumber",
                              e.target.value
                            )
                          }
                          className="w-full bg-transparent outline-none text-text text-sm placeholder:text-muted"
                          placeholder="Medical Council Registration"
                        />
                      </div>
                    </div>

                    {/* Experience Years */}
                    <div>
                      <label className="block text-sm font-medium text-primary mb-1.5">
                        Years of Experience
                      </label>
                      <div className="flex items-center bg-input border border-primary rounded-full px-4 py-3">
                        <Briefcase className="w-5 h-5 text-primary mr-3 flex-shrink-0" />
                        <input
                          type="number"
                          min="0"
                          value={doctorAdvanceData?.experienceYears ?? ""}
                          onChange={(e) =>
                            handleDoctorChange(
                              "experienceYears",
                              e.target.value === ""
                                ? null
                                : Number(e.target.value)
                            )
                          }
                          className="w-full bg-transparent outline-none text-text text-sm placeholder:text-muted"
                          placeholder="e.g., 15"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Clinics */}
                  <div className="space-y-4 mt-8">
                    <div className="flex items-center justify-between">
                      <h4 className="text-base font-semibold text-primary flex items-center gap-2">
                        <Building className="w-5 h-5" />
                        My Clinics
                      </h4>
                      <Button
                        type="button"
                        onClick={addClinic}
                        className="button-primary text-xs px-4 py-2 rounded-full flex items-center gap-2"
                      >
                        <Plus className="w-4 h-4" />
                        Add Clinic
                      </Button>
                    </div>

                    {(doctorAdvanceData?.clinics || []).length === 0 && (
                      <p className="text-sm text-muted-foreground italic py-4 text-center">
                        No clinics added yet. Click "Add Clinic" to get started.
                      </p>
                    )}

                    {(doctorAdvanceData?.clinics || []).map((clinic, index) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="p-6 bg-input/50 rounded-xl border border-primary/20 space-y-5"
                      >
                        {/* Primary & Delete Row */}
                        <div className="flex items-center justify-between">
                          <label className="flex items-center gap-2 text-sm font-medium text-primary">
                            <input
                              type="radio"
                              name="primaryClinic"
                              checked={clinic.isPrimary || false}
                              onChange={() =>
                                updateClinic(index, "isPrimary", true)
                              }
                              className="rounded-full text-primary focus:ring-primary"
                            />
                            Primary Clinic
                          </label>

                          {(doctorAdvanceData.clinics || []).length > 1 && (
                            <button
                              type="button"
                              onClick={() => removeClinic(index)}
                              className="text-red-500 hover:text-red-700 transition-colors"
                              aria-label="Delete clinic"
                            >
                              <Trash2 className="w-5 h-5" />
                            </button>
                          )}
                        </div>

                        {/* Clinic Name */}
                        <div>
                          <label className="block text-sm font-medium text-primary mb-1">
                            Clinic Name <span className="text-red-500">*</span>
                          </label>
                          <input
                            type="text"
                            value={clinic.clinicName || ""}
                            onChange={(e) =>
                              updateClinic(index, "clinicName", e.target.value)
                            }
                            placeholder="e.g., Blustar Nursing Home"
                            className="w-full bg-input border border-primary rounded-lg px-4 py-3 text-sm focus:ring-2 focus:ring-primary/50"
                            required
                          />
                        </div>

                        {/* Clinic Address */}
                        <div>
                          <label className="block text-sm font-medium text-primary mb-1">
                            Clinic Address
                          </label>
                          <textarea
                            value={clinic.clinicAddress || ""}
                            onChange={(e) =>
                              updateClinic(
                                index,
                                "clinicAddress",
                                e.target.value
                              )
                            }
                            placeholder="e.g., Tamluk, Purba Medinipur"
                            rows={3}
                            className="w-full bg-input border border-primary rounded-lg px-4 py-3 text-sm resize-none focus:ring-2 focus:ring-primary/50"
                          />
                        </div>

                        {/* Phone & Fee */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-primary mb-1">
                              Phone Number
                            </label>
                            <input
                              type="tel"
                              value={clinic.phone || ""}
                              onChange={(e) =>
                                updateClinic(index, "phone", e.target.value)
                              }
                              placeholder="e.g., +91 9876543210"
                              className="w-full bg-input border border-primary rounded-lg px-4 py-3 text-sm focus:ring-2 focus:ring-primary/50"
                            />
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-primary mb-1">
                              Consultation Fee (₹)
                            </label>
                            <input
                              type="number"
                              min="0"
                              value={clinic.consultationFee || ""}
                              onChange={(e) =>
                                updateClinic(
                                  index,
                                  "consultationFee",
                                  e.target.value === ""
                                    ? null
                                    : Number(e.target.value)
                                )
                              }
                              placeholder="e.g., 500"
                              className="w-full bg-input border border-primary rounded-lg px-4 py-3 text-sm focus:ring-2 focus:ring-primary/50"
                            />
                          </div>
                        </div>

                        {/* Visiting Days */}
                        <input
                          type="text"
                          value={(clinic.visitingDays || []).join(", ")}
                          onChange={(e) => {
                            const text = e.target.value;

                            // important: DO NOT filter empty here
                            const days = text.split(",").map((d) => d.trim());

                            updateClinic(index, "visitingDays", days);
                          }}
                          onBlur={() => {
                            // clean only when user leaves input
                            updateClinic(
                              index,
                              "visitingDays",
                              (clinic.visitingDays || []).filter(Boolean)
                            );
                          }}
                          placeholder="e.g., Mon, Tue, Wed"
                          className="w-full bg-input border border-primary rounded-lg px-4 py-3 text-sm focus:ring-2 focus:ring-primary/50"
                        />

                        {/* Visiting Time */}
                        <div className="mt-3">
                          <label className="block text-sm font-medium text-primary mb-1">
                            Visiting Time
                          </label>
                          <input
                            type="text"
                            value={clinic.visitingTime || ""}
                            onChange={(e) => {
                              // আগের visitingDays preserve করে শুধু visitingTime update করি
                              updateClinic(
                                index,
                                "visitingTime",
                                e.target.value
                              );
                            }}
                            placeholder="e.g., 10 AM – 6 PM"
                            className="w-full bg-input border border-primary rounded-lg px-4 py-3 text-sm focus:ring-2 focus:ring-primary/50"
                          />
                        </div>

                        {/* Optional display */}
                        <p className="text-sm text-muted-foreground mt-1">
                          {clinic.visitingDays?.length || clinic.visitingTime
                            ? `Days: ${(clinic.visitingDays || []).join(
                                ", "
                              )} | Time: ${clinic.visitingTime || "-"}`
                            : "No visiting hours set"}
                        </p>

                        {/* Online Consultation */}
                        <div className="flex items-center gap-3">
                          <input
                            type="checkbox"
                            id={`online-${index}`}
                            checked={clinic.isOnline || false}
                            onChange={(e) =>
                              updateClinic(index, "isOnline", e.target.checked)
                            }
                            className="w-5 h-5 rounded text-primary focus:ring-primary"
                          />
                          <label
                            htmlFor={`online-${index}`}
                            className="text-sm font-medium text-primary cursor-pointer"
                          >
                            Offers Online Consultation
                          </label>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>
              )}

              {/* Actions */}
              <div className="grid grid-cols-2 gap-3 pt-6 border-t border-primary/20">
                <Dialog.Close asChild>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    type="button"
                    className="w-full button-secondary text-accent py-3 rounded-xl font-medium shadow-soft hover:shadow-lg transition-all text-sm"
                  >
                    Cancel
                  </motion.button>
                </Dialog.Close>

                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  type="submit"
                  disabled={loading}
                  className="w-full button-primary text-white py-3 rounded-xl font-medium shadow-soft hover:shadow-lg transition-all disabled:opacity-70 disabled:cursor-not-allowed text-sm flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Saving...
                    </>
                  ) : (
                    "Save Changes"
                  )}
                </motion.button>
              </div>
            </form>
          </motion.div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
};

export default EditProfileModal;
