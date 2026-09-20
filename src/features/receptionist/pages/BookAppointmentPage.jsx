import { useEffect, useState } from "react";
import Card from "../../../components/ui/Card";
import Alert from "../../../components/ui/Alert";
import FormInput from "../../../components/FormInput";
import FormSelect from "../../../components/FormSelect";
import CommonButton from "../../../components/CommanButton";
import { ApiError } from "../../../lib/api/http";
import { todayISODate, formatDate } from "../../../lib/utils/format";
import { validateNic, validatePhone } from "../../../lib/utils/validation";
import { bookAppointmentForPatient, generateWalkInToken, getAvailableSlots, searchPatients } from "../services/receptionistApi";

const VISIT_PURPOSES = [
  { value: "NEW_TREATMENT", label: "New Treatment (Billable Catalogue Procedure)" },
  { value: "FOLLOW_UP", label: "Follow-up Review (No new consultation fee)" },
  { value: "CHECKUP_SCREENING", label: "Routine Checkup / Screening" },
];

export default function BookAppointmentPage() {
  const [tab, setTab] = useState("existing");
  return (
    <div className="space-y-6 text-left max-w-4xl">
      <div><span className="text-xs font-bold text-[#0E7A50] uppercase tracking-wider">Reception Booking Desk</span><h1 className="font-manrope text-2xl sm:text-3xl font-extrabold text-slate-900 mt-1">Schedule or Walk-in Patient</h1><p className="text-xs sm:text-sm text-slate-500 mt-0.5">Reserve a morning, afternoon, or evening appointment, or add a walk-in patient to today's queue.</p></div>
      <div className="flex border-b border-slate-200/80 gap-2">
        {[{ key: "existing", label: "Existing Patient Booking", icon: "👥" }, { key: "walkin", label: "Walk-in / Emergency", icon: "🚶" }].map((t) => <button key={t.key} type="button" onClick={() => setTab(t.key)} className={`flex items-center gap-2 px-5 py-3 text-xs sm:text-sm font-bold border-b-2 -mb-px ${tab === t.key ? "border-[#0E7A50] text-[#0E7A50] bg-emerald-50/50 rounded-t-xl" : "border-transparent text-slate-500 hover:text-slate-800"}`}><span>{t.icon}</span><span>{t.label}</span></button>)}
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
  const [periods, setPeriods] = useState([]);
  const [period, setPeriod] = useState("");
  const [appointmentCategory, setAppointmentCategory] = useState("ROUTINE_CHECKUP");
  const [visitPurpose, setVisitPurpose] = useState("NEW_TREATMENT");
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  const loadPeriods = async (targetDate) => {
    setLoading(true); setPeriod("");
    try { const res = await getAvailableSlots(targetDate); setPeriods(res.periods || []); }
    catch (err) { setPeriods([]); setError(err instanceof ApiError ? err.message : "Failed to load appointment periods."); }
    finally { setLoading(false); }
  };

  // Load availability for the default (today's) date as soon as the
  // form mounts. Previously this only ran inside the date <input>'s
  // onChange handler, so if the receptionist never touched the date
  // field, `periods` stayed empty forever, no period buttons ever
  // rendered, and the Confirm Booking button stayed disabled.
  useEffect(() => {
    void loadPeriods(date);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSearch = async (value) => {
    setQuery(value); setSelected(null);
    if (!value.trim()) return setResults([]);
    try { const res = await searchPatients(value); setResults(res.data || []); } catch { setResults([]); }
  };

  const handleSubmit = async (e) => {
    e.preventDefault(); setError(null); setSuccess(null);
    if (!selected) return setError("Please search and select an existing patient first.");
    if (!period) return setError("Please select an available appointment period.");
    setSaving(true);
    try {
      const res = await bookAppointmentForPatient({ patientId: selected._id, appointmentDate: date, appointmentPeriod: period, appointmentCategory, visitPurpose });
      setSuccess(`Appointment confirmed for ${selected.name} on ${formatDate(date)} — ${period.toLowerCase()} appointment #${res.appointmentNumber}.`);
      setSelected(null); setQuery(""); setResults([]); setPeriod(""); await loadPeriods(date);
    } catch (err) { setError(err instanceof ApiError ? err.message : "Failed to book appointment."); }
    finally { setSaving(false); }
  };

  return <Card className="space-y-6 border border-white/80">
    {error && <Alert kind="error">{error}</Alert>}{success && <Alert kind="success">{success}</Alert>}
    <div className="space-y-2">
      <FormInput label="Search Registered Patient (Name, NIC or Email)" padding="0" placeholder="Start typing patient name or NIC…" value={query} icon="🔍" onChange={(e) => void handleSearch(e.target.value)} />
      {results.length > 0 && !selected && <div className="border border-slate-200 rounded-2xl bg-white divide-y divide-slate-100 max-h-48 overflow-y-auto shadow-md">{results.map((patient) => <button key={patient._id} type="button" onClick={() => { setSelected(patient); setResults([]); setQuery(patient.name); }} className="w-full text-left px-4 py-3 text-xs hover:bg-emerald-50/70 flex items-center justify-between"><div><span className="font-bold text-slate-900">{patient.name}</span><span className="text-slate-500"> • {patient.email}</span></div><span className="text-xs font-semibold text-[#0E7A50]">Select</span></button>)}</div>}
      {selected && <div className="p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-200 text-xs flex items-center justify-between"><span>👤 <b>{selected.name}</b> ({selected.email})</span><button type="button" onClick={() => { setSelected(null); setQuery(""); }} className="text-xs text-rose-600 font-bold">Change</button></div>}
    </div>
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid sm:grid-cols-2 gap-4"><div><label className="font-inter text-xs font-bold text-slate-700 block mb-1.5">Appointment Date</label><input type="date" value={date} min={todayISODate()} onChange={(e) => { setDate(e.target.value); void loadPeriods(e.target.value); }} className="w-full bg-white border border-slate-200 rounded-xl py-2.5 px-3.5 text-sm" required /></div><FormSelect label="Appointment Category" padding="0" value={appointmentCategory} onChange={(e) => setAppointmentCategory(e.target.value)}><option value="ROUTINE_CHECKUP">Routine Checkup</option><option value="NEW_PATIENT_REGISTRATION">New Patient Registration</option><option value="SPECIALIST_OTHER_PURPOSE">Specialist / Other Purpose</option></FormSelect></div>
      <FormSelect label="Visit Purpose" padding="0" value={visitPurpose} onChange={(e) => setVisitPurpose(e.target.value)}>{VISIT_PURPOSES.map((item) => <option key={item.value} value={item.value}>{item.label}</option>)}</FormSelect>
      <div><label className="font-inter text-xs font-bold text-slate-700 block mb-2">Appointment Period</label>{loading ? <p className="text-xs text-slate-500 py-3">Loading availability…</p> : <div className="grid sm:grid-cols-3 gap-2">{periods.map((item) => <button key={item.period} type="button" disabled={!item.available} onClick={() => setPeriod(item.period)} className={`p-3 rounded-xl border text-left ${period === item.period ? "border-emerald-500 bg-emerald-50" : item.available ? "border-slate-200 bg-white hover:border-emerald-300" : "border-slate-200 bg-slate-50 opacity-50"}`}><div className="font-bold text-sm">{item.label}</div><div className="text-[11px] text-slate-500">{item.startTime} – {item.endTime}</div><div className="text-[11px] font-bold text-[#0E7A50] mt-1">{item.remaining} / {item.capacity} seats</div>{item.available && <div className="text-[10px] text-slate-500 mt-1">Numbers: {item.availableNumbers.join(", ") || "next"}</div>}</button>)}</div>}</div>
      <div className="pt-4 border-t border-slate-100"><CommonButton type="submit" disabled={!selected || !period || saving} loading={saving ? "Booking appointment…" : false} label="Confirm Booking →" className="w-full sm:w-auto px-8 py-3 text-sm" /></div>
    </form>
  </Card>;
}

function WalkInForm() {
  const [form, setForm] = useState({ name: "", nic: "", phone: "", age: "", gender: "", address: "" });
  const [emergency, setEmergency] = useState(false); const [fieldErrors, setFieldErrors] = useState({}); const [saving, setSaving] = useState(false); const [error, setError] = useState(null); const [token, setToken] = useState(null);
  const update = (key, value) => setForm((current) => ({ ...current, [key]: value }));
  const validate = () => { const errors = {}; if (!form.name.trim() || form.name.trim().length < 2) errors.name = "Patient full name is required"; const nicErr = validateNic(form.nic); if (nicErr) errors.nic = nicErr; const phoneErr = validatePhone(form.phone); if (phoneErr) errors.phone = phoneErr; setFieldErrors(errors); return Object.keys(errors).length === 0; };
  const handleSubmit = async (e) => { e.preventDefault(); if (!validate()) return; setSaving(true); setError(null); setToken(null); try { const res = await generateWalkInToken({ name: form.name.trim(), nic: form.nic.trim().toUpperCase(), phone: form.phone.trim(), age: form.age ? Number(form.age) : undefined, gender: form.gender || undefined, address: form.address ? form.address.trim() : undefined, emergency }); setToken(res.tokenNumber ?? res.token); } catch (err) { setError(err instanceof ApiError ? err.message : "Failed to add walk-in patient."); } finally { setSaving(false); } };
  return <Card className="space-y-5 border border-white/80">
    {error && <Alert kind="error">{error}</Alert>}
    <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-xs text-amber-900"><b>Emergency priority:</b> Use this only when the patient has an actual emergency. The patient will be placed ahead of normal waiting patients.</div>
    <form onSubmit={handleSubmit} className="space-y-4">
      <FormInput label="Patient Full Name" padding="0" value={form.name} onChange={(e) => update("name", e.target.value)} error={fieldErrors.name} required />
      <div className="grid sm:grid-cols-2 gap-4"><FormInput label="NIC" padding="0" value={form.nic} onChange={(e) => update("nic", e.target.value)} error={fieldErrors.nic} required /><FormInput label="Phone" padding="0" value={form.phone} onChange={(e) => update("phone", e.target.value)} error={fieldErrors.phone} required /></div>
      <div className="grid sm:grid-cols-2 gap-4"><FormInput label="Age (Optional)" type="number" padding="0" value={form.age} onChange={(e) => update("age", e.target.value)} /><FormSelect label="Gender (Optional)" padding="0" value={form.gender} onChange={(e) => update("gender", e.target.value)}><option value="">Select</option><option value="Male">Male</option><option value="Female">Female</option><option value="Other">Other</option></FormSelect></div>
      <FormInput label="Address (Optional)" padding="0" value={form.address} onChange={(e) => update("address", e.target.value)} />
      <label className="flex items-center gap-3 p-4 rounded-xl border border-rose-200 bg-rose-50 cursor-pointer"><input type="checkbox" checked={emergency} onChange={(e) => setEmergency(e.target.checked)} /><span className="text-sm font-extrabold text-rose-800">🚨 Mark as Emergency Priority</span></label>
      <CommonButton type="submit" disabled={saving} loading={saving ? "Adding to queue…" : false} label={emergency ? "Add Emergency Patient →" : "Add Walk-in Patient →"} className="w-full sm:w-auto px-8 py-3" />
    </form>
    {token !== null && <Alert kind="success">Patient added to the queue. Token #{token}{emergency ? " — EMERGENCY PRIORITY" : ""}</Alert>}
  </Card>;
}