import { useState } from "react";
import Card from "../../../components/ui/Card";
import Alert from "../../../components/ui/Alert";
import FormInput from "../../../components/FormInput";
import FormSelect from "../../../components/FormSelect";
import CommonButton from "../../../components/CommanButton";
import { ApiError } from "../../../lib/api/http";
import { todayISODate, formatDate } from "../../../lib/utils/format";
import {
  validateNic,
  validatePhone,
  validateEmail,
} from "../../../lib/utils/validation";
import {
  bookAppointmentForPatient,
  generateWalkInToken,
  getAvailableSlots,
  searchPatients,
} from "../services/receptionistApi";

const VISIT_PURPOSES = [
  { value: "NEW_TREATMENT", label: "New Treatment (Billable Catalogue Procedure)" },
  { value: "FOLLOW_UP", label: "Follow-up Review (No new consultation fee)" },
  { value: "CHECKUP", label: "General Checkup & Screening" },
];

export default function BookAppointmentPage() {
  const [tab, setTab] = useState("existing");

  return (
    <div className="space-y-6 text-left max-w-4xl">
      <div>
        <span className="text-xs font-bold text-[#0E7A50] uppercase tracking-wider">
          Reception Booking Desk
        </span>
        <h1 className="font-manrope text-2xl sm:text-3xl font-extrabold text-slate-900 mt-1">
          Schedule or Walk-in Patient
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
          Reserve future time slots for existing patients or generate an instant token for walk-ins.
        </p>
      </div>

      {/* Mode Switcher Tabs */}
      <div className="flex border-b border-slate-200/80 gap-2">
        {[
          { key: "existing", label: "Existing Patient Booking", icon: "👥" },
          { key: "walkin", label: "Walk-in Token Generator", icon: "🚶" },
        ].map((t) => (
          <button
            key={t.key}
            type="button"
            onClick={() => setTab(t.key)}
            className={`flex items-center gap-2 px-5 py-3 text-xs sm:text-sm font-bold border-b-2 -mb-px transition-all duration-200 cursor-pointer ${
              tab === t.key
                ? "border-[#0E7A50] text-[#0E7A50] bg-emerald-50/50 rounded-t-xl"
                : "border-transparent text-slate-500 hover:text-slate-800"
            }`}
          >
            <span>{t.icon}</span>
            <span>{t.label}</span>
          </button>
        ))}
      </div>

      {tab === "existing" ? <ExistingPatientForm /> : <WalkInForm />}
    </div>
  );
}

function ExistingPatientForm() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [selected, setSelected] = useState(null);
  const [date, setDate] = useState(todayISODate());
  const [slots, setSlots] = useState([]);
  const [slotsMessage, setSlotsMessage] = useState(null);
  const [time, setTime] = useState("");
  const [type, setType] = useState("CHECKUP");
  const [visitPurpose, setVisitPurpose] = useState("NEW_TREATMENT");
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  const handleSearch = async (value) => {
    setQuery(value);
    setSelected(null);
    if (!value.trim()) {
      setResults([]);
      return;
    }
    try {
      const res = await searchPatients(value);
      setResults(res.data || []);
    } catch {
      setResults([]);
    }
  };

  const loadSlots = async (targetDate) => {
    setLoadingSlots(true);
    setSlotsMessage(null);
    setTime("");
    try {
      const res = await getAvailableSlots(targetDate);
      setSlots(res.slots || []);
      if (res.message) setSlotsMessage(res.message);
    } catch (err) {
      setSlots([]);
      setSlotsMessage(err instanceof ApiError ? err.message : "Failed to load slots.");
    } finally {
      setLoadingSlots(false);
    }
  };

  const handleDateChange = (value) => {
    setDate(value);
    void loadSlots(value);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selected) {
      setError("Please search and select an existing patient first.");
      return;
    }
    if (!time) {
      setError("Please select an available time slot.");
      return;
    }

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
      setSuccess(
        `Appointment confirmed for ${selected.name} on ${formatDate(date)} at ${time}.`
      );
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
    <Card className="space-y-6 border border-white/80">
      {error && <Alert kind="error">{error}</Alert>}
      {success && <Alert kind="success">{success}</Alert>}

      {/* Patient Search Section */}
      <div className="space-y-2">
        <FormInput
          label="Search Registered Patient (Name, NIC or Email)"
          padding="0"
          placeholder="Start typing patient name or NIC…"
          value={query}
          icon="🔍"
          onChange={(e) => handleSearch(e.target.value)}
        />

        {results.length > 0 && !selected && (
          <div className="border border-slate-200 rounded-2xl bg-white divide-y divide-slate-100 max-h-48 overflow-y-auto shadow-md">
            {results.map((patient) => (
              <button
                key={patient._id}
                type="button"
                onClick={() => {
                  setSelected(patient);
                  setResults([]);
                  setQuery(patient.name);
                }}
                className="w-full text-left px-4 py-3 text-xs hover:bg-emerald-50/70 transition-colors flex items-center justify-between"
              >
                <div>
                  <span className="font-bold text-slate-900">{patient.name}</span>
                  <span className="text-slate-500"> • {patient.email}</span>
                </div>
                <span className="text-xs font-semibold text-[#0E7A50] bg-emerald-50 px-2 py-0.5 rounded">
                  Select
                </span>
              </button>
            ))}
          </div>
        )}

        {selected && (
          <div className="p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-200 text-xs flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-base">👤</span>
              <div>
                <span className="text-slate-600">Selected: </span>
                <span className="font-bold text-emerald-900">{selected.name}</span>
                <span className="text-slate-500"> ({selected.email})</span>
              </div>
            </div>
            <button
              type="button"
              onClick={() => {
                setSelected(null);
                setQuery("");
              }}
              className="text-xs text-rose-600 font-bold hover:underline"
            >
              Change
            </button>
          </div>
        )}
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className="font-inter text-xs font-bold text-slate-700 block mb-1.5">
              Appointment Date
            </label>
            <input
              type="date"
              value={date}
              min={todayISODate()}
              onChange={(e) => handleDateChange(e.target.value)}
              className="w-full bg-white border border-slate-200 rounded-xl py-2.5 px-3.5 text-sm text-slate-800 outline-none focus:border-[#0E7A50]"
              required
            />
          </div>

          <FormSelect
            label="Appointment Category"
            padding="0"
            value={type}
            onChange={(e) => setType(e.target.value)}
          >
            <option value="CHECKUP">Routine Checkup</option>
            <option value="NEW_PATIENT">New Patient</option>
            <option value="EMERGENCY">Emergency Treatment</option>
            <option value="OTHER">Other Procedure</option>
          </FormSelect>
        </div>

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

        {/* Slots Grid */}
        <div className="pt-2">
          <label className="font-inter text-xs font-bold text-slate-700 block mb-1.5">
            Select 15-Minute Slot
          </label>
          {loadingSlots ? (
            <p className="text-xs text-slate-500 py-3">Loading available slots…</p>
          ) : slots.length === 0 ? (
            <p className="text-xs text-slate-500 py-3">
              {slotsMessage || "No slots available for this date."}
            </p>
          ) : (
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2 max-h-48 overflow-y-auto p-1">
              {slots.map((slot) => (
                <button
                  key={slot.time}
                  type="button"
                  disabled={!slot.available}
                  onClick={() => setTime(slot.time)}
                  className={`px-3 py-2 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                    time === slot.time
                      ? "glossy-gradient-btn text-white shadow-md shadow-emerald-700/30 border-emerald-400"
                      : slot.available
                      ? "bg-white text-slate-700 border-slate-200 hover:border-emerald-300 hover:text-[#0E7A50]"
                      : "bg-slate-100 text-slate-400 border-slate-200 opacity-50 cursor-not-allowed"
                  }`}
                >
                  {slot.time}
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="pt-4 border-t border-slate-100">
          <CommonButton
            type="submit"
            disabled={!selected || !time || saving}
            loading={saving ? "Booking appointment…" : false}
            label="Confirm Booking →"
            className="w-full sm:w-auto px-8 py-3 text-sm"
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
  const [fieldErrors, setFieldErrors] = useState({});
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [token, setToken] = useState(null);

  const validate = () => {
    const errors = {};
    if (!form.name || form.name.trim().length < 2) {
      errors.name = "Patient full name is required";
    }
    const nicErr = validateNic(form.nic);
    if (nicErr) errors.nic = nicErr;

    const phoneErr = validatePhone(form.phone);
    if (phoneErr) errors.phone = phoneErr;

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setSaving(true);
    setError(null);
    setToken(null);
    try {
      const res = await generateWalkInToken({
        name: form.name.trim(),
        nic: form.nic.trim().toUpperCase(),
        phone: form.phone.trim(),
        age: form.age ? Number(form.age) : undefined,
        gender: form.gender || undefined,
        address: form.address ? form.address.trim() : undefined,
      });
      setToken(res.token);
      setForm({ name: "", nic: "", phone: "", age: "", gender: "", address: "" });
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Failed to register walk-in patient.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Card className="space-y-5 border border-white/80">
      {error && <Alert kind="error">{error}</Alert>}

      {token && (
        <div className="p-6 rounded-3xl bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-xl flex flex-col sm:flex-row items-center justify-between gap-4 animate-scaleIn">
          <div className="space-y-1 text-center sm:text-left">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-200">
              Walk-in Token Generated Successfully
            </span>
            <h3 className="font-manrope text-xl font-bold">
              Patient Added to Live Waiting Room
            </h3>
            <p className="text-xs text-emerald-100">
              Give this token number to the patient. They will be called in order.
            </p>
          </div>
          <div className="bg-white text-slate-900 px-6 py-3 rounded-2xl font-black text-3xl font-manrope shadow-md tracking-tight">
            #{token}
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} noValidate className="space-y-4">
        <FormInput
          label="Full Patient Name"
          padding="0"
          placeholder="e.g. Sunil Shantha"
          value={form.name}
          error={fieldErrors.name}
          icon="👤"
          onChange={(e) => {
            setForm((f) => ({ ...f, name: e.target.value }));
            if (fieldErrors.name) setFieldErrors((f) => ({ ...f, name: null }));
          }}
          required
        />

        <div className="grid sm:grid-cols-2 gap-4">
          <FormInput
            label="NIC / Identification"
            padding="0"
            placeholder="12 digits or 9 digits+V"
            value={form.nic}
            error={fieldErrors.nic}
            icon="🪪"
            onChange={(e) => {
              setForm((f) => ({ ...f, nic: e.target.value }));
              if (fieldErrors.nic) setFieldErrors((f) => ({ ...f, nic: null }));
            }}
            required
          />

          <FormInput
            label="Phone Number"
            padding="0"
            placeholder="e.g. 0712345678"
            value={form.phone}
            error={fieldErrors.phone}
            icon="📞"
            onChange={(e) => {
              setForm((f) => ({ ...f, phone: e.target.value }));
              if (fieldErrors.phone) setFieldErrors((f) => ({ ...f, phone: null }));
            }}
            required
          />
        </div>

        <div className="grid sm:grid-cols-2 gap-4">
          <FormInput
            label="Age (Optional)"
            padding="0"
            type="number"
            min="1"
            max="120"
            placeholder="e.g. 35"
            value={form.age}
            onChange={(e) => setForm((f) => ({ ...f, age: e.target.value }))}
          />

          <FormSelect
            label="Gender (Optional)"
            padding="0"
            value={form.gender}
            onChange={(e) => setForm((f) => ({ ...f, gender: e.target.value }))}
          >
            <option value="">Not Specified</option>
            <option value="male">Male</option>
            <option value="female">Female</option>
            <option value="other">Other</option>
          </FormSelect>
        </div>

        <FormInput
          label="Residential Address (Optional)"
          padding="0"
          placeholder="e.g. 45 Temple Road, Colombo"
          value={form.address}
          onChange={(e) => setForm((f) => ({ ...f, address: e.target.value }))}
        />

        <div className="pt-3 border-t border-slate-100">
          <CommonButton
            type="submit"
            disabled={saving}
            loading={saving ? "Generating token…" : false}
            label="⚡ Generate Walk-In Queue Token"
            className="w-full sm:w-auto px-8 py-3 text-sm"
          />
        </div>
      </form>
    </Card>
  );
}
