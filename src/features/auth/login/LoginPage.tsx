import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";

import { getRole, loginUser, saveToken } from "../services/authApi";
import type { LoginFormData } from "../types/auth";
import FormInput from "../../../components/FormInput";
import CommonButton from "../../../components/CommanButton";

export default function LoginPage() {
  const [formData, setFormData] = useState<LoginFormData>({
    email: "",
    password: "",
  });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const navigateToRole = () => {
    const role = getRole();
    navigate(`/${role}/dashboard`);
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await loginUser(formData);
      const data = await response.json();

      if (response.ok || data.success) {
        saveToken(data.token);
        navigateToRole();
      } else {
        alert(data.message || "Login failed");
      }
    } catch (err) {
      console.error("Login error:", err);
    } finally {
      setLoading(false);
    }
  };

  return (

      <div className="grid grid-cols-2 grow  font-inter">
        <div className="body-area col-span-1 bg-accent"></div>
        <div className="form-area col-span-1 pl-15 pr-15 pt-13 pb-13  content-center">
          <div className="content">
            <h2 className="text-2xl text-green-text-1 text-left">
              Welcome Back
            </h2>
            <p className="text-[12px] text-left">
              Enter your credentials to access your portal.
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
            <div className="login-btn pt-3">
              <CommonButton
                label={loading ? "Signing in..." : "Login"}
                type="submit"
                disabled={loading}
                className="pb-3.5 pl-3.25 pr-3.25 pt-3.25"
              />
            </div>
          </form>

          {/* Register Link */}
          <div className="text-[14px] pt-3.5">
            <span>Don't have an account? </span>
            <Link to="/register" className="text-accent font-bold">
              Register here
            </Link>
          </div>
        </div>
      </div>

  );
}
