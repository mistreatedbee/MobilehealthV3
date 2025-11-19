import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { appointmentAPI } from "../../services/api";
import { Appointment, Patient } from "../../types";
import { Card } from "../../components/ui/Card";
import { Button } from "../../components/ui/Button";
import { Badge } from "../../components/ui/Badge";

export function AppointmentDetail() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [appointment, setAppointment] = useState<Appointment | null>(null);
  const [patient, setPatient] = useState<Patient | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadAppointment() {
      if (!id) {
        setError("Appointment ID not found");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);
        const data = await appointmentAPI.getById(id);

        // Assuming API returns patientId as populated object
        setAppointment(data);
        setPatient(data.patientId as unknown as Patient);
      } catch (err) {
        console.error("❌ Failed to load appointment", err);
        setError("Failed to load appointment details. Please try again.");
      } finally {
        setLoading(false);
      }
    }

    loadAppointment();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-4xl mx-auto">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-gray-200 rounded w-1/3"></div>
            <div className="h-64 bg-gray-200 rounded-xl"></div>
            <div className="h-48 bg-gray-200 rounded-xl"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !appointment || !patient) {
    return (
      <Card className="p-12 text-center">
        <p className="text-gray-500">{error || "Appointment not found"}</p>
        <Button onClick={() => navigate("/doctor/dashboard")} className="mt-4">
          Back to Dashboard
        </Button>
      </Card>
    );
  }

  return (
    <div className="space-y-6">

      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Appointment Details</h1>
        <Button variant="secondary" onClick={() => navigate("/doctor/dashboard")}>
          Back
        </Button>
      </div>

      {/* Patient & Appointment Info */}
      <Card className="p-6">
        <div className="flex items-center gap-3 mb-4">
          <h2 className="text-xl font-semibold">
            {patient.firstName} {patient.lastName}
          </h2>
          <Badge
            variant={
              appointment.status === "approved"
                ? "success"
                : appointment.status === "declined"
                ? "danger"
                : "warning"
            }
          >
            {appointment.status}
          </Badge>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Appointment Info */}
          <div>
            <h3 className="font-semibold mb-3">Appointment Information</h3>
            <div className="space-y-2 text-sm">
              <p><span className="text-gray-600">Date:</span> <span className="font-medium">{new Date(appointment.date).toLocaleDateString()}</span></p>
              <p><span className="text-gray-600">Time:</span> <span className="font-medium">{appointment.time}</span></p>
              <p><span className="text-gray-600">Type:</span> <span className="font-medium capitalize">{appointment.type}</span></p>
              <p><span className="text-gray-600">Reason:</span> <span className="font-medium">{appointment.reason}</span></p>
            </div>
          </div>

          {/* Patient Contact Info */}
          <div>
            <h3 className="font-semibold mb-3">Patient Contact</h3>
            <div className="space-y-2 text-sm">
              <p><span className="text-gray-600">Email:</span> <span className="font-medium">{patient.email}</span></p>
              {patient.phone && (
                <p><span className="text-gray-600">Phone:</span> <span className="font-medium">{patient.phone}</span></p>
              )}
            </div>
          </div>
        </div>
      </Card>

      {/* Medical Profile - Fixed to display information properly */}
      <Card className="p-6">
        <h3 className="font-semibold mb-4">Patient Medical Profile</h3>

        <div className="space-y-4 text-sm">
          <p><span className="text-gray-600">Blood Type:</span> <span className="font-medium">{patient.bloodType || "Not provided"}</span></p>
          
          <div>
            <p className="text-gray-600">Allergies:</p>
            <p className="font-medium">{patient.allergies ? (Array.isArray(patient.allergies) ? patient.allergies.join(", ") : patient.allergies) : "Not provided"}</p>
          </div>
          
          <div>
            <p className="text-gray-600">Chronic Conditions:</p>
            <p className="font-medium">{patient.chronicConditions ? (Array.isArray(patient.chronicConditions) ? patient.chronicConditions.join(", ") : patient.chronicConditions) : "Not provided"}</p>
          </div>
          
          <div>
            <p className="text-gray-600">Current Medications:</p>
            <p className="font-medium">{patient.currentMedications ? (Array.isArray(patient.currentMedications) ? patient.currentMedications.join(", ") : patient.currentMedications) : "Not provided"}</p>
          </div>
          
          <div>
            <p className="text-gray-600">Past Procedures:</p>
            <p className="font-medium">{patient.pastProcedures ? (Array.isArray(patient.pastProcedures) ? patient.pastProcedures.join(", ") : patient.pastProcedures) : "Not provided"}</p>
          </div>
          
          <div>
            <p className="text-gray-600">Emergency Contact Name:</p>
            <p className="font-medium">{patient.emergencyContactName || "Not provided"}</p>
          </div>
          
          <div>
            <p className="text-gray-600">Emergency Contact Phone:</p>
            <p className="font-medium">{patient.emergencyContactPhone || "Not provided"}</p>
          </div>
        </div>
      </Card>

    </div>
  );
}
