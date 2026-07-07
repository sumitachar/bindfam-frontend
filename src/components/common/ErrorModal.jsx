import { Button } from "@/components/ui/button";

export default function ErrorModal({ title = "Error", message, onClose }) {
  if (!message) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl w-full max-w-sm p-6">
        <h2 className="text-lg font-bold text-red-600 mb-3">
          {title}
        </h2>

        <p className="text-sm text-gray-700 dark:text-gray-200">
          {message}
        </p>

        <Button
          onClick={onClose}
          className="mt-5 w-full rounded-full button-primary"
        >
          OK
        </Button>
      </div>
    </div>
  );
}
