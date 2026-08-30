import { NavLink } from "react-router-dom";
import Card from "../../components/ui/Card";
import CommonButton from "../../components/CommanButton";

export default function HelpSupportPage({ type = "help" }) {
  const content = {
    help: {
      tag: "Patient Knowledge Base",
      title: "Help & Frequently Asked Questions",
      desc: "Find quick answers about scheduling appointments, live waiting room tokens, and account management.",
      icon: "❓",
      items: [
        {
          q: "How do I book an appointment slot?",
          a: "Navigate to 'Find Slots' from your patient dashboard, choose a convenient date, select your visit category, and confirm a 15-minute slot.",
        },
        {
          q: "What happens when I arrive at the clinic?",
          a: "Proceed to the front desk reception. The receptionist will verify your booking and mark you as Arrived, assigning you an active queue token.",
        },
        {
          q: "How can I reschedule if I cannot make it?",
          a: "Open your patient dashboard under 'Upcoming Appointments' and click the 'Reschedule' button next to your visit to pick a new date and time.",
        },
      ],
    },
    support: {
      tag: "Clinical Support Desk",
      title: "Contact Clinic Support",
      desc: "Our customer care and dental reception team are available to assist with inquiries, cancellations, or emergency questions.",
      icon: "🎧",
      items: [
        {
          q: "Reception Telephone Hotline",
          a: "+94 11 234 5678 (Available Monday to Saturday: 8:00 AM – 7:00 PM)",
        },
        {
          q: "Emergency Dental Line",
          a: "+94 77 987 6543 (Available 24/7 for acute trauma & severe pain)",
        },
        {
          q: "Clinical Email Inquiries",
          a: "care@dentalsurgeryclinic.lk (Response within 2-4 business hours)",
        },
      ],
    },
    security: {
      tag: "Data Privacy & Governance",
      title: "Security & HIPAA Compliance Policy",
      desc: "How we safeguard patient medical records, personal identification data, and payment histories.",
      icon: "🔒",
      items: [
        {
          q: "256-bit End-to-End Encryption",
          a: "All clinical notes, patient identification numbers, and payment details are encrypted in transit and at rest.",
        },
        {
          q: "Role-Based Access Control",
          a: "Dentists only see clinical dental charts, receptionists manage queue scheduling, and billing details are segregated with audit logging.",
        },
        {
          q: "Automated Data Backups",
          a: "Real-time redundant database mirroring ensures that patient visit history and invoices are never lost.",
        },
      ],
    },
  }[type] || {
    tag: "Information",
    title: "Help Center",
    desc: "Dental Surgery queue and clinical portal information.",
    icon: "ℹ️",
    items: [],
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-12 space-y-8 text-left">
      <div className="space-y-2">
        <span className="text-xs font-bold text-blue-600 uppercase tracking-wider">
          {content.tag}
        </span>
        <h1 className="font-manrope text-3xl sm:text-4xl font-extrabold text-slate-900 flex items-center gap-3">
          <span>{content.icon}</span>
          <span>{content.title}</span>
        </h1>
        <p className="text-xs sm:text-sm text-slate-600 leading-relaxed max-w-2xl">
          {content.desc}
        </p>
      </div>

      <div className="space-y-4">
        {content.items.map((item, idx) => (
          <Card key={idx} className="p-6 border border-white/80 space-y-2">
            <h3 className="font-manrope font-bold text-base text-slate-900 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-blue-600" />
              <span>{item.q}</span>
            </h3>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed pl-4">
              {item.a}
            </p>
          </Card>
        ))}
      </div>

      <div className="p-6 rounded-3xl bg-blue-50/80 border border-blue-100 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <h4 className="font-manrope font-bold text-sm text-slate-900">
            Need further assistance?
          </h4>
          <p className="text-xs text-slate-500">
            Our clinical team is always ready to answer your questions.
          </p>
        </div>
        <NavLink to="/">
          <CommonButton label="Return to Home" className="px-5 py-2 text-xs font-bold" />
        </NavLink>
      </div>
    </div>
  );
}
