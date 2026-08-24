import { apiFetch } from "../../../lib/utils/apiFetch";
import type {
  CalledAppointment,
  DentalChart,
  Medication,
  MaterialUsedInput,
  PatientHistory,
  ToothCondition,
  TreatmentRecord,
  TreatmentStatus,
} from "../types/dentist";

// F-6.1: Call Next Patient Trigger
export async function callNextPatient(appointmentId?: string) {
  return apiFetch<{ success: boolean; message: string; appointment: CalledAppointment }>(
    "/dentist/call-next",
    { method: "POST", body: appointmentId ? { appointmentId } : {} },
  );
}

// F-6.2: Interactive 32-Teeth Chart
export async function getDentalChart(patientId: string) {
  return apiFetch<{ success: boolean; chart: DentalChart }>(`/dentist/chart/${patientId}`);
}

export async function updateTooth(
  patientId: string,
  toothNumber: number,
  payload: { condition?: ToothCondition; notes?: string },
) {
  return apiFetch<{ success: boolean; message: string; chart: DentalChart }>(
    `/dentist/chart/${patientId}/tooth/${toothNumber}`,
    { method: "PUT", body: payload },
  );
}

// F-6.3: Clinical Diagnosis & Note Logger
export interface CreateTreatmentRecordPayload {
  patientId: string;
  appointmentId?: string;
  diagnosis?: string;
  clinicalNotes?: string;
  procedures?: string[];
  medications?: Medication[];
  followUpDate?: string;
}

export async function createTreatmentRecord(payload: CreateTreatmentRecordPayload) {
  return apiFetch<{ success: boolean; record: TreatmentRecord }>("/dentist/treatment-records", {
    method: "POST",
    body: payload,
  });
}

export interface UpdateTreatmentRecordPayload {
  diagnosis?: string;
  clinicalNotes?: string;
  procedures?: string[];
  medications?: Medication[];
  materialsUsed?: MaterialUsedInput[];
  followUpDate?: string;
  status?: TreatmentStatus;
}

export interface LowStockWarning {
  _id: string;
  itemName: string;
  quantity: number;
  lowStockThreshold: number;
}

export async function updateTreatmentRecord(id: string, payload: UpdateTreatmentRecordPayload) {
  return apiFetch<{ success: boolean; record: TreatmentRecord; lowStockWarnings: LowStockWarning[] }>(
    `/dentist/treatment-records/${id}`,
    { method: "PUT", body: payload },
  );
}

// F-6.4: Patient Medical History Timeline
export async function getPatientHistory(patientId: string) {
  return apiFetch<{ success: boolean } & PatientHistory>(`/dentist/history/${patientId}`);
}

// F-6.5: X-Ray / Document Attachment Uploader
export async function uploadAttachment(recordId: string, file: File) {
  const form = new FormData();
  form.append("file", file);
  return apiFetch<{ success: boolean; attachment: { fileName: string; fileUrl: string }; record: TreatmentRecord }>(
    `/dentist/treatment-records/${recordId}/attachments`,
    { method: "POST", body: form, isForm: true },
  );
}
