// src/pages/Admin/DoctorApprovals.jsx
import React, { useState } from "react";
import { motion } from "framer-motion";
import {
  CheckCircle2,
  XCircle,
  Clock,
  Search,
  Filter,
  UserCheck,
  ShieldCheck,
  RefreshCw,
  AlertTriangle,
  FileText,
} from "lucide-react";

const mockPendingDoctors = [
  {
    id: 1,
    fullName: "Dr. Ananya Mukherjee",
    specialty: "Pediatrician",
    experienceYears: 8,
    registrationNumber: "WBMC 45678",
    submittedDate: "2026-01-15",
    status: "pending",
    documentsCount: 4,
  },
  {
    id: 2,
    fullName: "Dr. Rajesh Kumar Banerjee",
    specialty: "Child & Adolescent Psychiatry",
    experienceYears: 12,
    registrationNumber: "WBMC 38921",
    submittedDate: "2026-01-12",
    status: "pending",
    documentsCount: 5,
  },
  {
    id: 3,
    fullName: "Dr. Priya Sen",
    specialty: "Neonatology",
    experienceYears: 5,
    registrationNumber: "WBMC 51234",
    submittedDate: "2026-01-18",
    status: "pending",
    documentsCount: 3,
  },
];

const DoctorApprovals = () => {
  const [doctors, setDoctors] = useState(mockPendingDoctors);
  const [searchTerm, setSearchTerm] = useState("");
  const [loadingAction, setLoadingAction] = useState(null);

  const filteredDoctors = doctors.filter(
    (doc) =>
      doc.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      doc.specialty.toLowerCase().includes(searchTerm.toLowerCase()) ||
      doc.registrationNumber.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleApprove = (id) => {
    setLoadingAction(id);
    // Simulate API call
    setTimeout(() => {
      setDoctors((prev) =>
        prev.map((doc) =>
          doc.id === id ? { ...doc, status: "approved" } : doc
        )
      );
      setLoadingAction(null);
      alert("Doctor approved successfully!");
    }, 1200);
  };

  const handleReject = (id) => {
    if (!window.confirm("Are you sure you want to reject this doctor's registration?")) {
      return;
    }

    setLoadingAction(id);
    // Simulate API call
    setTimeout(() => {
      setDoctors((prev) =>
        prev.map((doc) =>
          doc.id === id ? { ...doc, status: "rejected" } : doc
        )
      );
      setLoadingAction(null);
      alert("Doctor registration rejected.");
    }, 1200);
  };

  const getStatusBadge = (status) => {
    if (status === "approved") {
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
          <CheckCircle2 size={14} /> Approved
        </span>
      );
    }
    if (status === "rejected") {
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
          <XCircle size={14} /> Rejected
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-amber-100 text-amber-800">
        <Clock size={14} /> Pending Review
      </span>
    );
  };

  return (
    <div className="space-y-8 pb-16">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 flex-wrap">
        <div>
          <h1 className="text-3xl md:text-4xl font-bold text-gradient">
            Doctor Approvals
          </h1>
          <p className="text-muted mt-2">
            Review and verify new doctor registrations
          </p>
        </div>

        <button className="flex items-center gap-2 px-5 py-2.5 bg-muted/50 hover:bg-muted rounded-xl transition text-sm">
          <RefreshCw size={16} />
          Refresh List
        </button>
      </div>

      {/* Search & Filter Bar */}
      <div className="bg-card rounded-2xl shadow-soft border border-soft p-6">
        <div className="flex flex-col sm:flex-row gap-4 items-end">
          <div className="relative flex-1 min-w-[300px]">
            <input
              type="text"
              placeholder="Search by name, specialty or registration number..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-11 pr-4 py-2.5 rounded-xl border border-soft bg-input focus:outline-none focus:ring-2 focus:ring-primary/50"
            />
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-muted pointer-events-none" />
          </div>

          <button className="px-5 py-2.5 bg-primary/10 text-primary rounded-xl hover:bg-primary/20 transition flex items-center gap-2 whitespace-nowrap">
            <Filter size={18} />
            More Filters
          </button>
        </div>
      </div>

      {/* Doctors Table */}
      <div className="bg-card rounded-2xl shadow-soft border border-soft overflow-hidden">
        {filteredDoctors.length === 0 ? (
          <div className="py-20 text-center text-muted">
            <ShieldCheck size={64} className="mx-auto mb-4 opacity-30" />
            <p className="text-lg font-medium">No pending doctor applications found</p>
            <p className="text-sm mt-2">
              {searchTerm ? "Try different search terms" : "New registrations will appear here"}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm min-w-[900px]">
              <thead>
                <tr className="border-b border-soft bg-muted/30">
                  <th className="text-left py-4 px-6 font-medium">Doctor</th>
                  <th className="text-left py-4 px-6 font-medium">Specialty</th>
                  <th className="text-left py-4 px-6 font-medium hidden md:table-cell">
                    Experience
                  </th>
                  <th className="text-left py-4 px-6 font-medium hidden lg:table-cell">
                    Registration #
                  </th>
                  <th className="text-left py-4 px-6 font-medium">Submitted</th>
                  <th className="text-left py-4 px-6 font-medium">Status</th>
                  <th className="text-right py-4 px-6 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredDoctors.map((doctor) => (
                  <tr
                    key={doctor.id}
                    className="border-b border-soft hover:bg-input/50 transition-colors"
                  >
                    <td className="py-4 px-6 font-medium">{doctor.fullName}</td>
                    <td className="py-4 px-6 text-muted">{doctor.specialty}</td>
                    <td className="py-4 px-6 text-muted hidden md:table-cell">
                      {doctor.experienceYears} years
                    </td>
                    <td className="py-4 px-6 text-muted hidden lg:table-cell">
                      {doctor.registrationNumber}
                    </td>
                    <td className="py-4 px-6 text-muted">
                      {new Date(doctor.submittedDate).toLocaleDateString()}
                    </td>
                    <td className="py-4 px-6">{getStatusBadge(doctor.status)}</td>
                    <td className="py-4 px-6 text-right">
                      <div className="flex items-center justify-end gap-2">
                        {doctor.status === "pending" && (
                          <>
                            <button
                              onClick={() => handleApprove(doctor.id)}
                              disabled={loadingAction === doctor.id}
                              className="p-2.5 rounded-lg hover:bg-green-100 text-green-700 transition-colors disabled:opacity-50"
                              title="Approve this doctor"
                            >
                              {loadingAction === doctor.id ? (
                                <RefreshCw size={18} className="animate-spin" />
                              ) : (
                                <CheckCircle2 size={20} />
                              )}
                            </button>

                            <button
                              onClick={() => handleReject(doctor.id)}
                              disabled={loadingAction === doctor.id}
                              className="p-2.5 rounded-lg hover:bg-red-100 text-red-700 transition-colors disabled:opacity-50"
                              title="Reject application"
                            >
                              {loadingAction === doctor.id ? (
                                <RefreshCw size={18} className="animate-spin" />
                              ) : (
                                <XCircle size={20} />
                              )}
                            </button>
                          </>
                        )}

                        <button
                          className="p-2.5 rounded-lg hover:bg-primary/10 text-primary transition-colors"
                          title="View full application & documents"
                        >
                          <FileText size={20} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default DoctorApprovals;