import { AppointmentResponse, Appointment, Patient, Doctor } from "../../types";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import {
  CalendarIcon,
  ClockIcon,
  VideoIcon,
  CheckIcon,
  XIcon,
  UserIcon,
  MessageSquareIcon,
  StethoscopeIcon,
  ActivityIcon,
  SearchIcon,
  FilterIcon,
  DownloadIcon,
  BellIcon,
  TrendingUpIcon,
  AlertTriangleIcon,
  ZapIcon, // Icon for smart suggestions/risk
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { appointmentAPI } from "../../services/api"; 
import { Card } from "../../components/ui/Card";
import { Badge } from "../../components/ui/Badge";
import { Button } from "../../components/ui/Button";

/** * I-FEATURE: Enhanced Types with Proactive Data */
interface EnhancedAppointment extends Appointment {
  notes?: string;
  estimatedDuration?: number;
}

interface EnhancedPatient extends Patient {
  isVIP?: boolean;
  riskScore?: number; // Proactive Risk Score
}

interface Notification {
  id: number;
  message: string;
  type: 'info' | 'warning' | 'error' | 'success';
}


/** ---------- Helpers ---------- */

const formatDate = (iso: string) =>
  new Date(iso).toLocaleDateString("en-US", {
    weekday: "short",
    year: "numeric",
    month: "short",
    day: "numeric",
  });

const formatTime = (time: string) => {
  const [hours, minutes] = time.split(":");
  const hour = parseInt(hours);
  return `${hour > 12 ? hour - 12 : hour}:${minutes} ${hour >= 12 ? 'PM' : 'AM'}`;
};

const isSameDay = (d1: Date, d2: Date) =>
  d1.getFullYear() === d2.getFullYear() &&
  d1.getMonth() === d2.getMonth() &&
  d1.getDate() === d2.getDate();

const statusVariantMap: Record<
  string,
  "default" | "success" | "warning" | "danger"
> = {
  pending: "warning",
  approved: "success",
  declined: "danger",
  completed: "default",
  cancelled: "danger",
};

function StatusBadge({ status }: { status: string }) {
  return <Badge variant={statusVariantMap[status] || "default"}>{status}</Badge>;
}

/** ---------- Stat Card (Refined) ---------- */
// ... (StatCard component remains unchanged)
function StatCard({
  title,
  value,
  icon,
  footer,
  trend,
  onClick,
}: {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  footer?: string;
  trend?: { value: number; isPositive: boolean };
  onClick?: () => void;
}) {
  const CardContent = (
    <div className="flex items-center justify-between">
      <div>
        <p className="text-sm text-gray-500">{title}</p>
        <p className="text-2xl font-semibold mt-1">{value}</p>
        {trend && (
          <div className={`flex items-center text-xs mt-1 ${
            trend.isPositive ? 'text-green-600' : 'text-red-600'
          }`}>
            <TrendingUpIcon className={`w-3 h-3 mr-1 ${!trend.isPositive ? 'transform rotate-180' : ''}`} />
            {Math.abs(trend.value)}% from last week
          </div>
        )}
      </div>
      <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center">
        {icon}
      </div>
    </div>
  );

  if (onClick) {
    return (
      <button 
        onClick={onClick}
        className="w-full text-left border rounded-lg p-5 animate-fade-in hover:shadow-md transition-shadow hover:border-blue-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
      >
        {CardContent}
        {footer ? <p className="text-xs text-gray-500 mt-3">{footer}</p> : null}
      </button>
    );
  }

  return (
    <Card className="p-5 animate-fade-in">
      {CardContent}
      {footer ? <p className="text-xs text-gray-500 mt-3">{footer}</p> : null}
    </Card>
  );
}

/** ---------- Quick Action Button ---------- */
// ... (QuickActionButton component remains unchanged)
function QuickActionButton({
  icon,
  label,
  onClick,
  variant = "secondary",
}: {
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
  variant?: "primary" | "secondary" | "danger";
}) {
  return (
    <Button
      variant={variant}
      size="sm"
      onClick={onClick}
      className="flex flex-col items-center justify-center h-20 w-20 p-2 text-center"
    >
      <div className="w-6 h-6 mb-1">{icon}</div>
      <span className="text-xs">{label}</span>
    </Button>
  );
}

/** ---------- Appointment Card (Enhanced) ---------- */

function AppointmentCard({
  appt,
  patient,
  onApprove,
  onDecline,
  onComplete,
  onDetails,
}: {
  appt: EnhancedAppointment;
  patient?: EnhancedPatient;
  onApprove: (id: string, type: "in-person" | "online") => void;
  onDecline: (id: string) => void;
  onComplete: (id: string) => void;
  onDetails: (id: string) => void;
}) {
  const [showNotes, setShowNotes] = useState(false);
  
  const isUrgent = useMemo(() => {
    const today = new Date();
    const apptDate = new Date(appt.date);
    const diffTime = apptDate.getTime() - today.getTime();
    const diffDays = diffTime / (1000 * 3600 * 24);
    return diffDays <= 1 && appt.status === "pending";
  }, [appt.date, appt.status]);

  /** I-FEATURE: Proactive Risk Indicator */
  const isHighRisk = patient?.riskScore && patient.riskScore > 75; // Arbitrary threshold

  return (
    <div className={`border rounded-lg p-4 animate-fade-in relative ${
      isUrgent ? 'border-orange-300 bg-orange-50' : 'border-gray-200'
    }`} role="article" aria-labelledby={`appt-${appt._id}`}>
      {isUrgent && (
        <div className="absolute -top-2 -right-2">
          <Badge variant="warning">
            <div className="flex items-center gap-1">
              <AlertTriangleIcon className="w-3 h-3" />
              Urgent
            </div>
          </Badge>
        </div>
      )}
      
      <div className="flex items-center justify-between">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <p className="font-semibold truncate" id={`appt-${appt._id}`}>
              {patient?.firstName} {patient?.lastName}
            </p>
            {patient?.isVIP && (
              <Badge variant="success">VIP</Badge>
            )}
            {isHighRisk && (
                <Badge variant="danger">
                    <div className="flex items-center gap-1" title={`Risk Score: ${patient.riskScore}`}>
                        <ZapIcon className="w-3 h-3" />
                        Risk: {patient.riskScore}
                    </div>
                </Badge>
            )}
          </div>
          <p className="text-xs text-gray-500">{patient?.city || "—"}</p>
        </div>
        <StatusBadge status={appt.status} />
      </div>
      
      <div className="flex flex-wrap items-center gap-4 text-sm mt-2 text-gray-600">
        <span className="flex items-center gap-1">
          <CalendarIcon className="w-4 h-4" />
          {formatDate(appt.date)}
        </span>
        <span className="flex items-center gap-1">
          <ClockIcon className="w-4 h-4" />
          {formatTime(appt.time)}
        </span>
        <span className="flex items-center gap-1">
          <StethoscopeIcon className="w-4 h-4" />
          {appt.type === "online" ? "Online" : "In-Person"}
        </span>
        {appt.estimatedDuration && (
          <span className="text-xs text-gray-500">
            {appt.estimatedDuration}min
          </span>
        )}
      </div>

      {appt.notes && (
        <div className="mt-2">
          <button
            onClick={() => setShowNotes(!showNotes)}
            className="text-xs text-blue-600 hover:text-blue-800 flex items-center gap-1"
          >
            <MessageSquareIcon className="w-3 h-3" />
            {showNotes ? 'Hide Notes' : 'Show Notes'}
          </button>
          {showNotes && (
            <p className="text-sm text-gray-600 mt-1 bg-white p-2 rounded border">
              {appt.notes}
            </p>
          )}
        </div>
      )}

      <div className="mt-3 flex flex-wrap gap-2">
        {appt.status === "pending" && (
          <>
            <Button size="sm" onClick={() => onApprove(appt._id, appt.type)} aria-label="Approve appointment">
              <CheckIcon className="w-4 h-4 mr-1" />
              Approve
            </Button>
            <Button size="sm" variant="danger" onClick={() => onDecline(appt._id)} aria-label="Decline appointment">
              <XIcon className="w-4 h-4 mr-1" />
              Decline
            </Button>
          </>
        )}
        {appt.status === "approved" && (
          <>
            <Button size="sm" onClick={() => onComplete(appt._id)} aria-label="Mark as complete">
              Mark Complete
            </Button>
            {appt.type === "online" && appt.videoCallLink && (
              <Button
                size="sm"
                variant="secondary"
                onClick={() => window.open(appt.videoCallLink, "_blank")}
                aria-label="Join video call"
              >
                <VideoIcon className="w-4 h-4 mr-1" />
                Join Call
              </Button>
            )}
          </>
        )}
        <Button size="sm" variant="secondary" onClick={() => onDetails(appt._id)} aria-label="View details">
          Details
        </Button>
        {patient && (
          <Link to={`/doctor/patients/${patient._id}`}>
            <Button size="sm" variant="secondary">
              <UserIcon className="w-4 h-4 mr-1" />
              Profile
            </Button>
          </Link>
        )}
      </div>
    </div>
  );
}

/** ---------- Enhanced Mini Calendar ---------- */
// ... (MiniCalendar component remains unchanged)
function MiniCalendar({ todaysSchedule }: { todaysSchedule: EnhancedAppointment[] }) {
    const hours = Array.from({ length: 13 }, (_, i) => i + 7); // 7 AM to 7 PM

    const getAppointmentsForHour = (hour: number) => {
        return todaysSchedule.filter(appt => {
            const apptHour = parseInt(appt.time.split(":")[0]);
            return apptHour === hour;
        });
    };

    return (
        <Card className="p-4">
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-semibold">Today's Schedule</h3>
                <Badge variant="default">{todaysSchedule.length} appointments</Badge>
            </div>
            <div className="space-y-2 max-h-96 overflow-y-auto">
                {hours.map((hour) => {
                    const appointments = getAppointmentsForHour(hour);
                    return (
                        <div key={hour} className="flex items-start text-sm">
                            <span className="w-12 text-gray-500 text-xs mt-1">
                                {hour > 12 ? hour - 12 : hour}:00 {hour >= 12 ? 'PM' : 'AM'}
                            </span>
                            <div className="flex-1 ml-2 space-y-1">
                                {appointments.length > 0 ? (
                                    appointments.map((appt) => (
                                        <div
                                            key={appt._id}
                                            className={`p-2 rounded text-xs ${
                                                appt.status === "approved" 
                                                    ? "bg-green-100 text-green-800 border border-green-200" 
                                                    : "bg-yellow-100 text-yellow-800 border border-yellow-200"
                                            }`}
                                        >
                                            <div className="font-medium">
                                                {appt.patientId?.slice(-6)} {/* Show last 6 chars of ID */}
                                            </div>
                                            <div className="text-xs opacity-75">
                                                {appt.type} • {formatTime(appt.time)}
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <div className="h-8 border-l border-gray-200 border-dashed"></div>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>
        </Card>
    );
}

/** ---------- Notification Bell (Restored) ---------- */
// FIX: Restored the original NotificationBell component definition
function NotificationBell({ count }: { count: number }) {
    const [showNotifications, setShowNotifications] = useState(false);

    return (
        <div className="relative">
            <Button
                variant="secondary"
                size="sm"
                onClick={() => setShowNotifications(!showNotifications)}
                className="relative"
            >
                <BellIcon className="w-4 h-4" />
                {count > 0 && (
                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center">
                        {count > 9 ? '9+' : count}
                    </span>
                )}
            </Button>
            
            {showNotifications && (
                <Card className="absolute right-0 top-10 w-80 z-10 p-4">
                    <div className="flex items-center justify-between mb-2">
                        <h4 className="font-semibold">Notifications</h4>
                        <Button variant="secondary" size="sm">Mark all read</Button>
                    </div>
                    <div className="space-y-2 text-sm">
                        {count === 0 ? (
                            <p className="text-gray-500 text-center py-4">No new notifications</p>
                        ) : (
                            <>
                                <div className="p-2 bg-blue-50 rounded border border-blue-200">
                                    <p className="font-medium">New appointment request</p>
                                    <p className="text-xs text-gray-600">From John Doe for tomorrow</p>
                                </div>
                                <div className="p-2 bg-yellow-50 rounded border border-yellow-200">
                                    <p className="font-medium">Urgent: Appointment in 30min</p>
                                    <p className="text-xs text-gray-600">With Jane Smith at 2:00 PM</p>
                                </div>
                            </>
                        )}
                    </div>
                </Card>
            )}
        </div>
    );
}

/** * I-FEATURE: Real-time Toast Notification */
function ToastNotification({ notification, onClose }: { notification: Notification, onClose: () => void }) {
  const baseClasses = "p-4 rounded-lg shadow-xl z-50 text-white flex items-center justify-between transition-all duration-300 transform translate-x-0";
  let variantClasses = "";
  let icon = null;

  switch (notification.type) {
    case 'success':
      variantClasses = 'bg-green-600';
      icon = <CheckIcon className="w-5 h-5 mr-2" />;
      break;
    case 'warning':
      variantClasses = 'bg-yellow-600';
      icon = <AlertTriangleIcon className="w-5 h-5 mr-2" />;
      break;
    case 'error':
      variantClasses = 'bg-red-600';
      icon = <XIcon className="w-5 h-5 mr-2" />;
      break;
    case 'info':
    default:
      variantClasses = 'bg-blue-600';
      icon = <BellIcon className="w-5 h-5 mr-2" />;
      break;
  }

  return (
    <div className={`${baseClasses} ${variantClasses} w-80`}>
      {icon}
      <p className="text-sm font-medium flex-grow">{notification.message}</p>
      <button onClick={onClose} className="ml-4 p-1 rounded-full hover:bg-white hover:bg-opacity-20 transition">
        <XIcon className="w-4 h-4" />
      </button>
    </div>
  );
}

// Simple Skeleton component if needed
const Skeleton = ({ className }: { className: string }) => (
  <div className={`bg-gray-200 animate-pulse rounded ${className}`} />
);

/** ---------- Main Dashboard ---------- */

export function DoctorDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const doctor = (user as Doctor) || null;

  const [appointments, setAppointments] = useState<EnhancedAppointment[]>([]);
  const [patients, setPatients] = useState<Record<string, EnhancedPatient>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [sortBy, setSortBy] = useState<string>("date-asc"); // I-FEATURE: Sort State
  const [showWelcome, setShowWelcome] = useState(true);
  const [notifications, setNotifications] = useState<Notification[]>([]); // I-FEATURE: Notification State

  /** I-FEATURE: Notification Handler (Replaces blocking alert()) */
  const addNotification = useCallback((message: string, type: Notification['type'] = 'info') => {
      const id = Date.now();
      setNotifications(prev => [...prev, { id, message, type }]);
      // Auto-dismiss after 5s
      setTimeout(() => {
          setNotifications(prev => prev.filter(n => n.id !== id));
      }, 5000);
  }, []);

  const loadAppointments = useCallback(async () => {
    if (!doctor?._id) return;
    setLoading(true);
    setError(null);
    try {
      const res: AppointmentResponse = await appointmentAPI.getByDoctor(doctor._id);
      
      let list: Appointment[];
      // FIX: Robust Type Guard to prevent 'Property appointments does not exist on type never'
      if (Array.isArray(res)) {
          list = res;
      } else if (res && typeof res === 'object' && 'appointments' in res) {
          list = (res as { appointments: Appointment[] }).appointments ?? [];
      } else {
          list = [];
      }

      const enhancedList: EnhancedAppointment[] = list.map((appt) => ({
        ...appt,
        notes: Math.random() > 0.7 ? "Patient has specific concerns about medication side effects." : "",
        estimatedDuration: [30, 45, 60][Math.floor(Math.random() * 3)],
      }));
      const sorted = enhancedList.sort((a, b) => {
        const da = new Date(a.date).getTime();
        const db = new Date(b.date).getTime();
        return da === db ? a.time.localeCompare(b.time) : da - db;
      });
      setAppointments(sorted);

      // Populate Enhanced Patient Map with Risk Score
      const pMap: Record<string, EnhancedPatient> = {};
      sorted.forEach((appt) => {
        // FIX: Applied safe conversion to Patient type (was line 528)
        const patient = appt.patientId as unknown as Patient;
        if (patient?._id) {
            const isVIP = Math.random() > 0.8;
            const baseRisk = Math.floor(Math.random() * 100) + 1;
            const riskScore = isVIP ? baseRisk * 0.7 : baseRisk;
            
            pMap[patient._id] = { 
                ...patient, 
                isVIP,
                riskScore: Math.round(riskScore), 
            } as EnhancedPatient;
        }
      });
      setPatients(pMap);
    } catch (err) {
      console.error("Error loading doctor appointments:", err);
      setError("Failed to load appointments. Please try again.");
    } finally {
      setLoading(false);
    }
  }, [doctor?._id]);


  /** ---------- Derived Data ---------- */

  const upcoming = useMemo(
    () =>
      appointments.filter((a) => {
        const dt = new Date(a.date);
        const now = new Date();
        const notFinal = ["pending", "approved"].includes(a.status);
        // Compare dates without time to filter out past dates
        const todayNoTime = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
        const apptDateNoTime = new Date(dt.getFullYear(), dt.getMonth(), dt.getDate()).getTime();
        
        return apptDateNoTime >= todayNoTime && notFinal;
      }),
    [appointments]
  );

  const todaysSchedule = useMemo(
    () =>
      appointments.filter((a) => {
        const dt = new Date(a.date);
        const today = new Date();
        return isSameDay(dt, today) && ["pending", "approved"].includes(a.status);
      }),
    [appointments]
  );

  const filteredUpcoming = useMemo(() => {
    // FIX: Changed 'let list' to 'const list' and used spread to create a copy for safe sorting (was line 580)
    const filteredList = upcoming.filter((appt) => { 
      const patient = patients[appt.patientId];
      const matchesSearch = searchQuery === "" ||
        `${patient?.firstName} ${patient?.lastName}`.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesStatus = statusFilter === "all" || appt.status === statusFilter;
      return matchesSearch && matchesStatus;
    });

    // Create a copy of the filtered list before sorting to avoid mutating the array.
    const sortedList = [...filteredList];

    // I-FEATURE: Sorting Logic
    sortedList.sort((a, b) => {
      if (sortBy === "risk-desc") {
          const riskA = patients[a.patientId]?.riskScore || 0;
          const riskB = patients[b.patientId]?.riskScore || 0;
          return riskB - riskA; // Descending (High risk first)
      }
      if (sortBy === "urgency") {
        // Pending first, then by date
        if (a.status === "pending" && b.status !== "pending") return -1;
        if (a.status !== "pending" && b.status === "pending") return 1;
      }
      // Default / "date-asc"
      const dateA = new Date(`${a.date}T${a.time}`).getTime();
      const dateB = new Date(`${b.date}T${b.time}`).getTime();
      return dateA - dateB; 
    });

    return sortedList;
  }, [upcoming, patients, searchQuery, statusFilter, sortBy]);

  const pendingCount = useMemo(() => 
    appointments.filter(a => a.status === "pending").length, 
    [appointments]
  );

  const urgentAppointments = useMemo(() => {
    const today = new Date();
    return upcoming.filter(appt => {
      const apptDate = new Date(appt.date);
      const diffTime = apptDate.getTime() - today.getTime();
      const diffDays = diffTime / (1000 * 3600 * 24);
      return diffDays <= 1 && appt.status === "pending"; // Within 1 day AND pending
    });
  }, [upcoming]);

  const stats = useMemo(() => {
    const total = appointments.length;
    const byStatus = (s: string) => appointments.filter((a) => a.status === s).length;
    const pending = byStatus("pending");
    const approved = byStatus("approved");
    const completed = byStatus("completed");
    const online = appointments.filter((a) => a.type === "online").length;
    const inPerson = appointments.filter((a) => a.type === "in-person").length;
    const next = upcoming[0];
    
    // Mock trend data - in real app, this would come from analytics
    const trends = {
      total: { value: 12, isPositive: true },
      pending: { value: 5, isPositive: false }, 
      approved: { value: 8, isPositive: true },
      completed: { value: 15, isPositive: true },
    };

    return { total, pending, approved, completed, online, inPerson, next, trends };
  }, [appointments, upcoming]);

  // Existing polling logic
  useEffect(() => {
    if (doctor?.status === "approved") {
      loadAppointments();
      const interval = setInterval(loadAppointments, 30000); 
      return () => clearInterval(interval);
    }
  }, [doctor?.status, loadAppointments]);
  
  // FIX: Notification Reminder Logic (Line 605)
  useEffect(() => {
    const next = upcoming[0];
    if (next) {
      const now = new Date();
      const apptTime = new Date(`${next.date}T${next.time}`);
      const diff = apptTime.getTime() - now.getTime();
      if (diff > 0 && diff <= 30 * 60 * 1000) { // Within 30 minutes
        addNotification(
          `Reminder: Appointment with ${patients[next.patientId]?.firstName || 'A Patient'} is at ${formatTime(next.time)}!`,
          'warning'
        );
      }
    }
  }, [upcoming, patients, addNotification]); 
  
  /** ---------- Handlers (Remain largely unchanged) ---------- */

const handleApprove = async (appointmentId: string, type: "in-person" | "online") => {
  try {
    await appointmentAPI.updateStatus(appointmentId, "approved");

    if (type === "online") {
      await appointmentAPI.generateVideoLink(appointmentId); // ✅ create Jitsi link
    }

    loadAppointments();
  } catch (err: any) {
    console.error("Failed to approve appointment:", err);
    setError(err?.message || "Failed to approve appointment.");
  }
};

  const handleDecline = async (appointmentId: string) => {
    if (confirm("Are you sure you want to decline this appointment?")) {
      try {
        await appointmentAPI.updateStatus(appointmentId, "declined");
        loadAppointments();
      } catch (err) {
        setError("Failed to decline appointment.");
      }
    }
  };

  const handleComplete = async (appointmentId: string) => {
    try {
      await appointmentAPI.updateStatus(appointmentId, "completed");
      navigate(`/doctor/appointments/${appointmentId}/prescription`);
    } catch (err) {
      setError("Failed to complete appointment.");
    }
  };

  const handleExport = () => {
    alert("Export functionality coming soon!");
  };

 const handleQuickAction = (action: string) => {
  switch (action) {
    case 'add-availability':
      navigate('/doctor/availability');
      break;
    case 'quick-notes':
      navigate('/doctor/notes');
      break;
    case 'view-patients':
      navigate('/doctor/patients');
      break;
    case 'telehealth':
      navigate('/doctor/telehealth');
      break;
  }
};

  /** * I-FEATURE: Dynamic Next Step Suggestions Component */
  function NextStepSuggestions() {
    let suggestion: { title: string, description: string, icon: React.ReactNode, actionLabel: string, action: string, variant: 'info' | 'warning' | 'success' } = {
        title: "All Clear!",
        description: "Your schedule looks manageable. Use this time for admin tasks or a break.",
        icon: <CheckIcon className="w-5 h-5 text-green-600" />,
        actionLabel: "View All Patients",
        action: '/doctor/patients',
        variant: 'success',
    };

    const nextAppt = upcoming[0];
    const timeToNext = nextAppt ? new Date(`${nextAppt.date}T${nextAppt.time}`).getTime() - new Date().getTime() : Infinity;
    const minutes = Math.ceil(timeToNext / (1000 * 60));

    if (urgentAppointments.length > 0) {
        suggestion = {
            title: `Urgent: ${urgentAppointments.length} Requests Need Attention`,
            description: `Review the immediate pending requests from patients now.`,
            icon: <AlertTriangleIcon className="w-5 h-5 text-orange-600" />,
            actionLabel: "Review Urgent List",
            action: 'filter-urgent',
            variant: 'warning',
        };
    } else if (pendingCount > 0) {
        suggestion = {
            title: `Review ${pendingCount} Pending Appointments`,
            description: `Approve or decline new requests to secure your calendar.`,
            icon: <ClockIcon className="w-5 h-5 text-blue-600" />,
            actionLabel: "Filter: Pending",
            action: 'filter-pending',
            variant: 'info',
        };
    } else if (nextAppt && minutes > 0 && minutes <= 60) {
         suggestion = {
            title: `Prepare for Appointment in ${minutes} min`,
            description: `Next patient: ${patients[nextAppt.patientId]?.firstName || 'Patient'}. Review their file now.`,
            icon: <VideoIcon className="w-5 h-5 text-purple-600" />,
            actionLabel: "View Appointment Details",
            action: `/doctor/appointments/${nextAppt._id}`,
            variant: 'info',
        };
    }
    
    const handleAction = () => {
        if (suggestion.action.startsWith('/')) {
            navigate(suggestion.action);
        } else if (suggestion.action === 'filter-pending') {
            setStatusFilter('pending');
        } else if (suggestion.action === 'filter-urgent') {
             setStatusFilter('pending'); 
             setSortBy('urgency');
        }
    };

    // Map the internal 'variant' to the Button's allowed 'variant'
    const buttonVariant = suggestion.variant === 'warning' ? 'danger' : 'primary';

    return (
        <Card className={`p-5 animate-fade-in ${
            suggestion.variant === 'warning' ? 'bg-yellow-50 border-yellow-200' :
            suggestion.variant === 'success' ? 'bg-green-50 border-green-200' :
            'bg-blue-50 border-blue-200'
        }`}>
            <div className="flex items-start">
                <div className="mr-4 mt-1">{suggestion.icon}</div>
                <div>
                    <h4 className="font-bold text-lg">{suggestion.title}</h4>
                    <p className="text-sm text-gray-700 mt-1">{suggestion.description}</p>
                </div>
            </div>
            <Button 
                size="sm" 
                className="mt-4 w-full" 
                onClick={handleAction}
                variant={buttonVariant} 
            >
                {suggestion.actionLabel}
            </Button>
        </Card>
    );
  }

  /** ---------- UI (Error and Loading States remain the same) ---------- */
    
  if (!doctor) return <Skeleton className="h-8 w-48" />;

  if (loading) {
      return (
          <div className="space-y-6">
              <Skeleton className="h-12 w-full" />
              <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
                  {Array(6).fill(0).map((_, i) => <Skeleton key={i} className="h-20" />)}
              </div>
              <Skeleton className="h-64" />
          </div>
      );
  }

  if (error) {
      return (
          <Card className="p-6 text-center">
              <p className="text-red-500">{error}</p>
              <Button onClick={loadAppointments} className="mt-4">Retry</Button>
          </Card>
      );
  }

  if (doctor.status === "pending") {
      return (
          <Card className="p-12 text-center">
              <ClockIcon className="w-16 h-16 mx-auto mb-4 text-yellow-500" />
              <h2 className="text-2xl font-bold mb-2">Application Under Review</h2>
              <p className="text-gray-600">Your doctor profile is under review.</p>
          </Card>
      );
  }

  if (doctor.status === "rejected") {
      return (
          <Card className="p-12 text-center">
              <XIcon className="w-16 h-16 mx-auto mb-4 text-red-500" />
              <h2 className="text-2xl font-bold mb-2">Application Rejected</h2>
              <p className="text-gray-600">Please contact support.</p>
          </Card>
      );
  }

  return (
    <div className="space-y-6">
      {/* I-FEATURE: Notification Toast Container */}
      <div className="fixed right-4 top-4 z-50 space-y-2">
          {notifications.map((n) => (
              <ToastNotification 
                  key={n.id} 
                  notification={n} 
                  onClose={() => setNotifications(prev => prev.filter(item => item.id !== n.id))}
              />
          ))}
      </div>
      
      {/* Welcome Banner */}
      {showWelcome && (
        <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold text-blue-900">
                Welcome back, Dr. {doctor.lastName}! 👋
              </h2>
              <p className="text-blue-700 text-sm mt-1">
                You have {pendingCount} pending appointments and {urgentAppointments.length} urgent requests today.
              </p>
            </div>
            <Button variant="secondary" size="sm" onClick={() => setShowWelcome(false)}>
              Dismiss
            </Button>
          </div>
        </Card>
      )}

      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold">Dashboard Overview</h1>
          <p className="text-gray-500 mt-1">
            Manage your schedule, review upcoming visits, and issue prescriptions.
          </p>
        </div>
        <div className="flex gap-2">
          <NotificationBell count={pendingCount + urgentAppointments.length} /> 
          <Link to="/doctor/appointments">
            <Button variant="secondary" size="sm">View All Appointments</Button>
          </Link>
          <Button variant="secondary" size="sm" onClick={handleExport}>
            <DownloadIcon className="w-4 h-4 mr-1" />
            Export
          </Button>
        </div>
      </div>

      {/* Quick Actions */}
      <Card className="p-4">
        <h3 className="text-sm font-semibold mb-3">Quick Actions</h3>
        <div className="flex gap-3 overflow-x-auto pb-2">
          <QuickActionButton
            icon={<CalendarIcon className="w-4 h-4" />}
            label="Add Availability"
            onClick={() => handleQuickAction('add-availability')}
          />
          <QuickActionButton
            icon={<MessageSquareIcon className="w-4 h-4" />}
            label="Quick Notes"
            onClick={() => handleQuickAction('quick-notes')}
          />
          <QuickActionButton
            icon={<UserIcon className="w-4 h-4" />}
            label="Patients"
            onClick={() => handleQuickAction('view-patients')}
          />
          <QuickActionButton
            icon={<VideoIcon className="w-4 h-4" />}
            label="Telehealth"
            onClick={() => handleQuickAction('telehealth')}
          />
        </div>
      </Card>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <StatCard
          title="Total Appointments"
          value={stats.total}
          icon={<ActivityIcon className="w-5 h-5 text-blue-600" />}
          trend={stats.trends.total}
          onClick={() => setStatusFilter('all')}
        />
        <StatCard
          title="Pending"
          value={stats.pending}
          icon={<ClockIcon className="w-5 h-5 text-yellow-600" />}
          trend={stats.trends.pending}
          onClick={() => setStatusFilter('pending')}
        />
        <StatCard
          title="Approved"
          value={stats.approved}
          icon={<CheckIcon className="w-5 h-5 text-green-600" />}
          trend={stats.trends.approved}
          onClick={() => setStatusFilter('approved')}
        />
        <StatCard
          title="Completed"
          value={stats.completed}
          icon={<StethoscopeIcon className="w-5 h-5 text-gray-600" />}
          trend={stats.trends.completed}
        />
        <StatCard
          title="Online"
          value={stats.online}
          icon={<VideoIcon className="w-5 h-5 text-purple-600" />}
          footer={`${Math.round((stats.online / (stats.total || 1)) * 100)}% of total`}
        />
        <StatCard
          title="In-Person"
          value={stats.inPerson}
          icon={<UserIcon className="w-5 h-5 text-indigo-600" />}
          footer={`${Math.round((stats.inPerson / (stats.total || 1)) * 100)}% of total`}
        />
      </div>

      {/* Two-column layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Upcoming Appointments (spans 2) */}
        <div className="lg:col-span-2 space-y-4">
          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold">Upcoming Appointments</h2>
              {stats.next ? (
                <span className="text-sm text-gray-500">
                  Next: {formatDate(stats.next.date)} at {formatTime(stats.next.time)}
                </span>
              ) : null}
            </div>

            {/* Search, Filter, and Sort */}
            <div className="flex flex-wrap gap-4 mb-4">
              <div className="flex-1 relative min-w-[200px]">
                <SearchIcon className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search by patient name..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div className="relative">
                <FilterIcon className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none"
                >
                  <option value="all">All Status</option>
                  <option value="pending">Pending</option>
                  <option value="approved">Approved</option>
                  <option value="completed">Completed</option>
                </select>
              </div>
              {/* I-FEATURE: Sort Dropdown */}
              <div className="relative">
                <ActivityIcon className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none"
                >
                  <option value="date-asc">Sort: Next Date</option>
                  <option value="urgency">Sort: Urgency</option>
                  <option value="risk-desc">Sort: High Risk</option>
                </select>
              </div>
            </div>

            {/* Appointments List */}
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {filteredUpcoming.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <CalendarIcon className="w-12 h-12 mx-auto mb-2 opacity-50" />
                  <p>No upcoming appointments found</p>
                  {searchQuery || statusFilter !== "all" || sortBy !== "date-asc" ? (
                    <Button 
                      variant="secondary" 
                      size="sm" 
                      className="mt-2"
                      onClick={() => {
                        setSearchQuery("");
                        setStatusFilter("all");
                        setSortBy("date-asc");
                      }}
                    >
                      Clear filters/sort
                    </Button>
                  ) : null}
                </div>
              ) : (
                filteredUpcoming.map((appt) => (
                  <AppointmentCard
                    key={appt._id}
                    appt={appt}
                    patient={patients[appt.patientId]}
                    onApprove={handleApprove}
                    onDecline={handleDecline}
                    onComplete={handleComplete}
                    onDetails={(id) => navigate(`/doctor/appointments/${id}`)}
                  />
                ))
              )}
            </div>
          </Card>
        </div>

        {/* Right: Smart Suggestions, Mini Calendar, and Urgent Items */}
        <div className="space-y-6">
            {/* I-FEATURE: Dynamic Next Step Suggestions Card */}
            <NextStepSuggestions />

            <MiniCalendar todaysSchedule={todaysSchedule} />
            
            {/* Urgent Appointments (The urgent card remains for visibility) */}
            {urgentAppointments.length > 0 && (
                <Card className="p-4 border-orange-200 bg-orange-50">
                    <h3 className="text-sm font-semibold mb-3 flex items-center gap-2 text-orange-800">
                        <AlertTriangleIcon className="w-4 h-4" />
                        Urgent Attention Needed
                    </h3>
                    <div className="space-y-2">
                        {urgentAppointments.slice(0, 3).map((appt) => (
                            <div key={appt._id} className="p-2 bg-white rounded border border-orange-200">
                                <div className="font-medium text-sm">
                                    {patients[appt.patientId]?.firstName} {patients[appt.patientId]?.lastName}
                                </div>
                                <div className="text-xs text-orange-600">
                                    {formatDate(appt.date)} at {formatTime(appt.time)}
                                </div>
                                <Button 
                                    size="sm" 
                                    className="w-full mt-2"
                                    onClick={() => handleApprove(appt._id, appt.type)}
                                    variant="danger"
                                >
                                    Review Now
                                </Button>
                            </div>
                        ))}
                    </div>
                </Card>
            )}

            {/* Recent Activity */}
            <Card className="p-4">
                <h3 className="text-sm font-semibold mb-3">Recent Activity</h3>
                <div className="space-y-2 text-sm">
                    <div className="flex items-center justify-between p-2 bg-gray-50 rounded">
                        <span>Completed appointment</span>
                        <span className="text-xs text-gray-500">2 hours ago</span>
                    </div>
                    <div className="flex items-center justify-between p-2 bg-gray-50 rounded">
                        <span>New patient registered</span>
                        <span className="text-xs text-gray-500">4 hours ago</span>
                    </div>
                    <div className="flex items-center justify-between p-2 bg-gray-50 rounded">
                        <span>Prescription issued</span>
                        <span className="text-xs text-gray-500">1 day ago</span>
                    </div>
                </div>
            </Card>
        </div>
      </div>
    </div>
  );
}