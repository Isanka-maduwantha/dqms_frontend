import React, { useCallback, useEffect, useState } from "react";

import { receptionistApi } from "../services/receptionistApi";

import type {
  AppointmentItem,
  AvailableSlot,
  PatientData,
  PatientRecord,
  TokenItem,
} from "../services/receptionistApi";
import FormInput from "../../../components/FormInput";
import { Form } from "react-router-dom";
import CommonButton from "../../../components/CommanButton";

export const ReceptionistDashboardPage: React.FC = () => {
  const getTodayDateString = (): string =>
    new Date().toISOString().split("T")[0];

  // ==========================================================
  // GENERAL DASHBOARD STATE
  // ==========================================================

  const [queue, setQueue] = useState<TokenItem[]>([]);

  const [appointments, setAppointments] = useState<AppointmentItem[]>([]);

  const [patients, setPatients] = useState<PatientRecord[]>([]);

  const [selectedDate, setSelectedDate] =
    useState<string>(getTodayDateString());

  const [loading, setLoading] = useState<boolean>(true);

  const [error, setError] = useState<string | null>(null);

  // ==========================================================
  // SCENARIO 4 - PATIENT REGISTRATION
  // ==========================================================

  const [selectedPatientId, setSelectedPatientId] = useState<string | null>(
    null,
  );

  const [formData, setFormData] = useState<PatientData>({
    patientName: "",
    phone: "",
    nic: "",
    email: "",
    password: "",
  });

  const [searchQuery, setSearchQuery] = useState("");

  const [isEmergency, setIsEmergency] = useState(false);

  const [submitting, setSubmitting] = useState(false);

  // ==========================================================
  // SCENARIO 3 - RESERVATION
  // ==========================================================

  const [reservationSearch, setReservationSearch] = useState("");

  const [reservationPatient, setReservationPatient] =
    useState<PatientRecord | null>(null);

  const [reservationDate, setReservationDate] =
    useState<string>(getTodayDateString());

  const [availableSlots, setAvailableSlots] = useState<AvailableSlot[]>([]);

  const [selectedSlot, setSelectedSlot] = useState<string | null>(null);

  const [slotsLoading, setSlotsLoading] = useState(false);

  const [reservationLoading, setReservationLoading] = useState(false);

  const [reservationMessage, setReservationMessage] = useState<string | null>(
    null,
  );

  // ==========================================================
  // SCENARIO 2
  // ==========================================================

  const [checkingInId, setCheckingInId] = useState<string | null>(null);

  // ==========================================================
  // LOAD DASHBOARD DATA
  // ==========================================================

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);

      const [queueResult, appointmentResult, patientResult] = await Promise.all(
        [
          receptionistApi.getQueue(selectedDate),

          receptionistApi.getAppointments(selectedDate),

          receptionistApi.getPatients(),
        ],
      );

      setQueue(queueResult);
      setAppointments(appointmentResult);
      setPatients(patientResult);
      setError(null);
    } catch (requestError: unknown) {
      const errMessage =
        requestError instanceof Error
          ? requestError.message
          : "Failed to load dashboard data from server.";

      // Handle 401 Unauthorized globally by redirecting to login if token expired/missing
      if (
        errMessage.toLowerCase().includes("unauthorized") ||
        errMessage.includes("401")
      ) {
        localStorage.removeItem("token");
        window.location.href = "/login";
        return;
      }

      setError(errMessage);
    } finally {
      setLoading(false);
    }
  }, [selectedDate]);

  useEffect(() => {
    void fetchData();

    const interval = setInterval(() => {
      void fetchData();
    }, 15000);

    return () => clearInterval(interval);
  }, [fetchData]);

  // ==========================================================
  // SCENARIO 3 - LOAD AVAILABLE SLOTS
  // ==========================================================

  const loadAvailableSlots = useCallback(async (date: string) => {
    try {
      setSlotsLoading(true);
      setReservationMessage(null);
      setSelectedSlot(null);

      const result = await receptionistApi.getAvailableSlots(date);

      setAvailableSlots(result.slots);

      if (result.message) {
        setReservationMessage(result.message);
      }
    } catch (requestError: unknown) {
      setAvailableSlots([]);

      setReservationMessage(
        requestError instanceof Error
          ? requestError.message
          : "Failed to load available time slots.",
      );
    } finally {
      setSlotsLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadAvailableSlots(reservationDate);
  }, [reservationDate, loadAvailableSlots]);

  // ==========================================================
  // SCENARIO 4 - FORM INPUT
  // ==========================================================

  const handleInputChange = (
    event: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >,
  ) => {
    const { name, value } = event.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  // ==========================================================
  // SCENARIO 4 - CREATE / UPDATE PATIENT
  // ==========================================================

  const handlePatientSubmit = async (
    event: React.FormEvent<HTMLFormElement>,
  ) => {
    event.preventDefault();

    const patientName = formData.patientName.trim();

    const nic = formData.nic.trim();

    const phone = formData.phone.trim();

    const email = formData.email.trim().toLowerCase();

    const password = formData.password;

    if (!patientName) {
      setError("Patient full name is required.");
      return;
    }

    if (!nic) {
      setError("NIC is required.");
      return;
    }

    if (!email) {
      setError("Gmail address is required.");
      return;
    }

    if (!email.endsWith("@gmail.com")) {
      setError("Please enter a valid Gmail address.");
      return;
    }

    if (!selectedPatientId && password.length < 8) {
      setError("Password must be at least 8 characters long.");
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

      if (selectedPatientId) {
        const updatedPatient = await receptionistApi.updatePatient(
          selectedPatientId,
          dataToSend,
        );

        if (
          reservationPatient &&
          (reservationPatient._id === selectedPatientId ||
            reservationPatient.id === selectedPatientId)
        ) {
          setReservationPatient(updatedPatient);
        }

        setReservationMessage(
          `Patient account updated successfully for ${
            updatedPatient.name || updatedPatient.patientName || patientName
          }.`,
        );
      } else {
        const createdPatient = await receptionistApi.createPatient(dataToSend);

        setReservationPatient(createdPatient);

        setReservationSearch(
          createdPatient.name || createdPatient.patientName || patientName,
        );

        setSelectedSlot(null);

        setReservationMessage(
          `Patient account created successfully for ${
            createdPatient.name || createdPatient.patientName || patientName
          }. Please select an appointment date and available time slot.`,
        );
      }

      setFormData({
        patientName: "",
        phone: "",
        nic: "",
        email: "",
        password: "",
      });

      setSelectedPatientId(null);
      await fetchData();
    } catch (requestError: unknown) {
      setError(
        requestError instanceof Error
          ? requestError.message
          : "Failed to save patient account.",
      );
    } finally {
      setSubmitting(false);
    }
  };

  // ==========================================================
  // SCENARIO 4 - EDIT PATIENT
  // ==========================================================

  const handleEditPatient = (patient: PatientRecord) => {
    const id = patient.id || patient._id;

    if (!id) {
      setError("Patient ID is missing.");
      return;
    }

    setSelectedPatientId(id);

    setFormData({
      patientName: patient.patientName || patient.name || "",

      phone: patient.phone || "",

      nic: patient.nic || "",

      email: patient.email || "",

      password: "",
    });

    setError(null);
    setReservationMessage(null);
  };

  // ==========================================================
  // SCENARIO 4 - DELETE PATIENT
  // ==========================================================

  const handleDeletePatient = async (patientId: string) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this patient account?",
    );

    if (!confirmed) {
      return;
    }

    try {
      setError(null);

      await receptionistApi.deletePatient(patientId);

      if (
        reservationPatient &&
        (reservationPatient._id === patientId ||
          reservationPatient.id === patientId)
      ) {
        setReservationPatient(null);
        setReservationSearch("");
        setSelectedSlot(null);
      }

      await fetchData();
    } catch (requestError: unknown) {
      setError(
        requestError instanceof Error
          ? requestError.message
          : "Failed to delete patient account.",
      );
    }
  };

  // ==========================================================
  // WALK-IN TOKEN
  // ==========================================================

  const handleIssueToken = async (patient: PatientRecord) => {
    try {
      setError(null);

      await receptionistApi.createWalkInToken({
        patientName: patient.patientName || patient.name || "",

        phone: patient.phone,

        isEmergency,
      });

      setIsEmergency(false);
      await fetchData();
    } catch (requestError: unknown) {
      setError(
        requestError instanceof Error
          ? requestError.message
          : "Failed to generate token.",
      );
    }
  };

  // ==========================================================
  // SCENARIO 2 - CHECK IN
  // ==========================================================

  const handleCheckIn = async (appointmentId: string) => {
    try {
      setCheckingInId(appointmentId);

      setError(null);

      const result = await receptionistApi.markArrived(appointmentId);

      window.alert(
        `Patient checked in successfully.\nToken Number: ${result.tokenNumber}`,
      );

      await fetchData();
    } catch (requestError: unknown) {
      setError(
        requestError instanceof Error
          ? requestError.message
          : "Failed to check in patient.",
      );
    } finally {
      setCheckingInId(null);
    }
  };

  // ==========================================================
  // QUEUE STATUS
  // ==========================================================

  const handleStatusChange = async (tokenId: string, newStatus: string) => {
    try {
      setError(null);

      await receptionistApi.updateTokenStatus(tokenId, newStatus);

      await fetchData();
    } catch (requestError: unknown) {
      setError(
        requestError instanceof Error
          ? requestError.message
          : "Failed to update token status.",
      );
    }
  };

  // ==========================================================
  // SCENARIO 3 - SEARCH PATIENT
  // ==========================================================

  const reservationPatients = patients.filter((patient) => {
    const query = reservationSearch.trim().toLowerCase();

    if (!query) {
      return false;
    }

    const name = (patient.name || patient.patientName || "").toLowerCase();

    const email = (patient.email || "").toLowerCase();

    const nic = (patient.nic || "").toLowerCase();

    return name.includes(query) || email.includes(query) || nic.includes(query);
  });

  // ==========================================================
  // SCENARIO 3 - SELECT PATIENT
  // ==========================================================

  const handleReservationPatientSelect = (patient: PatientRecord) => {
    setReservationPatient(patient);

    setReservationSearch(patient.name || patient.patientName || "");

    setReservationMessage(null);

    setSelectedSlot(null);
  };

  // ==========================================================
  // SCENARIO 3 - MAKE RESERVATION
  // ==========================================================

  const handleMakeReservation = async () => {
    if (!reservationPatient) {
      setReservationMessage("Please select a patient first.");
      return;
    }

    const patientId = reservationPatient._id || reservationPatient.id;

    if (!patientId) {
      setReservationMessage("Selected patient does not have a valid ID.");
      return;
    }

    if (!reservationDate) {
      setReservationMessage("Please select an appointment date.");
      return;
    }

    if (!selectedSlot) {
      setReservationMessage("Please select an available time slot.");
      return;
    }

    try {
      setReservationLoading(true);

      setReservationMessage(null);

      await receptionistApi.bookAppointmentForPatient(
        patientId,
        reservationDate,
        selectedSlot,
      );

      setReservationMessage(
        `Appointment successfully reserved for ${
          reservationPatient.name ||
          reservationPatient.patientName ||
          "the patient"
        } at ${selectedSlot} on ${reservationDate}.`,
      );

      setSelectedSlot(null);

      if (reservationDate === selectedDate) {
        await fetchData();
      }

      await loadAvailableSlots(reservationDate);
    } catch (requestError: unknown) {
      setReservationMessage(
        requestError instanceof Error
          ? requestError.message
          : "Failed to make reservation.",
      );
    } finally {
      setReservationLoading(false);
    }
  };

  // ==========================================================
  // PATIENT DIRECTORY SEARCH
  // ==========================================================

  const filteredPatients = patients.filter((patient) => {
    const query = searchQuery.trim().toLowerCase();

    if (!query) {
      return true;
    }

    const name = (patient.patientName || patient.name || "").toLowerCase();

    const email = (patient.email || "").toLowerCase();

    const nic = (patient.nic || "").toLowerCase();

    return name.includes(query) || email.includes(query) || nic.includes(query);
  });

  // ==========================================================
  // QUEUE SEARCH
  // ==========================================================

  const filteredQueue = queue.filter((item) => {
    const query = searchQuery.trim().toLowerCase();

    if (!query) {
      return true;
    }

    const patientName = item.patientName || "";

    return patientName.toLowerCase().includes(query);
  });

  // ==========================================================
  // APPOINTMENT PATIENT HELPERS
  // ==========================================================

  const getPatientName = (appointment: AppointmentItem): string => {
    if (
      typeof appointment.patientId === "object" &&
      appointment.patientId !== null
    ) {
      return (
        appointment.patientId.name ||
        appointment.patientId.patientName ||
        "Unknown patient"
      );
    }

    return "Unknown patient";
  };

  const getPatientPhone = (appointment: AppointmentItem): string => {
    if (
      typeof appointment.patientId === "object" &&
      appointment.patientId !== null
    ) {
      return appointment.patientId.phone || "N/A";
    }

    return "N/A";
  };

  // ==========================================================
  // UI
  // ==========================================================

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 flex flex-col justify-between font-sans grow">
      {/* Outer Wrapper Container Card */}
      <div className=" my-8 overflow-hidden flex flex-col">
        {/* Top Navigation Bar */}

        {/* Header Title Section */}
        <div className="px-8 pt-6 pb-2 border-b border-gray-100 bg-white">
          <h1 className="text-2xl font-bold tracking-tight text-gray-900">
            Receptionist Dashboard
          </h1>
          <p className="text-xs text-gray-500 mt-1">
            Patient registration, reservations, appointment schedules and live
            queue.
          </p>
        </div>

        {/* Global Error Banner */}
        {error && (
          <div className="mx-8 mt-4 p-4 bg-red-50 border border-red-200 text-red-700 rounded-xl text-xs">
            {error}
          </div>
        )}

        {/* Main Content Body */}
        <main className="p-8 flex flex-col space-y-8 bg-white gap-5">
          {/* ==================================================
              SCENARIO 3: EXISTING PATIENT RESERVATION & LIVE QUEUE
          ================================================== */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Left: Make Reservation Box */}
            <div className="lg:col-span-7 bg-white p-6 rounded-2xl border border-gray-200 shadow-sm flex flex-col gap-3 justify-between">
              <div>
                <h2 className="text-base font-bold text-gray-900">
                  Make Reservation for Existing Patient
                </h2>
                <p className="text-xs text-gray-500 mt-0.5">
                  Search an existing patient by name, NIC or Gmail address, then
                  select an available appointment time.
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-5">
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">
                      Search Patient
                    </label>
                    <input
                      type="text"
                      value={reservationSearch}
                      onChange={(event) => {
                        setReservationSearch(event.target.value);
                        setReservationPatient(null);
                        setReservationMessage(null);
                      }}
                      placeholder="Search by name, NIC or Gmail..."
                      className="w-full px-3.5 py-2 text-xs border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-600/20 focus:border-emerald-600"
                    />

                    {reservationSearch.trim() && !reservationPatient && (
                      <div className="mt-2 border border-gray-200 rounded-lg max-h-52 overflow-y-auto bg-white shadow-sm z-10 relative">
                        {reservationPatients.length === 0 ? (
                          <p className="p-4 text-xs text-gray-500 text-center">
                            No patient found.
                          </p>
                        ) : (
                          reservationPatients.map((patient) => {
                            const id = patient._id || patient.id || "";
                            return (
                              <button
                                key={id}
                                type="button"
                                onClick={() =>
                                  handleReservationPatientSelect(patient)
                                }
                                className="w-full text-left p-3 border-b last:border-b-0 hover:bg-emerald-50 transition-colors"
                              >
                                <p className="font-semibold text-xs text-gray-900">
                                  {patient.name ||
                                    patient.patientName ||
                                    "Unnamed patient"}
                                </p>
                                <p className="text-[11px] text-gray-600">
                                  {patient.email || "No Gmail address"}
                                </p>
                                <p className="text-[10px] text-gray-400 mt-0.5">
                                  NIC: {patient.nic || "Not available"} | Phone:{" "}
                                  {patient.phone || "Not available"}
                                </p>
                              </button>
                            );
                          })
                        )}
                      </div>
                    )}

                    {reservationPatient && (
                      <div className="mt-3 border border-emerald-200 bg-emerald-50/60 rounded-xl p-3.5 flex justify-between items-start">
                        <div>
                          <p className="text-[10px] uppercase font-bold text-emerald-700 tracking-wider">
                            Selected Patient
                          </p>
                          <p className="text-sm font-bold text-gray-900 mt-0.5">
                            {reservationPatient.name ||
                              reservationPatient.patientName ||
                              "Unnamed patient"}
                          </p>
                          <p className="text-[11px] text-gray-600">
                            NIC: {reservationPatient.nic || "N/A"} · Gmail:{" "}
                            {reservationPatient.email || "N/A"}
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            setReservationPatient(null);
                            setReservationSearch("");
                            setSelectedSlot(null);
                          }}
                          className="text-xs text-red-600 font-semibold hover:underline"
                        >
                          Change
                        </button>
                      </div>
                    )}
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">
                      Appointment Date
                    </label>
                    <input
                      type="date"
                      value={reservationDate}
                      min={getTodayDateString()}
                      onChange={(event) =>
                        setReservationDate(event.target.value)
                      }
                      className="w-full px-3.5 py-2 text-xs border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-600/20 focus:border-emerald-600"
                    />
                  </div>
                </div>

                <div className="mt-4">
                  <div className="flex justify-between items-center mb-1">
                    <label className="block text-xs font-semibold text-gray-700">
                      Available Time Slots
                    </label>
                    {slotsLoading && (
                      <span className="text-[10px] text-gray-400">
                        Loading...
                      </span>
                    )}
                  </div>

                  {!slotsLoading && availableSlots.length === 0 ? (
                    <div className="border border-dashed border-gray-200 rounded-lg p-4 text-xs text-gray-400 text-center bg-gray-50/50">
                      No appointment slots are available for this date.
                    </div>
                  ) : (
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 max-h-40 overflow-y-auto">
                      {availableSlots.map((slot) => (
                        <button
                          key={slot.time}
                          type="button"
                          disabled={!slot.available}
                          onClick={() => setSelectedSlot(slot.time)}
                          title={slot.available ? "Available" : slot.reason}
                          className={`p-2 rounded-lg text-xs font-medium border transition-colors ${
                            !slot.available
                              ? "bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed"
                              : selectedSlot === slot.time
                                ? "bg-emerald-700 text-white border-emerald-700 shadow-sm"
                                : "bg-white text-gray-700 border-gray-300 hover:bg-emerald-50 hover:border-emerald-300"
                          }`}
                        >
                          {slot.time}
                        </button>
                      ))}
                    </div>
                  )}

                  {selectedSlot && (
                    <div className="mt-3 p-2.5 bg-emerald-50 border border-emerald-200 rounded-lg text-xs text-emerald-900 font-medium">
                      Selected time:{" "}
                      <span className="font-bold">{selectedSlot}</span>
                    </div>
                  )}

                  {reservationMessage && (
                    <div className="mt-3 p-2.5 bg-blue-50 border border-blue-200 rounded-lg text-xs text-blue-900 font-medium">
                      {reservationMessage}
                    </div>
                  )}
                </div>
              </div>

              <div className="mt-6 space-y-3">
                <button
                  type="button"
                  disabled={
                    reservationLoading ||
                    !reservationPatient ||
                    !selectedSlot ||
                    slotsLoading
                  }
                  onClick={() => void handleMakeReservation()}
                  className="w-full py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white font-medium text-xs rounded-xl shadow-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {reservationLoading
                    ? "Making Reservation..."
                    : "Make Reservation"}
                </button>
                <div className="p-3 bg-emerald-50/60 border border-emerald-200/50 rounded-xl text-xs text-emerald-900 font-medium text-center">
                  Clinic Closed on Sunday
                </div>
              </div>
            </div>

            {/* Right: Live Queue Status */}
            <div className="lg:col-span-5 bg-white p-6 rounded-2xl border border-gray-200 shadow-sm flex flex-col">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-base font-bold text-gray-900">
                  Live Queue Status
                </h2>
                <button
                  type="button"
                  onClick={() => void fetchData()}
                  className="text-xs font-semibold text-emerald-700 hover:underline"
                >
                  Refresh Queue
                </button>
              </div>

              {loading && filteredQueue.length === 0 ? (
                <p className="text-xs text-gray-400 py-8 text-center">
                  Loading queue...
                </p>
              ) : filteredQueue.length === 0 ? (
                <p className="text-xs text-gray-400 py-8 text-center">
                  No active queue patients.
                </p>
              ) : (
                <div className="flex-1 overflow-x-auto max-h-96 overflow-y-auto">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="border-b border-gray-200 text-[11px] font-semibold text-gray-400 uppercase">
                        <th className="py-2.5 px-2">Token</th>
                        <th className="py-2.5 px-2">Patient</th>
                        <th className="py-2.5 px-2">Type</th>
                        <th className="py-2.5 px-2 text-right">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {filteredQueue.map((item) => (
                        <tr
                          key={item.id}
                          className={`hover:bg-gray-50/50 ${item.isEmergency ? "bg-red-50/60" : ""}`}
                        >
                          <td className="py-3 px-2 font-bold text-gray-900">
                            #{item.tokenNumber}
                          </td>
                          <td className="py-3 px-2 text-gray-800 font-medium">
                            {item.patientName}
                            {item.phone && (
                              <span className="block text-[10px] text-gray-400 font-normal">
                                {item.phone}
                              </span>
                            )}
                          </td>
                          <td className="py-3 px-2 text-gray-500">
                            {item.appointmentType}
                          </td>
                          <td className="py-3 px-2 text-right">
                            <button
                              type="button"
                              onClick={() =>
                                void handleStatusChange(item.id, "Cancelled")
                              }
                              className="text-xs font-semibold text-red-600 hover:underline"
                            >
                              Cancel
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>

          {/* ==================================================
              SCENARIO 4: NEW PATIENT ACCOUNT & DIRECTORY
          ================================================== */}
          <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
            <h2 className="text-base font-bold text-gray-900 mb-1">
              {selectedPatientId
                ? "Update Patient Account"
                : "New Patient Account"}
            </h2>
            <p className="text-xs text-gray-500 mb-6">
              Create a patient login account. Age, gender and address are not
              required.
            </p>

            <div className="main-patient-controllers grid gap-10 grid-cols-2 ">
              <form
                onSubmit={handlePatientSubmit}
                className="space-y-4 mb-8 pt-4 col-span-1 "
              >
                <div className="flex flex-col gap-4">
                  <div>
                    <FormInput
                      label=" Patient Full Name *"
                      type="text"
                      name="patientName"
                      value={formData.patientName}
                      onChange={handleInputChange}
                      required
                      autoComplete="name"
                      className="w-full px-3.5 py-2 text-xs border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-600/20 focus:border-emerald-600"
                      placeholder="Enter patient's full name"
                    />
                  </div>

                  <div>
                    <FormInput
                      label=" NIC *"
                      type="text"
                      name="nic"
                      value={formData.nic}
                      onChange={handleInputChange}
                      required
                      className="w-full px-3.5 py-2 text-xs border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-600/20 focus:border-emerald-600"
                      placeholder="Enter NIC"
                    />
                  </div>

                  <div>
                    <FormInput
                      label="Phone Number"
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      autoComplete="tel"
                      className="w-full px-3.5 py-2 text-xs border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-600/20 focus:border-emerald-600"
                      placeholder="Enter phone number"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">
                      Email Address *
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      required
                      autoComplete="email"
                      className="w-full px-3.5 py-2 text-xs border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-600/20 focus:border-emerald-600"
                      placeholder="patient@gmail.com"
                    />
                    <span className="text-[10px] text-gray-400 mt-0.5 block">
                      The patient will use this Gmail address to log in.
                    </span>
                  </div>
                </div>

                <div className="">
                  <div>
                    <FormInput
                      label="Password *"
                      type="password"
                      name="password"
                      value={formData.password}
                      onChange={handleInputChange}
                      required={!selectedPatientId}
                      minLength={8}
                      autoComplete="new-password"
                      className="w-full px-3.5 py-2 text-xs border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-600/20 focus:border-emerald-600"
                      placeholder={
                        selectedPatientId
                          ? "Leave blank to keep current"
                          : "Minimum 8 characters"
                      }
                    />
                    <span className="text-[10px] text-gray-400 mt-0.5 block">
                      Minimum 8 characters.
                    </span>
                  </div>
                </div>

                <div className="flex gap-2 ">
                  <CommonButton
                    type="submit"
                    disabled={submitting}
                    className="flex-1 py-2.5 px-4 bg-emerald-700 hover:bg-emerald-800 text-white font-medium text-xs rounded-xl shadow-sm transition-colors disabled:opacity-50"
                  >
                    {submitting
                      ? "Saving..."
                      : selectedPatientId
                        ? "Update Account"
                        : "Create Patient Account"}
                  </CommonButton>

                  {selectedPatientId && (
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedPatientId(null);
                        setFormData({
                          patientName: "",
                          phone: "",
                          nic: "",
                          email: "",
                          password: "",
                        });
                        setError(null);
                      }}
                      className="py-2.5 px-4 bg-gray-200 text-gray-700 text-xs font-medium rounded-xl hover:bg-gray-300 transition-colors"
                    >
                      Cancel
                    </button>
                  )}
                </div>
              </form>

              {/* Patient Directory Sub-section */}
              <div className="border-t border-gray-100 pt-6 col-span-1">
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-4">
                  <h3 className="text-xs font-bold text-gray-900 uppercase tracking-wide">
                    Patient Directory
                  </h3>
                  <input
                    type="text"
                    placeholder="Search name, NIC or Gmail..."
                    value={searchQuery}
                    onChange={(event) => setSearchQuery(event.target.value)}
                    className="w-full sm:w-72 px-3.5 py-1.5 text-xs border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-600/20"
                  />
                </div>

                <div className="max-h-100  overflow-y-auto space-y-3 pr-2">
                  {filteredPatients.length === 0 ? (
                    <p className="p-4 text-xs text-gray-400 text-center">
                      No patient records found.
                    </p>
                  ) : (
                    filteredPatients.map((patient) => {
                      const patientId = patient.id || patient._id || "";
                      return (
                        <div
                          key={patientId}
                          className="flex items-center justify-between p-4 bg-gray-50/80 border border-gray-200/70 rounded-xl hover:bg-gray-50 transition-colors"
                        >
                          <div className="space-y-0.5">
                            <p className="font-bold text-xs text-gray-900">
                              {patient.patientName ||
                                patient.name ||
                                "Unnamed patient"}
                            </p>
                            <p className="text-[11px] text-gray-500">
                              NIC: {patient.nic || "No NIC"}
                            </p>
                            <p className="text-[11px] text-gray-500">
                              {patient.email || "No Gmail"}
                            </p>
                            <p className="text-[11px] text-gray-500">
                              Phone: {patient.phone || "No phone"}
                            </p>
                          </div>

                          <div className="flex items-center space-x-3">
                            <button
                              type="button"
                              onClick={() => void handleIssueToken(patient)}
                              className="px-3 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-medium shadow-sm transition-colors"
                            >
                              Token
                            </button>
                            <button
                              type="button"
                              onClick={() => handleEditPatient(patient)}
                              className="text-xs font-semibold text-emerald-700 hover:underline"
                            >
                              Edit
                            </button>
                            <button
                              type="button"
                              onClick={() =>
                                void handleDeletePatient(patientId)
                              }
                              className="text-xs font-semibold text-red-600 hover:underline"
                            >
                              Delete
                            </button>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* ==================================================
              SCENARIO 1 & 2: ONLINE APPOINTMENTS SCHEDULE
          ================================================== */}
          <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-6">
              <div>
                <h2 className="text-base font-bold text-gray-900">
                  Online Appointments Schedule
                </h2>
                <p className="text-xs text-gray-500 mt-0.5">
                  View scheduled appointments and check in patients when they
                  physically arrive.
                </p>
              </div>

              <div className="flex items-center space-x-2">
                <label
                  htmlFor="appointment-date"
                  className="text-xs font-semibold text-gray-700"
                >
                  Select Date:
                </label>
                <input
                  id="appointment-date"
                  type="date"
                  value={selectedDate}
                  onChange={(event) => setSelectedDate(event.target.value)}
                  className="px-3.5 py-1.5 text-xs border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-600/20"
                />
              </div>
            </div>

            {appointments.length === 0 ? (
              <p className="text-xs text-gray-400 py-8 text-center">
                No online appointments scheduled for {selectedDate}.
              </p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-gray-200 text-[11px] font-semibold text-gray-400 uppercase">
                      <th className="py-3 px-4">Date</th>
                      <th className="py-3 px-4">Time Slot</th>
                      <th className="py-3 px-4">Patient</th>
                      <th className="py-3 px-4">Phone</th>
                      <th className="py-3 px-4">Status</th>
                      <th className="py-3 px-4 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {appointments.map((appointment) => (
                      <tr key={appointment._id} className="hover:bg-gray-50/50">
                        <td className="py-3.5 px-4 text-gray-600">
                          {appointment.appointmentDate}
                        </td>
                        <td className="py-3.5 px-4 text-gray-600">
                          {appointment.startTime} - {appointment.endTime}
                        </td>
                        <td className="py-3.5 px-4 font-semibold text-gray-900">
                          {getPatientName(appointment)}
                        </td>
                        <td className="py-3.5 px-4 text-gray-500">
                          {getPatientPhone(appointment)}
                        </td>
                        <td className="py-3.5 px-4">
                          {appointment.status === "ARRIVED" ? (
                            <div className="inline-flex flex-col">
                              <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 rounded font-bold text-[10px] w-fit">
                                ARRIVED
                              </span>
                              {typeof appointment.tokenNumber === "number" && (
                                <span className="text-[11px] text-emerald-700 font-medium mt-0.5">
                                  Token #{appointment.tokenNumber}
                                </span>
                              )}
                            </div>
                          ) : (
                            <span className="px-2 py-0.5 bg-amber-100 text-amber-800 rounded font-bold text-[10px]">
                              {appointment.status || "BOOKED"}
                            </span>
                          )}
                        </td>
                        <td className="py-3.5 px-4 text-right">
                          {appointment.status === "BOOKED" ? (
                            <button
                              type="button"
                              disabled={checkingInId === appointment._id}
                              click={() => void handleCheckIn(appointment._id)}
                              onClick={() =>
                                void handleCheckIn(appointment._id)
                              }
                              className="px-4 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg text-xs font-medium shadow-sm transition-colors disabled:opacity-50"
                            >
                              {checkingInId === appointment._id
                                ? "Checking In..."
                                : "Check In & Generate Token"}
                            </button>
                          ) : appointment.status === "ARRIVED" ? (
                            <span className="text-xs font-semibold text-emerald-700">
                              In Queue
                            </span>
                          ) : (
                            <span className="text-xs text-gray-400">
                              No action
                            </span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}; //ReceptionistDashboard ekam meke design eka witharai wenas kare. paste krl balanna
