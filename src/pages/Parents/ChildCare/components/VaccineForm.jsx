import React, { useCallback, useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { Plus, Trash2 } from "lucide-react";
import { addPredefinedVaccine } from "@/api/Parents/immunizations";

const VaccineForm = ({ state, setState, fetchVaccines }) => {
  const [isSmallScreen, setIsSmallScreen] = useState(false);

  useEffect(() => {
    const checkDevice = () => {
      setIsSmallScreen(window.innerHeight < 600);
    };
    checkDevice();
    window.addEventListener("resize", checkDevice);
    return () => window.removeEventListener("resize", checkDevice);
  }, []);

  const handleVaccineSubmit = useCallback(
    async (e) => {
      e.preventDefault();
      const { newVaccine } = state;
      if (!newVaccine?.name || newVaccine?.ageRanges.some((ar) => ar.value === 0 || !ar.unit)) {
        toast.error("⚠️ Please fill all required fields with valid values.", { className: "toast" });
        return;
      }

      const data = {
        name: newVaccine.name,
        doses: newVaccine.ageRanges.map(({ dose, value, unit }) => ({
          dose,
          age: value === 0 ? "birth" : `${value} ${unit}`,
        })),
      };

      try {
        await addPredefinedVaccine(data);
        await fetchVaccines();
        setState((prev) => ({
          ...prev,
          newVaccine: { name: "", totalDoses: 1, ageRanges: [{ dose: 1, value: 0, unit: "days" }] },
          showVaccineForm: false,
        }));
        toast.success("✅ Vaccine added successfully", { className: "toast" });
      } catch (error) {
        toast.error("❌ Failed to add vaccine.", { className: "toast" });
      }
    },
    [state.newVaccine, fetchVaccines, setState]
  );

  const addAgeRangeField = useCallback(() => {
    setState((prev) => {
      const { newVaccine } = prev;
      if (!newVaccine || newVaccine.ageRanges.length >= newVaccine.totalDoses) return prev;
      return {
        ...prev,
        newVaccine: {
          ...newVaccine,
          ageRanges: [
            ...newVaccine.ageRanges,
            { dose: newVaccine.ageRanges.length + 1, value: 0, unit: "days" },
          ],
        },
      };
    });
  }, []);

  const removeAgeRangeField = useCallback((index) => {
    setState((prev) => {
      const { newVaccine } = prev;
      if (!newVaccine || newVaccine.ageRanges.length <= 1) return prev;
      const updatedAgeRanges = newVaccine.ageRanges
        .filter((_, i) => i !== index)
        .map((ar, i) => ({ ...ar, dose: i + 1 }));
      return {
        ...prev,
        newVaccine: { ...newVaccine, ageRanges: updatedAgeRanges },
      };
    });
  }, []);

  const updateAgeRange = useCallback((index, updatedRange) => {
    setState((prev) => {
      const { newVaccine } = prev;
      if (!newVaccine) return prev;
      const updatedAgeRanges = [...newVaccine.ageRanges];
      updatedAgeRanges[index] = updatedRange;
      return { ...prev, newVaccine: { ...newVaccine, ageRanges: updatedAgeRanges } };
    });
  }, []);

  return (
    <Dialog open={state.showVaccineForm} onOpenChange={(open) => setState((prev) => ({ ...prev, showVaccineForm: open }))}>
      <DialogContent className={`w-[95vw] max-w-md p-2 sm:p-3 glass-card border border-primary shadow-soft ${isSmallScreen ? "max-h-[80vh]" : "max-h-[90vh]"} overflow-y-auto`}>
        <DialogHeader className="mb-2">
          <DialogTitle className={`text-text font-bold ${isSmallScreen ? "text-base" : "text-lg"}`}>
            ➕ Add New Vaccine
          </DialogTitle>
          <DialogDescription className={`text-muted ${isSmallScreen ? "text-xs" : "text-sm"}`}>
            Fill out the fields below to add a new vaccine.
          </DialogDescription>
        </DialogHeader>
        <motion.form
          onSubmit={handleVaccineSubmit}
          className="space-y-2"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <div>
            <label className={`text-xs font-medium text-primary ${isSmallScreen ? "text-xs" : ""}`}>
              Vaccine Name
            </label>
            <div className={`flex items-center rounded-lg px-1.5 sm:px-2 mt-1 bg-input border border-primary w-full ${isSmallScreen ? "p-1" : ""}`}>
              <Input
                type="text"
                value={state.newVaccine?.name || ""}
                onChange={(e) =>
                  setState((prev) => ({
                    ...prev,
                    newVaccine: { ...prev.newVaccine, name: e.target.value },
                  }))
                }
                className={`flex-1 bg-transparent p-0 text-xs sm:text-sm border-none text-text focus:ring-0 ${isSmallScreen ? "text-xs" : ""}`}
                placeholder="Enter vaccine name"
              />
            </div>
          </div>
          <div>
            <label className={`text-xs font-medium text-primary ${isSmallScreen ? "text-xs" : ""}`}>
              Total Doses
            </label>
            <div className={`flex items-center rounded-lg px-1.5 sm:px-2 mt-1 bg-input border border-primary w-full ${isSmallScreen ? "p-1" : ""}`}>
              <Input
                type="number"
                min="1"
                value={state.newVaccine?.totalDoses || 1}
                onChange={(e) => {
                  const totalDoses = parseInt(e.target.value) || 1;
                  setState((prev) => ({
                    ...prev,
                    newVaccine: {
                      ...prev.newVaccine,
                      totalDoses,
                      ageRanges: prev.newVaccine?.ageRanges
                        .slice(0, totalDoses)
                        .map((ar, i) => ({
                          dose: i + 1,
                          value: ar.value || 0,
                          unit: ar.unit || "days",
                        })) || [{ dose: 1, value: 0, unit: "days" }],
                    },
                  }));
                }}
                className={`flex-1 bg-transparent p-0 text-xs sm:text-sm border-none text-text focus:ring-0 ${isSmallScreen ? "text-xs" : ""}`}
              />
            </div>
          </div>
          <div>
            <label className={`text-xs font-medium text-primary ${isSmallScreen ? "text-xs" : ""}`}>
              Age Ranges
            </label>
            <div className="space-y-2">
              {(state.newVaccine?.ageRanges || []).map((ageRange, index) => (
                <motion.div
                  key={index}
                  className="flex items-center space-x-2"
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <span className={`text-xs sm:text-sm w-16 text-text ${isSmallScreen ? "text-xs" : ""}`}>Dose {ageRange.dose}:</span>
                  <Input
                    type="number"
                    min="0"
                    value={ageRange.value}
                    onChange={(e) =>
                      updateAgeRange(index, {
                        ...ageRange,
                        value: parseInt(e.target.value) || 0,
                      })
                    }
                    className={`w-20 bg-input border border-primary rounded-lg px-1.5 py-0.5 text-xs sm:text-sm text-text ${isSmallScreen ? "text-xs" : ""}`}
                    placeholder="e.g., 6"
                  />
                  <select
                    value={ageRange.unit}
                    onChange={(e) =>
                      updateAgeRange(index, { ...ageRange, unit: e.target.value })
                    }
                    className={`bg-input border border-primary rounded-lg px-1.5 py-0.5 text-xs sm:text-sm text-text ${isSmallScreen ? "text-xs" : ""}`}
                  >
                    <option value="days">Days</option>
                    <option value="weeks">Weeks</option>
                    <option value="months">Months</option>
                    <option value="years">Years</option>
                  </select>
                  {state.newVaccine?.ageRanges.length > 1 && (
                    <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => removeAgeRangeField(index)}
                        className={`p-2 rounded-full button-secondary text-text border-none shadow-soft hover:shadow-lg ${isSmallScreen ? "p-1.5" : ""}`}
                      >
                        <Trash2 className={`w-4 h-4 ${isSmallScreen ? "w-3 h-3" : ""}`} />
                      </Button>
                    </motion.div>
                  )}
                </motion.div>
              ))}
              {state.newVaccine?.ageRanges.length < state.newVaccine?.totalDoses && (
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Button
                    variant="outline"
                    className={`border-primary text-primary hover:bg-input text-xs sm:text-sm shadow-soft ${isSmallScreen ? "py-1.5" : ""}`}
                    onClick={addAgeRangeField}
                  >
                    <Plus className={`w-4 h-4 mr-1 ${isSmallScreen ? "w-3 h-3" : ""}`} /> Add Dose
                  </Button>
                </motion.div>
              )}
            </div>
          </div>
          <DialogFooter className={`mt-3 flex flex-col sm:flex-row gap-2 ${isSmallScreen ? "mt-2" : ""}`}>
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button
                type="submit"
                onClick={handleVaccineSubmit}
                className={`button-primary text-text text-xs sm:text-sm shadow-soft hover:shadow-lg transition-all ${isSmallScreen ? "py-1.5" : ""}`}
              >
                Save Vaccine
              </Button>
            </motion.div>
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button
                variant="outline"
                onClick={() => setState((prev) => ({ ...prev, showVaccineForm: false }))}
                className={`border-primary text-primary hover:bg-input text-xs sm:text-sm shadow-soft ${isSmallScreen ? "py-1.5" : ""}`}
              >
                Cancel
              </Button>
            </motion.div>
          </DialogFooter>
        </motion.form>
      </DialogContent>
    </Dialog>
  );
};

export default VaccineForm;