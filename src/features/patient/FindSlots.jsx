import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import DateSelector from "./DateSelector";
import SlotButton from "../../components/SlotButton";
import CommonButton from "../../components/CommanButton";
import FormSelect from "../../components/FormSelect";
import Alert from "../../components/ui/Alert";
import Card from "../../components/ui/Card";
import { ApiError } from "../../lib/api/http";
import { formatDate } from "../../lib/utils/format";
import { bookAppointment } from "./services/patientApi";

function add15Minutes(timeStr) {
  const [hours, minutes] = timeStr.split(":").map(Number);
  const date = new Date();
  date.setHours(hours, minutes, 0, 0);
  date.setMinutes(date.getMinutes() + 15);
  return date.toTimeString().slice(0, 5);
}

const VISIT_PURPOSES = [
  {
    value: "NEW_TREATMENT",
    label: "New Treatment Procedure",
    hint: "Clinical dental procedure requiring billing catalogue entry.",
  },
  {
    value: "FOLLOW_UP",
    label: "Follow-Up Consultation",
    hint: "Reviewing previous dental work or healing progress. No new charge.",
  },
  {
    value: "CHECKUP",
    label: "Routine Checkup & Screening",
    hint: "Preventative dental inspection and dental hygiene advice.",
  },
];

function FindSlots() {
  const navigate = useNavigate();
  const [date, setDate] = useState("");
  const [slotArray, setSlotArray] = useState([]);
  const [time, setTime] = useState("");
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [type, setType] = useState("CHECKUP");
  const [visitPurpose, setVisitPurpose] = useState("NEW_TREATMENT");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  const handleClick = (slot) => {
    setTime(slot);
    setSelectedSlot(slot);
    setError(null);
  };

  const updateDate = (selectedDate) => {
    setDate(selectedDate);
    setTime("");
    setSelectedSlot(null);
    setError(null);
  };

  const setSlots = React.useCallback((slots) => {
    setSlotArray(slots);
  }, []);

  async function handleBookAppointment() {
    if (!date || !time) {
      setError("Please select both a date and an available time slot.");
      return;
    }
    setSaving(true);
    setError(null);
    try {
      await bookAppointment({
        appointmentDate: date,
        startTime: time,
        endTime: add15Minutes(time),
        type,
        visitPurpose,
      });
      navigate("/patient/dashboard");
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Failed to book appointment.");
    } finally {
      setSaving(false);
    }
  }

  // Filter slots into morning (< 12:00) and afternoon/evening (>= 12:00)
  const morningSlots = slotArray.filter((s) => {
    const hour = parseInt(s.split(":")[0], 10);
    return hour < 12;
  });

  const afternoonSlots = slotArray.filter((s) => {
    const hour = parseInt(s.split(":")[0], 10);
    return hour >= 12;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-6 text-left">
      {/* Header */}
      <div>
        <span className="text-xs font-bold text-blue-600 uppercase tracking-wider">
          Appointment Booking
        </span>
        <h1 className="font-manrope text-2xl sm:text-3xl font-extrabold text-slate-900 mt-1">
          Select Clinical Slot
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
          Pick your appointment type, visit purpose, and preferred 15-minute slot.
        </p>
      </div>

      {error && <Alert kind="error">{error}</Alert>}

      <div className="grid lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Date & Appointment Type (4 cols) */}
        <div className="lg:col-span-4 space-y-5">
          <DateSelector updateSlots={setSlots} handleDateUpdate={updateDate} />

          <Card className="p-5 space-y-4">
            <span className="font-manrope font-bold text-sm text-slate-800 flex items-center gap-2">
              <span>⚙️</span>
              <span>Visit Configuration</span>
            </span>

            <FormSelect
              label="Appointment Category"
              padding="0"
              value={type}
              onChange={(e) => setType(e.target.value)}
            >
              <option value="CHECKUP">Routine Checkup</option>
              <option value="NEW_PATIENT">New Patient Registration</option>
              <option value="EMERGENCY">Emergency / Severe Pain</option>
              <option value="OTHER">Specialist Consultation</option>
            </FormSelect>

            <FormSelect
              label="Visit Purpose"
              padding="0"
              value={visitPurpose}
              onChange={(e) => setVisitPurpose(e.target.value)}
            >
              {VISIT_PURPOSES.map((p) => (
                <option key={p.value} value={p.value}>
                  {p.label}
                </option>
              ))}
            </FormSelect>

            <div className="p-3 rounded-xl bg-blue-50/70 border border-blue-100 text-[11px] text-blue-800 leading-relaxed">
              💡 {VISIT_PURPOSES.find((p) => p.value === visitPurpose)?.hint}
            </div>
          </Card>
        </div>

        {/* Center Column: Available Slots Grid (5 cols) */}
        <div className="lg:col-span-5">
          <Card className="p-6 space-y-6">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <div>
                <h3 className="font-manrope text-base font-bold text-slate-800">
                  Available Slots
                </h3>
                <p className="text-xs text-slate-500">
                  {date ? `Showing results for ${formatDate(date)}` : "Select a date to view slots"}
                </p>
              </div>
              <span className="px-2.5 py-1 rounded-full bg-blue-50 text-blue-700 text-xs font-bold">
                {slotArray.length} slots available
              </span>
            </div>

            {slotArray.length === 0 ? (
              <div className="py-12 text-center text-slate-500 text-xs space-y-2">
                <div className="text-3xl">⏰</div>
                <div className="font-bold text-slate-700">No open slots for this date</div>
                <p className="text-slate-500 max-w-xs mx-auto">
                  All appointments are currently booked for this schedule. Please select another date from the calendar.
                </p>
              </div>
            ) : (
              <div className="space-y-5">
                {/* Morning Slots */}
                {morningSlots.length > 0 && (
                  <div>
                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2.5 flex items-center gap-1.5">
                      <span>🌅</span>
                      <span>Morning Slots</span>
                    </h4>
                    <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                      {morningSlots.map((slot) => (
                        <SlotButton
                          key={slot}
                          label={slot}
                          selected={selectedSlot === slot}
                          onClick={() => handleClick(slot)}
                        />
                      ))}
                    </div>
                  </div>
                )}

                {/* Afternoon & Evening Slots */}
                {afternoonSlots.length > 0 && (
                  <div>
                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2.5 flex items-center gap-1.5">
                      <span>🌇</span>
                      <span>Afternoon & Evening Slots</span>
                    </h4>
                    <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                      {afternoonSlots.map((slot) => (
                        <SlotButton
                          key={slot}
                          label={slot}
                          selected={selectedSlot === slot}
                          onClick={() => handleClick(slot)}
                        />
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </Card>
        </div>

        {/* Right Column: Booking Summary Card (3 cols) */}
        <div className="lg:col-span-3">
          <div className="glass-card p-6 space-y-5 border border-white/80 sticky top-28">
            <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
              <span className="text-lg">📋</span>
              <h4 className="font-manrope font-bold text-base text-slate-800">
                Booking Summary
              </h4>
            </div>

            <div className="space-y-3 text-xs">
              <div className="flex justify-between py-1.5 border-b border-slate-100">
                <span className="text-slate-500">Date:</span>
                <span className="font-bold text-slate-800">{date ? formatDate(date) : "Not selected"}</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-slate-100">
                <span className="text-slate-500">Time Slot:</span>
                <span className={`font-bold ${time ? "text-blue-600 font-extrabold" : "text-slate-400"}`}>
                  {time ? `${time} (${add15Minutes(time)})` : "Not selected"}
                </span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-slate-100">
                <span className="text-slate-500">Category:</span>
                <span className="font-bold text-slate-800">{type}</span>
              </div>
              <div className="flex justify-between py-1.5">
                <span className="text-slate-500">Visit Purpose:</span>
                <span className="font-bold text-slate-800">{visitPurpose}</span>
              </div>
            </div>

            <div className="pt-2">
              <CommonButton
                label="Confirm & Book Slot →"
                loading={saving ? "Reserving slot…" : false}
                disabled={!date || !time || saving}
                onClick={handleBookAppointment}
                className="w-full py-3 text-xs sm:text-sm shadow-md"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default FindSlots;
