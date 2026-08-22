export type ToothCondition =
  | "HEALTHY"
  | "CAVITY"
  | "FILLING"
  | "CROWN"
  | "ROOT_CANAL"
  | "EXTRACTED"
  | "MISSING"
  | "OTHER";

export const TOOTH_CONDITIONS: ToothCondition[] = [
  "HEALTHY",
  "CAVITY",
  "FILLING",
  "CROWN",
  "ROOT_CANAL",
  "EXTRACTED",
  "MISSING",
  "OTHER",
];

export interface Tooth {
  toothNumber: number;
  condition: ToothCondition;
  notes: string;
  updatedAt: string;
}

export interface DentalChart {
  _id: string;
  patientId: string;
  teeth: Tooth[];
  history: { teeth: Tooth[]; recordedAt: string; recordedBy?: string }[];
}

export interface Medication {
  name: string;
  dosage?: string;
  instructions?: string;
}

export interface MaterialUsedInput {
  itemId: string;
  itemName: string;
  quantityUsed: number;
}

export interface Attachment {
  fileName: string;
  fileUrl: string;
  mimeType?: string;
  uploadedAt: string;
}

export type TreatmentStatus = "IN_PROGRESS" | "COMPLETED";

export interface TreatmentRecord {
  _id: string;
  patientId: string;
  dentistId: string | { _id: string; name: string };
  appointmentId?: string;
  diagnosis: string;
  clinicalNotes: string;
  procedures: string[];
  medications: Medication[];
  materialsUsed: MaterialUsedInput[];
  attachments: Attachment[];
  followUpDate?: string | null;
  status: TreatmentStatus;
  inventoryDeducted: boolean;
  createdAt: string;
}

export interface CalledAppointment {
  appointmentId: string;
  patientId: string;
  patientName?: string;
  startTime: string;
  calledAt: string;
}

export interface PatientHistory {
  patient: { _id: string; name: string; email: string; phone?: string; medicalAlerts: string[] };
  medicalAlerts: string[];
  dentalChart: DentalChart | null;
  treatmentTimeline: TreatmentRecord[];
}
