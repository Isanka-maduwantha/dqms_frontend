import { useCallback, useEffect, useState, type FormEvent } from "react";
import { Link, useLocation, useNavigate, useParams } from "react-router-dom";
import Card from "../../../components/ui/Card";
import Alert from "../../../components/ui/Alert";
import EmptyState from "../../../components/ui/EmptyState";
import FormInput from "../../../components/FormInput";
import FormSelect from "../../../components/FormSelect";
import CommonButton from "../../../components/CommanButton";
import { ApiError } from "../../../lib/api/http";
import { formatCurrency, formatDate } from "../../../lib/utils/format";
import {
  createTreatmentRecord,
  endTreatment,
  getInventoryItems,
  getPatientHistory,
  getTreatmentTypes,
} from "../services/dentistApi";
import type {
  DentistPatient,
  InventoryItem,
  MaterialUsed,
  TreatmentRecord,
  TreatmentType,
} from "../types/dentist";

interface MaterialRow {
  itemName: string;
  quantityUsed: string;
}

export default function DentistPatientDetailPage() {
  const { patientId = "" } = useParams();
  const location = useLocation();
  const appointmentId = (location.state as { appointmentId?: string } | null)?.appointmentId;

  const [patient, setPatient] = useState<DentistPatient | null>(null);
  const [records, setRecords] = useState<TreatmentRecord[]>([]);
  const [treatmentTypes, setTreatmentTypes] = useState<TreatmentType[]>([]);
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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
        setTreatmentTypes(typesRes.treatments);
        setInventory(inventoryRes.items);
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
    return <p className="text-[12px] text-muted-green">Loading patient chart…</p>;
  }

  return (
    <div className="flex flex-col gap-6 max-w-4xl">
      <div>
        <Link to="/dentist/patients" className="text-[12px] text-accent font-semibold">
          ← Back to search
        </Link>
      </div>

      {error && <Alert kind="error">{error}</Alert>}

      {patient && (
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div>
            <h1 className="font-manrope text-2xl font-bold text-green-text-1">{patient.name}</h1>
            <p className="text-[12px] text-muted-green">
              {patient.email} • {patient.phone || "No phone"} • {patient.nic || "No NIC"}
            </p>
          </div>
          {appointmentId && <EndTreatmentButton appointmentId={appointmentId} />}
        </div>
      )}

      <NewTreatmentForm
        patientId={patientId}
        treatmentTypes={treatmentTypes}
        inventory={inventory}
        onCreated={() => void loadHistory()}
      />

      <div>
        <h2 className="font-manrope font-bold text-[16px] text-green-text-1 pb-3">
          Treatment history ({records.length})
        </h2>
        {records.length === 0 ? (
          <EmptyState icon="🦷" title="No treatment records yet" />
        ) : (
          <div className="flex flex-col gap-3">
            {[...records]
              .sort((a, b) => new Date(b.treatmentDate).getTime() - new Date(a.treatmentDate).getTime())
              .map((record) => (
                <Card key={record._id} className="flex flex-col gap-2">
                  <div className="flex justify-between flex-wrap gap-2">
                    <p className="font-bold text-green-text-1 text-[13px]">
                      {record.treatment || record.treatmentTypeName || "Treatment"}
                    </p>
                    <p className="text-[11px] text-muted-green">{formatDate(record.treatmentDate)}</p>
                  </div>
                  {record.treatmentTypeName && (
                    <p className="text-[12px] text-muted-green">
                      {record.treatmentTypeName}
                      {record.treatmentPrice > 0 && ` • ${formatCurrency(record.treatmentPrice)}`}
                    </p>
                  )}
                  {record.diagnosis && (
                    <p className="text-[12px]">
                      <span className="font-semibold text-green-text-1">Diagnosis: </span>
                      {record.diagnosis}
                    </p>
                  )}
                  {record.notes && (
                    <p className="text-[12px]">
                      <span className="font-semibold text-green-text-1">Notes: </span>
                      {record.notes}
                    </p>
                  )}
                  {record.followUpDate && (
                    <p className="text-[12px] text-muted-green">
                      Follow-up: {formatDate(record.followUpDate)}
                    </p>
                  )}
                  {record.materialsUsed.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {record.materialsUsed.map((material: MaterialUsed, index) => (
                        <span
                          key={`${record._id}-${index}`}
                          className="rounded-full bg-accent/5 text-accent text-[11px] font-semibold px-2.5 py-1"
                        >
                          {material.itemName} × {material.quantityUsed} {material.unit}
                        </span>
                      ))}
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

function EndTreatmentButton({ appointmentId }: { appointmentId: string }) {
  const navigate = useNavigate();
  const [ending, setEnding] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<string | null>(null);

  const handleEnd = async () => {
    setEnding(true);
    setError(null);
    try {
      const res = await endTreatment(appointmentId);
      setResult(
        res.billing?.invoiceCreated
          ? "Session ended and an invoice was generated."
          : "Session ended.",
      );
      setTimeout(() => navigate("/dentist/dashboard"), 1500);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Failed to end treatment session.");
    } finally {
      setEnding(false);
    }
  };

  return (
    <div className="flex flex-col items-end gap-1">
      <button
        type="button"
        onClick={handleEnd}
        disabled={ending || Boolean(result)}
        className="rounded-[10px] bg-cyan-green text-white text-[13px] font-semibold px-5 py-2.5 disabled:opacity-60"
      >
        {ending ? "Ending session…" : "End treatment session"}
      </button>
      {error && <p className="text-[11px] text-red-600">{error}</p>}
      {result && <p className="text-[11px] text-accent font-semibold">{result}</p>}
    </div>
  );
}

function NewTreatmentForm({
  patientId,
  treatmentTypes,
  inventory,
  onCreated,
}: {
  patientId: string;
  treatmentTypes: TreatmentType[];
  inventory: InventoryItem[];
  onCreated: () => void;
}) {
  const [treatmentTypeName, setTreatmentTypeName] = useState("");
  const [diagnosis, setDiagnosis] = useState("");
  const [notes, setNotes] = useState("");
  const [followUpDate, setFollowUpDate] = useState("");
  const [materials, setMaterials] = useState<MaterialRow[]>([]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const addMaterialRow = () => setMaterials((rows) => [...rows, { itemName: "", quantityUsed: "" }]);
  const updateRow = (index: number, patch: Partial<MaterialRow>) =>
    setMaterials((rows) => rows.map((row, i) => (i === index ? { ...row, ...patch } : row)));
  const removeRow = (index: number) =>
    setMaterials((rows) => rows.filter((_, i) => i !== index));

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    setSuccess(null);
    try {
      const materialsUsed = materials
        .filter((row) => row.itemName.trim() && Number(row.quantityUsed) > 0)
        .map((row) => ({ itemName: row.itemName.trim(), quantityUsed: Number(row.quantityUsed) }));

      await createTreatmentRecord(patientId, {
        treatment: treatmentTypeName,
        treatmentType: treatmentTypeName,
        diagnosis,
        notes,
        followUpDate: followUpDate || null,
        materialsUsed,
      });

      setSuccess("Treatment record saved.");
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
    <Card>
      <h2 className="font-manrope font-bold text-[16px] text-green-text-1 pb-1">
        New treatment record
      </h2>
      <p className="text-[12px] text-muted-green pb-4">
        Select a treatment from the clinic catalogue and list any consumables used.
      </p>

      {error && <Alert kind="error">{error}</Alert>}
      {success && <Alert kind="success">{success}</Alert>}

      <form onSubmit={handleSubmit} className="flex flex-col gap-1 pt-2">
        <FormSelect
          label="Treatment"
          padding="0"
          value={treatmentTypeName}
          onChange={(e) => setTreatmentTypeName(e.target.value)}
          required
        >
          <option value="">Select a treatment…</option>
          {treatmentTypes.map((t) => (
            <option key={t._id} value={t.name}>
              {t.name} ({t.category}) — {formatCurrency(t.price)}
            </option>
          ))}
        </FormSelect>

        <FormInput
          label="Diagnosis"
          value={diagnosis}
          onChange={(e) => setDiagnosis(e.target.value)}
        />
        <FormInput label="Notes" value={notes} onChange={(e) => setNotes(e.target.value)} />
        <FormInput
          label="Follow-up date (optional)"
          type="date"
          value={followUpDate}
          onChange={(e) => setFollowUpDate(e.target.value)}
        />

        <div className="pt-4">
          <div className="flex justify-between items-center pb-2">
            <p className="font-inter text-[12px] font-bold text-green-text-1">
              Materials used
            </p>
            <button
              type="button"
              onClick={addMaterialRow}
              className="text-[11px] font-semibold text-accent"
            >
              + Add material
            </button>
          </div>

          {materials.length === 0 ? (
            <p className="text-[11px] text-muted-green">
              No inventory materials attached to this treatment.
            </p>
          ) : (
            <div className="flex flex-col gap-2">
              {materials.map((row, index) => (
                <div key={index} className="flex gap-2 items-center">
                  <input
                    list="inventory-items"
                    placeholder="Item name"
                    value={row.itemName}
                    onChange={(e) => updateRow(index, { itemName: e.target.value })}
                    className="flex-1 pl-4 pr-4 py-2 outline-none bg-white border border-border-grey rounded-[10px] text-muted-green text-[13px]"
                  />
                  <input
                    type="number"
                    min="0.01"
                    step="0.01"
                    placeholder="Qty"
                    value={row.quantityUsed}
                    onChange={(e) => updateRow(index, { quantityUsed: e.target.value })}
                    className="w-24 pl-4 pr-4 py-2 outline-none bg-white border border-border-grey rounded-[10px] text-muted-green text-[13px]"
                  />
                  <button
                    type="button"
                    onClick={() => removeRow(index)}
                    className="text-red-500 text-[16px] px-1"
                    aria-label="Remove material"
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>
          )}
          <datalist id="inventory-items">
            {inventory.map((item) => (
              <option key={item._id} value={item.itemName} />
            ))}
          </datalist>
        </div>

        <div className="pt-5">
          <CommonButton
            type="submit"
            disabled={saving || !treatmentTypeName}
            label={saving ? "Saving…" : "Save treatment record"}
            className="text-[13px] py-2.5"
            containerProps={{ className: "w-auto" }}
          />
        </div>
      </form>
    </Card>
  );
}
