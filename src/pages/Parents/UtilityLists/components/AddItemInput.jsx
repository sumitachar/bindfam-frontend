// src/pages/Parents/UtilityLists/components/AddItemInput.jsx
import { useState, useRef } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { toast } from "sonner";
import { addUtilityItem } from "@/api/Parents/utilityLists";

export default function AddItemInput({ listId, onChange }) {
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);
  const inputRef = useRef(null);
  const [quantity, setQuantity] = useState("");

  const handleAdd = async () => {
    const trimmedTitle = text.trim();
    const trimmedQty = quantity.trim();

    if (!trimmedTitle) return;

    setLoading(true);
    try {
      await addUtilityItem(listId, {
        title: trimmedTitle,
        quantity: trimmedQty,
      });
      toast.success("Item added");
      setText("");
      setQuantity("");
      onChange();
      inputRef.current?.focus();
    } catch {
      toast.error("Failed to add item");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex gap-2 mt-4">
      <Input
        ref={inputRef}
        placeholder="Item name..."
        value={text}
        onChange={(e) => setText(e.target.value)}
        onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && handleAdd()}
        className="flex-1"
        disabled={loading}
        autoFocus
      />
      <Input
        placeholder="Quantity (e.g. 2 pcs)"
        value={quantity}
        onChange={(e) => setQuantity(e.target.value)}
        className="w-28"
        disabled={loading}
      />
      <Button
        onClick={handleAdd}
        disabled={loading || !text.trim()}
        size="icon"
      >
        <Plus className="w-5 h-5" />
      </Button>
    </div>
  );
}
