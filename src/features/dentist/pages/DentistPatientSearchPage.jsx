import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Card from "../../../components/ui/Card";
import EmptyState from "../../../components/ui/EmptyState";
import FormInput from "../../../components/FormInput";
import { searchDentistPatients } from "../services/dentistApi";

export default function DentistPatientSearchPage() {
  const navigate = useNavigate();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [searched, setSearched] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSearch = async (value) => {
    setQuery(value);
    if (!value.trim()) {
      setResults([]);
      setSearched(false);
      return;
    }
    setLoading(true);
    try {
      const res = await searchDentistPatients(value);
      setResults(res.data || []);
      setSearched(true);
    } catch {
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 text-left max-w-3xl">
      <div>
        <span className="text-xs font-bold text-blue-600 uppercase tracking-wider">
          Clinical Records
        </span>
        <h1 className="font-manrope text-2xl sm:text-3xl font-extrabold text-slate-900 mt-1">
          Patient Dental Charts
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
          Search by patient name, NIC, or email to inspect clinical history and document treatments.
        </p>
      </div>

      <Card className="p-5 border border-white/80">
        <FormInput
          label="Search Patient Chart"
          padding="0"
          placeholder="Type patient name, NIC or email address…"
          value={query}
          icon="🔍"
          onChange={(e) => void handleSearch(e.target.value)}
        />
      </Card>

      {loading && (
        <p className="text-xs text-slate-500 py-6 text-center">Searching patient records…</p>
      )}

      {searched && !loading && results.length === 0 && (
        <EmptyState
          icon="🔍"
          title="No matching patient records"
          description="Try checking the spelling or searching by full NIC number."
        />
      )}

      {results.length > 0 && (
        <Card className="p-0 overflow-hidden border border-white/80 divide-y divide-slate-100">
          {results.map((patient) => (
            <button
              key={patient._id}
              type="button"
              onClick={() => navigate(`/dentist/patients/${patient._id}`)}
              className="w-full text-left px-6 py-4 hover:bg-blue-50/50 transition-colors flex justify-between items-center group cursor-pointer"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-sm">
                  {(patient.name || "P").charAt(0).toUpperCase()}
                </div>
                <div>
                  <p className="font-bold text-slate-900 text-sm group-hover:text-blue-600 transition-colors">
                    {patient.name}
                  </p>
                  <p className="text-xs text-slate-500 mt-0.5">
                    {patient.email} • NIC: <span className="font-mono">{patient.nic || "Not on file"}</span>
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2 text-xs font-bold text-blue-600">
                <span>Open Chart</span>
                <span className="group-hover:translate-x-1 transition-transform">→</span>
              </div>
            </button>
          ))}
        </Card>
      )}
    </div>
  );
}
