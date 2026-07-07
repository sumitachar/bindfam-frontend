// src/pages/Parents/UtilityLists/components/FilteredItemsModal.jsx
import { Button } from "@/components/ui/button";
import { X, Download, Loader2, Check } from "lucide-react";
import UtilityListPDF from "./UtilityListPDF";
import { PDFDownloadLink } from "@react-pdf/renderer";

export default function FilteredItemsModal({ list, onClose }) {
  const checkedItems = list.items.filter(i => i.isChecked || i.checked);

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl w-full max-w-md p-6 shadow-2xl animate-in fade-in zoom-in duration-200">
        
        {/* Header */}
        <div className="flex justify-between items-center mb-5">
          <div>
            <h3 className="font-bold text-xl text-gray-800">
              Completed Items
            </h3>
            <p className="text-xs text-emerald-600 font-medium">
              {checkedItems.length} items from "{list.title}"
            </p>
          </div>
          <Button 
            size="icon" 
            variant="ghost" 
            onClick={onClose}
            className="rounded-full hover:bg-gray-100"
          >
            <X className="w-5 h-5" />
          </Button>
        </div>

        {/* List Container with Custom Scrollbar */}
        <div className="max-h-[350px] overflow-y-auto space-y-2 mb-6 pr-1 custom-scrollbar">
          {checkedItems.length === 0 ? (
            <div className="py-10 text-center">
              <p className="text-gray-400 text-sm italic">
                No items have been completed yet.
              </p>
            </div>
          ) : (
            checkedItems.map(item => (
              <div
                key={item.id}
                className="p-3 rounded-xl bg-emerald-50/50 border border-emerald-100 flex items-center justify-between group"
              >
                <div className="flex items-center gap-3">
                  <div className="bg-emerald-500 rounded-full p-0.5">
                    <Check className="w-3 h-3 text-white stroke-[4px]" />
                  </div>
                  <span className="text-sm font-semibold text-emerald-900 first-letter:uppercase">
                    {item.title}
                  </span>
                </div>
                
                {item.quantity && (
                  <span className="text-xs font-medium px-2 py-0.5 bg-white border border-emerald-200 rounded-full text-emerald-700">
                    qty: {item.quantity}
                  </span>
                )}
              </div>
            ))
          )}
        </div>

        {/* Footer Actions */}
        <div className="flex flex-col sm:flex-row justify-end gap-3 pt-4 border-t border-gray-100">
          <Button 
            variant="ghost" 
            onClick={onClose}
            className="font-semibold text-gray-500 hover:text-gray-700"
          >
            Close
          </Button>

          {checkedItems.length > 0 && (
            <PDFDownloadLink
              document={
                <UtilityListPDF list={list} items={checkedItems} />
              }
              fileName={`${list.title}-completed.pdf`}
              className="w-full sm:w-auto"
            >
              {({ loading }) => (
                <Button 
                  disabled={loading}
                  className="w-full sm:w-auto bg-emerald-600 hover:bg-emerald-700 text-white font-bold shadow-lg shadow-emerald-200"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Preparing...
                    </>
                  ) : (
                    <>
                      <Download className="w-4 h-4 mr-2" />
                      Download PDF
                    </>
                  )}
                </Button>
              )}
            </PDFDownloadLink>
          )}
        </div>
      </div>
    </div>
  );
}