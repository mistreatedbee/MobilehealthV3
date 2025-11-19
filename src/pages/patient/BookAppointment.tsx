import React, { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { appointmentAPI } from "../../services/api";
import { useAuth } from "../../context/AuthContext";
import { Doctor } from "../../types";
import { Card } from "../../components/ui/Card";
import { TIME_SLOTS } from "../../utils/constants";

export function BookAppointment() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();

  const doctor = location.state?.doctor as Doctor;

  const [formData, setFormData] = useState({
    type: "in-person" as "in-person" | "online",
    date: "",
    time: "",
    reason: "",
  });

  const [error, setError] = useState("");

  if (!doctor) {
    return (
      <Card className="p-12 text-center">
        <p className="text-gray-500">No doctor selected</p>
        <button
          onClick={() => navigate("/patient/doctors")}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg mt-4"
        >
          Browse Doctors
        </button>
      </Card>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!user) {
      setError("You must be logged in to book an appointment.");
      return;
    }

    if (!formData.date || !formData.time || !formData.reason) {
      setError("Please fill in all fields");
      return;
    }

    const appointmentDate = new Date(formData.date);
    if (appointmentDate < new Date()) {
      setError("Please select a future date");
      return;
    }

    try {
  await appointmentAPI.create({
  patientId: user._id,
  doctorId: doctor._id,
  type: formData.type,
  date: formData.date,   // ✅ stay as string
  time: formData.time,
  reason: formData.reason,
  status: "pending"
});

      navigate("/patient/appointments");
    } catch (err) {
      setError("Something went wrong while booking the appointment");
    }
  };

  const minDate = new Date().toISOString().split("T")[0];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Book Appointment</h1>
        <p className="text-gray-600 mt-1">Schedule your consultation</p>
      </div>

      <Card className="p-6">
        <h2 className="text-lg font-semibold mb-4">Doctor Details</h2>
        <div className="bg-gray-50 p-4 rounded-lg">
          <p className="font-semibold">
            Dr. {doctor.firstName} {doctor.lastName}
          </p>
          <p className="text-sm text-gray-600">{doctor.specialty}</p>
          <p className="text-sm text-gray-600">{doctor.clinicName}</p>
          <p className="text-sm text-gray-600">
            {doctor.city}, {doctor.province}
          </p>
        </div>
      </Card>

      <form onSubmit={handleSubmit} className="space-y-6">
        {error && <div className="bg-red-50 text-red-600 p-4 rounded-lg">{error}</div>}

        <Card className="p-6">
          <h2 className="text-lg font-semibold mb-4">Appointment Details</h2>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium">Appointment Type</label>
              <select
                className="w-full border rounded-lg p-3"
                value={formData.type}
                onChange={(e) =>
                  setFormData({ ...formData, type: e.target.value as "in-person" | "online" })
                }
              >
                <option value="in-person">In-Person Visit</option>
                <option value="online">Online Consultation</option>
              </select>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium">Preferred Date</label>
                <input
                  type="date"
                  className="w-full border rounded-lg p-3"
                  min={minDate}
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium">Preferred Time</label>
                <select
                  className="w-full border rounded-lg p-3"
                  value={formData.time}
                  onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                  required
                >
                  {TIME_SLOTS.map((t) => (
                    <option key={t} value={t}>
                      {t}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium">Reason for Visit</label>
              <textarea
                className="w-full border rounded-lg p-3"
                rows={4}
                placeholder="Describe your symptoms"
                value={formData.reason}
                onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                required
              />
            </div>
          </div>
        </Card>

        <div className="flex gap-4">
          <button type="submit" className="px-5 py-2 bg-blue-600 text-white rounded-lg">
            Book Appointment
          </button>
          <button
            type="button"
            className="px-5 py-2 bg-gray-300 rounded-lg"
            onClick={() => navigate("/patient/doctors")}
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
