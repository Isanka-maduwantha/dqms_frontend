import { useCallback, useEffect, useState } from "react";
import Card from "../../../components/ui/Card";
import Alert from "../../../components/ui/Alert";
import EmptyState from "../../../components/ui/EmptyState";
import StatusBadge from "../../../components/StatusBadge";
import CommonButton from "../../../components/CommanButton";
import { ApiError } from "../../../lib/api/http";
import { formatDate, todayISODate } from "../../../lib/utils/format";
import {
  checkInAppointment,
  getQueue,
  getTodayAppointments,
} from "../services/receptionistApi";

function patientName(appointment) {
  return typeof appointment.patientId === "string"
    ? appointment.patientId
    : appointment.patientId?.name || "Anonymous Patient";
}

function patientPhone(appointment) {
  return typeof appointment.patientId === "string"
    ? ""
    : appointment.patientId?.phone || "";
}

export default function QueuePage() {
  const [date, setDate] = useState(todayISODate());
  const [queue, setQueue] = useState([]);
  const [today, setToday] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [checkingIn, setCheckingIn] = useState(null);

  const load = useCallback(async (targetDate) => {
    setLoading(true);
    setError(null);
    try {
      const [queueRes, todayRes] = await Promise.all([
        getQueue(targetDate),
        getTodayAppointments(targetDate),
      ]);
      setQueue(queueRes.data || []);
      setToday(todayRes.data || []);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Failed to load clinic schedule.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load(date);
  }, [date, load]);

  const handleCheckIn = async (appointmentId) => {
    setCheckingIn(appointmentId);
    setError(null);
    try {
      await checkInAppointment(appointmentId);
      await load(date);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Check-in failed. Please try again.");
    } finally {
      setCheckingIn(null);
    }
  };

  return (
    <div className="space-y-6 text-left max-w-6xl">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold text-[#0E7A50] uppercase tracking-wider">
            Reception Desk
          </span>
          <h1 className="font-manrope text-2xl sm:text-3xl font-extrabold text-slate-900 mt-1">
            Live Waiting Queue & Check-In
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Check-in arrived patients, monitor token queue order, and manage today's schedule.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 bg-white/80 border border-slate-200 rounded-xl px-3 py-1.5 shadow-xs">
            <span className="text-xs text-slate-500 font-semibold">Date:</span>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="text-xs font-bold text-slate-800 outline-none bg-transparent cursor-pointer"
            />
          </div>
          <button
            type="button"
            onClick={() => void load(date)}
            className="p-2 rounded-xl bg-white border border-slate-200 text-slate-600 hover:text-[#0E7A50] hover:bg-slate-50 shadow-xs"
            title="Refresh schedule"
          >
            🔄
          </button>
        </div>
      </div>

      {error && <Alert kind="error">{error}</Alert>}

      {/* Waiting Room Section */}
      <Card className="space-y-4 border border-white/80">
        <div className="flex justify-between items-center border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2.5">
            <span className="w-8 h-8 rounded-xl bg-emerald-50 text-[#0E7A50] flex items-center justify-center text-sm font-bold">
              🪑
            </span>
            <div>
              <h2 className="font-manrope font-bold text-base text-slate-900">
                Active Waiting Room
              </h2>
              <p className="text-xs text-slate-500">
                Patients who have arrived and are awaiting consultation call.
              </p>
            </div>
          </div>
          <span className="px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-800 font-bold text-xs border border-emerald-200/60">
            {queue.length} Waiting
          </span>
        </div>

        {loading ? (
          <p className="text-xs text-slate-500 py-6 text-center">Loading waiting queue…</p>
        ) : queue.length === 0 ? (
          <EmptyState
            icon="🪑"
            title="No patients waiting"
            description="Patients marked as Arrived will appear here in chronological token order."
          />
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3.5 pt-1">
            {queue.map((appointment) => (
              <div
                key={appointment._id}
                className="flex items-center gap-3.5 p-4 rounded-2xl bg-white/90 border border-slate-200/80 shadow-xs hover:shadow-md hover:border-emerald-300 transition-all duration-200"
              >
                <div className="w-12 h-12 rounded-2xl glossy-gradient-btn text-white font-extrabold text-base flex items-center justify-center shrink-0 shadow-md shadow-emerald-700/20">
                  {appointment.tokenNumber}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-bold text-slate-900 truncate">
                    {patientName(appointment)}
                  </p>
                  <p className="text-[11px] text-slate-500 truncate flex items-center gap-1.5 mt-0.5">
                    <span>⏰ {appointment.startTime}</span>
                    {patientPhone(appointment) && (
                      <>
                        <span>•</span>
                        <span>📞 {patientPhone(appointment)}</span>
                      </>
                    )}
                  </p>
                  <div className="mt-1.5">
                    <StatusBadge status={appointment.status} />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* Today's Schedule Table */}
      <Card className="space-y-4 border border-white/80">
        <div className="flex justify-between items-center border-b border-slate-100 pb-3">
          <div>
            <h2 className="font-manrope font-bold text-base text-slate-900">
              Schedule for {formatDate(date)}
            </h2>
            <p className="text-xs text-slate-500">
              Complete list of booked and walk-in appointments for the selected date.
            </p>
          </div>
          <span className="text-xs font-bold text-slate-600 bg-slate-100 px-3 py-1 rounded-full">
            {today.length} Total
          </span>
        </div>

        {loading ? (
          <p className="text-xs text-slate-500 py-6 text-center">Loading schedule…</p>
        ) : today.length === 0 ? (
          <EmptyState
            icon="📅"
            title="No appointments scheduled"
            description="No appointments found for this date. Book a patient using the booking tab."
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="text-[11px] uppercase tracking-wider text-slate-500 border-b border-slate-100">
                  <th className="pb-3 pr-4 font-bold">Slot Time</th>
                  <th className="pb-3 pr-4 font-bold">Patient Details</th>
                  <th className="pb-3 pr-4 font-bold">Visit Purpose</th>
                  <th className="pb-3 pr-4 font-bold">Status</th>
                  <th className="pb-3 pr-4 font-bold">Token #</th>
                  <th className="pb-3 pr-4 font-bold text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {today.map((appointment) => (
                  <tr key={appointment._id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="py-3.5 pr-4 font-bold text-emerald-800">
                      {appointment.startTime}
                    </td>
                    <td className="py-3.5 pr-4">
                      <div className="font-bold text-slate-900">{patientName(appointment)}</div>
                      <div className="text-[11px] text-slate-500">
                        {patientPhone(appointment) || "No phone listed"}
                      </div>
                    </td>
                    <td className="py-3.5 pr-4 text-slate-700">
                      {appointment.visitPurpose || "General Treatment"}
                    </td>
                    <td className="py-3.5 pr-4">
                      <StatusBadge status={appointment.status} />
                    </td>
                    <td className="py-3.5 pr-4">
                      {appointment.tokenNumber ? (
                        <span className="font-extrabold text-[#0E7A50] bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-100">
                          #{appointment.tokenNumber}
                        </span>
                      ) : (
                        <span className="text-slate-400">—</span>
                      )}
                    </td>
                    <td className="py-3.5 pr-4 text-right">
                      {appointment.status === "BOOKED" && (
                        <CommonButton
                          label={checkingIn === appointment._id ? "Checking in…" : "✓ Check In"}
                          disabled={checkingIn === appointment._id}
                          onClick={() => handleCheckIn(appointment._id)}
                          className="px-3 py-1.5 text-xs"
                          containerProps={{ className: "w-auto justify-end" }}
                        />
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
