import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Card from "../../../components/ui/Card";
import EmptyState from "../../../components/ui/EmptyState";
import FormInput from "../../../components/FormInput";
import { searchDentistPatients } from "../services/dentistApi";
import type { DentistPatient } from "../types/dentist";

export default function DentistPatientSearchPage() {
  const navigate = useNavigate();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<DentistPatient[]>([]);
  const [searched, setSearched] = useState(false);

  const handleSearch = async (value: string) => {
    setQuery(value);
    if (!value.trim()) {
      setResults([]);
      setSearched(false);
      return;
    }
    const res = await searchDentistPatients(value);
    setResults(res.data);
    setSearched(true);
  };

  return (
    <div className="flex flex-col gap-6 max-w-3xl">
      <div>
        <h1 className="font-manrope text-2xl font-bold text-green-text-1">Find a patient</h1>
        <p className="text-[12px] text-muted-green">
          Search by name, NIC or email to open their dental chart.
        </p>
      </div>

      <FormInput
        label="Search"
        padding="0"
        placeholder="Name, NIC or email…"
        value={query}
        onChange={(e) => handleSearch(e.target.value)}
      />

      {searched && results.length === 0 && (
        <EmptyState icon="🔍" title="No matching patients" />
      )}

      {results.length > 0 && (
        <Card className="divide-y divide-border-grey p-0 overflow-hidden">
          {results.map((patient) => (
            <button
              key={patient._id}
              type="button"
              onClick={() => navigate(`/dentist/patients/${patient._id}`)}
              className="w-full text-left px-5 py-3.5 hover:bg-gray-50 flex justify-between items-center"
            >
              <div>
                <p className="font-bold text-green-text-1 text-[13px]">{patient.name}</p>
                <p className="text-[11px] text-muted-green">
                  {patient.email} • {patient.nic || "No NIC on file"}
                </p>
              </div>
              <span className="text-muted-green">→</span>
            </button>
          ))}
        </Card>
      )}
    </div>
  );
}
