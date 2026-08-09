import React, { useState } from 'react';

import CommanButton from '../../../components/CommanButton';
import FormInput from '../../../components/FormInput';

interface AddPatientFormProps {
  onSuccess?: () => void;
}

interface CreatePatientResponse {
  success?: boolean;
  message?: string;
  patient?: unknown;
  newPatient?: unknown;
  data?: unknown;
}

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ||
  'http://localhost:3000/api';

const getAuthHeaders = (): HeadersInit => {
  const token = localStorage.getItem('token');

  return {
    'Content-Type': 'application/json',
    ...(token
      ? {
          Authorization: `Bearer ${token}`,
        }
      : {}),
  };
};

const getErrorMessage = (
  data: unknown,
): string => {
  if (
    typeof data === 'object' &&
    data !== null &&
    'message' in data &&
    typeof data.message === 'string'
  ) {
    return data.message;
  }

  if (
    typeof data === 'object' &&
    data !== null &&
    'error' in data &&
    typeof data.error === 'string'
  ) {
    return data.error;
  }

  return 'Failed to register patient.';
};

export function AddPatientForm({
  onSuccess,
}: AddPatientFormProps) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [nic, setNic] = useState('');

  const [loading, setLoading] =
    useState(false);

  const [error, setError] =
    useState<string | null>(null);

  const [successMessage, setSuccessMessage] =
    useState<string | null>(null);

  const handleSubmit = async (
    event: React.FormEvent<HTMLFormElement>,
  ) => {
    event.preventDefault();

    setError(null);
    setSuccessMessage(null);

    // Client-side validation
    if (!name.trim()) {
      setError('Full name is required.');
      return;
    }

    if (!email.trim()) {
      setError('Email address is required.');
      return;
    }

    if (!phone.trim()) {
      setError('Phone number is required.');
      return;
    }

    if (!nic.trim()) {
      setError('NIC / ID is required.');
      return;
    }

    try {
      setLoading(true);

      const token =
        localStorage.getItem('token');

      if (!token) {
        throw new Error(
          'You are not logged in. Please log in again.',
        );
      }

      const response = await fetch(
        `${API_BASE_URL}/receptionist/patient`,
        {
          method: 'POST',
          headers: getAuthHeaders(),
          body: JSON.stringify({
            name: name.trim(),
            email: email.trim(),
            phone: phone.trim(),
            nic: nic.trim(),
          }),
        },
      );

      let responseData: unknown = null;

      try {
        responseData =
          await response.json();
      } catch {
        responseData = null;
      }

      if (!response.ok) {
        throw new Error(
          getErrorMessage(responseData),
        );
      }

      const data =
        responseData as CreatePatientResponse;

      setName('');
      setEmail('');
      setPhone('');
      setNic('');

      setSuccessMessage(
        data.message ||
          'Patient added successfully!',
      );

      onSuccess?.();
    } catch (error: unknown) {
      if (error instanceof Error) {
        setError(error.message);
      } else {
        setError(
          'An unexpected error occurred while registering the patient.',
        );
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-4"
    >
      <h2 className="text-xl font-semibold text-gray-800">
        Add New Patient
      </h2>

      {error && (
        <div
          role="alert"
          className="rounded-md border border-red-300 bg-red-50 p-3 text-sm text-red-700"
        >
          {error}
        </div>
      )}

      {successMessage && (
        <div
          role="status"
          className="rounded-md border border-green-300 bg-green-50 p-3 text-sm text-green-700"
        >
          {successMessage}
        </div>
      )}

      <FormInput
        label="Full Name"
        value={name}
        onChange={(event) =>
          setName(event.target.value)
        }
        required
      />

      <FormInput
        label="Email Address"
        type="email"
        value={email}
        onChange={(event) =>
          setEmail(event.target.value)
        }
        required
      />

      <FormInput
        label="Phone Number"
        type="tel"
        value={phone}
        onChange={(event) =>
          setPhone(event.target.value)
        }
        required
      />

      <FormInput
        label="NIC / ID"
        value={nic}
        onChange={(event) =>
          setNic(event.target.value)
        }
        required
      />

      <CommanButton
        label={
          loading
            ? 'Saving...'
            : 'Save Patient'
        }
        type="submit"
        disabled={loading}
      />
    </form>
  );
}