import React, { useCallback, useMemo, useEffect, useState, useContext } from "react";
import { motion } from "framer-motion";
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
import { Syringe, Hash, Calendar, FileText, Lock } from "lucide-react";
import { calculateCurrentAge, calculateDueDate } from "@/lib/utils";
import { addImmunization, updateImmunization } from "@/api/Parents/immunizations";
import { UserContext } from "@/context/UserContext";

const ImmunizationForm = ({ state, setState, dateOfBirth, subUserId, fetchRecords }) => {
  const [isSmallScreen, setIsSmallScreen] = useState(false);
  const { isReadOnly } = useContext(UserContext);

  useEffect(() => {
    const checkDevice = () => {
      setIsSmallScreen(window.innerHeight < 600);
    };
    checkDevice();
    window.addEventListener("resize", checkDevice);
    return () => window.removeEventListener("resize", checkDevice);
  }, []);

  const { recommendedAge, recommendedDueDate, submittedAge } = useMemo(
    () => ({
      recommendedAge: state.selectedAgeGroup || "Not specified",
      recommendedDueDate: state.selectedAgeGroup
        ? calculateDueDate(state.selectedAgeGroup, dateOfBirth)
        : "Not specified",
      submittedAge: calculateCurrentAge(dateOfBirth, state.date),
    }),
    [state.selectedAgeGroup, state.date, dateOfBirth]
  );

  const handleSubmit = useCallback(
    async (e) => {
      e.preventDefault();

      if (isReadOnly) {
        toast.info("View Only — Editing is disabled", { className: "toast" });
        return;
      }

      if (!state.selectedVaccine || !state.doseNumber || !state.date || !state.selectedAgeGroup) {
        toast.error("Please fill all required fields.", { className: "toast" });
        return;
      }

      const data = {
        subUserId,
        vaccineName: state.selectedVaccine,
        doseNumber: parseInt(state.doseNumber, 10),
        date: state.date,
        notes: state.notes,
        recommendedAge: recommendedAge,
        recommendedDate: recommendedDueDate,
        submittedAge: submittedAge,
      };

      try {
        if (state.editRecordId) {
          await updateImmunization(state.editRecordId, data);
          toast.success("Record updated successfully", { className: "toast" });
        } else {
          await addImmunization(data);
          toast.success("Record saved successfully", { className: "toast" });
        }

        setState((prev) => ({
          ...prev,
          showForm: false,
          editRecordId: null,
          selectedVaccine: "",
          doseNumber: "",
          selectedAgeGroup: "",
          date: new Date().toISOString().split("T")[0],
          notes: "",
        }));

        await fetchRecords();
      } catch (error) {
        console.error("Error saving immunization:", error);
        toast.error("Failed to save record.", { className: "toast" });
      }
    },
    [state, setState, subUserId, recommendedAge, recommendedDueDate, submittedAge, fetchRecords, isReadOnly]
  );

  // If read-only, do not show form
  if (isReadOnly && state.showForm) {
    return null;
  }

  return (
    <Dialog open={state.showForm} onOpenChange={(open) => !isReadOnly && setState((prev) => ({ ...prev, showForm: open }))}>
      <DialogContent
        className={`w-[95vw] max-w-md p-2 sm:p-3 glass-card border border-primary shadow-soft ${isSmallScreen ? "max-h-[80vh]" : "max-h-[90vh]"} overflow-y-auto`}
      >
        <DialogHeader className="mb-2">
          <DialogTitle className={`text-text font-bold ${isSmallScreen ? "text-base" : "text-lg"}`}>
            {state.editRecordId ? "Edit Immunization Record" : "Add Immunization Record"}
          </DialogTitle>
          <DialogDescription className={`text-muted ${isSmallScreen ? "text-xs" : "text-sm"}`}>
            {state.editRecordId
              ? "Update the immunization record by editing the fields below."
              : "Fill out the fields below to add a new immunization record."}
          </DialogDescription>
        </DialogHeader>

        {/* VIEW-ONLY BANNER */}
        {isReadOnly && (
          <div className="bg-amber-50 border border-amber-300 text-amber-800 px-3 py-2 rounded-lg text-center text-xs font-medium flex items-center justify-center gap-1.5 mb-2">
            <Lock className="w-4 h-4" />
            <span>View Only — Form is disabled</span>
          </div>
        )}

        <motion.form
          onSubmit={handleSubmit}
          className="space-y-2"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          {/* Vaccine Name */}
          <div>
            <label className={`text-xs font-medium text-primary ${isSmallScreen ? "text-xs" : ""}`}>
              Vaccine Name
            </label>
            <div className={`flex items-center rounded-lg px-1.5 sm:px-2 mt-1 bg-input border border-primary w-full ${isSmallScreen ? "p-1" : ""}`}>
              <Syringe className={`text-primary mr-1 ${isSmallScreen ? "w-4 h-4" : "w-5 h-5"}`} />
              <Input
                type="text"
                value={state.selectedVaccine}
                disabled
                className={`flex-1 bg-transparent p-0 text-xs sm:text-sm border-none text-text focus:ring-0 ${isSmallScreen ? "text-xs" : ""}`}
              />
            </div>
          </div>

          {/* Dose Number */}
          <div>
            <label className={`text-xs font-medium text-primary ${isSmallScreen ? "text-xs" : ""}`}>
              Dose Number
            </label>
            <div className={`flex items-center rounded-lg px-1.5 sm:px-2 mt-1 bg-input border border-primary w-full ${isSmallScreen ? "p-1" : ""}`}>
              <Hash className={`text-primary mr-1 ${isSmallScreen ? "w-4 h-4" : "w-5 h-5"}`} />
              <Input
                type="number"
                value={state.doseNumber}
                disabled
                className={`flex-1 bg-transparent p-0 text-xs sm:text-sm border-none text-text focus:ring-0 ${isSmallScreen ? "text-xs" : ""}`}
              />
            </div>
          </div>

          {/* Recommended Age */}
          <div>
            <label className={`text-xs font-medium text-primary ${isSmallScreen ? "text-xs" : ""}`}>
              Recommended Age
            </label>
            <div className={`flex items-center rounded-lg px-1.5 sm:px-2 mt-1 bg-input border border-primary w-full ${isSmallScreen ? "p-1" : ""}`}>
              <FileText className={`text-primary mr-1 ${isSmallScreen ? "w-4 h-4" : "w-5 h-5"}`} />
              <Input
                type="text"
                value={recommendedAge}
                disabled
                className={`flex-1 bg-transparent p-0 text-xs sm:text-sm border-none text-text focus:ring-0 ${isSmallScreen ? "text-xs" : ""}`}
              />
            </div>
          </div>

          {/* Recommended Due Date */}
          <div>
            <label className={`text-xs font-medium text-primary ${isSmallScreen ? "text-xs" : ""}`}>
              Recommended Due Date
            </label>
            <div className={`flex items-center rounded-lg px-1.5 sm:px-2 mt-1 bg-input border border-primary w-full ${isSmallScreen ? "p-1" : ""}`}>
              <Calendar className={`text-primary mr-1 ${isSmallScreen ? "w-4 h-4" : "w-5 h-5"}`} />
              <Input
                type="text"
                value={recommendedDueDate}
                disabled
                className={`flex-1 bg-transparent p-0 text-xs sm:text-sm border-none text-text focus:ring-0 ${isSmallScreen ? "text-xs" : ""}`}
              />
            </div>
          </div>

          {/* Submitted Age */}
          <div>
            <label className={`text-xs font-medium text-primary ${isSmallScreen ? "text-xs" : ""}`}>
              Submitted Age
            </label>
            <div className={`flex items-center rounded-lg px-1.5 sm:px-2 mt-1 bg-input border border-primary w-full ${isSmallScreen ? "p-1" : ""}`}>
              <FileText className={`text-primary mr-1 ${isSmallScreen ? "w-4 h-4" : "w-5 h-5"}`} />
              <Input
                type="text"
                value={submittedAge}
                disabled
                className={`flex-1 bg-transparent p-0 text-xs sm:text-sm border-none text-text focus:ring-0 ${isSmallScreen ? "text-xs" : ""}`}
              />
            </div>
          </div>

          {/* Date */}
          <div>
            <label className={`text-xs font-medium text-primary ${isSmallScreen ? "text-xs" : ""}`}>
              Date
            </label>
            <div className={`flex items-center rounded-lg px-1.5 sm:px-2 mt-1 bg-input border border-primary w-full ${isSmallScreen ? "p-1" : ""}`}>
              <Calendar className={`text-primary mr-1 ${isSmallScreen ? "w-4 h-4" : "w-5 h-5"}`} />
              <Input
                type="date"
                value={state.date}
                onChange={(e) => !isReadOnly && setState((prev) => ({ ...prev, date: e.target.value }))}
                disabled={isReadOnly}
                className={`flex-1 bg-transparent p-0 text-xs sm:text-sm border-none text-text focus:ring-0 ${isSmallScreen ? "text-xs" : ""}`}
                required
              />
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className={`text-xs font-medium text-primary ${isSmallScreen ? "text-xs" : ""}`}>
              Notes
            </label>
            <div className={`flex rounded-lg px-1.5 sm:px-2 mt-1 bg-input border border-primary w-full ${isSmallScreen ? "p-1" : ""}`}>
              <FileText className={`text-primary mr-1 mt-1 ${isSmallScreen ? "w-4 h-4" : "w-5 h-5"}`} />
              <textarea
                placeholder="Enter notes (optional)"
                value={state.notes}
                onChange={(e) => !isReadOnly && setState((prev) => ({ ...prev, notes: e.target.value }))}
                disabled={isReadOnly}
                className={`flex-1 bg-transparent p-0 text-xs sm:text-sm border-none text-text focus:ring-0 resize-none ${isSmallScreen ? "min-h-[48px]" : "min-h-[60px]"}`}
              />
            </div>
          </div>

          {/* Footer Buttons — HIDDEN IN READ-ONLY */}
          {!isReadOnly && (
            <DialogFooter className={`mt-3 flex flex-col sm:flex-row gap-2 ${isSmallScreen ? "mt-2" : ""}`}>
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button
                  type="submit"
                  className={`button-primary text-text text-xs sm:text-sm shadow-soft hover:shadow-lg transition-all ${isSmallScreen ? "py-1.5" : ""}`}
                >
                  {state.editRecordId ? "Update" : "Save"}
                </Button>
              </motion.div>
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button
                  variant="outline"
                  onClick={() =>
                    setState((prev) => ({
                      ...prev,
                      showForm: false,
                      editRecordId: null,
                      selectedVaccine: "",
                      doseNumber: "",
                      selectedAgeGroup: "",
                      date: new Date().toISOString().split("T")[0],
                      notes: "",
                    }))
                  }
                  className={`border-primary text-primary hover:bg-input text-xs sm:text-sm shadow-soft ${isSmallScreen ? "py-1.5" : ""}`}
                >
                  Cancel
                </Button>
              </motion.div>
            </DialogFooter>
          )}
        </motion.form>
      </DialogContent>
    </Dialog>
  );
};

export default ImmunizationForm;