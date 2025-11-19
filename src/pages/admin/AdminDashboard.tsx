import React, { useEffect, useState } from "react";
import { Card } from "../../components/ui/Card";
import { useNavigate } from "react-router-dom"; // Added for navigation
import {
  UsersIcon,
  UserCheckIcon,
  CalendarIcon,
  VideoIcon,
  ClipboardIcon,
  TrendingUpIcon,
  ActivityIcon,
  ShieldCheckIcon,
  RefreshCwIcon,
  MoreVerticalIcon,
  AlertCircleIcon,
} from "lucide-react";
import { adminAPI } from "../../services/api";
import { StatCard } from "../../components/ui/StatCard";

export function AdminDashboard() {
  const navigate = useNavigate(); // For navigation
  const [stats, setStats] = useState({
    totalPatients: 0,
    totalDoctors: 0,
    totalAppointments: 0,
    onlineAppointments: 0,
    inPersonAppointments: 0,
  });

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadStats = async () => {
    try {
      setRefreshing(true);
      setError(null);
      const data = await adminAPI.getStats();
      setStats(data);
    } catch (err) {
      console.error("Failed to load admin stats:", err);
      setError("Failed to load stats. Please try again.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadStats();
  }, []);

  // Calculate percentages for the appointment split
  const onlinePercentage = stats.totalAppointments > 0 
    ? Math.round((stats.onlineAppointments / stats.totalAppointments) * 100)
    : 0;
  
  const inPersonPercentage = 100 - onlinePercentage;

  // Quick action handlers with navigation
  const handleQuickAction = (action: string) => {
    switch (action) {
      case 'manage-patients':
        navigate('/admin/patients'); // Adjust route as needed
        break;
      case 'doctor-management':
        navigate('/admin/doctors'); // Adjust route as needed
        break;
      case 'appointments':
        navigate('/admin/appointments'); // Adjust route as needed
        break;
      case 'analytics':
        navigate('/admin/analytics'); // Adjust route as needed
        break;
      default:
        break;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/4 mb-2"></div>
            <div className="h-4 bg-gray-200 rounded w-1/3 mb-8"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="h-32 bg-gray-200 rounded-xl"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center">
              <AlertCircleIcon className="w-12 h-12 text-red-500 mx-auto mb-4" />
              <h2 className="text-xl font-semibold text-gray-900 mb-2">Error Loading Dashboard</h2>
              <p className="text-gray-600 mb-4">{error}</p>
              <button
                onClick={loadStats}
                className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
              >
                Retry
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Header Section - Enhanced */}
        <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                Admin Dashboard
              </h1>
              <p className="text-gray-600 mt-2">
                Real-time platform analytics and system overview
              </p>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={loadStats}
                disabled={refreshing}
                className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <RefreshCwIcon className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
                {refreshing ? 'Refreshing...' : 'Refresh'}
              </button>
              <button className="p-2 bg-gray-100 border border-gray-300 rounded-lg hover:bg-gray-200 transition-colors duration-200">
                <MoreVerticalIcon className="w-5 h-5 text-gray-600" />
              </button>
            </div>
          </div>
        </div>

        {/* Stats Grid - Clean + Responsive */}
<div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
  <Card className="p-4 border border-gray-200 rounded-xl shadow-sm hover:shadow-md transition-all">
    <StatCard
      title="Total Patients"
      value={stats.totalPatients.toLocaleString()}
      icon={<UsersIcon className="w-5 h-5 text-indigo-600" />}
      small
    />
  </Card>

  <Card className="p-4 border border-gray-200 rounded-xl shadow-sm hover:shadow-md transition-all">
    <StatCard
      title="Active Doctors"
      value={stats.totalDoctors.toLocaleString()}
      icon={<UserCheckIcon className="w-5 h-5 text-green-600" />}
      small
    />
  </Card>

  <Card className="p-4 border border-gray-200 rounded-xl shadow-sm hover:shadow-md transition-all">
    <StatCard
      title="Appointments"
      value={stats.totalAppointments.toLocaleString()}
      icon={<CalendarIcon className="w-5 h-5 text-purple-600" />}
      small
    />
  </Card>

  <Card className="p-4 border border-gray-200 rounded-xl shadow-sm hover:shadow-md transition-all">
    <StatCard
      title="Online Consults"
      value={stats.onlineAppointments.toLocaleString()}
      icon={<VideoIcon className="w-5 h-5 text-blue-600" />}
      small
    />
  </Card>

  <Card className="p-4 border border-gray-200 rounded-xl shadow-sm hover:shadow-md transition-all">
    <StatCard
      title="In-Person"
      value={stats.inPersonAppointments.toLocaleString()}
      icon={<ClipboardIcon className="w-5 h-5 text-orange-600" />}
      small
    />
  </Card>
</div>

        {/* Analytics Section - Enhanced */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Appointment Distribution */}
          <div className="lg:col-span-2 bg-white border border-gray-200 rounded-xl shadow-lg p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold text-gray-900">Appointment Distribution</h2>
              <ActivityIcon className="w-5 h-5 text-gray-400" />
            </div>
            
            <div className="space-y-6">
              {/* Progress Bars */}
              <div className="space-y-4">
                <div className="flex justify-between text-sm">
                  <span className="font-medium text-gray-700">Online Consultations</span>
                  <span className="font-semibold text-purple-600">{onlinePercentage}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-4 overflow-hidden">
                  <div 
                    className="bg-gradient-to-r from-purple-500 to-purple-600 h-4 rounded-full transition-all duration-1000 ease-out"
                    style={{ width: `${onlinePercentage}%` }}
                  ></div>
                </div>

                <div className="flex justify-between text-sm mt-6">
                  <span className="font-medium text-gray-700">In-Person Visits</span>
                  <span className="font-semibold text-orange-500">{inPersonPercentage}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-4 overflow-hidden">
                  <div 
                    className="bg-gradient-to-r from-orange-500 to-orange-600 h-4 rounded-full transition-all duration-1000 ease-out"
                    style={{ width: `${inPersonPercentage}%` }}
                  ></div>
                </div>
              </div>

              {/* Summary */}
              <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-100">
                <div className="text-center p-4 bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg border border-purple-200">
                  <div className="text-2xl font-bold text-purple-600">{stats.onlineAppointments}</div>
                  <div className="text-sm text-purple-700 font-medium">Online</div>
                </div>
                <div className="text-center p-4 bg-gradient-to-br from-orange-50 to-orange-100 rounded-lg border border-orange-200">
                  <div className="text-2xl font-bold text-orange-500">{stats.inPersonAppointments}</div>
                  <div className="text-sm text-orange-600 font-medium">In-Person</div>
                </div>
              </div>
            </div>
          </div>

          {/* System Status - Enhanced */}
          <div className="bg-white border border-gray-200 rounded-xl shadow-lg p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold text-gray-900">System Status</h2>
              <ShieldCheckIcon className="w-5 h-5 text-green-500" />
            </div>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-gradient-to-r from-green-50 to-green-100 rounded-lg border border-green-200">
                <span className="text-sm font-medium text-green-800">API Service</span>
                <div className="flex items-center gap-1">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                  <span className="text-xs text-green-600 font-medium">Operational</span>
                </div>
              </div>

              <div className="flex items-center justify-between p-3 bg-gradient-to-r from-green-50 to-green-100 rounded-lg border border-green-200">
                <span className="text-sm font-medium text-green-800">Database</span>
                <div className="flex items-center gap-1">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                  <span className="text-xs text-green-600 font-medium">Connected</span>
                </div>
              </div>

              <div className="flex items-center justify-between p-3 bg-gradient-to-r from-blue-50 to-blue-100 rounded-lg border border-blue-200">
                <span className="text-sm font-medium text-blue-800">Uptime</span>
                <span className="text-xs text-blue-600 font-medium">99.9%</span>
              </div>

              <div className="flex items-center justify-between p-3 bg-gradient-to-r from-gray-50 to-gray-100 rounded-lg border border-gray-200">
                <span className="text-sm font-medium text-gray-800">Last Updated</span>
                <span className="text-xs text-gray-600 font-medium">
                  {new Date().toLocaleTimeString()}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions - Now Functional */}
        <div className="bg-white border border-gray-200 rounded-xl shadow-lg p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-6">Quick Actions</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <button 
              onClick={() => handleQuickAction('manage-patients')}
              className="p-4 text-left border border-gray-200 rounded-lg hover:border-indigo-300 hover:bg-gradient-to-br hover:from-indigo-50 hover:to-indigo-100 transition-all duration-300 group focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
            >
              <UsersIcon className="w-6 h-6 text-indigo-600 mb-2 group-hover:scale-110 transition-transform" />
              <div className="font-medium text-gray-900 group-hover:text-indigo-700">Manage Patients</div>
              <div className="text-sm text-gray-500 group-hover:text-indigo-600">View all patient records</div>
            </button>

            <button 
              onClick={() => handleQuickAction('doctor-management')}
              className="p-4 text-left border border-gray-200 rounded-lg hover:border-green-300 hover:bg-gradient-to-br hover:from-green-50 hover:to-green-100 transition-all duration-300 group focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
            >
              <UserCheckIcon className="w-6 h-6 text-green-600 mb-2 group-hover:scale-110 transition-transform" />
              <div className="font-medium text-gray-900 group-hover:text-green-700">Doctor Management</div>
              <div className="text-sm text-gray-500 group-hover:text-green-600">Approve and manage doctors</div>
            </button>

            <button 
              onClick={() => handleQuickAction('appointments')}
              className="p-4 text-left border border-gray-200 rounded-lg hover:border-purple-300 hover:bg-gradient-to-br hover:from-purple-50 hover:to-purple-100 transition-all duration-300 group focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2"
            >
              <CalendarIcon className="w-6 h-6 text-purple-600 mb-2 group-hover:scale-110 transition-transform" />
              <div className="font-medium text-gray-900 group-hover:text-purple-700">Appointments</div>
              <div className="text-sm text-gray-500 group-hover:text-purple-600">Schedule and manage bookings</div>
            </button>

            <button 
              onClick={() => handleQuickAction('analytics')}
              className="p-4 text-left border border-gray-200 rounded-lg hover:border-blue-300 hover:bg-gradient-to-br hover:from-blue-50 hover:to-blue-100 transition-all duration-300 group focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              <TrendingUpIcon className="w-6 h-6 text-blue-600 mb-2 group-hover:scale-110 transition-transform" />
              <div className="font-medium text-gray-900 group-hover:text-blue-700">Analytics</div>
              <div className="text-sm text-gray-500 group-hover:text-blue-600">View detailed reports</div>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
