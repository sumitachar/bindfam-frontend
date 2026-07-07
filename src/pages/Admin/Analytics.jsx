// src/pages/Admin/Analytics.jsx
import React, { useState } from "react";
import { motion } from "framer-motion";
import {
  BarChart3,
  TrendingUp,
  TrendingDown,
  Users,
  Activity,
  Clock,
  Calendar,
  Download,
  RefreshCw,
  DollarSign,
  Percent,
} from "lucide-react";

const timeRanges = [
  { value: "7d", label: "Last 7 Days" },
  { value: "30d", label: "Last 30 Days" },
  { value: "this-month", label: "This Month" },
  { value: "this-quarter", label: "This Quarter" },
  { value: "this-year", label: "This Year" },
];

const Analytics = () => {
  const [selectedRange, setSelectedRange] = useState("30d");

  // Mock data - in real application replace with API response
  const stats = {
    newUsers: 342,
    newUsersChange: 18.7,
    activeUsers: 1876,
    activeUsersChange: -4.2,
    totalSessions: 12480,
    avgSessionDuration: "4m 52s",
    avgSessionChange: 12.1,
    conversionRate: 7.8,
    conversionChange: 2.4,
  };

  return (
    <div className="space-y-8 pb-16">
      {/* Header + Controls */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 flex-wrap">
        <div>
          <h1 className="text-3xl md:text-4xl font-bold text-gradient">
            Analytics Overview
          </h1>
          <p className="text-muted mt-2">
            Platform performance, user growth and key metrics
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-4">
          <select
            value={selectedRange}
            onChange={(e) => setSelectedRange(e.target.value)}
            className="px-4 py-2.5 rounded-xl border border-soft bg-input min-w-[180px] focus:outline-none focus:ring-2 focus:ring-primary/50"
          >
            {timeRanges.map((range) => (
              <option key={range.value} value={range.value}>
                {range.label}
              </option>
            ))}
          </select>

          <button className="flex items-center gap-2 px-5 py-2.5 bg-muted/60 hover:bg-muted rounded-xl transition text-sm">
            <Download size={16} />
            Export Data
          </button>

          <button className="flex items-center gap-2 px-5 py-2.5 bg-muted/60 hover:bg-muted rounded-xl transition text-sm">
            <RefreshCw size={16} />
            Refresh
          </button>
        </div>
      </div>

      {/* Key Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {/* New Users */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="bg-card rounded-2xl p-6 shadow-soft border border-soft"
        >
          <div className="flex justify-between items-start mb-4">
            <div>
              <p className="text-sm text-muted mb-1">New Users</p>
              <p className="text-3xl font-bold">{stats.newUsers.toLocaleString()}</p>
            </div>
            <div className="p-3 rounded-xl bg-blue-100/50">
              <Users className="w-7 h-7 text-blue-600" />
            </div>
          </div>
          <div className={`flex items-center gap-2 text-sm font-medium ${
            stats.newUsersChange >= 0 ? "text-green-600" : "text-red-600"
          }`}>
            {stats.newUsersChange >= 0 ? <TrendingUp size={16} /> : <TrendingDown size={16} />}
            <span>{Math.abs(stats.newUsersChange)}% vs previous period</span>
          </div>
        </motion.div>

        {/* Active Users */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="bg-card rounded-2xl p-6 shadow-soft border border-soft"
        >
          <div className="flex justify-between items-start mb-4">
            <div>
              <p className="text-sm text-muted mb-1">Active Users</p>
              <p className="text-3xl font-bold">{stats.activeUsers.toLocaleString()}</p>
            </div>
            <div className="p-3 rounded-xl bg-purple-100/50">
              <Activity className="w-7 h-7 text-purple-600" />
            </div>
          </div>
          <div className={`flex items-center gap-2 text-sm font-medium ${
            stats.activeUsersChange >= 0 ? "text-green-600" : "text-red-600"
          }`}>
            {stats.activeUsersChange >= 0 ? <TrendingUp size={16} /> : <TrendingDown size={16} />}
            <span>{Math.abs(stats.activeUsersChange)}% vs previous period</span>
          </div>
        </motion.div>

        {/* Total Sessions */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="bg-card rounded-2xl p-6 shadow-soft border border-soft"
        >
          <div className="flex justify-between items-start mb-4">
            <div>
              <p className="text-sm text-muted mb-1">Total Sessions</p>
              <p className="text-3xl font-bold">{stats.totalSessions.toLocaleString()}</p>
            </div>
            <div className="p-3 rounded-xl bg-green-100/50">
              <Clock className="w-7 h-7 text-green-600" />
            </div>
          </div>
          <div className="flex items-center gap-2 text-sm text-green-600 font-medium">
            <TrendingUp size={16} />
            <span>{stats.avgSessionChange}% session growth</span>
          </div>
        </motion.div>

        {/* Avg Session Duration */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="bg-card rounded-2xl p-6 shadow-soft border border-soft"
        >
          <div className="flex justify-between items-start mb-4">
            <div>
              <p className="text-sm text-muted mb-1">Avg. Session Duration</p>
              <p className="text-3xl font-bold">{stats.avgSessionDuration}</p>
            </div>
            <div className="p-3 rounded-xl bg-amber-100/50">
              <Calendar className="w-7 h-7 text-amber-600" />
            </div>
          </div>
          <div className="flex items-center gap-2 text-sm text-green-600 font-medium">
            <TrendingUp size={16} />
            <span>Improved by {stats.avgSessionChange}%</span>
          </div>
        </motion.div>
      </div>

      {/* Charts Area - Placeholder */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-card rounded-2xl shadow-soft border border-soft p-6 h-96 flex flex-col items-center justify-center text-muted">
          <BarChart3 size={64} className="mb-6 opacity-40" />
          <p className="text-xl font-medium mb-2">User Registration Trend</p>
          <p className="text-sm">Interactive chart coming soon...</p>
        </div>

        <div className="bg-card rounded-2xl shadow-soft border border-soft p-6 h-96 flex flex-col items-center justify-center text-muted">
          <Activity size={64} className="mb-6 opacity-40" />
          <p className="text-xl font-medium mb-2">Daily Active Users</p>
          <p className="text-sm">Interactive chart coming soon...</p>
        </div>
      </div>

      {/* More Metrics / Coming Soon */}
      <div className="bg-gradient-to-br from-indigo-50 via-purple-50 to-indigo-50 border border-indigo-200 rounded-2xl p-8 text-center">
        <h3 className="text-2xl font-semibold mb-4 text-indigo-900">
          More Advanced Analytics Features Coming Soon
        </h3>
        <p className="text-indigo-700 max-w-3xl mx-auto mb-6">
          • Doctor activity heatmaps • User retention curves • Geographical distribution<br />
          • Conversion funnels • Revenue & subscription analytics • Custom reports & dashboards
        </p>
        <p className="text-sm text-indigo-600 font-medium">
          We're actively working on these features — stay tuned!
        </p>
      </div>
    </div>
  );
};

export default Analytics;