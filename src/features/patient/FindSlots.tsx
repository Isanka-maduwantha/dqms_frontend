import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import DateSelector from "./DateSelector";
import SlotButton from "../../components/SlotButton";
import CommonButton from "../../components/CommanButton";
import FormSelect from "../../components/FormSelect";
import Alert from "../../components/ui/Alert";
import { ApiError } from "../../lib/api/http";
import { bookAppointment } from "./services/patientApi";
import type { VisitPurpose } from "./types/patient";

function add15Minutes(timeStr: string) {
  const [hours, minutes] = timeStr.split(":").map(Number);
  const date = new Date();
  date.setHours(hours, minutes, 0, 0);
  date.setMinutes(date.getMinutes() + 15);
  return date.toTimeString().slice(0, 5);
}

function findEvening(time: string) {
  const parts = time.split(":");
  return parseInt(parts[0]) + parseInt(parts[1]);
}

const VISIT_PURPOSES: { value: VisitPurpose; label: string; hint: string }[] = [
  { value: "NEW_TREATMENT", label: "New treatment", hint: "A billable procedure will be performed." },
  { value: "FOLLOW_UP", label: "Follow-up", hint: "Reviewing a previous treatment. No new charge." },
  { value: "CHECKUP", label: "Checkup", hint: "Routine examination. No new charge." },
];

function FindSlots() {
  const navigate = useNavigate();
  const [date, setDate] = useState<string>("");
  const [slotArray, setSlotArray] = useState<string[]>([]);
  const [time, setTime] = useState<string>("");
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null);
  const [type, setType] = useState("CHECKUP");
  const [visitPurpose, setVisitPurpose] = useState<VisitPurpose>("NEW_TREATMENT");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleClick = (slot: string) => {
    setTime(slot);
    setSelectedSlot(slot);
  };
  const updateDate = (selectedDate: string) => {
    setDate(selectedDate);
    setTime("");
    setSelectedSlot(null);
  };
  const setSlots = React.useCallback((slots: Array<string>) => {
    setSlotArray(slots);
  }, []);

  async function handleBookAppointment() {
    if (!date || !time) return;
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

  return (
    <div className="flex flex-col grow pl-10 pr-10 pt-9 pb-9">
      <div className="main-text">
        <h1 className="text-2xl font-manrope font-bold  text-green-text-1">
          Find an available slot
        </h1>
        <p className="text-[12px] text-muted-green ">
          Select a provider and time — all slots run in 15-minute intervals.
        </p>
      </div>
      <div className="content gap-5 pt-4 grid grid-cols-5">
        <div className="left-bar col-span-1 flex flex-col gap-5">
          <DateSelector updateSlots={setSlots} handleDateUpdate={updateDate} />
          <div className="appointment-type rounded-[14px] p-5.5 flex flex-col gap-3 border border-border-grey">
            <h4 className="text-[14px] font-manrope font-bold border-bor">
              Appointment type
            </h4>
            <select
              style={{ fontSize: "12px" }}
              id="type"
              className="block w-full  p-2 text-sm  outline-none border font-inter border-border-grey rounded-2xl"
              value={type}
              onChange={(e) => {
                setType(e.target.value);
              }}
            >
              <option value="CHECKUP">Checkup</option>
              <option value="NEW_PATIENT">New patient</option>
              <option value="EMERGENCY">Emergency</option>
              <option value="OTHER">Other</option>
            </select>

            <FormSelect
              label="Visit purpose"
              padding="0"
              value={visitPurpose}
              onChange={(e) => setVisitPurpose(e.target.value as VisitPurpose)}
            >
              {VISIT_PURPOSES.map((p) => (
                <option key={p.value} value={p.value}>
                  {p.label}
                </option>
              ))}
            </FormSelect>
            <p className="text-[11px] text-muted-green">
              {VISIT_PURPOSES.find((p) => p.value === visitPurpose)?.hint}
            </p>
          </div>
        </div>
        <div className="col-span-3 avaliable-slots-container p-5 pb-14 border border-border-grey rounded-[14px] min-w-3/6">
          <h3 className="font-manrope text-sm font-bold text-green-text-1">
            Avaliable Slots
          </h3>
          <p className="text-[12px] text-muted-green">{`Showing results for ${date}`}</p>
          <div className="slots-container flex gap-2 flex-wrap text-[12px] text-green-text-1 font-semibold">
            {slotArray.length === 0 && (
              <p className="text-[12px] text-muted-green pt-3">No available slots for this date.</p>
            )}
            {slotArray.map((slot: string) => (
              <React.Fragment key={slot}>
                {findEvening(slot) === 12 ? (
                  <h2 className="w-full">Evening Slots</h2>
                ) : findEvening(slot) === 9 ? (
                  <h2 className="w-full">Morning Slots</h2>
                ) : null}

                <SlotButton
                  className={`flex items-center pr-32 border border-border-grey rounded-[10px] pl-1 pt-2 pb-2 w-36 h-9 ${
                    selectedSlot === slot
                      ? "bg-accent text-white"
                      : "bg-white text-gray-800"
                  }`}
                  label={slot}
                  onClick={() => handleClick(slot)}
                />
              </React.Fragment>
            ))}
          </div>
        </div>
        <div className="col-span-1 summary rounded-[14px] border relative border-border-grey  max-h-fit  p-5 pb-6 flex flex-col gap-1.5 justify-between min-w-1/6">
          <div className="doctor"></div>
          <div className="book-summary  text-green-text-1 w-full relative bottom-0 self-end">
            <h4 className="pt-3.5 pb-2 text-green-text-1 text-[13px] font-manrope font-bold ">
              Booking Summary
            </h4>
            <div className="pb-1.5 text-sm text-gray-700 flex justify-between text-[11px]">
              <span>Date:</span>{" "}
              <span className="font-bold">{date || "Not selected"}</span>
            </div>
            <div className="pb-1.5 text-sm text-gray-700 flex justify-between text-[11px]">
              <span>Time Slot:</span>{" "}
              <span className="font-bold">{time || "Not selected"}</span>
            </div>
            <div className="pb-1.5 text-sm text-gray-700 flex justify-between text-[11px]">
              <span>Visit purpose:</span>{" "}
              <span className="font-bold">{visitPurpose}</span>
            </div>
            {error && (
              <div className="pb-2">
                <Alert kind="error">{error}</Alert>
              </div>
            )}
            <CommonButton
              label={saving ? "Booking…" : "Book Appointment"}
              className="w-full text-[12px] p-1.5 "
              style={{ fontSize: "12px", marginTop: "10px" }}
              disabled={!date || !time || saving}
              onClick={() => {
                void handleBookAppointment();
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

export default FindSlots;
