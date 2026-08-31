import { useState } from "react";
import { useNavigate } from "react-router-dom";
import FormInput from "../../../components/FormInput";
import CommonButton from "../../../components/CommanButton";
import Alert from "../../../components/ui/Alert";
import { registerUser } from "../services/authApi";
import { ApiError } from "../../../lib/api/http";
import {
  validateEmail,
  validateNic,
  validatePhone,
  getPasswordStrength,
} from "../../../lib/utils/validation";

function RegisterFrom() {
  const [formData, setFormData] = useState({
    Name: "",
    nic: "",
    phone: "",
    email: "",
    password: "",
  });
  const [fieldErrors, setFieldErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [agreeToTerms, setAgreeToTerms] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const passwordStrength = getPasswordStrength(formData.password);

  const validate = () => {
    const errors = {};
    if (!formData.Name || formData.Name.trim().length < 2) {
      errors.Name = "Full name is required (minimum 2 characters)";
    }

    const nicErr = validateNic(formData.nic);
    if (nicErr) errors.nic = nicErr;

    const emailErr = validateEmail(formData.email);
    if (emailErr) errors.email = emailErr;

    const phoneErr = validatePhone(formData.phone);
    if (phoneErr) errors.phone = phoneErr;

    if (!formData.password || formData.password.length < 8) {
      errors.password = "Password must be at least 8 characters long";
    }

    if (!agreeToTerms) {
      errors.terms = "You must agree to the Terms of Service & Privacy Policy";
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    if (fieldErrors[name]) {
      setFieldErrors((prev) => ({ ...prev, [name]: null }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (!validate()) return;

    try {
      setIsLoading(true);
      await registerUser({
        name: formData.Name.trim(),
        nic: formData.nic.trim().toUpperCase(),
        phone: formData.phone.trim(),
        email: formData.email.trim(),
        password: formData.password,
      });

      setSuccess("Account successfully created! Redirecting you to sign in…");
      setTimeout(() => {
        navigate("/login");
      }, 1800);
    } catch (err) {
      const errorMessage =
        err instanceof ApiError
          ? err.message
          : "Registration failed. Please make sure your server is running.";
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-4 text-left">
      {error && <Alert kind="error">{error}</Alert>}
      {success && <Alert kind="success">{success}</Alert>}

      <form onSubmit={handleSubmit} noValidate className="space-y-3.5">
        {/* Full Name */}
        <FormInput
          label="Full Legal Name"
          id="Name"
          name="Name"
          padding="0"
          value={formData.Name}
          onChange={handleChange}
          placeholder="e.g. Jayantha Perera"
          error={fieldErrors.Name}
          icon="👤"
          required
        />

        {/* NIC / ID */}
        <FormInput
          label="NIC / National Identity Card"
          id="nic"
          name="nic"
          padding="0"
          placeholder="e.g. 199012345678 or 901234567V"
          value={formData.nic}
          onChange={handleChange}
          error={fieldErrors.nic}
          hint="Supports 12-digit format or 9-digit format with V/X"
          icon="🪪"
          required
        />

        {/* Contact info grid */}
        <div className="grid sm:grid-cols-2 gap-3.5">
          <FormInput
            label="Email Address"
            id="email"
            type="email"
            name="email"
            padding="0"
            value={formData.email}
            onChange={handleChange}
            placeholder="patient@example.com"
            error={fieldErrors.email}
            icon="✉️"
            required
          />

          <FormInput
            label="Phone Number"
            id="phone"
            type="tel"
            name="phone"
            padding="0"
            placeholder="e.g. 0771234567"
            value={formData.phone}
            onChange={handleChange}
            error={fieldErrors.phone}
            icon="📞"
            required
          />
        </div>

        {/* Password */}
        <div className="space-y-1.5">
          <FormInput
            label="Password"
            id="password"
            name="password"
            padding="0"
            type={showPassword ? "text" : "password"}
            value={formData.password}
            onChange={handleChange}
            placeholder="Minimum 8 characters"
            error={fieldErrors.password}
            icon="🔒"
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

          {/* Password strength meter */}
          {formData.password && (
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80 space-y-2 animate-fadeIn">
              <div className="flex justify-between items-center text-[11px] font-bold">
                <span className="text-slate-600">Password Strength:</span>
                <span
                  className={`font-bold ${
                    passwordStrength.score >= 3
                      ? "text-emerald-600"
                      : passwordStrength.score === 2
                      ? "text-amber-600"
                      : "text-rose-600"
                  }`}
                >
                  {passwordStrength.label}
                </span>
              </div>
              <div className="w-full h-1.5 bg-slate-200 rounded-full overflow-hidden flex gap-1">
                {[1, 2, 3, 4].map((step) => (
                  <div
                    key={step}
                    className={`h-full flex-1 rounded-full transition-all duration-300 ${
                      step <= passwordStrength.score ? passwordStrength.color : "bg-slate-200"
                    }`}
                  />
                ))}
              </div>
              <div className="grid grid-cols-2 gap-1 pt-1 text-[10px]">
                {passwordStrength.rules.map((rule, idx) => (
                  <div
                    key={idx}
                    className={`flex items-center gap-1.5 ${
                      rule.met ? "text-emerald-600 font-semibold" : "text-slate-400"
                    }`}
                  >
                    <span>{rule.met ? "✓" : "○"}</span>
                    <span>{rule.label}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Terms and conditions */}
        <div className="pt-2">
          <label className="flex items-start gap-2.5 text-xs text-slate-600 cursor-pointer select-none">
            <input
              type="checkbox"
              id="agreeToterms"
              checked={agreeToTerms}
              onChange={(e) => {
                setAgreeToTerms(e.target.checked);
                if (fieldErrors.terms) {
                  setFieldErrors((prev) => ({ ...prev, terms: null }));
                }
              }}
              className="mt-0.5 rounded border-slate-300 text-[#0E7A50] focus:ring-emerald-500 cursor-pointer"
            />
            <span className="leading-tight">
              I agree to the <span className="text-[#0E7A50] font-semibold">Terms of Service</span> and{" "}
              <span className="text-[#0E7A50] font-semibold">Privacy Policy</span>, including secure electronic storage of my dental health records.
            </span>
          </label>
          {fieldErrors.terms && (
            <p className="mt-1 text-[11px] font-semibold text-rose-600 flex items-center gap-1">
              <span>⚠️</span>
              <span>{fieldErrors.terms}</span>
            </p>
          )}
        </div>

        {/* Submit button */}
        <div className="pt-3">
          <CommonButton
            type="submit"
            loading={isLoading ? "Registering profile…" : false}
            disabled={isLoading || Boolean(success)}
            label="Complete Registration →"
            className="w-full py-3 text-sm shadow-md"
          />
        </div>
      </form>
    </div>
  );
}

export default RegisterFrom;
