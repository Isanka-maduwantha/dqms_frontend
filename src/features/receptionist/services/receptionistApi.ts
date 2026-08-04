export interface WalkInPayload {
  patientName: string;
  phone: string;
}

const API_BASE_URL = 'http://localhost:3000/api/receptionist';

export async function fetchTodayAppointments() {
  const response = await fetch(`${API_BASE_URL}/today`);
  return response.json();
}

export async function checkInAppointment(appointmentId: string) {
  const response = await fetch(`${API_BASE_URL}/check-in/${appointmentId}`, {
    method: 'PATCH',
  });

  return response.json();
}

export async function createWalkInPatient(payload: WalkInPayload) {
  const response = await fetch(`${API_BASE_URL}/walk-in`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  return response.json();
}

export async function rescheduleAppointment(appointmentId: string, newSlot: string) {
  const response = await fetch(`${API_BASE_URL}/reschedule/${appointmentId}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ newSlot }),
  });

  return response.json();
}

export async function prioritizeToken(tokenId: string) {
  const response = await fetch(`${API_BASE_URL}/priority/${tokenId}`, {
    method: 'PATCH',
  });

  return response.json();
}
