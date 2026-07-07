import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Download, X, FileText } from "lucide-react";

const PDFPreviewDialog = ({
  isOpen,
  onOpenChange,
  previewUrl,
  fileName,
  onDownload,
}) => {
  if (!previewUrl) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[800px] w-[95vw] h-[90vh] flex flex-col p-0 overflow-hidden gap-0 border-none shadow-2xl">
        
        {/* Header */}
        <div className="p-4 sm:p-6 bg-white border-b border-slate-100">
          <DialogHeader>
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-50 rounded-lg text-blue-600">
                <FileText size={24} />
              </div>
              <div className="flex flex-col text-left">
                <DialogTitle className="text-lg font-bold text-slate-900 leading-tight">
                  {fileName || "Document Preview"}
                </DialogTitle>
                <DialogDescription className="text-slate-500 text-xs sm:text-sm">
                  You can review the document below before downloading.
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>
        </div>

        {/* PDF Viewer */}
        <div className="flex-1 bg-slate-100 relative group">
          <div className="absolute inset-0 flex items-center justify-center text-slate-400 -z-10">
            <p className="animate-pulse text-sm">Loading Preview...</p>
          </div>
          
          <iframe
            src={`${previewUrl}#toolbar=0`}
            className="w-full h-full border-none"
            title="PDF Preview"
          />
        </div>

        {/* Footer */}
        <div className="p-4 bg-white border-t border-slate-100">
          <DialogFooter className="flex flex-row items-center justify-end gap-3 sm:gap-4">
            <Button
              variant="ghost"
              className="flex-1 sm:flex-none text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-all"
              onClick={() => onOpenChange(false)}
            >
              <X className="w-4 h-4 mr-2" />
              Close
            </Button>
            
            <Button
              className="flex-1 sm:flex-none bg-blue-600 hover:bg-blue-700 text-white shadow-md shadow-blue-100 transition-all"
              onClick={onDownload}
            >
              <Download className="w-4 h-4 mr-2" />
              Download
            </Button>
          </DialogFooter>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default PDFPreviewDialog;
