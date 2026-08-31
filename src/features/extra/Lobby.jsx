import React, { useCallback, useEffect, useMemo, useState } from "react";
import { getAllUpcomingAppointments } from "./service/extraServices";
import { titleCase } from "../../lib/utils/format";

const demoAppointments = []
// const demoAppointments = [
//   {
//     _id: "demo-1",
//     tokenNumber: "A-125",
//     patientName: "A. Perera",
//     room: "Consultation Room 02",
//     doctor: "Dr. S. Perera",
//     type: "CHECKUP",
//     visitPurpose: "ROUTINE_CHECKUP",
//     status: "IN_CONSULTATION",
//     waitMinutes: 0,
//     appointmentDate: "2026-08-30",
//     startTime: "09:00",
//     endTime: "09:15",
//   },
//   {
//     _id: "demo-2",
//     tokenNumber: "W-042",
//     patientName: "K. Silva",
//     room: "Consultation Room 03",
//     doctor: "Dr. M. Silva",
//     type: "ORTHODONTICS",
//     visitPurpose: "ALIGNER_REVIEW",
//     status: "ARRIVED",
//     waitMinutes: 8,
//     appointmentDate: "2026-08-30",
//     startTime: "09:30",
//     endTime: "09:45",
//   },
//   {
//     _id: "demo-3",
//     tokenNumber: null,
//     patientName: "N. Fernando",
//     room: "Consultation Room 01",
//     doctor: "Dr. D. Jayasuriya",
//     type: "CHECKUP",
//     visitPurpose: "NEW_TREATMENT",
//     status: "BOOKED",
//     waitMinutes: 16,
//     appointmentDate: "2026-08-30",
//     startTime: "10:00",
//     endTime: "10:15",
//   },
//   {
//     _id: "demo-4",
//     tokenNumber: null,
//     patientName: "M. Jayawardena",
//     room: "Consultation Room 02",
//     doctor: "Dr. S. Perera",
//     type: "CLEANING",
//     visitPurpose: "SCALING_POLISHING",
//     status: "BOOKED",
//     waitMinutes: 24,
//     appointmentDate: "2026-08-30",
//     startTime: "10:30",
//     endTime: "10:45",
//   },
//   {
//     _id: "demo-5",
//     tokenNumber: null,
//     patientName: "R. Dissanayake",
//     room: "Consultation Room 04",
//     doctor: "Dr. K. Bandara",
//     type: "PEDIATRIC",
//     visitPurpose: "FLUORIDE_TREATMENT",
//     status: "BOOKED",
//     waitMinutes: 32,
//     appointmentDate: "2026-08-30",
//     startTime: "11:00",
//     endTime: "11:15",
//   },
// ];

function normalizeAppointments(payload) {
  if (Array.isArray(payload)) return payload;
  if (!payload || typeof payload !== "object") return [];

  const candidates = [
    payload.data,
    payload.appointments,
    payload.upcomingAppointments,
    payload.todayAppointments,
    payload.queue,
    payload.result,
  ];

  for (const candidate of candidates) {
    if (Array.isArray(candidate)) return candidate;
  }

  return [];
}

function getDisplayName(item) {
  if (typeof item?.patientName === "string" && item.patientName.trim()) return item.patientName;
  if (typeof item?.patient?.name === "string" && item.patient.name.trim()) return item.patient.name;
  if (item?.patientId && typeof item.patientId === "object") {
    return item.patientId.name || item.patientId.fullName || "Registered Patient";
  }
  if (typeof item?.patientId === "string" && item.patientId.trim()) {
    // If it's a 24-char hex Mongo ObjectId, display privacy-friendly patient code
    if (/^[a-fA-F0-9]{24}$/.test(item.patientId)) {
      return `Patient #${item.patientId.slice(-4).toUpperCase()}`;
    }
    return item.patientId;
  }
  return "Registered Patient";
}

function getTokenValue(item, index) {
  const token = item?.token || item?.tokenNumber || item?.queueToken || item?.appointmentToken;
  if (token !== undefined && token !== null && token !== "") {
    const str = String(token);
    return str.startsWith("#") ? str : `#${str}`;
  }
  // When tokenNumber is null (e.g. booked online, awaiting reception check-in)
  if (item?.startTime) {
    return `#${item.startTime}`;
  }
  if (typeof item?._id === "string") {
    return `#T-${item._id.slice(-4).toUpperCase()}`;
  }
  return index !== undefined ? `#${index + 1}` : "#—";
}

function getRoomName(item) {
  if (item?.room || item?.clinicRoom || item?.consultationRoom || item?.roomName) {
    return item.room || item.clinicRoom || item.consultationRoom || item.roomName;
  }
  if (item?.type) {
    return `Dental Room (${titleCase(item.type)})`;
  }
  return "Consultation Room 01";
}

function getDoctorName(item) {
  if (item?.doctor || item?.dentist || item?.dentistName || item?.doctorName) {
    return item.doctor || item.dentist || item.dentistName || item.doctorName;
  }
  if (typeof item?.doctorId === "string" && /^[a-fA-F0-9]{24}$/.test(item.doctorId)) {
    return "Dental Surgery Specialist";
  }
  return "Clinical Dental Specialist";
}

function getProcedureLabel(item) {
  const parts = [];
  if (item?.type) parts.push(titleCase(item.type));
  if (item?.visitPurpose && item.visitPurpose !== item.type) {
    parts.push(titleCase(item.visitPurpose));
  }
  return parts.length ? parts.join(" • ") : "General Dental Examination";
}

function formatWaitText(item) {
  const minutes = Number(item?.waitMinutes ?? item?.estimatedWaitMinutes ?? 0);
  if (Number.isFinite(minutes) && minutes > 0) {
    return `~${minutes} mins wait`;
  }
  const status = String(item?.status || "").toUpperCase();
  if (status === "ARRIVED") return "Arrived at Desk";
  if (status === "BOOKED") return item?.startTime ? `Booked for ${item.startTime}` : "Scheduled";
  return "Ready for consultation";
}

function Lobby() {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [audioEnabled, setAudioEnabled] = useState(true);
  const [lastAnnouncedToken, setLastAnnouncedToken] = useState(null);
  const [isAnnouncing, setIsAnnouncing] = useState(false);

  // Live ticking clock
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Fetch appointments data
  const fetchData = useCallback(async (isInitial = false) => {
    try {
      if (isInitial) setLoading(true);
      setError(null);
      const response = await getAllUpcomingAppointments();
      const list = normalizeAppointments(response);
      setAppointments(list.length ? list : demoAppointments);
    } catch (err) {
      if (isInitial) {
        setError(err?.message || "Unable to connect to live queue server. Using display backup.");
        setAppointments(demoAppointments);
      }
    } finally {
      if (isInitial) setLoading(false);
    }
  }, []);

  // Initial load and periodic polling every 12 seconds
  useEffect(() => {
    void fetchData(true);
    const pollInterval = setInterval(() => {
      void fetchData(false);
    }, 12000);
    return () => clearInterval(pollInterval);
  }, [fetchData]);

  // Determine current active calling appointment
  const currentCall = useMemo(() => {
    if (!appointments.length) return demoAppointments[0];
    const calling = appointments.find((item) => {
      const status = String(item?.status || "").toUpperCase();
      return (
        status === "IN_CONSULTATION" ||
        status === "CALLING" ||
        (item?.calledAt && !item?.completedAt)
      );
    });
    return calling || appointments[0] || demoAppointments[0];
  }, [appointments]);

  const isCurrentCallingActive = useMemo(() => {
    if (!currentCall) return false;
    const status = String(currentCall?.status || "").toUpperCase();
    return (
      status === "IN_CONSULTATION" ||
      status === "CALLING" ||
      Boolean(currentCall?.calledAt && !currentCall?.completedAt)
    );
  }, [currentCall]);

  // Speech announcement helper
  const playAnnouncement = useCallback((token, room) => {
    if (!("speechSynthesis" in window)) return;
    try {
      window.speechSynthesis.cancel();
      const cleanToken = token.replace("#", "Token ");
      const utterance = new SpeechSynthesisUtterance(
        `Attention please. ${cleanToken}, please proceed to ${room}.`
      );
      utterance.rate = 0.92;
      utterance.pitch = 1.05;
      setIsAnnouncing(true);
      utterance.onend = () => setIsAnnouncing(false);
      utterance.onerror = () => setIsAnnouncing(false);
      window.speechSynthesis.speak(utterance);
    } catch (e) {
      setIsAnnouncing(false);
    }
  }, []);

  // Trigger announcement when current calling token changes and is active
  useEffect(() => {
    if (!currentCall || !audioEnabled || !isCurrentCallingActive) return;
    const token = getTokenValue(currentCall);
    if (token !== "#—" && token !== lastAnnouncedToken) {
      setLastAnnouncedToken(token);
      playAnnouncement(token, getRoomName(currentCall));
    }
  }, [currentCall, audioEnabled, isCurrentCallingActive, lastAnnouncedToken, playAnnouncement]);

  // Fullscreen toggle handler
  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement
        .requestFullscreen()
        .then(() => setIsFullscreen(true))
        .catch(() => {});
    } else {
      document
        .exitFullscreen()
        .then(() => setIsFullscreen(false))
        .catch(() => {});
    }
  };

  // Filter upcoming queue (excluding active current call)
  const currentToken = getTokenValue(currentCall);
  const upcoming = useMemo(() => {
    return appointments
      .filter((item) => {
        const itemToken = getTokenValue(item);
        const status = String(item?.status || "").toUpperCase();
        const isCurrent =
          itemToken === currentToken ||
          status === "IN_CONSULTATION" ||
          status === "CALLING";
        return !isCurrent;
      })
      .slice(0, 6);
  }, [appointments, currentToken]);


  // Formatted date & time strings
  const timeString = currentTime.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: true,
  });

  const dateString = currentTime.toLocaleDateString("en-US", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  return (
    <div className="w-full font-inter text-slate-700 min-h-screen relative flex flex-col items-center">
      {/* Background ambient lighting orbs */}
      <div className="absolute top-12 left-1/2 -translate-x-1/2 w-[900px] h-[400px] bg-gradient-to-tr from-emerald-400/20 via-teal-300/20 to-emerald-600/15 rounded-full blur-[110px] pointer-events-none -z-10" />
      <div className="absolute bottom-10 right-10 w-[500px] h-[300px] bg-gradient-to-br from-teal-300/15 to-emerald-500/15 rounded-full blur-[90px] pointer-events-none -z-10" />

      <main className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6">
        {/* Top Header Bar */}
        <header className="glass-card p-4 sm:p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 border border-white/80 shadow-glass">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-[#0E7A50] via-emerald-600 to-teal-400 p-0.5 shadow-md shadow-emerald-700/25 flex items-center justify-center shrink-0">
              <div className="w-full h-full bg-white/95 rounded-[14px] flex items-center justify-center text-2xl backdrop-blur-sm">
                🦷
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-manrope font-extrabold text-lg sm:text-xl text-slate-900 tracking-tight">
                  Dental<span className="text-[#0E7A50]">Surgery</span>
                </h1>
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-700 text-[11px] font-bold">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  Live Lobby Display
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Real-Time Queue Token Broadcast & Consultation Wayfinding
              </p>
            </div>
          </div>

          {/* Right Header Controls & Live Clock */}
          <div className="flex flex-wrap items-center justify-between md:justify-end gap-3 sm:gap-4 pt-2 md:pt-0 border-t md:border-t-0 border-slate-100">
            {/* Live Clock Badge */}
            <div className="px-4 py-2 rounded-2xl bg-[#041d14] text-white shadow-md border border-emerald-900/40 flex items-center gap-3">
              <div className="w-2 h-2 rounded-full bg-teal-400 animate-ping" />
              <div className="text-right">
                <div className="font-manrope font-extrabold text-base sm:text-lg tracking-wider text-teal-300">
                  {timeString}
                </div>
                <div className="text-[10px] uppercase font-semibold text-emerald-200/60 tracking-wider">
                  {dateString}
                </div>
              </div>
            </div>

            {/* Quick Action Controls */}
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setAudioEnabled(!audioEnabled)}
                className={`px-3 py-2 rounded-xl text-xs font-bold border transition-all duration-200 flex items-center gap-1.5 shadow-xs ${
                  audioEnabled
                    ? "bg-emerald-50 border-emerald-200 text-emerald-800 hover:bg-emerald-100"
                    : "bg-slate-100 border-slate-200 text-slate-500 hover:bg-slate-200"
                }`}
                title={audioEnabled ? "Voice announcements enabled" : "Voice announcements muted"}
              >
                <span>{audioEnabled ? "🔊" : "🔇"}</span>
                <span className="hidden sm:inline">{audioEnabled ? "Voice On" : "Voice Muted"}</span>
              </button>

              <button
                type="button"
                onClick={() => void fetchData(false)}
                className="p-2 rounded-xl bg-white hover:bg-emerald-50 border border-slate-200 text-slate-600 hover:text-[#0E7A50] transition-all shadow-xs"
                title="Refresh queue now"
              >
                <span className="text-sm">🔄</span>
              </button>

              <button
                type="button"
                onClick={toggleFullscreen}
                className="p-2 rounded-xl bg-white hover:bg-emerald-50 border border-slate-200 text-slate-600 hover:text-[#0E7A50] transition-all shadow-xs"
                title={isFullscreen ? "Exit Fullscreen" : "Enter Fullscreen Kiosk Mode"}
              >
                <span className="text-sm">{isFullscreen ? "✕" : "⛶"}</span>
              </button>
            </div>
          </div>
        </header>

        {error && (
          <div className="rounded-2xl border border-amber-200/90 bg-amber-500/10 p-3.5 text-xs font-medium text-amber-800 backdrop-blur-md flex items-center justify-between gap-3 animate-fadeIn">
            <div className="flex items-center gap-2">
              <span>⚠️</span>
              <span>{error}</span>
            </div>
            <button
              type="button"
              onClick={() => void fetchData(true)}
              className="text-xs font-bold text-amber-900 underline hover:no-underline"
            >
              Retry
            </button>
          </div>
        )}

        {/* Main Grid: Currently Calling Hero + Clinic Info Panel */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
          {/* Hero Calling Card (8 cols) */}
          <section className="lg:col-span-8 rounded-3xl bg-gradient-to-br from-emerald-800 via-[#0E7A50] to-slate-950 p-6 sm:p-8 text-white shadow-2xl relative overflow-hidden border border-white/20 flex flex-col justify-between space-y-6">
            {/* Background glowing gradients */}
            <div className="absolute -top-28 -right-28 w-80 h-80 bg-teal-400/25 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute -bottom-28 -left-28 w-80 h-80 bg-emerald-500/30 rounded-full blur-3xl pointer-events-none" />

            {/* Calling Card Top Row */}
            <div className="relative z-10 flex flex-wrap items-center justify-between gap-3 pb-5 border-b border-white/15">
              <div
                className={`inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-extrabold uppercase tracking-wider backdrop-blur-md border ${
                  isCurrentCallingActive
                    ? "bg-emerald-500/20 border-emerald-400/30 text-emerald-300"
                    : "bg-teal-500/20 border-teal-400/30 text-teal-200"
                }`}
              >
                <span
                  className={`w-2.5 h-2.5 rounded-full ${
                    isCurrentCallingActive ? "bg-emerald-400 animate-ping" : "bg-teal-400 animate-pulse"
                  }`}
                />
                <span>{isCurrentCallingActive ? "Currently Calling" : "Next In Line"}</span>
              </div>

              {/* Announcement Status Tag */}
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() =>
                    playAnnouncement(getTokenValue(currentCall), getRoomName(currentCall))
                  }
                  className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-bold transition-all ${
                    isAnnouncing
                      ? "bg-amber-400 text-slate-900 animate-pulse shadow-md"
                      : "bg-white/10 hover:bg-white/20 text-white/90 border border-white/15"
                  }`}
                  title="Re-play audio chime announcement"
                >
                  <span>📢</span>
                  <span>{isAnnouncing ? "Announcing…" : "Play Chime"}</span>
                </button>
              </div>
            </div>

            {/* Massive Calling Token Visual */}
            <div className="relative z-10 my-2 flex flex-col md:flex-row items-center justify-between gap-6">
              <div className="space-y-2 text-center md:text-left">
                <div className="text-xs font-bold uppercase tracking-[0.2em] text-teal-200">
                  {isCurrentCallingActive ? "Active Consultation Token" : "Upcoming Scheduled Token"}
                </div>
                <div className="text-6xl sm:text-7xl lg:text-8xl font-black font-manrope tracking-tight text-white drop-shadow-[0_10px_25px_rgba(0,0,0,0.45)]">
                  {getTokenValue(currentCall)}
                </div>
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-lg bg-white/10 backdrop-blur-sm text-sm font-semibold text-white/90">
                  <span>👤</span>
                  <span>{getDisplayName(currentCall)}</span>
                </div>
              </div>

              {/* Broadcast Speech Box */}
              <div className="w-full md:max-w-xs rounded-2xl bg-white/10 backdrop-blur-md border border-white/15 p-4.5 space-y-3 shadow-inner">
                <div className="flex items-center justify-between text-[11px] font-bold text-teal-200 uppercase tracking-wider">
                  <span>Audio Guidance</span>
                  <span className="flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    Speaker Active
                  </span>
                </div>
                <div className="p-3 rounded-xl bg-slate-950/40 border border-white/10 text-xs text-white/90 font-medium leading-relaxed">
                  “<strong className="text-teal-300">{getTokenValue(currentCall)}</strong> please
                  proceed to <span className="underline decoration-teal-400">{getRoomName(currentCall)}</span>”
                </div>
                <div className="flex items-center justify-between text-[11px] text-white/70 pt-1">
                  <span>Slot Time:</span>
                  <span className="font-bold text-white">
                    {currentCall?.startTime || "09:00"} {currentCall?.endTime ? `– ${currentCall.endTime}` : ""}
                  </span>
                </div>
              </div>
            </div>

            {/* Procedure & Destination Room Banner */}
            <div className="relative z-10 rounded-2xl bg-white/10 backdrop-blur-md p-4 sm:p-5 border border-white/15 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="text-[11px] uppercase tracking-wider font-bold text-teal-200">
                  {getProcedureLabel(currentCall)}
                </div>
                <div className="font-manrope text-xl sm:text-2xl font-extrabold text-white flex items-center gap-2">
                  <span>🏥</span>
                  <span>{getRoomName(currentCall)}</span>
                </div>
                <div className="text-xs text-white/80 font-medium">
                  {getDoctorName(currentCall)}
                </div>
              </div>

              <div className="sm:text-right space-y-1 border-t sm:border-t-0 pt-3 sm:pt-0 border-white/10">
                <div
                  className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full font-bold text-xs border ${
                    isCurrentCallingActive
                      ? "bg-emerald-400/20 text-emerald-300 border-emerald-400/30"
                      : "bg-teal-400/20 text-teal-200 border-teal-400/30"
                  }`}
                >
                  <span
                    className={`w-1.5 h-1.5 rounded-full ${
                      isCurrentCallingActive ? "bg-emerald-400 animate-ping" : "bg-teal-300"
                    }`}
                  />
                  <span>{isCurrentCallingActive ? "In Session" : "Scheduled Slot"}</span>
                </div>
                <div className="text-xs text-white/75">
                  Dental Surgery Wing • Level 1
                </div>
              </div>
            </div>
          </section>

          {/* Lobby Info & Clinic Guidance Sidebar (4 cols) */}
          <aside className="lg:col-span-4 flex flex-col justify-between gap-4">
            {/* Zone Card */}
            <div className="glass-card p-5 sm:p-6 space-y-4 border border-white/80 shadow-glass">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[#0E7A50]">
                    Clinic Zone
                  </span>
                  <h2 className="font-manrope text-lg font-extrabold text-slate-900">
                    Main Waiting Lobby
                  </h2>
                </div>
                <span className="px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-800 text-xs font-bold border border-emerald-100">
                  Zone A • Fl. 1
                </span>
              </div>

              {/* Wayfinding Visual */}
              <div className="p-4 rounded-2xl bg-gradient-to-br from-emerald-50 to-teal-50/60 border border-emerald-100/80 flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-[#0E7A50] text-white flex items-center justify-center text-2xl shadow-md shadow-emerald-700/20 shrink-0">
                  📍
                </div>
                <div className="space-y-0.5">
                  <div className="text-xs font-bold text-slate-900">
                    Front Desk & Reception
                  </div>
                  <p className="text-[11px] text-slate-500 leading-relaxed">
                    Check-in upon arrival to activate your digital queue token.
                  </p>
                </div>
              </div>

              {/* Live Queue Overview Stats */}
              <div className="grid grid-cols-2 gap-2.5 pt-1">
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80 text-center">
                  <div className="text-xs text-slate-500 font-semibold">Total Waiting</div>
                  <div className="font-manrope text-xl font-black text-[#0E7A50] mt-0.5">
                    {Math.max(upcoming.length, 1)} Patients
                  </div>
                </div>
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80 text-center">
                  <div className="text-xs text-slate-500 font-semibold">Active Rooms</div>
                  <div className="font-manrope text-xl font-black text-emerald-600 mt-0.5">
                    4 Active
                  </div>
                </div>
              </div>
            </div>

            {/* Patient Instructions Card */}
            <div className="glass-card p-5 space-y-3 border border-white/80 shadow-glass">
              <div className="flex items-center gap-2 text-xs font-bold text-slate-900">
                <span>📋</span>
                <span>Patient Lobby Protocol</span>
              </div>
              <ul className="space-y-2 text-xs text-slate-600 leading-relaxed">
                <li className="flex items-start gap-2">
                  <span className="text-[#0E7A50] font-bold">•</span>
                  <span>Please have your <strong>NIC / Patient ID</strong> ready when your token is called.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-[#0E7A50] font-bold">•</span>
                  <span>If your token does not appear within 20 minutes of estimated wait, please visit <strong>Desk 01</strong>.</span>
                </li>
              </ul>
            </div>
          </aside>
        </div>

        {/* Upcoming Queue Section */}
        <section className="space-y-4 pt-2">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-1 border-b border-slate-200/80">
            <div className="flex items-center gap-2.5">
              <h2 className="font-manrope text-xl font-extrabold text-slate-900">
                Upcoming Queue Sequence
              </h2>
              <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-800 text-xs font-bold border border-emerald-200/80">
                {upcoming.length} In Line
              </span>
            </div>
            <span className="text-xs text-slate-500 font-medium">
              Next patients scheduled for consultation in sequential order
            </span>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div
                  key={i}
                  className="glass-card p-5 rounded-2xl border border-white/80 animate-pulse space-y-3"
                >
                  <div className="w-16 h-5 bg-slate-200 rounded-full" />
                  <div className="w-24 h-8 bg-slate-300 rounded-lg" />
                  <div className="w-full h-4 bg-slate-200 rounded" />
                </div>
              ))}
            </div>
          ) : upcoming.length === 0 ? (
            <div className="glass-card p-10 text-center space-y-3 border border-white/80 shadow-glass">
              <div className="text-4xl">✨</div>
              <h3 className="font-manrope text-lg font-bold text-slate-800">
                No Patients in Waiting Sequence
              </h3>
              <p className="text-xs text-slate-500 max-w-md mx-auto">
                All consultation rooms are currently up-to-date. New check-ins from the front desk will appear here automatically.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
              {upcoming.map((item, index) => {
                const statusStr = String(item?.status || "Waiting").trim().toUpperCase();
                const isPreparing = statusStr === "ARRIVED" || index === 0;
                const tokenVal = getTokenValue(item, index);

                return (
                  <div
                    key={item?._id || `${tokenVal}-${index}`}
                    className={`glass-card glass-card-interactive p-4.5 rounded-2xl flex flex-col justify-between space-y-3 transition-all duration-200 ${
                      isPreparing
                        ? "border-amber-200/90 bg-gradient-to-b from-amber-50/70 to-white/90 shadow-md ring-1 ring-amber-300/40"
                        : "border-white/80 bg-white/70 shadow-glass"
                    }`}
                  >
                    {/* Card Top: Position & Status Badge */}
                    <div className="flex items-center justify-between gap-1.5">
                      <span className="text-[10px] font-extrabold uppercase text-slate-400 tracking-wider">
                        Next #{index + 1}
                      </span>
                      <span
                        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-extrabold border ${
                          isPreparing
                            ? "bg-amber-500/15 text-amber-800 border-amber-300/80"
                            : "bg-emerald-500/10 text-emerald-800 border-emerald-200/80"
                        }`}
                      >
                        <span
                          className={`w-1.5 h-1.5 rounded-full ${
                            isPreparing ? "bg-amber-500 animate-pulse" : "bg-emerald-500"
                          }`}
                        />
                        {statusStr === "ARRIVED" ? "Arrived" : isPreparing ? "Preparing" : "Booked"}
                      </span>
                    </div>

                    {/* Token Number & Procedure */}
                    <div>
                      <div className="font-manrope text-2xl font-black text-slate-900 tracking-tight">
                        {tokenVal}
                      </div>
                      <div className="text-xs font-bold text-slate-700 truncate mt-0.5">
                        {getDisplayName(item)}
                      </div>
                      <div className="text-[10px] font-medium text-[#0E7A50] truncate mt-0.5">
                        {getProcedureLabel(item)}
                      </div>
                    </div>

                    {/* Room & Wait Info */}
                    <div className="pt-2 border-t border-slate-100/90 space-y-1 text-[11px]">
                      <div className="text-slate-600 font-medium truncate flex items-center gap-1">
                        <span>🚪</span>
                        <span>{getRoomName(item)}</span>
                      </div>
                      <div className="text-slate-500 font-medium flex items-center gap-1">
                        <span>⏱️</span>
                        <span>{formatWaitText(item)}</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>

        {/* Footer Info Strip */}
        <footer className="pt-4 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500 border-t border-slate-200/60">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            <span>Dental Surgery Clinic Management Queue System (DQMS)</span>
          </div>
          <div className="flex items-center gap-4">
            <span>Room Inquiries: Reception Desk 01</span>
            <span>Emergency Assistance: Ext. 104</span>
          </div>
        </footer>
      </main>
    </div>
  );
}

export default Lobby;