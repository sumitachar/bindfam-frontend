// src/pages/Admin/AdminDashboard.tsx
import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom"; // ← ADDED
import {
  Users,
  Activity,
  ShieldCheck,
  AlertTriangle,
  TrendingUp,
  Calendar,
  BarChart3,
  Clock,
  LogIn,
  User,
  FileText,
  Search, // ← optional, can be removed if not used elsewhere
} from "lucide-react";
import {
  getAdminStats,
  getRecentActivity,
  getUsersCountByRole,
  getUserActivities,
} from "@/api/Admin/admin";
import AdminUserActivity from "./AdminUserActivity";
import { formatLocalDate } from "@/lib/utils";

const periods = [
  { value: "today", label: "Today" },
  { value: "last-30-days", label: "Last 30 Days" },
  { value: "this-month", label: "This Month" },
  { value: "this-year", label: "This Year" },
  { value: "all", label: "All Time" },
  { value: "custom", label: "Custom Range" },
];

const StatCard = ({
  title,
  value,
  icon: Icon,
  color = "primary",
  trend = null,
}) => {
  const colorClasses = {
    primary:
      "from-[#007fff]/10 to-[#4bbf73]/10 text-[#007fff] border-[#007fff]/20",
    green:
      "from-[#4bbf73]/10 to-[#2fa85a]/10 text-[#4bbf73] border-[#4bbf73]/20",
    warning:
      "from-[#ff6b6b]/10 to-[#ff3b3b]/10 text-[#ff6b6b] border-[#ff6b6b]/20",
  };

  return (
    <motion.div
      initial={{ y: 20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5 }}
      className={`glass-card rounded-2xl p-6 bg-gradient-to-br ${
        colorClasses[color] || colorClasses.primary
      } border`}
    >
      <div className="flex justify-between items-start">
        <div>
          <p className="text-sm font-medium text-muted mb-1">{title}</p>
          <p className="text-2xl md:text-3xl font-bold">
            {typeof value === "number" ? value.toLocaleString() : value || "—"}
          </p>
        </div>
        <div
          className={`p-3 rounded-xl bg-gradient-to-br ${
            colorClasses[color]?.split(" ")[0] || "from-[#007fff]/20"
          }`}
        >
          <Icon className="w-7 h-7" />
        </div>
      </div>

      {trend && (
        <div className="mt-4 flex items-center gap-2 text-sm">
          <TrendingUp className="w-4 h-4" />
          <span className="font-medium">{trend}</span>
          <span className="text-muted">in selected period</span>
        </div>
      )}
    </motion.div>
  );
};

const AdminDashboard = () => {
  const [selectedPeriod, setSelectedPeriod] = useState("today");
  const [customRange, setCustomRange] = useState({ from: "", to: "" });
  const [isCustomValid, setIsCustomValid] = useState(false);
  const [recentLogins, setRecentLogins] = useState([]);
  const [recentLoginsTotal, setRecentLoginsTotal] = useState(0);
  const [recentLoginsPage, setRecentLoginsPage] = useState(1);

  const [activityItems, setActivityItems] = useState([]);
  const [activityTotal, setActivityTotal] = useState(0);
  const [activityPage, setActivityPage] = useState(1);
  const ACTIVITY_LIMIT = 10;

  const [stats, setStats] = useState({
    totalUsers: 0,
    activeUsers: 0,
    doctors: 0,
    parents: 0,
    subUsers: 0,
    reportsToday: 0,
    pendingApprovals: 0,
  });

  const [roleCounts, setRoleCounts] = useState({
    parents: 0,
    doctors: 0,
    admins: 0,
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const RECENT_LOGINS_LIMIT = 10;

  const showCustomRange = selectedPeriod === "custom";

  // Validate custom date range
  useEffect(() => {
    if (showCustomRange) {
      const from = customRange.from;
      const to = customRange.to;
      const valid = from && to && from <= to;
      setIsCustomValid(valid);
    } else {
      setIsCustomValid(true);
    }
  }, [customRange.from, customRange.to, showCustomRange]);

  useEffect(() => {
    setRecentLoginsPage(1);
  }, [selectedPeriod, customRange.from, customRange.to, showCustomRange]);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);

      // Skip fetch when custom range is selected but invalid
      if (showCustomRange && !isCustomValid) {
        setLoading(false);
        return;
      }

      try {
        const statsParams = { period: selectedPeriod };

        let from;
        let to;

        // Compute date range for custom or predefined periods
        if (showCustomRange) {
          from = customRange.from;
          to = customRange.to;

          statsParams.from = from;
          statsParams.to = to;
        } else {
          const now = new Date();

          switch (selectedPeriod) {
            case "today":
              from = formatLocalDate(now);
              to = formatLocalDate(now);
              break;

            case "this-month":
              from = formatLocalDate(
                new Date(now.getFullYear(), now.getMonth(), 1),
              );
              to = formatLocalDate(now);
              break;

            case "this-year":
              from = formatLocalDate(new Date(now.getFullYear(), 0, 1));
              to = formatLocalDate(now);
              break;

            case "last-30-days": {
              const past = new Date(now);
              past.setDate(now.getDate() - 29); // include today
              from = formatLocalDate(past);
              to = formatLocalDate(now);
              break;
            }

            case "all":
              from = undefined;
              to = undefined;
              break;
          }
        }

        const [statsData, recentLoginsData, roleCountsData, activityData] =
          await Promise.all([
            getAdminStats(statsParams),
            getRecentActivity(RECENT_LOGINS_LIMIT, recentLoginsPage, from, to),
            getUsersCountByRole(),
            getUserActivities(ACTIVITY_LIMIT, activityPage, from, to),
          ]);

        setStats({
          totalUsers: statsData.totalUsers || 0,
          activeUsers: statsData.activeUsers || 0,
          doctors: statsData.doctors || 0,
          parents: statsData.parents || 0,
          subUsers: statsData.subUsers || 0,
          reportsToday: statsData.reportsToday || 0,
          pendingApprovals: statsData.pendingApprovals || 0,
        });

        setActivityItems(activityData.items || []);
        setActivityTotal(activityData.total || 0);

        setRecentLogins(recentLoginsData.items || []);
        setRecentLoginsTotal(recentLoginsData.total || 0);

        setRoleCounts(roleCountsData || { parents: 0, doctors: 0, admins: 0 });
      } catch (err) {
        console.error("Failed to fetch admin data:", err);
        setError("Failed to load statistics. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [
    selectedPeriod,
    customRange.from,
    customRange.to,
    isCustomValid,
    showCustomRange,
    recentLoginsPage,
  ]);

  const getPeriodLabel = () => {
    if (showCustomRange) {
      if (!customRange.from || !customRange.to) return "Select date range";
      if (!isCustomValid) return "Invalid range (from > to)";
      return `${customRange.from} → ${customRange.to}`;
    }
    return (
      periods.find((p) => p.value === selectedPeriod)?.label || "Select period"
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-primary text-lg animate-pulse flex items-center gap-3">
          <div className="w-6 h-6 border-4 border-primary border-t-transparent rounded-full animate-spin" />
          Loading platform overview...
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-16">
        <div className="text-red-500 text-2xl mb-4">Something went wrong</div>
        <p className="text-muted mb-6 max-w-md mx-auto">{error}</p>
        <button
          onClick={() => window.location.reload()}
          className="px-8 py-3 bg-primary text-white rounded-xl hover:opacity-90 transition font-medium shadow-md"
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-10 pb-16">
      {/* Header + Filter Controls */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 flex-wrap">
        <div>
          <h1 className="text-3xl md:text-4xl font-bold text-gradient">
            Admin Dashboard
          </h1>
          <p className="text-muted mt-2">Platform overview & management</p>
        </div>

        <div className="flex flex-wrap gap-4 items-center">
          <div className="relative min-w-[200px]">
            <select
              value={selectedPeriod}
              onChange={(e) => setSelectedPeriod(e.target.value)}
              className={`
                calendar-button appearance-none pr-12 pl-4 py-2.5 rounded-xl w-full
                bg-gradient-to-r from-[#007fff] to-[#4bbf73] text-white
                font-medium cursor-pointer shadow-md
              `}
            >
              {periods.map((period) => (
                <option key={period.value} value={period.value}>
                  {period.label}
                </option>
              ))}
            </select>
            <Calendar className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white pointer-events-none" />
          </div>

          {showCustomRange && (
            <div className="flex flex-col sm:flex-row gap-3 items-center">
              <div className="flex items-center gap-2">
                <input
                  type="date"
                  value={customRange.from}
                  max={customRange.to || new Date().toISOString().split("T")[0]}
                  onChange={(e) =>
                    setCustomRange((prev) => ({
                      ...prev,
                      from: e.target.value,
                    }))
                  }
                  className="bg-input border border-soft rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 min-w-[160px]"
                />
                <span className="text-muted font-medium">to</span>
                <input
                  type="date"
                  value={customRange.to}
                  min={customRange.from}
                  max={new Date().toISOString().split("T")[0]}
                  onChange={(e) =>
                    setCustomRange((prev) => ({ ...prev, to: e.target.value }))
                  }
                  className="bg-input border border-soft rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 min-w-[160px]"
                />
              </div>

              {!isCustomValid && customRange.from && customRange.to && (
                <span className="text-red-500 text-sm font-medium whitespace-nowrap">
                  From date must be before or equal to To date
                </span>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Current Period Indicator */}
      <div
        className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-xl shadow-soft text-sm ${
          showCustomRange && !isCustomValid
            ? "bg-red-50/70 text-red-600 border border-red-200"
            : "bg-card/70 backdrop-blur-sm text-muted"
        }`}
      >
        Showing data for:{" "}
        <span
          className={`font-medium ml-1 ${
            showCustomRange && !isCustomValid ? "text-red-700" : "text-primary"
          }`}
        >
          {getPeriodLabel()}
        </span>
      </div>

      {/* Main Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        <StatCard title="Total Users" value={stats.totalUsers} icon={Users} />
        <StatCard
          title="Active Users"
          value={stats.activeUsers}
          icon={Activity}
          color="green"
        />
        <StatCard
          title="Total Doctors Join"
          value={stats.doctors}
          icon={ShieldCheck}
        />
        <StatCard
          title="Pending Approvals"
          value={stats.pendingApprovals}
          icon={AlertTriangle}
          color="warning"
        />
      </div>

      {/* Role Distribution */}
      <div className="bg-card rounded-2xl p-6 shadow-soft border border-soft">
        <h2 className="text-xl font-semibold mb-6 flex items-center gap-3">
          <Users className="w-6 h-6 text-primary" />
          User Distribution by Role
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 text-center">
          <div className="p-4 bg-green-50/50 rounded-xl border border-green-100">
            <p className="text-3xl font-bold text-green-700">
              {roleCounts.parents.toLocaleString()}
            </p>
            <p className="text-sm text-green-600 mt-1">Parents</p>
          </div>
          <div className="p-4 bg-blue-50/50 rounded-xl border border-blue-100">
            <p className="text-3xl font-bold text-blue-700">
              {roleCounts.doctors.toLocaleString()}
            </p>
            <p className="text-sm text-blue-600 mt-1">Doctors</p>
          </div>
          <div className="p-4 bg-purple-50/50 rounded-xl border border-purple-100">
            <p className="text-3xl font-bold text-purple-700">
              {roleCounts.admins.toLocaleString()}
            </p>
            <p className="text-sm text-purple-600 mt-1">Admins</p>
          </div>
        </div>
      </div>

      {/* Recent Logins Section */}
      <div className="bg-card rounded-2xl p-6 shadow-soft border border-soft">
        <h2 className="text-xl font-semibold mb-6 flex items-center gap-3">
          <LogIn className="w-6 h-6 text-primary" />
          Recent Logins (Last {RECENT_LOGINS_LIMIT})
        </h2>

        {recentLogins.length === 0 && recentLoginsPage === 1 ? (
          <p className="text-muted text-center py-8">
            No recent login activity
          </p>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-soft">
                    <th className="text-left py-3 px-4">User</th>
                    <th className="text-left py-3 px-4">Role</th>
                    <th className="text-left py-3 px-4">Login Time</th>
                    <th className="text-left py-3 px-4">IP</th>
                    <th className="text-left py-3 px-4">Device</th>
                  </tr>
                </thead>
                <tbody>
                  {recentLogins.map((login) => (
                    <tr
                      key={login.id}
                      className="border-b border-soft hover:bg-input/50 transition"
                    >
                      <td className="py-3 px-4 font-medium">
                        {login.user?.name || "Unknown"}
                      </td>

                      <td className="py-3 px-4">
                        <span
                          className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${
                            login.user?.role === "admin"
                              ? "bg-purple-100 text-purple-800"
                              : login.user?.role === "doctor"
                                ? "bg-blue-100 text-blue-800"
                                : "bg-green-100 text-green-800"
                          }`}
                        >
                          {login.user?.role?.toUpperCase() || "N/A"}
                        </span>
                      </td>

                      <td className="py-3 px-4">
                        {login.loginAt
                          ? new Date(login.loginAt).toLocaleString()
                          : "N/A"}
                      </td>

                      <td className="py-3 px-4 font-mono text-muted">
                        {login.ipAddress || "N/A"}
                      </td>

                      <td className="py-3 px-4 text-muted truncate max-w-xs">
                        {login.userAgent || "N/A"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination Footer */}
            <div className="flex items-center justify-between mt-6">
              <span className="text-sm text-muted">
                Showing {(recentLoginsPage - 1) * RECENT_LOGINS_LIMIT + 1}–
                {Math.min(
                  recentLoginsPage * RECENT_LOGINS_LIMIT,
                  recentLoginsTotal,
                )}{" "}
                of {recentLoginsTotal}
              </span>

              <div className="flex gap-2">
                <button
                  disabled={recentLoginsPage === 1}
                  onClick={() => setRecentLoginsPage((p) => p - 1)}
                  className="px-3 py-1 rounded-lg border border-soft disabled:opacity-50"
                >
                  Prev
                </button>

                <button
                  disabled={
                    recentLoginsPage * RECENT_LOGINS_LIMIT >= recentLoginsTotal
                  }
                  onClick={() => setRecentLoginsPage((p) => p + 1)}
                  className="px-3 py-1 rounded-lg border border-soft disabled:opacity-50"
                >
                  Next
                </button>
              </div>
            </div>
          </>
        )}
      </div>

      {/* User Activity Logs */}
      <AdminUserActivity
        items={activityItems}
        total={activityTotal}
        page={activityPage}
        limit={ACTIVITY_LIMIT}
        onPrev={() => setActivityPage((p) => Math.max(1, p - 1))}
        onNext={() => setActivityPage((p) => p + 1)}
      />

      {/* Quick Actions */}
      <div className="bg-card rounded-2xl p-6 shadow-soft border border-soft">
        <h2 className="text-xl font-semibold mb-6 flex items-center gap-3">
          <BarChart3 className="w-6 h-6 text-primary" />
          Quick Actions
        </h2>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-5">
          {/* Manage Users */}
          <Link
            to="/manage-users"
            className="group relative p-6 rounded-2xl bg-white border border-gray-200 
               hover:border-primary/50 hover:shadow-xl hover:shadow-primary/10 
               transition-all duration-300 text-center overflow-hidden"
          >
            <div
              className="absolute inset-0 bg-gradient-to-br from-[#007fff]/5 to-[#4bbf73]/5 opacity-0 
                    group-hover:opacity-100 transition-opacity duration-300"
            />

            <div
              className="relative mx-auto mb-4 p-4 rounded-xl bg-gradient-to-br 
                    from-[#007fff]/10 to-[#4bbf73]/10 w-fit group-hover:scale-110 transition-transform"
            >
              <Users className="w-8 h-8 text-primary" />
            </div>

            <p className="font-semibold text-gray-800 group-hover:text-primary transition-colors">
              Manage Users
            </p>

            <p className="text-xs text-gray-500 mt-1 opacity-70 group-hover:opacity-100">
              Add, edit & manage all users
            </p>
          </Link>

          {/* System Reports - now active */}
          <Link
            to="/system-reports"
            className="group relative p-6 rounded-2xl bg-white border border-gray-200 
               hover:border-green-500/50 hover:shadow-xl hover:shadow-green-100/30 
               transition-all duration-300 text-center overflow-hidden"
          >
            <div
              className="absolute inset-0 bg-gradient-to-br from-[#4bbf73]/5 to-[#2fa85a]/5 opacity-0 
                    group-hover:opacity-100 transition-opacity duration-300"
            />

            <div
              className="relative mx-auto mb-4 p-4 rounded-xl bg-gradient-to-br 
                    from-[#4bbf73]/10 to-[#2fa85a]/10 w-fit group-hover:scale-110 transition-transform"
            >
              <FileText className="w-8 h-8 text-green-600" />
            </div>

            <p className="font-semibold text-gray-800 group-hover:text-green-700 transition-colors">
              System Reports
            </p>

            <p className="text-xs text-gray-500 mt-1 opacity-70 group-hover:opacity-100">
              Activity & performance reports
            </p>
          </Link>

          {/* Doctor Approvals / Verification */}
          <Link
            to="/doctor-approvals"
            className="group relative p-6 rounded-2xl bg-white border border-gray-200 
               hover:border-purple-500/50 hover:shadow-xl hover:shadow-purple-100/30 
               transition-all duration-300 text-center overflow-hidden"
          >
            <div
              className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-purple-600/5 opacity-0 
                    group-hover:opacity-100 transition-opacity duration-300"
            />

            <div
              className="relative mx-auto mb-4 p-4 rounded-xl bg-gradient-to-br 
                    from-purple-500/10 to-purple-600/10 w-fit group-hover:scale-110 transition-transform"
            >
              <ShieldCheck className="w-8 h-8 text-purple-600" />
            </div>

            <p className="font-semibold text-gray-800 group-hover:text-purple-700 transition-colors">
              Doctor Approvals
            </p>

            <p className="text-xs text-gray-500 mt-1 opacity-70 group-hover:opacity-100">
              Verify & manage doctors
            </p>
          </Link>

          {/* Analytics Overview */}
          {/* <Link
            to="/analytics"
            className="group relative p-6 rounded-2xl bg-white border border-gray-200 
                 hover:border-amber-500/50 hover:shadow-xl hover:shadow-amber-100/30 
                 transition-all duration-300 text-center overflow-hidden opacity-75 cursor-not-allowed"
          >
            <div
              className="absolute inset-0 bg-gradient-to-br from-amber-500/5 to-amber-600/5 opacity-0 
                    group-hover:opacity-100 transition-opacity duration-300"
            />

            <div
              className="relative mx-auto mb-4 p-4 rounded-xl bg-gradient-to-br 
                    from-amber-500/10 to-amber-600/10 w-fit group-hover:scale-110 transition-transform"
            >
              <BarChart3 className="w-8 h-8 text-amber-600" />
            </div>

            <p className="font-semibold text-gray-800 group-hover:text-amber-700 transition-colors">
              Analytics
            </p>

            <p className="text-xs text-gray-500 mt-1 opacity-70">Coming soon</p>
          </Link> */}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
