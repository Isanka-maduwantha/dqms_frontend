import React, { useState } from "react";

import { parseJsonResponse } from "../../../lib/utils/http";
import { registerUser } from "../services/authApi";
import type { RegisterFormData } from "../types/auth";

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

      const response = await registerUser({
        name: formData.Name,
        nic: formData.nic,
        phone: formData.phone,
        email: formData.email,
        password: formData.password,
      });

      const data = await parseJsonResponse<{ message?: string }>(response);

      if (!response.ok) {
        throw new Error((data as { message?: string }).message || `Registration failed (Status: ${response.status})`);
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
<div>
  <h1>Patient Registration</h1>

  {error && <div>{error}</div>}

  <form onSubmit={handleSubmit}>
    {/* Full Name */}
    <div>
      <label htmlFor="Name">Full Name</label>
      <input
        id="Name"
        type="text"
        name="Name"
        value={formData.Name}
        onChange={handleChange}
        required
      />
    </div>

    {/* NIC Number */}
    <div>
      <label htmlFor="nic">NIC Number</label>
      <input
        id="nic"
        type="text"
        name="nic"
        placeholder="e.g. 199012345678 or 901234567V"
        value={formData.nic}
        onChange={handleChange}
        required
      />
    </div>

    {/* Phone Number */}
    <div>
      <label htmlFor="phone">Phone Number</label>
      <input
        id="phone"
        type="tel"
        name="phone"
        placeholder="e.g. 0712345678"
        value={formData.phone}
        onChange={handleChange}
        required
      />
    </div>

    {/* Email Address */}
    <div>
      <label htmlFor="email">Email Address</label>
      <input
        id="email"
        type="email"
        name="email"
        value={formData.email}
        onChange={handleChange}
        required
      />
    </div>

    {/* Password */}
    <div>
      <label htmlFor="password">Password</label>
      <div>
        <input
          id="password"
          type={showPassword ? "text" : "password"}
          name="password"
          value={formData.password}
          onChange={handleChange}
          placeholder="Minimum 8 characters"
          required
        />
        <button
          type="button"
          onClick={() => setShowPassword(!showPassword)}
          aria-label={showPassword ? "Hide password" : "Show password"}
        >
          {showPassword ? "Hide" : "Show"}
        </button>
      </div>
    </div>

    {/* Confirm Password */}
    <div>
      <label htmlFor="confirmPassword">Confirm Password</label>
      <input
        id="confirmPassword"
        type={showPassword ? "text" : "password"}
        name="confirmPassword"
        value={formData.confirmPassword}
        onChange={handleChange}
        required
      />
    </div>

    {/* Submit Button */}
    <button type="submit" disabled={isLoading}>
      {isLoading ? "Registering..." : "Register"}
    </button>
  </form>
</div>
  );
}

export default RegisterPage;