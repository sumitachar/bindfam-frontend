// src/pages/Parents/UtilityLists/components/AddListModal.jsx
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { createUtilityList } from "@/api/Parents/utilityLists";

export default function AddListModal({ onClose, onChange }) {
  const [title, setTitle] = useState("");
  const [purpose, setPurpose] = useState("");
  const [loading, setLoading] = useState(false);

  const handleCreate = async () => {
    if (!title.trim()) {
      toast.error("List title is required");
      return;
    }

    setLoading(true);
    try {
      await createUtilityList({
        title: title.trim(),
        purpose: purpose.trim() || null,
      });
      toast.success("List created successfully");
      setTitle("");
      setPurpose("");
      onChange(); // Reload lists
      onClose();
    } catch {
      toast.error("Failed to create list");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md glass-card p-6">
        <DialogHeader>
          <DialogTitle>Create New Utility List</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div>
            <label className="text-sm font-medium">Title *</label>
            <Input
              placeholder="e.g. Grocery List, Medicine Tracker"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              autoFocus
            />
          </div>

          <div>
            <label className="text-sm font-medium">Purpose (optional)</label>
            <Input
              placeholder="e.g. monthly shopping, daily meds"
              value={purpose}
              onChange={(e) => setPurpose(e.target.value)}
            />
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button variant="outline" onClick={onClose} disabled={loading}>
              Cancel
            </Button>
            <Button onClick={handleCreate} disabled={loading || !title.trim()} className='button-primary'>
              {loading ? "Creating..." : "Create List"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}