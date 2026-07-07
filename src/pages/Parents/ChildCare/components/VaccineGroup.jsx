import React, { useState, useMemo, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { CheckCircle, AlertCircle, Circle, ChevronDown } from "lucide-react";
import { calculateDueDate, getVaccineStatus } from "@/lib/utils";

const VaccineGroup = React.memo(({ age, vaccines, records, onSelect, dateOfBirth }) => {
  const [expanded, setExpanded] = useState(false);
  const [isSmallScreen, setIsSmallScreen] = useState(false);

  useEffect(() => {
    const checkDevice = () => {
      setIsSmallScreen(window.innerHeight < 600);
    };
    checkDevice();
    window.addEventListener("resize", checkDevice);
    return () => window.removeEventListener("resize", checkDevice);
  }, []);

  if (!age || !Array.isArray(vaccines) || vaccines.length === 0) return null;

  const statusCounts = useMemo(
    () =>
      vaccines.reduce(
        (acc, vaccine) => {
          acc[getVaccineStatus(vaccine, records, dateOfBirth)] += 1;
          return acc;
        },
        { taken: 0, pending: 0, overdue: 0 }
      ),
    [vaccines, records, dateOfBirth]
  );

  const totalVaccines = vaccines.length;
  const completionPercentage = Math.round((statusCounts.taken / totalVaccines) * 100);

  return (
    <motion.div
      className="mb-3 glass-card rounded-xl shadow-soft border border-primary"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div
        className={`px-3 py-2 bg-card flex items-center justify-between cursor-pointer ${isSmallScreen ? "px-2 py-1.5" : ""}`}
        onClick={() => setExpanded(!expanded)}
      >
        <div className="flex items-center">
          <div className={`w-8 h-8 flex items-center justify-center bg-input rounded-full mr-2 ${isSmallScreen ? "w-7 h-7" : ""}`}>
            <span className={`text-primary font-bold ${isSmallScreen ? "text-xs" : "text-sm"}`}>{age.split(" ")[0]}</span>
          </div>
          <div>
            <h3 className={`font-semibold text-text ${isSmallScreen ? "text-sm" : "text-base"}`}>{age}</h3>
            <p className={`text-xs text-muted ${isSmallScreen ? "text-xs" : ""}`}>
              {totalVaccines} vaccine{totalVaccines !== 1 ? "s" : ""}
            </p>
          </div>
        </div>
        <div className="flex items-center">
          <div className={`w-14 h-2 bg-primary/20 rounded-full overflow-hidden mr-2 ${isSmallScreen ? "w-12" : ""}`}>
            <motion.div
              className="h-full bg-primary"
              initial={{ width: 0 }}
              animate={{ width: `${completionPercentage}%` }}
              transition={{ duration: 0.5 }}
            />
          </div>
          <div className="text-right">
            <span className={`text-xs font-medium text-text ${isSmallScreen ? "text-xs" : ""}`}>
              {statusCounts.taken}/{totalVaccines}
            </span>
            <div className="flex items-center justify-end space-x-1 mt-1">
              {statusCounts.overdue > 0 && (
                <span className="inline-block w-2 h-2 rounded-full bg-accent" />
              )}
              {statusCounts.pending > 0 && (
                <span className="inline-block w-2 h-2 rounded-full bg-yellow-500" />
              )}
              {statusCounts.taken > 0 && (
                <span className="inline-block w-2 h-2 rounded-full bg-primary" />
              )}
            </div>
          </div>
          <ChevronDown
            className={`ml-2 w-5 h-5 transform transition-transform text-primary ${expanded ? "rotate-180" : ""} ${isSmallScreen ? "w-4 h-4" : ""}`}
          />
        </div>
      </div>
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="border-t border-primary/20 p-2"
          >
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
              {vaccines.map((vaccine, i) => {
                const status = getVaccineStatus(vaccine, records, dateOfBirth);
                return (
                  <motion.div
                    key={i}
                    className={`p-2 rounded-lg border ${
                      status === "taken"
                        ? "bg-card border-primary/20"
                        : status === "overdue"
                        ? "bg-accent/10 border-accent/20"
                        : "bg-card border-primary/20"
                    }`}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.2, delay: i * 0.1 }}
                  >
                    <div className="flex justify-between items-start mb-2">
                      <h4 className={`font-medium text-text ${isSmallScreen ? "text-sm" : "text-base"}`}>{vaccine.vaccine}</h4>
                      <div
                        className={`rounded-full p-1 ${
                          status === "taken"
                            ? "bg-primary/10 text-primary"
                            : status === "overdue"
                            ? "bg-accent/10 text-accent"
                            : "bg-secondary/10 text-secondary"
                        }`}
                      >
                        {status === "taken" ? (
                          <CheckCircle size={isSmallScreen ? 12 : 14} />
                        ) : status === "overdue" ? (
                          <AlertCircle size={isSmallScreen ? 12 : 14} />
                        ) : (
                          <Circle size={isSmallScreen ? 12 : 14} />
                        )}
                      </div>
                    </div>
                    <div className={`text-xs text-muted mb-2 ${isSmallScreen ? "text-xs" : ""}`}>
                      Dose {vaccine.dose}/{vaccine.totalDoses}
                      {vaccine.doseNo && ` (${vaccine.doseNo})`}
                    </div>
                    <div className={`text-xs text-muted mb-2 ${isSmallScreen ? "text-xs" : ""}`}>
                      Due: {calculateDueDate(vaccine.age, dateOfBirth)}
                    </div>
                    {status !== "taken" && (
                      <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                        <Button
                          className={`w-full text-xs button-primary text-text py-1 rounded shadow-soft hover:shadow-lg ${isSmallScreen ? "text-xs py-0.5" : ""}`}
                          onClick={() => onSelect(vaccine.vaccine, vaccine.dose, vaccine.age)}
                        >
                          {status === "overdue" ? "Mark as Given" : "Select"}
                        </Button>
                      </motion.div>
                    )}
                  </motion.div>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
});

export default VaccineGroup;