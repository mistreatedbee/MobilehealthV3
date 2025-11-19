import React, { useEffect, useState } from 'react';
import { TrashIcon, AlertCircleIcon, UsersIcon } from 'lucide-react';
import { adminAPI } from '../../services/api';
import { Patient } from '../../types';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import toast from 'react-hot-toast';

export function ManagePatients() {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deleting, setDeleting] = useState<string | null>(null);

  useEffect(() => {
    loadPatients();
  }, []);

  const loadPatients = async () => {
    try {
      setLoading(true);
      setError(null);
      const allPatients = await adminAPI.getAllPatients();
      setPatients(allPatients || []);
    } catch (err: any) {
      const errorMessage = err?.message || "Failed to load patients";
      console.error("Failed to load patients:", err);
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (patientId: string, patientName: string) => {
    if (!confirm(`Are you sure you want to delete ${patientName}'s account? This cannot be undone.`)) {
      return;
    }

    try {
      setDeleting(patientId);
      await adminAPI.deleteUser(patientId);
      toast.success(`Patient ${patientName} deleted successfully`);
      await loadPatients();
    } catch (err: any) {
      const errorMessage = err?.message || "Failed to delete patient";
      console.error("Failed to delete patient:", err);
      toast.error(errorMessage);
    } finally {
      setDeleting(null);
    }
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'N/A';
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return 'N/A';
      return date.toLocaleDateString();
    } catch {
      return 'N/A';
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Manage Patients</h1>
          <p className="text-gray-600 mt-1">View and manage patient accounts</p>
        </div>
        <Card className="p-6">
          <p className="text-center text-gray-500">Loading patients...</p>
        </Card>
      </div>
    );
  }

  if (error && patients.length === 0) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Manage Patients</h1>
          <p className="text-gray-600 mt-1">View and manage patient accounts</p>
        </div>
        <Card className="p-6">
          <div className="text-center py-8">
            <AlertCircleIcon className="w-12 h-12 text-red-500 mx-auto mb-4" />
            <p className="text-red-600 mb-4">{error}</p>
            <Button variant="primary" onClick={loadPatients}>
              Retry
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Manage Patients</h1>
        <p className="text-gray-600 mt-1">View and manage patient accounts</p>
      </div>

      <Card className="p-6">
        {patients.length === 0 ? (
          <div className="text-center py-12">
            <UsersIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 text-lg">No patients found</p>
            <p className="text-gray-400 text-sm mt-2">Patients will appear here once they register</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Name</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Email</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Location</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Joined</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Actions</th>
                </tr>
              </thead>

              <tbody>
                {patients.map((patient) => (
                  <tr key={patient._id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-3 px-4">
                      {patient.firstName || ''} {patient.lastName || ''}
                    </td>
                    <td className="py-3 px-4 text-gray-600">{patient.email || 'N/A'}</td>
                    <td className="py-3 px-4 text-gray-600">
                      {patient.city && patient.province ? `${patient.city}, ${patient.province}` : '-'}
                    </td>
                    <td className="py-3 px-4 text-gray-600">
                      {formatDate(patient.createdAt)}
                    </td>
                    <td className="py-3 px-4">
                      <Button
                        variant="danger"
                        size="sm"
                        onClick={() => handleDelete(patient._id, `${patient.firstName || ''} ${patient.lastName || ''}`.trim() || 'Patient')}
                        disabled={deleting === patient._id}
                      >
                        <TrashIcon className="w-4 h-4" />
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
}
