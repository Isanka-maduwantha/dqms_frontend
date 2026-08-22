import { useCallback, useEffect, useState, type FormEvent } from "react";
import { useSearchParams } from "react-router-dom";
import Card from "../../../components/ui/Card";
import Alert from "../../../components/ui/Alert";
import Modal from "../../../components/ui/Modal";
import EmptyState from "../../../components/ui/EmptyState";
import FormInput from "../../../components/FormInput";
import FormSelect from "../../../components/FormSelect";
import CommonButton from "../../../components/CommanButton";
import StatusBadge from "../../../components/StatusBadge";
import { ApiError } from "../../../lib/api/http";
import { formatCurrency, formatDate, formatDateTime } from "../../../lib/utils/format";
import {
  getPatientBilling,
  recordPayment,
  searchPatients,
} from "../services/receptionistApi";
import type { Invoice, PatientBilling, PatientSummary } from "../types/receptionist";

const METHODS = ["CASH", "CARD", "BANK_TRANSFER", "ONLINE", "OTHER"] as const;

export default function BillingPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const patientId = searchParams.get("patientId");

  const [query, setQuery] = useState("");
  const [results, setResults] = useState<PatientSummary[]>([]);
  const [billing, setBilling] = useState<PatientBilling | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [payingInvoice, setPayingInvoice] = useState<Invoice | null>(null);

  const load = useCallback(async (id: string) => {
    setLoading(true);
    setError(null);
    try {
      const res = await getPatientBilling(id);
      setBilling(res);
    } catch (err) {
      setBilling(null);
      setError(err instanceof ApiError ? err.message : "Failed to load billing.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (patientId) void load(patientId);
    else setBilling(null);
  }, [patientId, load]);

  const handleSearch = async (value: string) => {
    setQuery(value);
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

  const selectPatient = (patient: PatientSummary) => {
    setSearchParams({ patientId: patient._id });
    setResults([]);
    setQuery("");
  };

  return (
    <div className="flex flex-col gap-6 max-w-5xl">
      <div>
        <h1 className="font-manrope text-2xl font-bold text-green-text-1">Billing</h1>
        <p className="text-[12px] text-muted-green">
          Look up a patient's invoices and record payments.
        </p>
      </div>

      <Card>
        <FormInput
          label="Search patient by name or email"
          padding="0"
          placeholder="Start typing…"
          value={query}
          onChange={(e) => handleSearch(e.target.value)}
        />
        {results.length > 0 && (
          <div className="mt-2 border border-border-grey rounded-[10px] divide-y divide-border-grey max-h-48 overflow-auto">
            {results.map((patient) => (
              <button
                key={patient._id}
                type="button"
                onClick={() => selectPatient(patient)}
                className="w-full text-left px-4 py-2.5 text-[12px] hover:bg-gray-50"
              >
                <span className="font-bold text-green-text-1">{patient.name}</span>
                <span className="text-muted-green"> — {patient.email}</span>
              </button>
            ))}
          </div>
        )}
      </Card>

      {error && <Alert kind="error">{error}</Alert>}

      {loading && <p className="text-[12px] text-muted-green">Loading…</p>}

      {!loading && !billing && !error && (
        <EmptyState icon="💳" title="Search for a patient" description="Select a patient above to view their invoices and payment history." />
      )}

      {billing && (
        <>
          <Card>
            <div className="flex flex-wrap justify-between gap-4">
              <div>
                <h2 className="font-manrope font-bold text-[16px] text-green-text-1">
                  {billing.patient.name}
                </h2>
                <p className="text-[12px] text-muted-green">
                  {billing.patient.email} • {billing.patient.phone || "No phone"}
                </p>
              </div>
              <div className="flex gap-6 text-right">
                <Total label="Billed" value={billing.totals.totalAmount} />
                <Total label="Paid" value={billing.totals.amountPaid} />
                <Total label="Outstanding" value={billing.totals.outstandingBalance} emphasize />
              </div>
            </div>
          </Card>

          {billing.invoices.length === 0 ? (
            <EmptyState icon="🧾" title="No invoices yet" description="Invoices appear here once a dentist ends a new-treatment appointment." />
          ) : (
            <div className="flex flex-col gap-4">
              {billing.invoices.map((invoice) => (
                <Card key={invoice._id} className="flex flex-col gap-3">
                  <div className="flex flex-wrap justify-between gap-3">
                    <div>
                      <p className="font-bold text-green-text-1 text-[13px]">
                        {invoice.invoiceNumber} — {invoice.treatmentName}
                      </p>
                      <p className="text-[11px] text-muted-green">
                        Issued {formatDate(invoice.issuedDate)}
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      <StatusBadge status={invoice.status} />
                      {invoice.outstandingBalance > 0 && (
                        <button
                          type="button"
                          onClick={() => setPayingInvoice(invoice)}
                          className="rounded-[8px] bg-accent text-white text-[11px] font-semibold px-3 py-1.5"
                        >
                          Record payment
                        </button>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-4 text-[12px] border-t border-border-grey pt-3">
                    <div>
                      <p className="text-muted-green">Total</p>
                      <p className="font-bold text-green-text-1">{formatCurrency(invoice.totalAmount)}</p>
                    </div>
                    <div>
                      <p className="text-muted-green">Paid</p>
                      <p className="font-bold text-green-text-1">{formatCurrency(invoice.amountPaid)}</p>
                    </div>
                    <div>
                      <p className="text-muted-green">Outstanding</p>
                      <p className="font-bold text-green-text-1">{formatCurrency(invoice.outstandingBalance)}</p>
                    </div>
                  </div>

                  {invoice.payments && invoice.payments.length > 0 && (
                    <div className="border-t border-border-grey pt-3">
                      <p className="text-[11px] font-bold text-muted-green pb-2 uppercase tracking-wider">
                        Payments
                      </p>
                      <div className="flex flex-col gap-1.5">
                        {invoice.payments.map((payment) => (
                          <div key={payment._id} className="flex justify-between text-[12px]">
                            <span>
                              {formatDateTime(payment.paymentDate)} • {payment.method}
                            </span>
                            <span className="font-bold text-green-text-1">
                              {formatCurrency(payment.amount)}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </Card>
              ))}
            </div>
          )}
        </>
      )}

      <RecordPaymentModal
        invoice={payingInvoice}
        patientId={patientId}
        onClose={() => setPayingInvoice(null)}
        onSuccess={() => {
          setPayingInvoice(null);
          if (patientId) void load(patientId);
        }}
      />
    </div>
  );
}

function Total({ label, value, emphasize }: { label: string; value: number; emphasize?: boolean }) {
  return (
    <div>
      <p className="text-[11px] text-muted-green uppercase tracking-wider">{label}</p>
      <p className={`font-manrope font-bold ${emphasize ? "text-accent text-[18px]" : "text-green-text-1 text-[16px]"}`}>
        {formatCurrency(value)}
      </p>
    </div>
  );
}

function RecordPaymentModal({
  invoice,
  patientId,
  onClose,
  onSuccess,
}: {
  invoice: Invoice | null;
  patientId: string | null;
  onClose: () => void;
  onSuccess: () => void;
}) {
  const [amount, setAmount] = useState("");
  const [method, setMethod] = useState<(typeof METHODS)[number]>("CASH");
  const [notes, setNotes] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (invoice) {
      setAmount(String(invoice.outstandingBalance));
      setMethod("CASH");
      setNotes("");
      setError(null);
    }
  }, [invoice]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!invoice || !patientId) return;
    setSaving(true);
    setError(null);
    try {
      await recordPayment(patientId, invoice._id, {
        amount: Number(amount),
        method,
        notes,
      });
      onSuccess();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Failed to record payment.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal open={Boolean(invoice)} title="Record payment" onClose={onClose}>
      {invoice && (
        <form onSubmit={handleSubmit} className="flex flex-col">
          <p className="text-[12px] text-muted-green pb-2">
            {invoice.invoiceNumber} • Outstanding {formatCurrency(invoice.outstandingBalance)}
          </p>
          <FormInput
            label="Amount"
            padding="0"
            type="number"
            step="0.01"
            min="0.01"
            max={invoice.outstandingBalance}
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            required
          />
          <FormSelect label="Method" value={method} onChange={(e) => setMethod(e.target.value as (typeof METHODS)[number])}>
            {METHODS.map((m) => (
              <option key={m} value={m}>
                {m.replace("_", " ")}
              </option>
            ))}
          </FormSelect>
          <FormInput
            label="Notes (optional)"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
          />
          {error && (
            <p className="pt-2 text-[12px] text-red-600" role="alert">
              {error}
            </p>
          )}
          <div className="pt-4">
            <CommonButton
              type="submit"
              disabled={saving}
              label={saving ? "Recording…" : "Record payment"}
              className="text-[13px] py-2.5"
            />
          </div>
        </form>
      )}
    </Modal>
  );
}
