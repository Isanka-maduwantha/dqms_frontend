import { apiFetch } from "../../../lib/api/http";
import type {
  CalledAppointment,
  DentalChart,
  DentistPatient,
  InventoryItem,
  TreatmentType,
} from "../types/dentist";

const BASE = "/api/dentist";

export function callNextPatient(appointmentId?: string) {
  return apiFetch<{ success: boolean; message: string; appointment: CalledAppointment }>(
    `${BASE}/call-next`,
    { method: "POST", body: appointmentId ? { appointmentId } : {} },
  );
}

export function searchDentistPatients(query: string) {
  return apiFetch<{ success: boolean; data: DentistPatient[] }>(
    `${BASE}/patients/search?q=${encodeURIComponent(query)}`,
  );
}

export function getTreatmentTypes(search?: string) {
  const qs = search ? `?search=${encodeURIComponent(search)}` : "";
  return apiFetch<{ success: boolean; count: number; treatments: TreatmentType[] }>(
    `${BASE}/treatment-types${qs}`,
  );
}

export function getPatientHistory(patientId: string) {
  return apiFetch<{
    success: boolean;
    patient: DentistPatient;
    dentalChart: DentalChart | null;
    treatmentRecords: DentalChart["treatmentRecords"];
  }>(`${BASE}/patients/${patientId}/history`);
}

export interface MaterialInput {
  itemName: string;
  quantityUsed: number;
}

export interface CreateTreatmentPayload {
  diagnosis?: string;
  treatment: string;
  treatmentType?: string;
  notes?: string;
  treatmentDate?: string;
  followUpDate?: string | null;
  materialsUsed: MaterialInput[];
}

export function createTreatmentRecord(patientId: string, payload: CreateTreatmentPayload) {
  return apiFetch<{
    success: boolean;
    message: string;
    treatmentRecord: DentalChart["treatmentRecords"][number];
    inventory: { deducted: boolean; materialsUsed: unknown[] };
  }>(`${BASE}/patients/${patientId}/treatments`, { method: "POST", body: payload });
}

export function endTreatment(appointmentId: string) {
  return apiFetch<{
    success: boolean;
    message: string;
    appointment: Record<string, unknown>;
    billing: { invoiceCreated: boolean; reason: string; invoice: Record<string, unknown> | null } | null;
  }>(`${BASE}/appointments/${appointmentId}/end-treatment`, { method: "POST" });
}

export function getInventoryItems(search?: string) {
  const qs = search ? `?search=${encodeURIComponent(search)}` : "";
  return apiFetch<{ success: boolean; count: number; items: InventoryItem[] }>(
    `/api/inventory/items${qs}`,
  );
}
