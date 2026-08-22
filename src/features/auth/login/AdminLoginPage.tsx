import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";

import { adminLogin } from "../services/authApi";
import { useAuth } from "../AuthContext";
import { ApiError } from "../../../lib/api/http";
import type { LoginFormData } from "../types/auth";
import FormInput from "../../../components/FormInput";
import CommonButton from "../../../components/CommanButton";

export default function AdminLoginPage() {
  const [formData, setFormData] = useState<LoginFormData>({
    email: "",
    password: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const data = await adminLogin(formData);
      login(data.token, data.user);
      navigate("/admin/dashboard");
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Login failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="grid grid-cols-2 grow font-inter">
      <div className="body-area col-span-1 bg-cyan-green hidden md:flex items-end p-14">
        <div className="text-white space-y-3 max-w-sm">
          <span className="text-5xl">🛡️</span>
          <h2 className="font-manrope text-2xl font-bold leading-snug">
            Clinic administration
          </h2>
          <p className="text-white/80 text-sm">
            Inventory, revenue, treatment history and staff notifications —
            all in one place.
          </p>
        </div>
      </div>
      <div className="form-area col-span-2 md:col-span-1 pl-8 pr-8 md:pl-15 md:pr-15 pt-13 pb-13 content-center">
        <div className="content">
          <h2 className="text-2xl text-green-text-1 text-left">Administrator sign in</h2>
          <p className="text-[12px] text-left text-muted-green">
            This login is restricted to administrator accounts.
          </p>
        </div>
        <form onSubmit={handleLogin}>
          <FormInput
            label="Email Address"
            type="email"
            value={formData.email}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, email: e.target.value }))
            }
            required
          />
          <FormInput
            label="Password"
            type="password"
            value={formData.password}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, password: e.target.value }))
            }
            required
          />

          {error && (
            <p className="pt-2 text-[12px] text-red-600" role="alert">
              {error}
            </p>
          )}

          <div className="login-btn pt-3">
            <CommonButton
              label={loading ? "Signing in..." : "Login"}
              type="submit"
              disabled={loading}
              className="pb-3.5 pl-3.25 pr-3.25 pt-3.25"
            />
          </div>
        </form>

        <div className="text-[12px] pt-3.5">
          <Link to="/login" className="text-accent font-bold">
            ← Back to patient / staff login
          </Link>
        </div>
      </div>
    </div>
  );
}
