import { apiFetch, apiFetchBlob } from "../../../lib/utils/apiFetch";
import type { Invoice, InvoiceItem, InstallmentPlan, Payment } from "../types/billing";

// F-7.1: Invoice & Receipt Generator
export interface CreateInvoicePayload {
  patientId: string;
  appointmentId?: string;
  treatmentRecordId?: string;
  items: Pick<InvoiceItem, "description" | "quantity" | "unitPrice">[];
  taxRate?: number;
  discount?: number;
}

export async function createInvoice(payload: CreateInvoicePayload) {
  return apiFetch<{ success: boolean; invoice: Invoice }>("/billing/invoice", { method: "POST", body: payload });
}

export async function getInvoice(id: string) {
  return apiFetch<{ success: boolean; invoice: Invoice }>(`/billing/invoice/${id}`);
}

export async function listPatientInvoices(patientId: string) {
  return apiFetch<{ success: boolean; count: number; invoices: Invoice[] }>(`/billing/patient/${patientId}/invoices`);
}

export async function downloadReceipt(id: string) {
  return apiFetchBlob(`/billing/invoice/${id}/receipt`);
}

// F-7.2: Instalment Ledger Tracker
export async function createInstallmentPlan(invoiceId: string, numberOfInstallments: number) {
  return apiFetch<{ success: boolean; plan: InstallmentPlan }>("/billing/installment-plan", {
    method: "POST",
    body: { invoiceId, numberOfInstallments },
  });
}

export async function payInstallment(planId: string, method: Payment["method"] = "CASH", installmentNumber?: number) {
  return apiFetch<{ success: boolean; plan: InstallmentPlan; payment: Payment }>(
    `/billing/installment-plan/${planId}/pay`,
    { method: "POST", body: { method, installmentNumber } },
  );
}

export async function getLedger(invoiceId: string) {
  return apiFetch<{ success: boolean; plan: InstallmentPlan }>(`/billing/installment-plan/invoice/${invoiceId}`);
}

// F-7.3: Payment Gateway Integration (Extra, mocked)
export async function payViaGateway(invoiceId: string, amount: number, method: "CARD" | "QR") {
  return apiFetch<{ success: boolean; message: string; payment: Payment; invoice: Invoice }>("/billing/pay/gateway", {
    method: "POST",
    body: { invoiceId, amount, method },
  });
}
