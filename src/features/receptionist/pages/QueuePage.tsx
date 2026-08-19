import { useCallback, useEffect, useState } from "react";
import Card from "../../../components/ui/Card";
import Alert from "../../../components/ui/Alert";
import EmptyState from "../../../components/ui/EmptyState";
import StatusBadge from "../../../components/StatusBadge";
import { ApiError } from "../../../lib/api/http";
import { todayISODate } from "../../../lib/utils/format";
import {
  checkInAppointment,
  getQueue,
  getTodayAppointments,
} from "../services/receptionistApi";
import type { ReceptionistAppointment } from "../types/receptionist";

function patientName(appointment: ReceptionistAppointment) {
  return typeof appointment.patientId === "string"
    ? appointment.patientId
    : appointment.patientId.name;
}

function patientPhone(appointment: ReceptionistAppointment) {
  return typeof appointment.patientId === "string" ? "" : appointment.patientId.phone || "";
}

export default function QueuePage() {
  const [date, setDate] = useState(todayISODate());
  const [queue, setQueue] = useState<ReceptionistAppointment[]>([]);
  const [today, setToday] = useState<ReceptionistAppointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [checkingIn, setCheckingIn] = useState<string | null>(null);

  const load = useCallback(async (targetDate: string) => {
    setLoading(true);
    setError(null);
    try {
      const [queueRes, todayRes] = await Promise.all([
        getQueue(targetDate),
        getTodayAppointments(targetDate),
      ]);
      setQueue(queueRes.data);
      setToday(todayRes.data);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Failed to load today's schedule.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load(date);
  }, [date, load]);

  const handleCheckIn = async (appointmentId: string) => {
    setCheckingIn(appointmentId);
    setError(null);
    try {
      await checkInAppointment(appointmentId);
      await load(date);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Check-in failed.");
    } finally {
      setCheckingIn(null);
    }
  };

  return (
    <div className="flex flex-col gap-6 max-w-6xl">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="font-manrope text-2xl font-bold text-green-text-1">
            Front desk queue
          </h1>
          <p className="text-[12px] text-muted-green">
            Check patients in and watch the live waiting room.
          </p>
        </div>
        <input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          className="border border-border-grey rounded-[10px] px-4 py-2 text-[13px] outline-none bg-white"
        />
      </div>

      {error && <Alert kind="error">{error}</Alert>}

      <Card>
        <h2 className="font-manrope font-bold text-[15px] text-green-text-1 pb-4">
          Waiting room ({queue.length})
        </h2>
        {loading ? (
          <p className="text-[12px] text-muted-green">Loading…</p>
        ) : queue.length === 0 ? (
          <EmptyState icon="🪑" title="No one is waiting" description="Checked-in patients will appear here in token order." />
        ) : (
          <div className="flex flex-wrap gap-3">
            {queue.map((appointment) => (
              <div
                key={appointment._id}
                className="flex items-center gap-3 border border-border-grey rounded-[12px] px-4 py-3 min-w-[200px]"
              >
                <span className="flex items-center justify-center w-9 h-9 rounded-full bg-accent text-white font-bold text-[13px] shrink-0">
                  {appointment.tokenNumber}
                </span>
                <div className="min-w-0">
                  <p className="text-[13px] font-bold text-green-text-1 truncate">
                    {patientName(appointment)}
                  </p>
                  <p className="text-[11px] text-muted-green truncate">
                    {appointment.startTime} • {patientPhone(appointment)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>

      <Card>
        <h2 className="font-manrope font-bold text-[15px] text-green-text-1 pb-4">
          Today's appointments ({today.length})
        </h2>
        {loading ? (
          <p className="text-[12px] text-muted-green">Loading…</p>
        ) : today.length === 0 ? (
          <EmptyState icon="📭" title="Nothing scheduled" description="No appointments were found for this date." />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-[12px]">
              <thead>
                <tr className="text-[11px] uppercase tracking-wider text-muted-green border-b border-border-grey">
                  <th className="py-2 pr-3">Time</th>
                  <th className="py-2 pr-3">Patient</th>
                  <th className="py-2 pr-3">Visit</th>
                  <th className="py-2 pr-3">Status</th>
                  <th className="py-2 pr-3">Token</th>
                  <th className="py-2 pr-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border-grey">
                {today.map((appointment) => (
                  <tr key={appointment._id}>
                    <td className="py-3 pr-3 font-semibold text-green-text-1">
                      {appointment.startTime}
                    </td>
                    <td className="py-3 pr-3">
                      <div className="font-bold text-green-text-1">{patientName(appointment)}</div>
                      <div className="text-[11px] text-muted-green">{patientPhone(appointment)}</div>
                    </td>
                    <td className="py-3 pr-3">{appointment.visitPurpose || "—"}</td>
                    <td className="py-3 pr-3">
                      <StatusBadge status={appointment.status} />
                    </td>
                    <td className="py-3 pr-3">{appointment.tokenNumber ?? "—"}</td>
                    <td className="py-3 pr-3 text-right">
                      {appointment.status === "BOOKED" && (
                        <button
                          type="button"
                          disabled={checkingIn === appointment._id}
                          onClick={() => handleCheckIn(appointment._id)}
                          className="rounded-[8px] bg-accent text-white text-[11px] font-semibold px-3 py-1.5 disabled:opacity-50"
                        >
                          {checkingIn === appointment._id ? "Checking in…" : "Check in"}
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
}
