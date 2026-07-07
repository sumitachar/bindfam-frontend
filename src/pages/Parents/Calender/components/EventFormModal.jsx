// src/components/EventFormModal.jsx
import React from "react";
import { X, Calendar, Clock, MapPin, Users, Baby, Repeat, Bell, Sparkles } from "lucide-react";
import { motion } from "framer-motion";
import { format, toZonedTime } from "date-fns-tz";

const TIMEZONE = "Asia/Kolkata";

const RECUR_OPTIONS = [
  { value: "none", label: "Does not repeat" },
  { value: "daily", label: "Daily" },
  { value: "weekly", label: "Weekly" },
  { value: "monthly", label: "Monthly" },
  { value: "yearly", label: "Yearly" },
];

const REMINDER_OPTIONS = [
  { value: 0, label: "None" },
  { value: 5, label: "5 minutes before" },
  { value: 15, label: "15 minutes before" },
  { value: 30, label: "30 minutes before" },
  { value: 60, label: "1 hour before" },
  { value: 1440, label: "1 day before" },
];

export default function EventFormModal({
  show,
  editingEvent,
  newEvent,
  setNewEvent,
  selectedDate,
  myChildren,
  inviteableMembers,
  EVENT_TYPES,
  onSave,
  onClose,
  onSuggestBestTime, 
}) {
  if (!show) return null;

  const invitedCount = newEvent.invitedMemberCodes.filter(code => code !== "none").length;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.93, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.93, opacity: 0 }}
        transition={{ type: "spring", damping: 28, stiffness: 400 }}
        className="w-full max-w-xl glass-card rounded-2xl shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header - Compact */}
        <div className="px-5 py-4 border-b" style={{ borderColor: "var(--border-soft)" }}>
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold" style={{ color: "var(--color-primary)" }}>
                {editingEvent ? "Edit Event" : "Create New Event"}
              </h2>
              <p className="text-xs mt-1" style={{ color: "var(--color-neutral)" }}>
                {format(toZonedTime(selectedDate, TIMEZONE), "EEEE, MMMM d, yyyy")}
              </p>
            </div>
            <button 
              onClick={onClose} 
              className="p-2 rounded-lg hover:bg-white/10 transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Body - Super Compact */}
        <div className="p-5 space-y-4 max-h-[68vh] overflow-y-auto scrollbar-thin">
          {/* Title */}
          <input
            type="text"
            value={newEvent.title}
            onChange={(e) => setNewEvent({ ...newEvent, title: e.target.value })}
            placeholder="Event Title *"
            className="w-full px-4 py-3 rounded-xl text-base font-medium placeholder-gray-500"
            style={{ backgroundColor: "var(--bg-input)", border: "1px solid var(--border-soft)" }}
            autoFocus
          />

          {/* Time & Type */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-medium mb-1.5 flex items-center gap-2" style={{ color: "var(--color-neutral)" }}>
                <Clock className="w-4 h-4" /> Time *
              </label>
              <input
                type="time"
                value={newEvent.time}
                onChange={(e) => setNewEvent({ ...newEvent, time: e.target.value })}
                className="w-full px-4 py-3 rounded-xl text-sm"
                style={{ backgroundColor: "var(--bg-input)", border: "1px solid var(--border-soft)" }}
              />
            </div>
            <div>
              <label className="text-xs font-medium mb-1.5 block" style={{ color: "var(--color-neutral)" }}>
                Event Type
              </label>
              <select
                value={newEvent.type}
                onChange={(e) => setNewEvent({ ...newEvent, type: e.target.value })}
                className="w-full px-4 py-3 rounded-xl text-sm"
                style={{ backgroundColor: "var(--bg-input)", border: "1px solid var(--border-soft)" }}
              >
                {Object.entries(EVENT_TYPES).map(([key, { label }]) => (
                  <option key={key} value={key}>{label}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Location */}
          <input
            type="text"
            value={newEvent.location}
            onChange={(e) => setNewEvent({ ...newEvent, location: e.target.value })}
            placeholder="Location (optional)"
            className="w-full px-4 py-3 rounded-xl text-sm"
            style={{ backgroundColor: "var(--bg-input)", border: "1px solid var(--border-soft)" }}
          />

          {/* Notes */}
          <textarea
            value={newEvent.notes}
            onChange={(e) => setNewEvent({ ...newEvent, notes: e.target.value })}
            placeholder="Add notes..."
            rows={3}
            className="w-full px-4 py-3 rounded-xl text-sm resize-none"
            style={{ backgroundColor: "var(--bg-input)", border: "1px solid var(--border-soft)" }}
          />

          {/* Repeat & Reminder */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-medium mb-1.5 flex items-center gap-2" style={{ color: "var(--color-neutral)" }}>
                <Repeat className="w-4 h-4" /> Repeat
              </label>
              <select
                value={newEvent.recurrence}
                onChange={(e) => setNewEvent({ ...newEvent, recurrence: e.target.value })}
                className="w-full px-4 py-3 rounded-xl text-sm"
                style={{ backgroundColor: "var(--bg-input)", border: "1px solid var(--border-soft)" }}
              >
                {RECUR_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-xs font-medium mb-1.5 flex items-center gap-2" style={{ color: "var(--color-neutral)" }}>
                <Bell className="w-4 h-4" /> Reminder
              </label>
              <select
                value={newEvent.reminderMinutes}
                onChange={(e) => setNewEvent({ ...newEvent, reminderMinutes: Number(e.target.value) })}
                className="w-full px-4 py-3 rounded-xl text-sm"
                style={{ backgroundColor: "var(--bg-input)", border: "1px solid var(--border-soft)" }}
              >
                {REMINDER_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Related Child */}
          {myChildren.length > 0 && (
            <div>
              <label className="text-xs font-medium mb-1.5 flex items-center gap-2" style={{ color: "var(--color-neutral)" }}>
                <Baby className="w-4 h-4" /> Related Child
              </label>
              <select
                value={newEvent.relatedChildId || ""}
                onChange={(e) => setNewEvent({ ...newEvent, relatedChildId: e.target.value || null })}
                className="w-full px-4 py-3 rounded-xl text-sm"
                style={{ backgroundColor: "var(--bg-input)", border: "1px solid var(--border-soft)" }}
              >
                <option value="">None</option>
                {myChildren.map((child) => (
                  <option key={child.subUserId} value={child.subUserId}>
                    {child.name} ({child.age || "?"})
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Invite Members - Compact Grid */}
          <div>
            <label className="text-xs font-medium mb-2 flex items-center gap-2" style={{ color: "var(--color-neutral)" }}>
              <Users className="w-4 h-4" /> Invite Family Members ({invitedCount})
            </label>
            <div className="grid grid-cols-2 gap-2">
              {inviteableMembers.map((member) => {
                const checked = newEvent.invitedMemberCodes.includes(member.userCode);
                return (
                  <label key={member.userCode} className="flex items-center gap-2.5 cursor-pointer py-2 px-3 rounded-lg hover:bg-white/5 transition">
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={(e) => {
                        setNewEvent({
                          ...newEvent,
                          invitedMemberCodes: e.target.checked
                            ? [...newEvent.invitedMemberCodes, member.userCode]
                            : newEvent.invitedMemberCodes.filter((c) => c !== member.userCode),
                        });
                      }}
                      className="w-4 h-4 rounded accent-[var(--color-primary)]"
                    />
                    <span className="text-sm">{member.name}</span>
                  </label>
                );
              })}
            </div>
          </div>

          {/* Suggest Best Time Button */}
          {!editingEvent && invitedCount > 0 && (
            <div className="pt-2">
              <button
                onClick={onSuggestBestTime}
                className="w-full px-6 py-3.5 rounded-xl font-bold text-white flex items-center justify-center gap-2 transition-all hover:scale-105 shadow-md"
                style={{
                  background: "linear-gradient(135deg, #8b5cf6 0%, #ec4899 100%)",
                }}
              >
                <Sparkles className="w-5 h-5" />
                Suggest Best Time for Everyone
              </button>
            </div>
          )}
        </div>

        {/* Footer - Exact original button text preserved */}
        <div className="flex justify-end gap-3 px-5 py-4 border-t" style={{ borderColor: "var(--border-soft)" }}>
          <button
            onClick={onClose}
            className="px-7 py-2.5 rounded-xl font-medium transition"
            style={{ backgroundColor: "var(--bg-input)" }}
          >
            Cancel
          </button>
          <button
            onClick={onSave}
            className="px-9 py-2.5 rounded-xl text-white font-bold calendar-button shadow-lg"
          >
            {editingEvent ? "Update Event" : "Create Event"}
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}