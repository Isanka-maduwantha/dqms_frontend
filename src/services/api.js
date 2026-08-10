import axios from 'axios';

const API_BASE_URL = 'http://localhost:3000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export const authService = {
  login: (credentials) => api.post('/auth/login', credentials),
  registerUser: (userData) => api.post('/auth/register', userData),
  registerReceptionist: (receptionistData) => api.post('/auth/register-receptionist', receptionistData),
};

export const receptionistService = {
 getTodayAppointments: (date?: string) => api.get('/receptionist/today', { params: { date } }),
  markArrived: (appointmentId) => api.patch(`/receptionist/check-in/${appointmentId}`),
  generateWalkInToken: (walkInData) => api.post('/receptionist/walk-in', walkInData),
  getAllPatients: () => api.get('/receptionist/patients'),
  addPatient: (patientData) => api.post('/receptionist/patient', patientData),
  updatePatient: (patientId, data) => api.patch(`/receptionist/patient/${patientId}`, data),
  deletePatient: (patientId) => api.delete(`/receptionist/patient/${patientId}`),
};

export const appointmentService = {
  getAvailableSlots: (date) => api.get('/appointments/available-slots', { params: { date } }),
  bookAppointment: (bookingData) => api.post('/appointments/book-appointment', bookingData),
};

export const patientService = {
  getUpcomingAppointments: () => api.get('/patient/get-appointments'),
  cancelAppointment: (appointmentId) => api.post('/patient/cancel-appointment', { _id: appointmentId }),
  rescheduleAppointment: (data) => api.post('/patient/reschedule-appointment', data),
  generateSlip: (appointmentId) =>
    api.post('/patient/generate-pdf', { _id: appointmentId }, { responseType: 'blob' }),
};

export default api;