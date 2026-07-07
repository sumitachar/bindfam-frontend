import React, { useCallback, useContext, useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Baby,
  Calendar,
  User as UserIcon,
  AlertCircle,
  FileText,
  Clock,
  User,
  Eye,
  Phone, // ← NEW: For preview button
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { UserContext } from "@/context/UserContext";
import axios from "axios";

import { pdf } from "@react-pdf/renderer"; // ← NEW
import PDFPreviewDialog from "./components/PDFPreviewDialog";
import PrescriptionDoctorPDF from "./components/PrescriptionDoctorPDF";
import { getPrescriptionsBySubUser } from "@/api/Doctor/DoctorPrescribe";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:4000";

const getUserImageUrl = (imagePath) => {
  if (!imagePath) return null;
  const cleaned = imagePath.replace(/^\/+/, "").replace(/^[Uu]ploads\//i, "");
  return `${API_URL}/${cleaned}?v=${Date.now()}`;
};

const Skeleton = () => (
  <div className="space-y-6 animate-pulse">
    <div className="h-48 bg-input/50 rounded-2xl border border-primary/20" />
    <div className="glass-card rounded-2xl p-6 border border-primary/20">
      <div className="flex gap-4">
        <div className="w-28 h-28 rounded-full bg-input/50 border-4 border-white" />
        <div className="flex-1 space-y-3">
          <div className="h-8 bg-input/50 rounded w-48" />
          <div className="h-5 bg-input/50 rounded w-32" />
        </div>
      </div>
    </div>
  </div>
);

export default function PatientDetailsPage() {
  const navigate = useNavigate();
  const {
    selectedEntity,
    loading: contextLoading,
    user: currentDoctor,
    doctorAdvanceData,
  } = useContext(UserContext);

  const [patient, setPatient] = useState(null);
  const [prescriptions, setPrescriptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [presLoading, setPresLoading] = useState(true);
  const [imageError, setImageError] = useState(false);

  // PDF Preview States
  const [pdfPreviewUrl, setPdfPreviewUrl] = useState(null);
  const [pdfDialogOpen, setPdfDialogOpen] = useState(false);
  const [pdfFileName, setPdfFileName] = useState("");

  useEffect(() => {
    if (!selectedEntity && !contextLoading) {
      navigate("/doctor-dashboard", { replace: true });
    }
  }, [selectedEntity, contextLoading, navigate]);

  useEffect(() => {
    if (selectedEntity) {
      setPatient(selectedEntity);
      setLoading(false);
      fetchPrescriptionHistory(selectedEntity.subUserId);
    }
  }, [selectedEntity]);

  const fetchPrescriptionHistory = async (subUserId) => {
    if (!currentDoctor || currentDoctor.role !== "doctor") return;

    try {
      setPresLoading(true);

      const data = await getPrescriptionsBySubUser(subUserId);

      setPrescriptions(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Failed to load prescription history:", err);
      setPrescriptions([]);
    } finally {
      setPresLoading(false);
    }
  };

  const getUserGradient = useCallback((userCode) => {
    if (!userCode) {
      return { background: "linear-gradient(135deg, #a855f7, #ec4899)" }; // fallback purple-pink
    }

    let hash = 0;
    for (let i = 0; i < userCode.length; i++) {
      hash = userCode.charCodeAt(i) + ((hash << 5) - hash);
    }

    const hue1 = Math.abs(hash % 360);
    const hue2 = (hue1 + 80) % 360; // wider color shift for vibrant feel

    return {
      background: `linear-gradient(135deg, hsl(${hue1}, 75%, 55%), hsl(${hue2}, 75%, 50%))`,
    };
  }, []);

  const calculateAge = (dob) => {
    if (!dob) return "Age not set";
    const birth = new Date(dob);
    const today = new Date();
    let age = today.getFullYear() - birth.getFullYear();
    const m = today.getMonth() - birth.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) age--;
    return age > 0 ? `${age} year${age > 1 ? "s" : ""}` : "Less than 1 year";
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return "N/A";
    return new Date(dateStr).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const imageUrl = patient?.profileImageUrl || patient?.profileImagePath;
  const finalImage = getUserImageUrl(imageUrl);

  // Generate PDF Blob and open preview
  const generateAndPreviewPDF = async (prescriptionData) => {
    const doctorFullData = {
      name: currentDoctor?.name || "Doctor",
      specialization: doctorAdvanceData?.specialization || "General Medicine",
      qualification: doctorAdvanceData?.qualification || "MD",
      registrationNumber: doctorAdvanceData?.registrationNumber || "",
      clinics: doctorAdvanceData?.clinics || [],
    };

    const enrichedPrescription = {
      ...prescriptionData,
      childName: patient.name,
      dateOfBirth: patient.dateOfBirth || patient.dob,
      gender: patient.gender,
    };

    try {
      const blob = await pdf(
        <PrescriptionDoctorPDF
          prescription={enrichedPrescription}
          doctorData={doctorFullData}
        />
      ).toBlob();

      const url = URL.createObjectURL(blob);
      const dateStr = new Date(prescriptionData.createdAt)
        .toISOString()
        .slice(0, 10);
      const name = patient.name.replace(/\s+/g, "_");
      const fileName = `Prescription_${name}_${dateStr}.pdf`;

      setPdfPreviewUrl(url);
      setPdfFileName(fileName);
      setPdfDialogOpen(true);
    } catch (err) {
      console.error("PDF generation failed:", err);
      alert("Failed to generate PDF preview");
    }
  };

  if (loading || contextLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-slate-900 dark:to-slate-800 py-4 px-4">
        <div className="mx-auto">
          <Skeleton />
        </div>
      </div>
    );
  }

  if (!patient) return null;

  return (
    <div className="min-h-screen py-4 px-4">
      <div className="mx-auto space-y-6 max-w-5xl">
        {/* HEADER CARD - MODERN PATIENT PROFILE STYLE */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-card border border-primary rounded-2xl shadow-soft overflow-hidden mb-6"
        >
          {/* TOP GRADIENT SECTION */}
          <div
            className="relative p-6 sm:p-8 transition-all duration-500 ease-in-out"
            style={getUserGradient(patient?.subUserId)}
          >
            <div className="absolute inset-0 bg-white/10 backdrop-blur-[2px] pointer-events-none" />

            <div className="relative z-10 flex flex-col sm:flex-row gap-6 items-center">
              {/* PROFILE IMAGE */}
              <div className="flex-shrink-0">
                <div className="relative group">
                  {finalImage && !imageError ? (
                    <img
                      src={finalImage}
                      alt={patient.name}
                      className="w-32 h-32 rounded-full border-6 border-white/50 shadow-2xl object-cover bg-white transition-transform group-hover:scale-105"
                      onError={() => setImageError(true)}
                    />
                  ) : (
                    <div className="w-32 h-32 rounded-full border-6 border-white/50 shadow-2xl bg-white/30 backdrop-blur-md flex items-center justify-center">
                      <Baby className="w-20 h-20 text-white/90" />
                    </div>
                  )}

                  {/* Active Status Badge */}
                  <div className="absolute bottom-2 right-2 bg-green-500 text-white text-xs px-3 py-1.5 rounded-full font-bold shadow-lg border border-white/30">
                    Active
                  </div>
                </div>
              </div>

              {/* PATIENT INFO */}
              <div className="text-center sm:text-left text-white flex-1">
                <motion.h1
                  initial={{ y: 40 }}
                  animate={{ y: 0 }}
                  transition={{ type: "spring", stiffness: 100 }}
                  className="text-3xl sm:text-4xl font-black drop-shadow-[0_2px_10px_rgba(0,0,0,0.4)]"
                >
                  {patient.name}
                </motion.h1>

                <p className="text-sm opacity-90 font-medium mt-2">
                  Patient ID:{" "}
                  <span className="font-mono font-bold">
                    {patient.subUserId}
                  </span>
                </p>

                {/* Key Details Badges */}
                <div className="flex flex-wrap gap-3 justify-center sm:justify-start mt-4">
                  <span className="bg-white/20 backdrop-blur-md px-4 py-2 rounded-full text-sm font-medium flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    Age: {calculateAge(patient.dateOfBirth || patient.dob)}
                  </span>

                  <span className="bg-white/20 backdrop-blur-md px-4 py-2 rounded-full text-sm font-medium capitalize">
                    {patient.gender || "Not set"}
                  </span>

                  <span className="bg-white/20 backdrop-blur-md px-4 py-2 rounded-full text-sm font-medium">
                    {patient.relationOfMember}
                  </span>
                </div>

                {/* Parent Info */}
                {patient.user && (
                  <div className="mt-5 flex flex-wrap justify-center sm:justify-start gap-4 text-sm">
                    <span className="bg-white/20 backdrop-blur-md px-4 py-2 rounded-full font-medium flex items-center gap-2">
                      <User className="w-4 h-4" />
                      Parent: {patient.user.name}
                    </span>

                    {patient.user.mobile && (
                      <span className="bg-white/20 backdrop-blur-md px-4 py-2 rounded-full font-medium flex items-center gap-2">
                        <Phone className="w-4 h-4" />
                        {patient.user.mobile}
                      </span>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Optional: Bottom section for allergies or quick note (you can expand later) */}
          {patient.allergies && (
            <div className="px-6 py-4 bg-red-50 border-t border-red-200">
              <div className="flex items-start gap-3">
                <AlertCircle className="w-8 h-8 text-red-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-bold text-red-800 uppercase tracking-wide">
                    Known Allergies
                  </p>
                  <p className="text-sm text-red-700 mt-1 leading-relaxed">
                    {patient.allergies}
                  </p>
                </div>
              </div>
            </div>
          )}
        </motion.div>

        {/* PRESCRIPTION HISTORY */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-card rounded-2xl p-6 border border-primary/20"
        >
          <h3 className="text-lg font-bold text-text mb-6 flex items-center gap-2">
            <FileText className="w-6 h-6 text-primary" />
            My Prescription History
          </h3>

          {presLoading ? (
            <div className="space-y-4">
              {[...Array(3)].map((_, i) => (
                <div
                  key={i}
                  className="h-32 bg-input/30 rounded-xl animate-pulse"
                />
              ))}
            </div>
          ) : prescriptions.length === 0 ? (
            <div className="text-center py-10 text-muted">
              <FileText className="w-16 h-16 mx-auto mb-4 text-muted-foreground/30" />
              <p>No prescriptions issued by you yet.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {prescriptions.map((prescription) => (
                <Card
                  key={prescription.id}
                  className="p-5 border border-primary/10"
                >
                  <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-4">
                    <div className="flex-1">
                      <div className="flex items-start justify-between">
                        <div>
                          <h4 className="font-semibold text-text">
                            {prescription.title || "Consultation"}
                          </h4>
                          <p className="text-sm text-muted flex items-center gap-2 mt-1">
                            <Clock className="w-4 h-4" />
                            {formatDate(prescription.createdAt)}
                            {prescription.followUpDate && (
                              <span className="text-primary ml-4">
                                Follow-up:{" "}
                                {formatDate(prescription.followUpDate)}
                              </span>
                            )}
                          </p>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-muted">
                          <User className="w-4 h-4" />
                          Dr. {prescription.doctorName || currentDoctor?.name}
                        </div>
                      </div>

                      {prescription.notes && (
                        <p className="text-sm text-text mb-4 mt-3 italic">
                          {prescription.notes}
                        </p>
                      )}

                      {prescription.medicines &&
                        prescription.medicines.length > 0 && (
                          <div className="mt-4">
                            <p className="font-medium text-sm mb-2">
                              Medicines Prescribed:
                            </p>
                            <ul className="space-y-2 text-sm">
                              {prescription.medicines.map((med, idx) => (
                                <li
                                  key={idx}
                                  className="flex justify-between border-l-4 border-primary/50 pl-3 py-1"
                                >
                                  <span className="font-medium">
                                    {med.medicineName}
                                  </span>
                                  <span className="text-muted">
                                    {med.dosage} • {med.frequency} •{" "}
                                    {med.durationDays} days
                                  </span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                    </div>

                    {/* Preview Button */}
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => generateAndPreviewPDF(prescription)}
                      className="mt-4 md:mt-0"
                    >
                      <Eye className="w-4 h-4 mr-2" />
                      Preview PDF
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </motion.div>
      </div>

      {/* PDF Preview Dialog */}
      <PDFPreviewDialog
        isOpen={pdfDialogOpen}
        onOpenChange={setPdfDialogOpen}
        previewUrl={pdfPreviewUrl}
        fileName={pdfFileName}
        onDownload={() => {
          if (pdfPreviewUrl) {
            const link = document.createElement("a");
            link.href = pdfPreviewUrl;
            link.download = pdfFileName;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
          }
        }}
      />
    </div>
  );
}
