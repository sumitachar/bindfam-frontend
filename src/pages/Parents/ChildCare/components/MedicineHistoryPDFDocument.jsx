import React from "react";
import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  Font,
} from "@react-pdf/renderer";

// Register professional fonts
Font.register({
  family: "Helvetica",
  fonts: [
    { src: "https://fonts.gstatic.com/s/helvetica/v15/Helvetica.ttf" },
    { src: "https://fonts.gstatic.com/s/helvetica/v15/Helvetica-Bold.ttf", fontWeight: "bold" },
  ],
});

const styles = StyleSheet.create({
  page: {
    paddingTop: 40,
    paddingBottom: 80,
    paddingHorizontal: 40,
    fontFamily: "Helvetica",
    fontSize: 9,
    backgroundColor: "#FFFFFF",
  },
  header: {
    marginBottom: 15,
    borderBottomWidth: 2,
    borderBottomColor: "#7c3aed",
    paddingBottom: 10,
  },
  titleContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  reportTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#7c3aed",
    letterSpacing: 0.5,
  },
  childInfoGrid: {
    flexDirection: "row",
    marginTop: 10,
    padding: 10,
    backgroundColor: "#f9fafb",
    borderRadius: 6,
    borderWidth: 1,
    borderColor: "#f3f4f6",
  },
  infoColumn: { flex: 1 },
  infoLabel: {
    color: "#6b7280",
    fontSize: 6,
    fontWeight: "bold",
    textTransform: "uppercase",
    marginBottom: 2,
  },
  infoValue: { fontSize: 9, fontWeight: "bold", color: "#111827" },

  // Summary Badges
  summaryContainer: {
    flexDirection: "row",
    gap: 10,
    marginTop: 10,
  },
  summaryBadge: {
    padding: "4 8",
    borderRadius: 4,
    borderWidth: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },

  // Table Styles
  tableHeader: {
    flexDirection: "row",
    backgroundColor: "#111827",
    padding: 8,
    borderTopLeftRadius: 4,
    borderTopRightRadius: 4,
    marginTop: 15,
  },
  headerText: {
    color: "#FFFFFF",
    fontSize: 7,
    fontWeight: "bold",
    textTransform: "uppercase",
  },
  tableRow: {
    flexDirection: "row",
    padding: "8 10",
    borderBottomWidth: 1,
    borderBottomColor: "#f3f4f6",
    alignItems: "flex-start",
  },
  
  // Column Widths
  colMed: { width: "35%" },
  colDosage: { width: "25%" },
  colSchedule: { width: "20%" },
  colStatus: { width: "20%" },

  medTitle: { fontWeight: "bold", color: "#1f2937", fontSize: 9 },
  brandTitle: { fontSize: 7, color: "#7c3aed", fontStyle: "italic" },
  
  // Status Labels
  statusLabel: {
    fontSize: 6,
    fontWeight: "bold",
    padding: "2 5",
    borderRadius: 3,
    textAlign: "center",
    width: 50,
    marginBottom: 4,
  },

  footer: {
    position: "absolute",
    bottom: 30,
    left: 40,
    right: 40,
    textAlign: "center",
    borderTopWidth: 1,
    borderTopColor: "#e5e7eb",
    paddingTop: 10,
  },
  footerText: { color: "#9ca3af", fontSize: 7, marginBottom: 2 },
});

const MedicineHistoryPDFDocument = ({ subUser, medicines = [] }) => {
  const today = new Date();

  // Helper: Format Date
  const formatDate = (dateString) => {
    if (!dateString) return "Ongoing";
    const date = new Date(dateString);
    return isNaN(date.getTime()) ? "N/A" : date.toLocaleDateString("en-GB");
  };

  // Helper: Format Time
  const formatTime = (timeString) => {
    if (!timeString) return "";
    const [hours, minutes] = timeString.split(":");
    const hour = parseInt(hours);
    const period = hour >= 12 ? "PM" : "AM";
    const adjustedHour = hour % 12 || 12;
    return `${adjustedHour}:${minutes}${period}`;
  };

  // Count Running vs Completed
  const runningCount = medicines.filter(m => !m.endDate || new Date(m.endDate) >= today).length;
  const completedCount = medicines.length - runningCount;

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header Section */}
        <View style={styles.header}>
          <View style={styles.titleContainer}>
            <Text style={styles.reportTitle}>Medicine History</Text>
            <Text style={{ fontSize: 8, color: "#6b7280" }}>ID: {subUser?.subUserId}</Text>
          </View>

          <View style={styles.childInfoGrid}>
            <View style={styles.infoColumn}>
              <Text style={styles.infoLabel}>Patient</Text>
              <Text style={styles.infoValue}>{subUser?.name}</Text>
            </View>
            <View style={styles.infoColumn}>
              <Text style={styles.infoLabel}>DOB</Text>
              <Text style={styles.infoValue}>{formatDate(subUser?.dateOfBirth)}</Text>
            </View>
            <View style={styles.infoColumn}>
              <Text style={styles.infoLabel}>Gender</Text>
              <Text style={styles.infoValue}>{subUser?.gender || "N/A"}</Text>
            </View>
          </View>

          {/* Top Summary Badges */}
          <View style={styles.summaryContainer}>
            <View style={[styles.summaryBadge, { backgroundColor: "#ecfdf5", borderColor: "#10b981" }]}>
              <Text style={{ color: "#065f46", fontSize: 7, fontWeight: "bold" }}>RUNNING: {runningCount}</Text>
            </View>
            <View style={[styles.summaryBadge, { backgroundColor: "#fef2f2", borderColor: "#ef4444" }]}>
              <Text style={{ color: "#991b1b", fontSize: 7, fontWeight: "bold" }}>COMPLETED: {completedCount}</Text>
            </View>
          </View>
        </View>

        {/* Table Header */}
        <View style={styles.tableHeader} fixed>
          <Text style={[styles.colMed, styles.headerText]}>Medicine & Brand</Text>
          <Text style={[styles.colDosage, styles.headerText]}>Dosage / Instr.</Text>
          <Text style={[styles.colSchedule, styles.headerText]}>Timings</Text>
          <Text style={[styles.colStatus, styles.headerText]}>Status & Period</Text>
        </View>

        {/* Medicine Rows */}
        {medicines.map((med, index) => {
          const isRunning = !med.endDate || new Date(med.endDate) >= today;
          
          return (
            <View key={index} style={styles.tableRow} wrap={false}>
              <View style={styles.colMed}>
                <Text style={styles.medTitle}>{med.medicineName}</Text>
                {med.brandName && <Text style={styles.brandTitle}>{med.brandName}</Text>}
                <Text style={{ fontSize: 7, color: "#9ca3af", marginTop: 2 }}>
                  Dr. {med.prescription?.doctorName || "Self"}
                </Text>
              </View>

              <View style={styles.colDosage}>
                <Text style={{ fontWeight: "bold" }}>{med.dosage}</Text>
                <Text style={{ fontSize: 7, color: "#6b7280" }}>{med.instructions || "Take as directed"}</Text>
              </View>

              <View style={styles.colSchedule}>
                <Text style={{ fontSize: 8 }}>{med.frequency}</Text>
                <View style={{ marginTop: 2 }}>
                  {med.times?.map((t, i) => (
                    <Text key={i} style={{ fontSize: 7, color: "#4b5563" }}>• {formatTime(t)}</Text>
                  ))}
                </View>
              </View>

              <View style={styles.colStatus}>
                {/* Status Badge */}
                <Text style={[
                  styles.statusLabel,
                  { 
                    backgroundColor: isRunning ? "#d1fae5" : "#fee2e2", 
                    color: isRunning ? "#065f46" : "#b91c1c" 
                  }
                ]}>
                  {isRunning ? "RUNNING" : "COMPLETED"}
                </Text>
                
                <Text style={{ fontSize: 7, color: "#374151" }}>S: {formatDate(med.startDate)}</Text>
                <Text style={{ fontSize: 7, color: "#374151" }}>E: {formatDate(med.endDate)}</Text>
                {med.durationDays && (
                  <Text style={{ fontSize: 6, color: "#7c3aed", marginTop: 2 }}>
                    Duration: {med.durationDays} Days
                  </Text>
                )}
              </View>
            </View>
          );
        })}

        {/* Footer */}
        <View style={styles.footer} fixed>
          <Text style={styles.footerText}>
            This is an electronically generated medicine history report for {subUser?.name}.
          </Text>
          <Text style={[styles.footerText, { fontWeight: "bold" }]}>
            Generated on {new Date().toLocaleDateString('en-GB')} • BindFam Health
          </Text>
        </View>
      </Page>
    </Document>
  );
};

export default MedicineHistoryPDFDocument;