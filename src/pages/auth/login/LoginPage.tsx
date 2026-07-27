import React, { useState } from "react";
import { CONFIG } from "@config";
interface LoginFormData {
  email: string;
  password: string;
  rememberMe: boolean;
}
function LoginPage() {
  const [formData, setFormData] = useState<LoginFormData>({
    email: "",
    password: "",
    rememberMe: false,
  });
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);

    if (!formData.email || !formData.password) {
      setError("Please fill in all fields");
      return;
    }
    try {
      setIsLoading(true);
      // Fake Backend Api Call Simulator
      await new Promise((resolve) => {
        setTimeout(resolve, 1500);
      });

      const response = await fetch(`${CONFIG.LOGIN_API_URL}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password,
        }),
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || "Login failed");
      }
      console.log("Successfully logged in", data);
      localStorage.setItem("token", data.token);
      alert("Login Successfull");
    } catch (err) {
      alert("Login Failed");
      setError("Invalid Email or Password, Please try again");
      console.log(error, err);
    } finally {
      setIsLoading(false);
    }
  };
  return (
    <div className="container">
      <h1>Login Page</h1>
      <form onSubmit={handleSubmit} className="w-4/5 m-auto">
        <div>
          <label htmlFor="email">Email Address</label>
          <input
            id="email"
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            required
          ></input>
        </div>

        <div>
          <div className="psswdWrapper">
            <label htmlFor="password">Password</label>
            <input
              id="password"
              type={showPassword ? "text" : "password"}
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="**********"
              required
            ></input>
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              aria-label={showPassword ? "Hide password" : "Show Password"}
            >
              {showPassword ? "Hide" : "Show"}
            </button>
          </div>
          <div className="forget_psswd">
            <a href="#forgor">Forgot Password</a>
          </div>
        </div>
        <div className="checkbox-container">
          <input
            id="rememberMe"
            type="checkbox"
            name="rememberMe"
            checked={formData.rememberMe}
            onChange={handleChange}
          />
          <label htmlFor="rememberMe">Remember me for 30 days</label>
        </div>
        <button type="submit" disabled={isLoading}>
          {isLoading ? "Signing in..." : "Sign In"}
        </button>
      </form>
    </div>
  );
}

export default LoginPage;
