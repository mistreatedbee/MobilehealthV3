import { useEffect, useState } from "react";
import { CalendarIcon, ClockIcon, VideoIcon, AlertCircleIcon } from "lucide-react";
import { appointmentAPI, doctorAPI, patientAPI } from "../../services/api";
import { Appointment, Doctor, Patient } from "../../types";
import { Card } from "../../components/ui/Card";
import { Badge } from "../../components/ui/Badge";
import { Button } from "../../components/ui/Button";
import toast from "react-hot-toast";

export function ManageAppointments() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [doctors, setDoctors] = useState<Record<string, Doctor>>({});
  const [patients, setPatients] = useState<Record<string, Patient>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await appointmentAPI.getAll() as Appointment[] | { appointments: Appointment[] };

      // ✅ Normalize response
      const appts = Array.isArray(response) ? response : response.appointments || [];

      setAppointments(
        appts.sort((a, b) => {
          const dateA = a.date ? new Date(a.date).getTime() : 0;
          const dateB = b.date ? new Date(b.date).getTime() : 0;
          return dateB - dateA;
        })
      );

      const doctorMap: Record<string, Doctor> = {};
      const patientMap: Record<string, Patient> = {};

      for (const apt of appts) {
        try {
          // ✅ Handle doctor object or ID
          if (typeof apt.doctorId === "object") {
            const doc = apt.doctorId as Doctor;
            doctorMap[doc._id] = doc;
          } else if (apt.doctorId && !doctorMap[apt.doctorId]) {
            doctorMap[apt.doctorId] = await doctorAPI.getById(apt.doctorId);
          }

          // ✅ Handle patient object or ID
          if (typeof apt.patientId === "object") {
            const pat = apt.patientId as Patient;
            patientMap[pat._id] = pat;
          } else if (apt.patientId && !patientMap[apt.patientId]) {
            patientMap[apt.patientId] = await patientAPI.getById(apt.patientId);
          }
        } catch (err) {
          console.error("Failed to load related data for appointment:", apt._id, err);
        }
      }

      setDoctors(doctorMap);
      setPatients(patientMap);

    } catch (err: any) {
      const errorMessage = err?.message || "Failed to load appointments";
      console.error("Failed to load appointments:", err);
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

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
          <h1 className="text-2xl font-bold text-gray-900">Manage Appointments</h1>
          <p className="text-gray-600 mt-1">View all scheduled patient appointments</p>
        </div>
        <Card className="p-6">
          <p className="text-center text-gray-500">Loading appointments...</p>
        </Card>
      </div>
    );
  }

  if (error && appointments.length === 0) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Manage Appointments</h1>
          <p className="text-gray-600 mt-1">View all scheduled patient appointments</p>
        </div>
        <Card className="p-6">
          <div className="text-center py-8">
            <AlertCircleIcon className="w-12 h-12 text-red-500 mx-auto mb-4" />
            <p className="text-red-600 mb-4">{error}</p>
            <Button variant="primary" onClick={loadData}>
              Retry
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  const getStatusBadge = (status: string) => {
    const variants: Record<string, "default" | "success" | "warning" | "danger"> = {
      pending: "warning",
      approved: "success",
      declined: "danger",
      completed: "default",
      cancelled: "default",
    };
    return <Badge variant={variants[status] || "default"}>{status}</Badge>;
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Manage Appointments</h1>
        <p className="text-gray-600 mt-1">View all scheduled patient appointments</p>
      </div>

      <Card className="p-6">
        {appointments.length === 0 ? (
          <div className="text-center py-12">
            <CalendarIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 text-lg">No appointments found</p>
            <p className="text-gray-400 text-sm mt-2">Appointments will appear here once they are scheduled</p>
          </div>
        ) : (
          <div className="space-y-4">
            {appointments.map((appointment) => {
              const doctor =
                typeof appointment.doctorId === "object"
                  ? (appointment.doctorId as Doctor)
                  : doctors[appointment.doctorId];

              const patient =
                typeof appointment.patientId === "object"
                  ? (appointment.patientId as Patient)
                  : patients[appointment.patientId];

              return (
                <div key={appointment._id} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h3 className="font-semibold flex items-center gap-2">
                        {patient?.firstName || 'Unknown'} {patient?.lastName || ''} → Dr. {doctor?.firstName || 'Unknown'} {doctor?.lastName || ''}
                      </h3>
                      <p className="text-sm text-gray-600">{doctor?.specialty || 'N/A'}</p>
                    </div>

                    <div className="flex items-center gap-2">
                      {getStatusBadge(appointment.status)}
                      {appointment.type === "online" && (
                        <Badge variant="info">
                          <VideoIcon className="w-3 h-3 inline mr-1" /> Online
                        </Badge>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-sm text-gray-600 mt-2">
                    <div className="flex items-center gap-2">
                      <CalendarIcon className="w-4 h-4" />
                      {formatDate(appointment.date)}
                    </div>

                    <div className="flex items-center gap-2">
                      <ClockIcon className="w-4 h-4" />
                      {appointment.time || 'N/A'}
                    </div>

                    <div>{doctor?.city || 'N/A'}, {doctor?.province || 'N/A'}</div>
                  </div>

                  <div className="mt-3 bg-gray-50 p-3 rounded-lg text-sm text-gray-700">
                    <span className="font-medium">Reason:</span> {appointment.reason || 'N/A'}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </Card>
    </div>
  );
}
