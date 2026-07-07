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
import {
  getDocuments,
  getDocumentById,
  updateDocument,
  deleteDocument,
  addDocument,
  getDocumentViewUrl,
} from "@/api/Parents/documents";
import PDFPreviewDialog from "./components/PDFPreviewDialog";

export default function Documents({ router }) {
  const { selectedEntity, isDoctor, isReadOnly } = useContext(UserContext);
  const [docTitle, setDocTitle] = useState("");
  const [notes, setNotes] = useState("");
  const [file, setFile] = useState(null);
  const [filePreview, setFilePreview] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [documents, setDocuments] = useState([]);
  const [editDocumentId, setEditDocumentId] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [isMobile, setIsMobile] = useState(false);
  const [isSmallScreen, setIsSmallScreen] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [showSecurityInfo, setShowSecurityInfo] = useState(false);
  const [previewDocumentId, setPreviewDocumentId] = useState(null);

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

  // Permission check for doctor
  useEffect(() => {
    if (isDoctor && selectedEntity && !selectedEntity.Permissions?.documents) {
      toast.error("Permission Denied", {
        description:
          "You do not have permission to access Documents for this patient.",
        className: "toast",
      });
      router.back();
    }
  }, [isDoctor, selectedEntity, router]);

  // Fetch documents when selectedEntity changes
  useEffect(() => {
    if (selectedEntity?.subUserId) {
      fetchDocuments();
    } else {
      setDocuments([]);
    }
  }, [selectedEntity]);

  useEffect(() => {
    const seen = localStorage.getItem("seen-document-security");
    if (!seen) {
      setShowSecurityInfo(true);
      localStorage.setItem("seen-document-security", "true");
    }
  }, []);

  const fetchDocuments = async () => {
    setIsLoading(true);
    try {
      const data = await getDocuments(selectedEntity.subUserId);
      setDocuments(data || []);
    } catch (err) {
      console.error("Error fetching documents:", err);
      showError(err, "Failed to fetch documents");
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
    if (!selectedEntity || !docTitle || (!file && !editDocumentId)) {
      toast.error("Missing Fields", {
        description: "Please fill all required fields.",
        className: "toast",
      });
      return;
    }

    const formData = new FormData();
    formData.append("childName", selectedEntity.name);
    formData.append("docTitle", docTitle);
    formData.append("notes", notes);
    formData.append("subUserId", selectedEntity.subUserId);
    if (file) formData.append("file", file);

    try {
      setIsLoading(true);
      setUploadProgress(0);

      if (editDocumentId) {
        const updated = await updateDocument(editDocumentId, formData);
        setDocuments(
          documents.map((doc) => (doc.id === editDocumentId ? updated : doc))
        );
        toast.success("Success", {
          description: "Document updated",
          className: "toast",
        });
      } else {
        const saved = await addDocument(formData);
        setDocuments([saved, ...documents]);
        toast.success("Success", {
          description: "Document added",
          className: "toast",
        });
      }

      // Reset form
      setDocTitle("");
      setNotes("");
      setFile(null);
      setFilePreview("");
      setShowForm(false);
      setEditDocumentId(null);
      setUploadProgress(0);
    } catch (err) {
      showError(err, "Failed to save document");
    } finally {
      setIsLoading(false);
    }
  };

  const handleEdit = async (doc) => {
    if (isReadOnly) return;
    try {
      const document = await getDocumentById(doc.id);
      setEditDocumentId(doc.id);
      setDocTitle(doc.docTitle);
      setNotes(doc.notes || "");
      setFilePreview(null);
      setFile(null);
      setShowForm(true);
    } catch (err) {
      showError(err, "Failed to load document for editing");
    }
  };

  const handleDelete = async (id) => {
    if (isReadOnly) return;

    const confirmed = window.confirm(
      "Are you sure you want to delete this document?"
    );

    if (!confirmed) return;

    const loadingToast = toast.loading("Deleting document...");

    try {
      await deleteDocument(id);
      setDocuments((prev) => prev.filter((doc) => doc.id !== id));
      toast.success("Document deleted successfully", { id: loadingToast });
    } catch (err) {
      console.error(err);
      showError(err, "Failed to delete document");
    }
  };

  const fetchDocumentUrl = async (documentId) => {
    const res = await fetch(
      `${import.meta.env.VITE_API_URL}/documents/view/${documentId}`
    );

    if (!res.ok) {
      throw new Error("Failed to get document URL");
    }

    const data = await res.json();
    return data.url; // Azure SAS URL
  };

  const handleViewPreview = async (documentId) => {
    try {
      const url = await fetchDocumentUrl(documentId);

      if (isMobile) {
        window.open(url, "_blank");
      } else {
        setPreviewUrl(url);
        setPreviewDocumentId(documentId); // ✅ store id
        setShowPreviewModal(true);
      }
    } catch (err) {
      console.error(err);
      toast.error("Unable to open document");
    }
  };

  const handleDownload = async (documentId) => {
    try {
      const url = await fetchDocumentUrl(documentId);
      window.open(url, "_blank");
    } catch (err) {
      console.error(err);
      toast.error("Unable to download document");
    }
  };

  return (
    <div className="min-h-screen w-full bg-gradient py-3 px-4 sm:px-6">
      <div className="mx-auto">
        <Card className="mb-3 glass-card border border-primary shadow-soft">
          <CardHeader>
            <div className="flex items-center justify-center gap-2">
              <h2 className="text-lg font-semibold text-text">
                Documentation of {selectedEntity?.name || "Child"}
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

              <button
                onClick={() => setShowSecurityInfo(true)}
                className="text-primary"
              >
                <Info className="w-4 h-4" />
              </button>
            </div>
          </CardHeader>
        </Card>

        {/* View Only Banner */}
        {isReadOnly && (
          <div className="bg-amber-50 border border-amber-300 text-amber-800 px-4 py-2.5 rounded-xl text-center text-sm font-medium flex items-center justify-center gap-2 mb-3">
            <Lock className="w-5 h-5" />
            <span>View Only — Editing is disabled</span>
          </div>
        )}

        {isLoading && (
          <div className="text-center py-3">
            <p className="text-sm text-primary">Loading documents...</p>
          </div>
        )}

        {/* Add Button */}
        {!isReadOnly && !showForm && !isLoading && (
          <div className="flex justify-center mt-3 mb-4">
            <Button
              className="button-primary text-text rounded-full px-5 py-2 shadow-soft hover:shadow-lg transition-all"
              onClick={() => {
                setDocTitle("");
                setNotes("");
                setFile(null);
                setFilePreview("");
                setShowForm(true);
                setEditDocumentId(null);
              }}
            >
              <PlusCircle className="w-4 h-4 mr-2" />
              Add Document
            </Button>
          </div>
        )}

        {/* Upload/Edit Form */}
        <Dialog open={showForm && !isReadOnly} onOpenChange={setShowForm}>
          <DialogContent
            className={`sm:max-w-md glass-card border border-primary shadow-soft ${
              isSmallScreen ? "p-3 max-h-[80vh]" : "p-4 max-h-[90vh]"
            } overflow-y-auto`}
          >
            <VisuallyHidden asChild>
              <DialogDescription>
                Form to {editDocumentId ? "edit" : "add"} a document for{" "}
                {selectedEntity?.name || "a child"}.
              </DialogDescription>
            </VisuallyHidden>
            <DialogHeader>
              <DialogTitle
                className={`text-text ${
                  isSmallScreen ? "text-base" : "text-lg"
                }`}
              >
                {editDocumentId ? "Edit Document" : "Add Document"}
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
                  className="bg-input border border-primary text-text"
                />
              </div>
              <div>
                <label
                  className={`block font-medium text-primary ${
                    isSmallScreen ? "text-xs" : "text-sm"
                  }`}
                >
                  Document Title <span className="text-accent">*</span>
                </label>
                <Input
                  placeholder="Document Title"
                  value={docTitle}
                  onChange={(e) => setDocTitle(e.target.value)}
                  required
                  className="bg-input border border-primary text-text"
                />
              </div>
              <div>
                <label
                  className={`block font-medium text-primary ${
                    isSmallScreen ? "text-xs" : "text-sm"
                  }`}
                >
                  Upload Document <span className="text-accent">*</span>
                </label>
                <div className="mt-2">
                  <label
                    onDrop={handleDrop}
                    onDragOver={handleDragOver}
                    onDragEnter={() => setIsDragging(true)}
                    onDragLeave={() => setIsDragging(false)}
                    className={`border-2 border-dashed rounded-lg flex flex-col items-center justify-center cursor-pointer transition-all
                      ${
                        isDragging
                          ? "border-primary bg-input/30"
                          : "border-primary bg-card"
                      }
                      ${isSmallScreen ? "h-20 p-2" : "h-28 p-3"}
                    `}
                  >
                    <input
                      type="file"
                      accept="image/*,.pdf,.doc,.docx"
                      className="hidden"
                      onChange={handleFileChange}
                      required={!editDocumentId}
                    />
                    {filePreview ? (
                      file?.type?.startsWith("image/") ? (
                        <img
                          src={filePreview}
                          alt="Preview"
                          className="w-full h-full object-cover rounded-lg"
                        />
                      ) : (
                        <div className="flex flex-col items-center">
                          <FileText
                            className={`text-primary mb-1 ${
                              isSmallScreen ? "w-6 h-6" : "w-8 h-8"
                            }`}
                          />
                          <span
                            className={`text-center ${
                              isSmallScreen ? "text-xs" : "text-sm"
                            } text-primary`}
                          >
                            {file?.name || "Document ready"}
                          </span>
                        </div>
                      )
                    ) : (
                      <div className="flex flex-col items-center">
                        <Upload
                          className={`text-primary mb-1 ${
                            isSmallScreen ? "w-6 h-6" : "w-8 h-8"
                          }`}
                        />
                        <span
                          className={`text-center ${
                            isSmallScreen ? "text-xs" : "text-sm"
                          } text-primary`}
                        >
                          Click to upload or drag and drop
                        </span>
                        <span
                          className={`mt-1 text-primary ${
                            isSmallScreen ? "text-xs" : "text-sm"
                          }`}
                        >
                          PDF, DOC, DOCX, or images
                        </span>
                      </div>
                    )}
                  </label>
                  {file && (
                    <p
                      className={`text-primary mt-1 text-center ${
                        isSmallScreen ? "text-xs" : "text-sm"
                      }`}
                    >
                      Selected: {file.name}
                    </p>
                  )}
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
              {isLoading && (
                <div className="space-y-2">
                  <Progress
                    value={uploadProgress}
                    className="w-full bg-input"
                    style={{
                      "--progress-indicator-color": "var(--color-primary)",
                    }}
                  />
                  <p
                    className={`text-center text-sm text-primary ${
                      isSmallScreen ? "text-xs" : ""
                    }`}
                  >
                    Uploading: {uploadProgress}%
                  </p>
                </div>
              )}
            </div>
            <DialogFooter>
              <Button
                onClick={handleSubmit}
                disabled={isLoading}
                className={`${
                  isLoading ? "button-primary/50" : "button-primary"
                } text-text shadow-soft hover:shadow-lg transition-all`}
              >
                {isLoading ? "Saving..." : editDocumentId ? "Update" : "Save"}
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  setShowForm(false);
                  setEditDocumentId(null);
                  setUploadProgress(0);
                }}
                className="border-primary text-primary hover:bg-input shadow-soft"
              >
                Cancel
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* PDF Preview Modal */}
        <PDFPreviewDialog
          isOpen={showPreviewModal && !isMobile}
          onOpenChange={setShowPreviewModal}
          previewUrl={previewUrl}
          fileName="document.pdf"
          onDownload={() => handleDownload(previewDocumentId)} // ✅ FIX
        />

        {/* No Documents */}
        {!isLoading && documents.length === 0 && (
          <div className="text-center py-8">
            <FileText
              className={`mx-auto mb-3 ${
                isSmallScreen ? "w-10 h-10" : "w-12 h-12"
              } text-primary`}
            />
            <p
              className={`text-primary ${
                isSmallScreen ? "text-sm" : "text-base"
              }`}
            >
              No documents found for {selectedEntity?.name || "this child"}.
            </p>
          </div>
        )}

        {/* Documents List */}
        {!isLoading && documents.length > 0 && (
          <div>
            <div className="p-3 border-b border-primary">
              <h3
                className={`font-semibold text-text ${
                  isSmallScreen ? "text-base" : "text-lg"
                }`}
              >
                Documents ({documents.length})
              </h3>
            </div>

            {/* Desktop Table */}
            <div className="hidden md:block overflow-x-auto">
              <table className="min-w-full text-sm border border-primary bg-card">
                <thead>
                  <tr className="button-primary text-text">
                    <th className="px-3 py-2 text-left">Child Name</th>
                    <th className="px-3 py-2 text-left">Title</th>
                    <th className="px-3 py-2 text-left">Notes</th>
                    <th className="px-3 py-2 text-center">File</th>
                    <th className="px-3 py-2 text-center">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {documents.map((doc, i) => (
                    <tr
                      key={doc.id}
                      className={`${
                        i % 2 === 0 ? "bg-card" : "bg-input"
                      } hover:bg-input transition-all`}
                    >
                      <td className="px-3 py-2 text-text">{doc.childName}</td>
                      <td className="px-3 py-2 font-medium text-text">
                        {doc.docTitle}
                      </td>
                      <td className="px-3 py-2 max-w-xs">
                        <div className="truncate text-muted" title={doc.notes}>
                          {doc.notes || "No notes"}
                        </div>
                      </td>
                      <td className="px-3 py-2">
                        <div className="flex gap-2 justify-center">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleViewPreview(doc.id)}
                            className="flex items-center gap-1 border-primary text-primary hover:bg-input shadow-soft"
                          >
                            <Eye
                              className={isSmallScreen ? "w-4 h-4" : "w-5 h-5"}
                            />{" "}
                            View
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDownload(doc.id)}
                            className="flex items-center gap-1 border-primary text-primary hover:bg-input shadow-soft"
                          >
                            <Download
                              className={isSmallScreen ? "w-4 h-4" : "w-5 h-5"}
                            />{" "}
                            Download
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
                                onClick={() => handleEdit(doc)}
                                className="border-primary text-primary hover:bg-input shadow-soft"
                              >
                                <Pencil
                                  className={
                                    isSmallScreen ? "w-4 h-4" : "w-5 h-5"
                                  }
                                />
                              </Button>
                              <Button
                                variant="outline"
                                size="icon"
                                onClick={() => handleDelete(doc.id)}
                                className="border-primary text-primary hover:bg-input shadow-soft"
                              >
                                <Trash2
                                  className={
                                    isSmallScreen ? "w-4 h-4" : "w-5 h-5"
                                  }
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

            {/* Mobile Cards */}
            <div className="md:hidden space-y-3">
              {documents.map((doc) => (
                <Card
                  key={doc.id}
                  className={`glass-card border border-primary ${
                    isSmallScreen ? "p-2" : "p-3"
                  }`}
                >
                  <CardContent className={isSmallScreen ? "p-2" : "pt-3"}>
                    <div
                      className={`flex justify-between items-start ${
                        isSmallScreen ? "mb-1" : "mb-2"
                      }`}
                    >
                      <h4
                        className={`font-semibold text-text ${
                          isSmallScreen ? "text-sm" : "text-base"
                        }`}
                      >
                        {doc.docTitle}
                      </h4>
                      <div className="flex gap-1">
                        {!isReadOnly && (
                          <>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleEdit(doc)}
                              className="text-primary hover:bg-input"
                            >
                              <Pencil
                                className={
                                  isSmallScreen ? "w-4 h-4" : "w-5 h-5"
                                }
                              />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleDelete(doc.id)}
                              className="text-primary hover:bg-input"
                            >
                              <Trash2
                                className={
                                  isSmallScreen ? "w-4 h-4" : "w-5 h-5"
                                }
                              />
                            </Button>
                          </>
                        )}
                      </div>
                    </div>
                    <div className={`mb-${isSmallScreen ? "1" : "2"}`}>
                      <span
                        className={`text-primary ${
                          isSmallScreen ? "text-xs" : "text-sm"
                        }`}
                      >
                        Child:
                      </span>
                      <p
                        className={`text-text ${
                          isSmallScreen ? "text-xs" : "text-sm"
                        }`}
                      >
                        {doc.childName}
                      </p>
                    </div>
                    {doc.notes && (
                      <div className={`mb-${isSmallScreen ? "1" : "2"}`}>
                        <span
                          className={`text-primary ${
                            isSmallScreen ? "text-xs" : "text-sm"
                          }`}
                        >
                          Notes:
                        </span>
                        <p
                          className={`mt-1 text-muted ${
                            isSmallScreen ? "text-xs" : "text-sm"
                          }`}
                        >
                          {doc.notes}
                        </p>
                      </div>
                    )}
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        className={`flex-1 border-primary text-primary hover:bg-input shadow-soft ${
                          isSmallScreen ? "text-xs py-1" : ""
                        }`}
                        onClick={() => handleViewPreview(doc.id)}
                      >
                        <Eye
                          className={
                            isSmallScreen ? "w-4 h-4 mr-1" : "w-5 h-5 mr-2"
                          }
                        />{" "}
                        View
                      </Button>
                      <Button
                        variant="outline"
                        className={`flex-1 border-primary text-primary hover:bg-input shadow-soft ${
                          isSmallScreen ? "text-xs py-1" : ""
                        }`}
                        onClick={() => handleDownload(doc.id)}
                      >
                        <Download
                          className={
                            isSmallScreen ? "w-4 h-4 mr-1" : "w-5 h-5 mr-2"
                          }
                        />{" "}
                        Download
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}
        <Dialog open={showSecurityInfo} onOpenChange={setShowSecurityInfo}>
          <DialogContent className="sm:max-w-md bg-gradient-to-r from-green-50 to-green-100 p-4 rounded-xl shadow-lg">
            <DialogHeader>
              <DialogTitle className="text-primary font-semibold">
                Your Data Security
              </DialogTitle>
            </DialogHeader>

            <div className="space-y-3 text-sm text-text">
              <p>
                All uploaded documents are <b>end-to-end encrypted</b> for
                security.
              </p>
              <p>Only authorized parents and doctors can access these files.</p>
              <p>
                Our system is{" "}
                <b>inspired by HIPAA and GDPR privacy principles</b> to ensure
                safe handling of medical and personal data.
              </p>
              {/* <p className="text-xs text-muted">
                *Note: This project follows security best practices and
                encryption, but it is not officially certified under HIPAA or
                GDPR.
              </p> */}
            </div>

            <DialogFooter>
              <Button
                onClick={() => setShowSecurityInfo(false)}
                className="bg-primary text-amber-800 hover:bg-primary/90"
              >
                Got it
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
