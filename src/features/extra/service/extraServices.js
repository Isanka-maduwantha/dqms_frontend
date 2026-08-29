import { apiFetch } from "../../../lib/api/http";
export function getAllUpcomingAppointments() {
    return apiFetch("/api/public/lobby", { auth: false });
}