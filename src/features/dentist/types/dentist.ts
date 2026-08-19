export interface DentistPatient {
  _id: string;
  name: string;
  phone?: string;
  email: string;
  nic?: string;
}

export interface CalledAppointment {
  appointmentId: string;
  patientId: string;
  patientName: string;
  phone?: string;
  email?: string;
  nic?: string;
  startTime: string;
  endTime: string;
  appointmentDate: string;
  tokenNumber: number | null;
  status: string;
  calledAt: string;
  calledBy?: { _id: string; name: string; email: string; role: string };
}

export interface TreatmentType {
  _id: string;
  code: string;
  name: string;
  category: string;
  description?: string;
  price: number;
  aliases?: string[];
}

export interface MaterialUsed {
  itemId: string;
  itemName: string;
  quantityUsed: number;
  unit: string;
}

export interface TreatmentRecord {
  _id: string;
  appointmentId?: {
    _id: string;
    appointmentDate: string;
    startTime: string;
    endTime: string;
    type: string;
    visitPurpose: string;
    status: string;
    tokenNumber: number;
  } | string | null;
  treatmentTypeId?: string | null;
  treatmentTypeName: string;
  treatmentPrice: number;
  treatmentDate: string;
  dentistId: { _id: string; name: string; email: string; role: string } | string;
  diagnosis: string;
  treatment: string;
  notes: string;
  followUpDate: string | null;
  materialsUsed: MaterialUsed[];
}

export interface DentalChart {
  _id: string;
  patientId: string;
  treatmentRecords: TreatmentRecord[];
}

export interface InventoryItem {
  _id: string;
  itemName: string;
  category: string;
  quantity: number;
  unit: string;
  reorderThreshold: number;
  unitPrice: number;
  isActive: boolean;
}
