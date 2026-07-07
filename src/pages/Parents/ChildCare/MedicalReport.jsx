import React, { useState, useEffect, useContext } from "react";
import {
  FileText,
  Upload,
  Pencil,
  Trash2,
  Download,
  Eye,
  PlusCircle,
  Lock,
  Info,
  Calendar,
  User,
  Building,
} from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useError } from "@/context/ErrorContext";
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
import { Progress } from "@/components/ui/progress";
import { toast } from "sonner";
import { UserContext } from "@/context/UserContext";
import { useNavigate } from "react-router-dom"; // ← NEW: Import useNavigate
import {
  getMedicalReports,
  addMedicalReport,
  updateMedicalReport,
  deleteMedicalReport,
} from "@/api/Parents/medical-reports";
import PDFPreviewDialog from "../Dashboard/components/PDFPreviewDialog"; // Adjust path if needed

export default function MedicalReport() { // ← REMOVED { router } prop
  const navigate = useNavigate(); // ← NEW: Get navigate function
  const { selectedEntity, isDoctor, isReadOnly } = useContext(UserContext);

  const [reportTitle, setReportTitle] = useState("");
  const [doctorName, setDoctorName] = useState("");
  const [hospitalName, setHospitalName] = useState("");
  const [reportDate, setReportDate] = useState("");
  const [notes, setNotes] = useState("");
  const [file, setFile] = useState(null);
  const [filePreview, setFilePreview] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [reports, setReports] = useState([]);
  const [editReportId, setEditReportId] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [previewReportId, setPreviewReportId] = useState(null);
  const [isMobile, setIsMobile] = useState(false);
  const [isSmallScreen, setIsSmallScreen] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [showSecurityInfo, setShowSecurityInfo] = useState(false);

  const { showError } = useError();

  // Device detection
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

  // Permission check for doctor - FIXED: router.back() → navigate(-1)
  useEffect(() => {
    if (isDoctor && selectedEntity && !selectedEntity.permissions?.medicalReports) {
      toast.error("Permission Denied", {
        description: "You do not have permission to access Medical Reports.",
        className: "toast",
      });
      navigate(-1); 
    }
  }, [isDoctor, selectedEntity, navigate]); // ← Added navigate to dependencies

  // Fetch reports
  useEffect(() => {
    if (selectedEntity?.subUserId) {
      fetchReports();
    } else {
      setReports([]);
    }
  }, [selectedEntity]);

  // Security info once
  useEffect(() => {
    const seen = localStorage.getItem("seen-medicalreport-security");
    if (!seen) {
      setShowSecurityInfo(true);
      localStorage.setItem("seen-medicalreport-security", "true");
    }
  }, []);

  const fetchReports = async () => {
    setIsLoading(true);
    try {
      const data = await getMedicalReports(selectedEntity.subUserId);
      setReports(data || []);
    } catch (err) {
      showError(err, "Failed to fetch medical reports");
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileChange = (e) => {
    if (isReadOnly) return;
    const selectedFile = e.target.files[0];
    setFile(selectedFile);
    if (selectedFile) {
      const reader = new FileReader();
      reader.onload = (event) => setFilePreview(event.target.result);
      reader.readAsDataURL(selectedFile);
    } else {
      setFilePreview("");
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    if (isReadOnly) return;
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile) {
      setFile(droppedFile);
      const reader = new FileReader();
      reader.onload = (event) => setFilePreview(event.target.result);
      reader.readAsDataURL(droppedFile);
    }
  };

  const handleDragOver = (e) => e.preventDefault();

  const handleSubmit = async () => {
    if (isReadOnly) return;
    if (!selectedEntity || !reportTitle || (!file && !editReportId)) {
      toast.error("Missing Fields", {
        description: "Please fill all required fields.",
      });
      return;
    }

    const formData = new FormData();
    formData.append("subUserId", selectedEntity.subUserId);
    formData.append("reportTitle", reportTitle);
    if (doctorName) formData.append("doctorName", doctorName);
    if (hospitalName) formData.append("hospitalName", hospitalName);
    if (reportDate) formData.append("reportDate", reportDate);
    if (notes) formData.append("notes", notes);
    if (file) formData.append("file", file);

    try {
      setIsLoading(true);
      setUploadProgress(0);

      let updatedReports;
      if (editReportId) {
        const updated = await updateMedicalReport(editReportId, formData);
        updatedReports = reports.map((r) => (r.id === editReportId ? updated : r));
        toast.success("Medical report updated successfully");
      } else {
        const saved = await addMedicalReport(formData);
        updatedReports = [saved, ...reports];
        toast.success("Medical report added successfully");
      }

      setReports(updatedReports);

      // Reset form
      resetForm();
    } catch (err) {
      showError(err, "Failed to save medical report");
    } finally {
      setIsLoading(false);
    }
  };

  const resetForm = () => {
    setReportTitle("");
    setDoctorName("");
    setHospitalName("");
    setReportDate("");
    setNotes("");
    setFile(null);
    setFilePreview("");
    setShowForm(false);
    setEditReportId(null);
    setUploadProgress(0);
  };

  const handleEdit = (report) => {
    if (isReadOnly) return;
    setEditReportId(report.id);
    setReportTitle(report.reportTitle);
    setDoctorName(report.doctorName || "");
    setHospitalName(report.hospitalName || "");
    setReportDate(report.reportDate ? report.reportDate.split("T")[0] : "");
    setNotes(report.notes || "");
    setFile(null);
    setFilePreview("");
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (isReadOnly) return;
    if (!window.confirm("Are you sure you want to delete this medical report?")) return;

    try {
      await deleteMedicalReport(id);
      setReports((prev) => prev.filter((r) => r.id !== id));
      toast.success("Medical report deleted");
    } catch (err) {
      showError(err, "Failed to delete report");
    }
  };

  const fetchReportUrl = async (reportId) => {
    const res = await fetch(`${import.meta.env.VITE_API_URL}/medical-reports/view/${reportId}`);
    if (!res.ok) throw new Error("Failed to get URL");
    const data = await res.json();
    return data.url;
  };

  const handleViewPreview = async (reportId) => {
    try {
      const url = await fetchReportUrl(reportId);
      if (isMobile) {
        window.open(url, "_blank");
      } else {
        setPreviewUrl(url);
        setPreviewReportId(reportId);
        setShowPreviewModal(true);
      }
    } catch (err) {
      toast.error("Unable to open report");
    }
  };

  const handleDownload = async (reportId) => {
    try {
      const url = await fetchReportUrl(reportId);
      window.open(url, "_blank");
    } catch (err) {
      toast.error("Unable to download report");
    }
  };

  return (
    <div className="min-h-screen w-full bg-gradient py-3 px-4 sm:px-6">
      <div className="mx-auto">
        <Card className="mb-3 glass-card border border-primary shadow-soft">
          <CardHeader>
            <div className="flex items-center justify-center gap-2">
              <h2 className="text-lg font-semibold text-text">
                Medical Reports of {selectedEntity?.name || "Child"}
              </h2>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <button className="text-primary">
                      <Lock className="w-4 h-4" />
                    </button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Files are encrypted for your privacy.</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
              <button onClick={() => setShowSecurityInfo(true)} className="text-primary">
                <Info className="w-4 h-4" />
              </button>
            </div>
          </CardHeader>
        </Card>

        {isReadOnly && (
          <div className="bg-amber-50 border border-amber-300 text-amber-800 px-4 py-2.5 rounded-xl text-center text-sm font-medium flex items-center justify-center gap-2 mb-3">
            <Lock className="w-5 h-5" />
            <span>View Only — Editing is disabled</span>
          </div>
        )}

        {isLoading && !showForm && (
          <div className="text-center py-3">
            <p className="text-sm text-primary">Loading reports...</p>
          </div>
        )}

        {!isReadOnly && !showForm && !isLoading && (
          <div className="flex justify-center mt-3 mb-4">
            <Button
              className="button-primary text-text rounded-full px-5 py-2 shadow-soft hover:shadow-lg transition-all"
              onClick={() => {
                resetForm();
                setShowForm(true);
              }}
            >
              <PlusCircle className="w-4 h-4 mr-2" />
              Add Medical Report
            </Button>
          </div>
        )}

        {/* Add / Edit Form */}
        <Dialog open={showForm && !isReadOnly} onOpenChange={setShowForm}>
          <DialogContent
            className={`sm:max-w-md glass-card border border-primary shadow-soft overflow-y-auto ${
              isSmallScreen ? "p-3 max-h-[80vh]" : "p-4 max-h-[90vh]"
            }`}
          >
            <VisuallyHidden asChild>
              <DialogDescription>
                Form to {editReportId ? "edit" : "add"} a medical report.
              </DialogDescription>
            </VisuallyHidden>
            <DialogHeader>
              <DialogTitle className={`text-text ${isSmallScreen ? "text-base" : "text-lg"}`}>
                {editReportId ? "Edit" : "Add"} Medical Report
              </DialogTitle>
            </DialogHeader>

            <div className="space-y-3">
              <div>
                <label className={`block font-medium text-primary ${isSmallScreen ? "text-xs" : "text-sm"}`}>
                  Child
                </label>
                <Input value={selectedEntity?.name || ""} disabled className="bg-input border border-primary text-text" />
              </div>

              <div>
                <label className={`block font-medium text-primary ${isSmallScreen ? "text-xs" : "text-sm"}`}>
                  Report Title <span className="text-accent">*</span>
                </label>
                <Input
                  placeholder="e.g., Blood Test Results"
                  value={reportTitle}
                  onChange={(e) => setReportTitle(e.target.value)}
                  className="bg-input border border-primary text-text"
                />
              </div>

              <div>
                <label className={`block font-medium text-primary ${isSmallScreen ? "text-xs" : "text-sm"}`}>
                  <User className="inline w-4 h-4 mr-1" />
                  Doctor Name (optional)
                </label>
                <Input
                  placeholder="Doctor name"
                  value={doctorName}
                  onChange={(e) => setDoctorName(e.target.value)}
                  className="bg-input border border-primary text-text"
                />
              </div>

              <div>
                <label className={`block font-medium text-primary ${isSmallScreen ? "text-xs" : "text-sm"}`}>
                  <Building className="inline w-4 h-4 mr-1" />
                  Hospital / Clinic (optional)
                </label>
                <Input
                  placeholder="Hospital name"
                  value={hospitalName}
                  onChange={(e) => setHospitalName(e.target.value)}
                  className="bg-input border border-primary text-text"
                />
              </div>

              <div>
                <label className={`block font-medium text-primary ${isSmallScreen ? "text-xs" : "text-sm"}`}>
                  <Calendar className="inline w-4 h-4 mr-1" />
                  Report Date (optional)
                </label>
                <Input
                  type="date"
                  value={reportDate}
                  onChange={(e) => setReportDate(e.target.value)}
                  className="bg-input border border-primary text-text"
                />
              </div>

              <div>
                <label className={`block font-medium text-primary ${isSmallScreen ? "text-xs" : "text-sm"}`}>
                  Upload Report File <span className="text-accent">*</span>
                </label>
                <div className="mt-2">
                  <label
                    onDrop={handleDrop}
                    onDragOver={handleDragOver}
                    onDragEnter={() => setIsDragging(true)}
                    onDragLeave={() => setIsDragging(false)}
                    className={`border-2 border-dashed rounded-lg flex flex-col items-center justify-center cursor-pointer transition-all
                      ${isDragging ? "border-primary bg-input/30" : "border-primary bg-card"}
                      ${isSmallScreen ? "h-20 p-2" : "h-28 p-3"}
                    `}
                  >
                    <input
                      type="file"
                      accept="image/*,.pdf,.doc,.docx"
                      className="hidden"
                      onChange={handleFileChange}
                      required={!editReportId}
                    />
                    {filePreview ? (
                      file?.type?.startsWith("image/") ? (
                        <img src={filePreview} alt="Preview" className="w-full h-full object-cover rounded-lg" />
                      ) : (
                        <div className="flex flex-col items-center">
                          <FileText className={`text-primary mb-1 ${isSmallScreen ? "w-6 h-6" : "w-8 h-8"}`} />
                          <span className={`text-center ${isSmallScreen ? "text-xs" : "text-sm"} text-primary`}>
                            {file?.name}
                          </span>
                        </div>
                      )
                    ) : (
                      <div className="flex flex-col items-center">
                        <Upload className={`text-primary mb-1 ${isSmallScreen ? "w-6 h-6" : "w-8 h-8"}`} />
                        <span className={`text-center ${isSmallScreen ? "text-xs" : "text-sm"} text-primary`}>
                          Click to upload or drag & drop
                        </span>
                        <span className={`mt-1 text-primary ${isSmallScreen ? "text-xs" : "text-sm"}`}>
                          PDF, DOC, DOCX, images
                        </span>
                      </div>
                    )}
                  </label>
                  {file && (
                    <p className={`text-primary mt-1 text-center ${isSmallScreen ? "text-xs" : "text-sm"}`}>
                      Selected: {file.name}
                    </p>
                  )}
                </div>
              </div>

              <div>
                <label className={`block font-medium text-primary ${isSmallScreen ? "text-xs" : "text-sm"}`}>
                  Notes (optional)
                </label>
                <Textarea
                  placeholder="Additional information"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className={`bg-input border border-primary text-text ${isSmallScreen ? "text-sm p-2 h-16" : "h-20"}`}
                  rows={isSmallScreen ? 2 : 3}
                />
              </div>

              {isLoading && (
                <div className="space-y-2">
                  <Progress value={uploadProgress} className="w-full bg-input" />
                  <p className="text-center text-sm text-primary">Uploading: {uploadProgress}%</p>
                </div>
              )}
            </div>

            <DialogFooter>
              <Button
                onClick={handleSubmit}
                disabled={isLoading}
                className={`${isLoading ? "button-primary/50" : "button-primary"} text-text shadow-soft hover:shadow-lg transition-all`}
              >
                {isLoading ? "Saving..." : editReportId ? "Update" : "Save"}
              </Button>
              <Button
                variant="outline"
                onClick={() => setShowForm(false)}
                className="border-primary text-primary hover:bg-input shadow-soft"
              >
                Cancel
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Preview Modal */}
        <PDFPreviewDialog
          isOpen={showPreviewModal && !isMobile}
          onOpenChange={setShowPreviewModal}
          previewUrl={previewUrl}
          fileName="medical-report.pdf"
          onDownload={() => handleDownload(previewReportId)}
        />

        {/* No Reports */}
        {!isLoading && reports.length === 0 && (
          <div className="text-center py-8">
            <FileText className={`mx-auto mb-3 ${isSmallScreen ? "w-10 h-10" : "w-12 h-12"} text-primary`} />
            <p className={`text-primary ${isSmallScreen ? "text-sm" : "text-base"}`}>
              No medical reports found for {selectedEntity?.name || "this child"}.
            </p>
          </div>
        )}

        {/* Reports List */}
        {!isLoading && reports.length > 0 && (
          <div>
            <div className="p-3 border-b border-primary">
              <h3 className={`font-semibold text-text ${isSmallScreen ? "text-base" : "text-lg"}`}>
                Medical Reports ({reports.length})
              </h3>
            </div>

            {/* Desktop Table */}
            <div className="hidden md:block overflow-x-auto">
              <table className="min-w-full text-sm border border-primary bg-card">
                <thead>
                  <tr className="button-primary text-text">
                    <th className="px-3 py-2 text-left">Title</th>
                    <th className="px-3 py-2 text-left">Doctor</th>
                    <th className="px-3 py-2 text-left">Hospital</th>
                    <th className="px-3 py-2 text-left">Date</th>
                    <th className="px-3 py-2 text-left">Notes</th>
                    <th className="px-3 py-2 text-center">File</th>
                    <th className="px-3 py-2 text-center">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {reports.map((report, i) => (
                    <tr
                      key={report.id}
                      className={`${i % 2 === 0 ? "bg-card" : "bg-input"} hover:bg-input transition-all`}
                    >
                      <td className="px-3 py-2 font-medium text-text">{report.reportTitle}</td>
                      <td className="px-3 py-2 text-text">{report.doctorName || "-"}</td>
                      <td className="px-3 py-2 text-text">{report.hospitalName || "-"}</td>
                      <td className="px-3 py-2 text-text">
                        {report.reportDate ? new Date(report.reportDate).toLocaleDateString() : "-"}
                      </td>
                      <td className="px-3 py-2 max-w-xs">
                        <div className="truncate text-muted" title={report.notes}>
                          {report.notes || "No notes"}
                        </div>
                      </td>
                      <td className="px-3 py-2">
                        <div className="flex gap-2 justify-center">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleViewPreview(report.id)}
                            className="flex items-center gap-1 border-primary text-primary hover:bg-input shadow-soft"
                          >
                            <Eye className="w-5 h-5" /> View
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDownload(report.id)}
                            className="flex items-center gap-1 border-primary text-primary hover:bg-input shadow-soft"
                          >
                            <Download className="w-5 h-5" /> Download
                          </Button>
                        </div>
                      </td>
                      <td className="px-3 py-2">
                        <div className="flex justify-center gap-2">
                          {!isReadOnly && (
                            <>
                              <Button
                                variant="outline"
                                size="icon"
                                onClick={() => handleEdit(report)}
                                className="border-primary text-primary hover:bg-input shadow-soft"
                              >
                                <Pencil className="w-5 h-5" />
                              </Button>
                              <Button
                                variant="outline"
                                size="icon"
                                onClick={() => handleDelete(report.id)}
                                className="border-primary text-primary hover:bg-input shadow-soft"
                              >
                                <Trash2 className="w-5 h-5" />
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

            {/* Mobile Cards */}
            <div className="md:hidden space-y-3">
              {reports.map((report) => (
                <Card key={report.id} className={`glass-card border border-primary ${isSmallScreen ? "p-2" : "p-3"}`}>
                  <CardContent className={isSmallScreen ? "p-2" : "pt-3"}>
                    <div className="flex justify-between items-start mb-2">
                      <h4 className={`font-semibold text-text ${isSmallScreen ? "text-sm" : "text-base"}`}>
                        {report.reportTitle}
                      </h4>
                      <div className="flex gap-1">
                        {!isReadOnly && (
                          <>
                            <Button variant="ghost" size="icon" onClick={() => handleEdit(report)} className="text-primary hover:bg-input">
                              <Pencil className={isSmallScreen ? "w-4 h-4" : "w-5 h-5"} />
                            </Button>
                            <Button variant="ghost" size="icon" onClick={() => handleDelete(report.id)} className="text-primary hover:bg-input">
                              <Trash2 className={isSmallScreen ? "w-4 h-4" : "w-5 h-5"} />
                            </Button>
                          </>
                        )}
                      </div>
                    </div>

                    {(report.doctorName || report.hospitalName || report.reportDate) && (
                      <div className="text-sm space-y-1 mb-2">
                        {report.doctorName && (
                          <p className="text-text">
                            <User className="inline w-4 h-4 mr-1 text-primary" />
                            {report.doctorName}
                          </p>
                        )}
                        {report.hospitalName && (
                          <p className="text-text">
                            <Building className="inline w-4 h-4 mr-1 text-primary" />
                            {report.hospitalName}
                          </p>
                        )}
                        {report.reportDate && (
                          <p className="text-text">
                            <Calendar className="inline w-4 h-4 mr-1 text-primary" />
                            {new Date(report.reportDate).toLocaleDateString()}
                          </p>
                        )}
                      </div>
                    )}

                    {report.notes && (
                      <div className="mb-2">
                        <span className={`text-primary ${isSmallScreen ? "text-xs" : "text-sm"}`}>Notes:</span>
                        <p className={`mt-1 text-muted ${isSmallScreen ? "text-xs" : "text-sm"}`}>{report.notes}</p>
                      </div>
                    )}

                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        className={`flex-1 border-primary text-primary hover:bg-input shadow-soft ${isSmallScreen ? "text-xs py-1" : ""}`}
                        onClick={() => handleViewPreview(report.id)}
                      >
                        <Eye className={isSmallScreen ? "w-4 h-4 mr-1" : "w-5 h-5 mr-2"} />
                        View
                      </Button>
                      <Button
                        variant="outline"
                        className={`flex-1 border-primary text-primary hover:bg-input shadow-soft ${isSmallScreen ? "text-xs py-1" : ""}`}
                        onClick={() => handleDownload(report.id)}
                      >
                        <Download className={isSmallScreen ? "w-4 h-4 mr-1" : "w-5 h-5 mr-2"} />
                        Download
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Security Info Dialog */}
        <Dialog open={showSecurityInfo} onOpenChange={setShowSecurityInfo}>
          <DialogContent className="sm:max-w-md bg-gradient-to-r from-green-50 to-green-100 p-4 rounded-xl shadow-lg">
            <DialogHeader>
              <DialogTitle className="text-primary font-semibold">Your Data Security</DialogTitle>
            </DialogHeader>
            <div className="space-y-3 text-sm text-text">
              <p>All uploaded medical reports are <b>end-to-end encrypted</b> for security.</p>
              <p>Only authorized parents and doctors can access these files.</p>
              <p>Our system follows strict privacy principles inspired by HIPAA and GDPR.</p>
            </div>
            <DialogFooter>
              <Button onClick={() => setShowSecurityInfo(false)} className="bg-primary text-white hover:bg-primary/90">
                Got it
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}