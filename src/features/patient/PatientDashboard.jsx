import { useCallback, useEffect, useState } from "react";
import { NavLink } from "react-router-dom";
import CommonButton from "../../components/CommanButton";
import StatusBadge from "../../components/StatusBadge";
import Modal from "../../components/ui/Modal";
import Alert from "../../components/ui/Alert";
import Card from "../../components/ui/Card";
import EmptyState from "../../components/ui/EmptyState";
import { ApiError } from "../../lib/api/http";
import { formatDate, todayISODate } from "../../lib/utils/format";
import {
  cancelAppointment,
  getAvailableSlots,
  getUpcomingAppointments,
  rescheduleAppointment,
} from "./services/patientApi";

function PatientDashboard() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [tab, setTab] = useState("upcoming");
  const [rescheduling, setRescheduling] = useState(null);
  const [actionError, setActionError] = useState(null);
  const [cancellingId, setCancellingId] = useState(null);

  const load = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await getUpcomingAppointments();
      setData(res.upcomingAppointments || []);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Failed to load appointments");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const today = todayISODate();
  const visible = data.filter((item) =>
    tab === "upcoming"
      ? item.status !== "CANCELLED" &&
        item.status !== "COMPLETED" &&
        item.appointmentDate >= today
      : item.status === "CANCELLED" ||
        item.status === "COMPLETED" ||
        item.appointmentDate < today
  );

  async function onCancel(id) {
    setActionError(null);
    if (!window.confirm("Are you sure you want to cancel this appointment?")) return;
    setCancellingId(id);
    try {
      await cancelAppointment(id);
      await load();
    } catch (err) {
      setActionError(
        err instanceof ApiError ? err.message : "Failed to cancel appointment."
      );
    } finally {
      setCancellingId(null);
    }
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 space-y-6 text-left">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold text-[#0E7A50] uppercase tracking-wider">
            Patient Portal
          </span>
          <h1 className="font-manrope text-2xl sm:text-3xl font-extrabold text-slate-900 mt-1">
            My Dental Appointments
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Manage upcoming visits, live queue tokens, and clinical history.
          </p>
        </div>
        <NavLink to="/patient/book-appointment">
          <CommonButton
            label="📅 Book New Appointment"
            className="px-5 py-2.5 text-xs sm:text-sm shadow-md"
            containerProps={{ className: "w-auto" }}
          />
        </NavLink>
      </div>

      {actionError && <Alert kind="error">{actionError}</Alert>}

      {/* Active Care Banner Card */}
      <div className="rounded-3xl bg-gradient-to-r from-emerald-800 via-[#0E7A50] to-teal-800 p-6 sm:p-8 text-white shadow-xl relative overflow-hidden border border-white/20">
        <div className="absolute -top-16 -right-16 w-56 h-56 bg-teal-400/20 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="space-y-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/15 backdrop-blur-md text-teal-200 text-xs font-bold border border-white/20">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              Active Patient Record
            </span>
            <h2 className="font-manrope text-xl sm:text-2xl font-bold">
              Manage your dental wellness journey with precision.
            </h2>
            <p className="text-xs sm:text-sm text-emerald-100/80 max-w-xl">
              Always check in upon arrival at the front desk to receive your live queue token. You can reschedule a booked appointment by choosing another available date and clinic period below.
            </p>
          </div>
          <div className="shrink-0 bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/20 text-center min-w-[140px]">
            <div className="text-3xl font-extrabold font-manrope">
              {data.filter((d) => d.status === "BOOKED" && d.appointmentDate >= today).length}
            </div>
            <div className="text-[11px] font-semibold text-teal-200 uppercase tracking-wider mt-0.5">
              Upcoming Visits
            </div>
          </div>
        </div>
      </div>

      {/* Appointments List Card */}
      <Card className="p-0 overflow-hidden border border-white/90">
        {/* Tab Headers */}
        <div className="flex border-b border-slate-100 bg-slate-50/70 px-6 pt-3 gap-6">
          <button
            type="button"
            onClick={() => setTab("upcoming")}
            className={`pb-3 text-xs sm:text-sm font-bold border-b-2 transition-all duration-200 cursor-pointer ${
              tab === "upcoming"
                ? "text-[#0E7A50] border-[#0E7A50]"
                : "text-slate-500 border-transparent hover:text-slate-800"
            }`}
          >
            Upcoming Appointments ({data.filter((i) => i.status !== "CANCELLED" && i.status !== "COMPLETED" && i.appointmentDate >= today).length})
          </button>
          <button
            type="button"
            onClick={() => setTab("past")}
            className={`pb-3 text-xs sm:text-sm font-bold border-b-2 transition-all duration-200 cursor-pointer ${
              tab === "past"
                ? "text-[#0E7A50] border-[#0E7A50]"
                : "text-slate-500 border-transparent hover:text-slate-800"
            }`}
          >
            Past & Completed History
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6">
          {loading ? (
            <div className="py-12 text-center text-slate-500 text-xs flex flex-col items-center gap-2">
              <svg className="animate-spin h-6 w-6 text-[#0E7A50]" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
              </svg>
              <span>Loading your appointments…</span>
            </div>
          ) : error ? (
            <div className="py-8">
              <Alert kind="error">{error}</Alert>
            </div>
          ) : visible.length === 0 ? (
            <EmptyState
              icon={tab === "upcoming" ? "📅" : "🗂️"}
              title={`No ${tab} appointments`}
              description={
                tab === "upcoming"
                  ? "You don't have any upcoming visits booked yet. Select a clinic period to schedule your next appointment."
                  : "No past appointment history found on your record."
              }
              action={
                tab === "upcoming" ? (
                  <NavLink to="/patient/book-appointment">
                    <CommonButton label="Book an Appointment" className="text-xs px-4 py-2 mt-2" />
                  </NavLink>
                ) : null
              }
            />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="text-[11px] uppercase tracking-wider text-slate-500 border-b border-slate-100">
                    <th className="pb-3 pr-4 font-bold">Date & Period</th>
                    <th className="pb-3 pr-4 font-bold">Appointment Number</th>
                    <th className="pb-3 pr-4 font-bold">Status</th>
                    <th className="pb-3 pr-4 font-bold">Queue Token</th>
                    <th className="pb-3 pr-4 font-bold text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {visible.map((item) => (
                    <tr key={item._id} className="hover:bg-slate-50/60 transition-colors">
                      <td className="py-4 pr-4 font-bold text-slate-800">
                        <div className="flex items-center gap-2">
                          <span className="w-7 h-7 rounded-lg bg-emerald-50 text-[#0E7A50] flex items-center justify-center text-xs">
                            📅
                          </span>
                          <div>
                            <div>{formatDate(item.appointmentDate)}</div>
                            <div className="text-[11px] font-normal text-slate-500">
                              {item.appointmentPeriod || "Period not set"} {item.startTime && item.endTime ? `• ${item.startTime}–${item.endTime}` : ""}
                            </div>
                            <div className="text-[11px] font-extrabold text-[#0E7A50] mt-0.5">
                              Appointment #{item.appointmentNumber ?? "—"}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="py-4 pr-4 font-bold text-[#0E7A50]">
                        #{item.appointmentNumber ?? "—"}
                      </td>
                      <td className="py-4 pr-4">
                        <StatusBadge status={item.status} />
                      </td>
                      <td className="py-4 pr-4 font-semibold text-slate-700">
                        {item.tokenNumber ? `#${item.tokenNumber}` : "Assigned at check-in"}
                      </td>
                      <td className="py-4 pr-4 text-right">
                        {item.status === "BOOKED" && item.appointmentDate >= today ? (
                          <div className="flex items-center justify-end gap-2">
                            <button
                              type="button"
                              onClick={() => setRescheduling(item)}
                              className="rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-bold text-slate-700 hover:text-[#0E7A50] hover:border-emerald-300 hover:bg-emerald-50/50 transition-all shadow-xs cursor-pointer"
                            >
                              Reschedule
                            </button>
                            <button
                              type="button"
                              disabled={cancellingId === item._id}
                              onClick={() => onCancel(item._id)}
                              className="rounded-xl border border-rose-200 bg-white px-3 py-1.5 text-xs font-bold text-rose-600 hover:bg-rose-50 transition-all shadow-xs cursor-pointer disabled:opacity-50"
                            >
                              {cancellingId === item._id ? "Cancelling…" : "Cancel"}
                            </button>
                          </div>
                        ) : (
                          <span className="text-[11px] text-slate-400 font-medium">Completed / Archived</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </Card>

      {/* Reschedule Modal */}
      <RescheduleModal
        appointment={rescheduling}
        onClose={() => setRescheduling(null)}
        onDone={(result) => {
          setRescheduling(null);
          void load();
          if (result?.appointmentNumber) {
            setActionError(`Appointment rescheduled successfully. Your new appointment number is #${result.appointmentNumber}.`);
          }
        }}
      />
    </div>
  );
}

function RescheduleModal({ appointment, onClose, onDone }) {
  const [date, setDate] = useState(appointment?.appointmentDate || todayISODate());
  const [periods, setPeriods] = useState([]);
  const [period, setPeriod] = useState(appointment?.appointmentPeriod || "");
  const [loadingPeriods, setLoadingPeriods] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  const loadPeriods = useCallback(async (targetDate) => {
    setLoadingPeriods(true);
    setPeriod("");
    try {
      const res = await getAvailableSlots(targetDate);
      setPeriods(res.periods || []);
    } catch (err) {
      setPeriods([]);
      setError(err instanceof ApiError ? err.message : "Failed to load appointment periods.");
    } finally {
      setLoadingPeriods(false);
    }
  }, []);

  useEffect(() => {
    if (appointment) {
      setDate(appointment.appointmentDate || todayISODate());
      setPeriod(appointment.appointmentPeriod || "");
      setError(null);
      void loadPeriods(appointment.appointmentDate || todayISODate());
    }
  }, [appointment, loadPeriods]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!appointment || !period) {
      setError("Please select an available appointment period.");
      return;
    }
    setSaving(true); setError(null);
    try {
      const result = await rescheduleAppointment(appointment._id, date, period);
      onDone(result);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Failed to reschedule appointment.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal open={Boolean(appointment)} title="Reschedule Appointment" onClose={onClose}>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4 text-left">
        <div><label className="font-inter text-xs font-bold text-slate-700 block mb-1.5">Select New Appointment Date</label><input type="date" value={date} min={todayISODate()} onChange={(e) => { setDate(e.target.value); void loadPeriods(e.target.value); }} className="w-full bg-white border border-slate-200 rounded-xl py-2.5 px-3.5 text-sm" required /></div>
        <div><label className="font-inter text-xs font-bold text-slate-700 block mb-1.5">Available Appointment Periods</label>{loadingPeriods ? <p className="text-xs text-slate-500 py-3">Checking availability…</p> : periods.length === 0 ? <p className="text-xs text-slate-500 py-3">No available periods found for this date.</p> : <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">{periods.map((item) => <button key={item.period} type="button" disabled={!item.available} onClick={() => setPeriod(item.period)} className={`p-3 rounded-xl border text-left ${period === item.period ? "border-emerald-500 bg-emerald-50" : item.available ? "border-slate-200 bg-white hover:border-emerald-300" : "border-slate-200 bg-slate-50 opacity-50"}`}><div className="font-bold text-sm">{item.label}</div><div className="text-[11px] text-slate-500">{item.startTime} – {item.endTime}</div><div className="text-[11px] font-bold text-[#0E7A50] mt-1">{item.remaining} seats remaining</div></button>)}</div>}</div>
        {error && <Alert kind="error">{error}</Alert>}
        <CommonButton label="Confirm Reschedule" type="submit" loading={saving ? "Saving changes…" : false} disabled={!period || saving} className="w-full py-2.5" />
      </form>
    </Modal>
  );
}

export default PatientDashboard;