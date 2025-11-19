export type UserRole = 'patient' | 'doctor' | 'admin';
export type AppointmentType = 'in-person' | 'online';
export type AppointmentStatus = 'pending' | 'approved' | 'declined' | 'completed' | 'cancelled';
export type DoctorStatus = 'pending' | 'approved' | 'rejected';
export type AppointmentResponse = Appointment[] | { appointments: Appointment[] };

export interface User {
  _id: string;
  email: string;
  password: string;
  role: UserRole;
  createdAt: string;
}

export interface Patient {
  _id: string;
  role: "patient";

  // Identity
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
   age?: number; // ✅ Add this

  // Personal Information
  gender?: "male" | "female" | "other";
  dateOfBirth?: string;

  // Location
  province?: string;
  city?: string;

  // Medical Profile
  bloodType?: string;
  allergies?: string[];
  chronicConditions?: string[];
  currentMedications?: string[];
  pastProcedures?: string[];
    medicalHistory?: string; // ✅ Add this

  // Emergency Contact
  emergencyContactName?: string;
  emergencyContactPhone?: string;

  // Timestamps
  createdAt?: string;
  updatedAt?: string;
}



export interface Doctor extends User {
  role: 'doctor';
  firstName: string;
  lastName: string;
  specialty: string;
  province: string;
  city: string;
  registrationNumber: string;
  yearsOfExperience: number;
  clinicName: string;
  phone?: string;
  status: DoctorStatus;
  createdAt?: string;
  updatedAt?: string;
}

export interface Appointment {
  _id: string;
  patientId: string | Patient; 
  doctorId: string | Doctor;
  type: AppointmentType;
  date: string;
  time: string;
  reason: string;
  status: AppointmentStatus;
  videoCallLink?: string;
  patients?: Patient;
}

export interface Medication {
  name: string;
  dosage: string;
  instructions: string;
  duration: string;
  frequency?: string;
}

export interface Prescription {
  _id: string;
  appointmentId: string;
  patientId: string;
  doctorId: string;
  medications: Medication[];
  notes?: string;
  issuedAt: string;
}

export interface EnhancedAppointment extends Appointment {
  notes?: string;
  estimatedDuration: number;
}
export interface EnhancedPatient extends Patient {
  isVIP: boolean;
}