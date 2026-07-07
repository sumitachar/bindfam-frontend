// src/pages/Admin/ManageUsers.jsx
import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Users,
  Search,
  ChevronLeft,
  ChevronRight,
  Edit,
  UserCheck,
  UserX,
  MoreVertical,
  PlusCircle,
  Trash2,
  X,
} from "lucide-react";
import {
  getAdminUsers,
  createAdminUser,
  updateAdminUser,
  deleteAdminUser,
  toggleAdminUserStatus,
} from "@/api/Admin/admin";

const ITEMS_PER_PAGE = 10;

function ManageUsers() {
  const [users, setUsers] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [loading, setLoading] = useState(true);

  // Modal states
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState("add"); // "add" | "edit"
  const [currentUser, setCurrentUser] = useState({
    name: "",
    email: "",
    mobile: "",
    password: "", // Added for new user
    role: "parent",
    isActive: true,
  });
  const [modalLoading, setModalLoading] = useState(false);
  const [modalError, setModalError] = useState("");

  // Password validation error
  const [passwordError, setPasswordError] = useState("");

  // Fetch users
  const loadUsers = async () => {
    setLoading(true);
    try {
      const params = {
        page,
        limit: ITEMS_PER_PAGE,
        search: search.trim() || undefined,
        role: roleFilter !== "all" ? roleFilter : undefined,
        status: statusFilter !== "all" ? statusFilter : undefined,
      };

      const data = await getAdminUsers(params);
console.log("TOTAL:", data.total);

      setUsers(data.items || []);
      setTotal(data.total || 0);
    } catch (err) {
      console.error("Failed to load users:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, [page, search, roleFilter, statusFilter]);

  useEffect(() => {
    setPage(1);
  }, [search, roleFilter, statusFilter]);

  const totalPages = Math.ceil(total / ITEMS_PER_PAGE);

  // ────────────────────────────────────────────────
  //  Modal: Open for Add / Edit
  // ────────────────────────────────────────────────
  const handleOpenModal = (mode = "add", user = null) => {
    setModalMode(mode);
    setModalError("");
    setPasswordError(""); // Reset password error

    if (mode === "edit" && user) {
      setCurrentUser({
        id: user.id,
        name: user.name || "",
        email: user.email || "",
        mobile: user.mobile || "",
        password: "", // Don't pre-fill password on edit
        role: user.role || "parent",
        isActive: user.isActive !== false,
      });
    } else {
      setCurrentUser({
        name: "",
        email: "",
        mobile: "",
        password: "",
        role: "parent",
        isActive: true,
      });
    }

    setShowModal(true);
  };

  // ────────────────────────────────────────────────
  //  Validate password (only for add mode)
  // ────────────────────────────────────────────────
  const validatePassword = () => {
    if (modalMode === "edit") return true; // Password not required on edit

    const pass = currentUser.password?.trim() || "";

    if (!pass) {
      setPasswordError("Password is required");
      return false;
    }

    if (pass.length < 6) {
      setPasswordError("Password must be at least 6 characters long");
      return false;
    }

    setPasswordError("");
    return true;
  };

  // ────────────────────────────────────────────────
  //  Modal: Submit Add / Edit
  // ────────────────────────────────────────────────
  const handleModalSubmit = async () => {
    if (!validatePassword()) return;

    setModalLoading(true);
    setModalError("");

    try {
      if (modalMode === "add") {
        await createAdminUser(currentUser);
      } else {
        // Remove empty password from update payload
        const updateData = { ...currentUser };
        if (!updateData.password?.trim()) {
          delete updateData.password;
        }
        await updateAdminUser(currentUser.id, updateData);
      }

      setShowModal(false);
      loadUsers();
    } catch (err) {
      console.error(err);
      setModalError(
        err.response?.data?.message || "Something went wrong. Try again."
      );
    } finally {
      setModalLoading(false);
    }
  };

  // ────────────────────────────────────────────────
  //  Delete User
  // ────────────────────────────────────────────────
  const handleDelete = async (userId) => {
    if (!window.confirm("Are you sure you want to delete this user?")) return;

    try {
      await deleteAdminUser(userId);
      loadUsers();
    } catch (err) {
      console.error("Delete failed:", err);
      alert(err.response?.data?.message || "Failed to delete user");
    }
  };

  // ────────────────────────────────────────────────
  //  Toggle Active/Inactive Status
  // ────────────────────────────────────────────────
  const toggleStatus = async (user) => {
    try {
      await toggleAdminUserStatus(user.id, !user.isActive);
      loadUsers();
    } catch (err) {
      console.error("Status toggle failed:", err);
    }
  };

  const getRoleClass = (role) => {
    const map = {
      admin: "bg-purple-100 text-purple-800",
      doctor: "bg-blue-100 text-blue-800",
      parent: "bg-green-100 text-green-800",
      "sub-user": "bg-amber-100 text-amber-800",
    };
    return map[role] || "bg-gray-100 text-gray-800";
  };

  const getStatusClass = (isActive) => {
    return isActive
      ? "bg-green-100 text-green-800"
      : "bg-red-100 text-red-800";
  };

  return (
    <div className="space-y-8 pb-16">
      {/* Header + Filters + Add Button */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 flex-wrap">
        <div>
          <h1 className="text-3xl md:text-4xl font-bold text-gradient">
            Manage Users
          </h1>
          <p className="text-muted mt-2">
            Add, edit, delete and manage platform users
          </p>
        </div>

        <div className="flex flex-wrap gap-4 items-center">
          <button
            onClick={() => handleOpenModal("add")}
            className="flex items-center gap-2 px-5 py-2.5 button-primary rounded-xl hover:opacity-90 transition shadow-md"
          >
            <PlusCircle size={18} />
            Add New User
          </button>

          <div className="relative min-w-[280px]">
            <input
              type="text"
              placeholder="Search name, email..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-soft bg-input focus:outline-none focus:ring-2 focus:ring-primary/50"
            />
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted pointer-events-none" />
          </div>

          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="px-4 py-2.5 rounded-xl border border-soft bg-input min-w-[150px]"
          >
            <option value="all">All Roles</option>
            <option value="admin">Admin</option>
            <option value="doctor">Doctor</option>
            <option value="parent">Parent</option>
            <option value="sub-user">Sub-user</option>
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2.5 rounded-xl border border-soft bg-input min-w-[150px]"
          >
            <option value="all">All Status</option>
            <option value="true">Active</option>
            <option value="false">Inactive</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="bg-card rounded-2xl shadow-soft border border-soft overflow-hidden">
        {loading ? (
          <div className="py-20 flex flex-col items-center justify-center text-muted">
            <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mb-4"></div>
            <p>Loading users...</p>
          </div>
        ) : users.length === 0 ? (
          <div className="py-20 text-center text-muted">
            No users found matching your filters
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-sm min-w-[1000px]">
                <thead>
                  <tr className="border-b border-soft bg-muted/30">
                    <th className="text-left py-4 px-6 font-medium">Name</th>
                    <th className="text-left py-4 px-6 font-medium">Role</th>
                    <th className="text-left py-4 px-6 font-medium">Email</th>
                    <th className="text-left py-4 px-6 font-medium hidden md:table-cell">
                      Phone
                    </th>
                    <th className="text-left py-4 px-6 font-medium hidden lg:table-cell">
                      Joined
                    </th>
                    <th className="text-left py-4 px-6 font-medium">Status</th>
                    <th className="text-right py-4 px-6 font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((user) => (
                    <tr
                      key={user.id}
                      className="border-b border-soft hover:bg-input/50 transition-colors"
                    >
                      <td className="py-4 px-6 font-medium">{user.name}</td>

                      <td className="py-4 px-6">
                        <span
                          className={`inline-block px-2.5 py-1 rounded-full text-xs font-medium ${getRoleClass(
                            user.role
                          )}`}
                        >
                          {user.role.toUpperCase()}
                        </span>
                      </td>

                      <td className="py-4 px-6 text-muted truncate max-w-[220px]">
                        {user.email || "—"}
                      </td>

                      <td className="py-4 px-6 text-muted hidden md:table-cell">
                        {user.mobile || "—"}
                      </td>

                      <td className="py-4 px-6 text-muted hidden lg:table-cell">
                        {user.createdAt
                          ? new Date(user.createdAt).toLocaleDateString()
                          : "—"}
                      </td>

                      <td className="py-4 px-6">
                        <button
                          onClick={() => toggleStatus(user)}
                          className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium transition-colors ${
                            user.isActive
                              ? "bg-green-100 text-green-800 hover:bg-green-200"
                              : "bg-red-100 text-red-800 hover:bg-red-200"
                          }`}
                        >
                          {user.isActive ? (
                            <>
                              <UserCheck size={14} /> Active
                            </>
                          ) : (
                            <>
                              <UserX size={14} /> Inactive
                            </>
                          )}
                        </button>
                      </td>

                      <td className="py-4 px-6 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => handleOpenModal("edit", user)}
                            className="p-2 rounded-lg hover:bg-primary/10 text-primary transition-colors"
                            title="Edit user"
                          >
                            <Edit size={18} />
                          </button>

                          <button
                            onClick={() => handleDelete(user.id)}
                            className="p-2 rounded-lg hover:bg-red-100 text-red-600 transition-colors"
                            title="Delete user"
                          >
                            <Trash2 size={18} />
                          </button>

                          <button
                            className="p-2 rounded-lg hover:bg-gray-200 text-muted transition-colors"
                            title="More actions"
                          >
                            <MoreVertical size={18} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination - Same style as AdminDashboard */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between mt-6 px-6 py-4 bg-muted/20 border-t border-soft">
                <span className="text-sm text-muted">
                  Showing {(page - 1) * ITEMS_PER_PAGE + 1}–
                  {Math.min(page * ITEMS_PER_PAGE, total)} of {total}
                </span>

                <div className="flex gap-2">
                  <button
                    disabled={page === 1}
                    onClick={() => setPage((p) => p - 1)}
                    className="px-3 py-1 rounded-lg border border-soft disabled:opacity-50"
                  >
                    Prev
                  </button>

                  <button
                    disabled={page >= totalPages}
                    onClick={() => setPage((p) => p + 1)}
                    className="px-3 py-1 rounded-lg border border-soft disabled:opacity-50"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Add / Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-card rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-soft">
              <h3 className="text-xl font-semibold">
                {modalMode === "add" ? "Add New User" : "Edit User"}
              </h3>
              <button
                onClick={() => setShowModal(false)}
                className="p-2 hover:bg-input rounded-full transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            {/* Body */}
            <div className="p-6 space-y-5">
              {modalError && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm">
                  {modalError}
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-muted mb-1">
                  Full Name
                </label>
                <input
                  type="text"
                  value={currentUser.name}
                  onChange={(e) =>
                    setCurrentUser({ ...currentUser, name: e.target.value })
                  }
                  className="w-full px-4 py-2.5 rounded-xl border border-soft bg-input focus:outline-none focus:ring-2 focus:ring-primary/50"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-muted mb-1">
                  Email
                </label>
                <input
                  type="email"
                  value={currentUser.email}
                  onChange={(e) =>
                    setCurrentUser({ ...currentUser, email: e.target.value })
                  }
                  className="w-full px-4 py-2.5 rounded-xl border border-soft bg-input focus:outline-none focus:ring-2 focus:ring-primary/50"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-muted mb-1">
                  Mobile Number
                </label>
                <input
                  type="tel"
                  value={currentUser.mobile}
                  onChange={(e) =>
                    setCurrentUser({ ...currentUser, mobile: e.target.value })
                  }
                  className="w-full px-4 py-2.5 rounded-xl border border-soft bg-input focus:outline-none focus:ring-2 focus:ring-primary/50"
                />
              </div>

              {/* Password - Only required for Add */}
              {modalMode === "add" && (
                <div>
                  <label className="block text-sm font-medium text-muted mb-1">
                    Password
                  </label>
                  <input
                    type="password"
                    value={currentUser.password}
                    onChange={(e) => {
                      setCurrentUser({ ...currentUser, password: e.target.value });
                      setPasswordError(""); // Clear error on change
                    }}
                    className="w-full px-4 py-2.5 rounded-xl border border-soft bg-input focus:outline-none focus:ring-2 focus:ring-primary/50"
                  />
                  {passwordError && (
                    <p className="text-red-500 text-sm mt-1">{passwordError}</p>
                  )}
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-muted mb-1">
                  Role
                </label>
                <select
                  value={currentUser.role}
                  onChange={(e) =>
                    setCurrentUser({ ...currentUser, role: e.target.value })
                  }
                  className="w-full px-4 py-2.5 rounded-xl border border-soft bg-input focus:outline-none focus:ring-2 focus:ring-primary/50"
                >
                  <option value="parent">Parent</option>
                  <option value="doctor">Doctor</option>
                  <option value="admin">Admin</option>
                  <option value="sub-user">Sub-user</option>
                </select>
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="isActive"
                  checked={currentUser.isActive}
                  onChange={(e) =>
                    setCurrentUser({
                      ...currentUser,
                      isActive: e.target.checked,
                    })
                  }
                  className="w-5 h-5 rounded border-soft text-primary focus:ring-primary"
                />
                <label htmlFor="isActive" className="text-sm font-medium">
                  Account is Active
                </label>
              </div>
            </div>

            {/* Footer */}
            <div className="flex justify-end gap-3 p-6 border-t border-soft bg-muted/20">
              <button
                onClick={() => setShowModal(false)}
                className="px-5 py-2.5 rounded-xl border border-soft hover:bg-input transition"
                disabled={modalLoading}
              >
                Cancel
              </button>

              <button
                onClick={handleModalSubmit}
                disabled={modalLoading || (modalMode === "add" && !!passwordError)}
                className="px-6 py-2.5 button-primary rounded-xl hover:opacity-90 transition flex items-center gap-2 disabled:opacity-50"
              >
                {modalLoading && (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                )}
                {modalMode === "add" ? "Create User" : "Save Changes"}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}

export default ManageUsers;