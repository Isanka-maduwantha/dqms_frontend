import React, { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEye, faEyeSlash } from "@fortawesome/free-solid-svg-icons";
import FormInput from "../../../components/FormInput";
import { parseJsonResponse } from "../../../lib/utils/http";
import { registerUser } from "../services/authApi";
import type { RegisterFormData } from "../types/auth";
import { NavLink } from "react-router-dom";
import CommonButton from "../../../components/CommanButton";

function RegisterPage() {
  const [formData, setFormData] = useState<RegisterFormData>({
    Name: "",
    nic: "",
    phone: "",
    email: "",
    password: "",
  });

  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [agreeToTerms, setAgreeToTerms] = useState<boolean>(false);
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
        throw new Error(
          (data as { message?: string }).message ||
            `Registration failed (Status: ${response.status})`,
        );
      }

      alert("Patient Registration Successful!");

      // Clear form on success
      setFormData({
        Name: "",
        nic: "",
        phone: "",
        email: "",
        password: "",
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
    <div className="grid grid-cols-10 h-full ">
      <div className="hero-panel col-span-4 bg-accent h-full"></div>
      <div className="form-panel col-span-6 pl-16 pr-16 pt-14 pb-14">
        <div className="header-text">
          <h1 className="text-2xl font-bold text-green-text-1 text-left">
            Create your patient account
          </h1>
          <p className="text-left text-muted-green">
            Provide your identification details to register.
          </p>
        </div>

        {error && <div>{error}</div>}

        <form onSubmit={handleSubmit}>
          {/* Full Name */}
          <FormInput
            padding="24px"
            label="Full Name"
            id="Name"
            name="Name"
            value={formData.Name}
            onChange={handleChange}
            placeholder="Jantha Kumara"
            required
          />

          {/* NIC Number */}
          <FormInput
            label="NIC / Passport / ID number"
            id="nic"
            name="nic"
            placeholder="Enter identification number"
            value={formData.nic}
            onChange={handleChange}
            required
            pattern="^\d{12}[vV]?$"
          />

          <div className="email-psswd-container">
            {/* Email Address */}
            <FormInput
              label="Email address"
              id="email"
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="name@gmail.com"
              required
            />
            {/* Phone Number */}
            <FormInput
              label="Phone number"
              id="phone"
              type="tel"
              name="phone"
              placeholder="e.g. 0712345678"
              value={formData.phone}
              onChange={handleChange}
              required
              pattern="\d{10}"
            />
          </div>
          <div className="password-section relative">
            {/* Password */}
            <FormInput
              label="Password"
              pattern="(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}"
              id="password"
              type={showPassword ? "text" : "password"}
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Min. 8 characters with uppercase, lowercase, number, and symbol"
              required
            />
            <button
              className="absolute right-2 top-10 outline-0"
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? (
                <FontAwesomeIcon size={"xl"} icon={faEyeSlash} className="" />
              ) : (
                <FontAwesomeIcon icon={faEye} size={"xl"} />
              )}
            </button>
          </div>

          <div className="terms flex items-center text-left gap-2 p-4 pl-2  pr-2">
            <input
              type="checkbox"
              name="agreeToterms"
              id="agreeToterms"
              className="bg-white"
              onClick={() => setAgreeToTerms(!agreeToTerms)}
              required
            />
            <label htmlFor="agreeToterms" className="text-[12px]">
              I agree to the Terms of Service and Privacy Policy, including
              secure handling of my health records.
            </label>
          </div>
          {/* Submit Button */}

          <CommonButton
            type="submit"
            disabled={isLoading}
            label={
              isLoading
                ? "Completing registration..."
                : "Complete registration →"
            }
            className=""
            containerProps={{
              className :"w-full",
            }}
          />
        </form>
        <p className="text-[14px] pt-4">
          Already have an account?{" "}
          <NavLink to="/login">
            <span className="text-accent font-bold">Sign in</span>
          </NavLink>
        </p>
      </div>
    </div>
  );
}

export default RegisterPage;
