import React, { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";
import { Edit3, X, User, Calendar, UserCheck } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { calculateCurrentAge } from "@/lib/utils";
import { updateSubUser } from "@/api/Auth/auth";

const EditProfileModal = ({
  editOpened,
  setEditOpened,
  selectedEntity,
  setSelectedEntity,
  fetchData,
  loading = false,
}) => {
  const [formData, setFormData] = useState({
    name: "",
    dob: "",
    gender: "",
    age: "",
  });

  // Initialise form when modal opens
  useEffect(() => {
    if (editOpened && selectedEntity) {
      setFormData({
        name: selectedEntity.name || "",
        dob: selectedEntity.dateOfBirth || "",
        gender: selectedEntity.gender || "",
        age: selectedEntity.age || calculateCurrentAge(selectedEntity.dateOfBirth),
      });
    }
  }, [editOpened, selectedEntity]);

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const onSave = async (e) => {
    e.preventDefault();

    if (!(formData.name ?? "").trim()) {
      alert("Please enter a valid name");
      return;
    }

    const gender = (formData.gender ?? "").toLowerCase();
    if (formData.gender && !["male", "female", "other"].includes(gender)) {
      alert("Please select a valid gender (Male, Female, Other)");
      return;
    }

    if (formData.dob && isNaN(new Date(formData.dob).getTime())) {
      alert("Please enter a valid date of birth");
      return;
    }

    try {
      const updated = await updateSubUser(selectedEntity.subUserId, {
        name: formData.name,
        dateOfBirth: formData.dob,
        gender: formData.gender,
      });

      setSelectedEntity(updated);
      await fetchData();
      setEditOpened(false);
    } catch (err) {
      const msg = err.response?.data?.message || err.message || "An unknown error occurred";
      alert(`Failed to save profile: ${msg}`);
    }
  };

  if (!editOpened) return null;

  return (
    <Dialog open={editOpened} onOpenChange={setEditOpened}>
      <DialogContent className="glass-card border border-primary w-full max-w-md rounded-2xl shadow-soft p-4 max-h-[90vh] overflow-y-auto">
        <DialogTitle asChild>
          <VisuallyHidden>Edit Profile</VisuallyHidden>
        </DialogTitle>

        <div className="flex justify-between items-center mb-3">
          <h2 className="text-base font-semibold text-text flex items-center">
            <Edit3 className="w-4 h-4 mr-1 text-primary" />
            Edit Profile
          </h2>
        </div>

        <form onSubmit={onSave} className="space-y-3">
          {/* Full Name */}
          <div>
            <label className="block text-sm font-medium text-primary mb-1">
              Full Name
            </label>
            <div className="flex items-center bg-input border border-primary rounded-full px-2 py-1">
              <User className="w-4 h-4 text-primary mr-1.5 flex-shrink-0" />
              <Input
                type="text"
                value={formData.name ?? ""}
                onChange={(e) => handleChange("name", e.target.value)}
                className="w-full bg-transparent border-0 focus:ring-0 text-text text-sm"
                placeholder="Enter your full name"
                required
              />
            </div>
          </div>

          {/* Date of Birth */}
          <div>
            <label className="block text-sm font-medium text-primary mb-1">
              Date of Birth
            </label>
            <div className="flex items-center bg-input border border-primary rounded-full px-2 py-1">
              <Calendar className="w-4 h-4 text-primary mr-1.5 flex-shrink-0" />
              <Input
                type="date"
                value={formData.dob ?? ""}
                onChange={(e) => {
                  const dob = e.target.value;
                  handleChange("dob", dob);
                  handleChange("age", calculateCurrentAge(dob));
                }}
                className="w-full bg-transparent border-0 focus:ring-0 text-text text-sm"
              />
            </div>
          </div>

          {/* Gender */}
          <div>
            <label className="block text-sm font-medium text-primary mb-1">
              Gender
            </label>
            <div className="flex items-center bg-input border border-primary rounded-full px-2 py-1">
              <UserCheck className="w-4 h-4 text-primary mr-1.5 flex-shrink-0" />
              <select
                value={formData.gender ?? ""}
                onChange={(e) => handleChange("gender", e.target.value)}
                className="w-full bg-transparent border-0 focus:ring-0 text-text text-sm appearance-none"
                style={{ WebkitAppearance: "none" }}
              >
                <option value="">Select Gender</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
              </select>
            </div>
          </div>

          {/* Age (Read-only) */}
          <div>
            <label className="block text-sm font-medium text-primary mb-1">
              Age
            </label>
            <div className="flex items-center bg-input border border-primary rounded-full px-2 py-1">
              <UserCheck className="w-4 h-4 text-primary mr-1.5 flex-shrink-0" />
              <Input
                type="text"
                value={
                  formData.age && formData.age !== "Unknown" && formData.age !== ""
                    ? formData.age
                    : "Not calculated"
                }
                className="w-full bg-transparent border-0 focus:ring-0 text-text text-sm"
                readOnly
                tabIndex={-1}
              />
            </div>
          </div>

          {/* Buttons */}
          <div className="flex gap-2 pt-2">
            <Button
              type="button"
              onClick={() => setEditOpened(false)}
              className="flex-1 border border-primary text-primary hover:bg-input rounded-full text-sm"
              variant="outline"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={loading}
              className="flex-1 button-primary rounded-full text-sm hover:shadow-lg transition-all disabled:opacity-50"
            >
              {loading ? (
                <div className="flex items-center justify-center">
                  <svg
                    className="animate-spin mr-1 w-4 h-4 text-white"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
                    />
                  </svg>
                  Saving...
                </div>
              ) : (
                "Save Changes"
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default EditProfileModal;


