import { useCallback, useEffect, useState } from "react";
import { type ApointmentData } from "./types/patient";
import CommanButton from "../../components/CommanButton";
import StatusBadge from "../../components/StatusBadge";
import Modal from "../../components/ui/Modal";
import Alert from "../../components/ui/Alert";
import { NavLink } from "react-router-dom";
import { ApiError } from "../../lib/api/http";
import { formatDate, titleCase, todayISODate } from "../../lib/utils/format";
import {
  cancelAppointment,
  getAvailableSlots,
  getUpcomingAppointments,
  rescheduleAppointment,
} from "./services/patientApi";
import type { AvailableSlot } from "./types/patient";

function PatientDashboard() {
  const [data, setData] = useState<ApointmentData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [tab, setTab] = useState<"upcoming" | "past">("upcoming");
  const [rescheduling, setRescheduling] = useState<ApointmentData | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await getUpcomingAppointments();
      setData(res.upcomingAppointments || []);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Something went wrong");
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
      ? item.status !== "CANCELLED" && item.status !== "COMPLETED" && item.appointmentDate >= today
      : item.status === "CANCELLED" || item.status === "COMPLETED" || item.appointmentDate < today,
  );

  async function onCancel(id: string) {
    setActionError(null);
    if (!confirm("Cancel this appointment?")) return;
    try {
      await cancelAppointment(id);
      await load();
    } catch (err) {
      setActionError(err instanceof ApiError ? err.message : "Failed to cancel appointment.");
    }
  }

  return (
    <div className="grow p-10 pt-9 pb-9 flex flex-col gap-5">
      <section className="flex flex-col pb-2 gap-6">
        <div className="flex justify-between">
          <div className="main-text text-left gap-1.5">
            <h1 className=" text-2xl text-green-text-1 ">
              Appointment Management
            </h1>
            <p className=" text-[12px] text-muted-green">
              Cancellations within 24 hours may incur a clinical service fee.
            </p>
          </div>
          <NavLink to="/patient/book-appointment">
            <CommanButton
              label="📅 Book new appointment"
              className="text-[13px] pl-4.5 pt-2.5 pb-2.5 pr-4.5 font-inter "
            />
          </NavLink>
        </div>
      </section>

      {actionError && <Alert kind="error">{actionError}</Alert>}

      <div className="card p-5 gap-2.5 bg-cyan-green rounded-[14px]">
        <span className="pill bg-[#fff3] text-white p-2.5 pt-1 pb-1 poiner rounded-full text-[11px]">
          Active care plan
        </span>
        <p className="text-[19px] font-manrope text-white">
          Manage your health journey with precision.
        </p>
      </div>
      <section className="myappointments  border border-border-grey rounded-[10px] p-3 pt-3.5 flex flex-col gap-4">
        <div className="appointment-timeframe flex gap-5 h-5">
          <button
            type="button"
            onClick={() => setTab("upcoming")}
            className={`inline-block text-[13px] font-bold pb-1 border-b-2 ${
              tab === "upcoming" ? "text-cyan-green border-b-cyan-green" : "text-muted-green border-b-transparent"
            }`}
          >
            Upcoming
          </button>
          <button
            type="button"
            onClick={() => setTab("past")}
            className={`inline-block text-[13px] font-bold pb-1 border-b-2 ${
              tab === "past" ? "text-cyan-green border-b-cyan-green" : "text-muted-green border-b-transparent"
            }`}
          >
            Past Visits
          </button>
        </div>

        <div className="w-full text-left text-sm text-slate-800">
          <div className="grid grid-cols-12 border-b border-gray-100 pb-4 text-[11px] font-semibold tracking-wider text-gray-500">
            <div className="relative col-span-3">DATE & TIME</div>
            <div className="col-span-2">TYPE</div>
            <div className="col-span-3">VISIT PURPOSE</div>
            <div className="col-span-2">STATUS</div>
            <div className="col-span-2"></div>
          </div>

          <div className="divide-y divide-gray-100">
            {loading && (
              <div className="py-6 text-center text-gray-500">Loading appointments...</div>
            )}

            {!loading && error && (
              <div className="py-6 text-center text-red-500">{error}</div>
            )}

            {!loading && !error && visible.length === 0 && (
              <div className="py-6 text-center text-gray-500 text-[12px]">
                No {tab} appointments to show.
              </div>
            )}

            {!loading &&
              !error &&
              visible.map((item) => (
                <div
                  key={item._id}
                  className="grid grid-cols-12 items-center pt-3.5 pb-3.5 hover:bg-gray-50/50 text-[11px]"
                >
                  <div className="col-span-3 pr-4 text-gray-700">
                    {`${formatDate(item.appointmentDate)} • ${item.startTime}`}
                  </div>
                  <div className="col-span-2 pr-4 text-gray-700">{titleCase(item.type)}</div>
                  <div className="col-span-3 pr-4 text-gray-700">
                    {titleCase(item.visitPurpose || "—")}
                  </div>
                  <div className="col-span-2 pr-4">
                    <StatusBadge status={item.status} />
                  </div>
                  <div className="col-span-2">
                    {item.status === "BOOKED" && (
                      <div className="flex items-center justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => setRescheduling(item)}
                          className="rounded-xl border border-gray-300 px-4 py-1.5 text-xs font-semibold text-gray-800 hover:bg-gray-50"
                        >
                          Reschedule
                        </button>
                        <button
                          type="button"
                          onClick={() => onCancel(item._id)}
                          className="rounded-xl border border-gray-300 px-4 py-1.5 text-xs font-semibold text-gray-800 hover:bg-gray-50"
                        >
                          Cancel
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
          </div>
        </div>
      </section>

      <RescheduleModal
        appointment={rescheduling}
        onClose={() => setRescheduling(null)}
        onDone={() => {
          setRescheduling(null);
          void load();
        }}
      />
    </div>
  );
}

function RescheduleModal({
  appointment,
  onClose,
  onDone,
}: {
  appointment: ApointmentData | null;
  onClose: () => void;
  onDone: () => void;
}) {
  const [date, setDate] = useState(todayISODate());
  const [slots, setSlots] = useState<AvailableSlot[]>([]);
  const [time, setTime] = useState("");
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadSlots = useCallback(async (targetDate: string) => {
    setLoadingSlots(true);
    setTime("");
    try {
      const res = await getAvailableSlots(targetDate);
      setSlots(res.slots);
    } catch {
      setSlots([]);
    } finally {
      setLoadingSlots(false);
    }
  }, []);

  useEffect(() => {
    if (appointment) {
      setDate(todayISODate());
      setError(null);
      void loadSlots(todayISODate());
    }
  }, [appointment, loadSlots]);

  const handleSubmit = async () => {
    if (!appointment || !time) return;
    setSaving(true);
    setError(null);
    try {
      const [h, m] = time.split(":").map(Number);
      const endDate = new Date();
      endDate.setHours(h, m + 15, 0, 0);
      const endTime = `${String(endDate.getHours()).padStart(2, "0")}:${String(endDate.getMinutes()).padStart(2, "0")}`;
      await rescheduleAppointment(appointment._id, date, time, endTime);
      onDone();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Failed to reschedule appointment.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal open={Boolean(appointment)} title="Reschedule appointment" onClose={onClose}>
      <div className="flex flex-col gap-3">
        <div>
          <label className="font-inter text-[12px] font-bold text-green-text-1">New date</label>
          <input
            type="date"
            value={date}
            min={todayISODate()}
            onChange={(e) => {
              setDate(e.target.value);
              void loadSlots(e.target.value);
            }}
            className="mt-1 block w-full pl-4 pr-4 py-2 outline-none bg-white border border-border-grey rounded-[10px] text-muted-green text-[14px]"
          />
        </div>

        <div>
          <p className="font-inter text-[12px] font-bold text-green-text-1 pb-2">Available slots</p>
          {loadingSlots ? (
            <p className="text-[12px] text-muted-green">Loading…</p>
          ) : slots.length === 0 ? (
            <p className="text-[12px] text-muted-green">No slots for this date.</p>
          ) : (
            <div className="flex flex-wrap gap-2 max-h-40 overflow-auto">
              {slots.map((slot) => (
                <button
                  key={slot.time}
                  type="button"
                  disabled={!slot.available}
                  onClick={() => setTime(slot.time)}
                  className={`px-3 py-1.5 rounded-[8px] text-[12px] font-semibold border ${
                    time === slot.time
                      ? "bg-accent text-white border-accent"
                      : slot.available
                        ? "bg-white text-green-text-1 border-border-grey hover:border-accent"
                        : "bg-gray-100 text-gray-400 border-gray-100 cursor-not-allowed"
                  }`}
                >
                  {slot.time}
                </button>
              ))}
            </div>
          )}
        </div>

        {error && (
          <p className="text-[12px] text-red-600" role="alert">
            {error}
          </p>
        )}

        <div className="pt-2">
          <CommanButton
            label={saving ? "Saving…" : "Confirm reschedule"}
            disabled={!time || saving}
            onClick={handleSubmit}
            className="text-[13px] py-2.5"
          />
        </div>
      </div>
    </Modal>
  );
}

export default PatientDashboard;
