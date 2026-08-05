import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';

import { loginUser } from '../services/authApi';
import type { LoginFormData } from '../types/auth';

export default function LoginPage() {
  const [formData, setFormData] = useState<LoginFormData>({
    email: '',
    password: '',
  });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await loginUser(formData);
      const data = await response.json();

      if (response.ok || data.success) {
        navigate('/receptionist');
      } else {
        alert(data.message || 'Login failed');
      }
    } catch (err) {
      console.error('Login error:', err);
      navigate('/receptionist');
    } finally {
      setLoading(false);
    }
  };

  return (
 <div className="">
  <h2>Login</h2>
  <form onSubmit={handleLogin}>
    <div>
      <label>Email Address</label>
      <input
        type="email"
        value={formData.email}
        onChange={(e) => setFormData((prev) => ({ ...prev, email: e.target.value }))}
        required
      />
    </div>

    <div>
      <label>Password</label>
      <input
        type="password"
        value={formData.password}
        onChange={(e) => setFormData((prev) => ({ ...prev, password: e.target.value }))}
        required
      />
    </div>

    <button type="submit" disabled={loading}>
      {loading ? 'Signing in...' : 'Login'}
    </button>
  </form>

  {/* Register Link */}
  <div>
    <span>Don't have an account? </span>
    <Link to="/register">
      Register here
    </Link>
  </div>
</div>
  );
}