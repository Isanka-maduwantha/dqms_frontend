import { useCallback, useEffect, useMemo, useState } from "react";
import { getAvailableSlots } from "./services/patientApi";

function formatDateKey(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export default function DateSelector({ updateSlots, handleDateUpdate }) {
  const today = useMemo(() => new Date(), []);
  const [selectedDate, setSelectedDate] = useState(formatDateKey(today));

  const fetchAvailableSlots = useCallback(
    async (dateStr) => {
      try {
        const res = await getAvailableSlots(dateStr);
        const slotArray = (res.slots || [])
          .filter((slot) => slot.available)
          .map((slot) => slot.time);
        updateSlots(slotArray);
      } catch (err) {
        console.error("Failed to load slots for date:", err);
        updateSlots([]);
      }
    },
    [updateSlots]
  );

  const handleDateChange = useCallback(
    async (dateStr) => {
      setSelectedDate(dateStr);
      handleDateUpdate(dateStr);
      await fetchAvailableSlots(dateStr);
    },
    [fetchAvailableSlots, handleDateUpdate]
  );

  useEffect(() => {
    handleDateUpdate(selectedDate);
    void fetchAvailableSlots(selectedDate);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const days = useMemo(() => {
    const list = [];
    for (let i = 0; i < 7; i += 1) {
      const newDate = new Date(today.getFullYear(), today.getMonth(), today.getDate() + i);
      list.push({
        date: newDate,
        dateKey: formatDateKey(newDate),
        dayName: newDate.toLocaleString("en-US", { weekday: "short" }),
        dayNum: newDate.getDate(),
        monthName: newDate.toLocaleString("en-US", { month: "short" }),
        isToday: i === 0,
      });
    }
    return list;
  }, [today]);

  return (
    <div className="glass-card p-5 space-y-4 text-left border border-white/80">
      <div className="flex justify-between items-center">
        <span className="font-manrope font-bold text-sm text-slate-800 flex items-center gap-2">
          <span>📅</span>
          <span>Select Visit Date</span>
        </span>
        <span className="text-xs font-semibold text-blue-600">
          Next 7 Days
        </span>
      </div>

      {/* 7-Day Quick Strip */}
      <div className="grid grid-cols-7 gap-1.5">
        {days.map((day) => {
          const isSelected = selectedDate === day.dateKey;
          return (
            <button
              key={day.dateKey}
              type="button"
              onClick={() => handleDateChange(day.dateKey)}
              className={`flex flex-col items-center justify-center p-2 rounded-2xl transition-all duration-200 cursor-pointer ${
                isSelected
                  ? "glossy-gradient-btn text-white shadow-md shadow-blue-500/30 font-bold scale-105"
                  : "bg-white/80 hover:bg-white text-slate-700 border border-slate-200/80 hover:border-blue-300 shadow-2xs"
              }`}
            >
              <span className="text-[10px] uppercase font-bold opacity-80">
                {day.dayName}
              </span>
              <span className="text-sm font-extrabold mt-0.5">
                {day.dayNum}
              </span>
              {day.isToday && (
                <span className={`w-1 h-1 rounded-full mt-1 ${isSelected ? "bg-white" : "bg-blue-600"}`} />
              )}
            </button>
          );
        })}
      </div>

      {/* Manual Date Input Fallback */}
      <div className="pt-2 border-t border-slate-100">
        <label className="text-[11px] font-semibold text-slate-500 block mb-1">
          Or pick a future calendar date:
        </label>
        <input
          type="date"
          min={formatDateKey(today)}
          value={selectedDate}
          onChange={(e) => {
            if (e.target.value) {
              void handleDateChange(e.target.value);
            }
          }}
          className="w-full bg-white border border-slate-200 rounded-xl px-3 py-1.5 text-xs text-slate-800 outline-none focus:border-blue-500"
        />
      </div>
    </div>
  );
}
