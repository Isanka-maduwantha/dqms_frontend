import { useCallback, useEffect, useState } from "react";
import Card from "../../../components/ui/Card";
import Alert from "../../../components/ui/Alert";
import EmptyState from "../../../components/ui/EmptyState";
import Modal from "../../../components/ui/Modal";
import FormSelect from "../../../components/FormSelect";
import StatusBadge from "../../../components/StatusBadge";
import CommonButton from "../../../components/CommanButton";
import { ApiError } from "../../../lib/api/http";
import { formatDate, todayISODate } from "../../../lib/utils/format";
import { checkInAppointment, getQueue, getTodayAppointments, markEmergencyPriority } from "../services/receptionistApi";

const VISIT_PURPOSES = [
  { value: "NEW_TREATMENT", label: "New Treatment Procedure", description: "Billable treatment visit. The invoice is created after the dentist completes the treatment." },
  { value: "FOLLOW_UP", label: "Follow-Up Consultation", description: "Review of previous treatment or healing. No new invoice is created for this visit." },
  { value: "CHECKUP_SCREENING", label: "Routine Checkup / Screening", description: "Routine examination or screening. No new invoice is created for this visit." },
];

function patientName(a) {
  return typeof a.patientId === "string" ? a.patientId : a.patientId?.name || "Anonymous Patient";
}

function patientPhone(a) {
  return typeof a.patientId === "string" ? "" : a.patientId?.phone || "";
}

function purposeLabel(value) {
  return VISIT_PURPOSES.find((item) => item.value === value)?.label || "Not selected";
}

export default function QueuePage() {
  const [date, setDate] = useState(todayISODate());
  const [queue, setQueue] = useState([]);
  const [today, setToday] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [checkingIn, setCheckingIn] = useState(null);
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [visitPurpose, setVisitPurpose] = useState("");
  const [prioritizing, setPrioritizing] = useState(null);

  const load = useCallback(async (targetDate) => {
    setLoading(true);
    setError(null);
    try {
      const [queueRes, todayRes] = await Promise.all([getQueue(targetDate), getTodayAppointments(targetDate)]);
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

  const openCheckIn = (appointment) => {
    setError(null);
    setSuccess(null);
    setSelectedAppointment(appointment);
    setVisitPurpose("");
  };

  const closeCheckIn = () => {
    if (checkingIn) return;
    setSelectedAppointment(null);
    setVisitPurpose("");
  };

  const handleCheckIn = async () => {
    if (!selectedAppointment) return;

    if (!visitPurpose) {
      setError("Please select the visit purpose before checking in.");
      return;
    }

    setCheckingIn(selectedAppointment._id);
    setError(null);
    setSuccess(null);

    try {
      const result = await checkInAppointment(selectedAppointment._id, visitPurpose);
      setSelectedAppointment(null);
      setVisitPurpose("");
      setSuccess(result.message || `Patient checked in successfully. Token #${result.tokenNumber}.`);
      await load(date);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Check-in failed. Please try again.");
    } finally {
      setCheckingIn(null);
    }
  };

  const handlePriority = async (id) => {
    if (!window.confirm("Mark this patient as an emergency priority? They will be called before normal waiting patients.")) return;
    setPrioritizing(id);
    setError(null);
    setSuccess(null);
    try {
      await markEmergencyPriority(id);
      await load(date);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Failed to mark emergency priority.");
    } finally {
      setPrioritizing(null);
    }
  };

  return (
    <>
      <div className="space-y-6 text-left max-w-6xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <span className="text-xs font-bold text-[#0E7A50] uppercase tracking-wider">Reception Desk</span>
            <h1 className="font-manrope text-2xl sm:text-3xl font-extrabold text-slate-900 mt-1">Live Waiting Queue & Check-In</h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-0.5">Check in arriving patients, select their visit purpose, generate queue tokens, and manage emergency priority.</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 bg-white/80 border border-slate-200 rounded-xl px-3 py-1.5">
              <span className="text-xs text-slate-500 font-semibold">Date:</span>
              <input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="text-xs font-bold text-slate-800 outline-none bg-transparent" />
            </div>
            <button type="button" onClick={() => void load(date)} className="p-2 rounded-xl bg-white border border-slate-200" aria-label="Refresh queue">🔄</button>
          </div>
        </div>

        {error && <Alert kind="error">{error}</Alert>}
        {success && <Alert kind="success">{success}</Alert>}

        <Card className="space-y-4 border border-white/80">
          <div className="flex justify-between items-center border-b border-slate-100 pb-3">
            <div>
              <h2 className="font-manrope font-bold text-base text-slate-900">Active Waiting Room</h2>
              <p className="text-xs text-slate-500">Emergency priority patients appear first, followed by normal token order.</p>
            </div>
            <span className="px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-800 font-bold text-xs">{queue.length} Waiting</span>
          </div>

          {loading ? (
            <p className="text-xs text-slate-500 py-6 text-center">Loading waiting queue…</p>
          ) : queue.length === 0 ? (
            <EmptyState icon="🪑" title="No patients waiting" description="Patients checked in at reception will appear here." />
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3.5 pt-1">
              {queue.map((a) => (
                <div key={a._id} className={`p-4 rounded-2xl border shadow-xs ${a.isPriority ? "border-rose-300 bg-rose-50/60" : "border-slate-200/80 bg-white/90"}`}>
                  <div className="flex items-center gap-3">
                    <div className={`w-12 h-12 rounded-2xl text-white font-extrabold text-base flex items-center justify-center ${a.isPriority ? "bg-rose-600" : "glossy-gradient-btn"}`}>
                      {a.isPriority ? "🚨" : a.tokenNumber}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-bold text-slate-900 truncate">{patientName(a)}</p>
                      <p className="text-[11px] text-slate-500 mt-0.5">Token #{a.tokenNumber}{patientPhone(a) ? ` • ${patientPhone(a)}` : ""}</p>
                      <p className="text-[11px] text-emerald-800 font-semibold mt-1 truncate">{purposeLabel(a.visitPurpose)}</p>
                      <div className="mt-1.5 flex gap-2">
                        <StatusBadge status={a.status} />
                        {a.isPriority && <span className="px-2 py-0.5 rounded-full bg-rose-100 text-rose-700 text-[10px] font-bold">EMERGENCY</span>}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>

        <Card className="space-y-4 border border-white/80">
          <div className="flex justify-between items-center border-b border-slate-100 pb-3">
            <div>
              <h2 className="font-manrope font-bold text-base text-slate-900">Schedule for {formatDate(date)}</h2>
              <p className="text-xs text-slate-500 mt-0.5">Patient bookings do not contain a visit purpose until receptionist check-in.</p>
            </div>
            <span className="text-xs font-bold text-slate-600 bg-slate-100 px-3 py-1 rounded-full">{today.length} Total</span>
          </div>

          {loading ? (
            <p className="text-xs text-slate-500 py-6 text-center">Loading schedule…</p>
          ) : today.length === 0 ? (
            <EmptyState icon="📅" title="No appointments scheduled" description="No appointments found for this date." />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="text-[11px] uppercase tracking-wider text-slate-500 border-b border-slate-100">
                    <th className="pb-3 pr-4">Period</th>
                    <th className="pb-3 pr-4">Appointment #</th>
                    <th className="pb-3 pr-4">Patient</th>
                    <th className="pb-3 pr-4">Visit Purpose</th>
                    <th className="pb-3 pr-4">Status</th>
                    <th className="pb-3 pr-4">Token #</th>
                    <th className="pb-3 pr-4 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {today.map((a) => (
                    <tr key={a._id} className={a.isPriority ? "bg-rose-50/40" : ""}>
                      <td className="py-3.5 pr-4 font-bold text-emerald-800">{a.appointmentPeriod || "Walk-in"}</td>
                      <td className="py-3.5 pr-4 font-black">{a.appointmentNumber ? `#${a.appointmentNumber}` : "—"}</td>
                      <td className="py-3.5 pr-4">
                        <div className="font-bold">{patientName(a)}</div>
                        <div className="text-[11px] text-slate-500">{patientPhone(a) || "No phone listed"}{a.isPriority ? " • 🚨 EMERGENCY" : ""}</div>
                      </td>
                      <td className="py-3.5 pr-4">
                        {a.visitPurpose ? (
                          <span className="px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-800 font-bold text-[10px]">{purposeLabel(a.visitPurpose)}</span>
                        ) : (
                          <span className="text-[11px] text-slate-400 font-medium">Select at check-in</span>
                        )}
                      </td>
                      <td className="py-3.5 pr-4"><StatusBadge status={a.status} /></td>
                      <td className="py-3.5 pr-4">{a.tokenNumber ? `#${a.tokenNumber}` : "—"}</td>
                      <td className="py-3.5 pr-4 text-right">
                        <div className="flex justify-end gap-2">
                          {a.status === "BOOKED" && (
                            <CommonButton
                              label={checkingIn === a._id ? "Checking in…" : "✓ Check In"}
                              disabled={checkingIn === a._id}
                              onClick={() => openCheckIn(a)}
                              className="px-3 py-1.5 text-xs"
                              containerProps={{ className: "w-auto justify-end" }}
                            />
                          )}
                          {!a.isPriority && !["COMPLETED", "CANCELLED"].includes(a.status) && (
                            <button type="button" disabled={prioritizing === a._id} onClick={() => void handlePriority(a._id)} className="px-3 py-1.5 rounded-xl bg-rose-600 text-white font-bold text-xs disabled:opacity-50">
                              {prioritizing === a._id ? "…" : "🚨 Priority"}
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>
      </div>

      <Modal open={Boolean(selectedAppointment)} title="Check In Patient" onClose={closeCheckIn}>
        {selectedAppointment && (
          <div className="space-y-5 text-left">
            <div className="p-4 rounded-2xl bg-emerald-50/70 border border-emerald-100">
              <p className="text-[10px] font-bold uppercase tracking-wider text-emerald-700">Arriving Patient</p>
              <h3 className="font-manrope text-lg font-extrabold text-slate-900 mt-1">{patientName(selectedAppointment)}</h3>
              <p className="text-xs text-slate-500 mt-1">
                Appointment #{selectedAppointment.appointmentNumber ?? "—"} • {selectedAppointment.appointmentPeriod || "Walk-in"}
              </p>
            </div>

            <div>
              <FormSelect label="Visit Purpose" padding="0" value={visitPurpose} onChange={(e) => setVisitPurpose(e.target.value)} required>
                <option value="">Select visit purpose…</option>
                {VISIT_PURPOSES.map((item) => (
                  <option key={item.value} value={item.value}>{item.label}</option>
                ))}
              </FormSelect>

              {visitPurpose && (
                <div className="mt-3 p-3 rounded-xl bg-slate-50 border border-slate-100 text-xs text-slate-600 leading-relaxed">
                  <span className="font-bold text-slate-800">{purposeLabel(visitPurpose)}:</span>{" "}
                  {VISIT_PURPOSES.find((item) => item.value === visitPurpose)?.description}
                </div>
              )}
            </div>

            <div className="p-3 rounded-xl bg-sky-50 border border-sky-100 text-xs text-sky-900 leading-relaxed">
              <b>Token:</b> A queue token will be generated automatically after the visit purpose is confirmed.
              {visitPurpose === "NEW_TREATMENT" && <> The invoice is created only after the dentist completes the treatment.</>}
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
              <button type="button" onClick={closeCheckIn} disabled={Boolean(checkingIn)} className="px-4 py-2.5 rounded-xl border border-slate-200 bg-white text-xs font-bold text-slate-700 hover:bg-slate-50 disabled:opacity-50">
                Cancel
              </button>
              <CommonButton
                label="Confirm Check-In & Generate Token"
                loading={checkingIn ? "Checking in & generating token…" : false}
                disabled={!visitPurpose || Boolean(checkingIn)}
                onClick={() => void handleCheckIn()}
                className="px-5 py-2.5 text-xs"
                containerProps={{ className: "w-auto" }}
              />
            </div>
          </div>
        )}
      </Modal>
    </>
  );
}
