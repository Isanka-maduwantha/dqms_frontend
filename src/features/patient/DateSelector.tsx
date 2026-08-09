import { useCallback, useEffect, useMemo, useState } from "react";
import CommonButton from "../../components/CommanButton";
import { CONFIG } from "@config";

interface ChildProps {
  handleDateUpdate: (date: string) => void;
  updateSlots: (slots: string[]) => void;
}

export default function DateSelector({
  updateSlots,
  handleDateUpdate,
}: ChildProps) {
  const today = useMemo(() => new Date(), []);
  const [selectedDate, setSelectedDate] = useState<string>(
    formatDateKey(today),
  );

  const fetchAvailableSlots = useCallback(
    async (dateStr: string) => {
      const token = localStorage.getItem("token");
      const url = `${CONFIG.GET_AVAILABLE_SLOTS}?date=${dateStr}`;

      try {
        const response = await fetch(url, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          throw new Error("Slots fetching error");
        }

        const res = await response.json();
        const slots = Array.isArray(res?.slots) ? res.slots : [];
        const slotArray = (slots as Array<string | { time?: string }>).reduce<
          string[]
        >((acc, slot) => {
          const slotTime = typeof slot === "string" ? slot : slot.time;

          if (slotTime) {
            acc.push(slotTime);
          }

          return acc;
        }, []);

        updateSlots(slotArray);
      } catch (err) {
        console.error(err);
        updateSlots([]);
      }
    },
    [updateSlots],
  );
  const handleDateChange = useCallback(
    async (dateStr: string) => {
      setSelectedDate(dateStr);
      handleDateUpdate(dateStr);
      await fetchAvailableSlots(dateStr);
    },
    [fetchAvailableSlots, handleDateUpdate],
  );

  useEffect(() => {
    handleDateUpdate(selectedDate);
    void fetchAvailableSlots(selectedDate);
  }, []);

  return (
    <div className="rounded-[14px] p-5.5 flex flex-col gap-1.5 border border-border-grey">
      <p className="font-manrope text-[15px] text-green-text-1">Select date</p>
      <GetNextSevenDays
        date={today}
        selectedDate={selectedDate}
        setDate={handleDateChange}
        
      />
      <hr className="bg-border-grey border border-border-grey" />
    </div>
  );
}

function getDateName(date: Date) {
  return date.toLocaleString("en-US", { weekday: "long" });
}

type Day = {
  date: Date;
  name: string;
  number: number;
};

function formatDateKey(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function GetNextSevenDays({
  date,
  selectedDate,
  setDate,
}: {
  date: Date;
  selectedDate: string;
  setDate: (date: string) => void;
}) {
  const days: Day[] = [];

  for (let i = 0; i < 7; i += 1) {
    const newDate = new Date(
      date.getFullYear(),
      date.getMonth(),
      date.getDate() + i,
    );

    days.push({
      date: newDate,
      name: getDateName(newDate),
      number: newDate.getDate(),
    });
  }

  return (
    <div className="cal flex flex-col gap-2 pb-4.5">
      <div className="dname flex gap-1.5 w-full">
        {days.map((day, index) => (
          <span
            key={`${day.name}-${index}`}
            className="text-center align-middle flex justify-center items-center w-7 h-6.75 pt-1.5 pb-1.5 text-[12px]"
          >
            {day.name.slice(0, 2)}
          </span>
        ))}
      </div>

      <div className="dnum flex gap-1.5 w-full">
        {days.map((day, index) => {
          const dateValue = formatDateKey(day.date);
          const isSelected = selectedDate === dateValue;

          return (
            <CommonButton
              key={`${day.number}-${index}`}
              type="button"
              onClick={() => setDate(dateValue)}
              style={{ color: "#000", fontSize:"12px" }}
              className={`cursor-pointer text-center align-middle flex justify-center items-center w-7 h-6.75 pt-1.5 pb-1.5 text-[12px] rounded-md ${
                isSelected
                  ? "bg-accent! text-white!"
                  : "bg-white text-green-text-1"
              }`}
              label={day.number.toString()}
            />
          );
        })}
      </div>
    </div>
  );
}
