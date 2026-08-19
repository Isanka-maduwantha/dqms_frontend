import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Card from "../../../components/ui/Card";
import Alert from "../../../components/ui/Alert";
import CommonButton from "../../../components/CommanButton";
import { ApiError } from "../../../lib/api/http";
import { callNextPatient } from "../services/dentistApi";
import type { CalledAppointment } from "../types/dentist";

export default function DentistQueuePage() {
  const navigate = useNavigate();
  const [current, setCurrent] = useState<CalledAppointment | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleCallNext = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await callNextPatient();
      setCurrent(res.appointment);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Failed to call next patient.");
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
    <div className="flex flex-col gap-6 max-w-3xl">
      <div>
        <h1 className="font-manrope text-2xl font-bold text-green-text-1">Consultation queue</h1>
        <p className="text-[12px] text-muted-green">
          Call the next waiting patient from today's queue.
        </p>
      </div>

      {error && <Alert kind="error">{error}</Alert>}

      <Card className="flex flex-col items-center text-center gap-4 py-10">
        {!current ? (
          <>
            <span className="text-4xl">🔔</span>
            <p className="text-[13px] text-muted-green max-w-sm">
              Press the button below to call the patient with the lowest waiting token.
            </p>
            <CommonButton
              label={loading ? "Calling…" : "Call next patient"}
              disabled={loading}
              onClick={handleCallNext}
              className="text-[14px] px-8 py-3"
              containerProps={{ className: "w-auto" }}
            />
          </>
        ) : (
          <>
            <span className="flex items-center justify-center w-14 h-14 rounded-full bg-accent text-white font-bold text-xl">
              {current.tokenNumber}
            </span>
            <div>
              <p className="font-manrope font-bold text-[18px] text-green-text-1">
                {current.patientName}
              </p>
              <p className="text-[12px] text-muted-green">
                {current.phone} • {current.email}
              </p>
              <p className="text-[11px] text-muted-green pt-1">
                Slot {current.startTime}–{current.endTime}
              </p>
            </div>
            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={goToPatient}
                className="rounded-[10px] bg-accent text-white text-[13px] font-semibold px-5 py-2.5"
              >
                Open patient chart →
              </button>
              <button
                type="button"
                onClick={handleCallNext}
                disabled={loading}
                className="rounded-[10px] border border-border-grey text-green-text-1 text-[13px] font-semibold px-5 py-2.5 disabled:opacity-50"
              >
                {loading ? "Calling…" : "Call next patient"}
              </button>
            </div>
          </>
        )}
      </Card>
    </div>
  );
}
