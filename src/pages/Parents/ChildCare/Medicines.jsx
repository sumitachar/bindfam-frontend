import React, { useState, useEffect, useContext } from "react";
import {
  Pill,
  Droplet,
  Clock,
  Calendar,
  Pencil,
  Trash2,
  Lock,
  AlertCircle,
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
  addMedicine,
  deleteMedicine,
  getMedicines,
  updateMedicine,
} from "@/api/Parents/medicines";
import { getRecommendedMedicines } from "@/api/Parents/recommendedMedicines";
import { UserContext } from "@/context/UserContext";
import { getPrescriptions } from "@/api/Parents/prescriptions";
import MedicineReportButton from "./components/MedicineReportButton";

const Medicines = ({ navigateBack }) => {
  const { selectedEntity, isDoctor, user, isReadOnly } =
    useContext(UserContext);
  const [medicineName, setMedicineName] = useState("");
  const [dosage, setDosage] = useState("");
  const [frequency, setFrequency] = useState("");
  const [times, setTimes] = useState([""]);
  const [durationDays, setDurationDays] = useState("");
  const [instructions, setInstructions] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [records, setRecords] = useState([]);
  const [prescriptions, setPrescriptions] = useState([]);
  const [selectedPrescriptionId, setSelectedPrescriptionId] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [editId, setEditId] = useState(null);
  const [recommendedMedicines, setRecommendedMedicines] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isSmallScreen, setIsSmallScreen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [brandName, setBrandName] = useState("");

  const { subUserId } = selectedEntity || {};

  // Detect small screen height
  useEffect(() => {
    const checkDevice = () => {
      setIsSmallScreen(window.innerHeight < 600);
    };
    checkDevice();
    window.addEventListener("resize", checkDevice);
    return () => window.removeEventListener("resize", checkDevice);
  }, []);

  // Helper: 24h → 12h
  const formatTimeTo12Hour = (time) => {
    if (!time) return "N/A";
    const [hours, minutes] = time.split(":");
    const hour = parseInt(hours, 10);
    const period = hour >= 12 ? "PM" : "AM";
    const adjustedHour = hour % 12 || 12;
    return `${adjustedHour}:${minutes} ${period}`;
  };

  // Back navigation
  const goBack = () => {
    if (navigateBack) navigateBack();
    else window.history.back();
  };

  // Doctor permission check
  useEffect(() => {
    if (isDoctor && selectedEntity && !selectedEntity.permissions?.medicines) {
      toast.error(
        "You do not have permission to access Medicines for this patient.",
        { className: "toast" }
      );
      goBack();
    }
  }, [isDoctor, selectedEntity]);

  // Load data
  useEffect(() => {
    if (subUserId) {
      loadPrescriptions();
      loadMedicines();
      loadRecommendedMedicines();
    }
  }, [subUserId]);

  const loadMedicines = async () => {
    try {
      const data = await getMedicines(null, subUserId);
      setRecords(data || []);
    } catch (err) {
      console.error("Error fetching medicines:", err);
      toast.error("Failed to load medicines.", { className: "toast" });
    }
  };

  const loadPrescriptions = async () => {
    try {
      const data = await getPrescriptions(subUserId);
      setPrescriptions(data || []);
    } catch (err) {
      console.error("Error fetching prescriptions:", err);
    }
  };

  const loadRecommendedMedicines = async () => {
    try {
      const data = await getRecommendedMedicines();
      setRecommendedMedicines(data || []);
    } catch (err) {
      console.error("Error fetching recommended medicines:", err);
    }
  };

  // Medicine name autocomplete
  const handleMedicineNameChange = async (value) => {
    if (isReadOnly) return;
    setMedicineName(value);
    setErrors((prev) => ({ ...prev, medicineName: "" }));

    if (value.trim().length > 1) {
      try {
        const data = await getRecommendedMedicines(value);
        setRecommendedMedicines(data || []);
        setShowSuggestions(true);
      } catch (err) {
        setShowSuggestions(false);
      }
    } else {
      setShowSuggestions(false);
      loadRecommendedMedicines();
    }
  };

  const handleMedicineSelect = (med) => {
    if (isReadOnly) return;
    setMedicineName(med.medicine_name || "");
    setDosage(med.dosage_form || "");
    setFrequency(med.frequency || "");
    setTimes(med.times && Array.isArray(med.times) ? med.times : [""]);
    setDurationDays(med.duration_days || "");
    setInstructions(med.instructions || "");
    setBrandName(med.brand_name || "");
    setShowSuggestions(false);
    setErrors({});
  };

  // Frequency → times
  const handleFrequencyChange = (value) => {
    if (isReadOnly) return;
    setFrequency(value);
    const match = value.match(/(\d+)/);
    const count = match ? parseInt(match[0], 10) : 1;
    setTimes(Array(count).fill(""));
    setErrors((prev) => ({ ...prev, times: "" }));
  };

  const handleTimeChange = (index, value) => {
    if (isReadOnly) return;
    const updated = [...times];
    updated[index] = value;
    setTimes(updated);
    setErrors((prev) => ({ ...prev, times: "" }));
  };

  // Date calculations
  const calculateEndDate = (start, duration) => {
    if (!start || !duration) return "";
    const days = parseInt(duration.match(/\d+/)?.[0] || "0", 10);
    if (days <= 0) return "";
    const end = new Date(start);
    end.setDate(end.getDate() + days);
    return end.toISOString().split("T")[0];
  };

  const calculateDuration = (start, end) => {
    if (!start || !end) return "";
    const diff = (new Date(end) - new Date(start)) / (1000 * 60 * 60 * 24);
    return diff > 0 ? `${Math.ceil(diff)} days` : "";
  };

  const handleStartDateChange = (value) => {
    if (isReadOnly) return;
    setStartDate(value);
    setErrors((prev) => ({ ...prev, startDate: "" }));
    if (value && durationDays) {
      setEndDate(calculateEndDate(value, durationDays));
    }
  };

  const handleDurationChange = (value) => {
    if (isReadOnly) return;
    setDurationDays(value);
    if (startDate && value) {
      setEndDate(calculateEndDate(startDate, value));
    }
  };

  const handleEndDateChange = (value) => {
    if (isReadOnly) return;
    setEndDate(value);
    if (startDate && value) {
      setDurationDays(calculateDuration(startDate, value));
    }
  };

  // Validation
  const validateForm = () => {
    const newErrors = {};
    if (!medicineName.trim())
      newErrors.medicineName = "Medicine name is required";
    if (!dosage.trim()) newErrors.dosage = "Dosage is required";
    if (!frequency) newErrors.frequency = "Please select frequency";
    if (times.some((t) => !t))
      newErrors.times = "All time slots must be filled";
    if (!startDate) newErrors.startDate = "Start date is required";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Submit
  const handleSubmit = async () => {
    if (isReadOnly || loading) return;
    if (!validateForm()) return;

    setLoading(true);

    const payload = {
      medicineName: medicineName.trim(),
      dosage: dosage.trim(),
      brandName: brandName || null,
      frequency,
      times,
      durationDays: durationDays || null,
      instructions: instructions.trim() || null,
      startDate,
      endDate: endDate || null,
      prescriptionId: selectedPrescriptionId
        ? Number(selectedPrescriptionId)
        : null,
      subUserId,
    };

    try {
      if (editMode) {
        await updateMedicine(editId, payload);
        toast.success("Medicine updated successfully!", { className: "toast" });
      } else {
        await addMedicine(payload);
        toast.success("Medicine added successfully!", { className: "toast" });
      }
      await loadMedicines();
      closeForm();
    } catch (err) {
      console.error(err);
      toast.error(
        err.response?.data?.message ||
          `Failed to ${editMode ? "update" : "add"} medicine.`,
        { className: "toast" }
      );
    } finally {
      setLoading(false);
    }
  };

  const closeForm = () => {
    setShowForm(false);
    setEditMode(false);
    setEditId(null);

    setMedicineName("");
    setDosage("");
    setBrandName(""); // ✅ ADD THIS
    setFrequency("");
    setTimes([""]);
    setDurationDays("");
    setInstructions("");
    setStartDate("");
    setEndDate("");
    setSelectedPrescriptionId("");
    setErrors({});
    setShowSuggestions(false);
  };

  const handleEdit = (rec) => {
    if (isReadOnly) return;
    setEditMode(true);
    setEditId(rec.id);

    setMedicineName(rec.medicineName);
    setDosage(rec.dosage || "");
    setBrandName(rec.brandName || ""); // ✅ ADD THIS

    setFrequency(rec.frequency || "");
    setTimes(rec.times || [""]);
    setDurationDays(rec.durationDays || "");
    setInstructions(rec.instructions || "");
    setStartDate(
      rec.startDate ? new Date(rec.startDate).toISOString().split("T")[0] : ""
    );
    setEndDate(
      rec.endDate ? new Date(rec.endDate).toISOString().split("T")[0] : ""
    );
    setSelectedPrescriptionId(rec.prescriptionId || "");

    setShowForm(true);
    setErrors({});
  };

  const handleDelete = async (id) => {
    if (isReadOnly) return;
    if (!window.confirm("Are you sure you want to delete this medicine?"))
      return;
    try {
      await deleteMedicine(id);
      await loadMedicines();
      toast.success("Medicine deleted", { className: "toast" });
    } catch {
      toast.error("Failed to delete medicine.", { className: "toast" });
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return isNaN(date.getTime())
      ? "N/A"
      : date.toLocaleDateString("en-US", {
          month: "short",
          day: "2-digit",
          year: "numeric",
        });
  };

  return (
    <motion.div
      className="min-h-screen bg-gradient w-full"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <div className=" mx-auto px-2 sm:px-4 md:px-6 lg:px-8 py-3 box-border">
        {/* Header */}
        <Card className="mb-3 rounded-xl glass-card border border-primary shadow-soft">
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-accent text-center">
              Medicines for {selectedEntity?.name || "Child"}
            </CardTitle>
          </CardHeader>
        </Card>

        {/* View-only banner */}
        {isReadOnly && (
          <div className="bg-amber-50 border border-amber-300 text-amber-800 px-4 py-2.5 rounded-xl text-center text-sm font-medium flex items-center justify-center gap-2 mb-3">
            <Lock className="w-5 h-5" />
            View Only — Editing is disabled
          </div>
        )}

        {/* Add Button */}
        {!isReadOnly && !showForm && (
          <div className="flex flex-col sm:flex-row justify-center items-center gap-4 my-4">
            {/* Add Medicine Button */}
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button
                onClick={() => setShowForm(true)}
                className="button-primary rounded-full px-6 py-2.5 text-sm font-medium shadow-soft hover:shadow-lg transition-all flex items-center gap-2"
              >
                <Pill className="w-5 h-5" />
                Add Medicine
              </Button>
            </motion.div>

            {/* Medicine History Report Button */}
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <MedicineReportButton
                subUser={selectedEntity}
                medicines={records}
                isSmallScreen={isSmallScreen}
              />
            </motion.div>
          </div>
        )}

        {/* Form Modal */}
        <AnimatePresence>
          {showForm && !isReadOnly && (
            <Dialog open={showForm} onOpenChange={setShowForm}>
              <DialogContent className="glass-card border border-primary w-full max-w-md rounded-2xl shadow-soft p-5 max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle className="text-xl font-bold text-accent flex items-center gap-2">
                    <Pill className="w-6 h-6" />
                    {editMode ? "Edit Medicine" : "Add New Medicine"}
                  </DialogTitle>
                  <DialogDescription className="text-sm text-muted">
                    {editMode
                      ? "Update the medicine details below."
                      : "Fill in the details to add a new medicine."}
                  </DialogDescription>
                </DialogHeader>

                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    handleSubmit();
                  }}
                  className="space-y-4 mt-4"
                >
                  {/* Medicine Name */}
                  <div className="relative">
                    <label className="block text-sm font-medium text-primary mb-1">
                      Medicine Name *
                    </label>
                    <div className="flex items-center bg-input border border-primary rounded-full px-3 py-2">
                      <Pill className="w-5 h-5 text-primary mr-2" />
                      <Input
                        value={medicineName}
                        onChange={(e) =>
                          handleMedicineNameChange(e.target.value)
                        }
                        placeholder="Type medicine name..."
                        className="bg-transparent border-0 focus:ring-0 text-sm"
                      />
                    </div>
                    {errors.medicineName && (
                      <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                        <AlertCircle className="w-4 h-4" />{" "}
                        {errors.medicineName}
                      </p>
                    )}
                    {showSuggestions && recommendedMedicines.length > 0 && (
                      <motion.ul
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="absolute z-50 w-full bg-card border border-primary rounded-lg shadow-lg mt-1 max-h-48 overflow-y-auto"
                      >
                        {recommendedMedicines.map((med) => (
                          <li
                            key={med.id}
                            onClick={() => handleMedicineSelect(med)}
                            className="px-3 py-2 hover:bg-input cursor-pointer text-sm flex flex-col"
                          >
                            <span className="font-medium text-accent">
                              {med.medicine_name}
                              {med.brand_name && ` (${med.brand_name})`}
                            </span>
                            {med.dosage_form && (
                              <span className="text-xs text-muted">
                                {med.dosage_form}
                              </span>
                            )}
                          </li>
                        ))}
                      </motion.ul>
                    )}
                  </div>

                  {/* Dosage */}
                  <div>
                    <label className="block text-sm font-medium text-primary mb-1">
                      Dosage *
                    </label>
                    <div className="flex items-center bg-input border border-primary rounded-full px-3 py-2">
                      <Droplet className="w-5 h-5 text-primary mr-2" />
                      <Input
                        value={dosage}
                        onChange={(e) => setDosage(e.target.value)}
                        placeholder="e.g. 5ml, 1 tablet"
                        className="bg-transparent border-0 focus:ring-0 text-sm"
                      />
                    </div>
                    {errors.dosage && (
                      <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                        <AlertCircle className="w-4 h-4" /> {errors.dosage}
                      </p>
                    )}
                  </div>

                  {/* Brand Name */}
                  <div>
                    <label className="block text-sm font-medium text-primary mb-1">
                      Brand Name (Optional)
                    </label>
                    <div className="flex items-center bg-input border border-primary rounded-full px-3 py-2">
                      <Pill className="w-5 h-5 text-primary mr-2" />
                      <Input
                        value={brandName}
                        onChange={(e) => setBrandName(e.target.value)}
                        placeholder="e.g. Calpol, Crocin"
                        className="bg-transparent border-0 focus:ring-0 text-sm"
                      />
                    </div>
                  </div>

                  {/* Start Date */}
                  <div>
                    <label className="block text-sm font-medium text-primary mb-1">
                      Start Date *
                    </label>
                    <div className="flex items-center bg-input border border-primary rounded-full px-3 py-2">
                      <Calendar className="w-5 h-5 text-primary mr-2" />
                      <Input
                        type="date"
                        value={startDate}
                        onChange={(e) => handleStartDateChange(e.target.value)}
                        className="bg-transparent border-0 focus:ring-0 text-sm"
                      />
                    </div>
                    {errors.startDate && (
                      <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                        <AlertCircle className="w-4 h-4" /> {errors.startDate}
                      </p>
                    )}
                  </div>

                  {/* Duration & End Date */}
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-sm font-medium text-primary mb-1">
                        Duration
                      </label>
                      <Input
                        value={durationDays}
                        onChange={(e) => handleDurationChange(e.target.value)}
                        placeholder="e.g. 7 days"
                        className="bg-input border border-primary rounded-full px-3 py-2 text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-primary mb-1">
                        End Date
                      </label>
                      <Input
                        type="date"
                        value={endDate}
                        onChange={(e) => handleEndDateChange(e.target.value)}
                        className="bg-input border border-primary rounded-full px-3 py-2 text-sm"
                      />
                    </div>
                  </div>

                  {/* Frequency */}
                  <div>
                    <label className="block text-sm font-medium text-primary mb-1">
                      Frequency *
                    </label>
                    <div className="flex items-center bg-input border border-primary rounded-full px-3 py-2">
                      <Clock className="w-5 h-5 text-primary mr-2" />
                      <select
                        value={frequency}
                        onChange={(e) => handleFrequencyChange(e.target.value)}
                        className="w-full bg-transparent border-0 focus:ring-0 text-sm"
                      >
                        <option value="">Select frequency</option>
                        <option value="1 time/day">1 time/day</option>
                        <option value="2 times/day">2 times/day</option>
                        <option value="3 times/day">3 times/day</option>
                        <option value="4 times/day">4 times/day</option>
                      </select>
                    </div>
                    {errors.frequency && (
                      <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                        <AlertCircle className="w-4 h-4" /> {errors.frequency}
                      </p>
                    )}
                  </div>

                  {/* Times */}
                  {times.map((time, i) => (
                    <div key={i}>
                      <label className="block text-sm font-medium text-primary mb-1">
                        Time {i + 1} *
                      </label>
                      <div className="flex items-center bg-input border border-primary rounded-full px-3 py-2">
                        <Clock className="w-5 h-5 text-primary mr-2" />
                        <Input
                          type="time"
                          value={time}
                          onChange={(e) => handleTimeChange(i, e.target.value)}
                          className="bg-transparent border-0 focus:ring-0 text-sm"
                        />
                      </div>
                    </div>
                  ))}
                  {errors.times && (
                    <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                      <AlertCircle className="w-4 h-4" /> {errors.times}
                    </p>
                  )}

                  {/* Instructions */}
                  <div>
                    <label className="block text-sm font-medium text-primary mb-1">
                      Instructions (Optional)
                    </label>
                    <textarea
                      value={instructions}
                      onChange={(e) => setInstructions(e.target.value)}
                      placeholder="e.g. Take with food, after meals..."
                      className="w-full bg-input border border-primary rounded-xl px-3 py-2 text-sm min-h-20 resize-none"
                    />
                  </div>

                  {/* Prescription */}
                  <div>
                    <label className="block text-sm font-medium text-primary mb-1">
                      Prescribed By
                    </label>
                    <select
                      value={selectedPrescriptionId}
                      onChange={(e) =>
                        setSelectedPrescriptionId(e.target.value)
                      }
                      className="w-full bg-input border border-primary rounded-full px-3 py-2 text-sm"
                    >
                      <option value="">
                        {isDoctor ? `Dr. ${user?.name}` : user?.name} (Self)
                      </option>
                      {prescriptions.map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.doctorName} ({p.title})
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Buttons */}
                  <div className="flex gap-3 pt-4">
                    <Button
                      type="button"
                      onClick={closeForm}
                      variant="outline"
                      className="flex-1 rounded-full border-primary text-primary hover:bg-input text-sm font-medium"
                    >
                      Cancel
                    </Button>
                    <Button
                      type="submit"
                      disabled={loading}
                      className="flex-1 button-primary rounded-full text-sm font-medium hover:shadow-lg transition-all disabled:opacity-70"
                    >
                      {loading
                        ? "Saving..."
                        : editMode
                        ? "Update Medicine"
                        : "Save Medicine"}
                    </Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          )}
        </AnimatePresence>

        {/* Records List */}
        {records.length > 0 && (
          <motion.div
            className="mt-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <h3 className="text-lg font-semibold text-accent mb-4">
              Current Medicines
            </h3>

            <div className="grid gap-4 sm:grid-cols-2">
              {records.map((rec) => (
                <motion.div key={rec.id} whileHover={{ scale: 1.02 }} layout>
                  <Card className="p-4 glass-card border border-primary shadow-soft hover:shadow-lg transition">
                    {/* Header */}
                    <div className="flex justify-between items-start mb-3">
                      <h4 className="font-bold text-primary flex items-center gap-2">
                        <Pill className="w-5 h-5" />

                        {/* Medicine Name */}
                        {rec.medicineName}

                        {/* Brand Name */}
                        {rec.brandName && (
                          <span className="text-xs text-muted">
                            ({rec.brandName})
                          </span>
                        )}
                      </h4>

                      <span className="text-xs px-2 py-1 bg-primary/10 text-primary rounded-full">
                        {rec.frequency}
                      </span>
                    </div>

                    {/* Details */}
                    <div className="text-sm text-muted space-y-1">
                      <p>
                        <strong>Dosage:</strong> {rec.dosage}
                      </p>

                      <p>
                        <strong>Times:</strong>{" "}
                        {(rec.times || []).map(formatTimeTo12Hour).join(", ")}
                      </p>

                      <p>
                        <strong>Start:</strong> {formatDate(rec.startDate)}
                      </p>

                      <p>
                        <strong>End:</strong> {formatDate(rec.endDate)}
                      </p>

                      <p>
                        <strong>Duration:</strong>{" "}
                        {rec.durationDays || "Ongoing"}
                      </p>

                      {rec.instructions && (
                        <p>
                          <strong>Note:</strong> {rec.instructions}
                        </p>
                      )}

                      <p>
                        <strong>Doctor:</strong>{" "}
                        {rec.prescription?.doctorName || "Self"}
                      </p>

                      {rec.prescription?.title && (
                        <p>
                          <strong>Specialty:</strong> {rec.prescription.title}
                        </p>
                      )}
                    </div>

                    {/* Actions */}
                    {!isReadOnly && (
                      <div className="flex gap-2 mt-4">
                        <Button
                          onClick={() => handleEdit(rec)}
                          size="sm"
                          className="flex-1 button-primary rounded-full text-xs"
                        >
                          <Pencil className="w-4 h-4 mr-1" /> Edit
                        </Button>

                        <Button
                          onClick={() => handleDelete(rec.id)}
                          size="sm"
                          variant="destructive"
                          className="flex-1 rounded-full border-primary text-primary hover:bg-input text-sm font-medium"
                        >
                          <Trash2 className="w-4 h-4 mr-1" /> Delete
                        </Button>
                      </div>
                    )}
                  </Card>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
      </div>
    </motion.div>
  );
};

export default Medicines;
