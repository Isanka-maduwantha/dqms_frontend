export interface InvoiceItem {
  description: string;
  quantity: number;
  unitPrice: number;
  amount: number;
}

export type InvoiceStatus = "UNPAID" | "PARTIALLY_PAID" | "PAID";

export interface Invoice {
  _id: string;
  patientId: string;
  appointmentId?: string;
  treatmentRecordId?: string;
  items: InvoiceItem[];
  subtotal: number;
  taxRate: number;
  taxAmount: number;
  discount: number;
  totalAmount: number;
  amountPaid: number;
  balanceDue: number;
  status: InvoiceStatus;
  issuedDate: string;
}

export interface InstallmentEntry {
  installmentNumber: number;
  dueAmount: number;
  dueDate?: string;
  status: "PENDING" | "PAID";
  paidDate?: string;
  paymentId?: string;
}

export interface InstallmentPlan {
  _id: string;
  invoiceId: string;
  patientId: string;
  totalAmount: number;
  numberOfInstallments: number;
  schedule: InstallmentEntry[];
  outstandingBalance: number;
}

export interface Payment {
  _id: string;
  invoiceId: string;
  patientId: string;
  amount: number;
  method: "CASH" | "CARD" | "QR" | "GATEWAY";
  status: "SUCCESS" | "FAILED" | "PENDING";
  transactionRef?: string;
  paidAt: string;
}
