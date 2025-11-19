import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { Button } from "../components/ui/Button";
import {
  MailIcon,
  LockIcon,
  EyeIcon,
  EyeOffIcon,
  HeartIcon,
  ShieldCheckIcon,
  UserIcon,
  StethoscopeIcon,
  CheckCircleIcon,
  AlertCircleIcon,
  ArrowRightIcon,
  SparklesIcon,
} from "lucide-react";

export function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [isFormVisible, setIsFormVisible] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

  const navigate = useNavigate();
  const { login } = useAuth();

  useEffect(() => {
    // Animate form in on mount
    const timer = setTimeout(() => setIsFormVisible(true), 100);
    return () => clearTimeout(timer);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccessMessage("");
    setLoading(true);

    if (!email || !password) {
      setError("Please fill in all fields");
      setLoading(false);
      return;
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError("Please enter a valid email address");
      setLoading(false);
      return;
    }

    try {
      const success = await login(email, password);
      setLoading(false);

      if (success) {
        const user = JSON.parse(localStorage.getItem("health_app_current_user") || "null");
        if (!user) {
          setError("Login failed, please try again.");
          return;
        }

        setSuccessMessage("Login successful! Redirecting...");
        setTimeout(() => {
          if (user.role === "patient") navigate("/patient/dashboard");
          else if (user.role === "doctor") navigate("/doctor/dashboard");
          else if (user.role === "admin") navigate("/admin/dashboard");
          else {
            // Fallback if role is not recognized
            setError("Unknown user role. Please contact support.");
          }
        }, 1500);
      } else {
        setError("Invalid email or password. Please check your credentials and try again.");
      }
    } catch (error: any) {
      setLoading(false);
      console.error("Login error:", error);
      setError(error?.message || "Login failed. Please try again.");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-100 via-blue-50 to-purple-100 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Enhanced Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-10 left-10 w-32 h-32 bg-blue-300 rounded-full blur-xl animate-pulse"></div>
        <div className="absolute bottom-10 right-10 w-40 h-40 bg-purple-300 rounded-full blur-xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-indigo-200 rounded-full blur-2xl animate-pulse delay-500"></div>
        <div className="absolute top-20 right-20 w-24 h-24 bg-pink-200 rounded-full blur-lg animate-bounce"></div>
        <div className="absolute bottom-20 left-20 w-20 h-20 bg-green-200 rounded-full blur-lg animate-bounce delay-700"></div>
      </div>

      {/* Floating Icons */}
      <div className="absolute inset-0 pointer-events-none">
        <HeartIcon className="absolute top-20 left-20 w-6 h-6 text-blue-300 opacity-20 animate-bounce" />
        <ShieldCheckIcon className="absolute bottom-32 right-32 w-5 h-5 text-purple-300 opacity-20 animate-bounce delay-300" />
        <SparklesIcon className="absolute top-1/3 right-10 w-4 h-4 text-indigo-300 opacity-20 animate-spin" />
      </div>

      <div className={`bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl p-8 w-full max-w-md relative z-10 border border-white/30 transition-all duration-700 transform ${
        isFormVisible ? 'translate-y-0 opacity-100 scale-100' : 'translate-y-8 opacity-0 scale-95'
      }`}>
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 rounded-full mb-4 shadow-xl animate-pulse">
            <HeartIcon className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent mb-2">
            MobileHealth
          </h1>
          <p className="text-gray-600 text-sm">Your health, our priority. Sign in to continue your journey.</p>
        </div>

        {/* Success Message */}
        {successMessage && (
          <div className="bg-green-50 border border-green-200 text-green-800 p-4 rounded-xl text-sm flex items-center gap-2 animate-fade-in mb-6">
            <CheckCircleIcon className="w-5 h-5 flex-shrink-0" />
            {successMessage}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-xl text-sm flex items-center gap-2 animate-fade-in">
              <AlertCircleIcon className="w-5 h-5 flex-shrink-0" />
              {error}
            </div>
          )}

          {/* Email Input */}
          <div className="relative group">
            <label className="block text-sm font-medium text-gray-700 mb-2 transition-colors group-focus-within:text-blue-600">
              Email Address
            </label>
            <div className="relative">
              <MailIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-blue-500 transition-colors" />
              <input
                type="email"
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 bg-gray-50 hover:bg-white group-hover:shadow-md"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                required
                disabled={loading}
              />
            </div>
          </div>

          {/* Password Input */}
          <div className="relative group">
            <label className="block text-sm font-medium text-gray-700 mb-2 transition-colors group-focus-within:text-blue-600">
              Password
            </label>
            <div className="relative">
              <LockIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-blue-500 transition-colors" />
              <input
                type={showPassword ? "text" : "password"}
                className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 bg-gray-50 hover:bg-white group-hover:shadow-md"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                disabled={loading}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors disabled:opacity-50"
                disabled={loading}
              >
                {showPassword ? <EyeOffIcon className="w-5 h-5" /> : <EyeIcon className="w-5 h-5" />}
              </button>
            </div>
          </div>

          {/* Forgot Password */}
          <div className="text-right">
            <Link
              to="/forgot-password"
              className="text-sm text-blue-600 hover:text-blue-800 transition-colors hover:underline"
            >
              Forgot your password?
            </Link>
          </div>

          {/* Submit Button */}
          <Button
            type="submit"
            fullWidth
            disabled={loading}
            className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 hover:from-blue-700 hover:via-purple-700 hover:to-pink-700 text-white font-semibold py-3 rounded-xl transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none shadow-lg hover:shadow-xl"
          >
            {loading ? (
              <div className="flex items-center justify-center gap-2">
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                Signing In...
              </div>
            ) : (
              <div className="flex items-center justify-center gap-2">
                Sign In
                <ArrowRightIcon className="w-4 h-4" />
              </div>
            )}
          </Button>
        </form>

        {/* Divider */}
        <div className="mt-8 mb-6">
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-4 bg-white text-gray-500 font-medium">New to MobileHealth?</span>
            </div>
          </div>
        </div>

        {/* Registration Links */}
        <div className="space-y-3">
          <Link to="/register">
            <button
              className="w-full flex items-center justify-center gap-2 py-3 border-2 border-blue-200 text-blue-700 hover:bg-blue-50 hover:border-blue-300 transition-all duration-300 rounded-xl font-medium hover:shadow-md disabled:opacity-50"
              disabled={loading}
            >
              <UserIcon className="w-4 h-4" />
              Register as Patient
            </button>
          </Link>

          <Link to="/doctor/register">
            <button
              className="w-full flex items-center justify-center gap-2 py-3 border-2 border-green-200 text-green-700 hover:bg-green-50 hover:border-green-300 transition-all duration-300 rounded-xl font-medium hover:shadow-md disabled:opacity-50"
              disabled={loading}
            >
              <StethoscopeIcon className="w-4 h-4" />
              Register as Doctor
            </button>
          </Link>
        </div>
      </div>
    </div>
  );
}
