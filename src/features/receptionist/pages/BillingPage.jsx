import { useCallback, useEffect, useState } from "react";
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
import {
  formatCurrency,
  formatDate,
  formatDateTime,
} from "../../../lib/utils/format";
import { validateNumber } from "../../../lib/utils/validation";
import {
  getPatientBilling,
  recordPayment,
  searchPatients,
} from "../services/receptionistApi";

const METHODS = [
  { value: "CASH", label: "💵 Cash Payment" },
  { value: "CARD", label: "💳 Debit / Credit Card" },
  { value: "BANK_TRANSFER", label: "🏦 Direct Bank Transfer" },
  { value: "ONLINE", label: "🌐 Online Gateway" },
  { value: "OTHER", label: "📝 Other Method" },
];

export default function BillingPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const patientId = searchParams.get("patientId");
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [billing, setBilling] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [payingInvoice, setPayingInvoice] = useState(null);

  const load = useCallback(async (id) => {
    setLoading(true);
    setError(null);
    try {
      const res = await getPatientBilling(id);
      setBilling(res);
    } catch (err) {
      setBilling(null);
      setError(err instanceof ApiError ? err.message : "Failed to load patient billing records.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (patientId) void load(patientId);
    else setBilling(null);
  }, [patientId, load]);

  const handleSearch = async (value) => {
    setQuery(value);
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

  const selectPatient = (patient) => {
    setSearchParams({ patientId: patient._id });
    setResults([]);
    setQuery("");
  };

  return (
    <div className="space-y-6 text-left max-w-5xl">
      {/* Header */}
      <div>
        <span className="text-xs font-bold text-blue-600 uppercase tracking-wider">
          Billing & Invoicing
        </span>
        <h1 className="font-manrope text-2xl sm:text-3xl font-extrabold text-slate-900 mt-1">
          Patient Invoices & Payments
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
          Look up patient balances, view procedure invoices, and issue receipts.
        </p>
      </div>

      {/* Patient Search Card */}
      <Card className="space-y-2 border border-white/80">
        <FormInput
          label="Lookup Patient Invoices (Name, NIC or Email)"
          padding="0"
          placeholder="Start typing patient name or NIC…"
          value={query}
          icon="🔍"
          onChange={(e) => handleSearch(e.target.value)}
        />
        {results.length > 0 && (
          <div className="border border-slate-200 rounded-2xl bg-white divide-y divide-slate-100 max-h-48 overflow-y-auto shadow-md">
            {results.map((patient) => (
              <button
                key={patient._id}
                type="button"
                onClick={() => selectPatient(patient)}
                className="w-full text-left px-4 py-3 text-xs hover:bg-blue-50/70 transition-colors flex justify-between items-center"
              >
                <div>
                  <span className="font-bold text-slate-900">{patient.name}</span>
                  <span className="text-slate-500"> — {patient.email}</span>
                </div>
                <span className="text-xs font-semibold text-blue-600">Open Billing →</span>
              </button>
            ))}
          </div>
        )}
      </Card>

      {error && <Alert kind="error">{error}</Alert>}

      {loading && (
        <div className="py-8 text-center text-slate-500 text-xs flex flex-col items-center gap-2">
          <svg className="animate-spin h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
          </svg>
          <span>Retrieving billing data…</span>
        </div>
      )}

      {!loading && !billing && !error && (
        <EmptyState
          icon="💳"
          title="Search for a Patient"
          description="Type a patient's name, NIC or email above to view their invoices and payment receipts."
        />
      )}

      {billing && (
        <>
          {/* Patient Overview & Financial Summary */}
          <div className="glass-card p-6 sm:p-7 border border-white/90 shadow-glass">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
              <div className="space-y-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-blue-600">
                  Patient Summary
                </span>
                <h2 className="font-manrope font-extrabold text-xl sm:text-2xl text-slate-900">
                  {billing.patient.name}
                </h2>
                <p className="text-xs text-slate-500">
                  {billing.patient.email} • {billing.patient.phone || "No phone listed"} • NIC: {billing.patient.nic || "—"}
                </p>
              </div>

              <div className="grid grid-cols-3 gap-3 sm:gap-6 text-left sm:text-right border-t sm:border-t-0 pt-4 sm:pt-0 border-slate-100">
                <Total label="Total Invoiced" value={billing.totals.totalAmount} />
                <Total label="Total Settled" value={billing.totals.amountPaid} />
                <Total
                  label="Outstanding"
                  value={billing.totals.outstandingBalance}
                  emphasize={billing.totals.outstandingBalance > 0}
                />
              </div>
            </div>
          </div>

          {/* Invoices List */}
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="font-manrope font-bold text-base text-slate-800">
                Issued Invoices ({billing.invoices.length})
              </h3>
              <span className="text-xs text-slate-500">Itemized Treatment Invoices</span>
            </div>

            {billing.invoices.length === 0 ? (
              <EmptyState
                icon="🧾"
                title="No invoices on record"
                description="Invoices appear here once a dentist finishes a new treatment procedure."
              />
            ) : (
              <div className="grid gap-4">
                {billing.invoices.map((invoice) => (
                  <Card key={invoice._id} className="p-6 space-y-4 border border-white/80">
                    <div className="flex flex-wrap justify-between items-start gap-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-bold text-xs bg-slate-100 text-slate-700 px-2 py-0.5 rounded">
                            {invoice.invoiceNumber}
                          </span>
                          <p className="font-bold text-slate-900 text-sm">
                            {invoice.treatmentName}
                          </p>
                        </div>
                        <p className="text-[11px] text-slate-500 mt-1">
                          Issued on {formatDate(invoice.issuedDate)}
                        </p>
                      </div>

                      <div className="flex items-center gap-3">
                        <StatusBadge status={invoice.status} />
                        {invoice.outstandingBalance > 0 && (
                          <CommonButton
                            label="💳 Record Payment"
                            onClick={() => setPayingInvoice(invoice)}
                            className="px-3.5 py-1.5 text-xs shadow-sm"
                            containerProps={{ className: "w-auto" }}
                          />
                        )}
                      </div>
                    </div>

                    {/* Breakdown Numbers */}
                    <div className="grid grid-cols-3 gap-4 text-xs border-t border-slate-100 pt-3 bg-slate-50/50 p-3 rounded-xl">
                      <div>
                        <p className="text-slate-500 text-[11px]">Total Fee</p>
                        <p className="font-bold text-slate-900 text-sm">
                          {formatCurrency(invoice.totalAmount)}
                        </p>
                      </div>
                      <div>
                        <p className="text-slate-500 text-[11px]">Amount Paid</p>
                        <p className="font-bold text-emerald-600 text-sm">
                          {formatCurrency(invoice.amountPaid)}
                        </p>
                      </div>
                      <div>
                        <p className="text-slate-500 text-[11px]">Balance Due</p>
                        <p
                          className={`font-bold text-sm ${
                            invoice.outstandingBalance > 0 ? "text-rose-600 font-extrabold" : "text-slate-700"
                          }`}
                        >
                          {formatCurrency(invoice.outstandingBalance)}
                        </p>
                      </div>
                    </div>

                    {/* Payments History List */}
                    {invoice.payments && invoice.payments.length > 0 && (
                      <div className="border-t border-slate-100 pt-3 space-y-2">
                        <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                          Payment Receipt History
                        </p>
                        <div className="divide-y divide-slate-100 rounded-xl bg-white border border-slate-100 overflow-hidden">
                          {invoice.payments.map((payment) => (
                            <div
                              key={payment._id}
                              className="flex justify-between items-center px-3 py-2 text-xs"
                            >
                              <div className="flex items-center gap-2">
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                                <span className="text-slate-600 font-medium">
                                  {formatDateTime(payment.paymentDate)} • Method: {payment.method}
                                </span>
                              </div>
                              <span className="font-bold text-slate-900">
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
          </div>
        </>
      )}

      {/* Record Payment Modal */}
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

function Total({ label, value, emphasize }) {
  return (
    <div>
      <p className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">{label}</p>
      <p
        className={`font-manrope font-extrabold ${
          emphasize ? "text-rose-600 text-lg sm:text-xl" : "text-slate-900 text-base sm:text-lg"
        }`}
      >
        {formatCurrency(value)}
      </p>
    </div>
  );
}

function RecordPaymentModal({ invoice, patientId, onClose, onSuccess }) {
  const [amount, setAmount] = useState("");
  const [method, setMethod] = useState("CASH");
  const [notes, setNotes] = useState("");
  const [amountError, setAmountError] = useState(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (invoice) {
      setAmount(String(invoice.outstandingBalance));
      setMethod("CASH");
      setNotes("");
      setAmountError(null);
      setError(null);
    }
  }, [invoice]);

  const validate = () => {
    const num = Number(amount);
    if (isNaN(num) || num <= 0) {
      setAmountError("Payment amount must be greater than 0");
      return false;
    }
    if (invoice && num > invoice.outstandingBalance) {
      setAmountError(
        `Payment cannot exceed the outstanding balance of ${formatCurrency(
          invoice.outstandingBalance
        )}`
      );
      return false;
    }
    setAmountError(null);
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!invoice || !patientId) return;
    if (!validate()) return;

    setSaving(true);
    setError(null);
    try {
      await recordPayment(patientId, invoice._id, {
        amount: Number(amount),
        method,
        notes: notes ? notes.trim() : undefined,
      });
      onSuccess();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Failed to record payment.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal open={Boolean(invoice)} title="Record Payment Receipt" onClose={onClose}>
      {invoice && (
        <form onSubmit={handleSubmit} noValidate className="space-y-4 text-left">
          <div className="p-3.5 rounded-2xl bg-blue-50/80 border border-blue-100 text-xs">
            <div className="font-bold text-slate-900">
              Invoice #{invoice.invoiceNumber} — {invoice.treatmentName}
            </div>
            <div className="text-slate-600 mt-0.5">
              Outstanding Balance:{" "}
              <span className="font-extrabold text-blue-700">
                {formatCurrency(invoice.outstandingBalance)}
              </span>
            </div>
          </div>

          {error && <Alert kind="error">{error}</Alert>}

          <FormInput
            label="Payment Amount (LKR)"
            padding="0"
            type="number"
            step="0.01"
            min="0.01"
            max={invoice.outstandingBalance}
            value={amount}
            error={amountError}
            onChange={(e) => {
              setAmount(e.target.value);
              if (amountError) setAmountError(null);
            }}
            required
          />

          <FormSelect
            label="Payment Method"
            padding="0"
            value={method}
            onChange={(e) => setMethod(e.target.value)}
          >
            {METHODS.map((m) => (
              <option key={m.value} value={m.value}>
                {m.label}
              </option>
            ))}
          </FormSelect>

          <FormInput
            label="Transaction Notes / Receipt Ref (Optional)"
            padding="0"
            placeholder="e.g. POS Transaction ID #10492"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
          />

          <div className="pt-3 border-t border-slate-100">
            <CommonButton
              type="submit"
              disabled={saving}
              loading={saving ? "Issuing receipt…" : false}
              label="✓ Confirm & Record Payment"
              className="w-full py-2.5 text-sm"
            />
          </div>
        </form>
      )}
    </Modal>
  );
}
