import { useEffect, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCreditCard, faDownload, faQrcode, faReceipt } from "@fortawesome/free-solid-svg-icons";

import { getUserFromToken } from "../auth/services/authApi";
import { downloadReceipt, listPatientInvoices, payViaGateway } from "./services/billingApi";
import type { Invoice } from "./types/billing";

const card = "bg-white border border-border-grey rounded-[14px] p-5";

const STATUS_STYLE: Record<Invoice["status"], string> = {
  UNPAID: "bg-red-100 text-red-700",
  PARTIALLY_PAID: "bg-amber-100 text-amber-700",
  PAID: "bg-border-grey/60 text-green-text-1",
};

export default function PatientBillingPage() {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [banner, setBanner] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [payingId, setPayingId] = useState<string | null>(null);

  const patientId = getUserFromToken()?.id as string | undefined;

  useEffect(() => {
    if (!patientId) return; // handled by the render guard below — nothing to fetch
    listPatientInvoices(patientId)
      .then((res) => setInvoices(res.invoices))
      .catch((err) => setBanner({ type: "error", text: err instanceof Error ? err.message : "Failed to load invoices" }))
      .finally(() => setLoading(false));
  }, [patientId]);

  async function refreshInvoices() {
    if (!patientId) return;
    const res = await listPatientInvoices(patientId);
    setInvoices(res.invoices);
  }

  // F-7.3
  async function handlePay(invoice: Invoice, method: "CARD" | "QR") {
    setPayingId(invoice._id);
    setBanner(null);
    try {
      const res = await payViaGateway(invoice._id, invoice.balanceDue, method);
      setBanner({ type: "success", text: res.message });
      await refreshInvoices();
    } catch (err) {
      setBanner({ type: "error", text: err instanceof Error ? err.message : "Payment failed" });
    } finally {
      setPayingId(null);
    }
  }

  async function handleDownload(invoice: Invoice) {
    try {
      const blob = await downloadReceipt(invoice._id);
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `Receipt-${invoice._id}.pdf`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      setBanner({ type: "error", text: err instanceof Error ? err.message : "Could not download receipt" });
    }
  }

  if (!patientId) {
    return (
      <div className="max-w-4xl mx-auto px-6 py-8 font-inter text-green-text-1">
        <p className="text-muted-green text-[13px]">Please log in as a patient to view your bills.</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-6 py-8 font-inter text-green-text-1">
      <h1 className="font-manrope font-extrabold text-2xl mb-1">My Bills</h1>
      <p className="text-muted-green text-[13px] mb-6">Invoices, receipts, and online payments</p>

      {banner && (
        <div
          className={`mb-5 rounded-[10px] px-4 py-3 text-[13px] ${
            banner.type === "success" ? "bg-border-grey/60 text-green-text-1" : "bg-red-100 text-red-700"
          }`}
        >
          {banner.text}
        </div>
      )}

      {loading && <p className="text-muted-green text-[13px]">Loading…</p>}

      {!loading && invoices.length === 0 && (
        <div className={`${card} text-center text-muted-green text-[13px] py-14`}>
          <FontAwesomeIcon icon={faReceipt} size="2x" className="mb-3 text-border-grey" />
          <p>No invoices yet.</p>
        </div>
      )}

      <div className="space-y-4">
        {invoices.map((invoice) => (
          <section key={invoice._id} className={card}>
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div>
                <p className="text-[13px] font-bold">Invoice {invoice._id.slice(-6).toUpperCase()}</p>
                <p className="text-[12px] text-muted-green">{new Date(invoice.issuedDate).toLocaleDateString()}</p>
              </div>
              <span className={`text-[11px] px-2 py-0.5 rounded-full ${STATUS_STYLE[invoice.status]}`}>{invoice.status}</span>
            </div>

            <div className="mt-3 text-[12px] space-y-1">
              <div className="flex justify-between"><span>Total</span><span>{invoice.totalAmount.toFixed(2)}</span></div>
              <div className="flex justify-between"><span>Paid</span><span>{invoice.amountPaid.toFixed(2)}</span></div>
              <div className="flex justify-between font-bold"><span>Balance due</span><span>{invoice.balanceDue.toFixed(2)}</span></div>
            </div>

            <div className="flex flex-wrap gap-2 mt-3">
              <button
                onClick={() => handleDownload(invoice)}
                className="flex items-center gap-2 border border-border-grey rounded-[10px] px-3 py-2 text-[12px]"
              >
                <FontAwesomeIcon icon={faDownload} /> Receipt
              </button>
              {invoice.balanceDue > 0 && (
                <>
                  <button
                    onClick={() => handlePay(invoice, "CARD")}
                    disabled={payingId === invoice._id}
                    className="flex items-center gap-2 bg-accent text-white rounded-[10px] px-3 py-2 text-[12px] disabled:opacity-60"
                  >
                    <FontAwesomeIcon icon={faCreditCard} /> Pay by Card
                  </button>
                  <button
                    onClick={() => handlePay(invoice, "QR")}
                    disabled={payingId === invoice._id}
                    className="flex items-center gap-2 border border-border-grey rounded-[10px] px-3 py-2 text-[12px] disabled:opacity-60"
                  >
                    <FontAwesomeIcon icon={faQrcode} /> Pay by QR
                  </button>
                </>
              )}
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}
