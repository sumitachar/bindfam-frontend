// src/pages/Parents/Expenses/FamilyExpenses.jsx
import React, { useState, useEffect, useMemo } from "react";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
} from "recharts";
import { Edit2, Trash2, Filter, RefreshCw, Users, Plus, X } from "lucide-react";
import { format } from "date-fns";
import { motion } from "framer-motion";
import api from "@/api/base"; 

import { getSubUsers } from "@/api/Auth/auth";
import { getConnectedParents } from "@/api/Parents/familyEvents";
import {
  createExpense,
  getAllExpenses,
  getExpenseSummary,
  getExpenseById,
  updateExpense,
  deleteExpense,
} from "@/api/Parents/familyExpences";

const COLORS = ["#06b6d4", "#0891b2", "#22d3ee", "#67e8f9", "#99f6e4", "#ecfeff"];
const CATEGORIES = [
  "Food", "Shopping", "Medical", "Transport",
  "Education", "Entertainment", "Bills", "Other",
];

export default function FamilyExpenses() {
  const [member, setMember] = useState("");
  const [category, setCategory] = useState("");
  const [event, setEvent] = useState("");
  const [amount, setAmount] = useState("");
  const [date, setDate] = useState(format(new Date(), "yyyy-MM-dd"));

  const [expenses, setExpenses] = useState([]);
  const [summary, setSummary] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(false);

  const [familyMembers, setFamilyMembers] = useState([]);
  const [loadingMembers, setLoadingMembers] = useState(true);

  const [filterMember, setFilterMember] = useState("all");
  const [filterCategory, setFilterCategory] = useState("all");
  const [dateRange, setDateRange] = useState("all");

  const [showFormModal, setShowFormModal] = useState(false);
  const [showBudgetModal, setShowBudgetModal] = useState(false);
  const [tempBudget, setTempBudget] = useState("");

  // Dynamic Budget from Backend
  const monthlyBudget = summary?.monthlyBudget || 50000;
  const totalSpent = summary?.total || expenses.reduce((s, e) => s + e.amount, 0);
  const budgetPercent = monthlyBudget > 0 ? Math.min((totalSpent / monthlyBudget) * 100, 100) : 0;

  // Load Family Members
  useEffect(() => {
    const loadFamilyMembers = async () => {
      try {
        const [subUsersRes, connectedParentsRes] = await Promise.all([
          getSubUsers(),
          getConnectedParents().catch(() => ({ accepted: [] })),
        ]);

        const members = [];
        members.push({ value: "me", label: "Me (Myself)", type: "self" });

        (subUsersRes || []).forEach((child) => {
          members.push({
            value: child.userCode || child.id || child.name,
            label: child.name || "Child",
            type: "child",
          });
        });

        (connectedParentsRes?.accepted || []).forEach((conn) => {
          const parent = conn.connectedParent;
          members.push({
            value: parent.userCode || parent.id,
            label: parent.name || "Connected Parent",
            type: "parent",
          });
        });

        setFamilyMembers(members);
      } catch (err) {
        console.error("Failed to load family members", err);
        toast.error("Using default members");
        setFamilyMembers([
          { value: "me", label: "Me (Myself)" },
          { value: "Father", label: "Father" },
          { value: "Mother", label: "Mother" },
          { value: "Child", label: "Child" },
        ]);
      } finally {
        setLoadingMembers(false);
      }
    };

    loadFamilyMembers();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const monthParam = dateRange === "all" ? undefined : dateRange;
      const [expensesRes, summaryRes] = await Promise.all([
        getAllExpenses(),
        getExpenseSummary(monthParam),
      ]);

      setExpenses(expensesRes || []);
      setSummary(summaryRes || { total: 0, count: 0, byCategory: [], monthlyBudget: 50000 });
    } catch (err) {
      toast.error("Failed to load expenses");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [dateRange]);

  const handleSubmit = async () => {
    if (!member || !category || !amount || !date) {
      toast.error("Please fill all required fields");
      return;
    }

    const payload = {
      member: member === "me" ? "self" : member,
      category,
      event: event.trim() || "General",
      amount: Number(amount),
      date,
    };

    try {
      if (editingId) {
        await updateExpense(editingId, payload);
        toast.success("Expense updated successfully!");
      } else {
        await createExpense(payload);
        toast.success("Expense added successfully!");
      }
      resetForm();
      setShowFormModal(false);
      loadData();
    } catch (err) {
      toast.error("Failed to save expense");
    }
  };

  const resetForm = () => {
    setMember("");
    setCategory("");
    setEvent("");
    setAmount("");
    setDate(format(new Date(), "yyyy-MM-dd"));
    setEditingId(null);
  };

  const openAddModal = () => {
    resetForm();
    setShowFormModal(true);
  };

  const handleEdit = async (id) => {
    try {
      const exp = await getExpenseById(id);
      setMember(exp.member === "self" ? "me" : exp.member);
      setCategory(exp.category || "");
      setEvent(exp.event || "");
      setAmount(exp.amount);
      setDate(exp.date.split("T")[0]);
      setEditingId(exp.id);
      setShowFormModal(true);
    } catch {
      toast.error("Failed to load expense details");
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("Delete this expense permanently?")) return;
    try {
      await deleteExpense(id);
      toast.success("Expense deleted");
      loadData();
    } catch {
      toast.error("Failed to delete expense");
    }
  };

  const handleUpdateBudget = async () => {
    const newBudget = Number(tempBudget);
    if (!newBudget || newBudget < 1000 || newBudget > 10000000) {
      toast.error("Please enter a valid budget (₹1,000 - ₹1,00,00,000)");
      return;
    }

    try {
      await api.patch("/users/me/budget", { monthlyBudget: newBudget });
      toast.success("Monthly budget updated!");
      setShowBudgetModal(false);
      loadData(); 
    } catch (err) {
      toast.error("Failed to update budget");
    }
  };

  const filteredExpenses = useMemo(() => {
    return expenses.filter((exp) => {
      const actualMember = exp.member === "self" ? "me" : exp.member;
      if (filterMember !== "all" && actualMember !== filterMember) return false;
      if (filterCategory !== "all" && exp.category !== filterCategory) return false;

      if (dateRange !== "all") {
        const expDate = new Date(exp.date);
        const [year, month] = dateRange.split("-");
        return expDate.getFullYear() === Number(year) && expDate.getMonth() + 1 === Number(month);
      }
      return true;
    });
  }, [expenses, filterMember, filterCategory, dateRange]);

  const byType = summary?.byCategory || [];
  const topCategory = byType.length ? byType.reduce((a, b) => (a.value > b.value ? a : b)).name : "—";

  const currentMonthLabel = format(new Date(), "MMMM yyyy");
  const monthOptions = useMemo(() => {
    const options = [{ value: "all", label: `All Time` }];
    const current = new Date();
    options.push({ value: format(current, "yyyy-MM"), label: `${currentMonthLabel} (Current)` });

    for (let i = 1; i <= 11; i++) {
      const date = new Date();
      date.setMonth(date.getMonth() - i);
      const value = format(date, "yyyy-MM");
      const label = format(date, "MMMM yyyy");
      options.push({ value, label });
    }
    return options;
  }, []);

  return (
    <div className="min-h-screen pb-12 lg:pb-0">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6 mb-10">
          <h1 className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-[#06b6d4] to-[#22d3ee] bg-clip-text text-transparent flex items-center gap-3">
            <Users className="w-10 h-10" />
            Family Expenses
          </h1>
          <div className="flex flex-wrap gap-3">
            <Button
              onClick={openAddModal}
              className="bg-gradient-to-r from-[#06b6d4] to-[#22d3ee] hover:from-[#0891b2] hover:to-[#06b6d4] text-white font-semibold shadow-lg"
            >
              <Plus className="w-5 h-5 mr-2" /> Add Expense
            </Button>
            <Button onClick={loadData} variant="outline" size="icon" className="rounded-xl">
              <RefreshCw className={`w-5 h-5 ${loading ? "animate-spin" : ""}`} />
            </Button>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 xs:grid-cols-2 lg:grid-cols-4 gap-5 mb-10">
          {[
            { 
              title: "Total Spent", 
              value: `₹${totalSpent.toLocaleString()}`, 
              percent: budgetPercent,
              showEdit: true 
            },
            { title: "Transactions", value: filteredExpenses.length },
            { title: "Top Category", value: topCategory },
            { title: "Average", value: `₹${filteredExpenses.length ? Math.round(totalSpent / filteredExpenses.length) : 0}` },
          ].map((stat, i) => (
            <Card key={i} className="glass-card rounded-2xl shadow-xl border-0 overflow-hidden">
              <CardContent className="p-6">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="text-sm font-medium text-cyan-700">{stat.title}</h3>
                  {stat.showEdit && (
                    <Button
                      size="sm"
                      variant="ghost"
                       className="bg-gradient-to-r from-[#06b6d4] to-[#22d3ee] hover:from-[#0891b2] hover:to-[#06b6d4] text-white font-semibold shadow-lg"
                      onClick={() => {
                        setTempBudget(monthlyBudget.toString());
                        setShowBudgetModal(true);
                      }}
                    >
                      <Edit2 className="w-4 h-4" />Set Budget
                    </Button>
                  )}
                </div>
                <p className={`text-2xl sm:text-3xl font-bold ${i === 0 ? "bg-gradient-to-r from-[#06b6d4] to-[#22d3ee] bg-clip-text text-transparent" : "text-cyan-600"}`}>
                  {stat.value}
                </p>
                {stat.percent !== undefined && (
                  <>
                    <div className="mt-4 h-3 bg-gray-200 rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${stat.percent}%` }}
                        transition={{ duration: 0.8, delay: 0.2 }}
                        className="h-full bg-gradient-to-r from-[#06b6d4] to-[#22d3ee]"
                      />
                    </div>
                    <p className="text-xs text-gray-600 mt-2">
                      {budgetPercent.toFixed(0)}% of ₹{monthlyBudget.toLocaleString()} budget
                    </p>
                  </>
                )}
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Rest of your UI (Filters, Recent Expenses, Charts) */}
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">
          {/* Filters Sidebar */}
          <div className="xl:col-span-4">
            <Card className="glass-card rounded-3xl shadow-2xl overflow-hidden">
              <CardHeader className="pb-4">
                <CardTitle className="text-2xl font-bold bg-gradient-to-r from-[#06b6d4] to-[#22d3ee] bg-clip-text text-transparent flex items-center gap-3">
                  <Filter className="w-6 h-6" />
                  Filters
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-5">
                <div>
                  <Label className="text-cyan-700 font-medium">Time Period</Label>
                  <Select value={dateRange} onValueChange={setDateRange}>
                    <SelectTrigger className="mt-2">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-white text-black">
                      {monthOptions.map((opt) => (
                        <SelectItem key={opt.value} value={opt.value}>
                          {opt.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label className="text-cyan-700 font-medium">Member</Label>
                  <Select value={filterMember} onValueChange={setFilterMember}>
                    <SelectTrigger className="mt-2">
                      <SelectValue placeholder="All Members" />
                    </SelectTrigger>
                    <SelectContent className="bg-white text-black">
                      <SelectItem value="all">All Members</SelectItem>
                      {familyMembers.map((m) => (
                        <SelectItem key={m.value} value={m.value}>
                          {m.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label className="text-cyan-700 font-medium">Category</Label>
                  <Select value={filterCategory} onValueChange={setFilterCategory}>
                    <SelectTrigger className="mt-2">
                      <SelectValue placeholder="All Categories" />
                    </SelectTrigger>
                    <SelectContent className="bg-white text-black">
                      <SelectItem value="all">All Categories</SelectItem>
                      {CATEGORIES.map((c) => (
                        <SelectItem key={c} value={c}>{c}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Column: Recent + Charts */}
          <div className="xl:col-span-8 space-y-8">
            {/* Recent Expenses */}
            <Card className="glass-card rounded-3xl shadow-2xl overflow-hidden">
              <CardHeader>
                <CardTitle className="text-2xl font-bold bg-gradient-to-r from-[#06b6d4] to-[#22d3ee] bg-clip-text text-transparent">
                  Recent Expenses
                </CardTitle>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <p className="text-center py-12 text-gray-500">Loading...</p>
                ) : filteredExpenses.length === 0 ? (
                  <p className="text-center py-12 text-gray-500 text-lg">No expenses found</p>
                ) : (
                  <div className="space-y-4">
                    {filteredExpenses.slice(0, 10).map((exp) => {
                      const displayMember = exp.member === "self" 
                        ? "Me" 
                        : familyMembers.find(m => m.value === exp.member)?.label || exp.member;

                      return (
                        <div
                          key={exp.id}
                          className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-2xl bg-white/60 backdrop-blur border border-cyan-200 hover:shadow-lg transition-all"
                        >
                          <div className="flex-1">
                            <p className="text-xl font-bold text-cyan-600">{exp.category}</p>
                            <p className="text-sm text-cyan-800 mt-1">
                              {displayMember} • {exp.event || "General"} • {format(new Date(exp.date), "dd MMM yyyy")}
                            </p>
                          </div>
                          <div className="flex items-center gap-4">
                            <span className="text-2xl font-bold text-cyan-700">₹{exp.amount.toLocaleString()}</span>
                            <div className="flex gap-2">
                              <Button size="icon" variant="ghost" onClick={() => handleEdit(exp.id)}>
                                <Edit2 className="w-5 h-5 text-cyan-600" />
                              </Button>
                              <Button size="icon" variant="ghost" onClick={() => handleDelete(exp.id)}>
                                <Trash2 className="w-5 h-5 text-red-500" />
                              </Button>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Charts */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card className="glass-card rounded-3xl shadow-2xl p-6">
                <h3 className="text-xl font-bold bg-gradient-to-r from-[#06b6d4] to-[#22d3ee] bg-clip-text text-transparent mb-4">
                  Spending by Category
                </h3>
                <ResponsiveContainer width="100%" height={280}>
                  <PieChart>
                    <Pie
                      data={byType}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      outerRadius={100}
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    >
                      {byType.map((_, i) => (
                        <Cell key={`cell-${i}`} fill={COLORS[i % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(v) => `₹${Number(v).toLocaleString()}`} />
                  </PieChart>
                </ResponsiveContainer>
              </Card>

              <Card className="glass-card rounded-3xl shadow-2xl p-6">
                <h3 className="text-xl font-bold bg-gradient-to-r from-[#06b6d4] to-[#22d3ee] bg-clip-text text-transparent mb-4">
                  Monthly Trend
                </h3>
                <ResponsiveContainer width="100%" height={280}>
                  <LineChart data={summary?.monthlyTrend || []}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e0f2fe" />
                    <XAxis dataKey="month" stroke="#0891b2" />
                    <YAxis stroke="#0891b2" />
                    <Tooltip formatter={(v) => `₹${Number(v).toLocaleString()}`} />
                    <Line
                      type="monotone"
                      dataKey="value"
                      stroke="#06b6d4"
                      strokeWidth={4}
                      dot={{ fill: "#22d3ee", r: 6 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </Card>
            </div>
          </div>
        </div>
      </div>

      {/* Add/Edit Expense Modal */}
      {showFormModal && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
          onClick={() => setShowFormModal(false)}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="w-full max-w-lg glass-card rounded-3xl shadow-2xl overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6 border-b border-cyan-300/30">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold bg-gradient-to-r from-[#06b6d4] to-[#22d3ee] bg-clip-text text-transparent">
                  {editingId ? "Edit Expense" : "Add New Expense"}
                </h2>
                <button onClick={() => setShowFormModal(false)} className="p-2 rounded-lg hover:bg-white/20 transition">
                  <X className="w-7 h-7" />
                </button>
              </div>
            </div>

            <div className="p-6 space-y-5">
              <div>
                <Label>Date</Label>
                <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="mt-2" />
              </div>
              <div>
                <Label>Member</Label>
                <Select value={member} onValueChange={setMember} disabled={loadingMembers}>
                  <SelectTrigger className="mt-2">
                    <SelectValue placeholder={loadingMembers ? "Loading..." : "Select member"} />
                  </SelectTrigger>
                  <SelectContent className="bg-white text-black">
                    {familyMembers.map((m) => (
                      <SelectItem key={m.value} value={m.value}>{m.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Category</Label>
                <Select value={category} onValueChange={setCategory}>
                  <SelectTrigger className="mt-2">
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent className="bg-white text-black">
                    {CATEGORIES.map((c) => (
                      <SelectItem key={c} value={c}>{c}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Event (Optional)</Label>
                <Input placeholder="Birthday, School fees..." value={event} onChange={(e) => setEvent(e.target.value)} className="mt-2" />
              </div>
              <div>
                <Label>Amount (₹)</Label>
                <Input type="number" value={amount} onChange={(e) => setAmount(e.target.value)} className="mt-2 text-2xl font-bold" placeholder="0" />
              </div>
            </div>

            <div className="flex justify-end gap-4 p-6 border-t border-cyan-300/30">
              <Button variant="outline" onClick={() => setShowFormModal(false)}>Cancel</Button>
              <Button
                onClick={handleSubmit}
                className="bg-gradient-to-r from-[#06b6d4] to-[#22d3ee] hover:from-[#0891b2] hover:to-[#06b6d4] text-white font-bold px-8"
                disabled={loading}
              >
                {editingId ? "Update" : "Add"} Expense
              </Button>
            </div>
          </motion.div>
        </motion.div>
      )}

      {/* Edit Budget Modal */}
      {showBudgetModal && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur"
          onClick={() => setShowBudgetModal(false)}
        >
          <motion.div
            initial={{ scale: 0.9 }}
            animate={{ scale: 1 }}
            className="bg-white rounded-3xl p-8 shadow-2xl max-w-sm w-full"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-2xl font-bold text-cyan-600 mb-6 text-center">Set Monthly Budget</h3>
            <Input
              type="number"
              value={tempBudget}
              onChange={(e) => setTempBudget(e.target.value)}
              placeholder="50000"
              className="text-3xl font-bold text-center"
              autoFocus
            />
            <div className="flex gap-3 mt-8">
              <Button variant="outline" className="flex-1" onClick={() => setShowBudgetModal(false)}>
                Cancel
              </Button>
              <Button
                onClick={handleUpdateBudget}
                className="flex-1 bg-gradient-to-r from-[#06b6d4] to-[#22d3ee] text-white font-bold"
              >
                Save Budget
              </Button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </div>
  );
}