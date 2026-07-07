import React from "react";
import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  Font,
} from "@react-pdf/renderer";

// Styles
const styles = StyleSheet.create({
  page: {
    padding: "30pt 40pt",
    fontFamily: "Helvetica",
    fontSize: 9, // Slightly smaller for better data density
    color: "#334155",
    backgroundColor: "#fff",
  },
  // --- HEADER SECTION ---
  header: {
    flexDirection: "row",
    borderBottom: "2pt solid #7c3aed",
    paddingBottom: 10,
    marginBottom: 15,
  },
  headerLeft: {
    flex: 1,
  },
  headerRight: {
    width: "45%",
    textAlign: "right",
  },
  doctorName: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#581c87",
  },
  doctorSub: {
    fontSize: 10,
    color: "#6b21a8",
    marginTop: 2,
  },
  regText: {
    fontSize: 9,
    color: "#64748b",
    marginTop: 1,
  },

  // Clinic Details Styling
  clinicBox: {
    marginTop: 4,
    padding: 6,
    borderRadius: 4,
    backgroundColor: "#f8faff",
    border: "0.5pt solid #e2e8f0",
  },
  primaryClinicBox: {
    backgroundColor: "#f5f3ff",
    borderColor: "#ddd6fe",
  },
  clinicName: {
    fontSize: 10,
    fontWeight: "bold",
    color: "#1e293b",
  },
  clinicInfo: {
    fontSize: 8,
    color: "#475569",
    marginTop: 1,
  },
  clinicSpecial: {
    fontSize: 8,
    color: "#7c3aed",
    fontWeight: "bold",
    marginTop: 1,
  },
  clinicOnline: {
    fontSize: 8,
    color: "#10b981",
    fontWeight: "bold",
  },

  // --- PATIENT BAR ---
  patientBar: {
    flexDirection: "row",
    justifyContent: "space-between",
    backgroundColor: "#f8fafc",
    padding: "8pt 12pt",
    borderRadius: 6,
    border: "1pt solid #e2e8f0",
    marginBottom: 15,
  },
  label: {
    fontSize: 7,
    textTransform: "uppercase",
    color: "#94a3b8",
    letterSpacing: 0.5,
  },
  value: {
    fontSize: 10,
    fontWeight: "bold",
    color: "#1e293b",
    marginTop: 2,
  },

  // --- MAIN TWO-COLUMN BODY ---
  mainLayout: {
    flexDirection: "row",
    minHeight: 500,
  },
  leftColumn: {
    width: "28%",
    borderRight: "1pt solid #f1f5f9",
    paddingRight: 10,
  },
  rightColumn: {
    flex: 1,
    paddingLeft: 15,
  },

  sectionTitle: {
    fontSize: 10,
    fontWeight: "bold",
    color: "#581c87",
    marginBottom: 6,
    marginTop: 12,
    textTransform: "uppercase",
  },

  // --- MEDICINE ITEMS ---
  rxIcon: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#7c3aed",
    marginBottom: 10,
  },
  medItem: {
    marginBottom: 10,
    paddingBottom: 8,
    borderBottom: "0.5pt solid #f1f5f9",
  },
  medMainRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  medName: {
    fontSize: 11,
    fontWeight: "bold",
    color: "#1e293b",
  },
  medDuration: {
    fontSize: 9,
    color: "#64748b",
    fontWeight: "bold",
  },
  medMeta: {
    fontSize: 9,
    color: "#475569",
    marginTop: 2,
  },
  instructions: {
    fontSize: 8.5,
    fontStyle: "italic",
    color: "#7c3aed",
    marginTop: 4,
    paddingLeft: 8,
    borderLeft: "1pt solid #ddd6fe",
  },

  // --- FOOTER ---
  footer: {
    position: "absolute",
    bottom: 30,
    left: 40,
    right: 40,
    borderTop: "1pt solid #e2e8f0",
    paddingTop: 8,
    textAlign: "center",
  },
  footerText: {
    fontSize: 8,
    color: "#94a3b8",
  },
});

const PrescriptionDoctorPDF = ({ prescription, doctorData }) => {
  const today = new Date().toLocaleDateString("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
  console.log("prescription", prescription);
  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <Text style={styles.doctorName}>Dr. {doctorData.name}</Text>
            <Text style={styles.doctorSub}>
              {doctorData.specialization} • {doctorData.qualification}
            </Text>
            {doctorData.registrationNumber && (
              <Text style={styles.regText}>
                Reg No: {doctorData.registrationNumber}
              </Text>
            )}
          </View>

          <View style={styles.headerRight}>
            {doctorData.clinics?.map((clinic, idx) => (
              <View
                key={idx}
                style={[
                  styles.clinicBox,
                  clinic.isPrimary && styles.primaryClinicBox,
                ]}
              >
                <Text style={styles.clinicName}>
                  {clinic.clinicName} {clinic.isPrimary && "(Primary)"}
                </Text>
                <Text style={styles.clinicInfo}>{clinic.clinicAddress}</Text>
                <Text style={styles.clinicInfo}>Ph: {clinic.phone}</Text>
                {clinic.visitingDays?.length > 0 && (
                  <Text style={styles.clinicSpecial}>
                    {clinic.visitingDays.join(", ")} | {clinic.visitingTime}
                  </Text>
                )}
                {clinic.isOnline && (
                  <Text style={styles.clinicOnline}>
                    ● Online Consultation Available
                  </Text>
                )}
              </View>
            ))}
          </View>
        </View>

        {/* Patient Info */}
        <View style={styles.patientBar}>
          <View>
            <Text style={styles.label}>Patient Name</Text>
            <Text style={styles.value}>{prescription.childName}</Text>
          </View>
          <View>
            <Text style={styles.label}>Age / Gender</Text>
            <Text style={styles.value}>
              {prescription?.age ?? prescription?.subUser?.age ?? "-"} /{" "}
              {prescription?.gender ?? "-"}
            </Text>
          </View>
          <View style={{ textAlign: "right" }}>
            <Text style={styles.label}>Prescription Date</Text>
            <Text style={styles.value}>{today}</Text>
          </View>
        </View>

        {/* Main Body */}
        <View style={styles.mainLayout}>
          {/* Left Side: Vitals & Advice */}
          <View style={styles.leftColumn}>
            {prescription.title && (
              <View>
                <Text style={styles.sectionTitle}>Visiting For</Text>
                <Text style={{ lineHeight: 1.4, fontSize: 9 }}>
                  {prescription.title}
                </Text>
              </View>
            )}

            {prescription.notes && (
              <View>
                <Text style={styles.sectionTitle}>Advice & Notes</Text>
                <Text style={{ lineHeight: 1.4, fontSize: 9 }}>
                  {prescription.notes}
                </Text>
              </View>
            )}

            {prescription.followUpDate && (
              <View style={{ marginTop: 20 }}>
                <Text style={styles.label}>Next Follow-up</Text>
                <Text style={[styles.value, { color: "#7c3aed" }]}>
                  {new Date(prescription.followUpDate).toLocaleDateString(
                    "en-GB"
                  )}
                </Text>
              </View>
            )}
          </View>

          {/* Right Side: Medicines */}
          <View style={styles.rightColumn}>
            <Text style={styles.rxIcon}>Rx</Text>

            {prescription.medicines.map((med, index) => (
              <View key={index} style={styles.medItem} wrap={false}>
                <View style={styles.medMainRow}>
                  <Text style={styles.medName}>
                    {index + 1}. {med.medicineName}{" "}
                    {med.brandName && `(${med.brandName})`}
                  </Text>
                  <Text style={styles.medDuration}>
                    {med.durationDays
                      ? `${med.durationDays} Days`
                      : "As directed"}
                  </Text>
                </View>

                <Text style={styles.medMeta}>
                  {med.dosage || "As directed"} • {med.frequency}
                  {med.times?.length > 0 &&
                    ` [${med.times.filter((t) => t.trim()).join(", ")}]`}
                </Text>

                {med.startDate && (
                  <Text style={[styles.clinicInfo, { marginTop: 2 }]}>
                    Start: {new Date(med.startDate).toLocaleDateString("en-GB")}
                    {med.endDate &&
                      ` → End: ${new Date(med.endDate).toLocaleDateString(
                        "en-GB"
                      )}`}
                  </Text>
                )}

                {med.instructions && (
                  <Text style={styles.instructions}>
                    Instructions: {med.instructions}
                  </Text>
                )}
              </View>
            ))}
          </View>
        </View>

        {/* Footer */}
        <View style={styles.footer} fixed>
          <Text style={styles.footerText}>
            Computer Generated Prescription •{" "}
            {new Date().toLocaleString("en-GB")}
          </Text>
          <Text style={[styles.footerText, { marginTop: 2 }]}>
            Please consult the doctor in case of any concerns. Not valid for
            medico-legal purposes.
          </Text>
        </View>
      </Page>
    </Document>
  );
};

export default PrescriptionDoctorPDF;
