import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { appointmentAPI, prescriptionAPI } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { Appointment, Medication } from '../../types';
import { Card } from '../../components/ui/Card';
import { Input } from '../../components/ui/Input';
import { Textarea } from '../../components/ui/Textarea';
import { Button } from '../../components/ui/Button';
import { PlusIcon, XIcon } from 'lucide-react';

export function IssuePrescription() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [appointment, setAppointment] = useState<Appointment | null>(null);
  const [medications, setMedications] = useState<Medication[]>([
    { name: '', dosage: '', instructions: '', duration: '' }
  ]);
  const [notes, setNotes] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    (async () => {
      if (id) {
        const apt = await appointmentAPI.getById(id);
        setAppointment(apt ?? null);
      }
    })();
  }, [id]);

  const addMedication = () => {
    setMedications([...medications, { name: '', dosage: '', instructions: '', duration: '' }]);
  };

  const removeMedication = (index: number) => {
    setMedications(medications.filter((_, i) => i !== index));
  };

  const updateMedication = (index: number, field: keyof Medication, value: string) => {
    const updated = [...medications];
    updated[index][field] = value;
    setMedications(updated);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const validMedications = medications.filter(
      (m) => m.name && m.dosage && m.instructions && m.duration
    );

    if (validMedications.length === 0) {
      setError('Please add at least one complete medication');
      return;
    }

    if (!appointment) return;

    await prescriptionAPI.create({
      appointmentId: appointment._id,   // ✅ FIXED
      patientId: appointment.patientId, // ✅ stays same
      doctorId: user!._id,              // ✅ FIXED
      medications: validMedications,
      notes
    });

    navigate('/doctor/dashboard');
  };

  if (!appointment) {
    return (
      <Card className="p-12 text-center">
        <p className="text-gray-500">Appointment not found</p>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Issue Prescription</h1>
        <p className="text-gray-600 mt-1">
          Create prescription for completed appointment
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {error && <div className="bg-red-50 text-red-600 p-4 rounded-lg">{error}</div>}

        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">Medications</h2>
            <Button type="button" variant="secondary" size="sm" onClick={addMedication}>
              <PlusIcon className="w-4 h-4 mr-1" />
              Add Medication
            </Button>
          </div>

          <div className="space-y-6">
            {medications.map((med, index) => (
              <div key={index} className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-medium">Medication {index + 1}</h3>
                  {medications.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeMedication(index)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <XIcon className="w-5 h-5" />
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input label="Medication Name" value={med.name} onChange={(e) => updateMedication(index, 'name', e.target.value)} required />
                  <Input label="Dosage" value={med.dosage} onChange={(e) => updateMedication(index, 'dosage', e.target.value)} required />
                  <Input label="Instructions" value={med.instructions} onChange={(e) => updateMedication(index, 'instructions', e.target.value)} required />
                  <Input label="Duration" value={med.duration} onChange={(e) => updateMedication(index, 'duration', e.target.value)} required />
                </div>
              </div>
            ))}
          </div>
        </Card>

        <Card className="p-6">
          <Textarea
            label="Additional Notes (Optional)"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={4}
          />
        </Card>

        <div className="flex gap-4">
          <Button type="submit" variant="primary">
            Issue Prescription
          </Button>
          <Button type="button" variant="secondary" onClick={() => navigate('/doctor/dashboard')}>
            Cancel
          </Button>
        </div>
      </form>
    </div>
  );
}
