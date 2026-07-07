import React from "react";
import { LogIn } from "lucide-react";

const AdminUserActivity = ({
  items,
  total,
  page,
  limit,
  onPrev,
  onNext,
}) => {
  return (
    <div className="bg-card rounded-2xl p-6 shadow-soft border border-soft">
      <h2 className="text-xl font-semibold mb-6 flex items-center gap-3">
        <LogIn className="w-6 h-6 text-primary" />
        User Activity Logs
      </h2>

      {items.length === 0 ? (
        <p className="text-muted text-center py-8">No activity found</p>
      ) : (
        <>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-soft">
                  <th className="text-left py-3 px-4">User Code</th>
                  <th className="text-left py-3 px-4">Role</th>
                  <th className="text-left py-3 px-4">Module</th>
                  <th className="text-left py-3 px-4">Purpose</th>
                  <th className="text-left py-3 px-4">IP</th>
                  <th className="text-left py-3 px-4">Device</th>
                  <th className="text-left py-3 px-4">Time</th>
                </tr>
              </thead>

              <tbody>
                {items.map((log) => (
                  <tr
                    key={log.id}
                    className="border-b border-soft hover:bg-input/50 transition"
                  >
                    <td className="py-3 px-4 font-mono">
                      {log.userCode || "—"}
                    </td>

                    <td className="py-3 px-4">
                      <span className="px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        {log.role?.toUpperCase()}
                      </span>
                    </td>

                    <td className="py-3 px-4">{log.module}</td>

                    <td className="py-3 px-4">
                      <span className="px-2 py-1 rounded-full text-xs bg-green-100 text-green-800">
                        {log.purpose}
                      </span>
                    </td>

                    <td className="py-3 px-4 font-mono text-muted">
                      {log.ipAddress || "N/A"}
                    </td>

                    <td className="py-3 px-4 text-muted truncate max-w-xs">
                      {log.userAgent || "N/A"}
                    </td>

                    <td className="py-3 px-4">
                      {new Date(log.createdAt).toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="flex items-center justify-between mt-6">
            <span className="text-sm text-muted">
              Showing {(page - 1) * limit + 1}–
              {Math.min(page * limit, total)} of {total}
            </span>

            <div className="flex gap-2">
              <button
                disabled={page === 1}
                onClick={onPrev}
                className="px-3 py-1 rounded-lg border border-soft disabled:opacity-50"
              >
                Prev
              </button>

              <button
                disabled={page * limit >= total}
                onClick={onNext}
                className="px-3 py-1 rounded-lg border border-soft disabled:opacity-50"
              >
                Next
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default AdminUserActivity;
