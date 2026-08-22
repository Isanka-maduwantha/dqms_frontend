export const CONFIG = {
  LOGIN_API_URL:
    (import.meta.env.LOGIN_API_URL as string) ||
    "http://localhost:3000/api/auth/login",
  REGISTER_API_URL:
    (import.meta.env.REGISTER_API_URL as string) ||
    "http://localhost:3000/api/auth/register",
  GET_APPOINTMENTS_URL:
    (import.meta.env.GET_APPOINTMENTS_URL as string) ||
    "http://localhost:3000/api/patient/get-appointments",
  GET_AVAILABLE_SLOTS:
    (import.meta.env.GET_AVAILABLE_SLOTS as string) ||
    "http://localhost:3000/api/appointments/availabe-slots",
  BOOK_APPOINTMENT:
    (import.meta.env.BOOK_APPOINTMENT as string) ||
    "http://localhost:3000/api/appointments/book-appointment",
  CANCEL_APPOINTMENT:
    import.meta.env.CANCEL_APPOINTMENT ||
    "http://localhost:3000/api/patient/cancel-appointment",
};
