import React, { useContext } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Eye, Download, Pencil, Trash2, FileText, Calendar, Lock } from "lucide-react";
import { motion } from "framer-motion";
import { UserContext } from "@/context/UserContext";

const PrescriptionCard = ({
  rec,
  handleEdit,
  handleDelete,
  handleViewPreview,
  handleDownload,
  isSmallScreen,
}) => {
  const { isReadOnly } = useContext(UserContext);

  const hasUploadedFile = !!rec.blobName;
  const hasManualMedicines = rec.medicines && rec.medicines.length > 0;

  return (
    <motion.div
      className="mb-3"
      whileHover={!isReadOnly ? { y: -4, boxShadow: "var(--shadow-soft)" } : {}}
      transition={{ duration: 0.3 }}
    >
      <Card className={`rounded-xl border border-primary glass-card overflow-hidden shadow-soft hover:shadow-lg transition ${isSmallScreen ? "p-2" : "p-3"}`}>
        {/* VIEW-ONLY BANNER */}
        {isReadOnly && (
          <div className="bg-amber-50 border-b border-amber-300 text-amber-800 px-3 py-1.5 text-center text-xs font-medium flex items-center justify-center gap-1">
            <Lock className="w-3.5 h-3.5" />
            <span>View Only</span>
          </div>
        )}

        <div className={`p-2 sm:p-3 ${isSmallScreen ? "p-1.5" : ""}`}>
          {/* Header: Title & Doctor */}
          <div className="flex items-center justify-between mb-2">
            <div>
              <h3 className={`font-semibold text-text truncate ${isSmallScreen ? "text-sm" : "text-base"}`}>
                {rec.title}
              </h3>
              <p className={`text-xs text-muted flex items-center gap-1 ${isSmallScreen ? "text-xs" : ""}`}>
                Doctor: {rec.doctorName}
              </p>
              {hasManualMedicines && (
                <p className={`text-xs text-accent flex items-center gap-1 mt-1 ${isSmallScreen ? "text-xs" : ""}`}>
                  {rec.medicines.length} medicine{rec.medicines.length > 1 ? 's' : ''} prescribed
                </p>
              )}
            </div>

            {/* Action Icons */}
            <div className="flex space-x-2">
              {/* View */}
              <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                <Button
                  variant="outline"
                  className={`p-2 rounded-full bg-primary/10 text-primary hover:bg-primary hover:text-text border-none shadow-soft ${isSmallScreen ? "p-1.5" : ""}`}
                  onClick={() => handleViewPreview(rec)}
                  title="View Prescription"
                >
                  <Eye className={`w-4 h-4 ${isSmallScreen ? "w-3 h-3" : ""}`} />
                </Button>
              </motion.div>

              {/* Download */}
              <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                <Button
                  variant="outline"
                  className={`p-2 rounded-full bg-accent/10 text-accent hover:bg-accent hover:text-text border-none shadow-soft ${isSmallScreen ? "p-1.5" : ""}`}
                  onClick={() => handleDownload(rec)}
                  title="Download Prescription"
                >
                  <Download className={`w-4 h-4 ${isSmallScreen ? "w-3 h-3" : ""}`} />
                </Button>
              </motion.div>

              {/* Edit */}
              {handleEdit && !isReadOnly && (
                <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                  <Button
                    variant="outline"
                    className={`p-2 rounded-full bg-primary/10 text-primary hover:bg-primary hover:text-text border-none shadow-soft ${isSmallScreen ? "p-1.5" : ""}`}
                    onClick={() => handleEdit(rec)}
                    title="Edit Prescription"
                  >
                    <Pencil className={`w-4 h-4 ${isSmallScreen ? "w-3 h-3" : ""}`} />
                  </Button>
                </motion.div>
              )}

              {/* Delete */}
              {handleDelete && !isReadOnly && (
                <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                  <Button
                    variant="outline"
                    className={`p-2 rounded-full button-secondary text-text hover:shadow-lg border-none shadow-soft ${isSmallScreen ? "p-1.5" : ""}`}
                    onClick={() => handleDelete(rec.id)}
                    title="Delete Prescription"
                  >
                    <Trash2 className={`w-4 h-4 ${isSmallScreen ? "w-3 h-3" : ""}`} />
                  </Button>
                </motion.div>
              )}
            </div>
          </div>

          {/* Medicine Details (if manual entry) */}
          {hasManualMedicines && !hasUploadedFile && (
            <div className={`mb-2 p-2 bg-primary/10 rounded-lg border border-primary/20 ${isSmallScreen ? "p-1.5" : ""}`}>
              <h4 className={`text-xs font-semibold text-primary mb-2 ${isSmallScreen ? "text-xs" : ""}`}>
                Prescribed Medicines:
              </h4>
              <div className="space-y-1">
                {rec.medicines.slice(0, 2).map((medicine, index) => (
                  <div key={index} className={`text-xs text-muted ${isSmallScreen ? "text-xs" : ""}`}>
                    <span className="font-medium">{medicine.medicineName}</span>
                    {medicine.dosage && <span> • {medicine.dosage}</span>}
                    {medicine.frequency && <span> • {medicine.frequency}</span>}
                    {medicine.durationDays && <span> • {medicine.durationDays}</span>}
                  </div>
                ))}
                {rec.medicines.length > 2 && (
                  <div className={`text-xs text-primary font-medium ${isSmallScreen ? "text-xs" : ""}`}>
                    +{rec.medicines.length - 2} more medicine{rec.medicines.length - 2 > 1 ? 's' : ''}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Prescription Preview */}
          <div className="relative group rounded-xl overflow-hidden border border-primary">
            {hasUploadedFile ? (
              <div
                className={`flex flex-col items-center justify-center bg-input py-6 sm:py-8 cursor-pointer ${isSmallScreen ? "py-4" : ""}`}
                onClick={() => handleViewPreview(rec)}
              >
                {rec.mimeType?.includes("pdf") ? (
                  <>
                    <FileText className={`text-red-500 ${isSmallScreen ? "w-10 h-10" : "w-14 h-14"}`} />
                    <span className={`mt-2 text-sm font-medium text-muted ${isSmallScreen ? "text-xs" : ""}`}>
                      PDF Document
                    </span>
                  </>
                ) : (
                  <>
                    <FileText className={`text-primary ${isSmallScreen ? "w-10 h-10" : "w-14 h-14"}`} />
                    <span className={`mt-2 text-sm font-medium text-primary ${isSmallScreen ? "text-xs" : ""}`}>
                      Uploaded Prescription
                    </span>
                  </>
                )}
                <span className={`text-xs text-muted mt-1 ${isSmallScreen ? "text-xs" : ""}`}>
                  Click to view
                </span>
              </div>
            ) : (
              <div
                className={`flex flex-col items-center justify-center bg-gradient py-6 sm:py-8 border-2 border-dashed border-primary cursor-pointer ${isSmallScreen ? "py-4" : ""}`}
                onClick={() => handleViewPreview(rec)}
              >
                <FileText className={`text-primary mb-2 ${isSmallScreen ? "w-7 h-7" : "w-10 h-10"}`} />
                <span className={`mt-1 text-xs sm:text-sm text-primary font-medium text-center ${isSmallScreen ? "text-xs" : ""}`}>
                  Generated Prescription
                </span>
                <span className={`text-xs text-muted mt-1 text-center ${isSmallScreen ? "text-xs" : ""}`}>
                  Click to view/download PDF
                </span>
                {hasManualMedicines && (
                  <div className={`mt-2 px-3 py-1 bg-primary/10 rounded-full ${isSmallScreen ? "px-2 py-0.5" : ""}`}>
                    <span className={`text-xs text-primary font-medium ${isSmallScreen ? "text-xs" : ""}`}>
                      {rec.medicines.length} medicine{rec.medicines.length > 1 ? 's' : ''}
                    </span>
                  </div>
                )}
              </div>
            )}

            {/* Overlay with quick actions */}
            <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all duration-300 flex items-center justify-center opacity-0 group-hover:opacity-100">
              <div className="flex space-x-2">
                <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                  <Button
                    variant="outline"
                    className={`p-2 rounded-full bg-card text-primary hover:bg-primary hover:text-text border-none shadow-soft ${isSmallScreen ? "p-1.5" : ""}`}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleViewPreview(rec);
                    }}
                  >
                    <Eye className={`w-4 h-4 ${isSmallScreen ? "w-3 h-3" : ""}`} />
                  </Button>
                </motion.div>
                <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                  <Button
                    variant="outline"
                    className={`p-2 rounded-full bg-card text-accent hover:bg-accent hover:text-text border-none shadow-soft ${isSmallScreen ? "p-1.5" : ""}`}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDownload(rec);
                    }}
                  >
                    <Download className={`w-4 h-4 ${isSmallScreen ? "w-3 h-3" : ""}`} />
                  </Button>
                </motion.div>
              </div>
            </div>
          </div>

          {/* Additional Information */}
          <div className={`mt-2 flex flex-wrap gap-2 ${isSmallScreen ? "mt-1.5" : ""}`}>
            <div className={`text-xs text-muted ${isSmallScreen ? "text-xs" : ""}`}>
              <Calendar className={`w-3 h-3 inline mr-1 ${isSmallScreen ? "w-2.5 h-2.5" : ""}`} />
              {new Date(rec.createdAt).toLocaleDateString()}
            </div>
            {rec.notes && (
              <div className={`text-xs text-muted truncate flex-1 min-w-0 ${isSmallScreen ? "text-xs" : ""}`} title={rec.notes}>
                Notes: {rec.notes}
              </div>
            )}
          </div>
        </div>
      </Card>
    </motion.div>
  );
};

export default PrescriptionCard;