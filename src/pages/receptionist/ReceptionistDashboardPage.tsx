import React, { useState, useEffect } from 'react';

interface Appointment {
  id: string;
  patientName: string;
  timeSlot: string;
  status: string;
}

export const ReceptionistDashboardPage: React.FC = () => {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [patientName, setPatientName] = useState('');
  const [phone, setPhone] = useState('');
  const [generatedToken, setGeneratedToken] = useState<string | null>(null);

  // Updated to Port 3000
  const API_BASE_URL = 'http://localhost:3000/api/receptionist';

  // F-3.1 Fetch initial appointments
  useEffect(() => {
    fetchAppointments();
  }, []);

  const fetchAppointments = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/today`);
      const result = await res.json();
      if (result.success) {
        setAppointments(result.data);
      }
    } catch (err) {
      console.error('Failed to fetch appointments:', err);
    }
  };

  // F-3.1 Mark Patient Arrived
  const handleCheckIn = async (appointmentId: string) => {
    try {
      const res = await fetch(`${API_BASE_URL}/check-in/${appointmentId}`, {
        method: 'PATCH',
      });
      const result = await res.json();
      if (result.success) {
        alert(result.message);
        setAppointments(prev =>
          prev.map(apt => (apt.id === appointmentId ? { ...apt, status: 'Arrived' } : apt))
        );
      }
    } catch (err) {
      console.error('Check-in error:', err);
    }
  };

  // F-3.2 Generate Walk-In Token & Update Table Live
  const handleWalkInSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch(`${API_BASE_URL}/walk-in`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ patientName, phone }),
      });
      const result = await res.json();
      if (result.success) {
        setGeneratedToken(result.token);

        // Add the new walk-in patient directly to the table list
        const newWalkIn: Appointment = {
          id: result.token,
          patientName: patientName,
          timeSlot: `Walk-In (${result.token})`,
          status: 'Arrived',
        };

        setAppointments(prev => [...prev, newWalkIn]);
        setPatientName('');
        setPhone('');
      }
    } catch (err) {
      console.error('Walk-in token error:', err);
    }
  };

  // F-3.3 Reschedule Appointment Slot
  const handleReschedule = async (appointmentId: string) => {
    const newSlot = prompt('Enter new time slot (e.g., "10:30 AM" or "02:00 PM"):');
    if (!newSlot) return;

    try {
      const res = await fetch(`${API_BASE_URL}/reschedule/${appointmentId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ newSlot }),
      });
      const result = await res.json();
      if (result.success) {
        alert(result.message);
        // Update slot locally in state
        setAppointments(prev =>
          prev.map(apt => (apt.id === appointmentId ? { ...apt, timeSlot: newSlot } : apt))
        );
      }
    } catch (err) {
      console.error('Reschedule error:', err);
    }
  };

  // F-3.4 Emergency Priority Override
  const handleEmergencyPriority = async (tokenId: string) => {
    try {
      const res = await fetch(`${API_BASE_URL}/priority/${tokenId}`, {
        method: 'PATCH',
      });
      const result = await res.json();
      if (result.success) {
        alert(result.message);
      }
    } catch (err) {
      console.error('Priority flag error:', err);
    }
  };

  return (
    <div style={{ padding: '24px', fontFamily: 'sans-serif', maxWidth: '950px', margin: '0 auto' }}>
      <h2>Module 3: Receptionist & Front Desk Operations</h2>

      {/* F-3.2 Walk-In Token Generator */}
      <section style={{ background: '#f8f9fa', padding: '16px', borderRadius: '8px', marginBottom: '24px', border: '1px solid #e9ecef' }}>
        <h3>F-3.2: Walk-In Token Generator</h3>
        <form onSubmit={handleWalkInSubmit} style={{ display: 'flex', gap: '12px' }}>
          <input
            type="text"
            placeholder="Patient Name"
            value={patientName}
            onChange={e => setPatientName(e.target.value)}
            style={{ padding: '8px', flex: 1 }}
            required
          />
          <input
            type="text"
            placeholder="Phone Number"
            value={phone}
            onChange={e => setPhone(e.target.value)}
            style={{ padding: '8px', flex: 1 }}
            required
          />
          <button type="submit" style={{ padding: '8px 16px', backgroundColor: '#0d6efd', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
            Generate Token
          </button>
        </form>

        {generatedToken && (
          <div style={{ marginTop: '12px', padding: '12px', background: '#e7f5ff', border: '1px solid #a5d8ff', borderRadius: '4px' }}>
            <strong>Generated Token:</strong> <span style={{ fontSize: '1.2rem', color: '#1864ab' }}>{generatedToken}</span>
          </div>
        )}
      </section>

      {/* F-3.1, F-3.3 & F-3.4 Daily Check-In & Queue Management */}
      <section style={{ background: '#fff', padding: '16px', borderRadius: '8px', border: '1px solid #dee2e6' }}>
        <h3>F-3.1, F-3.3 & F-3.4: Daily Operations & Queue Management</h3>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ borderBottom: '2px solid #dee2e6', textAlign: 'left' }}>
              <th style={{ padding: '8px' }}>Slot / Token</th>
              <th style={{ padding: '8px' }}>Patient Name</th>
              <th style={{ padding: '8px' }}>Status</th>
              <th style={{ padding: '8px' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {appointments.map(apt => (
              <tr key={apt.id} style={{ borderBottom: '1px solid #e9ecef' }}>
                <td style={{ padding: '8px', fontWeight: 'bold' }}>{apt.timeSlot}</td>
                <td style={{ padding: '8px' }}>{apt.patientName}</td>
                <td style={{ padding: '8px' }}>
                  <span style={{
                    padding: '4px 8px',
                    borderRadius: '4px',
                    fontSize: '12px',
                    backgroundColor: apt.status === 'Arrived' ? '#d1e7dd' : '#fff3cd',
                    color: apt.status === 'Arrived' ? '#0f5132' : '#664d03'
                  }}>
                    {apt.status}
                  </span>
                </td>
                <td style={{ padding: '8px', display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                  {apt.status !== 'Arrived' && (
                    <button
                      onClick={() => handleCheckIn(apt.id)}
                      style={{ padding: '4px 10px', backgroundColor: '#198754', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
                    >
                      Mark Arrived
                    </button>
                  )}
                  {/* F-3.3 Reschedule Action */}
                  <button
                    onClick={() => handleReschedule(apt.id)}
                    style={{ padding: '4px 10px', backgroundColor: '#0dcaf0', color: '#000', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
                  >
                    📅 Reschedule
                  </button>
                  {/* F-3.4 Emergency Priority Action */}
                  <button
                    onClick={() => handleEmergencyPriority(apt.id)}
                    style={{ padding: '4px 10px', backgroundColor: '#dc3545', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
                  >
                    🚨 Priority
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </div>
  );
};