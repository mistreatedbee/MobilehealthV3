import { useEffect, useState, useCallback } from "react";
import { useAuth } from "../../context/AuthContext";
import { appointmentAPI } from "../../services/api";
import { Patient, Appointment } from "../../types";
import { UsersIcon, ActivityIcon, ClockIcon, CalendarIcon, SearchIcon } from "lucide-react";
import { useNavigate } from "react-router-dom";

function calculateAge(dateOfBirth?: string): number | null {
  if (!dateOfBirth) return null;
  const dob = new Date(dateOfBirth);
  const diff = Date.now() - dob.getTime();
  const age = new Date(diff).getUTCFullYear() - 1970;
  return age >= 0 ? age : null;
}

export function Patients() {
  const { user } = useAuth();
  const doctorId = user?._id;
  const navigate = useNavigate();

  const [patients, setPatients] = useState<Patient[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);

  const loadPatients = useCallback(async () => {
    if (!doctorId) return;

    setLoading(true);
    try {
      const doctorAppointments = await appointmentAPI.getByDoctor(doctorId);
      setAppointments(doctorAppointments);

      const uniquePatientsMap = new Map<string, Patient>();

      doctorAppointments.forEach((appt) => {
        if (appt.patientId && typeof appt.patientId === "object") {
          uniquePatientsMap.set(appt.patientId._id, appt.patientId as Patient);
        }
      });

      setPatients(Array.from(uniquePatientsMap.values()));
    } catch (err) {
      console.log("❌ Failed to load patients:", err);
    } finally {
      setLoading(false);
    }
  }, [doctorId]);

  useEffect(() => {
    loadPatients();
  }, [loadPatients]);

  const filteredPatients = patients.filter((p) => {
    const nameMatch = `${p.firstName} ${p.lastName}`.toLowerCase().includes(searchTerm.toLowerCase());
    const emailMatch = p.email?.toLowerCase().includes(searchTerm.toLowerCase());
    return nameMatch || emailMatch;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500"></div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      
      <h1 className="text-3xl font-bold text-gray-800">Your Patients</h1>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <StatCard title="Total Patients" value={patients.length} icon={<UsersIcon className="w-6 h-6" />} />
        <StatCard title="Total Appointments" value={appointments.length} icon={<CalendarIcon className="w-6 h-6" />} />
        <StatCard title="Unique Cities" value={[...new Set(patients.map(p => p.city))].length} icon={<ActivityIcon className="w-6 h-6" />} />
        <StatCard title="Messages Soon" value="—" icon={<ClockIcon className="w-6 h-6" />} />
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <SearchIcon className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
        <input
          placeholder="Search patients..."
          className="pl-10 pr-4 py-3 border rounded-xl w-full"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {/* Patient List */}
      <div className="bg-white rounded-xl shadow border overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <Th>Patient</Th>
              <Th>Contact</Th>
              <Th>Location</Th>
              <Th>Actions</Th>
            </tr>
          </thead>
          <tbody>
            {filteredPatients.map((p) => (
              <tr key={p._id} className="hover:bg-gray-50 transition">
                <Td>
                  <div className="font-semibold">{p.firstName} {p.lastName}</div>
                  <p className="text-gray-500 text-sm">
                    {calculateAge(p.dateOfBirth) ? `${calculateAge(p.dateOfBirth)} yrs` : "Age N/A"} • {p.gender || "Unknown"}
                  </p>
                </Td>

                <Td>
                  {p.email}<br />
                  <span className="text-gray-600">{p.phone || "No phone"}</span>
                </Td>

                <Td>
                  {p.city || "—"}, {p.province || "—"}
                </Td>

                <Td>
                  <button
                    onClick={() => {
                      const appt = appointments.find((a) =>
                        typeof a.patientId === "object"
                          ? a.patientId._id === p._id
                          : a.patientId === p._id
                      );
                      if (appt?._id) {
                        navigate(`/doctor/appointments/${appt._id}`);
                      } else {
                        alert("This patient has no appointment record.");
                      }
                    }}
                    className="text-blue-600 hover:text-blue-800 font-medium"
                  >
                    View Appointment
                  </button>
                </Td>
              </tr>
            ))}
          </tbody>
        </table>

        {filteredPatients.length === 0 && (
          <p className="text-center py-12 text-gray-500">No patients found.</p>
        )}
      </div>
    </div>
  );
}

function StatCard({ title, value, icon }: any) {
  return (
    <div className="p-4 bg-white border rounded-xl shadow flex items-center gap-3">
      <div className="p-3 bg-gray-100 rounded-lg">{icon}</div>
      <div>
        <p className="text-gray-600 text-sm">{title}</p>
        <p className="text-xl font-semibold text-gray-900">{value}</p>
      </div>
    </div>
  );
}

function Th({ children }: any) {
  return <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">{children}</th>;
}

function Td({ children }: any) {
  return <td className="px-6 py-4 text-sm text-gray-700">{children}</td>;
}
