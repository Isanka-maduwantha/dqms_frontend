import { useEffect, useMemo, useState } from "react";
import { useAuth } from "../auth/AuthContext";
import { ApiError } from "../../lib/api/http";
import Card from "../../components/ui/Card";
import FormInput from "../../components/FormInput";
import FormSelect from "../../components/FormSelect";
import CommonButton from "../../components/CommanButton";
import { changeMyPassword, getMyProfile, updateMyProfile } from "./services/profileApi";

const ROLE_LABELS = {
  patient: "Patient",
  receptionist: "Receptionist",
  dentist: "Dentist",
  admin: "Administrator",
};

const EMPTY_PROFILE = {
  name: "",
  nic: "",
  phone: "",
  email: "",
  dateOfBirth: "",
  gender: "",
  address: "",
  emergencyContact: { name: "", phone: "", relationship: "" },
  bloodGroup: "",
  allergies: [],
  medicalConditions: [],
  medications: [],
  insuranceProvider: "",
  insuranceNumber: "",
  employeeId: "",
  jobTitle: "",
  department: "",
  branch: "",
  joiningDate: "",
  employmentStatus: "",
  professionalRegistrationNumber: "",
  qualifications: "",
  specialization: "",
  yearsOfExperience: "",
  languages: [],
  professionalBio: "",
};

function dateOnly(value) {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return date.toISOString().slice(0, 10);
}

function arrayToText(value) {
  return Array.isArray(value) ? value.join(", ") : value || "";
}

function textToArray(value) {
  return String(value || "")
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

function normalizeProfile(user) {
  return {
    ...EMPTY_PROFILE,
    ...user,
    dateOfBirth: dateOnly(user?.dateOfBirth),
    joiningDate: dateOnly(user?.joiningDate),
    yearsOfExperience: user?.yearsOfExperience ?? "",
    allergies: Array.isArray(user?.allergies) ? user.allergies : [],
    medicalConditions: Array.isArray(user?.medicalConditions) ? user.medicalConditions : [],
    medications: Array.isArray(user?.medications) ? user.medications : [],
    languages: Array.isArray(user?.languages) ? user.languages : [],
    emergencyContact: {
      ...EMPTY_PROFILE.emergencyContact,
      ...(user?.emergencyContact || {}),
    },
  };
}

function SectionHeader({ eyebrow, title, description }) {
  return (
    <div className="mb-5">
      <p className="text-[10px] font-extrabold uppercase tracking-[0.18em] text-[#0E7A50]">{eyebrow}</p>
      <h2 className="font-manrope text-lg font-extrabold text-slate-900 mt-1">{title}</h2>
      {description ? <p className="text-xs text-slate-500 mt-1 max-w-2xl">{description}</p> : null}
    </div>
  );
}

function ReadOnlyField({ label, value, hint }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-slate-50/80 px-4 py-3">
      <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">{label}</div>
      <div className="text-sm font-bold text-slate-700 mt-1 break-words">{value || "Not assigned"}</div>
      {hint ? <div className="text-[10px] text-slate-400 mt-1">{hint}</div> : null}
    </div>
  );
}

export default function ManageProfilePage() {
  const { user, updateUser } = useAuth();
  const role = user?.role || "patient";
  const roleLabel = ROLE_LABELS[role] || "User";

  const [profile, setProfile] = useState(EMPTY_PROFILE);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [loadingError, setLoadingError] = useState("");
  const [saveMessage, setSaveMessage] = useState("");
  const [saveError, setSaveError] = useState("");

  const [password, setPassword] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [passwordSaving, setPasswordSaving] = useState(false);
  const [passwordMessage, setPasswordMessage] = useState("");
  const [passwordError, setPasswordError] = useState("");

  const initials = useMemo(() => {
    const source = profile.name || profile.email || "U";
    return source
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part.charAt(0).toUpperCase())
      .join("");
  }, [profile.name, profile.email]);

  useEffect(() => {
    let mounted = true;

    async function load() {
      setLoading(true);
      setLoadingError("");
      try {
        const response = await getMyProfile();
        if (mounted) setProfile(normalizeProfile(response.user));
      } catch (error) {
        if (mounted) {
          setLoadingError(error instanceof ApiError ? error.message : "Failed to load your profile.");
        }
      } finally {
        if (mounted) setLoading(false);
      }
    }

    void load();
    return () => {
      mounted = false;
    };
  }, []);

  function setField(field, value) {
    setProfile((current) => ({ ...current, [field]: value }));
    setSaveMessage("");
    setSaveError("");
  }

  function setEmergencyField(field, value) {
    setProfile((current) => ({
      ...current,
      emergencyContact: { ...current.emergencyContact, [field]: value },
    }));
    setSaveMessage("");
    setSaveError("");
  }

  async function handleSave(event) {
    event.preventDefault();
    setSaving(true);
    setSaveMessage("");
    setSaveError("");

    const payload = {
      name: profile.name,
      nic: profile.nic,
      phone: profile.phone,
      email: profile.email,
      dateOfBirth: profile.dateOfBirth,
      gender: profile.gender,
      address: profile.address,
      emergencyContact: profile.emergencyContact,
    };

    if (role === "patient") {
      payload.bloodGroup = profile.bloodGroup;
      payload.allergies = textToArray(profile.allergies);
      payload.medicalConditions = textToArray(profile.medicalConditions);
      payload.medications = textToArray(profile.medications);
      payload.insuranceProvider = profile.insuranceProvider;
      payload.insuranceNumber = profile.insuranceNumber;
    }

    if (role === "dentist") {
      payload.professionalRegistrationNumber = profile.professionalRegistrationNumber;
      payload.qualifications = profile.qualifications;
      payload.specialization = profile.specialization;
      payload.yearsOfExperience = profile.yearsOfExperience === "" ? null : Number(profile.yearsOfExperience);
      payload.languages = textToArray(profile.languages);
      payload.professionalBio = profile.professionalBio;
    }

    try {
      const response = await updateMyProfile(payload);
      const normalized = normalizeProfile(response.user);
      setProfile(normalized);
      updateUser(normalized);
      setSaveMessage(response.message || "Profile updated successfully.");
    } catch (error) {
      setSaveError(error instanceof ApiError ? error.message : "Failed to save your profile.");
    } finally {
      setSaving(false);
    }
  }

  async function handlePasswordChange(event) {
    event.preventDefault();
    setPasswordSaving(true);
    setPasswordMessage("");
    setPasswordError("");

    try {
      const response = await changeMyPassword(password);
      setPassword({ currentPassword: "", newPassword: "", confirmPassword: "" });
      setPasswordMessage(response.message || "Password changed successfully.");
    } catch (error) {
      setPasswordError(error instanceof ApiError ? error.message : "Failed to change password.");
    } finally {
      setPasswordSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="max-w-5xl mx-auto py-12 text-center text-slate-500 text-sm">
        <div className="mx-auto mb-3 h-7 w-7 rounded-full border-2 border-emerald-200 border-t-[#0E7A50] animate-spin" />
        Loading your profile…
      </div>
    );
  }

  if (loadingError) {
    return (
      <div className="max-w-5xl mx-auto py-10">
        <Card>
          <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-700">
            {loadingError}
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6 text-left">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <p className="text-xs font-bold uppercase tracking-wider text-[#0E7A50]">Account</p>
          <h1 className="font-manrope text-2xl sm:text-3xl font-extrabold text-slate-900 mt-1">Manage Profile</h1>
          <p className="text-sm text-slate-500 mt-1">Keep your {roleLabel.toLowerCase()} profile and account information up to date.</p>
        </div>
        <div className="flex items-center gap-3 rounded-2xl border border-emerald-100 bg-white/70 px-4 py-3 shadow-sm">
          <div className="h-11 w-11 rounded-full bg-gradient-to-tr from-[#0E7A50] to-teal-400 text-white flex items-center justify-center font-extrabold text-sm">
            {initials}
          </div>
          <div>
            <div className="font-bold text-slate-900 text-sm">{profile.name || "Your profile"}</div>
            <div className="text-[11px] text-slate-500">{roleLabel}</div>
          </div>
        </div>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        <Card>
          <SectionHeader eyebrow="Personal" title="Personal information" description="These details identify you in the clinic system." />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-5">
            <FormInput label="Full name" id="profile-name" value={profile.name} onChange={(e) => setField("name", e.target.value)} required padding="0" />
            <FormInput label="NIC / National ID" id="profile-nic" value={profile.nic} onChange={(e) => setField("nic", e.target.value)} required padding="0" />
            <FormInput label="Date of birth" id="profile-dob" type="date" value={profile.dateOfBirth} onChange={(e) => setField("dateOfBirth", e.target.value)} padding="16px" />
            <FormSelect label="Gender" id="profile-gender" value={profile.gender} onChange={(e) => setField("gender", e.target.value)} padding="16px">
              <option value="">Select gender</option>
              <option value="male">Male</option>
              <option value="female">Female</option>
              <option value="other">Other</option>
              <option value="prefer_not_to_say">Prefer not to say</option>
            </FormSelect>
            <FormInput label="Phone" id="profile-phone" value={profile.phone} onChange={(e) => setField("phone", e.target.value)} padding="16px" />
            <FormInput label="Email" id="profile-email" type="email" value={profile.email} onChange={(e) => setField("email", e.target.value)} required padding="16px" />
            <div className="md:col-span-2">
              <FormInput label="Address" id="profile-address" value={profile.address} onChange={(e) => setField("address", e.target.value)} padding="16px" />
            </div>
          </div>
        </Card>

        <Card>
          <SectionHeader eyebrow="Emergency" title="Emergency contact" description="A trusted contact the clinic can reach when necessary." />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-x-5">
            <FormInput label="Contact name" id="emergency-name" value={profile.emergencyContact.name} onChange={(e) => setEmergencyField("name", e.target.value)} padding="0" />
            <FormInput label="Contact phone" id="emergency-phone" value={profile.emergencyContact.phone} onChange={(e) => setEmergencyField("phone", e.target.value)} padding="16px" />
            <FormInput label="Relationship" id="emergency-relationship" value={profile.emergencyContact.relationship} onChange={(e) => setEmergencyField("relationship", e.target.value)} padding="16px" />
          </div>
        </Card>

        {role === "patient" && (
          <Card>
            <SectionHeader eyebrow="Patient" title="Medical information" description="Keep this information current. Detailed dental history is managed separately by the clinic." />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-5">
              <FormSelect label="Blood group" id="blood-group" value={profile.bloodGroup} onChange={(e) => setField("bloodGroup", e.target.value)} padding="0">
                <option value="">Select blood group</option>
                {['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].map((group) => <option key={group} value={group}>{group}</option>)}
              </FormSelect>
              <FormInput label="Insurance provider" id="insurance-provider" value={profile.insuranceProvider} onChange={(e) => setField("insuranceProvider", e.target.value)} padding="16px" />
              <FormInput label="Allergies" id="allergies" value={arrayToText(profile.allergies)} onChange={(e) => setField("allergies", e.target.value)} hint="Separate multiple items with commas." padding="16px" />
              <FormInput label="Current medications" id="medications" value={arrayToText(profile.medications)} onChange={(e) => setField("medications", e.target.value)} hint="Separate multiple items with commas." padding="16px" />
              <FormInput label="Medical conditions" id="medical-conditions" value={arrayToText(profile.medicalConditions)} onChange={(e) => setField("medicalConditions", e.target.value)} hint="Separate multiple items with commas." padding="16px" />
              <FormInput label="Insurance / Member number" id="insurance-number" value={profile.insuranceNumber} onChange={(e) => setField("insuranceNumber", e.target.value)} padding="16px" />
            </div>
          </Card>
        )}

        {(role === "receptionist" || role === "dentist" || role === "admin") && (
          <Card>
            <SectionHeader eyebrow="Employment" title="Clinic employment information" description="These fields are controlled by clinic administration and are shown here for reference." />
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              <ReadOnlyField label="Employee ID" value={profile.employeeId} />
              <ReadOnlyField label="Job title" value={profile.jobTitle || roleLabel} />
              <ReadOnlyField label="Department" value={profile.department} />
              <ReadOnlyField label="Branch" value={profile.branch} />
              <ReadOnlyField label="Joining date" value={profile.joiningDate || "Not assigned"} />
              <ReadOnlyField label="Employment status" value={profile.employmentStatus ? profile.employmentStatus.replaceAll("_", " ") : "Not assigned"} />
            </div>
          </Card>
        )}

        {role === "dentist" && (
          <Card>
            <SectionHeader eyebrow="Professional" title="Dental professional information" description="Keep your professional information accurate for the clinic and patient-facing records." />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-5">
              <FormInput label="Professional registration number" id="registration-number" value={profile.professionalRegistrationNumber} onChange={(e) => setField("professionalRegistrationNumber", e.target.value)} padding="0" />
              <FormInput label="Specialization" id="specialization" value={profile.specialization} onChange={(e) => setField("specialization", e.target.value)} padding="16px" />
              <FormInput label="Qualifications" id="qualifications" value={profile.qualifications} onChange={(e) => setField("qualifications", e.target.value)} padding="16px" />
              <FormInput label="Years of experience" id="years-experience" type="number" min="0" step="1" value={profile.yearsOfExperience} onChange={(e) => setField("yearsOfExperience", e.target.value)} padding="16px" />
              <FormInput label="Languages" id="languages" value={arrayToText(profile.languages)} onChange={(e) => setField("languages", e.target.value)} hint="Separate multiple languages with commas." padding="16px" />
              <div className="md:col-span-2 pt-4">
                <label htmlFor="professional-bio" className="font-inter text-xs font-bold text-slate-700 mb-1.5 block">Professional bio</label>
                <textarea id="professional-bio" value={profile.professionalBio} onChange={(e) => setField("professionalBio", e.target.value)} rows={4} className="w-full bg-white/80 border border-slate-200/90 rounded-xl py-2.5 px-3.5 text-sm text-slate-800 placeholder:text-slate-400 outline-none transition-all shadow-sm focus:border-[#0E7A50] focus:ring-3 focus:ring-emerald-400/20 focus:bg-white resize-y" placeholder="Short professional introduction" />
              </div>
            </div>
          </Card>
        )}

        <Card>
          <SectionHeader eyebrow="Account" title="Account information" description="Your role is assigned by the clinic and cannot be changed from this page." />
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <ReadOnlyField label="Account role" value={roleLabel} />
            <ReadOnlyField label="Account email" value={profile.email} />
            <ReadOnlyField label="User ID" value={profile._id || profile.id} hint="Used internally by the clinic system." />
          </div>
        </Card>

        {(saveError || saveMessage) && (
          <div className={`rounded-xl px-4 py-3 text-sm font-semibold ${saveError ? "border border-rose-200 bg-rose-50 text-rose-700" : "border border-emerald-200 bg-emerald-50 text-emerald-700"}`}>
            {saveError || saveMessage}
          </div>
        )}

        <div className="flex justify-end">
          <CommonButton label={saving ? "Saving…" : "Save Profile Changes"} disabled={saving} type="submit" className="px-5 py-2.5 text-xs" />
        </div>
      </form>

      <form onSubmit={handlePasswordChange}>
        <Card>
          <SectionHeader eyebrow="Security" title="Change password" description="Use a strong password of at least 8 characters. Changing it does not change your clinic role." />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-x-5">
            <FormInput label="Current password" id="current-password" type="password" value={password.currentPassword} onChange={(e) => setPassword((p) => ({ ...p, currentPassword: e.target.value }))} required padding="0" autoComplete="current-password" />
            <FormInput label="New password" id="new-password" type="password" value={password.newPassword} onChange={(e) => setPassword((p) => ({ ...p, newPassword: e.target.value }))} required padding="16px" minLength={8} autoComplete="new-password" />
            <FormInput label="Confirm new password" id="confirm-password" type="password" value={password.confirmPassword} onChange={(e) => setPassword((p) => ({ ...p, confirmPassword: e.target.value }))} required padding="16px" minLength={8} autoComplete="new-password" />
          </div>
          {(passwordError || passwordMessage) && (
            <div className={`mt-5 rounded-xl px-4 py-3 text-sm font-semibold ${passwordError ? "border border-rose-200 bg-rose-50 text-rose-700" : "border border-emerald-200 bg-emerald-50 text-emerald-700"}`}>
              {passwordError || passwordMessage}
            </div>
          )}
          <div className="flex justify-end mt-5">
            <CommonButton label={passwordSaving ? "Changing…" : "Change Password"} disabled={passwordSaving} type="submit" className="px-5 py-2.5 text-xs" />
          </div>
        </Card>
      </form>
    </div>
  );
}
