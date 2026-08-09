import React, { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faDownload,
  faFileInvoiceDollar,
  faLayerGroup,
  faMagnifyingGlass,
  faMoneyBillWave,
  faPlus,
  faTrash,
} from "@fortawesome/free-solid-svg-icons";

import {
  createInstallmentPlan,
  createInvoice,
  downloadReceipt,
  getInvoice,
  getLedger,
  payInstallment,
} from "./services/billingApi";
import type { Invoice, InstallmentPlan } from "./types/billing";

const card = "bg-white border border-border-grey rounded-[14px] p-5";
const sectionTitle = "font-manrope font-bold text-[15px] text-green-text-1 flex items-center gap-2";

interface DraftItem {
  description: string;
  quantity: number;
  unitPrice: number;
}

export default function BillingDashboardPage() {
  const [banner, setBanner] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // F-7.1 create invoice
  const [patientId, setPatientId] = useState("");
  const [items, setItems] = useState<DraftItem[]>([{ description: "Consultation Fee", quantity: 1, unitPrice: 0 }]);
  const [taxRate, setTaxRate] = useState(0);
  const [discount, setDiscount] = useState(0);
  const [creating, setCreating] = useState(false);

  const [invoice, setInvoice] = useState<Invoice | null>(null);
  const [lookupId, setLookupId] = useState("");
  const [loadingInvoice, setLoadingInvoice] = useState(false);

  // F-7.2 installments
  const [plan, setPlan] = useState<InstallmentPlan | null>(null);
  const [numberOfInstallments, setNumberOfInstallments] = useState(3);
  const [planLoading, setPlanLoading] = useState(false);

  const showError = (err: unknown) =>
    setBanner({ type: "error", text: err instanceof Error ? err.message : "Something went wrong" });

  const addItem = () => setItems((prev) => [...prev, { description: "", quantity: 1, unitPrice: 0 }]);
  const removeItem = (i: number) => setItems((prev) => prev.filter((_, idx) => idx !== i));
  const updateItem = (i: number, field: keyof DraftItem, value: string) =>
    setItems((prev) =>
      prev.map((it, idx) =>
        idx === i ? { ...it, [field]: field === "description" ? value : Number(value) } : it,
      ),
    );

  const runningTotal = items.reduce((sum, it) => sum + it.quantity * it.unitPrice, 0);

  async function handleCreateInvoice(e: React.FormEvent) {
    e.preventDefault();
    if (!patientId.trim()) return;
    setCreating(true);
    setBanner(null);
    try {
      const res = await createInvoice({
        patientId: patientId.trim(),
        items: items.filter((it) => it.description && it.unitPrice >= 0),
        taxRate,
        discount,
      });
      setInvoice(res.invoice);
      setPlan(null);
      setBanner({ type: "success", text: "Invoice generated" });
    } catch (err) {
      showError(err);
    } finally {
      setCreating(false);
    }
  }

  async function loadInvoiceAndLedger(id: string) {
    setLoadingInvoice(true);
    setBanner(null);
    try {
      const res = await getInvoice(id);
      setInvoice(res.invoice);
      try {
        const ledger = await getLedger(id);
        setPlan(ledger.plan);
      } catch {
        setPlan(null);
      }
    } catch (err) {
      showError(err);
    } finally {
      setLoadingInvoice(false);
    }
  }

  async function handleDownloadReceipt() {
    if (!invoice) return;
    try {
      const blob = await downloadReceipt(invoice._id);
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `Receipt-${invoice._id}.pdf`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      showError(err);
    }
  }

  async function handleCreateInstallmentPlan() {
    if (!invoice) return;
    setPlanLoading(true);
    try {
      const res = await createInstallmentPlan(invoice._id, numberOfInstallments);
      setPlan(res.plan);
      setBanner({ type: "success", text: "Installment plan created" });
    } catch (err) {
      showError(err);
    } finally {
      setPlanLoading(false);
    }
  }

  async function handlePayInstallment() {
    if (!plan) return;
    setPlanLoading(true);
    try {
      const res = await payInstallment(plan._id, "CASH");
      setPlan(res.plan);
      const invRes = await getInvoice(invoice!._id);
      setInvoice(invRes.invoice);
      setBanner({ type: "success", text: `Payment of ${res.payment.amount.toFixed(2)} recorded` });
    } catch (err) {
      showError(err);
    } finally {
      setPlanLoading(false);
    }
  }

  return (
    <div className="max-w-5xl mx-auto px-6 py-8 font-inter text-green-text-1">
      <h1 className="font-manrope font-extrabold text-2xl mb-1">Billing &amp; Financial Management</h1>
      <p className="text-muted-green text-[13px] mb-6">Module 7 — front-desk invoicing and instalment ledger</p>

      {banner && (
        <div
          className={`mb-5 rounded-[10px] px-4 py-3 text-[13px] ${
            banner.type === "success" ? "bg-border-grey/60 text-green-text-1" : "bg-red-100 text-red-700"
          }`}
        >
          {banner.text}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* F-7.1 create invoice */}
        <section className={card}>
          <h2 className={sectionTitle}>
            <FontAwesomeIcon icon={faFileInvoiceDollar} /> Generate Invoice
          </h2>
          <form onSubmit={handleCreateInvoice} className="mt-4 space-y-3">
            <div>
              <label className="font-inter text-[12px] font-bold">Patient ID</label>
              <input
                value={patientId}
                onChange={(e) => setPatientId(e.target.value)}
                required
                className="mt-1 w-full p-2.5 outline-none bg-white border border-border-grey rounded-[10px] text-[13px]"
              />
            </div>

            <div>
              <div className="flex items-center justify-between">
                <label className="font-inter text-[12px] font-bold">Line items</label>
                <button type="button" onClick={addItem} className="text-[12px] text-accent flex items-center gap-1">
                  <FontAwesomeIcon icon={faPlus} /> Add
                </button>
              </div>
              {items.map((it, i) => (
                <div key={i} className="flex flex-wrap gap-2 mt-2">
                  <input
                    placeholder="Description"
                    value={it.description}
                    onChange={(e) => updateItem(i, "description", e.target.value)}
                    className="flex-1 min-w-[140px] p-2 outline-none bg-white border border-border-grey rounded-[8px] text-[12px]"
                  />
                  <input
                    type="number"
                    min={1}
                    placeholder="Qty"
                    value={it.quantity}
                    onChange={(e) => updateItem(i, "quantity", e.target.value)}
                    className="w-16 p-2 outline-none bg-white border border-border-grey rounded-[8px] text-[12px]"
                  />
                  <input
                    type="number"
                    min={0}
                    placeholder="Unit price"
                    value={it.unitPrice}
                    onChange={(e) => updateItem(i, "unitPrice", e.target.value)}
                    className="w-24 p-2 outline-none bg-white border border-border-grey rounded-[8px] text-[12px]"
                  />
                  <button type="button" onClick={() => removeItem(i)} className="text-red-500 px-2">
                    <FontAwesomeIcon icon={faTrash} />
                  </button>
                </div>
              ))}
            </div>

            <div className="flex gap-3">
              <div>
                <label className="font-inter text-[12px] font-bold">Tax %</label>
                <input
                  type="number"
                  min={0}
                  value={taxRate}
                  onChange={(e) => setTaxRate(Number(e.target.value))}
                  className="mt-1 w-24 p-2 outline-none bg-white border border-border-grey rounded-[10px] text-[13px]"
                />
              </div>
              <div>
                <label className="font-inter text-[12px] font-bold">Discount</label>
                <input
                  type="number"
                  min={0}
                  value={discount}
                  onChange={(e) => setDiscount(Number(e.target.value))}
                  className="mt-1 w-24 p-2 outline-none bg-white border border-border-grey rounded-[10px] text-[13px]"
                />
              </div>
            </div>

            <p className="text-[12px] text-muted-green">Running subtotal: {runningTotal.toFixed(2)}</p>

            <button
              type="submit"
              disabled={creating}
              className="bg-accent text-white rounded-[10px] px-4 py-2.5 text-[13px] disabled:opacity-60"
            >
              {creating ? "Generating…" : "Generate Invoice"}
            </button>
          </form>
        </section>

        {/* Invoice lookup + detail */}
        <section className={card}>
          <h2 className={sectionTitle}>
            <FontAwesomeIcon icon={faMagnifyingGlass} /> Invoice Lookup
          </h2>
          <div className="mt-4 flex gap-2">
            <input
              placeholder="Invoice ID"
              value={lookupId}
              onChange={(e) => setLookupId(e.target.value)}
              className="flex-1 p-2.5 outline-none bg-white border border-border-grey rounded-[10px] text-[13px]"
            />
            <button
              onClick={() => lookupId && loadInvoiceAndLedger(lookupId)}
              disabled={loadingInvoice}
              className="border border-border-grey rounded-[10px] px-4 py-2 text-[13px] disabled:opacity-60"
            >
              Load
            </button>
          </div>

          {invoice && (
            <div className="mt-5 space-y-3">
              <table className="w-full text-[12px]">
                <thead>
                  <tr className="text-left text-muted-green border-b border-border-grey">
                    <th className="py-1">Item</th>
                    <th className="py-1 text-right">Qty</th>
                    <th className="py-1 text-right">Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {invoice.items.map((it, i) => (
                    <tr key={i} className="border-b border-border-grey/60">
                      <td className="py-1">{it.description}</td>
                      <td className="py-1 text-right">{it.quantity}</td>
                      <td className="py-1 text-right">{it.amount.toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>

              <div className="text-[12px] space-y-1">
                <div className="flex justify-between"><span>Subtotal</span><span>{invoice.subtotal.toFixed(2)}</span></div>
                <div className="flex justify-between"><span>Tax ({invoice.taxRate}%)</span><span>{invoice.taxAmount.toFixed(2)}</span></div>
                <div className="flex justify-between"><span>Discount</span><span>-{invoice.discount.toFixed(2)}</span></div>
                <div className="flex justify-between font-bold border-t border-border-grey pt-1"><span>Total</span><span>{invoice.totalAmount.toFixed(2)}</span></div>
                <div className="flex justify-between"><span>Paid</span><span>{invoice.amountPaid.toFixed(2)}</span></div>
                <div className="flex justify-between font-bold"><span>Balance due</span><span>{invoice.balanceDue.toFixed(2)}</span></div>
              </div>

              <span className="inline-block text-[11px] px-2 py-0.5 rounded-full bg-border-grey/60">{invoice.status}</span>

              <div className="flex flex-wrap gap-2 pt-2">
                <button onClick={handleDownloadReceipt} className="flex items-center gap-2 border border-border-grey rounded-[10px] px-3 py-2 text-[12px]">
                  <FontAwesomeIcon icon={faDownload} /> Receipt PDF
                </button>
              </div>

              {/* F-7.2 installment plan */}
              <div className="border-t border-border-grey pt-3 mt-3">
                <h3 className="font-bold text-[13px] flex items-center gap-2">
                  <FontAwesomeIcon icon={faLayerGroup} /> Instalment Ledger
                </h3>
                {!plan ? (
                  <div className="flex items-center gap-2 mt-2">
                    <input
                      type="number"
                      min={2}
                      value={numberOfInstallments}
                      onChange={(e) => setNumberOfInstallments(Number(e.target.value))}
                      className="w-20 p-2 outline-none bg-white border border-border-grey rounded-[8px] text-[12px]"
                    />
                    <button
                      onClick={handleCreateInstallmentPlan}
                      disabled={planLoading}
                      className="border border-border-grey rounded-[10px] px-3 py-2 text-[12px] disabled:opacity-60"
                    >
                      Split into instalments
                    </button>
                  </div>
                ) : (
                  <div className="mt-2 space-y-2">
                    <ul className="text-[12px] space-y-1">
                      {plan.schedule.map((s) => (
                        <li key={s.installmentNumber} className="flex justify-between">
                          <span>#{s.installmentNumber} — {s.dueAmount.toFixed(2)} ({s.dueDate})</span>
                          <span className={s.status === "PAID" ? "text-accent" : "text-muted-green"}>{s.status}</span>
                        </li>
                      ))}
                    </ul>
                    <p className="text-[12px] font-bold">Outstanding: {plan.outstandingBalance.toFixed(2)}</p>
                    {plan.outstandingBalance > 0 && (
                      <button
                        onClick={handlePayInstallment}
                        disabled={planLoading}
                        className="flex items-center gap-2 bg-accent text-white rounded-[10px] px-3 py-2 text-[12px] disabled:opacity-60"
                      >
                        <FontAwesomeIcon icon={faMoneyBillWave} /> Record next payment (cash)
                      </button>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
