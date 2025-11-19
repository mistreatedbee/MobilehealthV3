export const SPECIALTIES = [
  'General Practitioner',
  'Cardiologist',
  'Dermatologist',
  'Dentist',
  'Pediatrician',
  'Psychiatrist',
  'Orthopedic Surgeon',
  'Gynecologist',
  'Neurologist',
  'Ophthalmologist'
];

/* ✅ South African Provinces */
export const PROVINCES = [
  'Eastern Cape',
  'Free State',
  'Gauteng',
  'KwaZulu-Natal',
  'Limpopo',
  'Mpumalanga',
  'North West',
  'Northern Cape',
  'Western Cape'
];

/* ✅ South African Cities by Province */
export const CITIES_BY_PROVINCE: Record<string, string[]> = {
  'Eastern Cape': ['Bhisho', 'Port Elizabeth', 'East London', 'Mthatha'],
  'Free State': ['Bloemfontein', 'Welkom', 'Bethlehem'],
  'Gauteng': ['Johannesburg', 'Pretoria', 'Soweto', 'Sandton'],
  'KwaZulu-Natal': ['Pietermaritzburg', 'Durban', 'Richards Bay'],
  'Limpopo': ['Polokwane', 'Thohoyandou', 'Tzaneen'],
  'Mpumalanga': ['Nelspruit', 'Mbombela', 'Emalahleni (Witbank)', 'Secunda'],
  'North West': ['Mahikeng', 'Rustenburg', 'Klerksdorp'],
  'Northern Cape': ['Kimberley', 'Upington', 'Springbok'],
  'Western Cape': ['Cape Town', 'Stellenbosch', 'George', 'Paarl']
};

/* ✅ No change needed here */
export const BLOOD_TYPES = [
  'A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'
];

export const TIME_SLOTS = [
  '09:00', '09:30', '10:00', '10:30', '11:00', '11:30',
  '13:00', '13:30', '14:00', '14:30', '15:00', '15:30',
  '16:00', '16:30', '17:00'
];
