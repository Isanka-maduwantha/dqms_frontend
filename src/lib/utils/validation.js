/**
 * Standard validation utilities for Dental Surgery Queue Management System
 */

export const EMAIL_REGEX = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
export const SRI_LANKA_NIC_REGEX = /^(\d{9}[vVxX]|\d{12})$/;
export const PHONE_REGEX = /^(\+?\d{1,4}[\s-]?)?\(?\d{2,4}\)?[\s.-]?\d{3,4}[\s.-]?\d{3,4}$|^\d{10}$/;

export function validateEmail(email) {
  if (!email || !email.trim()) return "Email address is required";
  if (!EMAIL_REGEX.test(email.trim())) return "Please enter a valid email address (e.g. name@example.com)";
  return null;
}

export function validateNic(nic) {
  if (!nic || !nic.trim()) return "NIC / ID number is required";
  const trimmed = nic.trim();
  if (!SRI_LANKA_NIC_REGEX.test(trimmed)) {
    return "Enter a valid NIC (9 digits with V/X, or 12 digits)";
  }
  return null;
}

export function validatePhone(phone, required = true) {
  if (!phone || !phone.trim()) {
    return required ? "Phone number is required" : null;
  }
  const clean = phone.replace(/[\s-]/g, "");
  if (clean.length < 9 || clean.length > 15 || !/^\+?\d+$/.test(clean)) {
    return "Enter a valid phone number (e.g. 0712345678 or +94712345678)";
  }
  return null;
}

export function getPasswordStrength(password) {
  if (!password) return { score: 0, label: "Empty", color: "bg-slate-200", rules: [] };

  const rules = [
    { label: "At least 8 characters", met: password.length >= 8 },
    { label: "Contains lowercase letter", met: /[a-z]/.test(password) },
    { label: "Contains uppercase letter", met: /[A-Z]/.test(password) },
    { label: "Contains a number", met: /\d/.test(password) },
    { label: "Contains special symbol (!@#$%^&*)", met: /[^A-Za-z0-9]/.test(password) },
  ];

  const passedCount = rules.filter((r) => r.met).length;
  let score = 0;
  let label = "Very Weak";
  let color = "bg-rose-500";

  if (passedCount <= 1) {
    score = 1;
    label = "Very Weak";
    color = "bg-rose-500";
  } else if (passedCount === 2) {
    score = 2;
    label = "Weak";
    color = "bg-amber-500";
  } else if (passedCount === 3 || passedCount === 4) {
    score = 3;
    label = "Good";
    color = "bg-sky-500";
  } else if (passedCount === 5) {
    score = 4;
    label = "Strong";
    color = "bg-emerald-500";
  }

  return { score, label, color, rules, isStrong: passedCount >= 4 && password.length >= 8 };
}

export function validatePassword(password) {
  if (!password) return "Password is required";
  if (password.length < 8) return "Password must be at least 8 characters long";
  if (!/[A-Z]/.test(password)) return "Password must contain at least one uppercase letter";
  if (!/[a-z]/.test(password)) return "Password must contain at least one lowercase letter";
  if (!/\d/.test(password)) return "Password must contain at least one number";
  return null;
}

export function validateRequired(value, fieldName = "Field") {
  if (value === undefined || value === null || (typeof value === "string" && !value.trim())) {
    return `${fieldName} is required`;
  }
  return null;
}

export function validateNumber(value, { min = 0, max = Infinity, fieldName = "Value" } = {}) {
  const num = Number(value);
  if (isNaN(num)) return `${fieldName} must be a valid number`;
  if (num < min) return `${fieldName} cannot be less than ${min}`;
  if (num > max) return `${fieldName} cannot exceed ${max}`;
  return null;
}
