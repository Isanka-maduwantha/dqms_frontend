import { apiFetch } from "../../../lib/api/http";
const BASE = "/api/dentist";
export function callNextPatient(appointmentId) {
    return apiFetch(`${BASE}/call-next`, { method: "POST", body: appointmentId ? { appointmentId } : {} });
}
export function searchDentistPatients(query) {
    return apiFetch(`${BASE}/patients/search?q=${encodeURIComponent(query)}`);
}
export function getTreatmentTypes(search) {
    const qs = search ? `?search=${encodeURIComponent(search)}` : "";
    return apiFetch(`${BASE}/treatment-types${qs}`);
}
export function getPatientHistory(patientId) {
    return apiFetch(`${BASE}/patients/${patientId}/history`);
}
export function createTreatmentRecord(patientId, payload) {
    return apiFetch(`${BASE}/patients/${patientId}/treatments`, { method: "POST", body: payload });
}
export function endTreatment(appointmentId) {
    return apiFetch(`${BASE}/appointments/${appointmentId}/end-treatment`, { method: "POST" });
}
export function getInventoryItems(search) {
    const qs = search ? `?search=${encodeURIComponent(search)}` : "";
    return apiFetch(`/api/inventory/items${qs}`);
}
