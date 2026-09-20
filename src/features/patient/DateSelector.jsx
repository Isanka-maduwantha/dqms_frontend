import { useEffect, useMemo, useState } from "react";
import { getAvailableSlots } from "./services/patientApi";

function formatDateKey(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export default function DateSelector({ updatePeriods, handleDateUpdate }) {
  const today = useMemo(() => new Date(), []);
  const [selectedDate, setSelectedDate] = useState(formatDateKey(today));

  const fetchPeriods = async (dateStr) => {
    try {
      const res = await getAvailableSlots(dateStr);
      updatePeriods(res.periods || []);
    } catch (err) {
      console.error("Failed to load appointment periods:", err);
      updatePeriods([]);
    }
  };

  const handleDateChange = async (dateStr) => {
    setSelectedDate(dateStr);
    handleDateUpdate(dateStr);
    await fetchPeriods(dateStr);
  };

  useEffect(() => {
    handleDateUpdate(selectedDate);
    void fetchPeriods(selectedDate);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const days = useMemo(() => {
    return Array.from({ length: 7 }, (_, i) => {
      const date = new Date(today.getFullYear(), today.getMonth(), today.getDate() + i);
      return {
        dateKey: formatDateKey(date),
        dayName: date.toLocaleString("en-US", { weekday: "short" }),
        dayNum: date.getDate(),
        isToday: i === 0,
      };
    });
  }, [today]);

  return (
    <div className="glass-card p-5 space-y-4 text-left border border-white/80">
      <div className="flex justify-between items-center">
        <span className="font-manrope font-bold text-sm text-slate-800 flex items-center gap-2">
          <span>📅</span><span>Select Visit Date</span>
        </span>
        <span className="text-xs font-semibold text-[#0E7A50]">Next 7 Days</span>
      </div>

      <div className="grid grid-cols-7 gap-1.5">
        {days.map((day) => (
          <button key={day.dateKey} type="button" onClick={() => void handleDateChange(day.dateKey)}
            className={`flex flex-col items-center justify-center p-2 rounded-2xl transition-all duration-200 cursor-pointer ${selectedDate === day.dateKey ? "glossy-gradient-btn text-white shadow-md font-bold scale-105" : "bg-white/80 hover:bg-white text-slate-700 border border-slate-200/80"}`}>
            <span className="text-[10px] uppercase font-bold opacity-80">{day.dayName}</span>
            <span className="text-sm font-extrabold mt-0.5">{day.dayNum}</span>
            {day.isToday && <span className={`w-1 h-1 rounded-full mt-1 ${selectedDate === day.dateKey ? "bg-white" : "bg-[#0E7A50]"}`} />}
          </button>
        ))}
      </div>

      <div className="pt-2 border-t border-slate-100">
        <label className="text-[11px] font-semibold text-slate-500 block mb-1">Or pick a future calendar date:</label>
        <input type="date" min={formatDateKey(today)} value={selectedDate} onChange={(e) => e.target.value && void handleDateChange(e.target.value)}
          className="w-full bg-white border border-slate-200 rounded-xl px-3 py-1.5 text-xs text-slate-800 outline-none focus:border-[#0E7A50]" />
      </div>
    </div>
  );
}
