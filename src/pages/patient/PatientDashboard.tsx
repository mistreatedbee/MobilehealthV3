import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { 
  Calendar as CalendarIcon, 
  Clock as ClockIcon, 
  UserIcon,
  StethoscopeIcon,
  VideoIcon,
  MapPinIcon,
  PhoneIcon,
  PlusIcon,
  EditIcon,
  AlertTriangleIcon
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { appointmentAPI, doctorAPI } from "../../services/api";
import { Appointment, Doctor } from "../../types";
import { Card } from "../../components/ui/Card";
import { Badge } from "../../components/ui/Badge";
import { Button } from "../../components/ui/Button";

export function PatientDashboard() {
  const { user } = useAuth();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [doctors, setDoctors] = useState<Record<string, Doctor>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user?._id) return;

    async function load() {
      try {
        setLoading(true);
        setError(null);
        
        const res = await appointmentAPI.getByPatient(user!._id) as
          Appointment[] | { appointments: Appointment[] };

        const list: Appointment[] = Array.isArray(res)
          ? res
          : res.appointments ?? [];

        // Sort by date and time
        const upcoming = list
          .filter(a => a.status !== "completed" && a.status !== "cancelled")
          .sort((a, b) => {
            const dateCompare = new Date(a.date).getTime() - new Date(b.date).getTime();
            if (dateCompare === 0) return a.time.localeCompare(b.time);
            return dateCompare;
          });

        setAppointments(upcoming);

        // Load doctors in parallel
        const uniqueDoctorIds = [...new Set(upcoming.map(a => a.doctorId))];
        const doctorPromises = uniqueDoctorIds.map(id => 
          doctorAPI.getById(id).catch(() => null)
        );
        
        const doctorResults = await Promise.all(doctorPromises);
        const doctorMap: Record<string, Doctor> = {};
        
        uniqueDoctorIds.forEach((id, index) => {
          const doctorResult = doctorResults[index];
          if (doctorResult) {
            doctorMap[id] = doctorResult;
          }
        });

        setDoctors(doctorMap);
      } catch (err) {
        console.error("Failed to load appointments:", err);
        setError("Failed to load appointments. Please try again.");
      } finally {
        setLoading(false);
      }
    }

    load();
  }, [user]);

  const getStatusBadge = (status: string) => {
    const variants: Record<string, "default" | "success" | "warning" | "danger"> = {
      pending: "warning",
      scheduled: "warning",
      approved: "success",
      declined: "danger",
      cancelled: "danger",
      completed: "default",
    };
    return <Badge variant={variants[status] || "default"}>{status}</Badge>;
  };

  const getAppointmentTypeIcon = (type: string) => {
    return type === "online" ? 
      <VideoIcon className="w-4 h-4 text-purple-600" /> : 
      <UserIcon className="w-4 h-4 text-blue-600" />;
  };

  const displayName = user && "firstName" in user && typeof user.firstName === "string"
    ? user.firstName
    : "User";

  // Calculate urgent appointments (within 24 hours)
  const urgentAppointments = appointments.filter(appt => {
    const apptDate = new Date(appt.date);
    const now = new Date();
    const diffTime = apptDate.getTime() - now.getTime();
    const diffDays = diffTime / (1000 * 3600 * 24);
    return diffDays <= 1 && appt.status === "approved";
  });

  if (!user) {
    return (
      <div className="space-y-6">
        <Card className="p-6 text-center">
          <AlertTriangleIcon className="w-16 h-16 mx-auto mb-4 text-red-500" />
          <h2 className="text-xl font-bold mb-2">Authentication Required</h2>
          <p className="text-gray-600 mb-4">Please log in to view your dashboard.</p>
          <Link to="/login">
            <Button>Go to Login</Button>
          </Link>
        </Card>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-8 bg-gray-200 rounded w-48 animate-pulse"></div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <Card key={i} className="p-6 animate-pulse">
              <div className="h-20 bg-gray-200 rounded"></div>
            </Card>
          ))}
        </div>
        <Card className="p-6 animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-48 mb-4"></div>
          <div className="space-y-4">
            {Array.from({ length: 2 }).map((_, i) => (
              <div key={i} className="h-20 bg-gray-200 rounded"></div>
            ))}
          </div>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold text-gray-900">
          Welcome back, {displayName}!
        </h1>
        <Card className="p-6 text-center">
          <AlertTriangleIcon className="w-12 h-12 mx-auto mb-4 text-red-500" />
          <p className="text-red-500 mb-4">{error}</p>
          <Button onClick={() => window.location.reload()}>Try Again</Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Welcome back, {displayName}! 👋
          </h1>
          <p className="text-gray-600 mt-1">
            {appointments.length > 0 
              ? `You have ${appointments.length} upcoming appointment${appointments.length !== 1 ? 's' : ''}`
              : "Manage your health appointments and medical care"
            }
          </p>
        </div>
        <Link to="/patient/doctors">
          <Button>
            <PlusIcon className="w-4 h-4 mr-2" />
            Book Appointment
          </Button>
        </Link>
      </div>

      {/* Urgent Alerts */}
      {urgentAppointments.length > 0 && (
        <Card className="p-4 border-orange-200 bg-orange-50">
          <div className="flex items-center gap-3">
            <AlertTriangleIcon className="w-5 h-5 text-orange-600 flex-shrink-0" />
            <div className="flex-1">
              <p className="font-medium text-orange-800">
                You have {urgentAppointments.length} appointment{urgentAppointments.length !== 1 ? 's' : ''} within 24 hours
              </p>
              <p className="text-sm text-orange-700">
                Please prepare for your upcoming visit{urgentAppointments.length !== 1 ? 's' : ''}
              </p>
            </div>
          </div>
        </Card>
      )}

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-6 hover:shadow-md transition-shadow">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-blue-50 rounded-full">
              <CalendarIcon className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Upcoming</p>
              <p className="text-2xl font-bold">{appointments.length}</p>
            </div>
          </div>
        </Card>

        <Card className="p-6 hover:shadow-md transition-shadow">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-green-50 rounded-full">
              <StethoscopeIcon className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Approved</p>
              <p className="text-2xl font-bold">
                {appointments.filter(a => a.status === "approved").length}
              </p>
            </div>
          </div>
        </Card>

        <Card className="p-6 hover:shadow-md transition-shadow">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-yellow-50 rounded-full">
              <ClockIcon className="w-6 h-6 text-yellow-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Pending</p>
              <p className="text-2xl font-bold">
                {appointments.filter(a => a.status === "pending").length}
              </p>
            </div>
          </div>
        </Card>

        <Link to="/patient/doctors">
          <Card className="p-6 hover:shadow-md transition-shadow cursor-pointer h-full border-2 border-dashed border-gray-300 hover:border-blue-300 bg-gray-50">
            <div className="text-center">
              <PlusIcon className="w-8 h-8 mx-auto mb-2 text-gray-400" />
              <p className="font-semibold text-gray-700">New Appointment</p>
              <p className="text-sm text-gray-500 mt-1">Book with a doctor</p>
            </div>
          </Card>
        </Link>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Link to="/patient/doctors">
          <Card className="p-4 text-center hover:shadow-md transition-shadow cursor-pointer group">
            <StethoscopeIcon className="w-6 h-6 mx-auto mb-2 text-blue-600 group-hover:text-blue-700" />
            <p className="text-sm font-medium">Find Doctors</p>
          </Card>
        </Link>
        
        <Link to="/patient/appointments">
          <Card className="p-4 text-center hover:shadow-md transition-shadow cursor-pointer group">
            <CalendarIcon className="w-6 h-6 mx-auto mb-2 text-green-600 group-hover:text-green-700" />
            <p className="text-sm font-medium">All Appointments</p>
          </Card>
        </Link>
        
        <Link to="/patient/medical-records">
          <Card className="p-4 text-center hover:shadow-md transition-shadow cursor-pointer group">
            <UserIcon className="w-6 h-6 mx-auto mb-2 text-purple-600 group-hover:text-purple-700" />
            <p className="text-sm font-medium">Medical Records</p>
          </Card>
        </Link>
        
        <Link to="/patient/profile">
          <Card className="p-4 text-center hover:shadow-md transition-shadow cursor-pointer group">
            <EditIcon className="w-6 h-6 mx-auto mb-2 text-gray-600 group-hover:text-gray-700" />
            <p className="text-sm font-medium">Edit Profile</p>
          </Card>
        </Link>
      </div>

      {/* Upcoming Appointments */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-gray-900">Upcoming Appointments</h2>
          {appointments.length > 0 && (
            <Link to="/patient/appointments">
              <Button variant="secondary" size="sm">
                View All
              </Button>
            </Link>
          )}
        </div>

        {appointments.length === 0 ? (
          <div className="text-center py-12">
            <CalendarIcon className="w-16 h-16 mx-auto mb-4 text-gray-300" />
            <h3 className="text-lg font-semibold text-gray-600 mb-2">No upcoming appointments</h3>
            <p className="text-gray-500 mb-6">Schedule your first appointment with a healthcare provider</p>
            <Link to="/patient/doctors">
              <Button>
                <PlusIcon className="w-4 h-4 mr-2" />
                Book Appointment
              </Button>
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {appointments.slice(0, 5).map(a => {
              const doc = doctors[a.doctorId];
              if (!doc) return null;

              const isUrgent = urgentAppointments.some(ua => ua._id === a._id);

              return (
                <Card 
                  key={a._id} 
                  className={`p-4 border-l-4 ${
                    isUrgent 
                      ? 'border-l-orange-500 bg-orange-50' 
                      : a.status === 'approved' 
                        ? 'border-l-green-500' 
                        : 'border-l-yellow-500'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="font-semibold text-gray-900">
                          Dr. {doc.firstName} {doc.lastName}
                        </h3>
                        {getStatusBadge(a.status)}
                        {isUrgent && (
                          <Badge variant="warning">
                            <div className="flex items-center gap-1">
                              <AlertTriangleIcon className="w-3 h-3" />
                              Soon
                            </div>
                          </Badge>
                        )}
                      </div>

                      <div className="flex items-center gap-2 mb-2">
                        <StethoscopeIcon className="w-4 h-4 text-gray-400" />
                        <p className="text-sm text-gray-600">{doc.specialty}</p>
                        <div className="flex items-center gap-1 ml-2">
                          {getAppointmentTypeIcon(a.type)}
                          <span className="text-sm text-gray-500 capitalize">{a.type}</span>
                        </div>
                      </div>

                      <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600">
                        <span className="flex items-center gap-1">
                          <CalendarIcon className="w-4 h-4" />
                          {new Date(a.date).toLocaleDateString('en-US', {
                            weekday: 'short',
                            month: 'short',
                            day: 'numeric'
                          })}
                        </span>
                        {a.time && (
                          <span className="flex items-center gap-1">
                            <ClockIcon className="w-4 h-4" />
                            {a.time}
                          </span>
                        )}
                        {doc.city && (
                          <span className="flex items-center gap-1">
                            <MapPinIcon className="w-4 h-4" />
                            {doc.city}
                          </span>
                        )}
                      </div>

                      {a.type === "online" && a.videoCallLink && a.status === "approved" && (
                        <div className="mt-3">
                          <Button 
                            size="sm" 
                            variant="secondary"
                            onClick={() => window.open(a.videoCallLink, '_blank')}
                          >
                            <VideoIcon className="w-4 h-4 mr-1" />
                            Join Video Call
                          </Button>
                        </div>
                      )}
                    </div>

                    <div className="flex gap-2 ml-4">
                      <Link to={`/patient/appointments/${a._id}`}>
                        <Button variant="secondary" size="sm">
                          Details
                        </Button>
                      </Link>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        )}
      </Card>

      {/* Recent Activity / Quick Tips */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Quick Tips</h3>
          <div className="space-y-3 text-sm">
            <div className="flex items-start gap-3 p-3 bg-blue-50 rounded-lg">
              <PhoneIcon className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
              <p>Have your insurance information ready before appointments</p>
            </div>
            <div className="flex items-start gap-3 p-3 bg-green-50 rounded-lg">
              <ClockIcon className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
              <p>Arrive 15 minutes early for in-person appointments</p>
            </div>
            <div className="flex items-start gap-3 p-3 bg-purple-50 rounded-lg">
              <VideoIcon className="w-4 h-4 text-purple-600 mt-0.5 flex-shrink-0" />
              <p>Test your audio/video before online consultations</p>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Need Help?</h3>
          <div className="space-y-4 text-sm">
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <span>Emergency Support</span>
              <Button variant="danger" size="sm">Call 911</Button>
            </div>
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <span>Customer Service</span>
              <Button variant="secondary" size="sm">Contact</Button>
            </div>
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <span>Technical Issues</span>
              <Button variant="secondary" size="sm">Get Help</Button>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}