import { apiFetch } from "../../../lib/api/http";
const BASE = "/api/receptionist";

export const getAppointmentPurpose = ()=> {
    return apiFetch(`${BASE}/visitPurpose`);
}

export function getAllPatients() { return apiFetch(`${BASE}/patients`); }
export function searchPatients(query) { return apiFetch(`${BASE}/patients/search?q=${encodeURIComponent(query)}`); }
export function addPatient(payload) { return apiFetch(`${BASE}/patient`, { method: "POST", body: payload }); }
export function updatePatient(patientId, payload) { return apiFetch(`${BASE}/patient/${patientId}`, { method: "PATCH", body: payload }); }
export function deletePatient(patientId) { return apiFetch(`${BASE}/patient/${patientId}`, { method: "DELETE" }); }
export function getTodayAppointments(date) { return apiFetch(`${BASE}/today${date ? `?date=${date}` : ""}`); }
export function getQueue(date) { return apiFetch(`${BASE}/queue${date ? `?date=${date}` : ""}`); }
export function checkInAppointment(appointmentId, visitPurpose) { return apiFetch(`${BASE}/check-in/${appointmentId}`, { method: "PATCH", body: { visitPurpose } }); }
export function markEmergencyPriority(appointmentId) { return apiFetch(`${BASE}/priority/${appointmentId}`, { method: "PATCH" }); }
export function bookAppointmentForPatient(payload) { return apiFetch(`${BASE}/book-appointment`, { method: "POST", body: payload }); }
export function generateWalkInToken(payload) { return apiFetch(`${BASE}/walk-in`, { method: "POST", body: payload }); }
export function getAvailableSlots(date) { return apiFetch(`/api/appointments/available-slots?date=${date}`); }
export function getPatientBilling(patientId) { return apiFetch(`${BASE}/patients/${patientId}/billing`); }
export function recordPayment(patientId, invoiceId, payload) { return apiFetch(`${BASE}/patients/${patientId}/invoices/${invoiceId}/payments`, { method: "POST", body: payload }); }