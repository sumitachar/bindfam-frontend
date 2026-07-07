import React, { useMemo, useEffect, useState } from "react";
import { motion } from "framer-motion";
import { isBefore, format } from "date-fns";
import { calculateDueDate, getVaccineStatus } from "@/lib/utils";

const VaccineTimeline = ({ vaccineList, records, dateOfBirth }) => {
  const [isSmallScreen, setIsSmallScreen] = useState(false);

  useEffect(() => {
    const checkDevice = () => {
      setIsSmallScreen(window.innerHeight < 600);
    };
    checkDevice();
    window.addEventListener("resize", checkDevice);
    return () => window.removeEventListener("resize", checkDevice);
  }, []);

  const sortedVaccines = useMemo(() => {
    const allVaccines = vaccineList.flatMap((group) =>
      group.vaccines.map((vaccine) => ({
        ...vaccine,
        ageGroup: group.age,
        dueDate: calculateDueDate(group.age, dateOfBirth),
        status: getVaccineStatus(vaccine, records, dateOfBirth),
      }))
    );
    return allVaccines.sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate));
  }, [vaccineList, records, dateOfBirth]);

  if (!sortedVaccines.length) return null;

  return (
    <motion.div
      className="mt-4 glass-card rounded-xl shadow-soft p-3 border border-primary"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <h3 className={`font-semibold text-text ${isSmallScreen ? "text-base" : "text-lg"} mb-3`}>
        Vaccine Timeline
      </h3>
      <div className="relative">
        <div className={`absolute left-3 top-0 bottom-0 w-0.5 bg-primary/20 ${isSmallScreen ? "left-2" : ""}`} />
        <div className={`space-y-4 pl-8 ${isSmallScreen ? "pl-6" : ""}`}>
          {sortedVaccines.map((vaccine, i) => {
            const dueDate = new Date(vaccine.dueDate);
            const isPast = isBefore(dueDate, new Date());
            return (
              <motion.div
                key={i}
                className="relative flex items-start"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.2, delay: i * 0.1 }}
              >
                <div
                  className={`absolute -left-5 mt-1 rounded-full border-2 ${
                    vaccine.status === "taken"
                      ? "bg-primary/10 border-primary"
                      : vaccine.status === "overdue"
                      ? "bg-accent/10 border-accent"
                      : isPast
                      ? "bg-accent/10 border-accent"
                      : "bg-secondary/10 border-secondary"
                  } ${isSmallScreen ? "w-2 h-2 -left-4" : "w-2.5 h-2.5"}`}
                />
                <div className={`flex-1 bg-card p-2 rounded-lg ${isSmallScreen ? "p-1.5" : ""}`}>
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className={`font-medium text-text ${isSmallScreen ? "text-xs" : "text-sm"}`}>{vaccine.vaccine}</h4>
                      <p className={`text-xs text-muted ${isSmallScreen ? "text-xs" : ""}`}>
                        Dose {vaccine.dose}/{vaccine.totalDoses} • {vaccine.ageGroup}
                      </p>
                    </div>
                    <span
                      className={`text-xs rounded ${
                        vaccine.status === "taken"
                          ? "bg-primary/10 text-primary"
                          : vaccine.status === "overdue"
                          ? "bg-accent/10 text-accent"
                          : "bg-secondary/10 text-secondary"
                      } ${isSmallScreen ? "px-1.5 py-0.5 text-xs" : "px-2 py-1"}`}
                    >
                      {vaccine.status === "taken"
                        ? "Completed"
                        : vaccine.status === "overdue"
                        ? "Overdue"
                        : format(dueDate, "MMM dd, yyyy")}
                    </span>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </motion.div>
  );
};

export default VaccineTimeline;