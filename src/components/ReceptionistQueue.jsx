import React, { useEffect, useState } from 'react';
import { receptionistService } from '../services/api';

export default function ReceptionistQueue() {
  const [appointments, setAppointments] = useState([]);

  useEffect(() => {
    loadTodayQueue();
  }, []);

  const loadTodayQueue = async () => {
    try {
      const response = await receptionistService.getTodayAppointments();
      setAppointments(response.data.data);
    } catch (err) {
      console.error('Failed to load appointments:', err);
    }
  };

  const handleCheckIn = async (appointmentId) => {
    try {
      await receptionistService.markArrived(appointmentId);
      loadTodayQueue(); // Refresh queue list
    } catch (err) {
      console.error('Failed to check in patient:', err);
    }
  };

  return (
    <div style={{ background: '#fff', padding: '20px', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
      <h2>Today's Patient Queue</h2>
      {appointments.length === 0 ? (
        <p>No appointments found for today.</p>
      ) : (
        <ul style={{ listStyleType: 'none', padding: 0 }}>
          {appointments.map((apt) => (
            <li key={apt._id} style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid #eee' }}>
              <div>
                <strong>{apt.patientId?.name || 'Walk-in Patient'}</strong> - Time: {apt.startTime} | Status: <span style={{ color: apt.status === 'ARRIVED' ? 'green' : 'orange' }}>{apt.status}</span>
              </div>
              {apt.status === 'BOOKED' && (
                <button 
                  onClick={() => handleCheckIn(apt._id)}
                  style={{ background: '#2563eb', color: '#fff', border: 'none', padding: '6px 12px', borderRadius: '4px', cursor: 'pointer' }}
                >
                  Mark Arrived
                </button>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}