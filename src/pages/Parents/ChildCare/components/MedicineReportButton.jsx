// src/pages/Parents/components/MedicineReportButton.jsx
import React, { useState } from "react";
import { pdf } from "@react-pdf/renderer";
import { Button } from "@/components/ui/button";
import MedicineHistoryPDFDocument from "./MedicineHistoryPDFDocument";
import PDFPreviewDialog from "../../Dashboard/components/PDFPreviewDialog";

const MedicineReportButton = ({ subUser, medicines = [], isSmallScreen }) => {
  const [previewUrl, setPreviewUrl] = useState(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);

  const handleGeneratePDF = async () => {
    if (!subUser || medicines.length === 0) {
      alert("No medicine data available for report.");
      return;
    }

    setIsGenerating(true);
    try {
      const blob = await pdf(
        <MedicineHistoryPDFDocument subUser={subUser} medicines={medicines} />
      ).toBlob();

      const url = URL.createObjectURL(blob);
      setPreviewUrl(url);
      setDialogOpen(true);
    } catch (error) {
      console.error("PDF generation failed:", error);
      alert("Failed to generate report.");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDownload = (filePath, fileName) => {
    const link = document.createElement("a");
    link.href = filePath;
    link.download = fileName || "Medicine_History_Report.pdf";
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
        {isGenerating ? "Generating..." : "Medicine History Report"}
      </Button>

      <PDFPreviewDialog
        isOpen={dialogOpen}
        onOpenChange={setDialogOpen}
        previewUrl={previewUrl}
        filePath={previewUrl}
        fileName={`${subUser?.name || "Child"}_Medicine_History_${new Date()
          .toISOString()
          .slice(0, 10)}.pdf`}
        onDownload={handleDownload}
        isSmallScreen={isSmallScreen}
      />
    </>
  );
};

export default MedicineReportButton;