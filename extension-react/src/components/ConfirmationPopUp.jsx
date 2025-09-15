import React from "react";

function ConfirmationPopUp({
  message,
  confirmText = "Yes",
  cancelText = "Cancel",
  onConfirm,
  onCancel,
  confirmColor = "red", // default style for delete, can be "green" for redeem
}) {
  // Pick Tailwind classes based on confirmColor
  const confirmButtonClass =
    confirmColor === "green"
      ? "bg-green-500 hover:bg-green-600"
      : "bg-red-500 hover:bg-red-600";

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
      <div className="bg-white p-6 rounded shadow-lg w-80">
        <p className="mb-4 text-lg font-medium text-gray-700 text-center leading-relaxed">
          {message}
        </p>
        <div className="flex justify-end gap-2">
          <button
            onClick={onCancel}
            className="bg-gray-400 text-white px-3 py-1 rounded hover:bg-gray-500"
          >
            {cancelText}
          </button>
          <button
            onClick={onConfirm}
            className={`${confirmButtonClass} text-white px-3 py-1 rounded`}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}

export default ConfirmationPopUp;
