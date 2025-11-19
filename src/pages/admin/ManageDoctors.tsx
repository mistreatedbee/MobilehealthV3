import React, { useEffect, useState } from 'react';
import { CheckIcon, XIcon, TrashIcon } from 'lucide-react';
import { doctorAPI, adminAPI } from '../../services/api';
import { Doctor } from '../../types';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { DeleteDoctorModal } from './DeleteDoctorModal';
import toast from 'react-hot-toast';

export function ManageDoctors() {
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [selectedDoctor, setSelectedDoctor] = useState<Doctor | null>(null);
  const [affectedAppointments, setAffectedAppointments] = useState(0);

  useEffect(() => {
    loadDoctors();
  }, []);

  const loadDoctors = async () => {
    try {
      setLoading(true);
      // Load all doctors including pending ones
      const allDoctors = await adminAPI.getAllDoctors(true);
      // Filter to show active doctors (pending, approved, rejected) but not deleted
      const activeDoctors = allDoctors.filter(d => d.isActive !== false && !d.deletedAt);
      // Sort: pending first, then approved, then rejected
      activeDoctors.sort((a, b) => {
        const statusOrder = { pending: 0, approved: 1, rejected: 2 };
        return (statusOrder[a.status as keyof typeof statusOrder] || 3) - 
               (statusOrder[b.status as keyof typeof statusOrder] || 3);
      });
      setDoctors(activeDoctors);
    } catch (err) {
      console.log("Failed to load doctors:", err);
      toast.error("Failed to load doctors");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteClick = async (doctor: Doctor) => {
    // Fetch affected appointments count (you might want to add an endpoint for this)
    setSelectedDoctor(doctor);
    setAffectedAppointments(0); // You can fetch this from an API endpoint
    setDeleteModalOpen(true);
  };

  const handleDeleteConfirm = async (hard: boolean) => {
    if (!selectedDoctor) return;

    try {
      const result = await adminAPI.deleteDoctor(selectedDoctor._id, hard);
      toast.success(result.message || "Doctor deleted successfully");
      await loadDoctors();
      setDeleteModalOpen(false);
      setSelectedDoctor(null);
    } catch (error: any) {
      toast.error(error.message || "Failed to delete doctor");
    }
  };

  const handleApprove = async (doctorId: string) => {
    try {
      await doctorAPI.updateStatus(doctorId, "approved");
      toast.success("Doctor approved successfully!");
      await loadDoctors();
    } catch (error: any) {
      toast.error(error.message || "Failed to approve doctor");
    }
  };

  const handleReject = async (doctorId: string) => {
    if (confirm("Are you sure you want to reject this doctor application?")) {
      try {
        await doctorAPI.updateStatus(doctorId, "rejected");
        toast.success("Doctor application rejected");
        await loadDoctors();
      } catch (error: any) {
        toast.error(error.message || "Failed to reject doctor");
      }
    }
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, 'default' | 'success' | 'warning' | 'danger'> = {
      pending: 'warning',
      approved: 'success',
      rejected: 'danger'
    };
    return <Badge variant={variants[status]}>{status}</Badge>;
  };

  if (loading) return <p className="text-center mt-8 text-gray-500">Loading...</p>;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Manage Doctors</h1>
        <p className="text-gray-600 mt-1">Review and approve doctor applications</p>
      </div>

      <Card className="p-6">
        <div className="space-y-4">
          {doctors.map(doctor => (
            <div key={doctor._id} className="border border-gray-200 rounded-lg p-4">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-lg font-semibold">
                      Dr. {doctor.firstName} {doctor.lastName}
                    </h3>
                    {getStatusBadge(doctor.status)}
                  </div>
                  <p className="text-blue-600 font-medium">{doctor.specialty}</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                
                <div>
                  <h4 className="text-sm font-medium text-gray-700 mb-2">Contact</h4>
                  <p className="text-sm text-gray-600">Email: {doctor.email}</p>
                  {doctor.phone && <p className="text-sm text-gray-600">Phone: {doctor.phone}</p>}
                </div>

                <div>
                  <h4 className="text-sm font-medium text-gray-700 mb-2">Practice Details</h4>
                  <p className="text-sm text-gray-600">{doctor.city}, {doctor.province}</p>
                  <p className="text-sm text-gray-600">Clinic: {doctor.clinicName}</p>
                  <p className="text-sm text-gray-600">Experience: {doctor.yearsOfExperience} years</p>
                </div>

                <div>
                  <h4 className="text-sm font-medium text-gray-700 mb-2">Credentials</h4>
                  <p className="text-sm text-gray-600">Registration #: {doctor.registrationNumber}</p>
                </div>

                <div>
                  <h4 className="text-sm font-medium text-gray-700 mb-2">Application Date</h4>
                  <p className="text-sm text-gray-600">
                    {doctor.createdAt 
                      ? new Date(doctor.createdAt).toLocaleDateString() 
                      : 'N/A'}
                  </p>
                </div>

              </div>

              <div className="flex gap-2 mt-4">
                {doctor.status === "pending" && (
                  <>
                    <Button variant="primary" size="sm" onClick={() => handleApprove(doctor._id)}>
                      <CheckIcon className="w-4 h-4 mr-1" /> Approve
                    </Button>
                    <Button variant="danger" size="sm" onClick={() => handleReject(doctor._id)}>
                      <XIcon className="w-4 h-4 mr-1" /> Reject
                    </Button>
                  </>
                )}
                {doctor.isActive && (
                  <Button
                    variant="danger"
                    size="sm"
                    onClick={() => handleDeleteClick(doctor)}
                  >
                    <TrashIcon className="w-4 h-4 mr-1" /> Delete
                  </Button>
                )}
              </div>

            </div>
          ))}
        </div>
      </Card>

      {selectedDoctor && (
        <DeleteDoctorModal
          isOpen={deleteModalOpen}
          onClose={() => {
            setDeleteModalOpen(false);
            setSelectedDoctor(null);
          }}
          onConfirm={handleDeleteConfirm}
          doctorName={`Dr. ${selectedDoctor.firstName} ${selectedDoctor.lastName}`}
          affectedAppointments={affectedAppointments}
        />
      )}
    </div>
  );
}
