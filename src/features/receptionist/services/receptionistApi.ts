import { apiFetch } from "../../../lib/api/http";
import type {
  AvailableSlot,
  PatientBilling,
  PatientSummary,
  ReceptionistAppointment,
  VisitPurpose,
} from "../types/receptionist";

const BASE = "/api/receptionist";

// ---------------------------------------------------------------------------
// Patients
// ---------------------------------------------------------------------------

export function getAllPatients() {
  return apiFetch<{ success: boolean; data: PatientSummary[] }>(`${BASE}/patients`);
}

export function searchPatients(query: string) {
  return apiFetch<{ success: boolean; data: PatientSummary[] }>(
    `${BASE}/patients/search?q=${encodeURIComponent(query)}`,
  );
}

export interface AddPatientPayload {
  name: string;
  nic: string;
  phone?: string;
  email: string;
  password: string;
}

export function addPatient(payload: AddPatientPayload) {
  return apiFetch<{ success: boolean; message: string; newPatient: PatientSummary }>(
    `${BASE}/patient`,
    { method: "POST", body: payload },
  );
}

export function updatePatient(patientId: string, payload: Partial<AddPatientPayload>) {
  return apiFetch<{ success: boolean; updated: PatientSummary }>(
    `${BASE}/patient/${patientId}`,
    { method: "PATCH", body: payload },
  );
}

export function deletePatient(patientId: string) {
  return apiFetch<{ success: boolean; message: string }>(`${BASE}/patient/${patientId}`, {
    method: "DELETE",
  });
}

// ---------------------------------------------------------------------------
// Appointments & queue
// ---------------------------------------------------------------------------

export function getTodayAppointments(date?: string) {
  const qs = date ? `?date=${date}` : "";
  return apiFetch<{ success: boolean; data: ReceptionistAppointment[] }>(
    `${BASE}/today${qs}`,
  );
}

export function getQueue(date?: string) {
  const qs = date ? `?date=${date}` : "";
  return apiFetch<{ success: boolean; data: ReceptionistAppointment[] }>(
    `${BASE}/queue${qs}`,
  );
}

export function checkInAppointment(appointmentId: string) {
  return apiFetch<{
    success: boolean;
    message: string;
    tokenNumber: number;
    appointment: ReceptionistAppointment;
  }>(`${BASE}/check-in/${appointmentId}`, { method: "PATCH" });
}

export interface BookForPatientPayload {
  patientId: string;
  appointmentDate: string;
  startTime: string;
  type?: string;
  visitPurpose?: VisitPurpose;
}

export function bookAppointmentForPatient(payload: BookForPatientPayload) {
  return apiFetch<{ success: boolean; message: string; appointment: ReceptionistAppointment }>(
    `${BASE}/book-appointment`,
    { method: "POST", body: payload },
  );
}

export interface WalkInPayload {
  name: string;
  phone: string;
  nic: string;
  appointmentDate?: string;
  startTime?: string;
  endTime?: string;
  age?: number;
  gender?: string;
  address?: string;
}

export function generateWalkInToken(payload: WalkInPayload) {
  return apiFetch<{
    success: boolean;
    message: string;
    token: string;
    walkInAppointment: ReceptionistAppointment;
    patient: PatientSummary;
  }>(`${BASE}/walk-in`, { method: "POST", body: payload });
}

export function getAvailableSlots(date: string) {
  return apiFetch<{ success: boolean; date: string; slots: AvailableSlot[]; message?: string }>(
    `/api/appointments/available-slots?date=${date}`,
  );
}

// ---------------------------------------------------------------------------
// Billing
// ---------------------------------------------------------------------------

export function getPatientBilling(patientId: string) {
  return apiFetch<PatientBilling & { success: boolean }>(
    `${BASE}/patients/${patientId}/billing`,
  );
}

export interface RecordPaymentPayload {
  amount: number;
  method: "CASH" | "CARD" | "BANK_TRANSFER" | "ONLINE" | "OTHER";
  notes?: string;
}

export function recordPayment(
  patientId: string,
  invoiceId: string,
  payload: RecordPaymentPayload,
) {
  return apiFetch<{ success: boolean; message: string }>(
    `${BASE}/patients/${patientId}/invoices/${invoiceId}/payments`,
    { method: "POST", body: payload },
  );
}

const parseErrorMessage = (
  json: unknown,
  fallback: string,
): string => {
  if (
    typeof json === 'object' &&
    json !== null &&
    'message' in json &&
    typeof json.message === 'string'
  ) {
    return json.message;
  }

  if (
    typeof json === 'object' &&
    json !== null &&
    'error' in json &&
    typeof json.error === 'string'
  ) {
    return json.error;
  }

  return fallback;
};

export const receptionistApi = {

  /**
   * Get the queue for a selected date.
   */
  getQueue: async (
    date?: string,
  ): Promise<TokenItem[]> => {
    const targetDate =
      date ||
      new Date()
        .toISOString()
        .split('T')[0];

    const response =
      await fetch(
        `${API_BASE_URL}/receptionist/queue?date=${encodeURIComponent(
          targetDate,
        )}`,
        {
          method: 'GET',
          headers:
            getAuthHeaders(),
        },
      );

    const json: unknown =
      await response.json();

    if (!response.ok) {
      throw new Error(
        parseErrorMessage(
          json,
          'Failed to fetch queue.',
        ),
      );
    }

    if (
      typeof json === 'object' &&
      json !== null &&
      'data' in json &&
      Array.isArray(
        json.data,
      )
    ) {
      return json.data as TokenItem[];
    }

    if (
      Array.isArray(json)
    ) {
      return json as TokenItem[];
    }

    return [];
  },

  /**
   * Get appointments for the
   * selected date.
   */
  getAppointments: async (
    date?: string,
  ): Promise<AppointmentItem[]> => {
    const targetDate =
      date ||
      new Date()
        .toISOString()
        .split('T')[0];

    const response =
      await fetch(
        `${API_BASE_URL}/receptionist/today?date=${encodeURIComponent(
          targetDate,
        )}`,
        {
          method: 'GET',
          headers:
            getAuthHeaders(),
        },
      );

    const json: unknown =
      await response.json();

    if (!response.ok) {
      throw new Error(
        parseErrorMessage(
          json,
          'Failed to fetch appointments.',
        ),
      );
    }

    if (
      typeof json === 'object' &&
      json !== null &&
      'data' in json &&
      Array.isArray(
        json.data,
      )
    ) {
      return json.data as AppointmentItem[];
    }

    if (
      Array.isArray(json)
    ) {
      return json as AppointmentItem[];
    }

    return [];
  },

  /**
   * Get all registered patients.
   */
  getPatients: async (): Promise<
    PatientRecord[]
  > => {
    const response =
      await fetch(
        `${API_BASE_URL}/receptionist/patients`,
        {
          method: 'GET',
          headers:
            getAuthHeaders(),
        },
      );

    const json: unknown =
      await response.json();

    if (!response.ok) {
      throw new Error(
        parseErrorMessage(
          json,
          'Failed to fetch patients.',
        ),
      );
    }

    if (
      typeof json === 'object' &&
      json !== null &&
      'data' in json &&
      Array.isArray(
        json.data,
      )
    ) {
      return json.data as PatientRecord[];
    }

    if (
      Array.isArray(json)
    ) {
      return json as PatientRecord[];
    }

    return [];
  },

  /**
   * ==========================================================
   * SCENARIO 3
   * ==========================================================
   *
   * Get available appointment slots
   * for a selected date.
   */
  getAvailableSlots:
    async (
      date: string,
    ): Promise<AvailableSlotsResponse> => {
      const response =
        await fetch(
          `${API_BASE_URL}/appointments/availale-slots?date=${encodeURIComponent(
            date,
          )}`,
          {
            method: 'GET',
            headers:
              getAuthHeaders(),
          },
        );

      const json: unknown =
        await response.json();

      if (!response.ok) {
        throw new Error(
          parseErrorMessage(
            json,
            'Failed to load available appointment slots.',
          ),
        );
      }

      if (
        typeof json !== 'object' ||
        json === null
      ) {
        throw new Error(
          'Invalid appointment slot response.',
        );
      }

      const responseData =
        json as Partial<AvailableSlotsResponse>;

      return {
        date:
          responseData.date ||
          date,

        slots:
          Array.isArray(
            responseData.slots,
          )
            ? responseData.slots
            : [],

        message:
          responseData.message,
      };
    },

  /**
   * ==========================================================
   * SCENARIO 3
   * ==========================================================
   *
   * Create an appointment for
   * an existing patient account.
   */
  bookAppointmentForPatient:
    async (
      patientId: string,
      appointmentDate: string,
      startTime: string,
    ): Promise<AppointmentItem> => {
      const response =
        await fetch(
          `${API_BASE_URL}/receptionist/book-appointment`,
          {
            method: 'POST',
            headers:
              getAuthHeaders(),

            body: JSON.stringify({
              patientId,
              appointmentDate,
              startTime,
            }),
          },
        );

      const json: unknown =
        await response.json();

      if (!response.ok) {
        throw new Error(
          parseErrorMessage(
            json,
            'Failed to make the appointment.',
          ),
        );
      }

      const data =
        json as AppointmentResponse;

      if (!data.appointment) {
        throw new Error(
          'The appointment was created, but the server did not return the appointment.',
        );
      }

      return data.appointment;
    },

  /**
   * Check in an existing
   * booked appointment.
   */
  markArrived: async (
    appointmentId: string,
  ): Promise<{
    appointment: AppointmentItem;
    tokenNumber: number;
  }> => {
    const response =
      await fetch(
        `${API_BASE_URL}/receptionist/check-in/${appointmentId}`,
        {
          method: 'PATCH',
          headers:
            getAuthHeaders(),
        },
      );

    const json: unknown =
      await response.json();

    if (!response.ok) {
      throw new Error(
        parseErrorMessage(
          json,
          'Failed to check in patient.',
        ),
      );
    }

    const data =
      json as AppointmentResponse;

    if (
      !data.appointment ||
      typeof data.tokenNumber !==
        'number'
    ) {
      throw new Error(
        'Invalid check-in response from server.',
      );
    }

    return {
      appointment:
        data.appointment,

      tokenNumber:
        data.tokenNumber,
    };
  },

  /**
   * ==========================================================
   * SCENARIO 4
   * ==========================================================
   *
   * Create a NEW patient account.
   */
  createPatient: async (
    patientData: PatientData,
  ): Promise<PatientRecord> => {
    const response =
      await fetch(
        `${API_BASE_URL}/receptionist/patient`,
        {
          method: 'POST',
          headers:
            getAuthHeaders(),

          body:
            JSON.stringify(
              patientData,
            ),
        },
      );

    const json: unknown =
      await response.json();

    if (!response.ok) {
      throw new Error(
        parseErrorMessage(
          json,
          'Failed to create patient account.',
        ),
      );
    }

    if (
      typeof json === 'object' &&
      json !== null &&
      'newPatient' in json &&
      json.newPatient
    ) {
      return json.newPatient as PatientRecord;
    }

    if (
      typeof json === 'object' &&
      json !== null &&
      'data' in json &&
      json.data
    ) {
      return json.data as PatientRecord;
    }

    throw new Error(
      'Patient account was created, but the server did not return the patient record.',
    );
  },

  /**
   * Update a patient account.
   */
  updatePatient: async (
    patientId: string,
    patientData: PatientData,
  ): Promise<PatientRecord> => {
    const response =
      await fetch(
        `${API_BASE_URL}/receptionist/patient/${patientId}`,
        {
          method: 'PATCH',
          headers:
            getAuthHeaders(),

          body:
            JSON.stringify(
              patientData,
            ),
        },
      );

    const json: unknown =
      await response.json();

    if (!response.ok) {
      throw new Error(
        parseErrorMessage(
          json,
          'Failed to update patient account.',
        ),
      );
    }

    if (
      typeof json === 'object' &&
      json !== null &&
      'updated' in json &&
      json.updated
    ) {
      return json.updated as PatientRecord;
    }

    throw new Error(
      'Patient was updated, but the server did not return the updated patient record.',
    );
  },

  /**
   * Delete a patient account.
   */
  deletePatient: async (
    patientId: string,
  ): Promise<void> => {
    const response =
      await fetch(
        `${API_BASE_URL}/receptionist/patient/${patientId}`,
        {
          method: 'DELETE',
          headers:
            getAuthHeaders(),
        },
      );

    const json: unknown =
      await response.json();

    if (!response.ok) {
      throw new Error(
        parseErrorMessage(
          json,
          'Failed to delete patient account.',
        ),
      );
    }
  },

  /**
   * Existing walk-in functionality.
   */
  createWalkInToken:
    async (
      tokenData: {
        patientName: string;
        phone?: string;
        isEmergency: boolean;
      },
    ): Promise<TokenItem> => {
      const response =
        await fetch(
          `${API_BASE_URL}/receptionist/walk-in`,
          {
            method: 'POST',
            headers:
              getAuthHeaders(),

            body:
              JSON.stringify(
                tokenData,
              ),
          },
        );

      const json: unknown =
        await response.json();

      if (!response.ok) {
        throw new Error(
          parseErrorMessage(
            json,
            'Failed to create walk-in token.',
          ),
        );
      }

      const data =
        json as {
          token?: string | number;
          data?: TokenItem;
        };

      if (data.data) {
        return data.data;
      }

      return {
        id: '',

        tokenNumber:
          typeof data.token === 'number'
            ? data.token
            : Number.parseInt(
                String(
                  data.token ||
                    '0',
                ).replace(
                  /\D/g,
                  '',
                ),
                10,
              ),

        patientName:
          tokenData.patientName,

        phone:
          tokenData.phone,

        status:
          'BOOKED',

        isEmergency:
          tokenData.isEmergency,

        appointmentType:
          'Walk-in',

        createdAt:
          new Date().toISOString(),
      };
    },

  /**
   * Existing token status method.
   */
  updateTokenStatus:
    async (
      tokenId: string,
      status: string,
    ): Promise<TokenItem> => {
      const response =
        await fetch(
          `${API_BASE_URL}/receptionist/token/${tokenId}/status`,
          {
            method: 'PATCH',
            headers:
              getAuthHeaders(),

            body:
              JSON.stringify({
                status,
              }),
          },
        );

      const json: unknown =
        await response.json();

      if (!response.ok) {
        throw new Error(
          parseErrorMessage(
            json,
            'Failed to update token status.',
          ),
        );
      }

      if (
        typeof json === 'object' &&
        json !== null &&
        'data' in json &&
        json.data
      ) {
        return json.data as TokenItem;
      }

      return json as TokenItem;
    },
};