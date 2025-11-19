import { User, Patient, Doctor, Appointment, Prescription, DoctorStatus, AppointmentStatus } from '../types';
import { API_URL } from '../utils/apiConfig';

async function request(endpoint: string, method = "GET", body?: any) {
  const options: RequestInit = {
    method,
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
  };

  if (body) options.body = JSON.stringify(body);

  console.log("🌐 API Request:", method, `${API_URL}${endpoint}`);

  try {
    const res = await fetch(`${API_URL}${endpoint}`, options);

    if (!res.ok) {
      const errorText = await res.text();
      let errorMessage = errorText;
      
      try {
        const errorJson = JSON.parse(errorText);
        errorMessage = errorJson.message || errorText;
      } catch {
        // Not JSON, use text as is
      }
      
      console.error("❌ API Error:", res.status, errorMessage);
      throw new Error(errorMessage || `Request failed: ${res.status}`);
    }

    const data = await res.json();
    console.log("✅ API Response:", endpoint, "success");
    return data;
  } catch (error: any) {
    console.error("❌ API Request failed:", endpoint, error.message);
    throw error;
  }
}

/* ---------------------- AUTH API ---------------------- */
export const authAPI = {
  login: (email: string, password: string): Promise<{ success: boolean; user?: User }> =>
    request(`/auth/login`, "POST", { email, password }),

  register: (data: Partial<Patient>): Promise<{ success: boolean; user?: User }> =>
    request(`/auth/register`, "POST", data),

  registerDoctor: (data: Partial<Doctor>): Promise<{ success: boolean; user?: User }> =>
    request(`/auth/register-doctor`, "POST", data),

  getCurrentUser: async (): Promise<{ success: boolean; user?: User } | null> => {
    const stored = localStorage.getItem("health_app_current_user");
    if (!stored) return null;

    const user = JSON.parse(stored) as User;
    return request(`/auth/me/${user._id}`, "GET");
  },

  logout: (): void => {
    localStorage.removeItem("health_app_current_user");
  },

  verifyEmail: (id: string, token: string): Promise<{ success: boolean; message?: string; user?: User }> =>
    request(`/auth/verify-email`, "POST", { id, token }),

  resendVerification: (email: string): Promise<{ success: boolean; message?: string }> =>
    request(`/auth/resend-verification`, "POST", { email }),

  forgotPassword: (email: string): Promise<{ success: boolean; message?: string }> =>
    request(`/auth/forgot-password`, "POST", { email }),

  resetPassword: (id: string, token: string, newPassword: string): Promise<{ success: boolean; message?: string }> =>
    request(`/auth/reset-password`, "POST", { id, token, newPassword }),
};

/* ---------------------- PATIENT API ---------------------- */
export const patientAPI = {
  getById: (id: string): Promise<Patient> =>
    request(`/patients/${id}`, "GET"),

  getByDoctor: (doctorId: string): Promise<Patient[]> =>
    request(`/patients/doctor/${doctorId}`, "GET"),

  updateProfile: (id: string, updates: Partial<Patient>): Promise<Patient> =>
    request(`/patients/${id}`, "PUT", updates),

  deleteAccount: (id: string): Promise<void> =>
    request(`/patients/${id}`, "DELETE"),
};

/* ---------------------- DOCTOR API ---------------------- */
export const doctorAPI = {
  getAll: (): Promise<Doctor[]> =>
    request(`/doctors`, "GET"),

  getApproved: (): Promise<Doctor[]> =>
    request(`/doctors/approved`, "GET"),

  getById: (id: string): Promise<Doctor> =>
    request(`/doctors/${id}`, "GET"),

  updateStatus: (id: string, status: DoctorStatus): Promise<Doctor> =>
    request(`/doctors/${id}/status`, "PUT", { status }),
};

/* ---------------------- APPOINTMENT API ---------------------- */
export const appointmentAPI = {
  create: (data: Omit<Appointment, "_id" | "createdAt" | "updatedAt">): Promise<Appointment> =>
    request(`/appointments`, "POST", data).then((res) => res.appointment),

  getByPatient: (patientId: string): Promise<Appointment[]> =>
    request(`/appointments/patient/${patientId}`, "GET"),

  getByDoctor: (doctorId: string): Promise<Appointment[]> =>
    request(`/appointments/doctor/${doctorId}`, "GET"),

  getAll: (): Promise<Appointment[]> =>
    request(`/appointments`, "GET"),

  getById: (id: string): Promise<Appointment> =>
    request(`/appointments/${id}`, "GET"),

  update: (id: string, updates: Partial<Appointment>): Promise<Appointment> =>
    request(`/appointments/${id}`, "PUT", updates),

  updateStatus: (id: string, status: AppointmentStatus): Promise<Appointment> =>
    request(`/appointments/${id}/status`, "PUT", { status }),

  generateVideoLink: (id: string): Promise<string> =>
    request(`/appointments/${id}/video-link`, "POST").then((res) => res.link),

  cancel: (id: string): Promise<Appointment> =>
    request(`/appointments/${id}/cancel`, "PUT"),
};

/* ---------------------- PRESCRIPTION API ---------------------- */
export const prescriptionAPI = {
  create: (data: Omit<Prescription, "_id" | "issuedAt">): Promise<Prescription> =>
    request(`/prescriptions`, "POST", data).then((res) => res.prescription),

  getByPatient: (patientId: string): Promise<Prescription[]> =>
    request(`/prescriptions/patient/${patientId}`, "GET"),

  // ✅ This will return the FULL populated prescription (after we update backend)
  getByAppointment: (appointmentId: string): Promise<Prescription> =>
    request(`/prescriptions/appointment/${appointmentId}`, "GET"),
};

/* ---------------------- ADMIN API ---------------------- */
export const adminAPI = {
  getAllPatients: (): Promise<Patient[]> =>
    request(`/admin/patients`, "GET"),

  deleteUser: (userId: string): Promise<void> =>
    request(`/admin/users/${userId}`, "DELETE"),

  getAllDoctors: (includeDeleted?: boolean): Promise<Doctor[]> =>
    request(`/admin/doctors${includeDeleted ? "?includeDeleted=true" : ""}`, "GET"),

  deleteDoctor: (doctorId: string, hard: boolean = false): Promise<{ success: boolean; message: string; cancelledAppointments?: number }> =>
    request(`/admin/doctors/${doctorId}`, "DELETE", { hard }),

  restoreDoctor: (doctorId: string): Promise<{ success: boolean; message: string }> =>
    request(`/admin/doctors/${doctorId}/restore`, "POST"),

  getStats: () =>
    request(`/admin/stats`, "GET"),
};

/* ---------------------- NOTIFICATIONS API ---------------------- */
export const notificationAPI = {
  getForUser: (userId: string) =>
    request(`/notifications/${userId}`, "GET").then(res => res.notifications ?? []),

  markRead: (id: string) =>
    request(`/notifications/${id}/read`, "PUT"),
};
