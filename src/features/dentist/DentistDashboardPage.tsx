import React, { useEffect, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faBell,
  faCircleCheck,
  faClockRotateLeft,
  faFloppyDisk,
  faMagnifyingGlass,
  faPaperclip,
  faPlus,
  faTooth,
  faTrash,
  faTriangleExclamation,
} from "@fortawesome/free-solid-svg-icons";

import ToothChart from "./components/ToothChart";
import {
  callNextPatient,
  createTreatmentRecord,
  getDentalChart,
  getPatientHistory,
  updateTooth,
  updateTreatmentRecord,
  uploadAttachment,
} from "./services/dentistApi";
import { getItems as getInventoryItems } from "../inventory/services/inventoryApi";
import type { InventoryItem } from "../inventory/types/inventory";
import {
  TOOTH_CONDITIONS,
  type CalledAppointment,
  type DentalChart,
  type Medication,
  type MaterialUsedInput,
  type PatientHistory,
  type ToothCondition,
  type TreatmentRecord,
} from "./types/dentist";
import { CONFIG } from "@config";

const card = "bg-white border border-border-grey rounded-[14px] p-5";
const sectionTitle = "font-manrope font-bold text-[15px] text-green-text-1 flex items-center gap-2";

export default function DentistDashboardPage() {
  const [banner, setBanner] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // --- active patient / call-next ---
  const [calling, setCalling] = useState(false);
  const [activeAppointment, setActiveAppointment] = useState<CalledAppointment | null>(null);
  const [activePatientId, setActivePatientId] = useState<string | null>(null);
  const [manualPatientId, setManualPatientId] = useState("");
  const [loadingPatient, setLoadingPatient] = useState(false);

  // --- tooth chart ---
  const [chart, setChart] = useState<DentalChart | null>(null);
  const [selectedTooth, setSelectedTooth] = useState<number | null>(null);
  const [toothCondition, setToothCondition] = useState<ToothCondition>("HEALTHY");
  const [toothNotes, setToothNotes] = useState("");
  const [savingTooth, setSavingTooth] = useState(false);

  // --- patient history ---
  const [history, setHistory] = useState<PatientHistory | null>(null);

  // --- treatment record draft ---
  const [record, setRecord] = useState<TreatmentRecord | null>(null);
  const [diagnosis, setDiagnosis] = useState("");
  const [clinicalNotes, setClinicalNotes] = useState("");
  const [proceduresText, setProceduresText] = useState("");
  const [followUpDate, setFollowUpDate] = useState("");
  const [medications, setMedications] = useState<Medication[]>([]);
  const [materials, setMaterials] = useState<MaterialUsedInput[]>([]);
  const [inventoryItems, setInventoryItems] = useState<InventoryItem[]>([]);
  const [savingRecord, setSavingRecord] = useState(false);
  const [completing, setCompleting] = useState(false);
  const [attachmentFile, setAttachmentFile] = useState<File | null>(null);
  const [uploadingAttachment, setUploadingAttachment] = useState(false);

  useEffect(() => {
    getInventoryItems()
      .then((res) => setInventoryItems(res.items))
      .catch(() => setInventoryItems([]));
  }, []);

  const showError = (err: unknown) =>
    setBanner({ type: "error", text: err instanceof Error ? err.message : "Something went wrong" });

  async function loadPatient(patientId: string) {
    setLoadingPatient(true);
    setBanner(null);
    resetTreatmentDraft();
    try {
      const [chartRes, historyRes] = await Promise.all([getDentalChart(patientId), getPatientHistory(patientId)]);
      setChart(chartRes.chart);
      setHistory(historyRes);
      setActivePatientId(patientId);
      setSelectedTooth(null);
    } catch (err) {
      showError(err);
    } finally {
      setLoadingPatient(false);
    }
  }

  function resetTreatmentDraft() {
    setRecord(null);
    setDiagnosis("");
    setClinicalNotes("");
    setProceduresText("");
    setFollowUpDate("");
    setMedications([]);
    setMaterials([]);
  }

  // F-6.1
  async function handleCallNext() {
    setCalling(true);
    setBanner(null);
    try {
      const res = await callNextPatient();
      setActiveAppointment(res.appointment);
      await loadPatient(res.appointment.patientId);
      setBanner({ type: "success", text: `Now seeing ${res.appointment.patientName ?? "patient"}` });
    } catch (err) {
      showError(err);
    } finally {
      setCalling(false);
    }
  }

  function handleLoadManualPatient(e: React.FormEvent) {
    e.preventDefault();
    if (!manualPatientId.trim()) return;
    setActiveAppointment(null);
    loadPatient(manualPatientId.trim());
  }

  // F-6.2
  function handleSelectTooth(toothNumber: number) {
    setSelectedTooth(toothNumber);
    const tooth = chart?.teeth.find((t) => t.toothNumber === toothNumber);
    setToothCondition(tooth?.condition ?? "HEALTHY");
    setToothNotes(tooth?.notes ?? "");
  }

  async function handleSaveTooth() {
    if (!activePatientId || selectedTooth === null) return;
    setSavingTooth(true);
    try {
      const res = await updateTooth(activePatientId, selectedTooth, { condition: toothCondition, notes: toothNotes });
      setChart(res.chart);
      setBanner({ type: "success", text: res.message });
    } catch (err) {
      showError(err);
    } finally {
      setSavingTooth(false);
    }
  }

  // F-6.3: medication / material row helpers
  const addMedication = () => setMedications((prev) => [...prev, { name: "", dosage: "", instructions: "" }]);
  const removeMedication = (i: number) => setMedications((prev) => prev.filter((_, idx) => idx !== i));
  const updateMedication = (i: number, field: keyof Medication, value: string) =>
    setMedications((prev) => prev.map((m, idx) => (idx === i ? { ...m, [field]: value } : m)));

  const addMaterial = () => setMaterials((prev) => [...prev, { itemId: "", itemName: "", quantityUsed: 1 }]);
  const removeMaterial = (i: number) => setMaterials((prev) => prev.filter((_, idx) => idx !== i));
  const updateMaterialItem = (i: number, itemId: string) => {
    const item = inventoryItems.find((it) => it._id === itemId);
    setMaterials((prev) => prev.map((m, idx) => (idx === i ? { ...m, itemId, itemName: item?.itemName ?? "" } : m)));
  };
  const updateMaterialQty = (i: number, quantityUsed: number) =>
    setMaterials((prev) => prev.map((m, idx) => (idx === i ? { ...m, quantityUsed } : m)));

  function buildPayload() {
    return {
      diagnosis,
      clinicalNotes,
      procedures: proceduresText.split(",").map((p) => p.trim()).filter(Boolean),
      medications,
      followUpDate: followUpDate || undefined,
    };
  }

  // F-6.3: save draft (creates the record on first save, updates it afterwards)
  async function handleSaveDraft() {
    if (!activePatientId) return;
    setSavingRecord(true);
    setBanner(null);
    try {
      if (!record) {
        const res = await createTreatmentRecord({
          patientId: activePatientId,
          appointmentId: activeAppointment?.appointmentId,
          ...buildPayload(),
        });
        setRecord(res.record);
      } else {
        const res = await updateTreatmentRecord(record._id, buildPayload());
        setRecord(res.record);
      }
      setBanner({ type: "success", text: "Treatment notes saved" });
    } catch (err) {
      showError(err);
    } finally {
      setSavingRecord(false);
    }
  }

  // F-6.3 (cont.) + F-8.1: complete the visit — triggers the Auto-Inventory Deductor
  async function handleCompleteTreatment() {
    if (!activePatientId) return;
    setCompleting(true);
    setBanner(null);
    try {
      let currentRecord = record;
      if (!currentRecord) {
        const created = await createTreatmentRecord({
          patientId: activePatientId,
          appointmentId: activeAppointment?.appointmentId,
          ...buildPayload(),
        });
        currentRecord = created.record;
        setRecord(currentRecord);
      }

      const res = await updateTreatmentRecord(currentRecord._id, {
        ...buildPayload(),
        materialsUsed: materials.filter((m) => m.itemId && m.quantityUsed > 0),
        status: "COMPLETED",
      });
      setRecord(res.record);

      if (res.lowStockWarnings.length > 0) {
        setBanner({
          type: "error",
          text: `Visit completed. Low stock: ${res.lowStockWarnings.map((w) => w.itemName).join(", ")}`,
        });
      } else {
        setBanner({ type: "success", text: "Visit completed and stock updated" });
      }

      const historyRes = await getPatientHistory(activePatientId);
      setHistory(historyRes);
    } catch (err) {
      showError(err);
    } finally {
      setCompleting(false);
    }
  }

  // F-6.5
  async function handleUploadAttachment() {
    if (!record || !attachmentFile) return;
    setUploadingAttachment(true);
    try {
      const res = await uploadAttachment(record._id, attachmentFile);
      setRecord(res.record);
      setAttachmentFile(null);
      setBanner({ type: "success", text: "Attachment uploaded" });
    } catch (err) {
      showError(err);
    } finally {
      setUploadingAttachment(false);
    }
  }

  return (
    <div className="max-w-6xl mx-auto px-6 py-8 font-inter text-green-text-1">
      <div className="flex items-center justify-between flex-wrap gap-3 mb-6">
        <div>
          <h1 className="font-manrope font-extrabold text-2xl">Dentist Surgery Console</h1>
          <p className="text-muted-green text-[13px]">Module 6 — active patient chart, notes, and history</p>
        </div>

        <button
          onClick={handleCallNext}
          disabled={calling}
          className="flex items-center gap-2 bg-accent text-white rounded-[10px] px-5 py-3 disabled:opacity-60"
        >
          <FontAwesomeIcon icon={faBell} />
          {calling ? "Calling…" : "Call Next Patient"}
        </button>
      </div>

      {banner && (
        <div
          className={`mb-5 rounded-[10px] px-4 py-3 text-[13px] ${
            banner.type === "success" ? "bg-border-grey/60 text-green-text-1" : "bg-red-100 text-red-700"
          }`}
        >
          {banner.text}
        </div>
      )}

      <form onSubmit={handleLoadManualPatient} className={`${card} flex flex-wrap items-end gap-3 mb-6`}>
        <div className="flex-1 min-w-[220px]">
          <label className="font-inter text-[12px] font-bold text-green-text-1" htmlFor="patientId">
            Load patient by ID (follow-ups)
          </label>
          <input
            id="patientId"
            value={manualPatientId}
            onChange={(e) => setManualPatientId(e.target.value)}
            placeholder="Patient _id"
            className="mt-1 w-full pl-4 pr-4 py-2.5 outline-none bg-white border border-border-grey rounded-[10px] text-[14px]"
          />
        </div>
        <button type="submit" className="flex items-center gap-2 border border-border-grey rounded-[10px] px-4 py-2.5 text-[13px]">
          <FontAwesomeIcon icon={faMagnifyingGlass} /> Load
        </button>
      </form>

      {loadingPatient && <p className="text-muted-green text-[13px]">Loading patient…</p>}

      {!activePatientId && !loadingPatient && (
        <div className={`${card} text-center text-muted-green text-[13px] py-14`}>
          <FontAwesomeIcon icon={faTooth} size="2x" className="mb-3 text-border-grey" />
          <p>Call the next patient, or load one by ID, to open their chart.</p>
        </div>
      )}

      {activePatientId && !loadingPatient && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            {/* F-6.2 Tooth chart */}
            <section className={card}>
              <h2 className={sectionTitle}>
                <FontAwesomeIcon icon={faTooth} /> 32-Tooth Chart
                {history && <span className="ml-auto text-[12px] font-normal text-muted-green">{history.patient.name}</span>}
              </h2>
              {chart && (
                <div className="mt-4">
                  <ToothChart teeth={chart.teeth} selectedTooth={selectedTooth} onSelectTooth={handleSelectTooth} />
                </div>
              )}

              {selectedTooth !== null && (
                <div className="mt-4 border-t border-border-grey pt-4 flex flex-wrap items-end gap-3">
                  <div>
                    <label className="font-inter text-[12px] font-bold">Tooth #{selectedTooth}</label>
                    <select
                      value={toothCondition}
                      onChange={(e) => setToothCondition(e.target.value as ToothCondition)}
                      className="mt-1 block pl-3 pr-8 py-2 outline-none bg-white border border-border-grey rounded-[10px] text-[13px]"
                    >
                      {TOOTH_CONDITIONS.map((c) => (
                        <option key={c} value={c}>
                          {c}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="flex-1 min-w-[180px]">
                    <label className="font-inter text-[12px] font-bold">Notes</label>
                    <input
                      value={toothNotes}
                      onChange={(e) => setToothNotes(e.target.value)}
                      className="mt-1 w-full pl-3 pr-3 py-2 outline-none bg-white border border-border-grey rounded-[10px] text-[13px]"
                    />
                  </div>
                  <button
                    onClick={handleSaveTooth}
                    disabled={savingTooth}
                    className="bg-accent text-white rounded-[10px] px-4 py-2 text-[13px] disabled:opacity-60"
                  >
                    {savingTooth ? "Saving…" : "Save Tooth"}
                  </button>
                </div>
              )}
            </section>

            {/* F-6.3 Clinical notes */}
            <section className={card}>
              <h2 className={sectionTitle}>
                <FontAwesomeIcon icon={faFloppyDisk} /> Clinical Diagnosis &amp; Note Logger
                {record && (
                  <span className="ml-auto text-[11px] font-normal px-2 py-0.5 rounded-full bg-border-grey/60">
                    {record.status}
                  </span>
                )}
              </h2>

              <div className="mt-4 space-y-3">
                <div>
                  <label className="font-inter text-[12px] font-bold">Diagnosis</label>
                  <textarea
                    value={diagnosis}
                    onChange={(e) => setDiagnosis(e.target.value)}
                    rows={2}
                    className="mt-1 w-full p-3 outline-none bg-white border border-border-grey rounded-[10px] text-[13px]"
                  />
                </div>
                <div>
                  <label className="font-inter text-[12px] font-bold">Clinical notes</label>
                  <textarea
                    value={clinicalNotes}
                    onChange={(e) => setClinicalNotes(e.target.value)}
                    rows={3}
                    className="mt-1 w-full p-3 outline-none bg-white border border-border-grey rounded-[10px] text-[13px]"
                  />
                </div>
                <div>
                  <label className="font-inter text-[12px] font-bold">Procedures (comma separated)</label>
                  <input
                    value={proceduresText}
                    onChange={(e) => setProceduresText(e.target.value)}
                    placeholder="Composite Filling, Scaling"
                    className="mt-1 w-full p-3 outline-none bg-white border border-border-grey rounded-[10px] text-[13px]"
                  />
                </div>

                {/* Medications */}
                <div>
                  <div className="flex items-center justify-between">
                    <label className="font-inter text-[12px] font-bold">Prescribed medications</label>
                    <button onClick={addMedication} type="button" className="text-[12px] text-accent flex items-center gap-1">
                      <FontAwesomeIcon icon={faPlus} /> Add
                    </button>
                  </div>
                  {medications.map((m, i) => (
                    <div key={i} className="flex flex-wrap gap-2 mt-2">
                      <input
                        placeholder="Name"
                        value={m.name}
                        onChange={(e) => updateMedication(i, "name", e.target.value)}
                        className="flex-1 min-w-[100px] p-2 outline-none bg-white border border-border-grey rounded-[8px] text-[12px]"
                      />
                      <input
                        placeholder="Dosage"
                        value={m.dosage}
                        onChange={(e) => updateMedication(i, "dosage", e.target.value)}
                        className="w-28 p-2 outline-none bg-white border border-border-grey rounded-[8px] text-[12px]"
                      />
                      <input
                        placeholder="Instructions"
                        value={m.instructions}
                        onChange={(e) => updateMedication(i, "instructions", e.target.value)}
                        className="flex-1 min-w-[140px] p-2 outline-none bg-white border border-border-grey rounded-[8px] text-[12px]"
                      />
                      <button type="button" onClick={() => removeMedication(i)} className="text-red-500 px-2">
                        <FontAwesomeIcon icon={faTrash} />
                      </button>
                    </div>
                  ))}
                </div>

                {/* Materials used -> F-8.1 auto-deduction */}
                <div>
                  <div className="flex items-center justify-between">
                    <label className="font-inter text-[12px] font-bold">Materials used (deducted from inventory on completion)</label>
                    <button onClick={addMaterial} type="button" className="text-[12px] text-accent flex items-center gap-1">
                      <FontAwesomeIcon icon={faPlus} /> Add
                    </button>
                  </div>
                  {materials.map((m, i) => {
                    const invItem = inventoryItems.find((it) => it._id === m.itemId);
                    return (
                      <div key={i} className="flex flex-wrap items-center gap-2 mt-2">
                        <select
                          value={m.itemId}
                          onChange={(e) => updateMaterialItem(i, e.target.value)}
                          className="flex-1 min-w-[160px] p-2 outline-none bg-white border border-border-grey rounded-[8px] text-[12px]"
                        >
                          <option value="">Select item…</option>
                          {inventoryItems.map((item) => (
                            <option key={item._id} value={item._id}>
                              {item.itemName} ({item.quantity} in stock)
                            </option>
                          ))}
                        </select>
                        <input
                          type="number"
                          min={1}
                          max={invItem?.quantity}
                          value={m.quantityUsed}
                          onChange={(e) => updateMaterialQty(i, Number(e.target.value))}
                          className="w-20 p-2 outline-none bg-white border border-border-grey rounded-[8px] text-[12px]"
                        />
                        {invItem?.isLowStock && (
                          <FontAwesomeIcon icon={faTriangleExclamation} className="text-amber-500" title="Low stock" />
                        )}
                        <button type="button" onClick={() => removeMaterial(i)} className="text-red-500 px-2">
                          <FontAwesomeIcon icon={faTrash} />
                        </button>
                      </div>
                    );
                  })}
                </div>

                <div>
                  <label className="font-inter text-[12px] font-bold">Follow-up date</label>
                  <input
                    type="date"
                    value={followUpDate}
                    onChange={(e) => setFollowUpDate(e.target.value)}
                    className="mt-1 p-2 outline-none bg-white border border-border-grey rounded-[10px] text-[13px]"
                  />
                </div>

                <div className="flex flex-wrap gap-3 pt-2">
                  <button
                    onClick={handleSaveDraft}
                    disabled={savingRecord}
                    className="border border-border-grey rounded-[10px] px-4 py-2.5 text-[13px] disabled:opacity-60"
                  >
                    {savingRecord ? "Saving…" : "Save Notes"}
                  </button>
                  <button
                    onClick={handleCompleteTreatment}
                    disabled={completing}
                    className="flex items-center gap-2 bg-accent text-white rounded-[10px] px-4 py-2.5 text-[13px] disabled:opacity-60"
                  >
                    <FontAwesomeIcon icon={faCircleCheck} />
                    {completing ? "Completing…" : "Complete Visit & Update Stock"}
                  </button>
                </div>
              </div>
            </section>

            {/* F-6.5 Attachments */}
            <section className={card}>
              <h2 className={sectionTitle}>
                <FontAwesomeIcon icon={faPaperclip} /> X-Ray / Document Attachments
              </h2>
              {!record && <p className="text-[12px] text-muted-green mt-2">Save the treatment notes first to attach files.</p>}
              {record && (
                <>
                  <div className="flex items-center gap-3 mt-3">
                    <input
                      type="file"
                      accept="image/jpeg,image/png,image/webp,application/pdf"
                      onChange={(e) => setAttachmentFile(e.target.files?.[0] ?? null)}
                      className="text-[12px]"
                    />
                    <button
                      onClick={handleUploadAttachment}
                      disabled={!attachmentFile || uploadingAttachment}
                      className="border border-border-grey rounded-[10px] px-4 py-2 text-[13px] disabled:opacity-60"
                    >
                      {uploadingAttachment ? "Uploading…" : "Upload"}
                    </button>
                  </div>
                  <ul className="mt-3 space-y-1 text-[13px]">
                    {record.attachments.map((a, i) => (
                      <li key={i}>
                        <a
                          href={`${CONFIG.API_BASE_URL.replace(/\/api$/, "")}${a.fileUrl}`}
                          target="_blank"
                          rel="noreferrer"
                          className="text-accent underline"
                        >
                          {a.fileName}
                        </a>
                      </li>
                    ))}
                  </ul>
                </>
              )}
            </section>
          </div>

          {/* F-6.4 History timeline */}
          <div className="lg:col-span-1">
            <section className={card}>
              <h2 className={sectionTitle}>
                <FontAwesomeIcon icon={faClockRotateLeft} /> Medical History
              </h2>

              {history && history.medicalAlerts.length > 0 && (
                <div className="mt-3 bg-red-50 border border-red-200 rounded-[10px] p-3 text-[12px] text-red-700">
                  <FontAwesomeIcon icon={faTriangleExclamation} className="mr-1" />
                  {history.medicalAlerts.join(", ")}
                </div>
              )}

              <ul className="mt-4 space-y-4">
                {history?.treatmentTimeline.map((r) => (
                  <li key={r._id} className="border-b border-border-grey pb-3 last:border-0">
                    <p className="text-[12px] text-muted-green">{new Date(r.createdAt).toLocaleDateString()}</p>
                    <p className="text-[13px] font-bold">{r.diagnosis || "—"}</p>
                    {r.procedures.length > 0 && (
                      <p className="text-[12px] text-muted-green">{r.procedures.join(", ")}</p>
                    )}
                    <span
                      className={`inline-block mt-1 text-[10px] px-2 py-0.5 rounded-full ${
                        r.status === "COMPLETED" ? "bg-border-grey/60" : "bg-amber-100 text-amber-700"
                      }`}
                    >
                      {r.status}
                    </span>
                  </li>
                ))}
                {history && history.treatmentTimeline.length === 0 && (
                  <p className="text-[12px] text-muted-green">No previous visits on record.</p>
                )}
              </ul>
            </section>
          </div>
        </div>
      )}
    </div>
  );
}
