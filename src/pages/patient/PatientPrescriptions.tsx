import React, { useEffect, useState } from "react";
import { FileTextIcon } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { prescriptionAPI, doctorAPI, appointmentAPI } from "../../services/api";
import { Prescription, Doctor, Appointment } from "../../types";
import { Card } from "../../components/ui/Card";

export function PatientPrescriptions() {
  const { user } = useAuth();
  const [prescriptions, setPrescriptions] = useState<Prescription[]>([]);
  const [doctors, setDoctors] = useState<Record<string, Doctor>>({});
  const [appointments, setAppointments] = useState<Record<string, Appointment>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      if (!user) return;

      try {
        const patientId = user._id;

        const list = await prescriptionAPI.getByPatient(patientId);

        setPrescriptions(
          list.sort((a, b) => new Date(b.issuedAt).getTime() - new Date(a.issuedAt).getTime())
        );

        const doctorMap: Record<string, Doctor> = {};
        const apptMap: Record<string, Appointment> = {};

        for (const p of list) {
          // ✅ Load doctor data only if not already loaded AND ID is string
          if (typeof p.doctorId === "string" && !doctorMap[p.doctorId]) {
            try {
              doctorMap[p.doctorId] = await doctorAPI.getById(p.doctorId);
            } catch (err) {
  console.log("Failed loading doctor:", p.doctorId, err);
}
          }

          // ✅ Load appointment data if needed
          if (typeof p.appointmentId === "string" && !apptMap[p.appointmentId]) {
            try {
              apptMap[p.appointmentId] = await appointmentAPI.getById(p.appointmentId);
            } catch (err) {
  console.log("Failed loading appointment:", p.appointmentId, err);
}
          }
        }

        setDoctors(doctorMap);
        setAppointments(apptMap);

      } catch (err) {
        console.log("Error loading prescriptions:", err);
      }

      setLoading(false);
    }

    loadData();
  }, [user]);

  if (loading) return <p className="text-center mt-8 text-gray-500">Loading...</p>;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">My Prescriptions</h1>
        <p className="text-gray-600 mt-1">View your prescription history</p>
      </div>

      {prescriptions.length === 0 ? (
        <Card className="p-12 text-center">
          <FileTextIcon className="w-12 h-12 mx-auto mb-3 text-gray-400" />
          <p className="text-gray-500">No prescriptions yet</p>
        </Card>
      ) : (
        <div className="space-y-4">
          {prescriptions.map(p => {
            const id = p._id;

            // ✅ Correct doctor resolution — supports populated OR string
            const doctor =
              typeof p.doctorId === "object"
                ? (p.doctorId as Doctor)
                : doctors[p.doctorId];

            // ✅ Correct appointment resolution
            const appt =
              typeof p.appointmentId === "object"
                ? (p.appointmentId as Appointment)
                : appointments[p.appointmentId];

            return (
              <Card key={id} className="p-6">
                <div className="flex justify-between mb-4">
                  <div>
                    <h3 className="text-lg font-semibold">
                      {doctor ? `Dr. ${doctor.firstName} ${doctor.lastName}` : "Doctor info unavailable"}
                    </h3>
                    <p className="text-sm text-gray-600">{doctor?.specialty || "Specialty unavailable"}</p>
                    <p className="text-sm text-gray-500 mt-1">
                      Issued: {new Date(p.issuedAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>

                {appt && (
                  <div className="bg-gray-50 p-3 rounded-lg mb-4">
                    <p className="text-sm text-gray-600">
                      Appointment: {new Date(appt.date).toLocaleDateString()} at {appt.time}
                    </p>
                  </div>
                )}

                <div className="space-y-3">
                  <h4 className="font-semibold text-gray-900">Medications:</h4>
                  {p.medications.map((m, i) => (
                    <div key={i} className="border-l-4 border-blue-500 pl-4 py-2 space-y-1">
                      <p className="font-medium text-gray-900">{m.name}</p>
                      <p className="text-sm text-gray-600">Dosage: {m.dosage}</p>
                      <p className="text-sm text-gray-600">
                        Instructions: {m.instructions || m.frequency || "Not specified"}
                      </p>
                      <p className="text-sm text-gray-600">Duration: {m.duration}</p>
                    </div>
                  ))}
                </div>

                {p.notes && (
                  <div className="mt-4 bg-blue-50 p-3 rounded-lg">
                    <p className="text-sm font-medium text-gray-700 mb-1">Doctor's Notes:</p>
                    <p className="text-sm text-gray-600">{p.notes}</p>
                  </div>
                )}
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
