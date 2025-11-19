import React, { useState } from "react";
import { AlertTriangleIcon, XIcon } from "lucide-react";
import { Modal } from "../../components/ui/Modal";
import { Button } from "../../components/ui/Button";

interface DeleteDoctorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (hard: boolean) => Promise<void>;
  doctorName: string;
  affectedAppointments: number;
}

export function DeleteDoctorModal({
  isOpen,
  onClose,
  onConfirm,
  doctorName,
  affectedAppointments
}: DeleteDoctorModalProps) {
  const [hardDelete, setHardDelete] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleConfirm = async () => {
    setLoading(true);
    try {
      await onConfirm(hardDelete);
      onClose();
    } catch (error) {
      console.error("Delete error:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <div className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-gray-900">Delete Doctor</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <XIcon className="w-5 h-5" />
          </button>
        </div>

        <div className="mb-4">
          <AlertTriangleIcon className="w-12 h-12 text-yellow-500 mx-auto mb-4" />
          <p className="text-gray-700 mb-2">
            Are you sure you want to delete <strong>{doctorName}</strong>?
          </p>
          {affectedAppointments > 0 && (
            <p className="text-sm text-gray-600 mb-4">
              This will cancel <strong>{affectedAppointments}</strong> future appointment(s).
            </p>
          )}
        </div>

        <div className="mb-4">
          <label className="flex items-center space-x-2 cursor-pointer">
            <input
              type="checkbox"
              checked={hardDelete}
              onChange={(e) => setHardDelete(e.target.checked)}
              className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
            />
            <span className="text-sm text-gray-700">
              Permanent delete (cannot be undone)
            </span>
          </label>
          {hardDelete && (
            <p className="text-xs text-red-600 mt-2 ml-6">
              ⚠️ This will permanently delete all doctor data. Make sure to export data first.
            </p>
          )}
        </div>

        <div className="flex gap-3 justify-end">
          <Button variant="default" onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button
            variant="danger"
            onClick={handleConfirm}
            disabled={loading}
          >
            {loading ? "Deleting..." : hardDelete ? "Delete Permanently" : "Deactivate"}
          </Button>
        </div>
      </div>
    </Modal>
  );
}

