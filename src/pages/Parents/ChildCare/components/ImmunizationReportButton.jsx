// src/pages/Parents/components/ImmunizationReportButton.jsx
import React, { useState } from "react";
import { pdf } from "@react-pdf/renderer";
import { Button } from "@/components/ui/button";
import PDFPreviewDialog from "../../Dashboard/components/PDFPreviewDialog";
import ImmunizationPDFDocument from "./ImmunizationPDFDocument";

const ImmunizationReportButton = ({
  subUser,
  records,
  vaccineSchedule = [], // ← New prop: the full predefined vaccine list grouped by age
  isSmallScreen,
}) => {
  const [previewUrl, setPreviewUrl] = useState(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);

  const handleGeneratePDF = async () => {
    if (!subUser || !records || vaccineSchedule.length === 0) {
      alert("Missing data required for report generation.");
      return;
    }

    setIsGenerating(true);
    try {
      const blob = await pdf(
        <ImmunizationPDFDocument
          subUser={subUser}
          records={records}
          vaccineSchedule={vaccineSchedule} 
        />
      ).toBlob();

      const url = URL.createObjectURL(blob);
      setPreviewUrl(url);
      setDialogOpen(true);
    } catch (error) {
      console.error("PDF generation failed:", error);
      alert("Failed to generate PDF report. Please try again.");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDownload = (filePath, fileName) => {
    const link = document.createElement("a");
    link.href = filePath;
    link.download = fileName || "Immunization_Report.pdf";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <>
      <Button
        onClick={handleGeneratePDF}
        disabled={isGenerating}
        className={`button-primary text-accent font-medium rounded-xl shadow-soft hover:shadow-lg transition-all ${
          isSmallScreen ? "text-xs py-1.5 px-3" : "text-sm py-2 px-4"
        }`}
      >
        {isGenerating ? "Generating..." : "Preview Report"}
      </Button>

      <PDFPreviewDialog
        isOpen={dialogOpen}
        onOpenChange={setDialogOpen}
        previewUrl={previewUrl}
        filePath={previewUrl}
        fileName={`${subUser?.name || "Child"}_Immunization_Report_${new Date()
          .toISOString()
          .slice(0, 10)}.pdf`}
        onDownload={handleDownload}
        isSmallScreen={isSmallScreen}
      />
    </>
  );
};

export default ImmunizationReportButton;