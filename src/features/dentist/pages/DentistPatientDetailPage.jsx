import { useCallback, useEffect, useState } from "react";
import { Link, useLocation, useNavigate, useParams } from "react-router-dom";
import Card from "../../../components/ui/Card";
import Alert from "../../../components/ui/Alert";
import EmptyState from "../../../components/ui/EmptyState";
import FormInput from "../../../components/FormInput";
import FormSelect from "../../../components/FormSelect";
import CommonButton from "../../../components/CommanButton";
import { ApiError } from "../../../lib/api/http";
import { formatCurrency, formatDate, todayISODate } from "../../../lib/utils/format";
import {
  createTreatmentRecord,
  endTreatment,
  getInventoryItems,
  getPatientHistory,
  getTreatmentTypes,
} from "../services/dentistApi";

export default function DentistPatientDetailPage() {
  const { patientId = "" } = useParams();
  const location = useLocation();
  const appointmentId = location.state?.appointmentId;
  const [patient, setPatient] = useState(null);
  const [records, setRecords] = useState([]);
  const [treatmentTypes, setTreatmentTypes] = useState([]);
  const [inventory, setInventory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadHistory = useCallback(async () => {
    const res = await getPatientHistory(patientId);
    setPatient(res.patient);
    setRecords(res.treatmentRecords || []);
  }, [patientId]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      setError(null);
      try {
        const [, typesRes, inventoryRes] = await Promise.all([
          loadHistory(),
          getTreatmentTypes(),
          getInventoryItems(),
        ]);
        if (cancelled) return;
        setTreatmentTypes(typesRes.treatments || []);
        setInventory(inventoryRes.items || []);
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof ApiError ? err.message : "Failed to load patient chart.");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [loadHistory]);

  if (loading) {
    return (
      <div className="py-12 text-center text-slate-500 text-xs flex flex-col items-center gap-2">
        <svg className="animate-spin h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
        </svg>
        <span>Loading patient dental chart…</span>
      </div>
    );
  }

  return (
    <div className="space-y-6 text-left max-w-5xl">
      {/* Navigation breadcrumb */}
      <div>
        <Link
          to="/dentist/patients"
          className="inline-flex items-center gap-1.5 text-xs font-bold text-blue-600 hover:underline"
        >
          <span>←</span>
          <span>Back to patient search</span>
        </Link>
      </div>

      {error && <Alert kind="error">{error}</Alert>}

      {/* Patient Header Card */}
      {patient && (
        <div className="glass-card p-6 sm:p-7 border border-white/90 shadow-glass flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-blue-600">
              Active Dental Chart
            </span>
            <h1 className="font-manrope text-2xl sm:text-3xl font-extrabold text-slate-900">
              {patient.name}
            </h1>
            <p className="text-xs text-slate-500">
              {patient.email} • {patient.phone || "No phone"} • NIC:{" "}
              <span className="font-mono">{patient.nic || "—"}</span>
            </p>
          </div>

          {appointmentId && <EndTreatmentButton appointmentId={appointmentId} />}
        </div>
      )}

      {/* New Treatment Form Card */}
      <NewTreatmentForm
        patientId={patientId}
        treatmentTypes={treatmentTypes}
        inventory={inventory}
        onCreated={() => void loadHistory()}
      />

      {/* Treatment Records History List */}
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h2 className="font-manrope font-bold text-lg text-slate-900">
            Treatment Records History ({records.length})
          </h2>
          <span className="text-xs text-slate-500">Documented Clinical Procedures</span>
        </div>

        {records.length === 0 ? (
          <EmptyState
            icon="🦷"
            title="No treatment records found"
            description="Document the first procedure above to begin this patient's digital chart."
          />
        ) : (
          <div className="grid gap-4">
            {[...records]
              .sort(
                (a, b) =>
                  new Date(b.treatmentDate).getTime() - new Date(a.treatmentDate).getTime()
              )
              .map((record) => (
                <Card key={record._id} className="p-6 space-y-3 border border-white/80">
                  <div className="flex flex-wrap justify-between items-start gap-2 border-b border-slate-100 pb-3">
                    <div>
                      <h3 className="font-manrope font-bold text-base text-slate-900">
                        {record.treatment || record.treatmentTypeName || "Dental Procedure"}
                      </h3>
                      {record.treatmentTypeName && (
                        <p className="text-xs font-semibold text-blue-600 mt-0.5">
                          {record.treatmentTypeName}
                          {record.treatmentPrice > 0 &&
                            ` • Standard Fee: ${formatCurrency(record.treatmentPrice)}`}
                        </p>
                      )}
                    </div>
                    <span className="text-xs font-semibold text-slate-500 bg-slate-100 px-3 py-1 rounded-full">
                      📅 {formatDate(record.treatmentDate)}
                    </span>
                  </div>

                  {record.diagnosis && (
                    <div className="text-xs">
                      <span className="font-bold text-slate-700">Diagnosis: </span>
                      <span className="text-slate-600">{record.diagnosis}</span>
                    </div>
                  )}

                  {record.notes && (
                    <div className="text-xs">
                      <span className="font-bold text-slate-700">Clinical Notes: </span>
                      <span className="text-slate-600">{record.notes}</span>
                    </div>
                  )}

                  {record.followUpDate && (
                    <div className="text-xs text-blue-700 bg-blue-50/70 p-2.5 rounded-xl border border-blue-100 inline-block font-semibold">
                      🗓️ Scheduled Follow-up: {formatDate(record.followUpDate)}
                    </div>
                  )}

                  {record.materialsUsed && record.materialsUsed.length > 0 && (
                    <div className="pt-2 border-t border-slate-100">
                      <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                        Consumable Materials Deducted
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {record.materialsUsed.map((material, index) => (
                          <span
                            key={`${record._id}-${index}`}
                            className="rounded-xl bg-slate-100 text-slate-700 text-[11px] font-semibold px-3 py-1 border border-slate-200"
                          >
                            📦 {material.itemName} × {material.quantityUsed} {material.unit || "unit"}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </Card>
              ))}
          </div>
        )}
      </div>
    </div>
  );
}

function EndTreatmentButton({ appointmentId }) {
  const navigate = useNavigate();
  const [ending, setEnding] = useState(false);
  const [error, setError] = useState(null);
  const [result, setResult] = useState(null);

  const handleEnd = async () => {
    if (!window.confirm("Complete and conclude this active consultation session?")) return;
    setEnding(true);
    setError(null);
    try {
      const res = await endTreatment(appointmentId);
      setResult(
        res.billing?.invoiceCreated
          ? "Session ended and an invoice was automatically generated for billing."
          : "Session ended successfully."
      );
      setTimeout(() => navigate("/dentist/dashboard"), 1600);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Failed to end treatment session.");
    } finally {
      setEnding(false);
    }
  };

  return (
    <div className="flex flex-col items-end gap-1.5">
      <CommonButton
        label="✓ End Treatment Session"
        variant="success"
        disabled={ending || Boolean(result)}
        loading={ending ? "Concluding session…" : false}
        onClick={handleEnd}
        className="px-5 py-2.5 text-xs sm:text-sm font-bold shadow-md"
      />
      {error && <p className="text-[11px] font-semibold text-rose-600">{error}</p>}
      {result && <p className="text-[11px] font-semibold text-emerald-600 animate-fadeIn">{result}</p>}
    </div>
  );
}

function NewTreatmentForm({ patientId, treatmentTypes, inventory, onCreated }) {
  const [treatmentTypeName, setTreatmentTypeName] = useState("");
  const [diagnosis, setDiagnosis] = useState("");
  const [notes, setNotes] = useState("");
  const [followUpDate, setFollowUpDate] = useState("");
  const [materials, setMaterials] = useState([]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  const addMaterialRow = () =>
    setMaterials((rows) => [...rows, { itemName: "", quantityUsed: "" }]);

  const updateRow = (index, patch) =>
    setMaterials((rows) => rows.map((row, i) => (i === index ? { ...row, ...patch } : row)));

  const removeRow = (index) =>
    setMaterials((rows) => rows.filter((_, i) => i !== index));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!treatmentTypeName) {
      setError("Please select a treatment from the clinical catalogue.");
      return;
    }

    setSaving(true);
    setError(null);
    setSuccess(null);
    try {
      const materialsUsed = materials
        .filter((row) => row.itemName.trim() && Number(row.quantityUsed) > 0)
        .map((row) => ({
          itemName: row.itemName.trim(),
          quantityUsed: Number(row.quantityUsed),
        }));

      await createTreatmentRecord(patientId, {
        treatment: treatmentTypeName,
        treatmentType: treatmentTypeName,
        diagnosis: diagnosis.trim() || undefined,
        notes: notes.trim() || undefined,
        followUpDate: followUpDate || null,
        materialsUsed,
      });

      setSuccess("Treatment record saved and documented to chart.");
      setTreatmentTypeName("");
      setDiagnosis("");
      setNotes("");
      setFollowUpDate("");
      setMaterials([]);
      onCreated();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Failed to save treatment record.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Card className="space-y-4 border border-white/80">
      <div className="border-b border-slate-100 pb-3">
        <h2 className="font-manrope font-bold text-base text-slate-900">
          Document New Treatment Procedure
        </h2>
        <p className="text-xs text-slate-500">
          Select procedure from clinic catalogue, add diagnostic notes, and attach consumable materials.
        </p>
      </div>

      {error && <Alert kind="error">{error}</Alert>}
      {success && <Alert kind="success">{success}</Alert>}

      <form onSubmit={handleSubmit} className="space-y-4">
        <FormSelect
          label="Treatment Catalogue Procedure"
          padding="0"
          value={treatmentTypeName}
          onChange={(e) => setTreatmentTypeName(e.target.value)}
          required
        >
          <option value="">Select a procedure from catalogue…</option>
          {treatmentTypes.map((t) => (
            <option key={t._id} value={t.name}>
              {t.name} ({t.category}) — {formatCurrency(t.price)}
            </option>
          ))}
        </FormSelect>

        <FormInput
          label="Clinical Diagnosis (Optional)"
          padding="0"
          placeholder="e.g. Class II Dental Caries on Tooth #16"
          value={diagnosis}
          onChange={(e) => setDiagnosis(e.target.value)}
        />

        <FormInput
          label="Procedure Notes & Observations (Optional)"
          padding="0"
          placeholder="e.g. Local anesthesia administered; composite restoration placed smoothly."
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
        />

        <div>
          <label className="font-inter text-xs font-bold text-slate-700 block mb-1.5">
            Follow-up Review Date (Optional)
          </label>
          <input
            type="date"
            min={todayISODate()}
            value={followUpDate}
            onChange={(e) => setFollowUpDate(e.target.value)}
            className="w-full bg-white border border-slate-200 rounded-xl py-2.5 px-3.5 text-sm text-slate-800 outline-none focus:border-blue-500"
          />
        </div>

        {/* Consumables Materials Repeater */}
        <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 space-y-3">
          <div className="flex justify-between items-center">
            <div>
              <p className="font-inter text-xs font-bold text-slate-700">
                Consumable Materials Used (Inventory Stock Deduction)
              </p>
              <p className="text-[11px] text-slate-500">
                Materials listed here are automatically deducted from stock.
              </p>
            </div>
            <button
              type="button"
              onClick={addMaterialRow}
              className="text-xs font-bold text-blue-600 hover:text-blue-800 bg-white border border-blue-200 px-3 py-1.5 rounded-xl shadow-2xs cursor-pointer"
            >
              + Add Material
            </button>
          </div>

          {materials.length === 0 ? (
            <p className="text-xs text-slate-400 italic">No inventory materials attached to this record.</p>
          ) : (
            <div className="space-y-2">
              {materials.map((row, index) => (
                <div key={index} className="flex gap-2 items-center">
                  <input
                    list="inventory-items-list"
                    placeholder="Search consumable item name…"
                    value={row.itemName}
                    onChange={(e) => updateRow(index, { itemName: e.target.value })}
                    className="flex-1 bg-white border border-slate-200 rounded-xl px-3.5 py-2 text-xs text-slate-800 outline-none focus:border-blue-500"
                  />
                  <input
                    type="number"
                    min="0.01"
                    step="0.01"
                    placeholder="Qty"
                    value={row.quantityUsed}
                    onChange={(e) => updateRow(index, { quantityUsed: e.target.value })}
                    className="w-24 bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 outline-none focus:border-blue-500"
                  />
                  <button
                    type="button"
                    onClick={() => removeRow(index)}
                    className="w-8 h-8 rounded-xl bg-white border border-rose-200 text-rose-600 hover:bg-rose-50 flex items-center justify-center text-xs font-bold"
                    aria-label="Remove item"
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>
          )}

          <datalist id="inventory-items-list">
            {inventory.map((item) => (
              <option key={item._id} value={item.itemName} />
            ))}
          </datalist>
        </div>

        <div className="pt-2 border-t border-slate-100">
          <CommonButton
            type="submit"
            disabled={saving || !treatmentTypeName}
            loading={saving ? "Saving record…" : false}
            label="Save Treatment Entry →"
            className="w-full sm:w-auto px-8 py-3 text-sm"
          />
        </div>
      </form>
    </Card>
  );
}
