import React from "react";
import CommanButton from "../../components/CommanButton";

function PatientDashboard() {
  return (
    <div>
      <h1 className="text-left">Appointment Management</h1>
      <p>Cancellations within 24 hours may incur a clinical service fee.</p>
      <CommanButton  label="Book new appointment"/>
    </div>
  );
}

export default PatientDashboard;
