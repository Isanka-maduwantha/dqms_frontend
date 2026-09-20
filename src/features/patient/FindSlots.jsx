import { useCallback, useState } from "react";
import { useNavigate } from "react-router-dom";
import DateSelector from "./DateSelector";
import CommonButton from "../../components/CommanButton";
import Alert from "../../components/ui/Alert";
import Card from "../../components/ui/Card";
import { ApiError } from "../../lib/api/http";
import { formatDate } from "../../lib/utils/format";
import { bookAppointment } from "./services/patientApi";

function FindSlots() {
  const navigate = useNavigate();
  const [date, setDate] = useState("");
  const [periods, setPeriods] = useState([]);
  const [period, setPeriod] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  const updateDate = useCallback((selectedDate) => {
    setDate(selectedDate);
    setPeriod("");
    setError(null);
    setSuccess(null);
  }, []);

  const updatePeriods = useCallback((items) => {
    setPeriods(items);
    setPeriod((current) =>
      items.some((item) => item.period === current && item.available)
        ? current
        : ""
    );
  }, []);

  const selectedPeriod = periods.find((item) => item.period === period);

  async function handleBookAppointment() {
    if (!date || !period) {
      setError("Please select a date and an available appointment period.");
      return;
    }

    setSaving(true);
    setError(null);
    setSuccess(null);

    try {
      const res = await bookAppointment({
        appointmentDate: date,
        appointmentPeriod: period,
      });

      setSuccess(
        `Appointment confirmed. Your ${selectedPeriod?.label || period.toLowerCase()} appointment number is #${res.appointmentNumber}.`
      );

      window.setTimeout(() => navigate("/patient/dashboard"), 1200);
    } catch (err) {
      setError(
        err instanceof ApiError ? err.message : "Failed to book appointment."
      );
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-6 text-left">
      <div>
        <span className="text-xs font-bold text-[#0E7A50] uppercase tracking-wider">
          Appointment Booking
        </span>
        <h1 className="font-manrope text-2xl sm:text-3xl font-extrabold text-slate-900 mt-1">
          Book an Appointment
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
          Select your visit date and a clinic period. Your visit purpose will be confirmed by reception when you arrive.
        </p>
      </div>

      {error && <Alert kind="error">{error}</Alert>}
      {success && <Alert kind="success">{success}</Alert>}

      <div className="grid lg:grid-cols-12 gap-6 items-start">
        <div className="lg:col-span-4 space-y-5">
          <DateSelector
            updatePeriods={updatePeriods}
            handleDateUpdate={updateDate}
          />

          <Card className="p-5 space-y-4">
            <span className="font-manrope font-bold text-sm text-slate-800 flex items-center gap-2">
              <span>🦷</span>
              <span>What happens at the clinic?</span>
            </span>

            <div className="space-y-3 text-xs text-slate-600 leading-relaxed">
              <div className="flex gap-3">
                <span className="w-7 h-7 rounded-lg bg-emerald-50 text-[#0E7A50] flex items-center justify-center shrink-0">1</span>
                <p>Choose an available date and clinic period and confirm your appointment.</p>
              </div>
              <div className="flex gap-3">
                <span className="w-7 h-7 rounded-lg bg-emerald-50 text-[#0E7A50] flex items-center justify-center shrink-0">2</span>
                <p>When you arrive, reception will check you in and ask whether the visit is a new treatment, follow-up consultation, or routine checkup/screening.</p>
              </div>
              <div className="flex gap-3">
                <span className="w-7 h-7 rounded-lg bg-emerald-50 text-[#0E7A50] flex items-center justify-center shrink-0">3</span>
                <p>Reception then gives you your live queue token. If the visit is a new treatment, billing is created after the dentist completes the treatment.</p>
              </div>
            </div>
          </Card>
        </div>

        <div className="lg:col-span-5">
          <Card className="p-6 space-y-5">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <div>
                <h3 className="font-manrope text-base font-bold text-slate-800">Available Clinic Periods</h3>
                <p className="text-xs text-slate-500">
                  {date ? `Showing results for ${formatDate(date)}` : "Select a date to view availability"}
                </p>
              </div>
              <span className="px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-800 text-xs font-bold">
                {periods.filter((p) => p.available).length} available
              </span>
            </div>

            {periods.length === 0 ? (
              <div className="py-12 text-center text-slate-500 text-xs">
                <div className="text-3xl">📅</div>
                <div className="font-bold text-slate-700 mt-2">No appointment periods available</div>
                <p className="mt-1">The clinic may be closed on the selected date.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {periods.map((item) => (
                  <button
                    key={item.period}
                    type="button"
                    disabled={!item.available}
                    onClick={() => {
                      setPeriod(item.period);
                      setError(null);
                    }}
                    className={`w-full text-left p-4 rounded-2xl border transition-all ${
                      period === item.period
                        ? "border-emerald-500 bg-emerald-50 shadow-md"
                        : item.available
                          ? "border-slate-200 bg-white hover:border-emerald-300"
                          : "border-slate-200 bg-slate-50 opacity-60 cursor-not-allowed"
                    }`}
                  >
                    <div className="flex items-center justify-between gap-4">
                      <div>
                        <div className="font-manrope font-extrabold text-base text-slate-800">
                          {item.period === "MORNING" ? "🌅" : item.period === "AFTERNOON" ? "☀️" : "🌙"} {item.label}
                        </div>
                        <div className="text-xs text-slate-500 mt-1">{item.startTime} – {item.endTime}</div>
                      </div>
                      <div className="text-right">
                        <div className="text-lg font-black text-[#0E7A50]">{item.remaining}</div>
                        <div className="text-[10px] uppercase font-bold text-slate-500">of {item.capacity} seats</div>
                      </div>
                    </div>
                    <div className="mt-3 text-xs font-semibold text-slate-600">
                      {item.available
                        ? `Available appointment numbers: ${item.availableNumbers.join(", ") || "Next booking position"}`
                        : item.reason}
                    </div>
                  </button>
                ))}
              </div>
            )}
          </Card>
        </div>

        <div className="lg:col-span-3">
          <div className="glass-card p-6 space-y-5 border border-white/80 sticky top-28">
            <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
              <span>📋</span>
              <h4 className="font-manrope font-bold text-base text-slate-800">Booking Summary</h4>
            </div>

            <div className="space-y-3 text-xs">
              <div className="flex justify-between gap-3 py-1.5 border-b border-slate-100">
                <span className="text-slate-500">Date:</span>
                <span className="font-bold text-slate-800">{date ? formatDate(date) : "Not selected"}</span>
              </div>
              <div className="flex justify-between gap-3 py-1.5 border-b border-slate-100">
                <span className="text-slate-500">Period:</span>
                <span className="font-bold text-[#0E7A50]">{selectedPeriod?.label || "Not selected"}</span>
              </div>
              <div className="flex justify-between gap-3 py-1.5">
                <span className="text-slate-500">Check-in:</span>
                <span className="font-bold text-slate-600 text-right">Completed at reception</span>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-sky-50 border border-sky-100 text-xs text-sky-900">
              Your appointment number is assigned automatically when you confirm. A queue token is assigned by reception when you arrive.
            </div>

            <CommonButton
              label="Confirm & Book Appointment →"
              loading={saving ? "Booking…" : false}
              disabled={!date || !period || saving}
              onClick={handleBookAppointment}
              className="w-full py-3 text-xs sm:text-sm shadow-md"
            />
          </div>
        </div>
      </div>
    </div>
  );
}

export default FindSlots;
