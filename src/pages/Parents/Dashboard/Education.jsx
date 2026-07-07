import React, { useState, useEffect, useContext } from "react";
import {
  User,
  BookOpen,
  GraduationCap,
  Calendar,
  TextQuote,
  Pencil,
  Notebook,
  PlusCircle,
  Trash2,
  Lock,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";
import { toast } from "sonner";
import { UserContext } from "@/context/UserContext";
import {
  getEducationalRecords,
  updateEducationalRecord,
  deleteEducationalRecord,
  addEducationalRecord,
} from "@/api/Parents/education";

export default function Education() {
  const { selectedEntity, isReadOnly } = useContext(UserContext);

  const [school, setSchool] = useState("");
  const [grade, setGrade] = useState("");
  const [className, setClassName] = useState("");
  const [year, setYear] = useState("");
  const [notes, setNotes] = useState("");
  const [records, setRecords] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editingRecord, setEditingRecord] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isMobile, setIsMobile] = useState(false);
  const [isSmallScreen, setIsSmallScreen] = useState(false);

  // Detect mobile device and small screen height
  useEffect(() => {
    const checkDevice = () => {
      const mobile =
        window.innerWidth < 768 ||
        /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
          navigator.userAgent
        );
      const smallScreen = window.innerHeight < 600;
      setIsMobile(mobile);
      setIsSmallScreen(smallScreen);
    };
    checkDevice();
    window.addEventListener("resize", checkDevice);
    return () => window.removeEventListener("resize", checkDevice);
  }, []);

  // Fetch educational records when selectedEntity changes
  useEffect(() => {
    if (selectedEntity?.subUserId) {
      fetchRecords();
    } else {
      setRecords([]);
      setError("No child selected.");
    }
  }, [selectedEntity]);

  const fetchRecords = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await getEducationalRecords(selectedEntity.subUserId);
      setRecords(data || []);
    } catch (error) {
      console.error("Error fetching educational records:", error);
      setError(
        error.response?.data?.message || "Failed to fetch educational records."
      );
      toast.error("Error", {
        description:
          error.response?.data?.message || "Failed to fetch educational records.",
        className: "toast",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (isReadOnly) return;

    if (!school || !grade || !className || !year) {
      toast.error("Missing Fields", {
        description: "Please fill all required fields.",
        className: "toast",
      });
      return;
    }

    const data = {
      school,
      grade,
      class: className,
      year,
      notes,
      subUserId: selectedEntity.subUserId,
    };

    try {
      setIsLoading(true);
      if (editingRecord) {
        const updatedRecord = await updateEducationalRecord(
          editingRecord.id,
          data
        );
        setRecords(
          records.map((rec) =>
            rec.id === updatedRecord.id ? updatedRecord : rec
          )
        );
        toast.success("Success", {
          description: "Education record updated",
          className: "toast",
        });
      } else {
        const newRecord = await addEducationalRecord(data);
        setRecords([newRecord, ...records]);
        toast.success("Success", {
          description: "Education record added",
          className: "toast",
        });
      }

      // Reset form
      setSchool("");
      setGrade("");
      setClassName("");
      setYear("");
      setNotes("");
      setShowForm(false);
      setEditingRecord(null);
    } catch (error) {
      console.error("Error saving educational record:", error);
      toast.error("Error", {
        description:
          error.response?.data?.message ||
          `Failed to ${editingRecord ? "update" : "add"} educational record.`,
        className: "toast",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleEdit = (record) => {
    if (isReadOnly) return;
    setSchool(record.school);
    setGrade(record.grade);
    setClassName(record.class || "");
    setYear(record.year);
    setNotes(record.notes || "");
    setEditingRecord(record);
    setShowForm(true);
  };

  const handleDelete = (id) => {
    if (isReadOnly) return;

    toast(
      {
        title: "Confirm Deletion",
        description: "Are you sure you want to delete this education record?",
        className: "toast",
        action: (
          <div className="flex gap-2">
            <Button
              onClick={async () => {
                try {
                  await deleteEducationalRecord(id);
                  setRecords(records.filter((rec) => rec.id !== id));
                  toast.success("Success", {
                    description: "Education record deleted",
                    className: "toast",
                  });
                } catch (error) {
                  console.error("Error deleting educational record:", error);
                  toast.error("Error", {
                    description:
                      error.response?.data?.message ||
                      "Failed to delete educational record.",
                    className: "toast",
                  });
                }
              }}
              className="button-primary text-text hover:shadow-lg"
            >
              Confirm
            </Button>
            <Button
              variant="outline"
              className="border-primary text-primary hover:bg-input"
            >
              Cancel
            </Button>
          </div>
        ),
      },
      { duration: 0 }
    );
  };

  return (
    <div className="min-h-screen w-full bg-gradient py-3 px-4 sm:px-6">
      <div className=" mx-auto">
        <Card className="mb-3 glass-card border border-primary shadow-soft">
          <CardHeader>
            <h2
              className={`text-lg font-semibold text-text text-center ${
                isSmallScreen ? "text-base" : ""
              }`}
            >
              Education of {selectedEntity?.name || "Child"}
            </h2>
          </CardHeader>
        </Card>

        {/* VIEW-ONLY BANNER */}
        {isReadOnly && (
          <div className="bg-amber-50 border border-amber-300 text-amber-800 px-4 py-2.5 rounded-xl text-center text-sm font-medium flex items-center justify-center gap-2 mb-3">
            <Lock className="w-5 h-5" />
            <span>View Only — Editing is disabled</span>
          </div>
        )}

        {isLoading && (
          <div className="text-center py-3">
            <p
              className={`text-sm text-primary ${
                isSmallScreen ? "text-xs" : ""
              }`}
            >
              Loading educational records...
            </p>
          </div>
        )}

        {error && (
          <div className="text-center py-3">
            <p
              className={`text-sm text-accent ${
                isSmallScreen ? "text-xs" : ""
              }`}
            >
              {error}
            </p>
          </div>
        )}

        {/* ADD BUTTON — HIDDEN IN READ-ONLY */}
        {!isReadOnly && !showForm && !isLoading && !error && (
          <div className="flex justify-center mt-3 mb-4">
            <Button
              className="button-primary text-text rounded-full px-5 py-2 shadow-soft hover:shadow-lg transition-all"
              onClick={() => {
                setSchool("");
                setGrade("");
                setClassName("");
                setYear("");
                setNotes("");
                setEditingRecord(null);
                setShowForm(true);
              }}
            >
              <PlusCircle className="w-4 h-4 mr-2" />
              Add Education Record
            </Button>
          </div>
        )}

        {/* ADD/EDIT FORM — HIDDEN IN READ-ONLY */}
        <Dialog open={showForm && !isReadOnly} onOpenChange={setShowForm}>
          <DialogContent
            className={`sm:max-w-md glass-card border border-primary shadow-soft ${
              isSmallScreen ? "p-3 max-h-[80vh]" : "p-4 max-h-[90vh]"
            } overflow-y-auto`}
          >
            <VisuallyHidden asChild>
              <DialogDescription>
                Form to {editingRecord ? "edit" : "add"} an education record for{" "}
                {selectedEntity?.name || "a child"}.
              </DialogDescription>
            </VisuallyHidden>
            <DialogHeader>
              <DialogTitle
                className={`text-text ${
                  isSmallScreen ? "text-base" : "text-lg"
                }`}
              >
                {editingRecord
                  ? "Edit Education Record"
                  : "Add Education Record"}
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-3">
              <div>
                <label
                  className={`block font-medium text-primary ${
                    isSmallScreen ? "text-xs" : "text-sm"
                  }`}
                >
                  Child
                </label>
                <Input
                  value={selectedEntity?.name || ""}
                  disabled
                  className={`bg-input border border-primary text-text ${
                    isSmallScreen ? "text-sm p-2" : ""
                  }`}
                />
              </div>
              <div>
                <label
                  className={`block font-medium text-primary ${
                    isSmallScreen ? "text-xs" : "text-sm"
                  }`}
                >
                  School / College <span className="text-accent">*</span>
                </label>
                <div className="flex items-center bg-input border border-primary rounded-lg px-3">
                  <GraduationCap
                    className={`text-primary mr-2 ${
                      isSmallScreen ? "w-4 h-4" : "w-5 h-5"
                    }`}
                  />
                  <Input
                    type="text"
                    placeholder="Enter school/college"
                    value={school}
                    onChange={(e) => setSchool(e.target.value)}
                    className={`border-none bg-transparent text-text focus:ring-0 ${
                      isSmallScreen ? "text-sm" : ""
                    }`}
                    required
                  />
                </div>
              </div>
              <div>
                <label
                  className={`block font-medium text-primary ${
                    isSmallScreen ? "text-xs" : "text-sm"
                  }`}
                >
                  Grade <span className="text-accent">*</span>
                </label>
                <div className="flex items-center bg-input border border-primary rounded-lg px-3">
                  <BookOpen
                    className={`text-primary mr-2 ${
                      isSmallScreen ? "w-4 h-4" : "w-5 h-5"
                    }`}
                  />
                  <Input
                    type="text"
                    placeholder="e.g. 5.2 or 9.2"
                    value={grade}
                    onChange={(e) => setGrade(e.target.value)}
                    className={`border-none bg-transparent text-text focus:ring-0 ${
                      isSmallScreen ? "text-sm" : ""
                    }`}
                    required
                  />
                </div>
              </div>
              <div>
                <label
                  className={`block font-medium text-primary ${
                    isSmallScreen ? "text-xs" : "text-sm"
                  }`}
                >
                  Class / Section <span className="text-accent">*</span>
                </label>
                <div className="flex items-center bg-input border border-primary rounded-lg px-3">
                  <Notebook
                    className={`text-primary mr-2 ${
                      isSmallScreen ? "w-4 h-4" : "w-5 h-5"
                    }`}
                  />
                  <Input
                    type="text"
                    placeholder="e.g. A, B.Sc"
                    value={className}
                    onChange={(e) => setClassName(e.target.value)}
                    className={`border-none bg-transparent text-text focus:ring-0 ${
                      isSmallScreen ? "text-sm" : ""
                    }`}
                    required
                  />
                </div>
              </div>
              <div>
                <label
                  className={`block font-medium text-primary ${
                    isSmallScreen ? "text-xs" : "text-sm"
                  }`}
                >
                  Year <span className="text-accent">*</span>
                </label>
                <div className="flex items-center bg-input border border-primary rounded-lg px-3">
                  <Calendar
                    className={`text-primary mr-2 ${
                      isSmallScreen ? "w-4 h-4" : "w-5 h-5"
                    }`}
                  />
                  <Input
                    type="number"
                    placeholder="Enter year"
                    value={year}
                    onChange={(e) => setYear(e.target.value)}
                    className={`border-none bg-transparent text-text focus:ring-0 ${
                      isSmallScreen ? "text-sm" : ""
                    }`}
                    required
                  />
                </div>
              </div>
              <div>
                <label
                  className={`block font-medium text-primary ${
                    isSmallScreen ? "text-xs" : "text-sm"
                  }`}
                >
                  Notes
                </label>
                <Textarea
                  placeholder="Additional info (optional)"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className={`bg-input border border-primary text-text ${
                    isSmallScreen ? "text-sm p-2 h-16" : "h-20"
                  }`}
                  rows={isSmallScreen ? 2 : 3}
                />
              </div>
            </div>
            <DialogFooter>
              <Button
                onClick={handleSubmit}
                disabled={isLoading}
                className={`${
                  isLoading ? "button-primary/50" : "button-primary"
                } text-text shadow-soft hover:shadow-lg transition-all`}
              >
                {isLoading ? "Saving..." : editingRecord ? "Update" : "Save"}
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  setShowForm(false);
                  setEditingRecord(null);
                }}
                className="border-primary text-primary hover:bg-input shadow-soft"
              >
                Cancel
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {!isLoading && !error && records.length === 0 && (
          <div className="text-center py-8">
            <BookOpen
              className={`mx-auto mb-3 ${
                isSmallScreen ? "w-10 h-10" : "w-12 h-12"
              } text-primary`}
            />
            <p
              className={`text-primary ${
                isSmallScreen ? "text-sm" : "text-base"
              }`}
            >
              No education records found for{" "}
              {selectedEntity?.name || "this child"}.
            </p>
          </div>
        )}

        {!isLoading && !error && records.length > 0 && (
          <div>
            <div className="p-3 border-b border-primary">
              <h3
                className={`font-semibold text-text ${
                  isSmallScreen ? "text-base" : "text-lg"
                }`}
              >
                Education Records ({records.length})
              </h3>
              <p
                className={`text-muted mt-1 ${
                  isSmallScreen ? "text-xs" : "text-sm"
                }`}
              >
                For {selectedEntity?.name}
              </p>
            </div>

            {/* Desktop Table View */}
            <div className="hidden md:block overflow-x-auto">
              <table className="min-w-full text-sm border border-primary bg-card">
                <thead>
                  <tr className="button-primary text-text">
                    <th className="px-3 py-2 text-left">Child Name</th>
                    <th className="px-3 py-2 text-left">School</th>
                    <th className="px-3 py-2 text-left">Grade</th>
                    <th className="px-3 py-2 text-left">Class</th>
                    <th className="px-3 py-2 text-left">Year</th>
                    <th className="px-3 py-2 text-left">Notes</th>
                    <th className="px-3 py-2 text-center">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {records.map((rec, i) => (
                    <tr
                      key={rec.id}
                      className={`${
                        i % 2 === 0 ? "bg-card" : "bg-input"
                      } hover:bg-input transition-all`}
                    >
                      <td className="px-3 py-2 text-text">
                        {selectedEntity?.name}
                      </td>
                      <td className="px-3 py-2 font-medium text-text">
                        {rec.school}
                      </td>
                      <td className="px-3 py-2 text-muted">{rec.grade}</td>
                      <td className="px-3 py-2 text-muted">{rec.class}</td>
                      <td className="px-3 py-2 text-muted">{rec.year}</td>
                      <td className="px-3 py-2 max-w-xs">
                        <div
                          className="truncate text-muted"
                          title={rec.notes}
                        >
                          {rec.notes || "No notes"}
                        </div>
                      </td>
                      <td className="px-3 py-2">
                        <div className="flex justify-center gap-2">
                          {!isReadOnly && (
                            <>
                              <Button
                                variant="outline"
                                size="icon"
                                onClick={() => handleEdit(rec)}
                                className="border-primary text-primary hover:bg-input shadow-soft"
                              >
                                <Pencil
                                  className={isSmallScreen ? "w-4 h-4" : "w-5 h-5"}
                                />
                              </Button>
                              <Button
                                variant="outline"
                                size="icon"
                                onClick={() => handleDelete(rec.id)}
                                className="border-primary text-primary hover:bg-input shadow-soft"
                              >
                                <Trash2
                                  className={isSmallScreen ? "w-4 h-4" : "w-5 h-5"}
                                />
                              </Button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile Card View */}
            <div className="md:hidden space-y-3">
              {records.map((rec) => (
                <Card
                  key={rec.id}
                  className={`glass-card border border-primary ${isSmallScreen ? "p-2" : "p-3"}`}
                >
                  <CardContent className={isSmallScreen ? "p-2" : "pt-3"}>
                    <div className={`flex justify-between items-start ${isSmallScreen ? "mb-0.5" : "mb-2"}`}>
                      <h4 className={`font-semibold text-text ${isSmallScreen ? "text-sm" : "text-base"}`}>
                        {rec.school}
                      </h4>
                      <div className="flex gap-1">
                        {!isReadOnly && (
                          <>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleEdit(rec)}
                              className="text-primary hover:bg-input"
                            >
                              <Pencil className={isSmallScreen ? "w-4 h-4" : "w-5 h-5"} />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleDelete(rec.id)}
                              className="text-primary hover:bg-input"
                            >
                              <Trash2 className={isSmallScreen ? "w-4 h-4" : "w-5 h-5"} />
                            </Button>
                          </>
                        )}
                      </div>
                    </div>
                    <div className={`mb-${isSmallScreen ? "0.5" : "2"}`}>
                      <span className={`text-primary ${isSmallScreen ? "text-xs" : "text-sm"}`}>Child:</span>
                      <p className={`text-text ${isSmallScreen ? "text-xs" : "text-sm"}`}>{selectedEntity?.name}</p>
                    </div>
                    <div className={`mb-${isSmallScreen ? "0.5" : "2"}`}>
                      <span className={`text-primary ${isSmallScreen ? "text-xs" : "text-sm"}`}>Grade:</span>
                      <p className={`text-muted ${isSmallScreen ? "text-xs" : "text-sm"}`}>{rec.grade}</p>
                    </div>
                    <div className={`mb-${isSmallScreen ? "0.5" : "2"}`}>
                      <span className={`text-primary ${isSmallScreen ? "text-xs" : "text-sm"}`}>Class:</span>
                      <p className={`text-muted ${isSmallScreen ? "text-xs" : "text-sm"}`}>{rec.class}</p>
                    </div>
                    <div className={`mb-${isSmallScreen ? "0.5" : "2"}`}>
                      <span className={`text-primary ${isSmallScreen ? "text-xs" : "text-sm"}`}>Year:</span>
                      <p className={`text-muted ${isSmallScreen ? "text-xs" : "text-sm"}`}>{rec.year}</p>
                    </div>
                    {rec.notes && (
                      <div className={`mb-${isSmallScreen ? "0.5" : "2"}`}>
                        <span className={`text-primary ${isSmallScreen ? "text-xs" : "text-sm"}`}>Notes:</span>
                        <p className={`mt-1 text-muted ${isSmallScreen ? "text-xs" : "text-sm"}`}>{rec.notes}</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}