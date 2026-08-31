import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { adminLogin } from "../services/authApi";
import { useAuth } from "../AuthContext";
import { ApiError } from "../../../lib/api/http";
import FormInput from "../../../components/FormInput";
import CommonButton from "../../../components/CommanButton";
import Alert from "../../../components/ui/Alert";
import { validateEmail } from "../../../lib/utils/validation";

export default function AdminLoginPage() {
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
      const data = await adminLogin(formData);
      login(data.token, data.user);
      navigate("/admin/dashboard");
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Administrator authentication failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="grow min-h-[calc(100vh-5rem)] flex items-center justify-center p-4 sm:p-8">
      <div className="w-full max-w-5xl grid lg:grid-cols-12 rounded-3xl overflow-hidden glass-card border border-white/80 shadow-2xl">
        {/* Left Hero Panel */}
        <div className="lg:col-span-5 bg-gradient-to-br from-slate-900 via-[#041d14] to-[#06281e] p-8 sm:p-12 text-white flex flex-col justify-between relative overflow-hidden hidden md:flex">
          <div className="absolute -top-20 -right-20 w-60 h-60 bg-teal-500/15 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-20 -left-20 w-60 h-60 bg-emerald-600/20 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center text-2xl shadow-inner">
              🛡️
            </div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-teal-400 block">
              Restricted Access
            </span>
            <h2 className="font-manrope text-2xl sm:text-3xl font-extrabold text-white leading-tight">
              Clinical operations & management console.
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              Consumables inventory, automated low-stock warnings, revenue audits, and operational reports.
            </p>
          </div>

          <div className="relative z-10 space-y-2 pt-6 border-t border-white/10 text-xs text-slate-300">
            <div className="flex items-center gap-2">
              <span className="text-emerald-400 font-bold">●</span>
              <span>Encrypted Session Management</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-emerald-400 font-bold">●</span>
              <span>Role-Based Permissions</span>
            </div>
          </div>
        </div>

        {/* Right Form Panel */}
        <div className="lg:col-span-7 p-8 sm:p-12 lg:p-14 flex flex-col justify-center bg-white/70 backdrop-blur-xl">
          <div className="mb-6 text-left">
            <span className="text-xs font-bold text-[#0E7A50] uppercase tracking-wider">
              Administration Area
            </span>
            <h1 className="font-manrope text-2xl sm:text-3xl font-extrabold text-slate-900 mt-1">
              Administrator sign in
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Please enter your administrator credentials to continue.
            </p>
          </div>

          {error && (
            <div className="mb-4">
              <Alert kind="error">{error}</Alert>
            </div>
          )}

          <form onSubmit={handleLogin} noValidate className="space-y-4 text-left">
            <FormInput
              label="Admin Email Address"
              type="email"
              id="admin-email"
              padding="0"
              placeholder="admin@dentalsurgery.com"
              value={formData.email}
              error={fieldErrors.email}
              icon="🛡️"
              onChange={(e) => {
                setFormData((prev) => ({ ...prev, email: e.target.value }));
                if (fieldErrors.email) setFieldErrors((prev) => ({ ...prev, email: null }));
              }}
              required
            />

            <FormInput
              label="Password"
              type={showPassword ? "text" : "password"}
              id="admin-password"
              padding="0"
              placeholder="Enter administrator password"
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
                label="Sign in as Administrator"
                type="submit"
                loading={loading ? "Verifying clearance…" : false}
                className="w-full py-3 text-sm shadow-md"
              />
            </div>
          </form>

          <div className="pt-6 mt-6 border-t border-slate-100 text-xs text-slate-600 text-center">
            <Link to="/login" className="text-[#0E7A50] font-bold hover:underline">
              ← Return to patient & staff sign in
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
