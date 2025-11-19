import React, { ReactNode, useState, useCallback, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  HomeIcon,
  CalendarIcon,
  UserIcon,
  VideoIcon,
  FileEditIcon,
  ClockIcon,
  LogOutIcon,
  HeartIcon,
  MenuIcon,
  XIcon,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

// DoctorSidebar Component (Enhanced for Modern UI)
export function DoctorSidebar() {
  const { pathname } = useLocation();

  const menu = [
    { name: "Dashboard", icon: <HomeIcon />, path: "/doctor/dashboard" },
    { name: "Appointments", icon: <CalendarIcon />, path: "/doctor/appointments" },
    { name: "Patients", icon: <UserIcon />, path: "/doctor/patients" },
    { name: "Availability", icon: <ClockIcon />, path: "/doctor/availability" },
    { name: "Notes", icon: <FileEditIcon />, path: "/doctor/notes" },
    { name: "Telehealth", icon: <VideoIcon />, path: "/doctor/telehealth" },
  ];

  return (
    <div className="h-full w-64 bg-white/95 backdrop-blur-xl border-r border-gray-200/50 p-6 space-y-3">
      <h2 className="text-lg font-semibold text-gray-800 mb-4">Doctor Menu</h2>
      {menu.map((item) => (
        <Link
          key={item.name}
          to={item.path}
          className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group ${
            pathname === item.path
              ? 'bg-gradient-to-r from-green-500 to-teal-500 text-white shadow-lg border border-green-300/50'
              : 'text-gray-700 hover:bg-gray-100 hover:shadow-md hover:scale-105'
          }`}
        >
          <span className={`w-5 h-5 transition-transform group-hover:scale-110 ${
            pathname === item.path ? 'text-white' : 'text-gray-500'
          }`}>
            {item.icon}
          </span>
          <span className="font-medium">{item.name}</span>
          {pathname === item.path && (
            <div className="ml-auto w-2 h-2 bg-white rounded-full animate-pulse"></div>
          )}
        </Link>
      ))}
    </div>
  );
}

interface DoctorLayoutProps {
  children: ReactNode;
}

export function DoctorLayout({ children }: DoctorLayoutProps) {
  const location = useLocation();
  const navigate = useNavigate();
  const { logout } = useAuth();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isContentVisible, setIsContentVisible] = useState(false);

  // Animate content in on mount or route change
  useEffect(() => {
    setIsContentVisible(false);
    const timer = setTimeout(() => setIsContentVisible(true), 100);
    return () => clearTimeout(timer);
  }, [location.pathname]);

  const handleLogout = useCallback(() => {
    if (window.confirm('Are you sure you want to log out?')) {
      logout();
      navigate('/login');
    }
  }, [logout, navigate]);

  const toggleSidebar = useCallback(() => setIsSidebarOpen((prev) => !prev), []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50">
      {/* Top Navigation */}
      <nav className="bg-white/90 backdrop-blur-lg border-b border-gray-200/50 shadow-lg sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-teal-500 rounded-full flex items-center justify-center shadow-md">
                <HeartIcon className="w-6 h-6 text-white" />
              </div>
              <h1 className="text-xl font-bold bg-gradient-to-r from-green-600 to-teal-600 bg-clip-text text-transparent">
                MobileHealth - Doctor Portal
              </h1>
            </div>

            {/* Mobile Menu Toggle */}
            <button
              onClick={toggleSidebar}
              className="md:hidden p-2 rounded-lg text-gray-600 hover:text-gray-900 hover:bg-gray-100 transition-colors"
              aria-label="Toggle sidebar"
            >
              {isSidebarOpen ? <XIcon className="w-6 h-6" /> : <MenuIcon className="w-6 h-6" />}
            </button>

            {/* Logout Button */}
            <button
              onClick={handleLogout}
              className="hidden md:flex items-center gap-2 px-4 py-2 text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-all duration-200 group"
            >
              <LogOutIcon className="w-5 h-5 group-hover:rotate-12 transition-transform" />
              <span>Logout</span>
            </button>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex gap-6">
          {/* Sidebar */}
          <aside
            className={`fixed inset-y-0 left-0 z-40 w-64 transform transition-transform duration-300 ease-in-out md:relative md:translate-x-0 md:shadow-lg md:rounded-lg ${
              isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
            } md:flex-shrink-0`}
          >
            <DoctorSidebar />
          </aside>

          {/* Backdrop for Mobile Sidebar */}
          {isSidebarOpen && (
            <div
              className="fixed inset-0 bg-black/50 z-30 md:hidden"
              onClick={() => setIsSidebarOpen(false)}
              aria-hidden="true"
            ></div>
          )}

          {/* Main Content */}
          <main
            className={`flex-1 transition-opacity duration-500 ${
              isContentVisible ? 'opacity-100' : 'opacity-0'
            }`}
          >
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-gray-200/50 p-6 md:p-8">
              {children}
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}
