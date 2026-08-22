export interface PatientSummary {
  _id: string;
  name: string;
  nic: string;
  phone?: string;
  email: string;
  role?: string;
  createdAt?: string;
}

export interface AppointmentPatient {
  _id: string;
  name: string;
  phone?: string;
  email?: string;
  nic?: string;
  age?: number | null;
  gender?: string | null;
  address?: string | null;
}

export type AppointmentStatus =
  | "BOOKED"
  | "ARRIVED"
  | "IN_CONSULTATION"
  | "COMPLETED"
  | "CANCELLED";

export type VisitPurpose = "NEW_TREATMENT" | "FOLLOW_UP" | "CHECKUP";

export interface ReceptionistAppointment {
  _id: string;
  patientId: AppointmentPatient | string;
  doctorId?: { _id: string; name: string } | string | null;
  appointmentDate: string;
  startTime: string;
  endTime: string;
  type: string;
  visitPurpose?: VisitPurpose;
  status: AppointmentStatus;
  tokenNumber?: number | null;
  calledAt?: string | null;
  completedAt?: string | null;
}

export interface AvailableSlot {
  time: string;
  available: boolean;
  reason: string;
}

export interface Payment {
  _id: string;
  invoiceId: string;
  patientId: string;
  amount: number;
  method: "CASH" | "CARD" | "BANK_TRANSFER" | "ONLINE" | "OTHER";
  isInstallment: boolean;
  receivedBy?: { _id: string; name: string; email: string; role: string } | string;
  notes?: string;
  paymentDate: string;
}

export interface Invoice {
  _id: string;
  invoiceNumber: string;
  patientId: string;
  appointmentId: string | { _id: string; appointmentDate: string; startTime: string; endTime: string; status: string; visitPurpose: string };
  treatmentName: string;
  treatmentDetails?: string;
  totalAmount: number;
  amountPaid: number;
  outstandingBalance: number;
  status: "UNPAID" | "PARTIALLY_PAID" | "PAID" | "CANCELLED";
  issuedDate: string;
  payments?: Payment[];
}

export interface PatientBilling {
  patient: PatientSummary;
  invoices: Invoice[];
  totals: {
    totalAmount: number;
    amountPaid: number;
    outstandingBalance: number;
  };
}
