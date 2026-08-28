import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Card from "../../../components/ui/Card";
import Alert from "../../../components/ui/Alert";
import CommonButton from "../../../components/CommanButton";
import { ApiError } from "../../../lib/api/http";
import { callNextPatient } from "../services/dentistApi";

export default function DentistQueuePage() {
  const navigate = useNavigate();
  const [current, setCurrent] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleCallNext = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await callNextPatient();
      setCurrent(res.appointment);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Failed to call next waiting patient.");
    } finally {
      setLoading(false);
    }
  };

  const goToPatient = () => {
    if (!current) return;
    navigate(`/dentist/patients/${current.patientId}`, {
      state: { appointmentId: current.appointmentId },
    });
  };

  return (
    <div className="space-y-6 text-left max-w-3xl">
      <div>
        <span className="text-xs font-bold text-blue-600 uppercase tracking-wider">
          Consultation Room
        </span>
        <h1 className="font-manrope text-2xl sm:text-3xl font-extrabold text-slate-900 mt-1">
          Active Patient Queue
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
          Call the next arrived patient from today's waiting room into your consultation chair.
        </p>
      </div>

      {error && <Alert kind="error">{error}</Alert>}

      <Card className="p-8 sm:p-12 flex flex-col items-center text-center space-y-6 border border-white/80 shadow-glass">
        {!current ? (
          <>
            <div className="relative">
              <div className="w-24 h-24 rounded-full bg-gradient-to-tr from-blue-600 to-sky-400 text-white flex items-center justify-center text-4xl shadow-xl shadow-blue-500/30 animate-pulse-subtle">
                🔔
              </div>
            </div>

            <div className="space-y-1.5 max-w-md">
              <h3 className="font-manrope font-extrabold text-xl text-slate-900">
                Ready for Next Consultation
              </h3>
              <p className="text-xs sm:text-sm text-slate-500 leading-relaxed">
                Click below to notify and pull the next patient in token sequence from the front desk waiting area.
              </p>
            </div>

            <div className="pt-2">
              <CommonButton
                label="⚡ Call Next Waiting Patient"
                loading={loading ? "Calling next patient…" : false}
                disabled={loading}
                onClick={handleCallNext}
                className="px-8 py-3.5 text-sm sm:text-base shadow-lg shadow-blue-600/30 font-extrabold"
                containerProps={{ className: "w-auto" }}
              />
            </div>
          </>
        ) : (
          <div className="w-full space-y-6 animate-scaleIn">
            <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-br from-blue-700 via-blue-600 to-indigo-800 text-white shadow-2xl space-y-4 border border-white/20">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/15 text-sky-200 text-xs font-bold border border-white/20">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span>Currently In Consultation</span>
              </div>

              <div className="flex flex-col items-center">
                <div className="text-xs font-semibold uppercase tracking-widest text-sky-200">
                  Assigned Token
                </div>
                <div className="text-5xl sm:text-6xl font-black font-manrope my-1">
                  #{current.tokenNumber}
                </div>
              </div>

              <div className="pt-4 border-t border-white/15 text-center">
                <h2 className="font-manrope text-2xl font-bold text-white">
                  {current.patientName}
                </h2>
                <p className="text-xs text-blue-100/90 mt-1">
                  {current.phone || "No phone"} • {current.email}
                </p>
                <p className="text-xs text-sky-200 font-semibold mt-1">
                  Slot: {current.startTime} – {current.endTime}
                </p>
              </div>
            </div>

            <div className="flex flex-wrap justify-center gap-3 pt-2">
              <button
                type="button"
                onClick={goToPatient}
                className="px-6 py-3 rounded-2xl glossy-gradient-btn text-white text-xs sm:text-sm font-bold shadow-lg shadow-blue-500/25 flex items-center gap-2 cursor-pointer"
              >
                <span>🦷 Open Patient Dental Chart</span>
                <span>→</span>
              </button>
              <button
                type="button"
                onClick={handleCallNext}
                disabled={loading}
                className="px-5 py-3 rounded-2xl bg-white border border-slate-200 text-slate-700 hover:text-blue-600 hover:bg-slate-50 text-xs sm:text-sm font-bold shadow-xs cursor-pointer disabled:opacity-50"
              >
                {loading ? "Calling…" : "Call Next Patient"}
              </button>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
}
