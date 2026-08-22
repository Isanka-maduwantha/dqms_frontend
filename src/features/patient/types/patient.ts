export type VisitPurpose = "NEW_TREATMENT" | "FOLLOW_UP" | "CHECKUP";

export interface ApointmentData {
  _id: string;
  appointmentDate: string;
  startTime: string;
  endTime: string;
  type: string;
  visitPurpose?: VisitPurpose;
  status: string;
  tokenNumber?: number | null;
}

export interface AvailableSlot {
  time: string;
  available: boolean;
  reason: string;
}
