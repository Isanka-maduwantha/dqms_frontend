import { useCallback, useEffect, useState } from "react";
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
  validateEmail,
  validateNic,
  validatePhone,
} from "../../../lib/utils/validation";
import {
  addPatient,
  deletePatient,
  getAllPatients,
  searchPatients,
  updatePatient,
} from "../services/receptionistApi";

const EMPTY_FORM = {
  name: "",
  nic: "",
  phone: "",
  email: "",
  password: "",
};

export default function PatientsPage() {
  const navigate = useNavigate();
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [query, setQuery] = useState("");
  const [addOpen, setAddOpen] = useState(false);
  const [addForm, setAddForm] = useState(EMPTY_FORM);
  const [addErrors, setAddErrors] = useState({});
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState(null);
  const [editing, setEditing] = useState(null);
  const [editErrors, setEditErrors] = useState({});

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await getAllPatients();
      setPatients(res.data || []);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Failed to load patient records.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const handleSearch = async (value) => {
    setQuery(value);
    if (!value.trim()) {
      void load();
      return;
    }
    try {
      const res = await searchPatients(value);
      setPatients(res.data || []);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Search failed.");
    }
  };

  const validateAddForm = () => {
    const errors = {};
    if (!addForm.name || addForm.name.trim().length < 2) {
      errors.name = "Full name is required";
    }
    const nicErr = validateNic(addForm.nic);
    if (nicErr) errors.nic = nicErr;

    const emailErr = validateEmail(addForm.email);
    if (emailErr) errors.email = emailErr;

    if (addForm.phone) {
      const phoneErr = validatePhone(addForm.phone, false);
      if (phoneErr) errors.phone = phoneErr;
    }

    if (!addForm.password || addForm.password.length < 8) {
      errors.password = "Password must be at least 8 characters long";
    }

    setAddErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleAddSubmit = async (e) => {
    e.preventDefault();
    if (!validateAddForm()) return;

    setSaving(true);
    setFormError(null);
    try {
      await addPatient({
        ...addForm,
        name: addForm.name.trim(),
        nic: addForm.nic.trim().toUpperCase(),
        email: addForm.email.trim(),
        phone: addForm.phone.trim(),
      });
      setAddOpen(false);
      setAddForm(EMPTY_FORM);
      setAddErrors({});
      await load();
    } catch (err) {
      setFormError(err instanceof ApiError ? err.message : "Failed to create patient account.");
    } finally {
      setSaving(false);
    }
  };

  const validateEditForm = () => {
    const errors = {};
    if (!editing?.name || editing.name.trim().length < 2) {
      errors.name = "Full name is required";
    }
    const nicErr = validateNic(editing?.nic);
    if (nicErr) errors.nic = nicErr;

    const emailErr = validateEmail(editing?.email);
    if (emailErr) errors.email = emailErr;

    if (editing?.phone) {
      const phoneErr = validatePhone(editing.phone, false);
      if (phoneErr) errors.phone = phoneErr;
    }

    setEditErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    if (!editing || !validateEditForm()) return;

    setSaving(true);
    setFormError(null);
    try {
      await updatePatient(editing._id, {
        name: editing.name.trim(),
        nic: editing.nic.trim().toUpperCase(),
        phone: editing.phone ? editing.phone.trim() : "",
        email: editing.email.trim(),
      });
      setEditing(null);
      setEditErrors({});
      await load();
    } catch (err) {
      setFormError(err instanceof ApiError ? err.message : "Failed to update patient.");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (patient) => {
    if (
      !window.confirm(
        `Are you sure you want to delete patient account "${patient.name}"? This action cannot be undone.`
      )
    )
      return;
    try {
      await deletePatient(patient._id);
      await load();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Failed to delete patient.");
    }
  };

  return (
    <div className="space-y-6 text-left max-w-6xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold text-[#0E7A50] uppercase tracking-wider">
            Patient Registry
          </span>
          <h1 className="font-manrope text-2xl sm:text-3xl font-extrabold text-slate-900 mt-1">
            Patient Accounts
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Manage profiles, verify identification, and view associated invoices.
          </p>
        </div>

        <CommonButton
          label="+ Add New Patient"
          className="px-5 py-2.5 text-xs sm:text-sm shadow-md"
          containerProps={{ className: "w-auto" }}
          onClick={() => {
            setAddForm(EMPTY_FORM);
            setAddErrors({});
            setFormError(null);
            setAddOpen(true);
          }}
        />
      </div>

      {/* Search Input */}
      <div className="max-w-md">
        <FormInput
          label="Search by Patient Name, NIC or Email"
          padding="0"
          placeholder="Type to search directory…"
          value={query}
          icon="🔍"
          onChange={(e) => handleSearch(e.target.value)}
        />
      </div>

      {error && <Alert kind="error">{error}</Alert>}

      {/* Patients Table Card */}
      <Card className="p-0 overflow-hidden border border-white/80">
        <div className="flex justify-between items-center px-6 py-4 border-b border-slate-100 bg-slate-50/50">
          <span className="font-bold text-xs text-slate-700">
            Showing {patients.length} Registered Patients
          </span>
          {query && (
            <button
              type="button"
              onClick={() => {
                setQuery("");
                void load();
              }}
              className="text-xs text-[#0E7A50] font-bold hover:underline"
            >
              Clear Search Filter
            </button>
          )}
        </div>

        {loading ? (
          <p className="text-xs text-slate-500 py-12 text-center">Loading patient directory…</p>
        ) : patients.length === 0 ? (
          <div className="p-6">
            <EmptyState
              icon="👥"
              title="No patients found"
              description="No registered patients match your search criteria."
            />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="text-[11px] uppercase tracking-wider text-slate-500 border-b border-slate-100 bg-slate-50/30">
                  <th className="py-3 px-6 font-bold">Patient Name</th>
                  <th className="py-3 px-4 font-bold">NIC Number</th>
                  <th className="py-3 px-4 font-bold">Contact Phone</th>
                  <th className="py-3 px-4 font-bold">Email</th>
                  <th className="py-3 px-4 font-bold">Registered</th>
                  <th className="py-3 px-6 font-bold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {patients.map((patient) => (
                  <tr key={patient._id} className="hover:bg-emerald-50/40 transition-colors">
                    <td className="py-3.5 px-6 font-bold text-slate-900 flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold text-xs">
                        {(patient.name || "P").charAt(0).toUpperCase()}
                      </div>
                      <span>{patient.name}</span>
                    </td>
                    <td className="py-3.5 px-4 font-mono text-slate-700">{patient.nic}</td>
                    <td className="py-3.5 px-4 text-slate-600">{patient.phone || "—"}</td>
                    <td className="py-3.5 px-4 text-slate-600">{patient.email}</td>
                    <td className="py-3.5 px-4 text-slate-500">{formatDate(patient.createdAt)}</td>
                    <td className="py-3.5 px-6 text-right">
                      <div className="flex justify-end items-center gap-2">
                        <button
                          type="button"
                          onClick={() => navigate(`/receptionist/billing?patientId=${patient._id}`)}
                          className="rounded-xl border border-emerald-200 bg-emerald-50/80 px-2.5 py-1.5 text-[11px] font-bold text-emerald-800 hover:bg-emerald-100 transition-colors shadow-2xs cursor-pointer"
                        >
                          💳 Billing
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setEditing(patient);
                            setEditErrors({});
                            setFormError(null);
                          }}
                          className="rounded-xl border border-slate-200 bg-white px-2.5 py-1.5 text-[11px] font-bold text-slate-700 hover:bg-slate-50 transition-colors shadow-2xs cursor-pointer"
                        >
                          ✏️ Edit
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDelete(patient)}
                          className="rounded-xl border border-rose-200 bg-white px-2.5 py-1.5 text-[11px] font-bold text-rose-600 hover:bg-rose-50 transition-colors shadow-2xs cursor-pointer"
                        >
                          🗑️ Delete
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

      {/* Add Patient Modal */}
      <Modal open={addOpen} title="Register New Patient Account" onClose={() => setAddOpen(false)}>
        <form onSubmit={handleAddSubmit} noValidate className="space-y-3.5 text-left">
          {formError && <Alert kind="error">{formError}</Alert>}

          <FormInput
            label="Full Legal Name"
            padding="0"
            placeholder="e.g. Jayantha Perera"
            value={addForm.name}
            error={addErrors.name}
            onChange={(e) => {
              setAddForm((f) => ({ ...f, name: e.target.value }));
              if (addErrors.name) setAddErrors((f) => ({ ...f, name: null }));
            }}
            required
          />

          <FormInput
            label="NIC / Identification"
            padding="0"
            placeholder="12 digits or 9 digits+V"
            value={addForm.nic}
            error={addErrors.nic}
            onChange={(e) => {
              setAddForm((f) => ({ ...f, nic: e.target.value }));
              if (addErrors.nic) setAddErrors((f) => ({ ...f, nic: null }));
            }}
            required
          />

          <div className="grid sm:grid-cols-2 gap-3.5">
            <FormInput
              label="Email Address"
              type="email"
              padding="0"
              placeholder="patient@example.com"
              value={addForm.email}
              error={addErrors.email}
              onChange={(e) => {
                setAddForm((f) => ({ ...f, email: e.target.value }));
                if (addErrors.email) setAddErrors((f) => ({ ...f, email: null }));
              }}
              required
            />

            <FormInput
              label="Phone Number"
              type="tel"
              padding="0"
              placeholder="e.g. 0771234567"
              value={addForm.phone}
              error={addErrors.phone}
              onChange={(e) => {
                setAddForm((f) => ({ ...f, phone: e.target.value }));
                if (addErrors.phone) setAddErrors((f) => ({ ...f, phone: null }));
              }}
            />
          </div>

          <FormInput
            label="Initial Account Password (min 8 chars)"
            type="password"
            padding="0"
            placeholder="Temporary patient password"
            value={addForm.password}
            error={addErrors.password}
            onChange={(e) => {
              setAddForm((f) => ({ ...f, password: e.target.value }));
              if (addErrors.password) setAddErrors((f) => ({ ...f, password: null }));
            }}
            required
          />

          <div className="pt-3 border-t border-slate-100">
            <CommonButton
              type="submit"
              disabled={saving}
              loading={saving ? "Creating patient account…" : false}
              label="Create Patient Profile"
              className="w-full py-2.5"
            />
          </div>
        </form>
      </Modal>

      {/* Edit Patient Modal */}
      <Modal open={Boolean(editing)} title="Edit Patient Details" onClose={() => setEditing(null)}>
        {editing && (
          <form onSubmit={handleEditSubmit} noValidate className="space-y-3.5 text-left">
            {formError && <Alert kind="error">{formError}</Alert>}

            <FormInput
              label="Full Legal Name"
              padding="0"
              value={editing.name}
              error={editErrors.name}
              onChange={(e) => {
                setEditing((p) => (p ? { ...p, name: e.target.value } : p));
                if (editErrors.name) setEditErrors((f) => ({ ...f, name: null }));
              }}
              required
            />

            <FormInput
              label="NIC / Identification"
              padding="0"
              value={editing.nic}
              error={editErrors.nic}
              onChange={(e) => {
                setEditing((p) => (p ? { ...p, nic: e.target.value } : p));
                if (editErrors.nic) setEditErrors((f) => ({ ...f, nic: null }));
              }}
              required
            />

            <div className="grid sm:grid-cols-2 gap-3.5">
              <FormInput
                label="Email Address"
                type="email"
                padding="0"
                value={editing.email}
                error={editErrors.email}
                onChange={(e) => {
                  setEditing((p) => (p ? { ...p, email: e.target.value } : p));
                  if (editErrors.email) setEditErrors((f) => ({ ...f, email: null }));
                }}
                required
              />

              <FormInput
                label="Phone Number"
                type="tel"
                padding="0"
                value={editing.phone || ""}
                error={editErrors.phone}
                onChange={(e) => {
                  setEditing((p) => (p ? { ...p, phone: e.target.value } : p));
                  if (editErrors.phone) setEditErrors((f) => ({ ...f, phone: null }));
                }}
              />
            </div>

            <div className="pt-3 border-t border-slate-100">
              <CommonButton
                type="submit"
                disabled={saving}
                loading={saving ? "Saving changes…" : false}
                label="Save Changes"
                className="w-full py-2.5"
              />
            </div>
          </form>
        )}
      </Modal>
    </div>
  );
}
