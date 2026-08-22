import { useCallback, useEffect, useState, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import Card from "../../../components/ui/Card";
import Alert from "../../../components/ui/Alert";
import Modal from "../../../components/ui/Modal";
import EmptyState from "../../../components/ui/EmptyState";
import FormInput from "../../../components/FormInput";
import CommonButton from "../../../components/CommanButton";
import { ApiError } from "../../../lib/api/http";
import { formatDate } from "../../../lib/utils/format";
import {
  addPatient,
  deletePatient,
  getAllPatients,
  searchPatients,
  updatePatient,
  type AddPatientPayload,
} from "../services/receptionistApi";
import type { PatientSummary } from "../types/receptionist";

const EMPTY_FORM: AddPatientPayload = {
  name: "",
  nic: "",
  phone: "",
  email: "",
  password: "",
};

export default function PatientsPage() {
  const navigate = useNavigate();
  const [patients, setPatients] = useState<PatientSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [query, setQuery] = useState("");

  const [addOpen, setAddOpen] = useState(false);
  const [addForm, setAddForm] = useState<AddPatientPayload>(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const [editing, setEditing] = useState<PatientSummary | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await getAllPatients();
      setPatients(res.data);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Failed to load patients.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const handleSearch = async (value: string) => {
    setQuery(value);
    if (!value.trim()) {
      void load();
      return;
    }
    try {
      const res = await searchPatients(value);
      setPatients(res.data);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Search failed.");
    }
  };

  const handleAddSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setFormError(null);
    try {
      await addPatient(addForm);
      setAddOpen(false);
      setAddForm(EMPTY_FORM);
      await load();
    } catch (err) {
      setFormError(err instanceof ApiError ? err.message : "Failed to create patient.");
    } finally {
      setSaving(false);
    }
  };

  const handleEditSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!editing) return;
    setSaving(true);
    setFormError(null);
    try {
      await updatePatient(editing._id, {
        name: editing.name,
        nic: editing.nic,
        phone: editing.phone,
        email: editing.email,
      });
      setEditing(null);
      await load();
    } catch (err) {
      setFormError(err instanceof ApiError ? err.message : "Failed to update patient.");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (patient: PatientSummary) => {
    if (!confirm(`Remove ${patient.name}'s account? This cannot be undone.`)) return;
    try {
      await deletePatient(patient._id);
      await load();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Failed to delete patient.");
    }
  };

  return (
    <div className="flex flex-col gap-6 max-w-6xl">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="font-manrope text-2xl font-bold text-green-text-1">Patients</h1>
          <p className="text-[12px] text-muted-green">
            Manage patient accounts and jump to billing.
          </p>
        </div>
        <CommonButton
          label="+ Add patient"
          className="text-[13px] px-4.5 py-2.5"
          containerProps={{ className: "w-auto" }}
          onClick={() => setAddOpen(true)}
        />
      </div>

      <FormInput
        label="Search by name or email"
        padding="0"
        placeholder="Search patients…"
        value={query}
        onChange={(e) => handleSearch(e.target.value)}
      />

      {error && <Alert kind="error">{error}</Alert>}

      <Card>
        {loading ? (
          <p className="text-[12px] text-muted-green">Loading…</p>
        ) : patients.length === 0 ? (
          <EmptyState icon="🧑‍🤝‍🧑" title="No patients found" />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-[12px]">
              <thead>
                <tr className="text-[11px] uppercase tracking-wider text-muted-green border-b border-border-grey">
                  <th className="py-2 pr-3">Name</th>
                  <th className="py-2 pr-3">NIC</th>
                  <th className="py-2 pr-3">Phone</th>
                  <th className="py-2 pr-3">Email</th>
                  <th className="py-2 pr-3">Registered</th>
                  <th className="py-2 pr-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border-grey">
                {patients.map((patient) => (
                  <tr key={patient._id}>
                    <td className="py-3 pr-3 font-bold text-green-text-1">{patient.name}</td>
                    <td className="py-3 pr-3">{patient.nic}</td>
                    <td className="py-3 pr-3">{patient.phone || "—"}</td>
                    <td className="py-3 pr-3">{patient.email}</td>
                    <td className="py-3 pr-3">{formatDate(patient.createdAt)}</td>
                    <td className="py-3 pr-3">
                      <div className="flex justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => navigate(`/receptionist/billing?patientId=${patient._id}`)}
                          className="rounded-[8px] border border-border-grey px-3 py-1.5 text-[11px] font-semibold text-green-text-1 hover:bg-gray-50"
                        >
                          Billing
                        </button>
                        <button
                          type="button"
                          onClick={() => setEditing(patient)}
                          className="rounded-[8px] border border-border-grey px-3 py-1.5 text-[11px] font-semibold text-green-text-1 hover:bg-gray-50"
                        >
                          Edit
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDelete(patient)}
                          className="rounded-[8px] border border-red-200 px-3 py-1.5 text-[11px] font-semibold text-red-600 hover:bg-red-50"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      <Modal open={addOpen} title="Add patient" onClose={() => setAddOpen(false)}>
        <form onSubmit={handleAddSubmit} className="flex flex-col">
          <FormInput
            label="Full name"
            padding="0"
            value={addForm.name}
            onChange={(e) => setAddForm((f) => ({ ...f, name: e.target.value }))}
            required
          />
          <FormInput
            label="NIC"
            value={addForm.nic}
            onChange={(e) => setAddForm((f) => ({ ...f, nic: e.target.value }))}
            required
          />
          <FormInput
            label="Phone"
            value={addForm.phone}
            onChange={(e) => setAddForm((f) => ({ ...f, phone: e.target.value }))}
          />
          <FormInput
            label="Gmail address"
            type="email"
            value={addForm.email}
            onChange={(e) => setAddForm((f) => ({ ...f, email: e.target.value }))}
            required
          />
          <FormInput
            label="Temporary password (min. 8 characters)"
            type="password"
            value={addForm.password}
            onChange={(e) => setAddForm((f) => ({ ...f, password: e.target.value }))}
            required
            minLength={8}
          />
          {formError && (
            <p className="pt-3 text-[12px] text-red-600" role="alert">
              {formError}
            </p>
          )}
          <div className="pt-4">
            <CommonButton
              type="submit"
              disabled={saving}
              label={saving ? "Saving…" : "Create patient account"}
              className="text-[13px] py-2.5"
            />
          </div>
        </form>
      </Modal>

      <Modal open={Boolean(editing)} title="Edit patient" onClose={() => setEditing(null)}>
        {editing && (
          <form onSubmit={handleEditSubmit} className="flex flex-col">
            <FormInput
              label="Full name"
              padding="0"
              value={editing.name}
              onChange={(e) => setEditing((p) => (p ? { ...p, name: e.target.value } : p))}
              required
            />
            <FormInput
              label="NIC"
              value={editing.nic}
              onChange={(e) => setEditing((p) => (p ? { ...p, nic: e.target.value } : p))}
              required
            />
            <FormInput
              label="Phone"
              value={editing.phone || ""}
              onChange={(e) => setEditing((p) => (p ? { ...p, phone: e.target.value } : p))}
            />
            <FormInput
              label="Gmail address"
              type="email"
              value={editing.email}
              onChange={(e) => setEditing((p) => (p ? { ...p, email: e.target.value } : p))}
              required
            />
            {formError && (
              <p className="pt-3 text-[12px] text-red-600" role="alert">
                {formError}
              </p>
            )}
            <div className="pt-4">
              <CommonButton
                type="submit"
                disabled={saving}
                label={saving ? "Saving…" : "Save changes"}
                className="text-[13px] py-2.5"
              />
            </div>
          </form>
        )}
      </Modal>
    </div>
  );
}
