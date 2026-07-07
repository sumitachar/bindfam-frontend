// src/components/PDF/PrescriptionPDFDocument.jsx
import React from "react";
import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  Font,
} from "@react-pdf/renderer";

// Register Helvetica for professional look
Font.register({
  family: "Helvetica",
  fonts: [
    { src: "https://fonts.gstatic.com/s/helvetica/v15/Helvetica.ttf" },
    {
      src: "https://fonts.gstatic.com/s/helvetica/v15/Helvetica-Bold.ttf",
      fontWeight: "bold",
    },
  ],
});

const styles = StyleSheet.create({
  page: {
    padding: 40,
    paddingBottom: 60,
    fontFamily: "Helvetica",
    fontSize: 10,
    backgroundColor: "#ffffff",
  },
  header: {
    textAlign: "center",
    marginBottom: 25,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#6b21a8", // Deep purple
    marginBottom: 12,
  },
  subtitle: {
    fontSize: 11,
    color: "#4b5563",
    marginBottom: 4,
  },
  headerUnderline: {
    height: 4,
    backgroundColor: "#a78bfa",
    marginTop: 12,
    borderRadius: 2,
  },

  // Patient Summary Box
  patientBox: {
    backgroundColor: "#f3e8ff",
    padding: 16,
    borderRadius: 12,
    marginVertical: 20,
    borderWidth: 1,
    borderColor: "#ddd6fe",
  },
  patientRow: {
    flexDirection: "row",
    justifyContent: "space-around",
  },
  patientItem: {
    alignItems: "center",
  },
  patientLabel: {
    fontSize: 10,
    color: "#6b7280",
    marginBottom: 4,
  },
  patientValue: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#7c3aed",
  },

  sectionTitle: {
    fontSize: 15,
    fontWeight: "bold",
    color: "#581c87",
    backgroundColor: "#ede9fe",
    padding: 10,
    borderRadius: 8,
    marginTop: 25,
    marginBottom: 12,
  },

  medicineCard: {
    borderWidth: 1,
    borderColor: "#e5e7eb",
    borderRadius: 10,
    padding: 14,
    marginBottom: 12,
    backgroundColor: "#fdfbff",
  },
  medicineHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  medicineName: {
    fontSize: 13,
    fontWeight: "bold",
    color: "#581c87",
  },
  brandName: {
    fontSize: 10,
    color: "#7c3aed",
    fontStyle: "italic",
  },
  detailRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 6,
  },
  detailCol: {
    width: "48%",
  },
  detailLabel: {
    fontSize: 10,
    fontWeight: "bold",
    color: "#374151",
    marginBottom: 2,
  },
  detailValue: {
    fontSize: 10,
    color: "#1f2937",
  },
  timesContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginTop: 6,
  },
  timeBadge: {
    backgroundColor: "#7c3aed",
    color: "#ffffff",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
    fontSize: 9,
  },

  notesSection: {
    marginTop: 20,
    padding: 14,
    backgroundColor: "#f5f3ff",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#c4b5fd",
  },
  notesTitle: {
    fontSize: 13,
    fontWeight: "bold",
    color: "#581c87",
    marginBottom: 8,
  },
  notesText: {
    fontSize: 11,
    color: "#374151",
    lineHeight: 1.6,
  },

  footer: {
    position: "absolute",
    bottom: 30,
    left: 0,
    right: 0,
    textAlign: "center",
    fontSize: 9,
    color: "#6b7280",
  },
  footerLine: {
    height: 1,
    backgroundColor: "#e5e7eb",
    marginBottom: 8,
  },
});

const PrescriptionPDFDocument = ({ prescription }) => {
  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return isNaN(date.getTime())
      ? "N/A"
      : date.toLocaleDateString("en-GB", {
          day: "numeric",
          month: "long",
          year: "numeric",
        });
  };

  const formatTime = (timeString) => {
    if (!timeString) return "";
    const [hours, minutes] = timeString.split(":");
    const hour = parseInt(hours);
    const period = hour >= 12 ? "PM" : "AM";
    const adjustedHour = hour % 12 || 12;
    return `${adjustedHour}:${minutes} ${period}`;
  };

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Medical Prescription</Text>
          <Text style={styles.subtitle}>Dr. {prescription?.doctorName || "N/A"}</Text>
          <Text style={styles.subtitle}>{prescription?.title || "General Physician"}</Text>
          <Text style={styles.subtitle}>
            Issued on: {formatDate(prescription?.createdAt)}
          </Text>
          <View style={styles.headerUnderline} />
        </View>

        {/* Patient Summary */}
        <View style={styles.patientBox}>
          <View style={styles.patientRow}>
            <View style={styles.patientItem}>
              <Text style={styles.patientLabel}>Patient Name</Text>
              <Text style={styles.patientValue}>
                {prescription?.subUser?.name || "N/A"}
              </Text>
            </View>
            <View style={styles.patientItem}>
              <Text style={styles.patientLabel}>Age</Text>
              <Text style={styles.patientValue}>
                {prescription?.subUser?.age || "N/A"}
              </Text>
            </View>
            <View style={styles.patientItem}>
              <Text style={styles.patientLabel}>Gender</Text>
              <Text style={styles.patientValue}>
                {prescription?.subUser?.gender || "N/A"}
              </Text>
            </View>
            <View style={styles.patientItem}>
              <Text style={styles.patientLabel}>Date of Birth</Text>
              <Text style={styles.patientValue}>
                {formatDate(prescription?.subUser?.dateOfBirth)}
              </Text>
            </View>
          </View>
        </View>

        {/* Prescribed Medications */}
        <Text style={styles.sectionTitle}>Prescribed Medications</Text>

        {prescription?.medicines?.length > 0 ? (
          prescription.medicines.map((med, index) => (
            <View key={index} style={styles.medicineCard}>
              <View style={styles.medicineHeader}>
                <View>
                  <Text style={styles.medicineName}>
                    {index + 1}. {med.medicineName || "Unnamed Medicine"}
                  </Text>
                  {med.brandName && (
                    <Text style={styles.brandName}>({med.brandName})</Text>
                  )}
                </View>
              </View>

              <View style={styles.detailRow}>
                <View style={styles.detailCol}>
                  <Text style={styles.detailLabel}>Dosage</Text>
                  <Text style={styles.detailValue}>{med.dosage || "Not specified"}</Text>
                </View>
                <View style={styles.detailCol}>
                  <Text style={styles.detailLabel}>Frequency</Text>
                  <Text style={styles.detailValue}>{med.frequency || "Not specified"}</Text>
                </View>
              </View>

              <View style={styles.detailRow}>
                <View style={styles.detailCol}>
                  <Text style={styles.detailLabel}>Duration</Text>
                  <Text style={styles.detailValue}>
                    {med.durationDays || "Ongoing"}
                  </Text>
                </View>
                <View style={styles.detailCol}>
                  <Text style={styles.detailLabel}>Instructions</Text>
                  <Text style={styles.detailValue}>
                    {med.instructions || "Take as directed"}
                  </Text>
                </View>
              </View>

              <View style={styles.detailRow}>
                <View style={styles.detailCol}>
                  <Text style={styles.detailLabel}>Start Date</Text>
                  <Text style={styles.detailValue}>{formatDate(med.startDate)}</Text>
                </View>
                <View style={styles.detailCol}>
                  <Text style={styles.detailLabel}>End Date</Text>
                  <Text style={styles.detailValue}>{formatDate(med.endDate)}</Text>
                </View>
              </View>

              {med.times && med.times.length > 0 && (
                <View style={{ marginTop: 8 }}>
                  <Text style={styles.detailLabel}>Timings</Text>
                  <View style={styles.timesContainer}>
                    {med.times.map((time, i) => (
                      <Text key={i} style={styles.timeBadge}>
                        {formatTime(time)}
                      </Text>
                    ))}
                  </View>
                </View>
              )}
            </View>
          ))
        ) : (
          <Text style={{ fontSize: 11, color: "#6b7280", textAlign: "center", marginVertical: 20 }}>
            No medications prescribed in this record.
          </Text>
        )}

        {/* Additional Notes */}
        {prescription?.notes && (
          <View style={styles.notesSection}>
            <Text style={styles.notesTitle}>Additional Notes</Text>
            <Text style={styles.notesText}>{prescription.notes}</Text>
          </View>
        )}

        {/* Footer */}
        <View style={styles.footer} fixed>
          <View style={styles.footerLine} />
          <Text>
            Medical Prescription • Generated on {new Date().toLocaleString("en-GB")}
          </Text>
          <Text>
            This is a computer-generated document. Please consult your doctor for any medical advice.
          </Text>
        </View>
      </Page>
    </Document>
  );
};

export default PrescriptionPDFDocument;