import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { patientAPI, appointmentAPI } from "../../services/api";
import { Patient, Appointment } from "../../types";
import { Card } from "../../components/ui/Card";
import { Badge } from "../../components/ui/Badge";
import { Button } from "../../components/ui/Button";

export function PatientProfile() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [patient, setPatient] = useState<Patient | null>(null);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      if (!id) return;
      try {
        setLoading(true);

        const p = await patientAPI.getById(id);
        setPatient(p);

        const appts = await appointmentAPI.getByPatient(id);
        if (Array.isArray(appts)) {
          setAppointments(appts);
        }
      } catch (err) {
        console.error("❌ Error loading patient profile:", err);
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, [id]);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-40">
        <div className="animate-spin h-8 w-8 border-2 border-green-500 border-t-transparent rounded-full"></div>
      </div>
    );
  }

  if (!patient) {
    return (
      <div className="p-6 text-center">
        <p className="text-gray-500">Patient not found.</p>
        <Button onClick={() => navigate("/doctor/patients")} className="mt-4">
          Back
        </Button>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-8">

      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">
          {patient.firstName} {patient.lastName}
        </h1>
        <Button variant="secondary" onClick={() => navigate("/doctor/patients")}>
          Back
        </Button>
      </div>

      {/* Patient Info */}
      <Card className="p-6 space-y-4">
        <h2 className="font-semibold text-lg">Patient Details</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <Detail label="Email" value={patient.email} />
          <Detail label="Phone" value={patient.phone} fallback="Not provided" />
          <Detail label="Gender" value={patient.gender} fallback="Not provided" />
          <Detail label="City/Province" value={`${patient.city || "—"}, ${patient.province || "—"}`} />
        </div>
      </Card>

      {/* Medical Profile */}
      <Card className="p-6 space-y-4">
        <h2 className="font-semibold text-lg">Medical Profile</h2>
        <Detail label="Blood Type" value={patient.bloodType} fallback="Not provided" />

        <ArrayField label="Allergies" value={patient.allergies} />
        <ArrayField label="Chronic Conditions" value={patient.chronicConditions} />
        <ArrayField label="Current Medications" value={patient.currentMedications} />
        <ArrayField label="Past Procedures" value={patient.pastProcedures} />

        <Detail
          label="Emergency Contact"
          value={`${patient.emergencyContactName || "Not provided"} (${patient.emergencyContactPhone || "No phone"})`}
        />
      </Card>

      {/* Appointment History */}
      <Card className="p-6">
        <h2 className="font-semibold text-lg mb-4">Appointment History</h2>

        {appointments.length === 0 ? (
          <p className="text-gray-500 text-sm">No past appointments.</p>
        ) : (
          <table className="w-full text-sm border-t">
            <thead>
              <tr className="border-b bg-gray-50">
                <th className="text-left px-3 py-2">Date</th>
                <th className="text-left px-3 py-2">Type</th>
                <th className="text-left px-3 py-2">Status</th>
              </tr>
            </thead>
            <tbody>
              {appointments.map((appt) => (
                <tr key={appt._id} className="border-b">
                  <td className="px-3 py-2">{new Date(appt.date).toLocaleDateString()}</td>
                  <td className="px-3 py-2 capitalize">{appt.type}</td>
                  <td className="px-3 py-2">
                    <Badge
                      variant={
                        appt.status === "completed"
                          ? "success"
                          : appt.status === "approved"
                          ? "info"
                          : appt.status === "cancelled"
                          ? "danger"
                          : "warning"
                      }
                    >
                      {appt.status}
                    </Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </Card>
    </div>
  );
}

function Detail({ label, value, fallback }: { label: string; value: any; fallback?: string }) {
  return (
    <p><span className="text-gray-600">{label}:</span> {value || fallback || "—"}</p>
  );
}

function ArrayField({ label, value }: { label: string; value?: string[] }) {
  return (
    <div>
      <p className="text-gray-600">{label}:</p>
      <p className="font-medium">
        {value && value.length > 0 ? value.join(", ") : "Not provided"}
      </p>
    </div>
  );
}
