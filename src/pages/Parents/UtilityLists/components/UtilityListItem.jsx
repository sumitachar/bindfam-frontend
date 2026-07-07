// src/pages/Parents/UtilityLists/components/UtilityListItem.jsx
import { motion } from "framer-motion";
import { useState, useCallback } from "react";
import { toast } from "sonner";
import { toggleUtilityItem, deleteUtilityItem } from "@/api/Parents/utilityLists";
import { CheckCircle2, Circle, Trash2, Loader2, X } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function UtilityListItem({ item, onChange }) {
  const [localChecked, setLocalChecked] = useState(item.isChecked || false);
  const [isToggling, setIsToggling] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const isChecked = item.isChecked ?? item.checked ?? localChecked;

  const toggle = useCallback(async () => {
    if (isToggling || isDeleting) return;

    setLocalChecked(!isChecked);
    setIsToggling(true);

    try {
      await toggleUtilityItem(item.id);
      onChange();
    } catch (error) {
      setLocalChecked(isChecked);
      toast.error("Update failed");
      console.error(error);
    } finally {
      setIsToggling(false);
    }
  }, [item.id, isChecked, isToggling, isDeleting, onChange]);

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      await deleteUtilityItem(item.id);
      toast.success("Item removed");
      onChange();
    } catch (error) {
      toast.error("Delete failed");
      console.error(error);
    } finally {
      setIsDeleting(false);
      setShowDeleteModal(false);
    }
  };

  return (
    <>
      <motion.div
        layout
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, x: -20 }}
        onClick={toggle}
        className={`
          group relative flex items-center gap-3 p-3 rounded-xl cursor-pointer select-none
          border transition-all duration-200
          ${isChecked
            ? "bg-emerald-50/40 border-emerald-100/60 opacity-75"
            : "bg-white border-gray-100 hover:border-emerald-200 hover:shadow-sm"
          }
          ${isToggling || isDeleting ? "opacity-75 cursor-wait pointer-events-none" : ""}
        `}
      >
        {/* Checkbox */}
        <div className="flex-shrink-0 w-6 h-6 flex items-center justify-center">
          {isChecked ? (
            <motion.div 
              initial={{ scale: 0.5 }} 
              animate={{ scale: 1 }}
              className="bg-emerald-500 rounded-full p-0.5 shadow-sm shadow-emerald-200"
            >
              <CheckCircle2 className="w-4 h-4 text-white stroke-[3px]" />
            </motion.div>
          ) : (
            <Circle className="w-5 h-5 text-gray-300 group-hover:text-emerald-400 transition-colors stroke-[2px]" />
          )}
        </div>

        {/* Title & Quantity */}
        <div className="flex-1 flex items-center gap-2 truncate pr-6">
          <span
            className={`
              text-sm font-medium transition-all duration-300 truncate
              first-letter:uppercase capitalize-first-only 
              ${isChecked ? "text-gray-400 line-through decoration-emerald-500/30" : "text-gray-700"}
            `}
          >
            {item.title}
          </span>

          {item.quantity && (
            <span
              className={`
                text-xs text-gray-500 shrink-0
                ${isChecked ? "line-through opacity-50" : ""}
              `}
            >
              ({item.quantity})
            </span>
          )}
        </div>

        {/* Actions */}
        <div className="flex-shrink-0 flex items-center h-6">
          {isToggling || isDeleting ? (
            <Loader2 className="w-4 h-4 text-emerald-500 animate-spin" />
          ) : (
            <button
              onClick={(e) => {
                e.stopPropagation();
                setShowDeleteModal(true);
              }}
              className="opacity-0 group-hover:opacity-100 p-1.5 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 transition-all"
              title="Delete item"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          )}
        </div>
      </motion.div>

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center">
          <div className="glass-card max-w-sm w-full p-6">
            <h3 className="font-bold text-lg text-bind mb-4">Delete Item?</h3>
            <p className="text-muted mb-6">
              Are you sure you want to delete "{item.title}"?
            </p>
            <div className="flex justify-end gap-3">
              <Button
                variant="outline"
                className="button-secondary flex items-center gap-2"
                onClick={() => setShowDeleteModal(false)}
              >
                <X className="w-4 h-4" /> Cancel
              </Button>
              <Button
                className="cancel-button flex items-center gap-2"
                onClick={handleDelete}
              >
                Delete
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
