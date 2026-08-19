import { apiFetch } from "../../../lib/api/http";
import type {
  AvailableSlot,
  PatientBilling,
  PatientSummary,
  ReceptionistAppointment,
  VisitPurpose,
} from "../types/receptionist";

const BASE = "/api/receptionist";

// ---------------------------------------------------------------------------
// Patients
// ---------------------------------------------------------------------------

export function getAllPatients() {
  return apiFetch<{ success: boolean; data: PatientSummary[] }>(`${BASE}/patients`);
}

export function searchPatients(query: string) {
  return apiFetch<{ success: boolean; data: PatientSummary[] }>(
    `${BASE}/patients/search?q=${encodeURIComponent(query)}`,
  );
}

export interface AddPatientPayload {
  name: string;
  nic: string;
  phone?: string;
  email: string;
  password: string;
}

export function addPatient(payload: AddPatientPayload) {
  return apiFetch<{ success: boolean; message: string; newPatient: PatientSummary }>(
    `${BASE}/patient`,
    { method: "POST", body: payload },
  );
}

export function updatePatient(patientId: string, payload: Partial<AddPatientPayload>) {
  return apiFetch<{ success: boolean; updated: PatientSummary }>(
    `${BASE}/patient/${patientId}`,
    { method: "PATCH", body: payload },
  );
}

export function deletePatient(patientId: string) {
  return apiFetch<{ success: boolean; message: string }>(`${BASE}/patient/${patientId}`, {
    method: "DELETE",
  });
}

// ---------------------------------------------------------------------------
// Appointments & queue
// ---------------------------------------------------------------------------

export function getTodayAppointments(date?: string) {
  const qs = date ? `?date=${date}` : "";
  return apiFetch<{ success: boolean; data: ReceptionistAppointment[] }>(
    `${BASE}/today${qs}`,
  );
}

export function getQueue(date?: string) {
  const qs = date ? `?date=${date}` : "";
  return apiFetch<{ success: boolean; data: ReceptionistAppointment[] }>(
    `${BASE}/queue${qs}`,
  );
}

export function checkInAppointment(appointmentId: string) {
  return apiFetch<{
    success: boolean;
    message: string;
    tokenNumber: number;
    appointment: ReceptionistAppointment;
  }>(`${BASE}/check-in/${appointmentId}`, { method: "PATCH" });
}

export interface BookForPatientPayload {
  patientId: string;
  appointmentDate: string;
  startTime: string;
  type?: string;
  visitPurpose?: VisitPurpose;
}

export function bookAppointmentForPatient(payload: BookForPatientPayload) {
  return apiFetch<{ success: boolean; message: string; appointment: ReceptionistAppointment }>(
    `${BASE}/book-appointment`,
    { method: "POST", body: payload },
  );
}

export interface WalkInPayload {
  name: string;
  phone: string;
  nic: string;
  appointmentDate?: string;
  startTime?: string;
  endTime?: string;
  age?: number;
  gender?: string;
  address?: string;
}

export function generateWalkInToken(payload: WalkInPayload) {
  return apiFetch<{
    success: boolean;
    message: string;
    token: string;
    walkInAppointment: ReceptionistAppointment;
    patient: PatientSummary;
  }>(`${BASE}/walk-in`, { method: "POST", body: payload });
}

export function getAvailableSlots(date: string) {
  return apiFetch<{ success: boolean; date: string; slots: AvailableSlot[]; message?: string }>(
    `/api/appointments/available-slots?date=${date}`,
  );
}

// ---------------------------------------------------------------------------
// Billing
// ---------------------------------------------------------------------------

export function getPatientBilling(patientId: string) {
  return apiFetch<PatientBilling & { success: boolean }>(
    `${BASE}/patients/${patientId}/billing`,
  );
}

export interface RecordPaymentPayload {
  amount: number;
  method: "CASH" | "CARD" | "BANK_TRANSFER" | "ONLINE" | "OTHER";
  notes?: string;
}

export function recordPayment(
  patientId: string,
  invoiceId: string,
  payload: RecordPaymentPayload,
) {
  return apiFetch<{ success: boolean; message: string }>(
    `${BASE}/patients/${patientId}/invoices/${invoiceId}/payments`,
    { method: "POST", body: payload },
  );
}
