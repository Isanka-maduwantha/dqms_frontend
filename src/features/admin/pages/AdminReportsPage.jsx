import { useEffect, useState } from "react";
import Card from "../../../components/ui/Card";
import Alert from "../../../components/ui/Alert";
import EmptyState from "../../../components/ui/EmptyState";
import FormInput from "../../../components/FormInput";
import FormSelect from "../../../components/FormSelect";
import StatusBadge from "../../../components/StatusBadge";
import CommonButton from "../../../components/CommanButton";
import { ApiError, downloadBlob } from "../../../lib/api/http";
import {
  formatCurrency,
  formatDate,
  todayISODate,
} from "../../../lib/utils/format";
import { downloadReportPdf, getReport } from "../services/adminApi";
import { searchPatients } from "../../receptionist/services/receptionistApi";

const TABS = [
  { key: "inventory", label: "Inventory Stock", icon: "📦" },
  { key: "treatments", label: "Treatments Log", icon: "🦷" },
  { key: "revenue", label: "Revenue & Billing", icon: "💰" },
  { key: "payments", label: "Payment Receipts", icon: "💳" },
  { key: "appointments", label: "Appointments History", icon: "📅" },
];

const NEEDS_PERIOD = ["revenue", "appointments"];
const NEEDS_PATIENT = ["treatments", "payments", "appointments"];

const TAB_REPORT_TYPES = {
  inventory: ["INVENTORY"],
  treatments: ["ALL_TREATMENTS", "PATIENT_TREATMENTS"],
  revenue: ["REVENUE"],
  payments: ["ALL_PAYMENTS", "PATIENT_PAYMENTS"],
  appointments: ["APPOINTMENTS"],
};

export default function AdminReportsPage() {
  const [tab, setTab] = useState("inventory");
  const [period, setPeriod] = useState("month");
  const [date, setDate] = useState(todayISODate());
  const [patient, setPatient] = useState(null);
  const [patientQuery, setPatientQuery] = useState("");
  const [patientResults, setPatientResults] = useState([]);
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [exporting, setExporting] = useState(false);

  const activeReport =
    report && TAB_REPORT_TYPES[tab].includes(report.report?.reportType)
      ? report
      : null;

  const filters = {
    ...(NEEDS_PERIOD.includes(tab) ? { period, date } : {}),
    ...(NEEDS_PATIENT.includes(tab) && patient ? { patientId: patient._id } : {}),
  };

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await getReport(tab, filters);
        if (!cancelled) setReport(res);
      } catch (err) {
        if (!cancelled) {
          setReport(null);
          setError(err instanceof ApiError ? err.message : "Failed to load report.");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tab, period, date, patient]);

  const handleExport = async () => {
    setExporting(true);
    try {
      const blob = await downloadReportPdf(tab, filters);
      downloadBlob(blob, `${tab}-report-${todayISODate()}.pdf`);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Failed to export PDF.");
    } finally {
      setExporting(false);
    }
  };

  const handlePatientSearch = async (value) => {
    setPatientQuery(value);
    if (!value.trim()) {
      setPatientResults([]);
      return;
    }
    try {
      const res = await searchPatients(value);
      setPatientResults(res.data || []);
    } catch {
      setPatientResults([]);
    }
  };

  return (
    <div className="space-y-6 text-left max-w-6xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold text-blue-600 uppercase tracking-wider">
            Operational Analytics
          </span>
          <h1 className="font-manrope text-2xl sm:text-3xl font-extrabold text-slate-900 mt-1">
            Clinic Reports & Audits
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Operational snapshots and financial data generated from live records.
          </p>
        </div>

        <CommonButton
          label="⬇ Export PDF Report"
          loading={exporting ? "Preparing PDF…" : false}
          disabled={exporting || loading}
          onClick={handleExport}
          className="px-5 py-2.5 text-xs sm:text-sm shadow-md"
          containerProps={{ className: "w-auto" }}
        />
      </div>

      {/* Report Categories Tab Bar */}
      <div className="flex border-b border-slate-200/80 gap-2 overflow-x-auto pb-1">
        {TABS.map((t) => (
          <button
            key={t.key}
            type="button"
            onClick={() => {
              setTab(t.key);
              setPatient(null);
              setPatientQuery("");
            }}
            className={`flex items-center gap-2 px-4 py-3 text-xs sm:text-sm font-bold border-b-2 -mb-px transition-all duration-200 whitespace-nowrap cursor-pointer ${
              tab === t.key
                ? "border-blue-600 text-blue-600 bg-blue-50/50 rounded-t-xl"
                : "border-transparent text-slate-500 hover:text-slate-800"
            }`}
          >
            <span>{t.icon}</span>
            <span>{t.label}</span>
          </button>
        ))}
      </div>

      {/* Filters Bar */}
      <div className="flex flex-wrap gap-4 items-end bg-white/70 backdrop-blur-md p-4 rounded-2xl border border-slate-200/80 shadow-xs">
        {NEEDS_PERIOD.includes(tab) && (
          <>
            <div className="w-40">
              <FormSelect
                label="Aggregation Period"
                padding="0"
                value={period}
                onChange={(e) => setPeriod(e.target.value)}
              >
                <option value="day">Daily Snapshot</option>
                <option value="week">Weekly Summary</option>
                <option value="month">Monthly Overview</option>
              </FormSelect>
            </div>
            <div>
              <label className="font-inter text-xs font-bold text-slate-700 block mb-1.5">
                Reference Date
              </label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="bg-white border border-slate-200 rounded-xl px-3.5 py-2 text-xs text-slate-800 outline-none focus:border-blue-500"
              />
            </div>
          </>
        )}

        {NEEDS_PATIENT.includes(tab) && (
          <div className="w-full sm:w-72 relative">
            <FormInput
              label="Filter by Patient (Optional)"
              padding="0"
              placeholder="Search patient name…"
              value={patient ? patient.name : patientQuery}
              icon="🔍"
              onChange={(e) => {
                setPatient(null);
                void handlePatientSearch(e.target.value);
              }}
            />
            {patientResults.length > 0 && !patient && (
              <div className="absolute z-20 mt-1 w-full border border-slate-200 rounded-2xl bg-white divide-y divide-slate-100 max-h-44 overflow-y-auto shadow-xl">
                {patientResults.map((p) => (
                  <button
                    key={p._id}
                    type="button"
                    onClick={() => {
                      setPatient(p);
                      setPatientResults([]);
                    }}
                    className="w-full text-left px-3.5 py-2.5 text-xs hover:bg-blue-50 transition-colors"
                  >
                    <span className="font-bold text-slate-900">{p.name}</span>
                    <span className="text-slate-500"> — {p.email}</span>
                  </button>
                ))}
              </div>
            )}
            {patient && (
              <button
                type="button"
                onClick={() => {
                  setPatient(null);
                  setPatientQuery("");
                }}
                className="text-[11px] text-rose-600 font-bold mt-1 hover:underline block"
              >
                ✕ Clear Patient Filter
              </button>
            )}
          </div>
        )}
      </div>

      {error && <Alert kind="error">{error}</Alert>}

      {/* Report Content */}
      {loading || !activeReport ? (
        <div className="py-12 text-center text-slate-500 text-xs flex flex-col items-center gap-2">
          <svg className="animate-spin h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
          </svg>
          <span>Compiling live clinical report…</span>
        </div>
      ) : (
        <ReportBody tab={tab} report={activeReport} />
      )}
    </div>
  );
}

function StatGrid({ stats }) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {stats.map((s) => (
        <Card
          key={s.label}
          className="p-5 text-center space-y-1 border border-white/80 shadow-glass"
        >
          <p className="font-manrope font-extrabold text-xl sm:text-2xl text-slate-900">
            {s.value}
          </p>
          <p className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">
            {s.label}
          </p>
        </Card>
      ))}
    </div>
  );
}

function ReportBody({ tab, report }) {
  const summary = report.summary || {};
  const data = report.data || {};

  if (tab === "inventory") {
    return (
      <div className="space-y-6">
        <StatGrid
          stats={[
            { label: "Total Items", value: String(summary.totalItems || 0) },
            { label: "Low Stock Items", value: String(summary.lowStockItems || 0) },
            { label: "Expired Batches", value: String(summary.expiredItems || 0) },
            { label: "Total Stock Value", value: formatCurrency(summary.totalStockValue || 0) },
          ]}
        />
        <Card className="p-0 overflow-hidden border border-white/80">
          {(data.items || []).length === 0 ? (
            <div className="p-6">
              <EmptyState icon="📦" title="No inventory data" />
            </div>
          ) : (
            <Table
              headers={["Item Name", "Category", "Stock on Hand", "Valuation", "Status"]}
              rows={(data.items || []).map((item) => [
                item.itemName,
                item.category,
                `${item.quantity} ${item.unit}`,
                formatCurrency(item.stockValue),
                <StatusBadge
                  key={item._id}
                  status={
                    item.isExpired
                      ? "CANCELLED"
                      : item.isLowStock
                      ? "LOW_STOCK"
                      : "ACTIVE"
                  }
                />,
              ])}
            />
          )}
        </Card>
      </div>
    );
  }

  if (tab === "treatments") {
    return (
      <div className="space-y-6">
        <StatGrid
          stats={[
            { label: "Total Procedures", value: String(summary.totalTreatmentRecords || 0) },
            { label: "Patients Treated", value: String(summary.patientsIncluded || 0) },
            { label: "Gross Procedure Value", value: formatCurrency(summary.totalTreatmentValue || 0) },
          ]}
        />
        <Card className="p-0 overflow-hidden border border-white/80">
          {(data.records || []).length === 0 ? (
            <div className="p-6">
              <EmptyState icon="🦷" title="No treatment records in this range" />
            </div>
          ) : (
            <Table
              headers={["Date", "Patient Name", "Procedure", "Fee", "Dentist"]}
              rows={(data.records || []).map((r) => [
                formatDate(r.treatmentDate),
                r.patient?.name || "—",
                r.treatmentTypeName || r.treatment,
                formatCurrency(r.treatmentPrice),
                r.dentist?.name || "—",
              ])}
            />
          )}
        </Card>
      </div>
    );
  }

  if (tab === "revenue") {
    return (
      <div className="space-y-6">
        <StatGrid
          stats={[
            { label: "Total Invoiced", value: formatCurrency(summary.totalInvoiced || 0) },
            { label: "Total Collected", value: formatCurrency(summary.totalInvoiceAmountPaid || 0) },
            { label: "Outstanding Due", value: formatCurrency(summary.totalOutstanding || 0) },
            { label: "Payments Recorded", value: formatCurrency(summary.paymentsCollected || 0) },
          ]}
        />
        <Card className="p-0 overflow-hidden border border-white/80">
          {(data.invoices || []).length === 0 ? (
            <div className="p-6">
              <EmptyState icon="🧾" title="No invoices found in this range" />
            </div>
          ) : (
            <Table
              headers={["Invoice #", "Patient Name", "Treatment Procedure", "Total Fee", "Settled", "Status"]}
              rows={(data.invoices || []).map((inv) => [
                inv.invoiceNumber,
                inv.patientId?.name || "—",
                inv.treatmentName,
                formatCurrency(inv.totalAmount),
                formatCurrency(inv.amountPaid),
                <StatusBadge key={inv._id} status={inv.status} />,
              ])}
            />
          )}
        </Card>
      </div>
    );
  }

  if (tab === "payments") {
    return (
      <div className="space-y-6">
        <StatGrid
          stats={[
            { label: "Payment Receipts", value: String(summary.paymentCount || 0) },
            { label: "Total Collected", value: formatCurrency(summary.totalPayments || 0) },
            { label: "Total Invoiced", value: formatCurrency(summary.invoiceTotal || 0) },
            { label: "Unpaid Balance", value: formatCurrency(summary.invoiceOutstanding || 0) },
          ]}
        />
        <Card className="p-0 overflow-hidden border border-white/80">
          {(data.payments || []).length === 0 ? (
            <div className="p-6">
              <EmptyState icon="💳" title="No payment receipts found" />
            </div>
          ) : (
            <Table
              headers={["Receipt Date", "Patient Name", "Method", "Amount Paid", "Received By"]}
              rows={(data.payments || []).map((p) => [
                formatDate(p.paymentDate),
                p.patientId?.name || "—",
                p.method,
                formatCurrency(p.amount),
                p.receivedBy?.name || "—",
              ])}
            />
          )}
        </Card>
      </div>
    );
  }

  // appointments tab
  return (
    <div className="space-y-6">
      <StatGrid
        stats={[
          { label: "Total Scheduled", value: String(summary.totalAppointments || 0) },
          ...Object.entries(summary.statusCounts || {}).map(([status, count]) => ({
            label: status.replace("_", " "),
            value: String(count),
          })),
        ]}
      />
      <Card className="p-0 overflow-hidden border border-white/80">
        {(data.appointments || []).length === 0 ? (
          <div className="p-6">
            <EmptyState icon="📅" title="No appointments in this date range" />
          </div>
        ) : (
          <Table
            headers={["Date", "Slot Time", "Patient Name", "Visit Purpose", "Status", "Queue Token"]}
            rows={(data.appointments || []).map((a) => [
              formatDate(a.appointmentDate),
              a.startTime,
              a.patientId?.name || "—",
              a.visitPurpose || "General Treatment",
              <StatusBadge key={a._id} status={a.status} />,
              a.tokenNumber ? `#${a.tokenNumber}` : "—",
            ])}
          />
        )}
      </Card>
    </div>
  );
}

function Table({ headers, rows }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left text-xs">
        <thead>
          <tr className="text-[11px] uppercase tracking-wider text-slate-500 border-b border-slate-100 bg-slate-50/50">
            {headers.map((h, i) => (
              <th key={i} className="py-3 px-5 font-bold">
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {rows.map((row, i) => (
            <tr key={i} className="hover:bg-blue-50/40 transition-colors">
              {row.map((cell, j) => (
                <td key={j} className="py-3.5 px-5 font-medium text-slate-800">
                  {cell}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
