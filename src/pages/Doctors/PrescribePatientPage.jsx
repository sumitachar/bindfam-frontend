// src/pages/DoctorPrescribePage/DoctorPrescribePage.jsx
import React, { useContext, useState, useEffect } from "react";
import { motion } from "framer-motion";
import { UserContext } from "@/context/UserContext";
import {
  Loader2,
  Pill,
  PlusCircle,
  X,
  ChevronDown,
  ChevronUp,
  RotateCcw,
  Eye,
  FileText,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import {
  quickInit,
  quickSave,
  getPrescriptionsBySubUser,
} from "@/api/Doctor/DoctorPrescribe";
import { getRecommendedMedicines } from "@/api/Parents/recommendedMedicines";
import { pdf } from "@react-pdf/renderer";
import PrescriptionDoctorPDF from "./components/PrescriptionDoctorPDF";
import PDFPreviewDialog from "./components/PDFPreviewDialog";

const commonInstructions = [
  "After food",
  "Before food",
  "With water",
  "Empty stomach",
  "At bedtime",
  "Twice daily",
  "Once daily",
];

export default function DoctorPrescribePage() {
  const { user: doctor, doctorAdvanceData } = useContext(UserContext);
  const [mobileNumber, setMobileNumber] = useState("");
  const [parent, setParent] = useState(null);
  const [children, setChildren] = useState([]);
  const [childMode, setChildMode] = useState(null);
  const [selectedChild, setSelectedChild] = useState(null);
  const [childName, setChildName] = useState("");
  const [dateOfBirth, setDateOfBirth] = useState("");
  const [gender, setGender] = useState("");
  const [subUserId, setSubUserId] = useState(null);
  const [loadingInit, setLoadingInit] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(false);

  // Prescription form states
  const [prescriptionForm, setPrescriptionForm] = useState({
    title: "",
    notes: "",
    medicines: [
      {
        medicineName: "",
        brandName: "",
        dosage: "",
        frequency: "",
        times: [""],
        durationDays: "",
        instructions: "",
        startDate: "",
        endDate: "",
      },
    ],
    followUpDate: "",
  });

  const [showSuggestions, setShowSuggestions] = useState({});
  const [recommendedMedicines, setRecommendedMedicines] = useState([]);
  const [showHistory, setShowHistory] = useState(true);
  const [history, setHistory] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [loadingSave, setLoadingSave] = useState(false);

  // States for post-save actions
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [lastSavedPrescription, setLastSavedPrescription] = useState(null);

  // States for PDF Preview Dialog
  const [pdfPreviewUrl, setPdfPreviewUrl] = useState(null);
  const [pdfDialogOpen, setPdfDialogOpen] = useState(false);
  const [pdfFileName, setPdfFileName] = useState("");

  // Reset only prescription part (patient info remains)
  const resetPrescriptionForm = () => {
    setPrescriptionForm({
      title: "",
      notes: "",
      medicines: [
        {
          medicineName: "",
          brandName: "",
          dosage: "",
          frequency: "",
          times: [""],
          durationDays: "",
          instructions: "",
          startDate: "",
          endDate: "",
        },
      ],
      followUpDate: "",
    });
    setShowSuggestions({});
    setRecommendedMedicines([]);
    setSaveSuccess(false);
    toast.info("Prescription form cleared – patient details preserved");
  };

  // Full reset for "New Prescription" button
  const startNewPrescription = () => {
    setMobileNumber("");
    setParent(null);
    setChildren([]);
    setChildMode(null);
    setSelectedChild(null);
    setChildName("");
    setDateOfBirth("");
    setGender("");
    setSubUserId(null);
    setHistory([]);
    setShowHistory(true);
    resetPrescriptionForm();
    toast.info("Ready for a new prescription");
  };

  const handleInit = async () => {
    if (!mobileNumber.trim() || mobileNumber.length < 10) {
      toast.error("Enter a valid 10-digit mobile number");
      return;
    }

    setLoadingInit(true);
    try {
      const { parent, children } = await quickInit(mobileNumber.trim());
      setParent(parent);
      setChildren(children);

      if (children.length === 0) {
        setChildMode("create");
        setChildName("");
        setDateOfBirth("");
        setGender("");
        setSubUserId(null);
      } else if (children.length === 1) {
        const c = children[0];
        setChildMode("select");
        setSelectedChild(c);
        setChildName(c.name);
        setDateOfBirth(c.dateOfBirth || "");
        setGender(c.gender || "");
        setSubUserId(c.subUserId);
      } else {
        const c = children[children.length - 1];
        setChildMode("select_multiple");
        setSelectedChild(c);
        setChildName(c.name);
        setDateOfBirth(c.dateOfBirth || "");
        setGender(c.gender || "");
        setSubUserId(c.subUserId);
      }

      toast.success("Patient details loaded");
    } catch (err) {
      toast.error(err.message || "Failed to load patient");
    } finally {
      setLoadingInit(false);
    }
  };

  const switchToCreate = () => {
    setChildMode("create");
    setChildName("");
    setDateOfBirth("");
    setGender("");
    setSubUserId(null);
  };

  useEffect(() => {
    if (subUserId) {
      const fetchHistory = async () => {
        setHistoryLoading(true);
        try {
          const data = await getPrescriptionsBySubUser(subUserId);
          setHistory(data || []);
        } catch (err) {
          toast.error("Failed to load history");
        } finally {
          setHistoryLoading(false);
        }
      };
      fetchHistory();
    } else {
      setHistory([]);
    }
  }, [subUserId]);

  useEffect(() => {
    if (subUserId) {
      resetPrescriptionForm();
    }
  }, [subUserId]);

  const calculateEndDate = (startDate, durationDays) => {
    if (!startDate || !durationDays) return "";
    const days = parseInt(durationDays, 10);
    if (isNaN(days) || days <= 0) return "";
    const start = new Date(startDate);
    const end = new Date(start);
    end.setDate(start.getDate() + days);
    return end.toISOString().split("T")[0];
  };

  const updateTimesFromFrequency = (frequency) => {
    if (!frequency) return [""];
    const match = frequency.match(/(\d+)/);
    if (match) {
      const count = parseInt(match[1], 10);
      return Array(count).fill("");
    }
    if (frequency.toLowerCase().includes("sos")) {
      return [""];
    }
    return [""];
  };

  const addMedicine = () => {
    const last =
      prescriptionForm.medicines[prescriptionForm.medicines.length - 1];

    if (!last.medicineName.trim()) {
      toast.warning("Please fill the previous medicine first");
      return;
    }

    setPrescriptionForm((prev) => ({
      ...prev,
      medicines: [
        ...prev.medicines,
        {
          medicineName: "",
          brandName: "",
          dosage: "",
          frequency: "",
          times: [""],
          durationDays: "",
          instructions: "",
          startDate: "",
          endDate: "",
        },
      ],
    }));
  };

  const updateMedicine = (index, field, value, timeIndex = null) => {
    setPrescriptionForm((prev) => {
      const meds = [...prev.medicines];

      if (field === "times" && timeIndex !== null) {
        meds[index].times[timeIndex] = value;
      } else if (field === "medicineName") {
        meds[index][field] = value;
        if (value.length > 1) {
          getRecommendedMedicines(value)
            .then((data) => {
              setRecommendedMedicines(data);
              setShowSuggestions((s) => ({ ...s, [index]: true }));
            })
            .catch(() => {
              setRecommendedMedicines([]);
              setShowSuggestions((s) => ({ ...s, [index]: false }));
            });
        } else {
          setRecommendedMedicines([]);
          setShowSuggestions((s) => ({ ...s, [index]: false }));
        }
      } else if (field === "frequency") {
        meds[index][field] = value;
        meds[index].times = updateTimesFromFrequency(value);
      } else if (field === "startDate" || field === "durationDays") {
        meds[index][field] = value;
        if (!meds[index].startDate) {
          meds[index].startDate = new Date().toISOString().split("T")[0];
        }
        meds[index].endDate = calculateEndDate(
          meds[index].startDate,
          meds[index].durationDays
        );
      } else {
        meds[index][field] = value;
      }

      return { ...prev, medicines: meds };
    });
  };

  const selectSuggestedMedicine = (index, med) => {
    // Normalize frequency to match your Select options
    let normalizedFrequency = "1× Day";

    if (med.frequency) {
      const lower = med.frequency.toLowerCase().trim();
      if (lower.includes("1")) normalizedFrequency = "1× Day";
      else if (lower.includes("2")) normalizedFrequency = "2× Day";
      else if (lower.includes("3")) normalizedFrequency = "3× Day";
      else if (lower.includes("4")) normalizedFrequency = "4× Day";
      else if (lower.includes("sos")) normalizedFrequency = "SOS";
    }

    // Extract number from duration_days (e.g. "As advised by doctor" → null, or "7 days" → "7")
    let durationDays = null;
    if (med.duration_days) {
      const match = med.duration_days.match(/\d+/);
      if (match) durationDays = match[0];
    }

    const today = new Date().toISOString().split("T")[0];
    const endDate = durationDays ? calculateEndDate(today, durationDays) : "";

    setPrescriptionForm((prev) => {
      const meds = [...prev.medicines];
      meds[index] = {
        ...meds[index],
        medicineName: med.medicine_name || "",
        brandName: med.brand_name || "",
        dosage: med.dosage_form || "",
        frequency: normalizedFrequency,
        times: updateTimesFromFrequency(normalizedFrequency),
        durationDays: durationDays || "",
        instructions: med.instructions || "",
        startDate: today,
        endDate: endDate,
      };
      return { ...prev, medicines: meds };
    });

    setShowSuggestions((s) => ({ ...s, [index]: false }));
    setRecommendedMedicines([]);
  };

  const removeMedicine = (index) => {
    if (prescriptionForm.medicines.length > 1) {
      setPrescriptionForm((prev) => ({
        ...prev,
        medicines: prev.medicines.filter((_, i) => i !== index),
      }));
      setShowSuggestions((prev) => {
        const newSuggestions = { ...prev };
        delete newSuggestions[index];
        return newSuggestions;
      });
    }
  };

  // Generate PDF blob and open preview dialog
  const generateAndPreviewPDF = async (
    prescriptionData,
    fileNamePrefix = ""
  ) => {
    const doctorFullData = {
      name: doctor?.name || "Doctor",
      specialization: doctorAdvanceData?.specialization || "General Medicine",
      qualification: doctorAdvanceData?.qualification || "MD",
      registrationNumber: doctorAdvanceData?.registrationNumber || "",
      clinics: doctorAdvanceData?.clinics || [],
    };
    console.log("prescriptionData@@", prescriptionData, doctorFullData);

    try {
      const blob = await pdf(
        <PrescriptionDoctorPDF
          prescription={prescriptionData}
          doctorData={doctorFullData}
        />
      ).toBlob();

      const url = URL.createObjectURL(blob);
      const dateStr = new Date(prescriptionData.createdAt || Date.now())
        .toISOString()
        .slice(0, 10);
      const name =
        prescriptionData.childName?.replace(/\s+/g, "_") || "Patient";
      const fileName = `${fileNamePrefix}Prescription_${name}_${dateStr}.pdf`;

      setPdfPreviewUrl(url);
      setPdfFileName(fileName);
      setPdfDialogOpen(true);
    } catch (err) {
      console.error("PDF generation failed:", err);
      toast.error("Failed to generate PDF preview");
    }
  };

  // Open preview for current (just saved) prescription
  const openCurrentPrescriptionPreview = () => {
    if (!lastSavedPrescription) return;
    generateAndPreviewPDF(lastSavedPrescription);
  };

  // Handle Save
  const handleSave = async () => {
    if (!mobileNumber.trim()) return toast.error("Mobile number required");
    if (childMode === "create" && !dateOfBirth) {
      return toast.error("Date of Birth is required");
    }
    if (!childName.trim()) return toast.error("Child name required");
    if (!prescriptionForm.title.trim()) return toast.error("Title is required");
    if (!prescriptionForm.medicines.some((m) => m.medicineName.trim()))
      return toast.error("Add at least one medicine");

    const payload = {
      patientMobile: mobileNumber.trim(),
      childName: childName.trim(),
      dateOfBirth: dateOfBirth || null,
      gender: gender || null,
      prescription: {
        title: prescriptionForm.title.trim(),
        notes: prescriptionForm.notes.trim(),
        followUpDate: prescriptionForm.followUpDate || null,
        medicines: prescriptionForm.medicines
          .filter((m) => m.medicineName.trim()) // 🔥 only filled medicines
          .map((m) => ({
            medicineName: m.medicineName.trim(),
            brandName: m.brandName?.trim() || "",
            dosage: m.dosage?.trim() || "",
            frequency: m.frequency?.trim() || "",
            times: m.times?.filter((t) => t.trim()) || [],
            durationDays: m.durationDays?.trim() || "",
            instructions: m.instructions?.trim() || "",
            startDate: m.startDate || null,
            endDate: m.endDate || null,
          })),
      },
    };

    setLoadingSave(true);
    try {
      const res = await quickSave(payload);
      toast.success("Prescription saved successfully!");

      const prescriptionDataForPDF = {
        title: prescriptionForm.title.trim(),
        notes: prescriptionForm.notes.trim(),
        followUpDate: prescriptionForm.followUpDate || null,
        medicines: prescriptionForm.medicines,
        createdAt: new Date().toISOString(),
        childName: selectedChild?.name || childName,
        dateOfBirth: selectedChild?.dateOfBirth || dateOfBirth,
        gender: selectedChild?.gender || gender,
        age: selectedChild?.age || res?.subUser?.age || null,
      };

      setLastSavedPrescription(prescriptionDataForPDF);
      setSaveSuccess(true);
    } catch (err) {
      console.error("Save failed:", err);
      toast.error(err?.message || "Failed to save prescription");
    } finally {
      setLoadingSave(false);
    }
  };

  // Open preview for history prescriptions
  const openHistoryPrescriptionPreview = (prescriptionData) => {
    const fullData = {
      ...prescriptionData,
      childName: selectedChild?.name || childName,
      dateOfBirth: selectedChild?.dateOfBirth || dateOfBirth,
      gender: selectedChild?.gender || gender,
      age: selectedChild?.age || res?.subUser?.age || null,
    };
    generateAndPreviewPDF(fullData, "History_");
  };

  let childNameComp, dateOfBirthComp, genderComp;

  if (childMode === "create") {
    childNameComp = (
      <div>
        <Label>
          Child Name <span className="text-red-500">*</span>
        </Label>
        <Input
          value={childName}
          onChange={(e) => setChildName(e.target.value)}
          placeholder="Enter name"
        />
      </div>
    );
    dateOfBirthComp = (
      <div>
        <Label>
          Date of Birth <span className="text-red-500">*</span>
        </Label>
        <Input
          type="date"
          value={dateOfBirth}
          onChange={(e) => setDateOfBirth(e.target.value)}
        />
      </div>
    );
    genderComp = (
      <div>
        <Label>Gender</Label>
        <Select value={gender} onValueChange={setGender}>
          <SelectTrigger>
            <SelectValue placeholder="Select gender" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="Male">Male</SelectItem>
            <SelectItem value="Female">Female</SelectItem>
          </SelectContent>
        </Select>
      </div>
    );
  } else if (childMode === "select") {
    childNameComp = (
      <div>
        <Label>Child Name</Label>
        <Input value={childName} disabled className="bg-gray-50" />
      </div>
    );
    dateOfBirthComp = (
      <div>
        <Label>Date of Birth</Label>
        <Input value={dateOfBirth} disabled className="bg-gray-50" />
      </div>
    );
    genderComp = (
      <div>
        <Label>Gender</Label>
        <Input value={gender || "—"} disabled className="bg-gray-50" />
      </div>
    );
  } else if (childMode === "select_multiple") {
    childNameComp = (
      <div>
        <Label>Child Name</Label>
        <Select
          value={childName}
          onValueChange={(name) => {
            const c = children.find((ch) => ch.name === name);
            if (c) {
              setSelectedChild(c);
              setChildName(name);
              setDateOfBirth(c.dateOfBirth || "");
              setGender(c.gender || "");
              setSubUserId(c.subUserId);
            }
          }}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select child" />
          </SelectTrigger>
          <SelectContent>
            {children.map((c) => (
              <SelectItem key={c.subUserId} value={c.name}>
                {c.name} ({c.age ? `${c.age} yrs` : "Age N/A"})
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    );
    dateOfBirthComp = (
      <div>
        <Label>Date of Birth</Label>
        <Input value={dateOfBirth} disabled className="bg-gray-50" />
      </div>
    );
    genderComp = (
      <div>
        <Label>Gender</Label>
        <Input value={gender || "—"} disabled className="bg-gray-50" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-slate-50 py-8 px-4">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="mb-8 text-center">
          <motion.h1
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-2xl md:text-3xl font-bold"
          >
            <span className="text-muted-foreground">Dr.</span>{" "}
            <span className="text-primary">{doctor?.name || "Doctor"}</span>
          </motion.h1>
        </div>

        {/* Quick Form Card */}
        <div className="glass-card border border-primary rounded-2xl shadow-soft p-8 max-w-4xl mx-auto space-y-8">
          <h2 className="text-2xl font-bold text-primary text-center">
            Quick Prescription
          </h2>

          {/* Patient Info Row */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div>
              <Label>
                Mobile Number <span className="text-red-500">*</span>
              </Label>
              <Input
                type="tel"
                placeholder="10-digit mobile"
                value={mobileNumber}
                onChange={(e) =>
                  setMobileNumber(
                    e.target.value.replace(/\D/g, "").slice(0, 10)
                  )
                }
                onBlur={handleInit}
                onKeyDown={(e) => e.key === "Enter" && handleInit()}
                disabled={loadingInit}
              />
              {loadingInit && (
                <p className="text-sm text-muted-foreground mt-1">
                  Loading patient...
                </p>
              )}
            </div>
            {childNameComp}
            {dateOfBirthComp}
            {genderComp}
          </div>

          {/* Add New Child Button */}
          {children.length > 0 && childMode !== "create" && (
            <Button
              variant="outline"
              onClick={switchToCreate}
              className="w-full md:w-auto"
            >
              <PlusCircle className="mr-2 h-4 w-4" /> Add New Child
            </Button>
          )}

          {/* Prescription Form */}
          <div className="space-y-8">
            <h4 className="text-sm font-semibold text-slate-700 mb-2">
              Prescription Details
            </h4>

            <div className="border border-slate-200 rounded-lg  p-4">
              <Label className="text-[10px] font-bold text-slate-400 uppercase mb-0.5">
                Prescription Title <span className="text-red-500">*</span>
              </Label>
              <Input
                value={prescriptionForm.title}
                onChange={(e) =>
                  setPrescriptionForm({
                    ...prescriptionForm,
                    title: e.target.value,
                  })
                }
                placeholder="e.g. Fever, Cough, Post-vaccination"
                className="mt-2"
              />
            </div>

            {/* Medicines Section */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-base flex items-center gap-2 text-slate-700">
                  <Pill className="w-4 h-4 text-primary" /> Medicines
                </h3>
              </div>

              {prescriptionForm.medicines.map((med, i) => (
                <div
                  key={i}
                  className="relative border border-slate-200 rounded-xl bg-white shadow-sm hover:border-primary/40 transition-all"
                >
                  <div className="flex items-center justify-between px-3 py-1.5 bg-slate-50 border-b border-slate-100 rounded-t-xl">
                    <div className="flex items-center gap-2">
                      <span className="flex items-center justify-center w-5 h-5 bg-primary/10 text-primary text-[10px] font-bold rounded">
                        {i + 1}
                      </span>
                      <span className="text-[11px] font-bold text-slate-500 uppercase tracking-tight">
                        Medicine Entry
                      </span>
                    </div>
                    {prescriptionForm.medicines.length > 1 && (
                      <button
                        onClick={() => removeMedicine(i)}
                        className="text-slate-400 hover:text-red-500 p-1"
                      >
                        <X className="h-3.5 w-3.5" />
                      </button>
                    )}
                  </div>

                  <div className="p-3 space-y-3">
                    <div className="grid grid-cols-12 gap-3">
                      <div className="col-span-12 lg:col-span-5 relative">
                        <Label className="text-[10px] font-bold text-slate-400 uppercase mb-0.5">
                          Medicine Name *
                        </Label>
                        <Input
                          value={med.medicineName}
                          onChange={(e) =>
                            updateMedicine(i, "medicineName", e.target.value)
                          }
                          placeholder="Name..."
                          className="h-8 text-sm"
                        />
                        {showSuggestions[i] &&
                          recommendedMedicines.length > 0 && (
                            <div className="absolute z-30 top-full left-0 right-0 mt-1 bg-white border border-slate-200 rounded-lg shadow-xl max-h-56 overflow-y-auto">
                              {recommendedMedicines.map((sug, j) => (
                                <button
                                  key={j}
                                  type="button"
                                  onClick={() =>
                                    selectSuggestedMedicine(i, sug)
                                  }
                                  className="w-full text-left px-4 py-3 hover:bg-primary/5 border-b border-slate-100 last:border-0 transition-colors"
                                >
                                  <div className="flex flex-col">
                                    <span className="font-semibold text-primary">
                                      {sug.medicine_name}
                                      {sug.brand_name && (
                                        <span className="font-normal text-slate-600 ml-2">
                                          ({sug.brand_name})
                                        </span>
                                      )}
                                    </span>
                                    {sug.dosage_form && (
                                      <span className="text-xs text-slate-500 mt-0.5">
                                        Dosage: {sug.dosage_form}
                                      </span>
                                    )}
                                    {sug.frequency &&
                                      sug.frequency !== "As prescribed" && (
                                        <span className="text-xs text-slate-500">
                                          {sug.frequency} •{" "}
                                          {sug.duration_days || "As advised"}
                                        </span>
                                      )}
                                  </div>
                                </button>
                              ))}
                            </div>
                          )}
                      </div>

                      <div className="col-span-6 lg:col-span-3">
                        <Label className="text-[10px] font-bold text-slate-400 uppercase mb-0.5">
                          Dosage
                        </Label>
                        <Input
                          value={med.dosage}
                          onChange={(e) =>
                            updateMedicine(i, "dosage", e.target.value)
                          }
                          placeholder="1 tab / 5ml"
                          className="h-8 text-sm"
                        />
                      </div>

                      <div className="col-span-6 lg:col-span-4">
                        <Label className="text-[10px] font-bold text-slate-400 uppercase mb-0.5">
                          Frequency
                        </Label>
                        <Select
                          value={med.frequency}
                          onValueChange={(v) =>
                            updateMedicine(i, "frequency", v)
                          }
                        >
                          <SelectTrigger className="h-8 text-sm">
                            <SelectValue placeholder="Select" />
                          </SelectTrigger>
                          <SelectContent className="bg-white">
                            {/* Daily */}
                            <SelectItem value="1× Day">1× Day</SelectItem>
                            <SelectItem value="2× Day">2× Day</SelectItem>
                            <SelectItem value="3× Day">3× Day</SelectItem>
                            <SelectItem value="4× Day">4× Day</SelectItem>
                            {/* Hourly */}
                            <SelectItem value="Every 4 Hours">
                              Every 4 Hours
                            </SelectItem>
                            <SelectItem value="Every 6 Hours">
                              Every 6 Hours
                            </SelectItem>
                            <SelectItem value="Every 8 Hours">
                              Every 8 Hours
                            </SelectItem>
                            <SelectItem value="Every 12 Hours">
                              Every 12 Hours
                            </SelectItem>
                            {/* Time based */}
                            <SelectItem value="Morning">Morning</SelectItem>
                            <SelectItem value="Evening">Evening</SelectItem>
                            <SelectItem value="At Night">At Night</SelectItem>
                            {/* Special */}
                            <SelectItem value="SOS">SOS</SelectItem>
                            <SelectItem value="STAT">STAT</SelectItem>
                            {/* Long term */}
                            <SelectItem value="Once Weekly">
                              Once Weekly
                            </SelectItem>
                            <SelectItem value="Alternate Day">
                              Alternate Day
                            </SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="grid grid-cols-12 gap-3 items-end">
                      <div className="col-span-3 lg:col-span-2">
                        <Label className="text-[10px] font-bold text-slate-400 uppercase mb-0.5">
                          Days
                        </Label>
                        <Input
                          type="number"
                          value={med.durationDays}
                          onChange={(e) =>
                            updateMedicine(i, "durationDays", e.target.value)
                          }
                          className="h-8 text-sm"
                        />
                      </div>

                      <div className="col-span-5 lg:col-span-3">
                        <Label className="text-[10px] font-bold text-slate-400 uppercase mb-0.5">
                          Start Date
                        </Label>
                        <Input
                          type="date"
                          value={med.startDate}
                          onChange={(e) =>
                            updateMedicine(i, "startDate", e.target.value)
                          }
                          className="h-8 text-sm px-2"
                        />
                      </div>

                      <div className="col-span-4 lg:col-span-3">
                        <Label className="text-[10px] font-bold text-slate-400 uppercase mb-0.5">
                          End Date
                        </Label>
                        <div className="h-8 flex items-center px-3 rounded-md bg-slate-50 border border-slate-200 text-xs font-semibold text-primary/80">
                          {med.endDate || "—"}
                        </div>
                      </div>

                      <div className="col-span-12 lg:col-span-4">
                        <Label className="text-[10px] font-bold text-slate-400 uppercase mb-0.5">
                          Instructions
                        </Label>
                        <Select
                          value={med.instructions || ""}
                          onValueChange={(v) =>
                            updateMedicine(i, "instructions", v)
                          }
                        >
                          <SelectTrigger className="h-8 text-sm">
                            <SelectValue placeholder="Select instruction" />
                          </SelectTrigger>
                          <SelectContent className="bg-white">
                            {commonInstructions.map((ins, idx) => (
                              <SelectItem key={idx} value={ins}>
                                {ins}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </div>
                </div>
              ))}

              <div className="flex justify-end mt-2">
                <Button
                  variant="outline"
                  onClick={addMedicine}
                  className="h-10 px-4 text-sm font-semibold button-primary flex items-center gap-2"
                >
                  <PlusCircle className="h-4 w-4" />
                  Add Medicine
                </Button>
              </div>
            </div>

            <div className=" rounded-xl p-4 space-y-4">
              <h4 className="text-sm font-semibold text-slate-700">
                Additional Notes & Follow-up
              </h4>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Additional Notes */}
                <div className="border border-slate-200 rounded-lg p-2">
                  <Label className="text-[10px] font-bold text-slate-400 uppercase mb-1">
                    Additional Notes
                  </Label>
                  <textarea
                    value={prescriptionForm.notes}
                    onChange={(e) =>
                      setPrescriptionForm({
                        ...prescriptionForm,
                        notes: e.target.value,
                      })
                    }
                    className="w-full h-24 p-2 border rounded-md resize-none text-sm"
                    placeholder="Any special advice..."
                  />
                </div>

                {/* Follow-up Date */}
                <div className=" rounded-lg p-2 flex flex-col">
                  <Label className="text-[10px] font-bold text-slate-400 uppercase mb-1">
                    Follow-up Date
                  </Label>
                  <Input
                    type="date"
                    value={prescriptionForm.followUpDate}
                    onChange={(e) =>
                      setPrescriptionForm({
                        ...prescriptionForm,
                        followUpDate: e.target.value,
                      })
                    }
                    className="mt-1 text-sm"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Leave blank if not needed
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col gap-4 pt-6">
            <Button
              onClick={handleSave}
              disabled={loadingSave || saveSuccess}
              className="h-12 text-lg font-semibold button-primary"
            >
              {loadingSave ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Saving Prescription...
                </>
              ) : (
                "Save Prescription"
              )}
            </Button>

            {saveSuccess && (
              <>
                <Button
                  onClick={openCurrentPrescriptionPreview}
                  className="h-12 text-lg font-semibold bg-blue-600 hover:bg-blue-700"
                >
                  <Eye className="mr-2 h-5 w-5" />
                  Preview & Print Prescription
                </Button>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Button
                    variant="outline"
                    onClick={resetPrescriptionForm}
                    className="h-12"
                  >
                    <RotateCcw className="mr-2 h-4 w-4" />
                    Reset Form Only
                  </Button>

                  <Button
                    variant="outline"
                    onClick={startNewPrescription}
                    className="h-12 border-dashed"
                  >
                    <FileText className="mr-2 h-4 w-4" />
                    New Prescription
                  </Button>
                </div>
              </>
            )}

            {!saveSuccess && (
              <Button
                variant="outline"
                onClick={resetPrescriptionForm}
                className="h-12"
              >
                <RotateCcw className="mr-2 h-4 w-4" />
                Clear Form
              </Button>
            )}
          </div>

          {/* Prescription History */}
          {subUserId && (
            <div className="pt-6 border-t">
              <Button
                variant="outline"
                onClick={() => setShowHistory((prev) => !prev)}
                className="w-full justify-between text-lg font-medium"
              >
                <span className="flex items-center gap-2">
                  <Pill className="w-5 h-5" />
                  Prescription History ({history.length})
                </span>

                {showHistory ? (
                  <ChevronUp className="h-5 w-5" />
                ) : (
                  <ChevronDown className="h-5 w-5" />
                )}
              </Button>

              {showHistory && (
                <div className="mt-4 space-y-3">
                  {historyLoading ? (
                    <div className="text-center py-8">
                      <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" />
                    </div>
                  ) : history.length === 0 ? (
                    <p className="text-center text-muted-foreground py-8">
                      No previous prescriptions
                    </p>
                  ) : (
                    history.map((p) => (
                      <div
                        key={p.id}
                        className="p-4 bg-gray-50 rounded-lg border flex flex-col md:flex-row md:justify-between md:items-start gap-4"
                      >
                        {/* Left content */}
                        <div className="flex flex-col gap-1 flex-1">
                          <p className="font-semibold break-words">
                            {p.title || "Untitled"}
                          </p>

                          <p className="text-sm text-muted-foreground">
                            Created:{" "}
                            {new Date(p.createdAt).toLocaleDateString()}
                          </p>

                          {p.followUpDate && (
                            <p className="text-sm text-muted-foreground">
                              Follow-up:{" "}
                              {new Date(p.followUpDate).toLocaleDateString()}
                            </p>
                          )}
                        </div>

                        {/* Right action */}
                        <div className="flex justify-end">
                          <Button
                            size="sm"
                            variant="outline"
                            className="w-full md:w-auto"
                            onClick={() => openHistoryPrescriptionPreview(p)}
                          >
                            <Eye className="mr-2 h-4 w-4" />
                            Preview PDF
                          </Button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>
          )}
        </div>
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
