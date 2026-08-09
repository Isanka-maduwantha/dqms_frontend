export const CONFIG = {
    LOGIN_API_URL: import.meta.env.LOGIN_API_URL as string || "http://localhost:3000/api/auth/login"
    ,REGISTER_API_URL: import.meta.env.REGISTER_API_URL as string || "http://localhost:3000/api/auth/register"
    // Base for Modules 6/7/8 (dentist, billing, inventory) — see src/lib/utils/apiFetch.ts
    ,API_BASE_URL: import.meta.env.API_BASE_URL as string || "http://localhost:3000/api"
};
