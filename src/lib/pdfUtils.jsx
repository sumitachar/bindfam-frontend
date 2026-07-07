import React from 'react';
import PrescriptionPDFDocument from '@/pages/Parents/ChildCare/components/PrescriptionPDFDocument.jsx';
import { pdf } from '@react-pdf/renderer';

/**
 * Generate PDF blob and URL for a prescription
 * @param {Object} prescription
 * @returns {Promise<{blob: Blob, url: string, filename: string}>}
 */
export const generatePrescriptionPDF = async (prescription) => {
  try {
    // Create PDF blob
    const blob = await pdf(
      <PrescriptionPDFDocument prescription={prescription} />
    ).toBlob();

    // Create object URL
    const pdfUrl = URL.createObjectURL(blob);

    // Filename based on doctor name and date
    const filename = `Prescription_${prescription.doctorName}_${new Date(
      prescription.createdAt
    )
      .toISOString()
      .split('T')[0]}.pdf`;

    return {
      blob,
      url: pdfUrl,
      filename,
    };
  } catch (error) {
    console.error('Error generating PDF:', error);
    throw new Error('Failed to generate PDF');
  }
};

/**
 * Download PDF
 * @param {Blob} blob
 * @param {string} filename
 */
export const downloadPDF = (blob, filename) => {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

/**
 * Open PDF in a new tab
 * @param {Blob} blob
 */
export const openPDFInNewTab = (blob) => {
  const url = URL.createObjectURL(blob);
  window.open(url, '_blank');

  // Revoke the object URL after a short delay
  setTimeout(() => URL.revokeObjectURL(url), 1000);
};
