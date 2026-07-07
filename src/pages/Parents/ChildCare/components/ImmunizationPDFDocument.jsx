import React from "react";
import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  Font,
  Svg,
  Circle,
  Path,
} from "@react-pdf/renderer";

// Professional font registration
Font.register({
  family: "Helvetica",
  fonts: [
    { src: "https://fonts.gstatic.com/s/helvetica/v15/Helvetica.ttf" },
    { src: "https://fonts.gstatic.com/s/helvetica/v15/Helvetica-Bold.ttf", fontWeight: "bold" },
  ],
});

const StatusIcon = ({ status }) => {
  const color = status === "completed" ? "#059669" : "#dc2626";
  return (
    <Svg width="10" height="10" viewBox="0 0 24 24">
      <Circle cx="12" cy="12" r="11" fill={color} />
      {status === "completed" ? (
        <Path d="M9 12l2 2 4-4" stroke="#fff" strokeWidth="3" fill="none" />
      ) : (
        <Path d="M12 8v8M8 12h8" stroke="#fff" strokeWidth="3" transform="rotate(45 12 12)" />
      )}
    </Svg>
  );
};

const styles = StyleSheet.create({
  page: {
    paddingTop: 40,
    paddingBottom: 80, // High padding to prevent footer overlap
    paddingHorizontal: 40,
    fontFamily: "Helvetica",
    fontSize: 9,
    backgroundColor: "#FFFFFF",
  },
  header: {
    marginBottom: 20,
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
    fontSize: 22,
    fontWeight: "bold",
    color: "#7c3aed",
    letterSpacing: 0.5,
  },
  childInfoGrid: {
    flexDirection: "row",
    marginTop: 15,
    padding: 12,
    backgroundColor: "#f9fafb",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#f3f4f6",
  },
  infoColumn: {
    flex: 1,
  },
  infoLabel: {
    color: "#6b7280",
    fontSize: 7,
    fontWeight: "bold",
    textTransform: "uppercase",
    marginBottom: 2,
  },
  infoValue: {
    fontSize: 10,
    fontWeight: "bold",
    color: "#111827",
  },
  
  // Table Header
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

  // Milestone Group
  ageGroupHeader: {
    backgroundColor: "#f5f3ff",
    padding: "6 10",
    borderLeftWidth: 3,
    borderLeftColor: "#7c3aed",
    marginTop: 10,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  ageGroupText: {
    fontWeight: "bold",
    color: "#4c1d95",
    fontSize: 10,
  },

  tableRow: {
    flexDirection: "row",
    padding: "8 10",
    borderBottomWidth: 1,
    borderBottomColor: "#f3f4f6",
    alignItems: "center",
  },
  
  colVaccine: { width: "40%" },
  colDose: { width: "20%" },
  colTotal: { width: "15%", textAlign: "center" },
  colStatus: { width: "25%", flexDirection: "row", alignItems: "center", gap: 6 },
  
  statusText: { fontSize: 8, fontWeight: "bold" },

  // Footer styling to keep it at the very bottom
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
  footerText: {
    color: "#9ca3af",
    fontSize: 7,
    marginBottom: 2,
  }
});

const ImmunizationPDFDocument = ({ subUser, records = [], vaccineSchedule = [] }) => {
  
  const isDoseCompleted = (vaccineName, doseNumber) => {
    return records.some(rec => 
      rec.vaccineName.toLowerCase().trim() === vaccineName.toLowerCase().trim() && 
      parseInt(rec.doseNumber) === parseInt(doseNumber)
    );
  };

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header Section */}
        <View style={styles.header}>
          <View style={styles.titleContainer}>
            <Text style={styles.reportTitle}>Immunization Report</Text>
            <Text style={{ fontSize: 8, color: "#6b7280" }}>
              ID: {subUser?.subUserId}
            </Text>
          </View>

          <View style={styles.childInfoGrid}>
            <View style={styles.infoColumn}>
              <Text style={styles.infoLabel}>Patient</Text>
              <Text style={styles.infoValue}>{subUser?.name}</Text>
            </View>
            <View style={styles.infoColumn}>
              <Text style={styles.infoLabel}>DOB</Text>
              <Text style={styles.infoValue}>{subUser?.dateOfBirthFormatted}</Text>
            </View>
            <View style={styles.infoColumn}>
              <Text style={styles.infoLabel}>Gender</Text>
              <Text style={styles.infoValue}>{subUser?.gender}</Text>
            </View>
            <View style={styles.infoColumn}>
              <Text style={styles.infoLabel}>Current Age</Text>
              <Text style={styles.infoValue}>{subUser?.ageFormatted}</Text>
            </View>
          </View>
        </View>

        {/* Schedule Table Header */}
        <View style={styles.tableHeader} fixed>
          <Text style={[styles.colVaccine, styles.headerText]}>Vaccine Name</Text>
          <Text style={[styles.colDose, styles.headerText]}>Dose</Text>
          <Text style={[styles.colTotal, styles.headerText]}>Total</Text>
          <Text style={[styles.colStatus, styles.headerText]}>Verification Status</Text>
        </View>

        {/* Milestone Groups */}
        {vaccineSchedule.map((group, groupIdx) => (
          <View key={groupIdx} wrap={false}> 
            {/* wrap={false} here prevents an age group title from appearing 
                at the bottom of a page without any vaccines below it */}
            <View style={styles.ageGroupHeader}>
              <Text style={styles.ageGroupText}>{group.age}</Text>
              <View style={{ backgroundColor: "#7c3aed", padding: "2 6", borderRadius: 10 }}>
                <Text style={{ color: "white", fontSize: 6, fontWeight: "bold" }}>MILESTONE</Text>
              </View>
            </View>

            {group.vaccines.map((v, vIdx) => {
              const completed = isDoseCompleted(v.vaccine, v.dose);
              return (
                <View key={vIdx} style={styles.tableRow}>
                  <Text style={[styles.colVaccine, { fontWeight: "bold", color: "#1f2937" }]}>
                    {v.vaccine}
                  </Text>
                  <Text style={[styles.colDose, { color: "#4b5563" }]}>{v.doseNo}</Text>
                  <Text style={[styles.colTotal, { color: "#4b5563" }]}>{v.totalDoses}</Text>
                  <View style={styles.colStatus}>
                    <StatusIcon status={completed ? "completed" : "pending"} />
                    <Text style={[
                      styles.statusText, 
                      { color: completed ? "#059669" : "#dc2626" }
                    ]}>
                      {completed ? "COMPLETED" : "PENDING"}
                    </Text>
                  </View>
                </View>
              );
            })}
          </View>
        ))}

        {/* Footer Section */}
        <View style={styles.footer} fixed>
          <Text style={styles.footerText}>
            This is an electronically generated medical history report.
          </Text>
          <Text style={[styles.footerText, { fontWeight: "bold" }]}>
            Report Generated on {new Date().toLocaleDateString('en-GB')} • BindFam
          </Text>
          <Text style={styles.footerText}>Page 1 of 1</Text>
        </View>
      </Page>
    </Document>
  );
};

export default ImmunizationPDFDocument;