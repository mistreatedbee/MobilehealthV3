import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { authAPI } from '../../services/api';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { PROVINCES, CITIES_BY_PROVINCE, SPECIALTIES } from '../../utils/constants';
export function DoctorRegister() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
    specialty: '',
    province: '',
    city: '',
    registrationNumber: '',
    yearsOfExperience: '',
    clinicName: '',
    phone: ''
  });
  const [cities, setCities] = useState<string[]>([]);
  const [error, setError] = useState('');
  const handleProvinceChange = (province: string) => {
    setFormData({
      ...formData,
      province,
      city: ''
    });
    setCities(CITIES_BY_PROVINCE[province] || []);
  };
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }
    const yearsExp = parseInt(formData.yearsOfExperience);
    if (isNaN(yearsExp) || yearsExp < 0) {
      setError('Please enter valid years of experience');
      return;
    }
    try {
      authAPI.registerDoctor({
        ...formData,
        yearsOfExperience: yearsExp
      });
      navigate('/login');
    } catch (err) {
      setError('Registration failed. Please try again.');
    }
  };
  return <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 py-8 px-4">
      <div className="max-w-3xl mx-auto">
        <div className="bg-white rounded-lg shadow-xl p-8">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-blue-600">HealthApp</h1>
            <p className="text-gray-600 mt-2">Doctor Registration</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {error && <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm">
                {error}
              </div>}

            <Card className="p-6">
              <h2 className="text-lg font-semibold mb-4">
                Personal Information
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input label="First Name" value={formData.firstName} onChange={e => setFormData({
                ...formData,
                firstName: e.target.value
              })} required />
                <Input label="Last Name" value={formData.lastName} onChange={e => setFormData({
                ...formData,
                lastName: e.target.value
              })} required />
                <Input type="email" label="Email" value={formData.email} onChange={e => setFormData({
                ...formData,
                email: e.target.value
              })} required />
                <Input type="tel" label="Phone" value={formData.phone} onChange={e => setFormData({
                ...formData,
                phone: e.target.value
              })} />
                <Input type="password" label="Password" value={formData.password} onChange={e => setFormData({
                ...formData,
                password: e.target.value
              })} required />
                <Input type="password" label="Confirm Password" value={formData.confirmPassword} onChange={e => setFormData({
                ...formData,
                confirmPassword: e.target.value
              })} required />
              </div>
            </Card>

            <Card className="p-6">
              <h2 className="text-lg font-semibold mb-4">
                Professional Information
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Select label="Specialty" value={formData.specialty} onChange={e => setFormData({
                ...formData,
                specialty: e.target.value
              })} options={SPECIALTIES.map(s => ({
                value: s,
                label: s
              }))} required />
                <Input label="Medical Registration Number" value={formData.registrationNumber} onChange={e => setFormData({
                ...formData,
                registrationNumber: e.target.value
              })} required />
                <Input type="number" label="Years of Experience" value={formData.yearsOfExperience} onChange={e => setFormData({
                ...formData,
                yearsOfExperience: e.target.value
              })} min="0" required />
                <Input label="Clinic Name" value={formData.clinicName} onChange={e => setFormData({
                ...formData,
                clinicName: e.target.value
              })} required />
              </div>
            </Card>

            <Card className="p-6">
              <h2 className="text-lg font-semibold mb-4">Practice Location</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Select label="Province" value={formData.province} onChange={e => handleProvinceChange(e.target.value)} options={PROVINCES.map(p => ({
                value: p,
                label: p
              }))} required />
                <Select label="City" value={formData.city} onChange={e => setFormData({
                ...formData,
                city: e.target.value
              })} options={cities.map(c => ({
                value: c,
                label: c
              }))} disabled={!formData.province} required />
              </div>
            </Card>

            <div className="bg-blue-50 p-4 rounded-lg">
              <p className="text-sm text-gray-700">
                Your application will be reviewed by our admin team. You'll
                receive access once approved.
              </p>
            </div>

            <Button type="submit" fullWidth>
              Submit Application
            </Button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              Already have an account?{' '}
              <Link to="/login" className="text-blue-600 hover:underline">
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>;
}