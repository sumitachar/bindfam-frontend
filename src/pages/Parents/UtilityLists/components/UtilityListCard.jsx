import { Button } from "@/components/ui/button";
import { Trash2, RotateCcw, FileCheck, X } from "lucide-react";
import { toast } from "sonner";
import { useState } from "react";

import UtilityListItem from "./UtilityListItem";
import AddItemInput from "./AddItemInput";

import {
  deleteUtilityList,
  resetUtilityList,
} from "@/api/Parents/utilityLists";
import FilteredItemsModal from "./FilteredItemsModal";

export default function UtilityListCard({ list, onChange }) {
  const [showFiltered, setShowFiltered] = useState(false);
  const [confirmAction, setConfirmAction] = useState(null); // { type: 'delete' | 'reset', message: string }

  const handleReset = async () => {
    try {
      await resetUtilityList(list.id);
      toast.success("List reset");
      onChange();
    } catch {
      toast.error("Failed to reset list");
    }
    setConfirmAction(null);
  };

  const handleDelete = async () => {
    try {
      await deleteUtilityList(list.id);
      toast.success("List deleted");
      onChange();
    } catch {
      toast.error("Failed to delete list");
    }
    setConfirmAction(null);
  };

  const sortedItems = [...list.items].sort((a, b) =>
    a.isChecked === b.isChecked ? 0 : a.isChecked ? 1 : -1
  );

  return (
    <>
      <div className="glass-card rounded-2xl p-5 shadow-xl flex flex-col h-[350px] max-w-sm">
        {/* Header */}
        <div className="flex justify-between mb-3">
          <h3 className="font-bold text-lg truncate">{list.title}</h3>

          <div className="flex gap-1">
            <Button
              size="icon"
              variant="ghost"
              onClick={() =>
                setConfirmAction({ type: "reset", message: "Reset this list?" })
              }
            >
              <RotateCcw className="w-4 h-4" />
            </Button>
            <Button
              size="icon"
              variant="ghost"
              onClick={() =>
                setConfirmAction({
                  type: "delete",
                  message: "Delete this list permanently?",
                })
              }
            >
              <Trash2 className="w-4 h-4 text-red-500" />
            </Button>
          </div>
        </div>

        {/* Items */}
        <div className="flex-1 overflow-y-auto space-y-2 pr-1">
          {sortedItems.length === 0 ? (
            <p className="text-gray-400 text-sm text-center mt-10">
              No items yet
            </p>
          ) : (
            sortedItems.map((item) => (
              <UtilityListItem key={item.id} item={item} onChange={onChange} />
            ))
          )}
        </div>

        {/* Footer */}
        <div className="pt-3 border-t flex flex-col gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowFiltered(true)}
          >
            <FileCheck className="w-4 h-4 mr-2" />
            View Completed
          </Button>

          <AddItemInput listId={list.id} onChange={onChange} />
        </div>
      </div>

      {showFiltered && (
        <FilteredItemsModal
          list={list}
          onClose={() => setShowFiltered(false)}
        />
      )}

      {/* Custom Confirmation Modal */}
      {confirmAction && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center">
          <div className="glass-card max-w-sm w-full p-6">
            <h3 className="font-bold text-lg text-bind mb-4">Confirm Action</h3>
            <p className="text-muted mb-6">{confirmAction.message}</p>
            <div className="flex justify-end gap-3">
              <Button
                variant="outline"
                className="button-secondary flex items-center gap-2"
                onClick={() => setConfirmAction(null)}
              >
                <X className="w-4 h-4" /> Cancel
              </Button>
              <Button
                className={`flex items-center gap-2 ${
                  confirmAction.type === "delete"
                    ? "cancel-button"
                    : "button-primary"
                }`}
                onClick={
                  confirmAction.type === "delete" ? handleDelete : handleReset
                }
              >
                {confirmAction.type === "delete" ? "Delete" : "Reset"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
