import React, { useState } from "react";
import { CONFIG } from "@config";

interface RegisterFormData {
  Name: string;
  nic: string;
  phone: string;
  email: string;
  password: string;
  confirmPassword: string;
}

function RegisterPage() {
  const [formData, setFormData] = useState<RegisterFormData>({
    Name: "",
    nic: "",
    phone: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  // Fallback endpoint if CONFIG is undefined
  const registerUrl = CONFIG?.REGISTER_API_URL || "http://localhost:3000/api/auth/register";

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);

    // Validation checks
    if (
      !formData.Name ||
      !formData.nic ||
      !formData.phone ||
      !formData.email ||
      !formData.password
    ) {
      setError("Please fill in all required fields.");
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    if (formData.password.length < 8) {
      setError("Password must be at least 8 characters long.");
      return;
    }

    try {
      setIsLoading(true);

      const response = await fetch(registerUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: formData.Name,
          nic: formData.nic,
          phone: formData.phone,
          email: formData.email,
          password: formData.password,
        }),
      });

      // Safely parse JSON or empty response to prevent "Unexpected end of JSON input"
      const text = await response.text();
      const data = text ? JSON.parse(text) : {};

      if (!response.ok) {
        throw new Error(data.message || `Registration failed (Status: ${response.status})`);
      }

      alert("Patient Registration Successful!");

      // Clear form on success
      setFormData({
        Name: "",
        nic: "",
        phone: "",
        email: "",
        password: "",
        confirmPassword: "",
      });
    } catch (err: unknown) {
      const errorMessage =
        err instanceof Error
          ? err.message
          : "Registration failed. Please make sure your server is running on port 3000.";
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      style={{
        maxWidth: "480px",
        margin: "40px auto",
        padding: "24px",
        border: "1px solid #e0e0e0",
        borderRadius: "8px",
        boxShadow: "0 4px 6px rgba(0,0,0,0.05)",
        fontFamily: "sans-serif",
        backgroundColor: "#fff",
      }}
    >
      <h1 style={{ textAlign: "center", marginBottom: "20px", fontSize: "1.75rem", color: "#333" }}>
        Patient Registration
      </h1>

      {error && (
        <div
          style={{
            color: "#d32f2f",
            backgroundColor: "#fde8e8",
            padding: "10px 14px",
            borderRadius: "4px",
            marginBottom: "16px",
            fontSize: "14px",
            textAlign: "center",
          }}
        >
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
        {/* Full Name */}
        <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
          <label htmlFor="Name" style={{ fontWeight: 600, fontSize: "14px" }}>
            Full Name
          </label>
          <input
            id="Name"
            type="text"
            name="Name"
            value={formData.Name}
            onChange={handleChange}
            style={{ padding: "8px 12px", border: "1px solid #ccc", borderRadius: "4px", fontSize: "14px" }}
            required
          />
        </div>

        {/* NIC Number */}
        <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
          <label htmlFor="nic" style={{ fontWeight: 600, fontSize: "14px" }}>
            NIC Number
          </label>
          <input
            id="nic"
            type="text"
            name="nic"
            placeholder="e.g. 199012345678 or 901234567V"
            value={formData.nic}
            onChange={handleChange}
            style={{ padding: "8px 12px", border: "1px solid #ccc", borderRadius: "4px", fontSize: "14px" }}
            required
          />
        </div>

        {/* Phone Number */}
        <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
          <label htmlFor="phone" style={{ fontWeight: 600, fontSize: "14px" }}>
            Phone Number
          </label>
          <input
            id="phone"
            type="tel"
            name="phone"
            placeholder="e.g. 0712345678"
            value={formData.phone}
            onChange={handleChange}
            style={{ padding: "8px 12px", border: "1px solid #ccc", borderRadius: "4px", fontSize: "14px" }}
            required
          />
        </div>

        {/* Email Address */}
        <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
          <label htmlFor="email" style={{ fontWeight: 600, fontSize: "14px" }}>
            Email Address
          </label>
          <input
            id="email"
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            style={{ padding: "8px 12px", border: "1px solid #ccc", borderRadius: "4px", fontSize: "14px" }}
            required
          />
        </div>

        {/* Password */}
        <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
          <label htmlFor="password" style={{ fontWeight: 600, fontSize: "14px" }}>
            Password
          </label>
          <div style={{ display: "flex", gap: "8px" }}>
            <input
              id="password"
              type={showPassword ? "text" : "password"}
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Minimum 8 characters"
              style={{ flex: 1, padding: "8px 12px", border: "1px solid #ccc", borderRadius: "4px", fontSize: "14px" }}
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              aria-label={showPassword ? "Hide password" : "Show password"}
              style={{
                padding: "8px 12px",
                border: "1px solid #ccc",
                borderRadius: "4px",
                backgroundColor: "#f8f9fa",
                cursor: "pointer",
                fontSize: "14px",
              }}
            >
              {showPassword ? "Hide" : "Show"}
            </button>
          </div>
        </div>

        {/* Confirm Password */}
        <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
          <label htmlFor="confirmPassword" style={{ fontWeight: 600, fontSize: "14px" }}>
            Confirm Password
          </label>
          <input
            id="confirmPassword"
            type={showPassword ? "text" : "password"}
            name="confirmPassword"
            value={formData.confirmPassword}
            onChange={handleChange}
            style={{ padding: "8px 12px", border: "1px solid #ccc", borderRadius: "4px", fontSize: "14px" }}
            required
          />
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isLoading}
          style={{
            marginTop: "8px",
            padding: "10px",
            backgroundColor: isLoading ? "#6c757d" : "#0d6efd",
            color: "#fff",
            border: "none",
            borderRadius: "4px",
            fontSize: "16px",
            fontWeight: 600,
            cursor: isLoading ? "not-allowed" : "pointer",
          }}
        >
          {isLoading ? "Registering..." : "Register"}
        </button>
      </form>
    </div>
  );
}

export default RegisterPage;