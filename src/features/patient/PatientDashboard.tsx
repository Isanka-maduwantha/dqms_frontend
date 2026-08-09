import React, { useState, useEffect } from "react";
import { type ApointmentData } from "./types/patient";
import CommanButton from "../../components/CommanButton";
import { NavLink } from "react-router-dom";
import { CONFIG } from "@config";
function PatientDashboard() {
  const [data, setData] = useState<ApointmentData[]>([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const getAppointments = async () => {
      const token = localStorage.getItem("token");

      try {
        setLoading(true);
        setError(null);

        if (!token) {
          throw new Error("No auth token found. Please log in again.");
        }

        const response = await fetch(CONFIG.GET_APPOINTMENTS_URL, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          throw new Error(
            `Failed to fetch patient appointments (${response.status})`,
          );
        }

        const res = await response.json();
        const appointments = Array.isArray(res?.upcomingAppointments)
          ? res.upcomingAppointments
          : Array.isArray(res)
            ? res
            : [];

        setData(appointments);
        console.log(appointments);
      } catch (err) {
        console.error("PatientDashboard fetch error:", err);
        setData([]);
        setError(err instanceof Error ? err.message : "Something went wrong");
      } finally {
        setLoading(false);
      }
    };

    getAppointments();
  }, []);

  async function onCancel(id: string) {
    const token = localStorage.getItem("token");
    try {
      const response = await fetch(CONFIG.CANCEL_APPOINTMENT, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          _id: id,
        }),
      });
      if (!response.ok) throw new Error(`Server Error", ${response.status}`);
      const result = await response.json();
      console.log(result.message);
    } catch (err) {
      console.log("Error", err);
    }
  }
  return (
    <div className="grow p-10 pt-9 pb-9 flex flex-col gap-5">
      <section className="flex flex-col pb-2 gap-6">
        <NavLink to="/login" className="text-[12px]">
          ← Return to login{" "}
        </NavLink>
        <div className="flex justify-between">
          <div className="main-text text-left gap-1.5">
            <h1 className=" text-2xl text-green-text-1 ">
              Appointment Management
            </h1>
            <p className=" text-[12px] text-muted-green">
              Cancellations within 24 hours may incur a clinical service fee.
            </p>
          </div>
          <NavLink to="/patient/book-appointment">
            <CommanButton
              label="📅 Book new appointment"
              className="text-[13px] pl-4.5 pt-2.5 pb-2.5 pr-4.5 font-inter "
            />
          </NavLink>
        </div>
      </section>
      <div className="card p-5 gap-2.5 bg-cyan-green rounded-[14px]">
        <span className="pill bg-[#fff3] text-white p-2.5 pt-1 pb-1 poiner rounded-full text-[11px]">
          Active care plan
        </span>
        <p className="text-[19px] font-manrope text-white">
          Manage your health journey with precision.
        </p>
      </div>
      <section className="myappointments  border border-border-grey rounded-[10px] p-3 pt-3.5 flex flex-col gap-4">
        <div className="appointment-timeframe flex gap-5 h-5">
          <span className=" inline-block text-cyan-green border-b-2 pb-1 border-b-cyan-green text-[13px] font-bold">
            Upcoming
          </span>
          <span className="  text-cyan-green pb-1  border-b-cyan-green text-[13px] font-bold">
            Past Visits
          </span>
        </div>

        <div className="w-full text-left text-sm text-slate-800">
          {/* Table Header */}
          <div className="grid grid-cols-12 border-b border-gray-100 pb-4 text-[11px] font-semibold tracking-wider text-gray-500">
            <div className="relative col-span-3">PROVIDER</div>
            <div className="col-span-3">DATE & TIME</div>
            <div className="col-span-2">TYPE</div>
            <div className="col-span-2">STATUS</div>
            <div className="col-span-2"></div>
          </div>

          {/* Table Body */}
          <div className="divide-y divide-gray-100">
            {loading && (
              <div className="py-6 text-center text-gray-500">
                Loading appointments...
              </div>
            )}

            {!loading && error && (
              <div className="py-6 text-center text-red-500">{error}</div>
            )}

            {!loading &&
              !error &&
              data.map((item) => (
                <div
                  key={item._id}
                  className="grid grid-cols-12 items-center pt-3.5 pb-3.5 hover:bg-gray-50/50 text-[11px]"
                >
                  {/* Provider */}
                  <div className="col-span-3 pr-4">
                    <div className="font-bold text-gray-900">
                      {item.doctorName}
                    </div>
                    {item.specialty && (
                      <div className="text-xs text-gray-500">
                        {item.specialty}
                      </div>
                    )}
                  </div>

                  {/* Date & Time */}
                  <div className="col-span-3 pr-4 text-gray-700">
                    {`${item.appointmentDate} • ${item.startTime}`}
                  </div>

                  {/* Type */}
                  <div className="col-span-2 pr-4 text-gray-700">
                    {item.type}
                  </div>

                  {/* Status */}
                  <div className="col-span-2 pr-4">
                    <span className="inline-block rounded-full bg-emerald-100/70 px-3 py-1 text-[11px] font-semibold text-emerald-800">
                      {item.status}
                    </span>
                  </div>

                  {/* Actions */}
                  <div className="col-span-2">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        type="button"
                        onClick={() => onReschedule?.(item._id)}
                        className="rounded-xl border border-gray-300 px-4 py-1.5 text-xs font-semibold text-gray-800 hover:bg-gray-50 cursor-pointer"
                      >
                        Reschedule
                      </button>
                      <button
                        disabled={item.status == "CANCELLED"}
                        type="button"
                        onClick={() => onCancel?.(item._id)}
                        className={`rounded-xl border border-gray-300 px-4 py-1.5 text-xs font-semibold text-gray-800${item.status == "CANCELLED" ? " border-white" : " cursor-pointer  hover:bg-border-grey "}`}
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                </div>
              ))}
          </div>
        </div>
      </section>
    </div>
  );
}

export default PatientDashboard;
