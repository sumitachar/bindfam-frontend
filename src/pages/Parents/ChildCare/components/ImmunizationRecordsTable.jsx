import React, { useState, useEffect, useContext } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Pencil, Trash2, Calendar, Syringe, ChevronDown, ChevronUp, Lock } from "lucide-react";
import { UserContext } from "@/context/UserContext";

const ImmunizationRecordsTable = ({ records, onEdit, onDelete, isLoading }) => {
  const [expandedRow, setExpandedRow] = useState(null);
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

  if (isLoading) {
    return (
      <motion.div
        className="glass-card rounded-xl shadow-soft border border-primary p-3 text-center"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
      >
        <p className={`text-muted ${isSmallScreen ? "text-xs" : "text-sm"}`}>Loading records...</p>
      </motion.div>
    );
  }

  if (records.length === 0) {
    return (
      <motion.div
        className="glass-card rounded-xl shadow-soft border border-primary p-3 text-center"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
      >
        <p className={`text-muted ${isSmallScreen ? "text-xs" : "text-sm"}`}>No immunization records found.</p>
      </motion.div>
    );
  }

  return (
    <motion.div
      className="glass-card rounded-xl shadow-soft border border-primary"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      {/* VIEW-ONLY BANNER */}
      {isReadOnly && (
        <div className="bg-amber-50 border border-amber-300 text-amber-800 px-3 py-2 rounded-t-xl text-center text-xs font-medium flex items-center justify-center gap-1.5">
          <Lock className="w-4 h-4" />
          <span>View Only — Editing is disabled</span>
        </div>
      )}

      {/* Desktop / Tablet: Table */}
      <div className="hidden md:block overflow-x-auto">
        <table className="min-w-full text-xs sm:text-sm divide-y divide-primary/20">
          <thead>
            <tr className="bg-card text-primary text-center border border-primary/20">
              <th className={`px-1.5 sm:px-4 py-2 text-left font-semibold uppercase tracking-wider ${isSmallScreen ? "text-xs" : ""}`}>
                Vaccine
              </th>
              <th className={`px-1.5 sm:px-4 py-2 text-center font-semibold uppercase tracking-wider ${isSmallScreen ? "text-xs" : ""}`}>
                Dose
              </th>
              <th className={`px-1.5 sm:px-4 py-2 text-center font-semibold uppercase tracking-wider ${isSmallScreen ? "text-xs" : ""}`}>
                Date
              </th>
              <th className={`px-1.5 sm:px-4 py-2 text-center font-semibold uppercase tracking-wider ${isSmallScreen ? "text-xs" : ""}`}>
                Recommended Age
              </th>
              <th className={`px-1.5 sm:px-4 py-2 text-center font-semibold uppercase tracking-wider ${isSmallScreen ? "text-xs" : ""}`}>
                Recommended Date
              </th>
              <th className={`px-1.5 sm:px-4 py-2 text-center font-semibold uppercase tracking-wider ${isSmallScreen ? "text-xs" : ""}`}>
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-primary/20">
            {records
              .sort((a, b) => new Date(b.date) - new Date(a.date))
              .map((record) => (
                <React.Fragment key={record.id}>
                  <motion.tr
                    className="hover:bg-input cursor-pointer"
                    onClick={() =>
                      setExpandedRow(expandedRow === record.id ? null : record.id)
                    }
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.2 }}
                  >
                    <td className={`px-1.5 sm:px-4 py-2 flex items-center space-x-2 text-sm font-medium text-text ${isSmallScreen ? "text-xs" : ""}`}>
                      <Syringe className={`text-primary ${isSmallScreen ? "w-4 h-4" : "w-5 h-5"}`} />
                      <span>{record.vaccineName}</span>
                    </td>
                    <td className="px-1.5 sm:px-4 py-2 text-center">
                      <span className={`px-2 py-1 bg-primary/10 text-primary text-xs font-medium rounded-full ${isSmallScreen ? "text-xs" : ""}`}>
                        {record.doseNumber}
                      </span>
                    </td>
                    <td className={`px-1.5 sm:px-4 py-2 text-center text-muted ${isSmallScreen ? "text-xs" : ""}`}>
                      {record.date}
                    </td>
                    <td className={`px-1.5 sm:px-4 py-2 text-center text-muted ${isSmallScreen ? "text-xs" : ""}`}>
                      {record.recommendedAge || "N/A"}
                    </td>
                    <td className={`px-1.5 sm:px-4 py-2 text-center text-muted ${isSmallScreen ? "text-xs" : ""}`}>
                      {record.recommendedDate || "N/A"}
                    </td>
                    <td className="px-1.5 sm:px-4 py-2 text-center">
                      <div className="flex justify-center space-x-2">
                        {/* Edit Button */}
                        {onEdit && !isReadOnly && (
                          <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation();
                                onEdit(record);
                              }}
                              className={`p-2 rounded-full bg-primary/10 text-primary border-none shadow-soft ${isSmallScreen ? "p-1.5" : ""}`}
                            >
                              <Pencil className={`w-4 h-4 ${isSmallScreen ? "w-3 h-3" : ""}`} />
                            </Button>
                          </motion.div>
                        )}

                        {/* Delete Button */}
                        {onDelete && !isReadOnly && (
                          <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation();
                                onDelete(record.id);
                              }}
                              className={`p-2 rounded-full button-secondary text-text border-none shadow-soft hover:shadow-lg ${isSmallScreen ? "p-1.5" : ""}`}
                            >
                              <Trash2 className={`w-4 h-4 ${isSmallScreen ? "w-3 h-3" : ""}`} />
                            </Button>
                          </motion.div>
                        )}

                        {/* Expand Button */}
                        <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              setExpandedRow(expandedRow === record.id ? null : record.id);
                            }}
                            className={`p-2 rounded-full bg-primary/10 text-primary border-none shadow-soft ${isSmallScreen ? "p-1.5" : ""}`}
                          >
                            {expandedRow === record.id ? (
                              <ChevronUp className={`w-4 h-4 ${isSmallScreen ? "w-3 h-3" : ""}`} />
                            ) : (
                              <ChevronDown className={`w-4 h-4 ${isSmallScreen ? "w-3 h-3" : ""}`} />
                            )}
                          </Button>
                        </motion.div>
                      </div>
                    </td>
                  </motion.tr>
                  <AnimatePresence>
                    {expandedRow === record.id && (
                      <motion.tr
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3 }}
                        className="bg-card"
                      >
                        <td colSpan="6" className={`px-1.5 sm:px-4 py-2 text-xs sm:text-sm text-muted ${isSmallScreen ? "text-xs" : ""}`}>
                          <div className="space-y-2">
                            {record.notes && (
                              <p>
                                <span className="font-semibold text-text">Notes: </span>
                                {record.notes}
                              </p>
                            )}
                            {record.submittedAge && (
                              <p>
                                <span className="font-semibold text-text">Submitted Age: </span>
                                {record.submittedAge}
                              </p>
                            )}
                          </div>
                        </td>
                      </motion.tr>
                    )}
                  </AnimatePresence>
                </React.Fragment>
              ))}
          </tbody>
        </table>
      </div>

      {/* Mobile: Card layout */}
      <div className="block md:hidden divide-y divide-primary/20">
        {records.map((record) => (
          <motion.div
            key={record.id}
            className="p-3 bg-card hover:bg-input transition-colors"
            onClick={() =>
              setExpandedRow(expandedRow === record.id ? null : record.id)
            }
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.2 }}
          >
            <div className="flex justify-between items-start">
              <div className="flex items-center space-x-2">
                <Syringe className={`text-primary ${isSmallScreen ? "w-4 h-4" : "w-5 h-5"}`} />
                <span className={`font-semibold text-text ${isSmallScreen ? "text-xs" : "text-sm"}`}>{record.vaccineName}</span>
              </div>
              <span className={`px-2 py-1 bg-primary/10 text-primary text-xs font-medium rounded-full ${isSmallScreen ? "text-xs" : ""}`}>
                Dose {record.doseNumber}
              </span>
            </div>
            <div className={`grid grid-cols-2 gap-2 mt-2 text-xs text-muted ${isSmallScreen ? "text-xs" : ""}`}>
              <div className="flex items-center space-x-1">
                <Calendar className={`text-primary ${isSmallScreen ? "w-4 h-4" : "w-5 h-5"}`} />
                <span>{record.date}</span>
              </div>
              <div>
                <span className="font-medium text-text">Rec Age:</span>{" "}
                {record.recommendedAge || "N/A"}
              </div>
              <div>
                <span className="font-medium text-text">Rec Date:</span>{" "}
                {record.recommendedDate || "N/A"}
              </div>
              {record.submittedAge && (
                <div>
                  <span className="font-medium text-text">Submitted Age:</span>{" "}
                  {record.submittedAge}
                </div>
              )}
            </div>
            <AnimatePresence>
              {expandedRow === record.id && record.notes && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.3 }}
                  className={`mt-2 text-xs sm:text-sm text-muted ${isSmallScreen ? "text-xs" : ""}`}
                >
                  <span className="font-semibold text-text">Notes:</span> {record.notes}
                </motion.div>
              )}
            </AnimatePresence>
            <div className="flex justify-end space-x-2 mt-2">
              {/* Edit Button */}
              {onEdit && !isReadOnly && (
                <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      onEdit(record);
                    }}
                    className={`p-2 rounded-full bg-primary/10 text-primary border-none shadow-soft ${isSmallScreen ? "p-1.5" : ""}`}
                  >
                    <Pencil className={`w-4 h-4 ${isSmallScreen ? "w-3 h-3" : ""}`} />
                  </Button>
                </motion.div>
              )}
              {/* Delete Button */}
              {onDelete && !isReadOnly && (
                <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      onDelete(record.id);
                    }}
                    className={`p-2 rounded-full button-secondary text-text border-none shadow-soft hover:shadow-lg ${isSmallScreen ? "p-1.5" : ""}`}
                  >
                    <Trash2 className={`w-4 h-4 ${isSmallScreen ? "w-3 h-3" : ""}`} />
                  </Button>
                </motion.div>
              )}
            </div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
};

export default ImmunizationRecordsTable;