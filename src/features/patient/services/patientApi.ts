import { apiFetch } from "../../../lib/api/http";
import type { ApointmentData, AvailableSlot, VisitPurpose } from "../types/patient";

export function getUpcomingAppointments() {
  return apiFetch<{ Success: boolean; message: string; upcomingAppointments: ApointmentData[] }>(
    "/api/patient/get-appointments",
  );
}

export function cancelAppointment(_id: string) {
  return apiFetch<{ success: boolean; message: string }>("/api/patient/cancel-appointment", {
    method: "POST",
    body: { _id },
  });
}

export function rescheduleAppointment(_id: string, appointmentDate: string, startTime: string, endTime: string) {
  return apiFetch<{ success: boolean; message: string; appointment: ApointmentData }>(
    "/api/patient/reschedule-appointment",
    { method: "POST", body: { _id, appointmentDate, startTime, endTime } },
  );
}

export function getAvailableSlots(date: string) {
  return apiFetch<{ success: boolean; date: string; slots: AvailableSlot[]; message?: string }>(
    `/api/appointments//available-slots?date=${date}`,
  );
}

export interface BookAppointmentPayload {
  appointmentDate: string;
  startTime: string;
  endTime: string;
  type: string;
  visitPurpose: VisitPurpose;
}

export function bookAppointment(payload: BookAppointmentPayload) {
  return apiFetch<{ success: boolean; message: string; newAppointment: ApointmentData }>(
    "/api/appointments/book-appointment",
    { method: "POST", body: { ...payload, status: "BOOKED" } },
  );
}
