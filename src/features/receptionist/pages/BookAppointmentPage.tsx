import { useState, type FormEvent } from "react";
import Card from "../../../components/ui/Card";
import Alert from "../../../components/ui/Alert";
import FormInput from "../../../components/FormInput";
import FormSelect from "../../../components/FormSelect";
import CommonButton from "../../../components/CommanButton";
import { ApiError } from "../../../lib/api/http";
import { todayISODate } from "../../../lib/utils/format";
import {
  bookAppointmentForPatient,
  generateWalkInToken,
  getAvailableSlots,
  searchPatients,
} from "../services/receptionistApi";
import type { AvailableSlot, PatientSummary, VisitPurpose } from "../types/receptionist";

const VISIT_PURPOSES: { value: VisitPurpose; label: string }[] = [
  { value: "NEW_TREATMENT", label: "New treatment (billable)" },
  { value: "FOLLOW_UP", label: "Follow-up (no charge)" },
  { value: "CHECKUP", label: "Checkup (no charge)" },
];

export default function BookAppointmentPage() {
  const [tab, setTab] = useState<"existing" | "walkin">("existing");

  return (
    <div className="flex flex-col gap-6 max-w-4xl">
      <div>
        <h1 className="font-manrope text-2xl font-bold text-green-text-1">
          Book an appointment
        </h1>
        <p className="text-[12px] text-muted-green">
          Reserve a slot for a registered patient or register a walk-in.
        </p>
      </div>

      <div className="flex gap-2 border-b border-border-grey">
        {(["existing", "walkin"] as const).map((key) => (
          <button
            key={key}
            type="button"
            onClick={() => setTab(key)}
            className={`px-4 py-2.5 text-[13px] font-semibold border-b-2 -mb-px ${
              tab === key
                ? "border-accent text-accent"
                : "border-transparent text-muted-green hover:text-green-text-1"
            }`}
          >
            {key === "existing" ? "Existing patient" : "Walk-in patient"}
          </button>
        ))}
      </div>

      {tab === "existing" ? <ExistingPatientForm /> : <WalkInForm />}
    </div>
  );
}

function ExistingPatientForm() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<PatientSummary[]>([]);
  const [selected, setSelected] = useState<PatientSummary | null>(null);
  const [date, setDate] = useState(todayISODate());
  const [slots, setSlots] = useState<AvailableSlot[]>([]);
  const [slotsMessage, setSlotsMessage] = useState<string | null>(null);
  const [time, setTime] = useState("");
  const [type, setType] = useState("CHECKUP");
  const [visitPurpose, setVisitPurpose] = useState<VisitPurpose>("NEW_TREATMENT");
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleSearch = async (value: string) => {
    setQuery(value);
    setSelected(null);
    if (!value.trim()) {
      setResults([]);
      return;
    }
    try {
      const res = await searchPatients(value);
      setResults(res.data);
    } catch {
      setResults([]);
    }
  };

  const loadSlots = async (targetDate: string) => {
    setLoadingSlots(true);
    setSlotsMessage(null);
    setTime("");
    try {
      const res = await getAvailableSlots(targetDate);
      setSlots(res.slots);
      if (res.message) setSlotsMessage(res.message);
    } catch (err) {
      setSlots([]);
      setSlotsMessage(err instanceof ApiError ? err.message : "Failed to load slots.");
    } finally {
      setLoadingSlots(false);
    }
  };

  const handleDateChange = (value: string) => {
    setDate(value);
    void loadSlots(value);
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!selected || !time) return;
    setSaving(true);
    setError(null);
    setSuccess(null);
    try {
      await bookAppointmentForPatient({
        patientId: selected._id,
        appointmentDate: date,
        startTime: time,
        type,
        visitPurpose,
      });
      setSuccess(`Appointment booked for ${selected.name} on ${date} at ${time}.`);
      setSelected(null);
      setQuery("");
      setResults([]);
      setTime("");
      void loadSlots(date);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Failed to book appointment.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Card className="flex flex-col gap-5 max-w-2xl">
      {error && <Alert kind="error">{error}</Alert>}
      {success && <Alert kind="success">{success}</Alert>}

      <div>
        <FormInput
          label="Search patient by name or email"
          padding="0"
          placeholder="Start typing…"
          value={query}
          onChange={(e) => handleSearch(e.target.value)}
        />
        {results.length > 0 && !selected && (
          <div className="mt-2 border border-border-grey rounded-[10px] divide-y divide-border-grey max-h-48 overflow-auto">
            {results.map((patient) => (
              <button
                key={patient._id}
                type="button"
                onClick={() => {
                  setSelected(patient);
                  setResults([]);
                  setQuery(patient.name);
                }}
                className="w-full text-left px-4 py-2.5 text-[12px] hover:bg-gray-50"
              >
                <span className="font-bold text-green-text-1">{patient.name}</span>
                <span className="text-muted-green"> — {patient.email}</span>
              </button>
            ))}
          </div>
        )}
        {selected && (
          <div className="mt-2 text-[12px] bg-accent/5 border border-accent/20 rounded-[10px] px-4 py-2.5">
            Booking for <span className="font-bold">{selected.name}</span> ({selected.email})
          </div>
        )}
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-1">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="font-inter text-[12px] font-bold text-green-text-1">Date</label>
            <input
              type="date"
              value={date}
              onChange={(e) => handleDateChange(e.target.value)}
              className="mt-1 w-full pl-4 pr-4 pt-2.75 pb-2.75 outline-none bg-white border border-border-grey rounded-[10px] text-muted-green text-[14px]"
            />
          </div>
          <FormSelect
            label="Appointment type"
            padding="0"
            value={type}
            onChange={(e) => setType(e.target.value)}
          >
            <option value="CHECKUP">Checkup</option>
            <option value="NEW_PATIENT">New patient</option>
            <option value="EMERGENCY">Emergency</option>
            <option value="OTHER">Other</option>
          </FormSelect>
        </div>

        <FormSelect
          label="Visit purpose"
          value={visitPurpose}
          onChange={(e) => setVisitPurpose(e.target.value as VisitPurpose)}
        >
          {VISIT_PURPOSES.map((p) => (
            <option key={p.value} value={p.value}>
              {p.label}
            </option>
          ))}
        </FormSelect>

        <div className="pt-4">
          <p className="font-inter text-[12px] font-bold text-green-text-1 pb-2">
            Available slots
          </p>
          {loadingSlots ? (
            <p className="text-[12px] text-muted-green">Loading…</p>
          ) : slots.length === 0 ? (
            <p className="text-[12px] text-muted-green">{slotsMessage || "No slots for this date."}</p>
          ) : (
            <div className="flex flex-wrap gap-2 max-h-40 overflow-auto">
              {slots.map((slot) => (
                <button
                  key={slot.time}
                  type="button"
                  disabled={!slot.available}
                  onClick={() => setTime(slot.time)}
                  title={slot.reason}
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

        <div className="pt-5">
          <CommonButton
            type="submit"
            disabled={!selected || !time || saving}
            label={saving ? "Booking…" : "Book appointment"}
            className="text-[13px] py-2.5"
          />
        </div>
      </form>
    </Card>
  );
}

function WalkInForm() {
  const [form, setForm] = useState({
    name: "",
    nic: "",
    phone: "",
    age: "",
    gender: "",
    address: "",
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [token, setToken] = useState<string | null>(null);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    setToken(null);
    try {
      const res = await generateWalkInToken({
        name: form.name,
        nic: form.nic,
        phone: form.phone,
        age: form.age ? Number(form.age) : undefined,
        gender: form.gender || undefined,
        address: form.address || undefined,
      });
      setToken(res.token);
      setForm({ name: "", nic: "", phone: "", age: "", gender: "", address: "" });
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Failed to register walk-in.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Card className="max-w-2xl flex flex-col gap-4">
      {error && <Alert kind="error">{error}</Alert>}
      {token && (
        <Alert kind="success">
          Walk-in token generated: <span className="text-lg font-bold">{token}</span>
        </Alert>
      )}
      <form onSubmit={handleSubmit}>
        <FormInput
          label="Full name"
          padding="0"
          value={form.name}
          onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
          required
        />
        <FormInput
          label="NIC"
          value={form.nic}
          onChange={(e) => setForm((f) => ({ ...f, nic: e.target.value }))}
          required
        />
        <FormInput
          label="Phone"
          value={form.phone}
          onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
          required
        />
        <div className="grid grid-cols-2 gap-4">
          <FormInput
            label="Age (optional)"
            type="number"
            value={form.age}
            onChange={(e) => setForm((f) => ({ ...f, age: e.target.value }))}
          />
          <FormSelect
            label="Gender (optional)"
            value={form.gender}
            onChange={(e) => setForm((f) => ({ ...f, gender: e.target.value }))}
          >
            <option value="">Not specified</option>
            <option value="male">Male</option>
            <option value="female">Female</option>
            <option value="other">Other</option>
          </FormSelect>
        </div>
        <FormInput
          label="Address (optional)"
          value={form.address}
          onChange={(e) => setForm((f) => ({ ...f, address: e.target.value }))}
        />
        <div className="pt-4">
          <CommonButton
            type="submit"
            disabled={saving}
            label={saving ? "Registering…" : "Generate walk-in token"}
            className="text-[13px] py-2.5"
          />
        </div>
      </form>
    </Card>
  );
}
