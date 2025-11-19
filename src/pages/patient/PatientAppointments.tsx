import React, { useEffect, useState } from "react";
import { CalendarIcon, ClockIcon, VideoIcon, XIcon } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { appointmentAPI } from "../../services/api";
import { Appointment } from "../../types";
import { Card } from "../../components/ui/Card";
import { Badge } from "../../components/ui/Badge";

export function PatientAppointments() {
  const { user } = useAuth();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [filter, setFilter] = useState<"all" | "upcoming" | "past">("all");

  useEffect(() => {
    if (user?._id) loadAppointments();
  }, [user]);

  const loadAppointments = async () => {
    try {
      const appts: Appointment[] = await appointmentAPI.getByPatient(user!._id);
      // Assuming the API directly returns Appointment[] (not an object with 'appointments')
      setAppointments(appts);
    } catch (err) {
      console.log("❌ Failed to load appointments:", err);
    }
  };

  const handleCancel = async (appointmentId: string) => {
    if (window.confirm("Cancel this appointment?")) {
      await appointmentAPI.cancel(appointmentId);
      loadAppointments();
    }
  };

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

  const filteredAppointments = appointments.filter((apt) => {
    if (filter === "upcoming") return apt.status !== "completed" && apt.status !== "cancelled";
    if (filter === "past") return apt.status === "completed" || apt.status === "cancelled";
    return true;
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">My Appointments</h1>
        <p className="text-gray-600 mt-1">View and manage your appointments</p>
      </div>

      <div className="flex gap-2">
        {["all", "upcoming", "past"].map((t) => (
          <button
            key={t}
            onClick={() => setFilter(t as any)}
            className={`px-3 py-1 rounded-lg text-sm ${
              filter === t ? "bg-blue-600 text-white" : "bg-gray-200"
            }`}
          >
            {t[0].toUpperCase() + t.slice(1)}
          </button>
        ))}
      </div>

      {filteredAppointments.length === 0 ? (
        <Card className="p-12 text-center">
          <CalendarIcon className="w-12 h-12 mx-auto mb-3 text-gray-400" />
          <p className="text-gray-500">No appointments found</p>
        </Card>
      ) : (
        <div className="space-y-4">
          {filteredAppointments.map((appointment) => {
            const doctor = appointment.doctorId as any; // ✅ doctor is object now

            return (
              <Card key={appointment._id} className="p-6">
                <div className="flex items-start justify-between mb-4">
                  
                  {/* ✅ FULL DOCTOR INFO NOW SHOWS */}
                  <div>
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-semibold">
                        Dr. {doctor?.firstName} {doctor?.lastName}
                      </h3>
                      {getStatusBadge(appointment.status)}
                      {appointment.type === "online" && (
                        <Badge variant="info">
                          <VideoIcon className="w-3 h-3 inline mr-1" /> Online
                        </Badge>
                      )}
                    </div>

                    <div className="text-sm text-gray-600 space-y-1">
                      <p className="font-medium text-gray-800">{doctor?.specialty}</p>
                      {doctor?.clinicName && <p>🏥 {doctor.clinicName}</p>}
                      <p>📍 {doctor?.city}, {doctor?.province}</p>
                      <p>📞 {doctor?.phone}</p>
                      {doctor?.email && <p>✉️ {doctor.email}</p>}
                    </div>
                  </div>

                  {appointment.status === "pending" && (
                    <button
                      className="bg-red-600 text-white p-2 rounded-lg"
                      onClick={() => handleCancel(appointment._id!)}
                    >
                      <XIcon className="w-4 h-4" />
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <CalendarIcon className="w-4 h-4" />
                    {new Date(appointment.date).toLocaleDateString()}
                  </div>

                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <ClockIcon className="w-4 h-4" />
                    {appointment.time}
                  </div>
                </div>

                <div className="bg-gray-50 p-3 rounded-lg mb-4">
                  <p className="text-sm font-medium text-gray-700 mb-1">Reason for Visit:</p>
                  <p className="text-sm text-gray-600">{appointment.reason}</p>
                </div>

                {appointment.type === "online" &&
 appointment.videoCallLink &&
 appointment.status === "approved" && (
  <button
    onClick={() => window.open(appointment.videoCallLink, "_blank")}
    className="px-5 py-2 bg-blue-600 text-white rounded-lg"
  >
    <VideoIcon className="w-4 h-4 inline mr-2" />
    Join Video Call
  </button>

                  )}
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}