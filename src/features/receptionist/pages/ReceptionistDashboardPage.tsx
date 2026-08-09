import React, {
  useCallback,
  useEffect,
  useState,
} from 'react';

import {
  receptionistApi,
} from '../services/receptionistApi';

import type {
  AppointmentItem,
  AvailableSlot,
  PatientData,
  PatientRecord,
  TokenItem,
} from '../services/receptionistApi';

export const ReceptionistDashboardPage: React.FC = () => {
  const getTodayDateString = (): string =>
    new Date().toISOString().split('T')[0];

  // ==========================================================
  // GENERAL DASHBOARD STATE
  // ==========================================================

  const [queue, setQueue] =
    useState<TokenItem[]>([]);

  const [appointments, setAppointments] =
    useState<AppointmentItem[]>([]);

  const [patients, setPatients] =
    useState<PatientRecord[]>([]);

  const [selectedDate, setSelectedDate] =
    useState<string>(
      getTodayDateString(),
    );

  const [loading, setLoading] =
    useState<boolean>(true);

  const [error, setError] =
    useState<string | null>(null);

  // ==========================================================
  // SCENARIO 4 - PATIENT REGISTRATION
  //
  // Full Name
  // NIC
  // Phone
  // Gmail
  // Password
  //
  // NO AGE
  // NO GENDER
  // NO ADDRESS
  // ==========================================================

  const [selectedPatientId, setSelectedPatientId] =
    useState<string | null>(null);

  const [formData, setFormData] =
    useState<PatientData>({
      patientName: '',
      phone: '',
      nic: '',
      email: '',
      password: '',
    });

  const [searchQuery, setSearchQuery] =
    useState('');

  const [isEmergency, setIsEmergency] =
    useState(false);

  const [submitting, setSubmitting] =
    useState(false);

  // ==========================================================
  // SCENARIO 3 - RESERVATION
  // ==========================================================

  const [reservationSearch, setReservationSearch] =
    useState('');

  const [reservationPatient, setReservationPatient] =
    useState<PatientRecord | null>(null);

  const [reservationDate, setReservationDate] =
    useState<string>(
      getTodayDateString(),
    );

  const [availableSlots, setAvailableSlots] =
    useState<AvailableSlot[]>([]);

  const [selectedSlot, setSelectedSlot] =
    useState<string | null>(null);

  const [slotsLoading, setSlotsLoading] =
    useState(false);

  const [reservationLoading, setReservationLoading] =
    useState(false);

  const [reservationMessage, setReservationMessage] =
    useState<string | null>(null);

  // ==========================================================
  // SCENARIO 2
  // ==========================================================

  const [checkingInId, setCheckingInId] =
    useState<string | null>(null);

  // ==========================================================
  // LOAD DASHBOARD DATA
  // ==========================================================

  const fetchData =
    useCallback(async () => {
      try {
        setLoading(true);

        const [
          queueResult,
          appointmentResult,
          patientResult,
        ] = await Promise.all([
          receptionistApi.getQueue(
            selectedDate,
          ),

          receptionistApi.getAppointments(
            selectedDate,
          ),

          receptionistApi.getPatients(),
        ]);

        setQueue(queueResult);
        setAppointments(
          appointmentResult,
        );
        setPatients(patientResult);
        setError(null);
      } catch (
        requestError: unknown
      ) {
        setError(
          requestError instanceof Error
            ? requestError.message
            : 'Failed to load dashboard data from server.',
        );
      } finally {
        setLoading(false);
      }
    }, [selectedDate]);

  useEffect(() => {
    void fetchData();

    const interval =
      setInterval(() => {
        void fetchData();
      }, 15000);

    return () =>
      clearInterval(interval);
  }, [fetchData]);

  // ==========================================================
  // SCENARIO 3 - LOAD AVAILABLE SLOTS
  // ==========================================================

  const loadAvailableSlots =
    useCallback(
      async (date: string) => {
        try {
          setSlotsLoading(true);
          setReservationMessage(null);
          setSelectedSlot(null);

          const result =
            await receptionistApi.getAvailableSlots(
              date,
            );

          setAvailableSlots(
            result.slots,
          );

          if (result.message) {
            setReservationMessage(
              result.message,
            );
          }
        } catch (
          requestError: unknown
        ) {
          setAvailableSlots([]);

          setReservationMessage(
            requestError instanceof Error
              ? requestError.message
              : 'Failed to load available time slots.',
          );
        } finally {
          setSlotsLoading(false);
        }
      },
      [],
    );

  useEffect(() => {
    void loadAvailableSlots(
      reservationDate,
    );
  }, [
    reservationDate,
    loadAvailableSlots,
  ]);

  // ==========================================================
  // SCENARIO 4 - FORM INPUT
  // ==========================================================

  const handleInputChange =
    (
      event:
        React.ChangeEvent<
          HTMLInputElement |
          HTMLSelectElement |
          HTMLTextAreaElement
        >,
    ) => {
      const {
        name,
        value,
      } = event.target;

      setFormData(
        previous => ({
          ...previous,
          [name]: value,
        }),
      );
    };

  // ==========================================================
  // SCENARIO 4 - CREATE / UPDATE PATIENT
  // ==========================================================

  const handlePatientSubmit =
    async (
      event:
        React.FormEvent<HTMLFormElement>,
    ) => {
      event.preventDefault();

      const patientName =
        formData.patientName.trim();

      const nic =
        formData.nic.trim();

      const phone =
        formData.phone.trim();

      const email =
        formData.email
          .trim()
          .toLowerCase();

      const password =
        formData.password;

      // Full Name
      if (!patientName) {
        setError(
          'Patient full name is required.',
        );
        return;
      }

      // NIC
      if (!nic) {
        setError(
          'NIC is required.',
        );
        return;
      }

      // Gmail
      if (!email) {
        setError(
          'Gmail address is required.',
        );
        return;
      }

      if (
        !email.endsWith('@gmail.com')
      ) {
        setError(
          'Please enter a valid Gmail address.',
        );
        return;
      }

      // Password is required for NEW accounts.
      if (
        !selectedPatientId &&
        password.length < 8
      ) {
        setError(
          'Password must be at least 8 characters long.',
        );
        return;
      }

      try {
        setSubmitting(true);
        setError(null);
        setReservationMessage(null);

        const dataToSend: PatientData = {
          patientName,
          phone,
          nic,
          email,
          password,
        };

        // ====================================================
        // UPDATE EXISTING PATIENT
        // ====================================================

        if (selectedPatientId) {
          const updatedPatient =
            await receptionistApi.updatePatient(
              selectedPatientId,
              dataToSend,
            );

          /*
           * If the receptionist was editing the patient
           * currently selected for Scenario 3, keep the
           * reservation patient updated.
           */
          if (
            reservationPatient &&
            (
              reservationPatient._id ===
                selectedPatientId ||
              reservationPatient.id ===
                selectedPatientId
            )
          ) {
            setReservationPatient(
              updatedPatient,
            );
          }

          setReservationMessage(
            `Patient account updated successfully for ${
              updatedPatient.name ||
              updatedPatient.patientName ||
              patientName
            }.`,
          );
        }

        // ====================================================
        // CREATE NEW PATIENT
        // ====================================================

        else {
          const createdPatient =
            await receptionistApi.createPatient(
              dataToSend,
            );

          /*
           * IMPORTANT:
           *
           * Scenario 4 immediately passes the newly
           * created patient into Scenario 3.
           */
          setReservationPatient(
            createdPatient,
          );

          setReservationSearch(
            createdPatient.name ||
              createdPatient.patientName ||
              patientName,
          );

          setSelectedSlot(null);

          setReservationMessage(
            `Patient account created successfully for ${
              createdPatient.name ||
              createdPatient.patientName ||
              patientName
            }. Please select an appointment date and available time slot.`,
          );
        }

        // Clear registration form.
        setFormData({
          patientName: '',
          phone: '',
          nic: '',
          email: '',
          password: '',
        });

        setSelectedPatientId(null);

        // Refresh directory.
        await fetchData();
      } catch (
        requestError: unknown
      ) {
        setError(
          requestError instanceof Error
            ? requestError.message
            : 'Failed to save patient account.',
        );
      } finally {
        setSubmitting(false);
      }
    };

  // ==========================================================
  // SCENARIO 4 - EDIT PATIENT
  // ==========================================================

  const handleEditPatient =
    (
      patient: PatientRecord,
    ) => {
      const id =
        patient.id ||
        patient._id;

      if (!id) {
        setError(
          'Patient ID is missing.',
        );
        return;
      }

      setSelectedPatientId(id);

      setFormData({
        patientName:
          patient.patientName ||
          patient.name ||
          '',

        phone:
          patient.phone ||
          '',

        nic:
          patient.nic ||
          '',

        email:
          patient.email ||
          '',

        /*
         * Password is intentionally blank.
         *
         * The backend stores passwordHash and
         * never sends the real password back.
         */
        password: '',
      });

      setError(null);
      setReservationMessage(null);
    };

  // ==========================================================
  // SCENARIO 4 - DELETE PATIENT
  // ==========================================================

  const handleDeletePatient =
    async (
      patientId: string,
    ) => {
      const confirmed =
        window.confirm(
          'Are you sure you want to delete this patient account?',
        );

      if (!confirmed) {
        return;
      }

      try {
        setError(null);

        await receptionistApi.deletePatient(
          patientId,
        );

        /*
         * If deleted patient was selected in Scenario 3,
         * clear that selection.
         */
        if (
          reservationPatient &&
          (
            reservationPatient._id ===
              patientId ||
            reservationPatient.id ===
              patientId
          )
        ) {
          setReservationPatient(null);
          setReservationSearch('');
          setSelectedSlot(null);
        }

        await fetchData();
      } catch (
        requestError: unknown
      ) {
        setError(
          requestError instanceof Error
            ? requestError.message
            : 'Failed to delete patient account.',
        );
      }
    };

  // ==========================================================
  // WALK-IN TOKEN
  // ==========================================================

  const handleIssueToken =
    async (
      patient: PatientRecord,
    ) => {
      try {
        setError(null);

        await receptionistApi.createWalkInToken(
          {
            patientName:
              patient.patientName ||
              patient.name ||
              '',

            phone:
              patient.phone,

            isEmergency,
          },
        );

        setIsEmergency(false);

        await fetchData();
      } catch (
        requestError: unknown
      ) {
        setError(
          requestError instanceof Error
            ? requestError.message
            : 'Failed to generate token.',
        );
      }
    };

  // ==========================================================
  // SCENARIO 2 - CHECK IN
  // ==========================================================

  const handleCheckIn =
    async (
      appointmentId: string,
    ) => {
      try {
        setCheckingInId(
          appointmentId,
        );

        setError(null);

        const result =
          await receptionistApi.markArrived(
            appointmentId,
          );

        window.alert(
          `Patient checked in successfully.\nToken Number: ${result.tokenNumber}`,
        );

        await fetchData();
      } catch (
        requestError: unknown
      ) {
        setError(
          requestError instanceof Error
            ? requestError.message
            : 'Failed to check in patient.',
        );
      } finally {
        setCheckingInId(null);
      }
    };

  // ==========================================================
  // QUEUE STATUS
  // ==========================================================

  const handleStatusChange =
    async (
      tokenId: string,
      newStatus: string,
    ) => {
      try {
        setError(null);

        await receptionistApi.updateTokenStatus(
          tokenId,
          newStatus,
        );

        await fetchData();
      } catch (
        requestError: unknown
      ) {
        setError(
          requestError instanceof Error
            ? requestError.message
            : 'Failed to update token status.',
        );
      }
    };

  // ==========================================================
  // SCENARIO 3 - SEARCH PATIENT
  // ==========================================================

  const reservationPatients =
    patients.filter(
      patient => {
        const query =
          reservationSearch
            .trim()
            .toLowerCase();

        if (!query) {
          return false;
        }

        const name =
          (
            patient.name ||
            patient.patientName ||
            ''
          ).toLowerCase();

        const email =
          (
            patient.email ||
            ''
          ).toLowerCase();

        const nic =
          (
            patient.nic ||
            ''
          ).toLowerCase();

        return (
          name.includes(query) ||
          email.includes(query) ||
          nic.includes(query)
        );
      },
    );

  // ==========================================================
  // SCENARIO 3 - SELECT PATIENT
  // ==========================================================

  const handleReservationPatientSelect =
    (
      patient: PatientRecord,
    ) => {
      setReservationPatient(
        patient,
      );

      setReservationSearch(
        patient.name ||
          patient.patientName ||
          '',
      );

      setReservationMessage(
        null,
      );

      setSelectedSlot(null);
    };

  // ==========================================================
  // SCENARIO 3 - MAKE RESERVATION
  // ==========================================================

  const handleMakeReservation =
    async () => {
      if (!reservationPatient) {
        setReservationMessage(
          'Please select a patient first.',
        );
        return;
      }

      const patientId =
        reservationPatient._id ||
        reservationPatient.id;

      if (!patientId) {
        setReservationMessage(
          'Selected patient does not have a valid ID.',
        );
        return;
      }

      if (!reservationDate) {
        setReservationMessage(
          'Please select an appointment date.',
        );
        return;
      }

      if (!selectedSlot) {
        setReservationMessage(
          'Please select an available time slot.',
        );
        return;
      }

      try {
        setReservationLoading(
          true,
        );

        setReservationMessage(
          null,
        );

        await receptionistApi.bookAppointmentForPatient(
          patientId,
          reservationDate,
          selectedSlot,
        );

        setReservationMessage(
          `Appointment successfully reserved for ${
            reservationPatient.name ||
            reservationPatient.patientName ||
            'the patient'
          } at ${selectedSlot} on ${reservationDate}.`,
        );

        setSelectedSlot(null);

        if (
          reservationDate ===
          selectedDate
        ) {
          await fetchData();
        }

        await loadAvailableSlots(
          reservationDate,
        );
      } catch (
        requestError: unknown
      ) {
        setReservationMessage(
          requestError instanceof Error
            ? requestError.message
            : 'Failed to make reservation.',
        );
      } finally {
        setReservationLoading(
          false,
        );
      }
    };

  // ==========================================================
  // PATIENT DIRECTORY SEARCH
  // ==========================================================

  const filteredPatients =
    patients.filter(
      patient => {
        const query =
          searchQuery
            .trim()
            .toLowerCase();

        if (!query) {
          return true;
        }

        const name =
          (
            patient.patientName ||
            patient.name ||
            ''
          ).toLowerCase();

        const email =
          (
            patient.email ||
            ''
          ).toLowerCase();

        const nic =
          (
            patient.nic ||
            ''
          ).toLowerCase();

        return (
          name.includes(query) ||
          email.includes(query) ||
          nic.includes(query)
        );
      },
    );

  // ==========================================================
  // QUEUE SEARCH
  // ==========================================================

  const filteredQueue =
    queue.filter(
      item => {
        const query =
          searchQuery
            .trim()
            .toLowerCase();

        if (!query) {
          return true;
        }

        return item.patientName
          .toLowerCase()
          .includes(query);
      },
    );

  // ==========================================================
  // APPOINTMENT PATIENT HELPERS
  // ==========================================================

  const getPatientName =
    (
      appointment: AppointmentItem,
    ): string => {
      if (
        typeof appointment.patientId ===
          'object' &&
        appointment.patientId !==
          null
      ) {
        return (
          appointment.patientId.name ||
          'Unknown patient'
        );
      }

      return 'Unknown patient';
    };

  const getPatientPhone =
    (
      appointment: AppointmentItem,
    ): string => {
      if (
        typeof appointment.patientId ===
          'object' &&
        appointment.patientId !==
          null
      ) {
        return (
          appointment.patientId.phone ||
          'N/A'
        );
      }

      return 'N/A';
    };

  // ==========================================================
  // UI
  // ==========================================================

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">

        {/* ==================================================
            HEADER
        ================================================== */}

        <header className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            Receptionist Dashboard
          </h1>

          <p className="text-gray-600">
            Patient registration, reservations,
            appointment schedules and live queue.
          </p>
        </header>

        {/* ==================================================
            GLOBAL ERROR
        ================================================== */}

        {error && (
          <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg">
            {error}
          </div>
        )}

        {/* ==================================================
            SCENARIO 3
            EXISTING PATIENT RESERVATION
        ================================================== */}

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 mb-8">

          <div className="mb-6">
            <h2 className="text-xl font-semibold text-gray-800">
              Make Reservation for Existing Patient
            </h2>

            <p className="text-sm text-gray-500 mt-1">
              Search an existing patient by name,
              NIC or Gmail address, then select an
              available appointment time.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

            {/* PATIENT SEARCH */}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Search Patient
              </label>

              <input
                type="text"
                value={
                  reservationSearch
                }
                onChange={event => {
                  setReservationSearch(
                    event.target.value,
                  );

                  setReservationPatient(
                    null,
                  );

                  setReservationMessage(
                    null,
                  );
                }}
                placeholder="Search by name, NIC or Gmail..."
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />

              {reservationSearch.trim() &&
                !reservationPatient && (
                  <div className="mt-2 border border-gray-200 rounded-md max-h-52 overflow-y-auto">

                    {reservationPatients.length ===
                    0 ? (
                      <p className="p-4 text-sm text-gray-500 text-center">
                        No patient found.
                      </p>
                    ) : (
                      reservationPatients.map(
                        patient => {
                          const id =
                            patient._id ||
                            patient.id ||
                            '';

                          return (
                            <button
                              key={id}
                              type="button"
                              onClick={() =>
                                handleReservationPatientSelect(
                                  patient,
                                )
                              }
                              className="w-full text-left p-3 border-b last:border-b-0 hover:bg-indigo-50"
                            >
                              <p className="font-medium text-gray-900">
                                {patient.name ||
                                  patient.patientName ||
                                  'Unnamed patient'}
                              </p>

                              <p className="text-sm text-gray-600">
                                {patient.email ||
                                  'No Gmail address'}
                              </p>

                              <p className="text-xs text-gray-500 mt-1">
                                NIC:{' '}
                                {patient.nic ||
                                  'Not available'}
                              </p>

                              <p className="text-xs text-gray-500">
                                Phone:{' '}
                                {patient.phone ||
                                  'Not available'}
                              </p>
                            </button>
                          );
                        },
                      )
                    )}

                  </div>
                )}

              {/* SELECTED PATIENT */}

              {reservationPatient && (
                <div className="mt-4 border border-indigo-200 bg-indigo-50 rounded-lg p-4">

                  <div className="flex justify-between items-start">

                    <div>
                      <p className="text-xs uppercase font-semibold text-indigo-600">
                        Selected Patient
                      </p>

                      <p className="text-lg font-semibold text-gray-900 mt-1">
                        {reservationPatient.name ||
                          reservationPatient.patientName ||
                          'Unnamed patient'}
                      </p>

                      <p className="text-sm text-gray-700">
                        NIC:{' '}
                        {reservationPatient.nic ||
                          'Not available'}
                      </p>

                      <p className="text-sm text-gray-700">
                        Gmail:{' '}
                        {reservationPatient.email ||
                          'Not available'}
                      </p>

                      <p className="text-sm text-gray-700">
                        Phone:{' '}
                        {reservationPatient.phone ||
                          'Not available'}
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        setReservationPatient(
                          null,
                        );

                        setReservationSearch(
                          '',
                        );

                        setSelectedSlot(
                          null,
                        );
                      }}
                      className="text-sm text-red-600 font-medium hover:text-red-800"
                    >
                      Change
                    </button>

                  </div>
                </div>
              )}

            </div>

            {/* APPOINTMENT SELECTION */}

            <div>

              <label className="block text-sm font-medium text-gray-700 mb-2">
                Appointment Date
              </label>

              <input
                type="date"
                value={
                  reservationDate
                }
                min={
                  getTodayDateString()
                }
                onChange={event =>
                  setReservationDate(
                    event.target.value,
                  )
                }
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />

              <div className="mt-4">

                <div className="flex justify-between items-center mb-2">

                  <label className="block text-sm font-medium text-gray-700">
                    Available Time Slots
                  </label>

                  {slotsLoading && (
                    <span className="text-xs text-gray-500">
                      Loading...
                    </span>
                  )}

                </div>

                {!slotsLoading &&
                availableSlots.length ===
                  0 ? (
                  <div className="border border-gray-200 rounded-md p-4 text-sm text-gray-500 text-center">
                    No appointment slots are available for
                    this date.
                  </div>
                ) : (
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 max-h-60 overflow-y-auto">

                    {availableSlots.map(
                      slot => (
                        <button
                          key={
                            slot.time
                          }
                          type="button"
                          disabled={
                            !slot.available
                          }
                          onClick={() =>
                            setSelectedSlot(
                              slot.time,
                            )
                          }
                          title={
                            slot.available
                              ? 'Available'
                              : slot.reason
                          }
                          className={`p-2 rounded-md text-sm border ${
                            !slot.available
                              ? 'bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed'
                              : selectedSlot ===
                                  slot.time
                                ? 'bg-indigo-600 text-white border-indigo-600'
                                : 'bg-white text-gray-700 border-gray-300 hover:bg-indigo-50 hover:border-indigo-400'
                          }`}
                        >
                          {slot.time}
                        </button>
                      ),
                    )}

                  </div>
                )}

              </div>

              {selectedSlot && (
                <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-md">
                  <p className="text-sm text-green-800">
                    Selected time:
                    <span className="font-bold ml-1">
                      {selectedSlot}
                    </span>
                  </p>
                </div>
              )}

              <button
                type="button"
                disabled={
                  reservationLoading ||
                  !reservationPatient ||
                  !selectedSlot ||
                  slotsLoading
                }
                onClick={() =>
                  void handleMakeReservation()
                }
                className="w-full mt-4 bg-indigo-600 text-white py-2.5 px-4 rounded-md hover:bg-indigo-700 transition disabled:opacity-50 disabled:cursor-not-allowed font-medium"
              >
                {reservationLoading
                  ? 'Making Reservation...'
                  : 'Make Reservation'}
              </button>

            </div>

          </div>

          {reservationMessage && (
            <div className="mt-5 p-4 bg-blue-50 border border-blue-200 text-blue-800 rounded-lg text-sm">
              {reservationMessage}
            </div>
          )}

        </div>

        {/* ==================================================
            SCENARIO 4 + LIVE QUEUE
        ================================================== */}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">

          {/* ==================================================
              SCENARIO 4
              PATIENT REGISTRATION
          ================================================== */}

          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">

            <h2 className="text-xl font-semibold text-gray-800 mb-2">
              {selectedPatientId
                ? 'Update Patient Account'
                : 'New Patient Account'}
            </h2>

            <p className="text-sm text-gray-500 mb-5">
              Create a patient login account.
              Age, gender and address are not required.
            </p>

            <form
              onSubmit={
                handlePatientSubmit
              }
              className="space-y-4 mb-6"
            >

              {/* FULL NAME */}

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Patient Full Name *
                </label>

                <input
                  type="text"
                  name="patientName"
                  value={
                    formData.patientName
                  }
                  onChange={
                    handleInputChange
                  }
                  required
                  autoComplete="name"
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm border p-2"
                  placeholder="Enter patient's full name"
                />
              </div>

              {/* NIC */}

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  NIC *
                </label>

                <input
                  type="text"
                  name="nic"
                  value={
                    formData.nic
                  }
                  onChange={
                    handleInputChange
                  }
                  required
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm border p-2"
                  placeholder="Enter NIC"
                />
              </div>

              {/* PHONE */}

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Phone Number
                </label>

                <input
                  type="tel"
                  name="phone"
                  value={
                    formData.phone
                  }
                  onChange={
                    handleInputChange
                  }
                  autoComplete="tel"
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm border p-2"
                  placeholder="Enter phone number"
                />
              </div>

              {/* GMAIL */}

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Gmail Address *
                </label>

                <input
                  type="email"
                  name="email"
                  value={
                    formData.email
                  }
                  onChange={
                    handleInputChange
                  }
                  required
                  autoComplete="email"
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm border p-2"
                  placeholder="patient@gmail.com"
                />

                <p className="mt-1 text-xs text-gray-500">
                  The patient will use this Gmail
                  address to log in.
                </p>
              </div>

              {/* PASSWORD */}

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Password *
                </label>

                <input
                  type="password"
                  name="password"
                  value={
                    formData.password
                  }
                  onChange={
                    handleInputChange
                  }
                  required={
                    !selectedPatientId
                  }
                  minLength={8}
                  autoComplete="new-password"
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm border p-2"
                  placeholder={
                    selectedPatientId
                      ? 'Leave blank to keep current password'
                      : 'Minimum 8 characters'
                  }
                />

                <p className="mt-1 text-xs text-gray-500">
                  Minimum 8 characters.
                </p>
              </div>

              {/* BUTTONS */}

              <div className="flex gap-2 pt-2">

                <button
                  type="submit"
                  disabled={
                    submitting
                  }
                  className="flex-1 bg-indigo-600 text-white py-2 px-4 rounded-md hover:bg-indigo-700 transition disabled:opacity-50 font-medium"
                >
                  {submitting
                    ? 'Saving...'
                    : selectedPatientId
                      ? 'Update Patient Account'
                      : 'Create Patient Account'}
                </button>

                {selectedPatientId && (
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedPatientId(
                        null,
                      );

                      setFormData({
                        patientName: '',
                        phone: '',
                        nic: '',
                        email: '',
                        password: '',
                      });

                      setError(null);
                    }}
                    className="bg-gray-300 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-400 font-medium"
                  >
                    Cancel
                  </button>
                )}

              </div>

            </form>

            {/* ==================================================
                PATIENT DIRECTORY
            ================================================== */}

            <div>

              <div className="flex justify-between items-center mb-3">

                <h3 className="text-sm font-semibold text-gray-700 uppercase">
                  Patient Directory
                </h3>

                <input
                  type="text"
                  placeholder="Search name, NIC or Gmail..."
                  value={
                    searchQuery
                  }
                  onChange={event =>
                    setSearchQuery(
                      event.target.value,
                    )
                  }
                  className="border border-gray-300 rounded-md px-3 py-1 text-sm"
                />

              </div>

              <div className="max-h-60 overflow-y-auto divide-y divide-gray-200 border rounded-md">

                {filteredPatients.length ===
                0 ? (
                  <p className="p-4 text-sm text-gray-500 text-center">
                    No patient records found.
                  </p>
                ) : (
                  filteredPatients.map(
                    patient => {
                      const patientId =
                        patient.id ||
                        patient._id ||
                        '';

                      return (
                        <div
                          key={
                            patientId
                          }
                          className="p-3 flex justify-between items-center hover:bg-gray-50"
                        >

                          <div>
                            <p className="font-medium text-gray-900">
                              {patient.patientName ||
                                patient.name ||
                                'Unnamed patient'}
                            </p>

                            <p className="text-xs text-gray-500">
                              NIC:{' '}
                              {patient.nic ||
                                'No NIC'}
                            </p>

                            <p className="text-xs text-gray-500">
                              {patient.email ||
                                'No Gmail'}
                            </p>

                            <p className="text-xs text-gray-500">
                              Phone:{' '}
                              {patient.phone ||
                                'No phone'}
                            </p>
                          </div>

                          <div className="flex items-center gap-1">

                            <button
                              type="button"
                              onClick={() =>
                                void handleIssueToken(
                                  patient,
                                )
                              }
                              className="bg-green-600 text-white text-xs px-2.5 py-1 rounded hover:bg-green-700"
                            >
                              Token
                            </button>

                            <button
                              type="button"
                              onClick={() =>
                                handleEditPatient(
                                  patient,
                                )
                              }
                              className="text-indigo-600 text-xs font-semibold px-2 py-1"
                            >
                              Edit
                            </button>

                            <button
                              type="button"
                              onClick={() =>
                                void handleDeletePatient(
                                  patientId,
                                )
                              }
                              className="text-red-600 text-xs font-semibold px-2 py-1"
                            >
                              Delete
                            </button>

                          </div>

                        </div>
                      );
                    },
                  )
                )}

              </div>

            </div>

          </div>

          {/* ==================================================
              LIVE QUEUE
          ================================================== */}

          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">

            <div className="flex justify-between items-center mb-4">

              <h2 className="text-xl font-semibold text-gray-800">
                Live Queue Status
              </h2>

              <button
                type="button"
                onClick={() =>
                  void fetchData()
                }
                className="text-sm text-indigo-600 hover:text-indigo-800 font-medium"
              >
                Refresh Queue
              </button>

            </div>

            {loading &&
            filteredQueue.length ===
              0 ? (
              <p className="text-gray-500 py-8 text-center">
                Loading queue...
              </p>
            ) : filteredQueue.length ===
              0 ? (
              <p className="text-gray-500 py-8 text-center">
                No active queue patients.
              </p>
            ) : (
              <div className="overflow-x-auto max-h-96 overflow-y-auto">

                <table className="min-w-full divide-y divide-gray-200">

                  <thead className="bg-gray-50 sticky top-0">
                    <tr>

                      <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                        Token
                      </th>

                      <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                        Patient
                      </th>

                      <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                        Type
                      </th>

                      <th className="px-3 py-2 text-right text-xs font-medium text-gray-500 uppercase">
                        Action
                      </th>

                    </tr>
                  </thead>

                  <tbody className="bg-white divide-y divide-gray-200">

                    {filteredQueue.map(
                      item => (
                        <tr
                          key={
                            item.id
                          }
                          className={
                            item.isEmergency
                              ? 'bg-red-50'
                              : ''
                          }
                        >

                          <td className="px-3 py-3 font-bold text-gray-900">
                            #
                            {
                              item.tokenNumber
                            }
                          </td>

                          <td className="px-3 py-3 text-sm text-gray-900">

                            {
                              item.patientName
                            }

                            {item.phone && (
                              <span className="block text-xs text-gray-500">
                                {
                                  item.phone
                                }
                              </span>
                            )}

                          </td>

                          <td className="px-3 py-3 text-xs text-gray-500">
                            {
                              item.appointmentType
                            }
                          </td>

                          <td className="px-3 py-3 text-right">

                            <button
                              type="button"
                              onClick={() =>
                                void handleStatusChange(
                                  item.id,
                                  'Cancelled',
                                )
                              }
                              className="text-red-600 text-xs font-medium"
                            >
                              Cancel
                            </button>

                          </td>

                        </tr>
                      ),
                    )}

                  </tbody>

                </table>

              </div>
            )}

          </div>

        </div>

        {/* ==================================================
            SCENARIO 1 + SCENARIO 2
            ONLINE APPOINTMENT SCHEDULE
        ================================================== */}

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">

          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">

            <div>

              <h2 className="text-xl font-semibold text-gray-800">
                Online Appointments Schedule
              </h2>

              <p className="text-sm text-gray-500 mt-1">
                View scheduled appointments and check in
                patients when they physically arrive.
              </p>

            </div>

            <div className="flex items-center gap-2">

              <label
                htmlFor="appointment-date"
                className="text-sm font-medium text-gray-700"
              >
                Select Date:
              </label>

              <input
                id="appointment-date"
                type="date"
                value={
                  selectedDate
                }
                onChange={event =>
                  setSelectedDate(
                    event.target.value,
                  )
                }
                className="border border-gray-300 rounded-md px-3 py-1.5 text-sm bg-white shadow-sm"
              />

            </div>

          </div>

          {appointments.length ===
          0 ? (
            <p className="text-gray-500 py-8 text-center">
              No online appointments scheduled
              for {selectedDate}.
            </p>
          ) : (
            <div className="overflow-x-auto">

              <table className="min-w-full divide-y divide-gray-200">

                <thead className="bg-gray-50">

                  <tr>

                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Date
                    </th>

                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Time Slot
                    </th>

                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Patient
                    </th>

                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Phone
                    </th>

                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Status
                    </th>

                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                      Action
                    </th>

                  </tr>

                </thead>

                <tbody className="bg-white divide-y divide-gray-200">

                  {appointments.map(
                    appointment => (
                      <tr
                        key={
                          appointment._id
                        }
                      >

                        <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                          {
                            appointment.appointmentDate
                          }
                        </td>

                        <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-600">
                          {
                            appointment.startTime
                          }{' '}
                          -{' '}
                          {
                            appointment.endTime
                          }
                        </td>

                        <td className="px-4 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {
                            getPatientName(
                              appointment,
                            )
                          }
                        </td>

                        <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-600">
                          {
                            getPatientPhone(
                              appointment,
                            )
                          }
                        </td>

                        <td className="px-4 py-4 whitespace-nowrap">

                          {appointment.status ===
                          'ARRIVED' ? (
                            <div>

                              <span className="px-2 inline-flex text-xs font-semibold rounded-full bg-green-100 text-green-800">
                                ARRIVED
                              </span>

                              {typeof appointment.tokenNumber ===
                                'number' && (
                                <span className="block mt-1 text-xs font-bold text-indigo-700">
                                  Token #
                                  {
                                    appointment.tokenNumber
                                  }
                                </span>
                              )}

                            </div>
                          ) : (
                            <span className="px-2 inline-flex text-xs font-semibold rounded-full bg-yellow-100 text-yellow-800">
                              {
                                appointment.status ||
                                'BOOKED'
                              }
                            </span>
                          )}

                        </td>

                        <td className="px-4 py-4 whitespace-nowrap text-right">

                          {appointment.status ===
                          'BOOKED' ? (
                            <button
                              type="button"
                              disabled={
                                checkingInId ===
                                appointment._id
                              }
                              onClick={() =>
                                void handleCheckIn(
                                  appointment._id,
                                )
                              }
                              className="bg-indigo-600 text-white px-3 py-2 rounded-md text-sm font-medium hover:bg-indigo-700 disabled:opacity-50"
                            >
                              {checkingInId ===
                              appointment._id
                                ? 'Checking In...'
                                : 'Check In & Generate Token'}
                            </button>
                          ) : appointment.status ===
                            'ARRIVED' ? (
                            <span className="text-sm text-green-600 font-medium">
                              In Queue
                            </span>
                          ) : (
                            <span className="text-sm text-gray-500">
                              No action
                            </span>
                          )}

                        </td>

                      </tr>
                    ),
                  )}

                </tbody>

              </table>

            </div>
          )}

        </div>

      </div>
    </div>
  );
};