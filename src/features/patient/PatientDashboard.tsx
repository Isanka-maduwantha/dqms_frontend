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
          throw new Error(`Failed to fetch patient appointments (${response.status})`);
        }

        const res = await response.json();
        const appointments = Array.isArray(res?.upcomingAppointments)
          ? res.upcomingAppointments
          : Array.isArray(res)
            ? res
            : [];

        setData(appointments);
        console.log(appointments)
      } catch (err) {
        console.error("PatientDashboard fetch error:", err);
        setError(err instanceof Error ? err.message : "Something went wrong");
      } finally {
        setLoading(false);
      }
    };

    getAppointments();
  }, []);

  return (
    <div className="grow p-10 pt-9 pb-9 gap-1.5">
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
      <section className="myappointments">
        <table>
          <thead>
            <tr>
              <th>PROVIDER</th>
              <th>DATE & TIME</th>
              <th>TYPE</th>
              <th>STATUS</th>
            </tr>
          </thead>
          
          <tbody>
            {loading && (
              <tr>
                <td colSpan={3}>Loading appointments...</td>
              </tr>
            )}

            {!loading && error && (
              <tr>
                <td colSpan={3} className="text-red-500">
                  {error}
                </td>
              </tr>
            )}

            {!loading && !error &&
              data.map((item) => (
                <tr key={item._id}>
                  <td>{item.doctorName}</td>
                  <td>{`${item.appointmentDate} ${item.startTime}`}</td>
                  <td>{item.type}</td>
                  <td>{item.status}</td>
                </tr>
              ))}
          </tbody> 
        </table>
      </section>
    </div>
  );
}

export default PatientDashboard;
