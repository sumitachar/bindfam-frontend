import React, {
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import {
  User,
  FileText,
  Pill,
  Droplet,
  Clock,
  Calendar,
  Upload,
  Pencil,
  Trash2,
  Download,
  Lock,
} from "lucide-react";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import {
  getPrescriptions,
  addPrescription,
  updatePrescription,
  deletePrescription,
  getPrescriptionSecureUrl,
} from "@/api/Parents/prescriptions";
import { getRecommendedMedicines } from "@/api/Parents/recommendedMedicines";
import { UserContext } from "@/context/UserContext";
import PrescriptionCard from "./components/PrescriptionCard";
import { PDFViewer } from "@react-pdf/renderer";
import PrescriptionPDFDocument from "./components/PrescriptionPDFDocument";
import {
  downloadPDF,
  generatePrescriptionPDF,
  openPDFInNewTab,
} from "@/lib/pdfUtils";

const Prescriptions = ({ navigateBack }) => {
  const { selectedEntity, isDoctor, isReadOnly } = useContext(UserContext);
  const [doctorName, setDoctorName] = useState("");
  const [title, setTitle] = useState("");
  const [notes, setNotes] = useState("");
  const [medicines, setMedicines] = useState([
    {
      medicineName: "",
      brandName: "", // ← Add this
      dosage: "",
      frequency: "",
      times: [""],
      durationDays: "",
      instructions: "",
      startDate: "",
      endDate: "",
    },
  ]);
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [file, setFile] = useState(null);
  const [filePreview, setFilePreview] = useState("");
  const [records, setRecords] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [imageErrors, setImageErrors] = useState({});
  const [inputType, setInputType] = useState("manual");
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [previewFilePath, setPreviewFilePath] = useState(null);
  const [isSmallScreen, setIsSmallScreen] = useState(false);
  const [recommendedMedicines, setRecommendedMedicines] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState({});
  const [generatedPDF, setGeneratedPDF] = useState(null);
  const [pdfPreviewUrl, setPdfPreviewUrl] = useState(null);
  const [currentPrescription, setCurrentPrescription] = useState(null);
  const createdUrlsRef = useRef([]);
  const downloadButtonRef = useRef(null);

  const subUserId = selectedEntity?.subUserId || null;

  // Detect small screen height
  useEffect(() => {
    const checkDevice = () => {
      const smallScreen = window.innerHeight < 600;
      setIsSmallScreen(smallScreen);
    };
    checkDevice();
    window.addEventListener("resize", checkDevice);
    return () => window.removeEventListener("resize", checkDevice);
  }, []);

  const goBack = () => {
    if (navigateBack) {
      navigateBack();
    } else {
      console.error("Router not available for back navigation");
      window.history.back();
    }
  };
  console.log("isDoctor",isDoctor)

  // Permission Check for Doctor
  useEffect(() => {
    if (
      isDoctor &&
      selectedEntity &&
      !selectedEntity.permissions?.prescription
    ) {
      toast.error(
        "You do not have permission to access Prescriptions for this patient.",
        { className: "toast" }
      );
      goBack();
    }
  }, [isDoctor, selectedEntity]);

  // Load data
  useEffect(() => {
    const fetchData = async () => {
      if (!subUserId) return;
      setLoading(true);
      try {
        const prescriptions = await getPrescriptions(subUserId);
        setRecords(prescriptions);
        const recommended = await getRecommendedMedicines();
        setRecommendedMedicines(recommended);
      } catch (error) {
        console.error("Error fetching data:", error);
        toast.error(`Failed to load data: ${error.message}`, {
          className: "toast",
        });
      } finally {
        setLoading(false);
      }
    };
    fetchData();

    return () => {
      createdUrlsRef.current.forEach((url) => {
        try {
          URL.revokeObjectURL(url);
        } catch (_) {}
      });
      if (generatedPDF?.url) {
        URL.revokeObjectURL(generatedPDF.url);
      }
      if (pdfPreviewUrl) {
        URL.revokeObjectURL(pdfPreviewUrl);
      }
    };
  }, [subUserId]);

  const handleImageError = useCallback((recordId) => {
    setImageErrors((prev) => ({ ...prev, [recordId]: true }));
  }, []);

  const handleViewPreview = async (rec) => {
    if (rec.blobName) {
      try {
        setLoading(true);
        const secureUrl = await getPrescriptionSecureUrl(rec.id);

        if (isSmallScreen) {
          window.open(secureUrl, "_blank");
        } else {
          setPreviewUrl(secureUrl);
          setPreviewFilePath(null);
          setShowPreviewModal(true);
        }
      } catch (error) {
        console.error("Error opening preview:", error);
        toast.error(`Error opening file: ${error.message}`, {
          className: "toast",
        });
      } finally {
        setLoading(false);
      }
    } else {
      try {
        setLoading(true);
        const pdfData = await generatePrescriptionPDF(rec);
        setGeneratedPDF(pdfData);
        setCurrentPrescription(rec);
        if (isSmallScreen) {
          openPDFInNewTab(pdfData.blob);
        } else {
          setPdfPreviewUrl(pdfData.url);
          setShowPreviewModal(true);
        }
      } catch (error) {
        console.error("Error generating PDF preview:", error);
        toast.error("Failed to generate prescription PDF", {
          className: "toast",
        });
      } finally {
        setLoading(false);
      }
    }
  };

  const handleDownload = async (rec) => {
    if (rec.blobName) {
      try {
        const secureUrl = await getPrescriptionSecureUrl(rec.id);
        const link = document.createElement("a");
        link.href = secureUrl;
        link.download = rec.originalFileName || rec.title || "prescription";
        link.target = "_blank";
        link.rel = "noopener noreferrer";
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        toast.success("Download started", { className: "toast" });
      } catch (error) {
        console.error("Download failed:", error);
        toast.error("Failed to download file", { className: "toast" });
      }
    } else {
      try {
        setLoading(true);
        const pdfData = await generatePrescriptionPDF(rec);
        downloadPDF(pdfData.blob, pdfData.filename);
        toast.success("Prescription PDF downloaded", { className: "toast" });
      } catch (error) {
        toast.error("Failed to generate PDF", { className: "toast" });
      } finally {
        setLoading(false);
      }
    }
  };

  useEffect(() => {
    if (showPreviewModal && downloadButtonRef.current) {
      setTimeout(() => {
        downloadButtonRef.current?.focus();
      }, 100);
    }
  }, [showPreviewModal]);

  const addMedicineField = () => {
    if (isReadOnly) return;
    setMedicines([
      ...medicines,
      {
        medicineName: "",
        dosage: "",
        frequency: "",
        times: [""],
        durationDays: "",
        instructions: "",
        startDate: "",
        endDate: "",
      },
    ]);
    setShowSuggestions((prev) => ({ ...prev, [medicines.length]: false }));
  };

  const calculateEndDate = (start, duration) => {
    if (!start || !duration) return "";
    const days = parseInt(duration.match(/\d+/)?.[0] || "0", 10);
    if (days <= 0) return "";
    const startDateObj = new Date(start);
    if (isNaN(startDateObj.getTime())) return "";
    const endDateObj = new Date(startDateObj);
    endDateObj.setDate(startDateObj.getDate() + days);
    return endDateObj.toISOString().split("T")[0];
  };

  const calculateDuration = (start, end) => {
    if (!start || !end) return "";
    const startDateObj = new Date(start);
    const endDateObj = new Date(end);
    if (isNaN(startDateObj.getTime()) || isNaN(endDateObj.getTime())) return "";
    const timeDiff = endDateObj.getTime() - startDateObj.getTime();
    const daysDiff = Math.ceil(timeDiff / (1000 * 3600 * 24));
    return daysDiff > 0 ? `${daysDiff} days` : "";
  };

  const handleMedicineNameChange = async (index, value) => {
    if (isReadOnly) return;
    const updated = [...medicines];
    updated[index].medicineName = value;
    setMedicines(updated);

    if (value.length > 0) {
      try {
        const data = await getRecommendedMedicines(value);
        setRecommendedMedicines(data);
        setShowSuggestions((prev) => ({ ...prev, [index]: true }));
      } catch (err) {
        setShowSuggestions((prev) => ({ ...prev, [index]: false }));
      }
    } else {
      setShowSuggestions((prev) => ({ ...prev, [index]: false }));
    }
  };

  const handleMedicineSelect = (index, med) => {
    if (isReadOnly) return;

    const updated = medicines.map((m, i) =>
      i === index
        ? {
            ...m,
            medicineName: med.medicine_name || "",
            brandName: med.brand_name || "",
            dosage: med.dosage_form || med.dosage || "",
            frequency: med.frequency || "",
            times: med.times && Array.isArray(med.times) ? med.times : [""],
            durationDays: med.duration_days || "",
            instructions: med.instructions || "",
          }
        : m
    );

    setMedicines(updated);
    setShowSuggestions((prev) => ({ ...prev, [index]: false }));
  };

  const handleMedicineChange = (index, field, value, timeIndex = null) => {
    if (isReadOnly) return;
    const updated = [...medicines];
    if (field === "times" && timeIndex !== null) {
      updated[index].times[timeIndex] = value;
    } else if (field === "medicineName") {
      handleMedicineNameChange(index, value);
      return;
    } else {
      updated[index][field] = value;
      if (field === "frequency") {
        const match = value.match(/(\d+)\s*times?\/day/i);
        const count = match ? parseInt(match[1], 10) : 1;
        updated[index].times = Array(count).fill("");
      }
      if (field === "startDate" && value && updated[index].durationDays) {
        updated[index].endDate = calculateEndDate(
          value,
          updated[index].durationDays
        );
      }
      if (field === "durationDays" && value && updated[index].startDate) {
        updated[index].endDate = calculateEndDate(
          updated[index].startDate,
          value
        );
      }
      if (field === "endDate" && value && updated[index].startDate) {
        updated[index].durationDays = calculateDuration(
          updated[index].startDate,
          value
        );
      }
    }
    setMedicines(updated);
  };

  const handleFileChange = (e) => {
    if (isReadOnly) return;
    const selectedFile = e.target.files?.[0] || null;
    if (selectedFile) {
      const validTypes = ["image/jpeg", "image/png", "application/pdf"];
      if (!validTypes.includes(selectedFile.type)) {
        toast.error("Please upload a JPEG, PNG, or PDF file.", {
          className: "toast",
        });
        return;
      }
      if (selectedFile.size > 5 * 1024 * 1024) {
        toast.error("File size must be less than 5MB.", { className: "toast" });
        return;
      }
      const fileUrl = URL.createObjectURL(selectedFile);
      setFile(selectedFile);
      setFilePreview(fileUrl);
      createdUrlsRef.current.push(fileUrl);
      setInputType("file");
    } else {
      setFilePreview("");
    }
  };

  const resetForm = () => {
    if (isReadOnly) return;
    setDoctorName("");
    setTitle("");
    setNotes("");
    setMedicines([
      {
        medicineName: "",
        dosage: "",
        frequency: "",
        times: [""],
        durationDays: "",
        instructions: "",
        startDate: "",
        endDate: "",
      },
    ]);
    setDate(new Date().toISOString().split("T")[0]);
    setFile(null);
    setFilePreview("");
    setEditingId(null);
    setShowForm(false);
    setInputType("manual");
    setShowSuggestions({});
  };

  const handleSubmit = async (e) => {
    if (isReadOnly) return;
    e.preventDefault();

    if (!doctorName.trim() || !title.trim() || !subUserId) {
      toast.error(
        "Doctor's name, title, and sub-user selection are required.",
        { className: "toast" }
      );
      return;
    }

    if (inputType === "manual") {
      const invalidMedicine = medicines.some(
        (m) =>
          !m.medicineName.trim() ||
          !m.dosage.trim() ||
          !m.frequency ||
          m.times.some((t) => !t) ||
          !m.startDate ||
          isNaN(new Date(m.startDate).getTime())
      );
      if (invalidMedicine) {
        toast.error(
          "Please fill all required medicine fields with valid data (name, dosage, frequency, times, start date).",
          { className: "toast" }
        );
        return;
      }
    } else if (inputType === "file" && !file) {
      toast.error("Please upload a prescription file.", { className: "toast" });
      return;
    }

    setLoading(true);
    const formData = new FormData();
    formData.append("doctorName", doctorName);
    formData.append("title", title);
    formData.append("notes", notes);
    formData.append("subUserId", subUserId.toString());
    formData.append("inputType", inputType);

    if (inputType === "manual") {
      medicines.forEach((med, index) => {
        formData.append(`medicines[${index}][medicineName]`, med.medicineName);
        formData.append(`medicines[${index}][brandName]`, med.brandName || ""); // ← NEW
        formData.append(`medicines[${index}][dosage]`, med.dosage || "");
        formData.append(`medicines[${index}][frequency]`, med.frequency || "");
        formData.append(
          `medicines[${index}][durationDays]`,
          med.durationDays || ""
        );
        formData.append(
          `medicines[${index}][instructions]`,
          med.instructions || ""
        );
        formData.append(`medicines[${index}][startDate]`, med.startDate || "");
        formData.append(`medicines[${index}][endDate]`, med.endDate || "");

        med.times.forEach((time, timeIndex) => {
          formData.append(`medicines[${index}][times][${timeIndex}]`, time);
        });
      });
    }

    if (file) {
      formData.append("prescriptionImage", file);
    }

    try {
      if (editingId) {
        const updatedPrescription = await updatePrescription(
          editingId,
          formData
        );
        setRecords(
          records.map((rec) =>
            rec.id === editingId ? updatedPrescription : rec
          )
        );
        toast.success("Prescription updated", { className: "toast" });
      } else {
        const newPrescription = await addPrescription(formData);
        setRecords([newPrescription, ...records]);
        toast.success("Prescription saved", { className: "toast" });
      }
      resetForm();
    } catch (error) {
      console.error(
        `Error ${editingId ? "updating" : "saving"} prescription:`,
        error
      );
      toast.error(
        `Failed to ${editingId ? "update" : "save"} prescription: ${
          error.message
        }`,
        { className: "toast" }
      );
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (prescription) => {
    if (isReadOnly) return;

    setDoctorName(prescription.doctorName || "");
    setTitle(prescription.title || "");
    setNotes(prescription.notes || "");
    setDate(
      prescription.createdAt
        ? new Date(prescription.createdAt).toISOString().split("T")[0]
        : new Date().toISOString().split("T")[0]
    );

    if (prescription.medicines && prescription.medicines.length > 0) {
      setMedicines(
        prescription.medicines.map((m) => ({
          medicineName: m.medicineName || "",
          brandName: m.brandName || "",
          dosage: m.dosage || "",
          frequency: m.frequency || "",
          times: m.times && Array.isArray(m.times) ? m.times : [""],
          durationDays: m.durationDays || "",
          instructions: m.instructions || "",
          startDate: m.startDate
            ? new Date(m.startDate).toISOString().split("T")[0]
            : "",
          endDate: m.endDate
            ? new Date(m.endDate).toISOString().split("T")[0]
            : "",
        }))
      );
      setInputType("manual");
    } else if (prescription.blobName) {
      setMedicines([
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
      ]);
      setInputType("file");
      setFilePreview("");
    } else {
      setMedicines([
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
      ]);
      setInputType("manual");
    }

    setFile(null);
    setEditingId(prescription.id);
    setShowForm(true);
    setShowSuggestions({});
  };
  const handleDelete = async (id) => {
    if (isReadOnly) return;

    try {
      await deletePrescription(id);

      // ✅ Toast FIRST (important)
      toast.success("Prescription deleted successfully", {
        className: "toast",
      });

      // ✅ Then update UI state
      setRecords((prev) => prev.filter((rec) => rec.id !== id));

      setImageErrors((prev) => {
        const updated = { ...prev };
        delete updated[id];
        return updated;
      });
    } catch (error) {
      console.error("Error deleting prescription:", error);

      toast.error(
        error?.message
          ? `Failed to delete prescription: ${error.message}`
          : "Failed to delete prescription",
        { className: "toast" }
      );
    }
  };

  const isPdf = (fileName) => {
    return fileName && fileName.toLowerCase().endsWith(".pdf");
  };

  const closePreviewModal = () => {
    setShowPreviewModal(false);
    setPreviewUrl(null);
    setPdfPreviewUrl(null);
    setCurrentPrescription(null);
    if (generatedPDF) {
      URL.revokeObjectURL(generatedPDF.url);
      setGeneratedPDF(null);
    }
  };

  const handleDownloadInModal = () => {
    if (previewUrl) {
      handleDownload({ blobName: true, id: currentPrescription?.id });
    } else if (generatedPDF) {
      downloadPDF(generatedPDF.blob, generatedPDF.filename);
    }
  };

  return (
    <motion.div
      className="min-h-screen bg-gradient w-full"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <div className=" mx-auto px-2 sm:px-4 md:px-6 lg:px-8 py-3 box-border">
        {/* Header Card */}
        <Card className="mb-3 rounded-xl glass-card border border-primary shadow-soft w-full">
          <CardHeader>
            <CardTitle
              className={`text-sm sm:text-base md:text-lg font-semibold text-accent text-center ${
                isSmallScreen ? "text-base" : ""
              }`}
            >
              Prescriptions for {selectedEntity?.name || "Child"}
            </CardTitle>
          </CardHeader>
        </Card>

        {/* VIEW-ONLY BANNER */}
        {isReadOnly && (
          <div className="bg-amber-50 border border-amber-300 text-amber-800 px-4 py-2.5 rounded-xl text-center text-sm font-medium flex items-center justify-center gap-2 mb-3">
            <Lock className="w-5 h-5" />
            <span>View Only — Editing is disabled</span>
          </div>
        )}

        {loading && (
          <div className="text-center text-muted text-sm">Loading...</div>
        )}

        {/* Add Record Button — HIDDEN IN READ-ONLY */}
        {!isReadOnly && !showForm && !isDoctor && (
          <div className="flex justify-center my-3">
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button
                className={`button-primary text-accent text-xs sm:text-sm font-medium rounded-full px-5 py-2 shadow-soft hover:shadow-lg transition-all ${
                  isSmallScreen ? "px-4 py-1.5" : ""
                }`}
                onClick={() => setShowForm(true)}
              >
                <Pill
                  className={`w-4 h-4 mr-2 ${isSmallScreen ? "w-3 h-3" : ""}`}
                />
                Add Prescription
              </Button>
            </motion.div>
          </div>
        )}

        {/* Modal Form — HIDDEN IN READ-ONLY */}
        <AnimatePresence>
          {showForm && !isReadOnly && (
            <Dialog open={showForm} onOpenChange={setShowForm}>
              <DialogContent
                className={`w-[95vw] max-w-md p-2 sm:p-3 glass-card border border-primary shadow-soft ${
                  isSmallScreen ? "max-h-[80vh]" : "max-h-[90vh]"
                } overflow-y-auto`}
                aria-labelledby="prescription-form-title"
                aria-describedby="prescription-form-description"
              >
                <motion.div
                  initial={{ y: 50, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  exit={{ y: 50, opacity: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <DialogHeader className="mb-2">
                    <DialogTitle
                      id="prescription-form-title"
                      className={`text-accent font-bold ${
                        isSmallScreen ? "text-base" : "text-lg"
                      }`}
                    >
                      {editingId ? "Edit Prescription" : "Add Prescription"}
                    </DialogTitle>
                    <DialogDescription
                      id="prescription-form-description"
                      className={`text-muted ${
                        isSmallScreen ? "text-xs" : "text-sm"
                      }`}
                    >
                      {editingId
                        ? "Update the prescription details below."
                        : "Fill out the fields below to add a new prescription."}
                    </DialogDescription>
                  </DialogHeader>

                  <div className="space-y-2">
                    {/* Doctor's Name */}
                    <div>
                      <label
                        className={`text-xs font-medium text-primary ${
                          isSmallScreen ? "text-xs" : ""
                        }`}
                      >
                        Doctor's Name
                      </label>
                      <div
                        className={`flex items-center rounded-lg px-2 mt-1 bg-input border border-primary w-full ${
                          isSmallScreen ? "p-1.5" : ""
                        }`}
                      >
                        <User
                          className={`text-primary mr-1 ${
                            isSmallScreen ? "w-4 h-4" : "w-5 h-5"
                          }`}
                        />
                        <Input
                          type="text"
                          placeholder="Enter doctor's name"
                          value={doctorName}
                          onChange={(e) => setDoctorName(e.target.value)}
                          className={`flex-1 bg-transparent p-0 text-xs sm:text-sm border-none text-accent focus:ring-0 ${
                            isSmallScreen ? "text-xs" : ""
                          }`}
                          required
                        />
                      </div>
                    </div>

                    {/* Prescription Title */}
                    <div>
                      <label
                        className={`text-xs font-medium text-primary ${
                          isSmallScreen ? "text-xs" : ""
                        }`}
                      >
                        Prescription Title
                      </label>
                      <div
                        className={`flex items-center rounded-lg px-2 mt-1 bg-input border border-primary w-full ${
                          isSmallScreen ? "p-1.5" : ""
                        }`}
                      >
                        <FileText
                          className={`text-primary mr-1 ${
                            isSmallScreen ? "w-4 h-4" : "w-5 h-5"
                          }`}
                        />
                        <Input
                          type="text"
                          placeholder="Enter prescription title"
                          value={title}
                          onChange={(e) => setTitle(e.target.value)}
                          className={`flex-1 bg-transparent p-0 text-xs sm:text-sm border-none text-accent focus:ring-0 ${
                            isSmallScreen ? "text-xs" : ""
                          }`}
                          required
                        />
                      </div>
                    </div>

                    {/* Notes */}
                    <div>
                      <label
                        className={`text-xs font-medium text-primary ${
                          isSmallScreen ? "text-xs" : ""
                        }`}
                      >
                        Notes
                      </label>
                      <textarea
                        placeholder="Enter any additional notes"
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                        className={`w-full bg-input rounded-lg px-1.5 py-0.5 mt-1 border border-primary text-accent outline-none ${
                          isSmallScreen ? "text-xs h-16" : "text-sm h-20"
                        }`}
                      />
                    </div>

                    {/* Input Type Selection */}
                    <div className="flex gap-4">
                      <label
                        className={`flex items-center text-xs ${
                          isSmallScreen ? "text-xs" : ""
                        }`}
                      >
                        <input
                          type="radio"
                          name="inputType"
                          value="manual"
                          checked={inputType === "manual"}
                          onChange={() => setInputType("manual")}
                          className="mr-1"
                        />
                        Enter Medicine Details
                      </label>
                      <label
                        className={`flex items-center text-xs ${
                          isSmallScreen ? "text-xs" : ""
                        }`}
                      >
                        <input
                          type="radio"
                          name="inputType"
                          value="file"
                          checked={inputType === "file"}
                          onChange={() => setInputType("file")}
                          className="mr-1"
                        />
                        Upload Prescription
                      </label>
                    </div>
                    {/* Manual Medicine Input */}
                    {inputType === "manual" && (
                      <div>
                        <label
                          className={`text-xs font-medium text-primary ${
                            isSmallScreen ? "text-xs" : ""
                          }`}
                        >
                          Medicines
                        </label>
                        {medicines.map((med, index) => (
                          <div
                            key={index}
                            className="border rounded-lg p-2 mb-2 bg-card border-primary"
                          >
                            <div className="space-y-2">
                              {/* Medicine Name with Autocomplete */}
                              <div className="relative">
                                <label
                                  className={`text-xs font-medium text-primary ${
                                    isSmallScreen ? "text-xs" : ""
                                  }`}
                                >
                                  Medicine Name *
                                </label>
                                <div
                                  className={`flex items-center rounded-lg px-2 mt-1 bg-input border border-primary w-full ${
                                    isSmallScreen ? "p-1.5" : ""
                                  }`}
                                >
                                  <Pill
                                    className={`text-primary mr-1 ${
                                      isSmallScreen ? "w-4 h-4" : "w-5 h-5"
                                    }`}
                                  />
                                  <Input
                                    type="text"
                                    placeholder="Enter medicine name"
                                    value={med.medicineName}
                                    onChange={(e) =>
                                      handleMedicineChange(
                                        index,
                                        "medicineName",
                                        e.target.value
                                      )
                                    }
                                    className={`flex-1 bg-transparent p-0 text-xs sm:text-sm border-none text-accent focus:ring-0 ${
                                      isSmallScreen ? "text-xs" : ""
                                    }`}
                                    required={inputType === "manual"}
                                  />
                                </div>
                                {showSuggestions[index] &&
                                  recommendedMedicines.length > 0 && (
                                    <motion.ul
                                      initial={{ opacity: 0, y: -10 }}
                                      animate={{ opacity: 1, y: 0 }}
                                      className="absolute z-50 w-full bg-card border border-primary rounded-lg shadow-soft max-h-28 overflow-y-auto mt-1"
                                    >
                                      {recommendedMedicines.map((recMed) => (
                                        <motion.li
                                          key={recMed.id}
                                          onClick={() =>
                                            handleMedicineSelect(index, recMed)
                                          }
                                          className={`cursor-pointer hover:bg-input px-2 py-1 text-xs text-accent ${
                                            isSmallScreen ? "text-xs" : ""
                                          }`}
                                          whileHover={{
                                            backgroundColor:
                                              "var(--color-primary/10)",
                                          }}
                                        >
                                          {recMed.medicine_name}
                                          {recMed.brand_name && (
                                            <span className="text-muted ml-2">
                                              ({recMed.brand_name})
                                            </span>
                                          )}
                                        </motion.li>
                                      ))}
                                    </motion.ul>
                                  )}
                              </div>

                              {/* Brand Name (NEW FIELD) */}
                              <div>
                                <label
                                  className={`text-xs font-medium text-primary ${
                                    isSmallScreen ? "text-xs" : ""
                                  }`}
                                >
                                  Brand Name (Optional)
                                </label>
                                <div
                                  className={`flex items-center rounded-lg px-2 mt-1 bg-input border border-primary w-full ${
                                    isSmallScreen ? "p-1.5" : ""
                                  }`}
                                >
                                  <Pill
                                    className={`text-primary mr-1 ${
                                      isSmallScreen ? "w-4 h-4" : "w-5 h-5"
                                    }`}
                                  />
                                  <Input
                                    type="text"
                                    placeholder="e.g. Calpol, Crocin, Comirnaty"
                                    value={med.brandName || ""}
                                    onChange={(e) =>
                                      handleMedicineChange(
                                        index,
                                        "brandName",
                                        e.target.value
                                      )
                                    }
                                    className={`flex-1 bg-transparent p-0 text-xs sm:text-sm border-none text-accent focus:ring-0 ${
                                      isSmallScreen ? "text-xs" : ""
                                    }`}
                                  />
                                </div>
                              </div>

                              {/* Dosage */}
                              <div>
                                <label
                                  className={`text-xs font-medium text-primary ${
                                    isSmallScreen ? "text-xs" : ""
                                  }`}
                                >
                                  Dosage *
                                </label>
                                <div
                                  className={`flex items-center rounded-lg px-2 mt-1 bg-input border border-primary w-full ${
                                    isSmallScreen ? "p-1.5" : ""
                                  }`}
                                >
                                  <Droplet
                                    className={`text-primary mr-1 ${
                                      isSmallScreen ? "w-4 h-4" : "w-5 h-5"
                                    }`}
                                  />
                                  <Input
                                    type="text"
                                    placeholder="e.g. 1 tablet, 5ml"
                                    value={med.dosage}
                                    onChange={(e) =>
                                      handleMedicineChange(
                                        index,
                                        "dosage",
                                        e.target.value
                                      )
                                    }
                                    className={`flex-1 bg-transparent p-0 text-xs sm:text-sm border-none text-accent focus:ring-0 ${
                                      isSmallScreen ? "text-xs" : ""
                                    }`}
                                    required={inputType === "manual"}
                                  />
                                </div>
                              </div>

                              {/* Frequency */}
                              <div>
                                <label
                                  className={`text-xs font-medium text-primary ${
                                    isSmallScreen ? "text-xs" : ""
                                  }`}
                                >
                                  Frequency *
                                </label>
                                <div
                                  className={`flex items-center rounded-lg px-2 min-h-8 mt-1 bg-input border border-primary w-full ${
                                    isSmallScreen ? "p-1.5" : ""
                                  }`}
                                >
                                  <Clock
                                    className={`text-primary mr-1 ${
                                      isSmallScreen ? "w-4 h-4" : "w-5 h-5"
                                    }`}
                                  />
                                  <select
                                    value={med.frequency}
                                    onChange={(e) =>
                                      handleMedicineChange(
                                        index,
                                        "frequency",
                                        e.target.value
                                      )
                                    }
                                    className={`flex-1 bg-transparent p-0 text-xs sm:text-sm border-none text-accent focus:ring-0 ${
                                      isSmallScreen ? "text-xs" : ""
                                    }`}
                                    required={inputType === "manual"}
                                  >
                                    <option value="">Select frequency</option>
                                    <option value="1 time/day">
                                      1 time/day
                                    </option>
                                    <option value="2 times/day">
                                      2 times/day
                                    </option>
                                    <option value="3 times/day">
                                      3 times/day
                                    </option>
                                    <option value="4 times/day">
                                      4 times/day
                                    </option>
                                  </select>
                                </div>
                              </div>

                              {/* Times */}
                              {med.times.map((time, timeIndex) => (
                                <div key={timeIndex}>
                                  <label
                                    className={`text-xs font-medium text-primary ${
                                      isSmallScreen ? "text-xs" : ""
                                    }`}
                                  >
                                    Time {timeIndex + 1} *
                                  </label>
                                  <div
                                    className={`flex items-center rounded-lg px-2 mt-1 bg-input border border-primary w-full ${
                                      isSmallScreen ? "p-1.5" : ""
                                    }`}
                                  >
                                    <Clock
                                      className={`text-primary mr-1 ${
                                        isSmallScreen ? "w-4 h-4" : "w-5 h-5"
                                      }`}
                                    />
                                    <Input
                                      type="time"
                                      value={time}
                                      onChange={(e) =>
                                        handleMedicineChange(
                                          index,
                                          "times",
                                          e.target.value,
                                          timeIndex
                                        )
                                      }
                                      className={`flex-1 bg-transparent p-0 text-xs sm:text-sm border-none text-accent focus:ring-0 ${
                                        isSmallScreen ? "text-xs" : ""
                                      }`}
                                      required={inputType === "manual"}
                                    />
                                  </div>
                                </div>
                              ))}

                              {/* Start Date */}
                              <div>
                                <label
                                  className={`text-xs font-medium text-primary ${
                                    isSmallScreen ? "text-xs" : ""
                                  }`}
                                >
                                  Start Date *
                                </label>
                                <div
                                  className={`flex items-center rounded-lg px-2 mt-1 bg-input border border-primary w-full ${
                                    isSmallScreen ? "p-1.5" : ""
                                  }`}
                                >
                                  <Calendar
                                    className={`text-primary mr-1 ${
                                      isSmallScreen ? "w-4 h-4" : "w-5 h-5"
                                    }`}
                                  />
                                  <Input
                                    type="date"
                                    value={med.startDate}
                                    onChange={(e) =>
                                      handleMedicineChange(
                                        index,
                                        "startDate",
                                        e.target.value
                                      )
                                    }
                                    className={`flex-1 bg-transparent p-0 text-xs sm:text-sm border-none text-accent focus:ring-0 ${
                                      isSmallScreen ? "text-xs" : ""
                                    }`}
                                    required={inputType === "manual"}
                                  />
                                </div>
                              </div>

                              {/* Duration */}
                              <div>
                                <label
                                  className={`text-xs font-medium text-primary ${
                                    isSmallScreen ? "text-xs" : ""
                                  }`}
                                >
                                  Duration (days)
                                </label>
                                <div
                                  className={`flex items-center rounded-lg px-2 mt-1 bg-input border border-primary w-full ${
                                    isSmallScreen ? "p-1.5" : ""
                                  }`}
                                >
                                  <Calendar
                                    className={`text-primary mr-1 ${
                                      isSmallScreen ? "w-4 h-4" : "w-5 h-5"
                                    }`}
                                  />
                                  <Input
                                    type="text"
                                    placeholder="e.g. 7 days"
                                    value={med.durationDays}
                                    onChange={(e) =>
                                      handleMedicineChange(
                                        index,
                                        "durationDays",
                                        e.target.value
                                      )
                                    }
                                    className={`flex-1 bg-transparent p-0 text-xs sm:text-sm border-none text-accent focus:ring-0 ${
                                      isSmallScreen ? "text-xs" : ""
                                    }`}
                                  />
                                </div>
                              </div>

                              {/* End Date */}
                              <div>
                                <label
                                  className={`text-xs font-medium text-primary ${
                                    isSmallScreen ? "text-xs" : ""
                                  }`}
                                >
                                  End Date (Optional)
                                </label>
                                <div
                                  className={`flex items-center rounded-lg px-2 mt-1 bg-input border border-primary w-full ${
                                    isSmallScreen ? "p-1.5" : ""
                                  }`}
                                >
                                  <Calendar
                                    className={`text-primary mr-1 ${
                                      isSmallScreen ? "w-4 h-4" : "w-5 h-5"
                                    }`}
                                  />
                                  <Input
                                    type="date"
                                    value={med.endDate}
                                    onChange={(e) =>
                                      handleMedicineChange(
                                        index,
                                        "endDate",
                                        e.target.value
                                      )
                                    }
                                    className={`flex-1 bg-transparent p-0 text-xs sm:text-sm border-none text-accent focus:ring-0 ${
                                      isSmallScreen ? "text-xs" : ""
                                    }`}
                                  />
                                </div>
                              </div>

                              {/* Instructions */}
                              <div>
                                <label
                                  className={`text-xs font-medium text-primary ${
                                    isSmallScreen ? "text-xs" : ""
                                  }`}
                                >
                                  Instructions
                                </label>
                                <textarea
                                  placeholder="e.g. Take after meals"
                                  value={med.instructions}
                                  onChange={(e) =>
                                    handleMedicineChange(
                                      index,
                                      "instructions",
                                      e.target.value
                                    )
                                  }
                                  className={`w-full bg-input rounded-lg px-1.5 py-0.5 mt-1 border border-primary text-accent outline-none ${
                                    isSmallScreen
                                      ? "text-xs h-16"
                                      : "text-sm h-20"
                                  }`}
                                />
                              </div>
                            </div>
                          </div>
                        ))}
                        <motion.div
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                        >
                          <Button
                            variant="outline"
                            className="border border-primary text-primary hover:bg-input text-xs sm:text-sm shadow-soft"
                            onClick={addMedicineField}
                          >
                            Add Another Medicine
                          </Button>
                        </motion.div>
                      </div>
                    )}

                    {/* File Upload */}
                    {inputType === "file" && (
                      <div>
                        <label
                          className={`text-xs font-medium text-primary ${
                            isSmallScreen ? "text-xs" : ""
                          }`}
                        >
                          Upload Prescription (JPEG/PNG/PDF)
                        </label>
                        <div className="flex flex-col items-center mt-1">
                          <label className="relative w-full h-24 border-2 border-dashed border-primary rounded-lg flex items-center justify-center cursor-pointer hover:bg-input/50 transition">
                            <input
                              type="file"
                              accept=".jpg,.jpeg,.png,.pdf"
                              className="hidden"
                              onChange={handleFileChange}
                              required={inputType === "file" && !filePreview}
                            />
                            {filePreview ? (
                              isPdf(file?.name) ? (
                                <div className="flex flex-col items-center justify-center p-2">
                                  <FileText className="w-10 h-10 text-red-500" />
                                  <p className="text-xs mt-1 truncate max-w-[150px]">
                                    {file?.name}
                                  </p>
                                </div>
                              ) : (
                                <img
                                  src={filePreview}
                                  alt="Preview"
                                  className="w-full h-full object-cover rounded-lg shadow-sm"
                                  onError={() =>
                                    setFilePreview(
                                      "/images/fallback-prescription.png"
                                    )
                                  }
                                />
                              )
                            ) : (
                              <div className="flex flex-col items-center">
                                <Upload className="w-8 h-8 text-primary mb-1" />
                                <p className="text-xs text-muted">
                                  Click to upload
                                </p>
                              </div>
                            )}
                          </label>
                          <p className="text-xs text-muted mt-1">
                            JPEG, PNG, or PDF (Max 5MB)
                          </p>
                        </div>
                      </div>
                    )}

                    {/* Date */}
                    <div>
                      <label
                        className={`text-xs font-medium text-primary ${
                          isSmallScreen ? "text-xs" : ""
                        }`}
                      >
                        Date
                      </label>
                      <div
                        className={`flex items-center rounded-lg px-2 mt-1 bg-input border border-primary w-full ${
                          isSmallScreen ? "p-1.5" : ""
                        }`}
                      >
                        <Calendar
                          className={`text-primary mr-1 ${
                            isSmallScreen ? "w-4 h-4" : "w-5 h-5"
                          }`}
                        />
                        <Input
                          type="date"
                          value={date}
                          onChange={(e) => setDate(e.target.value)}
                          className={`flex-1 bg-transparent p-0 text-xs sm:text-sm border-none text-accent focus:ring-0 ${
                            isSmallScreen ? "text-xs" : ""
                          }`}
                          required
                        />
                      </div>
                    </div>
                  </div>

                  <DialogFooter
                    className={`mt-2 flex flex-col sm:flex-row gap-2 ${
                      isSmallScreen ? "mt-1.5" : ""
                    }`}
                  >
                    <motion.div
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <Button
                        onClick={handleSubmit}
                        disabled={loading}
                        className={`button-primary text-accent text-xs sm:text-sm shadow-soft hover:shadow-lg transition-all ${
                          isSmallScreen ? "py-1.5" : ""
                        }`}
                      >
                        {editingId ? "Update" : "Save"}
                      </Button>
                    </motion.div>
                    <motion.div
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <Button
                        variant="outline"
                        onClick={resetForm}
                        className={`border-primary text-primary hover:bg-input text-xs sm:text-sm shadow-soft ${
                          isSmallScreen ? "py-1.5" : ""
                        }`}
                        aria-label="Cancel prescription form"
                      >
                        Cancel
                      </Button>
                    </motion.div>
                  </DialogFooter>
                </motion.div>
              </DialogContent>
            </Dialog>
          )}
        </AnimatePresence>

        {/* Preview Modal — FIXED UI & UX */}
        <AnimatePresence>
          {showPreviewModal && !isSmallScreen && (
            <Dialog open={showPreviewModal} onOpenChange={closePreviewModal}>
              <DialogContent
                className="w-full max-w-6xl h-[85vh] p-0 glass-card border border-primary shadow-soft rounded-2xl overflow-hidden"
                aria-labelledby="preview-modal-title"
                aria-describedby="preview-modal-description"
              >
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.3 }}
                  className="flex flex-col h-full bg-background"
                >
                  {/* Header */}
                  <DialogHeader className="flex flex-row items-center justify-between px-6 py-4 border-b border-primary/20 bg-card/90 backdrop-blur-sm z-10">
                    <div>
                      <DialogTitle
                        id="preview-modal-title"
                        className="text-accent font-bold text-xl"
                      >
                        {previewUrl
                          ? "Prescription Preview"
                          : "Generated Prescription"}
                      </DialogTitle>
                      {/* <DialogDescription
                        id="preview-modal-description"
                        className="text-muted text-sm mt-1"
                      >
                        {currentPrescription?.title || "Prescription"} • Dr.{" "}
                        {currentPrescription?.doctorName || "Unknown"}
                      </DialogDescription> */}
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={closePreviewModal}
                      className="rounded-full hover:bg-input"
                      aria-label="Close preview"
                    >
                      <Trash2 className="w-5 h-5 text-muted" />
                    </Button>
                  </DialogHeader>

                  {/* PDF Viewer Area */}
                  <div className="flex-1 relative overflow-hidden bg-gray-100">
                    {previewUrl ? (
                      // Use <embed> — works perfectly in Chrome for PDFs
                      <embed
                        src={`${previewUrl}#toolbar=0&navpanes=0&scrollbar=0&view=FitH`}
                        type="application/pdf"
                        width="100%"
                        height="100%"
                        className="absolute inset-0"
                      />
                    ) : pdfPreviewUrl && currentPrescription ? (
                      <PDFViewer
                        width="100%"
                        height="100%"
                        className="border-0"
                      >
                        <PrescriptionPDFDocument
                          prescription={currentPrescription}
                        />
                      </PDFViewer>
                    ) : (
                      <div className="flex flex-col items-center justify-center h-full text-muted">
                        <FileText className="w-20 h-20 mb-4 opacity-30" />
                        <p className="text-lg">Loading prescription...</p>
                      </div>
                    )}
                  </div>
                </motion.div>
              </DialogContent>
            </Dialog>
          )}
        </AnimatePresence>
        {/* Prescription Records */}
        <motion.div
          className="space-y-2"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          {records.map((rec) => (
            <motion.div
              key={rec.id}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3 }}
            >
              <PrescriptionCard
                rec={rec}
                handleEdit={isReadOnly ? undefined : handleEdit}
                handleDelete={isReadOnly ? undefined : handleDelete}
                handleViewPreview={handleViewPreview}
                handleDownload={handleDownload}
                handleImageError={handleImageError}
                isPdf={isPdf}
                imageErrors={imageErrors}
                isSmallScreen={isSmallScreen}
              />
            </motion.div>
          ))}
          {!loading && records.length === 0 && (
            <div className="text-center text-muted text-sm">
              No prescriptions found.
            </div>
          )}
        </motion.div>
      </div>
    </motion.div>
  );
};

export default Prescriptions;
