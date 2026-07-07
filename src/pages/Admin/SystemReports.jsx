// src/pages/Admin/SystemReports.jsx
import React, { useState } from "react";
import { motion } from "framer-motion";
import {
  FileText,
  Download,
  Filter,
  Calendar,
  RefreshCw,
  CheckCircle2,
  Clock,
  AlertTriangle,
  BarChart3,
  TrendingUp,
  Users,
  ShieldCheck,
  FileBarChart,
} from "lucide-react";

const reportTypes = [
  { id: "daily", label: "Daily Summary", icon: Clock },
  { id: "weekly", label: "Weekly Overview", icon: Calendar },
  { id: "monthly", label: "Monthly Report", icon: BarChart3 },
  { id: "custom", label: "Custom Date Range", icon: Filter },
];

const mockReports = [
  {
    id: 1,
    title: "Daily Activity Report - January 19, 2026",
    type: "daily",
    date: "2026-01-19",
    status: "ready",
    highlights: ["142 logins", "31 new parents", "7 pending doctor approvals"],
  },
  {
    id: 2,
    title: "Weekly Summary - Week 3, 2026",
    type: "weekly",
    date: "2026-01-13 – 2026-01-19",
    status: "ready",
    highlights: ["+21% user growth", "Most active day: Friday"],
  },
  {
    id: 3,
    title: "Monthly Overview - January 2026 (partial)",
    type: "monthly",
    date: "2026-01-01 – 2026-01-19",
    status: "processing",
    highlights: [],
  },
];

const SystemReports = () => {
  const [selectedType, setSelectedType] = useState("daily");
  const [customRange, setCustomRange] = useState({ from: "", to: "" });
  const [reports, setReports] = useState(mockReports);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const isCustom = selectedType === "custom";

  const handleGenerateReport = () => {
    if (isCustom && (!customRange.from || !customRange.to)) {
      setError("Please select both start and end dates");
      return;
    }

    setError(null);
    setLoading(true);

    // Simulate report generation (replace with real API call later)
    setTimeout(() => {
      const newReport = {
        id: Date.now(),
        title: `${reportTypes.find((t) => t.id === selectedType)?.label} Report`,
        type: selectedType,
        date: isCustom
          ? `${customRange.from} – ${customRange.to}`
          : new Date().toLocaleDateString(),
        status: Math.random() > 0.3 ? "ready" : "processing",
        highlights: [],
      };

      setReports((prev) => [newReport, ...prev]);
      setLoading(false);
    }, 1500);
  };

  const getStatusBadge = (status) => {
    if (status === "ready") {
      return (
        <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
          <CheckCircle2 size={14} /> Ready
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium bg-amber-100 text-amber-800">
        <RefreshCw size={14} className="animate-spin" /> Processing...
      </span>
    );
  };

  return (
    <div className="space-y-8 pb-16">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 flex-wrap">
        <div>
          <h1 className="text-3xl md:text-4xl font-bold text-gradient">
            System Reports
          </h1>
          <p className="text-muted mt-2">
            Generate, view and download platform performance reports
          </p>
        </div>

        <button
          onClick={() => window.location.reload()}
          className="flex items-center gap-2 px-5 py-2.5 bg-muted/50 hover:bg-muted rounded-xl transition text-sm font-medium"
        >
          <RefreshCw size={16} />
          Refresh
        </button>
      </div>

      {/* Report Generator Card */}
      <div className="bg-card rounded-2xl shadow-soft border border-soft p-6">
        <div className="flex flex-col sm:flex-row gap-6 items-end flex-wrap">
          <div className="flex-1 min-w-[220px]">
            <label className="block text-sm font-medium text-muted mb-2">
              Report Type
            </label>
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-soft bg-input focus:outline-none focus:ring-2 focus:ring-primary/50"
            >
              {reportTypes.map((type) => (
                <option key={type.id} value={type.id}>
                  {type.label}
                </option>
              ))}
            </select>
          </div>

          {isCustom && (
            <div className="flex flex-col sm:flex-row gap-4 flex-1">
              <div className="flex-1">
                <label className="block text-sm font-medium text-muted mb-2">
                  From
                </label>
                <input
                  type="date"
                  value={customRange.from}
                  max={customRange.to || new Date().toISOString().split("T")[0]}
                  onChange={(e) =>
                    setCustomRange((prev) => ({ ...prev, from: e.target.value }))
                  }
                  className="w-full px-4 py-2.5 rounded-xl border border-soft bg-input focus:outline-none focus:ring-2 focus:ring-primary/50"
                />
              </div>
              <div className="flex-1">
                <label className="block text-sm font-medium text-muted mb-2">
                  To
                </label>
                <input
                  type="date"
                  value={customRange.to}
                  min={customRange.from}
                  max={new Date().toISOString().split("T")[0]}
                  onChange={(e) =>
                    setCustomRange((prev) => ({ ...prev, to: e.target.value }))
                  }
                  className="w-full px-4 py-2.5 rounded-xl border border-soft bg-input focus:outline-none focus:ring-2 focus:ring-primary/50"
                />
              </div>
            </div>
          )}

          <button
            onClick={handleGenerateReport}
            disabled={loading || (isCustom && (!customRange.from || !customRange.to))}
            className="px-6 py-2.5 bg-primary text-white rounded-xl hover:opacity-90 transition flex items-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed min-w-[160px] justify-center"
          >
            {loading ? (
              <>
                <RefreshCw size={18} className="animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <FileText size={18} />
                Generate Report
              </>
            )}
          </button>
        </div>

        {error && (
          <div className="mt-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-xl text-sm">
            {error}
          </div>
        )}
      </div>

      {/* Generated Reports List */}
      <div className="bg-card rounded-2xl shadow-soft border border-soft overflow-hidden">
        <div className="p-6 border-b border-soft">
          <h2 className="text-xl font-semibold flex items-center gap-3">
            <FileBarChart className="text-primary" />
            Generated Reports
          </h2>
        </div>

        {loading && reports.length === 0 ? (
          <div className="py-20 flex flex-col items-center justify-center text-muted">
            <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mb-4"></div>
            <p>Loading reports...</p>
          </div>
        ) : reports.length === 0 ? (
          <div className="py-20 text-center text-muted">
            <FileText size={64} className="mx-auto mb-4 opacity-30" />
            <p className="text-lg font-medium">No reports yet</p>
            <p className="text-sm mt-2">Generate your first report above</p>
          </div>
        ) : (
          <div className="divide-y divide-soft">
            {reports.map((report) => (
              <motion.div
                key={report.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-6 hover:bg-input/40 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-4"
              >
                <div className="flex items-start gap-4 flex-1">
                  <div className="p-4 rounded-xl bg-primary/10 text-primary">
                    <FileText size={28} />
                  </div>
                  <div>
                    <h3 className="font-medium text-lg">{report.title}</h3>
                    <p className="text-sm text-muted mt-1">{report.date}</p>
                    {report.highlights.length > 0 && (
                      <div className="mt-3 flex flex-wrap gap-2">
                        {report.highlights.map((h, i) => (
                          <span
                            key={i}
                            className="text-xs bg-muted/60 px-2.5 py-1 rounded-full"
                          >
                            {h}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-4 flex-shrink-0">
                  {getStatusBadge(report.status)}

                  <button
                    disabled={report.status !== "ready"}
                    className="p-2 rounded-lg hover:bg-primary/10 text-primary transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                    title="Download report (PDF/Excel)"
                  >
                    <Download size={20} />
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* Future Features Teaser */}
      <div className="bg-gradient-to-br from-amber-50 to-amber-100/50 border border-amber-200 rounded-2xl p-8 text-center">
        <AlertTriangle className="mx-auto text-amber-600 mb-4" size={40} />
        <h3 className="text-xl font-semibold mb-3">Advanced Features Coming Soon</h3>
        <p className="text-muted max-w-3xl mx-auto mb-6">
          PDF & Excel export • Scheduled automatic reports • Detailed charts & analytics •
          Comparison between periods • Email delivery • Custom report builder
        </p>
        <button className="px-6 py-2.5 bg-amber-600 text-white rounded-xl hover:bg-amber-700 transition">
          Get Notified
        </button>
      </div>
    </div>
  );
};

export default SystemReports;