import React, { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { patientAPI } from '../../services/api';
import { Patient } from '../../types';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';
import { Textarea } from '../../components/ui/Textarea';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { PROVINCES, CITIES_BY_PROVINCE, BLOOD_TYPES } from '../../utils/constants';
import { User } from "../../types";


export function PatientProfile() {
  const { user, updateUser } = useAuth();
  const patient = user as unknown as Patient;
  const patientId = (patient as any)._id; // ✅ Correct ID

const [formData, setFormData] = useState<{
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  gender: "male" | "female" | "other" | "";
  province: string;
  city: string;
  phone: string;
  bloodType: string;
  allergies: string;
  chronicConditions: string;
  currentMedications: string;
  pastProcedures: string;
  emergencyContactName: string;
  emergencyContactPhone: string;
}>({
  firstName: patient.firstName || "",
  lastName: patient.lastName || "",
  dateOfBirth: patient.dateOfBirth || "",
  gender: patient.gender || "",
  province: patient.province || "",
  city: patient.city || "",
  phone: patient.phone || "",
  bloodType: patient.bloodType || "",
  allergies: patient.allergies?.join(", ") || "",
  chronicConditions: patient.chronicConditions?.join(", ") || "",
  currentMedications: patient.currentMedications?.join(", ") || "",
  pastProcedures: patient.pastProcedures?.join(", ") || "",
  emergencyContactName: patient.emergencyContactName || "",
  emergencyContactPhone: patient.emergencyContactPhone || "",
});


  const [cities, setCities] = useState<string[]>([]);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (formData.province) {
      setCities(CITIES_BY_PROVINCE[formData.province] || []);
    }
  }, [formData.province]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const updates: Partial<Patient> = {
        ...formData,
        gender: formData.gender || undefined,
        allergies: formData.allergies.split(",").map(s => s.trim()).filter(Boolean),
        chronicConditions: formData.chronicConditions.split(",").map(s => s.trim()).filter(Boolean),
        currentMedications: formData.currentMedications.split(",").map(s => s.trim()).filter(Boolean),
        pastProcedures: formData.pastProcedures.split(",").map(s => s.trim()).filter(Boolean),
      };

      const updatedPatient = await patientAPI.updateProfile(patientId, updates);
      updateUser(updatedPatient as unknown as User);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err: any) {
      console.error("Failed to update profile:", err);
      alert(err?.message || "Failed to update profile. Please try again.");
    }
  };

  const handleDelete = async () => {
    if (!confirm('Are you sure? This cannot be undone.')) {
      return;
    }

    try {
      await patientAPI.deleteAccount(patientId);
      localStorage.removeItem("health_app_current_user");
      window.location.href = "/login";
    } catch (err: any) {
      console.error("Failed to delete account:", err);
      alert(err?.message || "Failed to delete account. Please try again.");
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Medical Profile</h1>
        <p className="text-gray-600 mt-1">
          Keep your health information up to date
        </p>
      </div>

      {success && (
        <div className="bg-green-50 text-green-600 p-4 rounded-lg">
          Profile updated successfully!
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <Card className="p-6">
          <h2 className="text-lg font-semibold mb-4">Personal Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input label="First Name" value={formData.firstName} onChange={e => setFormData({ ...formData, firstName: e.target.value })} required />
            <Input label="Last Name" value={formData.lastName} onChange={e => setFormData({ ...formData, lastName: e.target.value })} required />
            <Input type="date" label="Date of Birth" value={formData.dateOfBirth} onChange={e => setFormData({ ...formData, dateOfBirth: e.target.value })} />

            <Select
            label="Gender"
            value={formData.gender}
            onChange={e => setFormData({ ...formData, gender: e.target.value as "male" | "female" | "other" | "" })}
            options={[
            { value: "male", label: "Male" },
            { value: "female", label: "Female" },
            { value: "other", label: "Other" }
              ]}
                  />
            

            <Input type="tel" label="Phone" value={formData.phone} onChange={e => setFormData({ ...formData, phone: e.target.value })} />

            <Select label="Blood Type" value={formData.bloodType} onChange={e => setFormData({ ...formData, bloodType: e.target.value })}
              options={BLOOD_TYPES.map(type => ({ value: type, label: type }))}
            />
          </div>
        </Card>

        <Card className="p-6">
          <h2 className="text-lg font-semibold mb-4">Location</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Select
              label="Province"
              value={formData.province}
              onChange={e => setFormData({ ...formData, province: e.target.value, city: "" })}
              options={PROVINCES.map(p => ({ value: p, label: p }))}
            />
            <Select
              label="City"
              value={formData.city}
              onChange={e => setFormData({ ...formData, city: e.target.value })}
              options={cities.map(c => ({ value: c, label: c }))}
              disabled={!formData.province}
            />
          </div>
        </Card>

        <Card className="p-6">
          <h2 className="text-lg font-semibold mb-4">Medical History</h2>
          <div className="space-y-4">
            <Textarea label="Allergies (comma-separated)" value={formData.allergies} onChange={e => setFormData({ ...formData, allergies: e.target.value })} rows={2} />
            <Textarea label="Chronic Conditions (comma-separated)" value={formData.chronicConditions} onChange={e => setFormData({ ...formData, chronicConditions: e.target.value })} rows={2} />
            <Textarea label="Current Medications (comma-separated)" value={formData.currentMedications} onChange={e => setFormData({ ...formData, currentMedications: e.target.value })} rows={2} />
            <Textarea label="Past Procedures" value={formData.pastProcedures} onChange={e => setFormData({ ...formData, pastProcedures: e.target.value })} rows={2} />
          </div>
        </Card>

        <Card className="p-6">
          <h2 className="text-lg font-semibold mb-4">Emergency Contact</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input label="Contact Name" value={formData.emergencyContactName} onChange={e => setFormData({ ...formData, emergencyContactName: e.target.value })} />
            <Input label="Contact Phone" value={formData.emergencyContactPhone} onChange={e => setFormData({ ...formData, emergencyContactPhone: e.target.value })} />
          </div>
        </Card>

        <div className="flex gap-4">
          <Button type="submit" variant="primary">Save Changes</Button>
          <Button type="button" variant="danger" onClick={handleDelete}>Delete Account</Button>
        </div>
      </form>
    </div>
  );
}
