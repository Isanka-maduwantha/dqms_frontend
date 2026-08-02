export const CONFIG = {
    LOGIN_API_URL: import.meta.env.LOGIN_API_URL as string || "http://localhost:3000/api/auth/login"
    ,REGISTER_API_URL: import.meta.env.REGISTER_API_URL as string || "http://localhost:3000/api/auth/register"
};