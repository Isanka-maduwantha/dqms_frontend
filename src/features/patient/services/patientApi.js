import { apiFetch } from "../../../lib/api/http";
export function getUpcomingAppointments() {
    return apiFetch("/api/patient/get-appointments");
}
export function cancelAppointment(_id) {
    return apiFetch("/api/patient/cancel-appointment", {
        method: "POST",
        body: { _id },
    });
}
export function rescheduleAppointment(_id, appointmentDate, startTime, endTime) {
    return apiFetch("/api/patient/reschedule-appointment", { method: "POST", body: { _id, appointmentDate, startTime, endTime } });
}
export function getAvailableSlots(date) {
    return apiFetch(`/api/appointments/available-slots?date=${date}`);
}
export function bookAppointment(payload) {
    return apiFetch("/api/appointments/book-appointment", { method: "POST", body: { ...payload, status: "BOOKED" } });
}
