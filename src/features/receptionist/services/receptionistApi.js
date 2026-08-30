import { apiFetch } from "../../../lib/api/http";
const BASE = "/api/receptionist";
// ---------------------------------------------------------------------------
// Patients
// ---------------------------------------------------------------------------
export function getAllPatients() {
    return apiFetch(`${BASE}/patients`);
}
export function searchPatients(query) {
    return apiFetch(`${BASE}/patients/search?q=${encodeURIComponent(query)}`);
}
export function addPatient(payload) {
    return apiFetch(`${BASE}/patient`, { method: "POST", body: payload });
}
export function updatePatient(patientId, payload) {
    return apiFetch(`${BASE}/patient/${patientId}`, { method: "PATCH", body: payload });
}
export function deletePatient(patientId) {
    return apiFetch(`${BASE}/patient/${patientId}`, {
        method: "DELETE",
    });
}
// ---------------------------------------------------------------------------
// Appointments & queue
// ---------------------------------------------------------------------------
export function getTodayAppointments(date) {
    const qs = date ? `?date=${date}` : "";
    return apiFetch(`${BASE}/today${qs}`);
}
export function getQueue(date) {
    const qs = date ? `?date=${date}` : "";
    return apiFetch(`${BASE}/queue${qs}`);
}
export function checkInAppointment(appointmentId) {
    return apiFetch(`${BASE}/check-in/${appointmentId}`, { method: "PATCH" });
}
export function bookAppointmentForPatient(payload) {
    return apiFetch(`${BASE}/book-appointment`, { method: "POST", body: payload });
}
export function generateWalkInToken(payload) {
    return apiFetch(`${BASE}/walk-in`, { method: "POST", body: payload });
}
export function getAvailableSlots(date) {
    return apiFetch(`/api/appointments/available-slots?date=${date}`);
}
// ---------------------------------------------------------------------------
// Billing
// ---------------------------------------------------------------------------
export function getPatientBilling(patientId) {
    return apiFetch(`${BASE}/patients/${patientId}/billing`);
}
export function recordPayment(patientId, invoiceId, payload) {
    return apiFetch(`${BASE}/patients/${patientId}/invoices/${invoiceId}/payments`, { method: "POST", body: payload });
}
