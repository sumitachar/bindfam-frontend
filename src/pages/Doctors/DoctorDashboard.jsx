// src/pages/DoctorDashboard.jsx
import React, {
  useContext,
  useRef,
  useEffect,
  useState,
  useCallback,
} from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import {
  Camera,
  Edit3,
  User as UserIcon,
  Stethoscope,
  GraduationCap,
  Calendar,
  MapPin,
  Briefcase,
  IdCard,
  Building,
  Phone,
  Globe,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

import { UserContext } from "@/context/UserContext";
import {
  uploadProfileImage,
  updateProfile as updateGeneralProfile,
  updateDoctorProfile,
  getDoctorProfile,
  getProfile, // ← Add this to refetch full user profile
} from "@/api/Auth/auth";

import EditProfileModal from "./components/EditProfileModal";

import {
  addDoctorClinic,
  deleteDoctorClinic,
  getDoctorClinics,
  updateDoctorClinic,
} from "@/api/Doctor/DoctorPrescribe";

const FallbackUserSVG = ({ className = "" }) => (
  <div
    className={`flex items-center justify-center bg-input rounded-full border-2 border-primary ${className}`}
  >
    <UserIcon className="w-1/2 h-1/2 text-primary" />
  </div>
);

export default function DoctorDashboardPage() {
  const {
    user,
    setUser,
    doctorAdvanceData,
    setdoctorAdvanceData,
  } = useContext(UserContext);
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  const [editOpened, setEditOpened] = useState(false);
  const [loading, setLoading] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [userImageError, setUserImageError] = useState(false);

  // General profile fields (for editing)
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    mobile: "",
    dob: "",
    bio: "Compassionate doctor dedicated to quality care and patient wellbeing.",
  });

  const getUserGradient = useCallback((userCode) => {
    if (!userCode) {
      return { background: "linear-gradient(135deg, #6b21a8, #7c3aed)" };
    }

    let hash = 0;
    for (let i = 0; i < userCode.length; i++) {
      hash = userCode.charCodeAt(i) + ((hash << 5) - hash);
    }

    const hue1 = Math.abs(hash % 360);
    const hue2 = (hue1 + 40) % 360;

    return {
      background: `linear-gradient(135deg, hsl(${hue1}, 70%, 55%), hsl(${hue2}, 70%, 45%))`,
    };
  }, []);

  const fetchDoctorProfile = useCallback(async () => {
    if (!user?.userCode || user?.role !== "doctor") return;

    try {
      const doctorProfile = await getDoctorProfile(user.userCode);

      setdoctorAdvanceData((prev) => ({
        ...prev,
        specialization: doctorProfile.specialization || "",
        qualification: doctorProfile.qualification || "",
        registrationNumber: doctorProfile.registrationNumber || "",
        experienceYears: doctorProfile.experienceYears ?? null,
      }));
    } catch (err) {
      console.error("Failed to fetch doctor profile:", err);
    }
  }, [user?.userCode, user?.role, setdoctorAdvanceData]);

  const fetchClinics = useCallback(async () => {
    if (!user?.userCode || user?.role !== "doctor") return;

    try {
      const data = await getDoctorClinics();
      const clinics = data.clinics || data || [];

      setdoctorAdvanceData((prev) => ({
        ...prev,
        clinics,
      }));
    } catch (err) {
      console.error("Failed to fetch clinics:", err);
      setdoctorAdvanceData((prev) => ({ ...prev, clinics: [] }));
    }
  }, [user?.userCode, user?.role, setdoctorAdvanceData]);

  // Sync form data with user context
  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || "",
        email: user.email || "",
        mobile: user.mobile || "",
        dob: user.dob || "",
        bio: user.bio || "Compassionate doctor dedicated to quality care and patient wellbeing.",
      });
    }
  }, [user]);

  useEffect(() => {
    fetchDoctorProfile();
    fetchClinics();
  }, [fetchDoctorProfile, fetchClinics]);

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image must be less than 5MB");
      return;
    }

    setUploadingImage(true);

    try {
      const updatedUser = await uploadProfileImage(user.userCode, file);

      // Update context with new image URL
      setUser((prev) => ({
        ...prev,
        profileImageUrl: updatedUser.profileImageUrl,
      }));

      setUserImageError(false);
      toast.success("Profile image updated!");
    } catch (err) {
      toast.error(err.message || "Failed to upload image");
    } finally {
      setUploadingImage(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleSaveProfile = async () => {
    try {
      setLoading(true);

      /* =========================
         1. Update general profile (name, email, mobile, bio, dob)
        ========================== */
      const generalPayload = {
        name: formData.name?.trim(),
        email: formData.email?.trim() || null,
        mobile: formData.mobile?.trim() || "",
        dob: formData.dob || null,
        bio: formData.bio?.trim() || null,
        userCode: user.userCode,
      };

      await updateGeneralProfile(generalPayload);

      /* =========================
         2. Update doctor-specific fields
        ========================== */
      const doctorPayload = {
        specialization: doctorAdvanceData.specialization?.trim() || null,
        qualification: doctorAdvanceData.qualification?.trim() || null,
        registrationNumber: doctorAdvanceData.registrationNumber?.trim() || null,
        experienceYears:
          doctorAdvanceData.experienceYears !== null &&
          doctorAdvanceData.experienceYears !== "" &&
          doctorAdvanceData.experienceYears !== undefined
            ? Number(doctorAdvanceData.experienceYears)
            : null,
      };

      await updateDoctorProfile(user.userCode, doctorPayload);

      /* =========================
         3. Handle clinics (add, update, delete)
        ========================== */
      const currentClinics = doctorAdvanceData.clinics || [];
      let previousClinics = [];

      try {
        const previousData = await getDoctorClinics();
        previousClinics = previousData?.clinics || previousData || [];
      } catch (err) {
        console.warn("Could not fetch previous clinics", err);
      }

      // Add or update
      for (const clinic of currentClinics) {
        const clinicPayload = {
          clinicName: clinic.clinicName?.trim(),
          clinicAddress: clinic.clinicAddress?.trim() || null,
          phone: clinic.phone?.trim() || null,
          consultationFee:
            clinic.consultationFee !== null && clinic.consultationFee !== undefined
              ? Number(clinic.consultationFee)
              : null,
          visitingDays: clinic.visitingDays || [],
          visitingTime: clinic.visitingTime || "",
          isOnline: !!clinic.isOnline,
          isPrimary: !!clinic.isPrimary,
        };

        if (!clinic.id) {
          await addDoctorClinic(clinicPayload);
        } else {
          await updateDoctorClinic(clinic.id, clinicPayload);
        }
      }

      // Delete removed
      if (previousClinics.length > 0) {
        const currentIds = currentClinics.map((c) => c.id).filter(Boolean);
        const deletedClinics = previousClinics.filter((c) => !currentIds.includes(c.id));

        for (const clinic of deletedClinics) {
          await deleteDoctorClinic(clinic.id);
        }
      }

      /* =========================
         4. REFRESH ALL DATA FROM SERVER (CRITICAL FIX)
        ========================== */
      try {
        // Re-fetch full user profile (includes name, bio, mobile, etc.)
        const freshUserRes = await getProfile();
        const freshUser = freshUserRes?.data || freshUserRes;
        setUser(freshUser);

        // Re-fetch doctor profile
        const freshDoctorProfile = await getDoctorProfile(user.userCode);
        
        // Re-fetch clinics
        const freshClinicsData = await getDoctorClinics();
        const freshClinics = freshClinicsData.clinics || freshClinicsData || [];

        // Update doctorAdvanceData with completely fresh data
        setdoctorAdvanceData({
          specialization: freshDoctorProfile.specialization || "",
          qualification: freshDoctorProfile.qualification || "",
          registrationNumber: freshDoctorProfile.registrationNumber || "",
          experienceYears: freshDoctorProfile.experienceYears ?? null,
          clinics: freshClinics,
        });

        toast.success("Profile updated successfully!");
      } catch (refreshErr) {
        console.error("Failed to refresh data after save:", refreshErr);
        toast.warn("Profile saved, but failed to refresh. Page reload recommended.");
      }

      setEditOpened(false);
    } catch (err) {
      console.error("Profile save failed:", err);
      toast.error(
        err?.response?.data?.message ||
          err?.message ||
          "Failed to save profile"
      );
    } finally {
      setLoading(false);
    }
  };

  const profileImageUrl = user?.profileImageUrl || null;
  const clinics = doctorAdvanceData?.clinics || [];

  return (
    <div className="min-h-screen w-full py-6 px-4 bg-background">
      <div className="mx-auto max-w-5xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-card border border-primary rounded-2xl shadow-soft overflow-hidden"
        >
         {/* TOP GRADIENT SECTION */}
<div
  className="relative p-8 sm:p-10 transition-all duration-500 ease-in-out"
  style={getUserGradient(user?.userCode)}
>
  <div className="absolute inset-0 bg-white/10 backdrop-blur-[2px] pointer-events-none" />

  <div className="relative z-10 flex flex-col sm:flex-row gap-8 items-center">
    {/* PROFILE IMAGE */}
    <div className="flex-shrink-0">
      <label className="relative cursor-pointer group block">
        {profileImageUrl && !userImageError ? (
          <img
            src={profileImageUrl}
            alt="Profile"
            className="w-32 h-32 rounded-full border-4 border-white/40 shadow-2xl object-cover bg-white transition-transform group-hover:scale-105"
            onError={() => setUserImageError(true)}
          />
        ) : (
          <div className="w-32 h-32 rounded-full border-4 border-white/40 shadow-2xl bg-white/20 backdrop-blur-md flex items-center justify-center">
            <FallbackUserSVG className="w-24 h-24 opacity-90" />
          </div>
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
          className="absolute bottom-2 right-2 bg-white rounded-full p-3 shadow-lg border border-primary/20"
        >
          {uploadingImage ? (
            <Loader2 className="w-6 h-6 animate-spin text-primary" />
          ) : (
            <Camera className="w-6 h-6 text-primary" />
          )}
        </motion.div>
      </label>
    </div>

    {/* DOCTOR INFO */}
    <div className="text-center sm:text-left text-white flex-1">
      <motion.h2
        initial={{ y: 40 }}
        animate={{ y: 0 }}
        transition={{ type: "spring", stiffness: 100 }}
        className="text-3xl sm:text-4xl font-black flex flex-col sm:flex-row sm:items-baseline gap-2"
      >
        <span className="text-xl font-medium opacity-80">Welcome,</span>
        <span className="drop-shadow-[0_4px_12px_rgba(0,0,0,0.4)]">
          Dr. {formData.name?.split(" ")[0] || "Doctor"}
        </span>
      </motion.h2>

      <p className="text-base opacity-90 font-medium mt-2 mb-6">
        {formData.email || "No email provided"}
      </p>

      {/* PROFESSIONAL CREDENTIALS BADGES */}
      {(doctorAdvanceData.specialization ||
        doctorAdvanceData.qualification ||
        doctorAdvanceData.registrationNumber ||
        doctorAdvanceData.experienceYears !== null) && (
        <div className="flex flex-wrap gap-3 justify-center sm:justify-start mb-6">
          {/* Specialization */}
          {doctorAdvanceData.specialization && (
            <span className="bg-white/20 backdrop-blur-md px-4 py-2 rounded-full text-sm font-medium flex items-center gap-2">
              <Stethoscope className="w-4 h-4" />
              {doctorAdvanceData.specialization}
            </span>
          )}

          {/* Qualification */}
          {doctorAdvanceData.qualification && (
            <span className="bg-white/20 backdrop-blur-md px-4 py-2 rounded-full text-sm font-medium flex items-center gap-2">
              <GraduationCap className="w-4 h-4" />
              {doctorAdvanceData.qualification}
            </span>
          )}

          {/* Experience */}
          {doctorAdvanceData.experienceYears !== null && doctorAdvanceData.experienceYears !== undefined && (
            <span className="bg-white/20 backdrop-blur-md px-4 py-2 rounded-full text-sm font-medium flex items-center gap-2">
              <Briefcase className="w-4 h-4" />
              {doctorAdvanceData.experienceYears} Years Experience
            </span>
          )}

          {/* Registration Number */}
          {doctorAdvanceData.registrationNumber && (
            <span className="bg-white/20 backdrop-blur-md px-4 py-2 rounded-full text-sm font-medium flex items-center gap-2">
              <IdCard className="w-4 h-4" />
              Reg: {doctorAdvanceData.registrationNumber}
            </span>
          )}
        </div>
      )}

      {/* USER CODE & MOBILE */}
      <div className="flex flex-wrap justify-center sm:justify-start gap-3">
        {user?.userCode && (
          <span className="bg-white/20 backdrop-blur-md px-4 py-2 rounded-full text-xs font-bold uppercase tracking-widest">
            Code: {user.userCode}
          </span>
        )}
        {formData.mobile && (
          <span className="bg-white/20 backdrop-blur-md px-4 py-2 rounded-full text-xs font-bold uppercase tracking-widest">
            Mobile: {formData.mobile}
          </span>
        )}
      </div>
    </div>
  </div>
</div>

          {/* BOTTOM SECTION: Bio + Professional Details */}
          <div className="px-8 py-8 bg-white/80 backdrop-blur-sm">
            <div className="mb-6">
              <p className="text-slate-400 text-xs font-bold uppercase tracking-wider mb-2">
                Professional Bio
              </p>
              {formData.bio ? (
                <p className="text-slate-700 text-base leading-relaxed italic">
                  "{formData.bio}"
                </p>
              ) : (
                <p className="text-slate-400 text-base italic">
                  No biography provided yet.
                </p>
              )}
            </div>

            {(clinics.length > 0 ||
              doctorAdvanceData.experienceYears !== null ||
              doctorAdvanceData.registrationNumber) && (
              <div className="mt-8 pt-6 border-t border-slate-200">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                  {clinics.length > 0 && (
                    <div className="lg:col-span-3">
                      <p className="text-sm text-slate-500 uppercase tracking-wide mb-4 flex items-center gap-2">
                        <Building className="w-5 h-5" />
                        Practice Locations
                      </p>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {clinics.map((clinic, idx) => (
                          <div
                            key={clinic.id || idx}
                            className="bg-input/60 rounded-xl p-6 border border-slate-200/50"
                          >
                            <div className="flex items-center justify-between mb-3">
                              <p className="font-semibold text-slate-800">
                                {clinic.clinicName || "Unnamed Clinic"}
                              </p>
                              {clinic.isPrimary && (
                                <span className="text-xs bg-primary/20 text-primary px-3 py-1 rounded-full font-medium">
                                  Primary
                                </span>
                              )}
                            </div>

                            {clinic.clinicAddress && (
                              <p className="text-sm text-slate-600 flex items-center gap-2 mt-2">
                                <MapPin className="w-4 h-4 text-slate-500" />
                                {clinic.clinicAddress}
                              </p>
                            )}

                            {clinic.phone && (
                              <p className="text-sm text-slate-600 flex items-center gap-2 mt-2">
                                <Phone className="w-4 h-4 text-slate-500" />
                                {clinic.phone}
                              </p>
                            )}

                            {clinic.consultationFee !== null && clinic.consultationFee !== undefined && (
                              <p className="text-sm text-slate-600 mt-2">
                                <span className="font-bold text-lg">₹</span>
                                <span className="ml-1">{clinic.consultationFee}</span> consultation fee
                              </p>
                            )}

                            {(clinic.visitingDays?.length > 0 || clinic.visitingTime) && (
                              <p className="text-sm text-slate-600 flex items-center gap-2 mt-2">
                                <Calendar className="w-4 h-4 text-slate-500" />
                                {clinic.visitingDays?.length > 0
                                  ? clinic.visitingDays.join(", ")
                                  : "No days specified"}{" "}
                                {clinic.visitingTime ? `| ${clinic.visitingTime}` : ""}
                              </p>
                            )}

                            {clinic.isOnline && (
                              <p className="text-sm text-green-700 mt-3 flex items-center gap-2 font-medium">
                                <Globe className="w-4 h-4" />
                                Online Consultation Available
                              </p>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            <div className="flex justify-end mt-10 pt-6 border-t border-slate-100">
              <Button
                onClick={() => setEditOpened(true)}
                className="button-primary rounded-full px-8 py-3 text-base font-semibold hover:shadow-2xl transition-all flex items-center gap-3"
              >
                <Edit3 className="w-5 h-5" />
                Edit Profile & Clinics
              </Button>
            </div>
          </div>
        </motion.div>

        {/* EDIT PROFILE MODAL */}
        <EditProfileModal
          editOpened={editOpened}
          setEditOpened={setEditOpened}
          formData={formData}
          setFormData={setFormData}
          doctorAdvanceData={doctorAdvanceData}
          setdoctorAdvanceData={setdoctorAdvanceData}
          handleSave={handleSaveProfile}
          loading={loading}
          isDoctor={true}
        />
      </div>
    </div>
  );
}