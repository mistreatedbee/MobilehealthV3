import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { MapPinIcon, StethoscopeIcon } from "lucide-react";
import { doctorAPI } from "../../services/api";
import { Doctor } from "../../types";
import { Card } from "../../components/ui/Card";
import { PROVINCES, CITIES_BY_PROVINCE, SPECIALTIES } from "../../utils/constants";

export function DoctorList() {
  const navigate = useNavigate();
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [filteredDoctors, setFilteredDoctors] = useState<Doctor[]>([]);
  const [filters, setFilters] = useState({
    province: "",
    city: "",
    specialty: "",
  });
  const [cities, setCities] = useState<string[]>([]);

  // ✅ Load approved doctors from backend
  useEffect(() => {
    const fetchDoctors = async () => {
      try {
        const result = await doctorAPI.getApproved();
        setDoctors(result);
        setFilteredDoctors(result);
      } catch (error) {
        console.log("Failed to load doctors:", error);
      }
    };
    fetchDoctors();
  }, []);

  // ✅ Update city dropdown when province changes
  useEffect(() => {
    if (filters.province) {
      setCities(CITIES_BY_PROVINCE[filters.province] || []);
    } else {
      setCities([]);
    }
  }, [filters.province]);

  // ✅ Apply filters
  useEffect(() => {
    let filtered = doctors;

    if (filters.province) {
      filtered = filtered.filter((d) => d.province === filters.province);
    }
    if (filters.city) {
      filtered = filtered.filter((d) => d.city === filters.city);
    }
    if (filters.specialty) {
      filtered = filtered.filter((d) => d.specialty === filters.specialty);
    }

    setFilteredDoctors(filtered);
  }, [filters, doctors]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Find a Doctor</h1>
        <p className="text-gray-600 mt-1">
          Search and book appointments with healthcare professionals
        </p>
      </div>

      <Card className="p-6">
        <h2 className="text-lg font-semibold mb-4">Filter Doctors</h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Province Filter */}
          <div>
            <label className="block text-sm font-medium">Province</label>
            <select
              className="w-full border rounded-lg p-3"
              value={filters.province}
              onChange={(e) =>
                setFilters({ ...filters, province: e.target.value, city: "" })
              }
            >
              <option value="">All</option>
              {PROVINCES.map((p) => (
                <option key={p} value={p}>
                  {p}
                </option>
              ))}
            </select>
          </div>

          {/* City Filter */}
          <div>
            <label className="block text-sm font-medium">City</label>
            <select
              className="w-full border rounded-lg p-3"
              value={filters.city}
              onChange={(e) =>
                setFilters({ ...filters, city: e.target.value })
              }
              disabled={!filters.province}
            >
              <option value="">All</option>
              {cities.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>

          {/* Specialty Filter */}
          <div>
            <label className="block text-sm font-medium">Specialty</label>
            <select
              className="w-full border rounded-lg p-3"
              value={filters.specialty}
              onChange={(e) =>
                setFilters({ ...filters, specialty: e.target.value })
              }
            >
              <option value="">All</option>
              {SPECIALTIES.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>
        </div>

        {(filters.province || filters.city || filters.specialty) && (
          <button
            className="mt-4 text-sm text-blue-600 underline"
            onClick={() =>
              setFilters({ province: "", city: "", specialty: "" })
            }
          >
            Clear Filters
          </button>
        )}
      </Card>

      <div>
        <p className="text-sm text-gray-600 mb-4">
          {filteredDoctors.length} doctor
          {filteredDoctors.length !== 1 ? "s" : ""} found
        </p>

        {filteredDoctors.length === 0 ? (
          <Card className="p-12 text-center">
            <StethoscopeIcon className="w-12 h-12 mx-auto mb-3 text-gray-400" />
            <p className="text-gray-500">No doctors found matching your criteria</p>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredDoctors.map((doctor) => (
              <Card key={doctor._id} className="p-6 hover:shadow-md transition-shadow">
                <h3 className="text-lg font-semibold">
                  Dr. {doctor.firstName} {doctor.lastName}
                </h3>
                <p className="text-blue-600 font-medium">{doctor.specialty}</p>

                <div className="text-sm text-gray-600 mt-2">
                  <MapPinIcon className="w-4 h-4 inline-block mr-1" />
                  {doctor.city}, {doctor.province}
                </div>

                <button
                  className="mt-4 w-full bg-blue-600 text-white py-2 rounded-lg"
                  onClick={() =>
                    navigate("/patient/book-appointment", { state: { doctor } })
                  }
                >
                  Book Appointment
                </button>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
