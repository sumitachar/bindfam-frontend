// src/pages/Parents/UtilityLists/UtilityLists.jsx
import React, { useEffect, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Plus, RefreshCw } from "lucide-react";

import UtilityListCard from "./components/UtilityListCard";
import AddListModal from "./components/AddListModal";
import { getAllUtilityLists } from "@/api/Parents/utilityLists";

export default function UtilityLists() {
  const [lists, setLists] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);

  const loadLists = async () => {
  setLoading(true);
  try {
    const res = await getAllUtilityLists();
    // Normalize: ensure every item has .isChecked and map to .checked if needed
    const normalized = (res || []).map(list => ({
      ...list,
      items: list.items.map(item => ({
        ...item,
        checked: item.isChecked, // ← Add alias for backward compatibility
      }))
    }));
    setLists(normalized);
  } catch {
    toast.error("Failed to load lists");
  } finally {
    setLoading(false);
  }
};

  useEffect(() => {
    loadLists();
  }, []);

  return (
    <div className="min-h-screen px-4 py-8 max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-10">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-cyan-500 to-sky-400 bg-clip-text text-transparent">
          Utility Lists
        </h1>

        <div className="flex gap-3">
          <Button onClick={() => setShowAddModal(true)}>
            <Plus className="w-5 h-5 mr-2" />
            New List
          </Button>
          <Button variant="outline" size="icon" onClick={loadLists} disabled={loading}>
            <RefreshCw className={`w-5 h-5 ${loading ? "animate-spin" : ""}`} />
          </Button>
        </div>
      </div>

      {loading ? (
        <p className="text-center text-gray-500 py-20">Loading your lists...</p>
      ) : lists.length === 0 ? (
        <div className="text-center py-20">
          <p className="text-gray-500 text-lg mb-6">No utility lists yet</p>
          <Button onClick={() => setShowAddModal(true)}>
            <Plus className="w-5 h-5 mr-2" />
            Create Your First List
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
          {lists.map((list) => (
            <UtilityListCard key={list.id} list={list} onChange={loadLists} />
          ))}
        </div>
      )}

      {showAddModal && (
        <AddListModal
          onClose={() => setShowAddModal(false)}
          onChange={loadLists}
        />
      )}
    </div>
  );
}