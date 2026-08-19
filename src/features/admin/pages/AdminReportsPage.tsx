import { useEffect, useState, type ReactNode } from "react";
import Card from "../../../components/ui/Card";
import Alert from "../../../components/ui/Alert";
import EmptyState from "../../../components/ui/EmptyState";
import FormInput from "../../../components/FormInput";
import FormSelect from "../../../components/FormSelect";
import StatusBadge from "../../../components/StatusBadge";
import { ApiError, downloadBlob } from "../../../lib/api/http";
import { formatCurrency, formatDate, todayISODate } from "../../../lib/utils/format";
import { downloadReportPdf, getReport, type ReportFilters } from "../services/adminApi";
import type { ReportType } from "../types/admin";
import { searchPatients } from "../../receptionist/services/receptionistApi";
import type { PatientSummary } from "../../receptionist/types/receptionist";

const TABS: { key: ReportType; label: string; icon: string }[] = [
  { key: "inventory", label: "Inventory", icon: "📦" },
  { key: "treatments", label: "Treatments", icon: "🦷" },
  { key: "revenue", label: "Revenue", icon: "💰" },
  { key: "payments", label: "Payments", icon: "💳" },
  { key: "appointments", label: "Appointments", icon: "📅" },
];

const NEEDS_PERIOD: ReportType[] = ["revenue", "appointments"];
const NEEDS_PATIENT: ReportType[] = ["treatments", "payments", "appointments"];

// Every report type's backend response carries a distinct `report.reportType`.
// Used to make sure we never render one tab's shape (e.g. inventory's
// `data.items`) against another tab's renderer (e.g. treatments' `data.records`).
const TAB_REPORT_TYPES: Record<ReportType, string[]> = {
  inventory: ["INVENTORY"],
  treatments: ["ALL_TREATMENTS", "PATIENT_TREATMENTS"],
  revenue: ["REVENUE"],
  payments: ["ALL_PAYMENTS", "PATIENT_PAYMENTS"],
  appointments: ["APPOINTMENTS"],
};

export default function AdminReportsPage() {
  const [tab, setTab] = useState<ReportType>("inventory");
  const [period, setPeriod] = useState<"day" | "week" | "month">("month");
  const [date, setDate] = useState(todayISODate());
  const [patient, setPatient] = useState<PatientSummary | null>(null);
  const [patientQuery, setPatientQuery] = useState("");
  const [patientResults, setPatientResults] = useState<PatientSummary[]>([]);

  const [report, setReport] = useState<Awaited<ReturnType<typeof getReport>> | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [exporting, setExporting] = useState(false);

  // Guard against rendering a stale report from a previously-selected tab.
  // Tab switches update `tab` and re-render before the new fetch resolves,
  // so `report` can briefly hold the *previous* tab's data shape.
  const activeReport =
    report && TAB_REPORT_TYPES[tab].includes(report.report.reportType) ? report : null;

  const filters: ReportFilters = {
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

  const handlePatientSearch = async (value: string) => {
    setPatientQuery(value);
    if (!value.trim()) {
      setPatientResults([]);
      return;
    }
    const res = await searchPatients(value);
    setPatientResults(res.data);
  };

  return (
    <div className="flex flex-col gap-6 max-w-6xl">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="font-manrope text-2xl font-bold text-green-text-1">Reports</h1>
          <p className="text-[12px] text-muted-green">
            Operational snapshots generated from live clinic data.
          </p>
        </div>
        <button
          type="button"
          onClick={handleExport}
          disabled={exporting || loading}
          className="rounded-[10px] bg-cyan-green text-white text-[12px] font-semibold px-4 py-2.5 disabled:opacity-50"
        >
          {exporting ? "Preparing PDF…" : "⬇ Export PDF"}
        </button>
      </div>

      <div className="flex gap-2 border-b border-border-grey flex-wrap">
        {TABS.map((t) => (
          <button
            key={t.key}
            type="button"
            onClick={() => {
              setTab(t.key);
              setPatient(null);
              setPatientQuery("");
            }}
            className={`px-4 py-2.5 text-[13px] font-semibold border-b-2 -mb-px ${
              tab === t.key ? "border-accent text-accent" : "border-transparent text-muted-green hover:text-green-text-1"
            }`}
          >
            {t.icon} {t.label}
          </button>
        ))}
      </div>

      <div className="flex flex-wrap gap-3 items-end">
        {NEEDS_PERIOD.includes(tab) && (
          <>
            <div className="w-40">
              <FormSelect label="Period" padding="0" value={period} onChange={(e) => setPeriod(e.target.value as "day" | "week" | "month")}>
                <option value="day">Day</option>
                <option value="week">Week</option>
                <option value="month">Month</option>
              </FormSelect>
            </div>
            <div>
              <label className="font-inter text-[12px] font-bold text-green-text-1">Reference date</label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="mt-1 block pl-4 pr-4 py-2 outline-none bg-white border border-border-grey rounded-[10px] text-muted-green text-[13px]"
              />
            </div>
          </>
        )}
        {NEEDS_PATIENT.includes(tab) && (
          <div className="w-72 relative">
            <FormInput
              label="Filter by patient (optional)"
              padding="0"
              placeholder="Search patient…"
              value={patient ? patient.name : patientQuery}
              onChange={(e) => {
                setPatient(null);
                void handlePatientSearch(e.target.value);
              }}
            />
            {patientResults.length > 0 && !patient && (
              <div className="absolute z-10 mt-1 w-full border border-border-grey rounded-[10px] bg-white divide-y divide-border-grey max-h-44 overflow-auto shadow">
                {patientResults.map((p) => (
                  <button
                    key={p._id}
                    type="button"
                    onClick={() => {
                      setPatient(p);
                      setPatientResults([]);
                    }}
                    className="w-full text-left px-3 py-2 text-[12px] hover:bg-gray-50"
                  >
                    {p.name} — {p.email}
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
                className="text-[11px] text-accent font-semibold mt-1"
              >
                Clear filter
              </button>
            )}
          </div>
        )}
      </div>

      {error && <Alert kind="error">{error}</Alert>}

      {loading || !activeReport ? (
        <p className="text-[12px] text-muted-green">Generating report…</p>
      ) : (
        <ReportBody tab={tab} report={activeReport} />
      )}
    </div>
  );
}

function StatGrid({ stats }: { stats: { label: string; value: string }[] }) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {stats.map((s) => (
        <Card key={s.label} className="text-center">
          <p className="font-manrope font-bold text-[20px] text-green-text-1">{s.value}</p>
          <p className="text-[11px] text-muted-green uppercase tracking-wider pt-1">{s.label}</p>
        </Card>
      ))}
    </div>
  );
}

function ReportBody({ tab, report }: { tab: ReportType; report: Awaited<ReturnType<typeof getReport>> }) {
  const summary = report.summary as Record<string, any>;
  const data = report.data as Record<string, any>;

  if (tab === "inventory") {
    return (
      <div className="flex flex-col gap-5">
        <StatGrid
          stats={[
            { label: "Total items", value: String(summary.totalItems) },
            { label: "Low stock", value: String(summary.lowStockItems) },
            { label: "Expired", value: String(summary.expiredItems) },
            { label: "Stock value", value: formatCurrency(summary.totalStockValue) },
          ]}
        />
        <Card>
          {data.items.length === 0 ? (
            <EmptyState icon="📦" title="No inventory items" />
          ) : (
            <Table
              headers={["Item", "Category", "Stock", "Value", "Status"]}
              rows={data.items.map((item: any) => [
                item.itemName,
                item.category,
                `${item.quantity} ${item.unit}`,
                formatCurrency(item.stockValue),
                <StatusBadge status={item.isExpired ? "CANCELLED" : item.isLowStock ? "LOW_STOCK" : "ACTIVE"} />,
              ])}
            />
          )}
        </Card>
      </div>
    );
  }

  if (tab === "treatments") {
    return (
      <div className="flex flex-col gap-5">
        <StatGrid
          stats={[
            { label: "Records", value: String(summary.totalTreatmentRecords) },
            { label: "Patients", value: String(summary.patientsIncluded) },
            { label: "Total value", value: formatCurrency(summary.totalTreatmentValue) },
          ]}
        />
        <Card>
          {data.records.length === 0 ? (
            <EmptyState icon="🦷" title="No treatment records" />
          ) : (
            <Table
              headers={["Date", "Patient", "Treatment", "Price", "Dentist"]}
              rows={data.records.map((r: any) => [
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
      <div className="flex flex-col gap-5">
        <StatGrid
          stats={[
            { label: "Invoiced", value: formatCurrency(summary.totalInvoiced) },
            { label: "Collected", value: formatCurrency(summary.totalInvoiceAmountPaid) },
            { label: "Outstanding", value: formatCurrency(summary.totalOutstanding) },
            { label: "Payments received", value: formatCurrency(summary.paymentsCollected) },
          ]}
        />
        <Card>
          <h3 className="font-manrope font-bold text-[14px] text-green-text-1 pb-3">Invoices</h3>
          {data.invoices.length === 0 ? (
            <EmptyState icon="🧾" title="No invoices in this range" />
          ) : (
            <Table
              headers={["Invoice", "Patient", "Treatment", "Total", "Paid", "Status"]}
              rows={data.invoices.map((inv: any) => [
                inv.invoiceNumber,
                inv.patientId?.name || "—",
                inv.treatmentName,
                formatCurrency(inv.totalAmount),
                formatCurrency(inv.amountPaid),
                <StatusBadge status={inv.status} />,
              ])}
            />
          )}
        </Card>
      </div>
    );
  }

  if (tab === "payments") {
    return (
      <div className="flex flex-col gap-5">
        <StatGrid
          stats={[
            { label: "Payments", value: String(summary.paymentCount) },
            { label: "Total collected", value: formatCurrency(summary.totalPayments) },
            { label: "Invoice total", value: formatCurrency(summary.invoiceTotal) },
            { label: "Outstanding", value: formatCurrency(summary.invoiceOutstanding) },
          ]}
        />
        <Card>
          {data.payments.length === 0 ? (
            <EmptyState icon="💳" title="No payments found" />
          ) : (
            <Table
              headers={["Date", "Patient", "Method", "Amount", "Received by"]}
              rows={data.payments.map((p: any) => [
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

  // appointments
  return (
    <div className="flex flex-col gap-5">
      <StatGrid
        stats={[
          { label: "Appointments", value: String(summary.totalAppointments) },
          ...Object.entries(summary.statusCounts || {}).map(([status, count]) => ({
            label: status,
            value: String(count),
          })),
        ]}
      />
      <Card>
        {data.appointments.length === 0 ? (
          <EmptyState icon="📅" title="No appointments in this range" />
        ) : (
          <Table
            headers={["Date", "Time", "Patient", "Visit", "Status", "Token"]}
            rows={data.appointments.map((a: any) => [
              a.appointmentDate,
              a.startTime,
              a.patientId?.name || "—",
              a.visitPurpose || "—",
              <StatusBadge status={a.status} />,
              a.tokenNumber ?? "—",
            ])}
          />
        )}
      </Card>
    </div>
  );
}

function Table({ headers, rows }: { headers: string[]; rows: (string | number | ReactNode)[][] }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left text-[12px]">
        <thead>
          <tr className="text-[11px] uppercase tracking-wider text-muted-green border-b border-border-grey">
            {headers.map((h) => (
              <th key={h} className="py-2 pr-3">
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-border-grey">
          {rows.map((row, i) => (
            <tr key={i}>
              {row.map((cell, j) => (
                <td key={j} className="py-3 pr-3">
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
