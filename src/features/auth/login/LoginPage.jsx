import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { loginUser } from "../services/authApi";
import { useAuth } from "../AuthContext";
import { ApiError } from "../../../lib/api/http";
import FormInput from "../../../components/FormInput";
import CommonButton from "../../../components/CommanButton";
import Alert from "../../../components/ui/Alert";
import { validateEmail } from "../../../lib/utils/validation";

const ROLE_HOME = {
  patient: "/patient/dashboard",
  receptionist: "/receptionist/dashboard",
  dentist: "/dentist/dashboard",
  admin: "/admin/dashboard",
};

export default function LoginPage() {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [fieldErrors, setFieldErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const { login } = useAuth();

  const validate = () => {
    const errors = {};
    const emailErr = validateEmail(formData.email);
    if (emailErr) errors.email = emailErr;
    if (!formData.password) errors.password = "Password is required";

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    setError(null);
    try {
      const data = await loginUser(formData);
      login(data.token, data.user);
      navigate(ROLE_HOME[data.user.role] || "/");
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Login failed. Please check your credentials.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="grow min-h-[calc(100vh-5rem)] flex items-center justify-center p-4 sm:p-8">
      <div className="w-full max-w-5xl grid lg:grid-cols-12 rounded-3xl overflow-hidden glass-card border border-white/80 shadow-2xl">
        {/* Left Hero Brand Panel */}
        <div className="lg:col-span-5 bg-gradient-to-br from-emerald-800 via-[#0E7A50] to-teal-900 p-8 sm:p-12 text-white flex flex-col justify-between relative overflow-hidden hidden md:flex">
          <div className="absolute -top-20 -right-20 w-60 h-60 bg-teal-400/20 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-20 -left-20 w-60 h-60 bg-emerald-500/30 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center text-2xl shadow-inner">
              🦷
            </div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-teal-200 block">
              Dental Surgery Portal
            </span>
            <h2 className="font-manrope text-2xl sm:text-3xl font-extrabold text-white leading-tight">
              One unified platform for your entire visit.
            </h2>
            <p className="text-xs sm:text-sm text-emerald-100/80 leading-relaxed">
              Patients, front desk reception, dentists and clinic administrators all work from the same live clinical record.
            </p>
          </div>

          <div className="relative z-10 space-y-3 pt-8 border-t border-white/15 text-xs text-emerald-100">
            <div className="flex items-center gap-2.5">
              <span className="w-5 h-5 rounded-full bg-emerald-400/20 text-emerald-300 flex items-center justify-center font-bold">✓</span>
              <span>Live token queue tracking</span>
            </div>
            <div className="flex items-center gap-2.5">
              <span className="w-5 h-5 rounded-full bg-emerald-400/20 text-emerald-300 flex items-center justify-center font-bold">✓</span>
              <span>Digital diagnosis & treatment history</span>
            </div>
            <div className="flex items-center gap-2.5">
              <span className="w-5 h-5 rounded-full bg-emerald-400/20 text-emerald-300 flex items-center justify-center font-bold">✓</span>
              <span>Itemized invoicing & payment records</span>
            </div>
          </div>
        </div>

        {/* Right Form Panel */}
        <div className="lg:col-span-7 p-8 sm:p-12 lg:p-14 flex flex-col justify-center bg-white/70 backdrop-blur-xl">
          <div className="mb-6 text-left">
            <span className="text-xs font-bold text-[#0E7A50] uppercase tracking-wider">
              Patient & Staff Sign In
            </span>
            <h1 className="font-manrope text-2xl sm:text-3xl font-extrabold text-slate-900 mt-1">
              Welcome back
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Enter your registered email and password to access your portal.
            </p>
          </div>

          {error && (
            <div className="mb-4">
              <Alert kind="error">{error}</Alert>
            </div>
          )}

          <form onSubmit={handleLogin} noValidate className="space-y-4 text-left">
            <FormInput
              label="Email Address"
              type="email"
              id="email"
              padding="0"
              placeholder="name@example.com"
              value={formData.email}
              error={fieldErrors.email}
              icon="✉️"
              onChange={(e) => {
                setFormData((prev) => ({ ...prev, email: e.target.value }));
                if (fieldErrors.email) setFieldErrors((prev) => ({ ...prev, email: null }));
              }}
              required
            />

            <FormInput
              label="Password"
              type={showPassword ? "text" : "password"}
              id="password"
              padding="0"
              placeholder="Enter your password"
              value={formData.password}
              error={fieldErrors.password}
              icon="🔒"
              onChange={(e) => {
                setFormData((prev) => ({ ...prev, password: e.target.value }));
                if (fieldErrors.password) setFieldErrors((prev) => ({ ...prev, password: null }));
              }}
              rightElement={
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="text-xs font-bold text-slate-500 hover:text-[#0E7A50] focus:outline-none px-1"
                >
                  {showPassword ? "Hide" : "Show"}
                </button>
              }
              required
            />

            <div className="pt-2">
              <CommonButton
                label="Sign in to Account"
                type="submit"
                loading={loading ? "Signing in…" : false}
                className="w-full py-3 text-sm shadow-md"
              />
            </div>
          </form>

          <div className="pt-6 mt-6 border-t border-slate-100 text-xs text-slate-600 flex flex-col sm:flex-row items-center justify-between gap-3">
            <div>
              <span>New patient? </span>
              <Link to="/register" className="text-[#0E7A50] font-bold hover:underline">
                Create account →
              </Link>
            </div>
            <div>
              <Link to="/admin/login" className="text-slate-500 hover:text-[#0E7A50] font-semibold">
                🛡️ Admin Sign In
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
