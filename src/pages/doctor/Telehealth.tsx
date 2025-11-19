import { useEffect, useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { appointmentAPI, patientAPI } from "../../services/api";
import { Appointment, Doctor, Patient } from "../../types";
import { VideoIcon, CalendarIcon, ClockIcon } from "lucide-react";

export function Telehealth() {
  const { user } = useAuth();
  const doctor = user as Doctor;

  const [sessions, setSessions] = useState<Appointment[]>([]);
  const [patients, setPatients] = useState<Record<string, Patient>>({});
  const [loading, setLoading] = useState(true);

  const formatDate = (dateString: string): string =>
    new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });

  const formatTime = (time: string): string => {
    const [h, m] = time.split(":");
    const hour = parseInt(h);
    return `${hour > 12 ? hour - 12 : hour}:${m} ${hour >= 12 ? "PM" : "AM"}`;
  };

  useEffect(() => {
    async function loadTelehealthSessions() {
      if (!doctor?._id) return;

      try {
        const appts = await appointmentAPI.getByDoctor(doctor._id);

        // Only online & approved/completed
        const filtered = appts.filter(
          (a) => a.type === "online" && ["completed", "approved"].includes(a.status)
        );
        setSessions(filtered);

        // ✅ Extract real patient IDs whether populated or raw
        const patientIds = [
          ...new Set(
            filtered.map((a) =>
              typeof a.patientId === "object" ? a.patientId._id : a.patientId
            )
          ),
        ];

        const patientMap: Record<string, Patient> = {};
        for (const id of patientIds) {
          try {
            patientMap[id] = await patientAPI.getById(id);
          } catch (_err) {
  // ignore missing patient
}
        }

        setPatients(patientMap);
      } catch (err) {
        console.error("Error loading telehealth history:", err);
      } finally {
        setLoading(false);
      }
    }

    loadTelehealthSessions();
  }, [doctor]);

  if (loading) {
    return <p className="text-center text-gray-500 mt-8">Loading telehealth sessions...</p>;
  }

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <h1 className="text-2xl font-bold text-gray-800 mb-2">Telehealth Consultations</h1>
      <p className="text-gray-600 mb-6">Online video appointments history & upcoming sessions</p>

      {sessions.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500 text-lg">No online video consultations yet.</p>
        </div>
      ) : (
        <div className="bg-white shadow-md rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Patient
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date & Time
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Reason
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>

              <tbody className="bg-white divide-y divide-gray-200">
                {sessions.map((s) => {
                  const patient =
                    typeof s.patientId === "object"
                      ? patients[s.patientId._id]
                      : patients[s.patientId];

                  return (
                    <tr key={s._id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap font-medium text-gray-900">
                        {patient ? `${patient.firstName} ${patient.lastName}` : "Unknown Patient"}
                      </td>

                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <div className="flex items-center gap-2">
                          <CalendarIcon className="w-4 h-4" />
                          {formatDate(s.date)}
                        </div>
                        <div className="flex items-center gap-2">
                          <ClockIcon className="w-4 h-4" />
                          {formatTime(s.time)}
                        </div>
                      </td>

                      <td className="px-6 py-4 text-sm text-gray-600">{s.reason}</td>

                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="px-2 py-1 rounded-full text-xs font-semibold bg-purple-100 text-purple-800">
                          {s.status}
                        </span>
                      </td>

                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-3">
                        <button
                          onClick={() => window.location.href = `/doctor/appointments/${s._id}`}
                          className="text-blue-600 hover:text-blue-900"
                        >
                          View
                        </button>

                        {s.videoCallLink && (
                          <button
                            onClick={() => window.open(s.videoCallLink, "_blank")}
                            className="text-purple-600 hover:text-purple-900 flex items-center gap-1"
                          >
                            <VideoIcon className="w-4 h-4" /> Join Call
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>

            </table>
          </div>
        </div>
      )}
    </div>
  );
}
