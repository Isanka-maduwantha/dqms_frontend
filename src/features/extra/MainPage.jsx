import { useState } from "react";
import { NavLink } from "react-router-dom";

export const MainPage = () => {
  const [activeFaq, setActiveFaq] = useState(null);

  const toggleFaq = (index) => {
    setActiveFaq(activeFaq === index ? null : index);
  };

  return (
    <div className="w-full font-inter text-slate-600 flex flex-col items-center">
      {/* Background ambient lighting orbs */}
      <div className="absolute top-20 left-1/2 -translate-x-1/2 w-[800px] h-[350px] bg-gradient-to-tr from-emerald-400/20 via-teal-300/20 to-emerald-600/15 rounded-full blur-[100px] pointer-events-none -z-10" />

      <main className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-16 space-y-20 sm:space-y-32">
        {/* Hero Section */}
        <section className="grid lg:grid-cols-12 gap-12 lg:gap-8 items-center pt-4 pb-8">
          <div className="lg:col-span-7 space-y-7 text-left">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-200/80 text-emerald-800 font-bold text-xs uppercase tracking-wider backdrop-blur-md shadow-xs">
              <span className="w-2 h-2 rounded-full bg-[#0E7A50] animate-ping" />
              <span>Smart Clinical Queue & Patient Portal</span>
            </div>

            <h1 className="font-manrope text-4xl sm:text-5xl lg:text-6xl font-extrabold text-slate-900 tracking-tight leading-[1.12]">
              Precision dental care that{" "}
              <span className="bg-gradient-to-r from-[#0E7A50] via-emerald-600 to-teal-500 bg-clip-text text-transparent">
                respects your time.
              </span>
            </h1>

            <p className="text-slate-600 text-base sm:text-lg max-w-xl leading-relaxed">
              Book real-time appointments, track your live waiting token, and access complete clinical treatment & billing history — in one secure, seamless patient experience.
            </p>

            <div className="flex flex-wrap items-center gap-4 pt-2">
              <NavLink to="/register">
                <button className="px-7 py-3.5 glossy-gradient-btn text-white font-bold text-sm rounded-2xl flex items-center gap-2.5 shadow-lg shadow-emerald-700/30 hover:scale-[1.02] active:scale-[0.98] transition-all">
                  <span>Get Started Now</span>
                  <span>→</span>
                </button>
              </NavLink>
              <NavLink to="/patient/book-appointment">
                <button className="px-7 py-3.5 bg-white/80 hover:bg-white backdrop-blur-md border border-slate-200/90 text-slate-800 font-bold text-sm rounded-2xl transition-all duration-200 shadow-sm hover:shadow-md hover:border-emerald-300 hover:text-[#0E7A50] active:scale-[0.98] flex items-center gap-2">
                  <span>📅</span>
                  <span>Find Available Slots</span>
                </button>
              </NavLink>
            </div>

            <div className="grid grid-cols-3 gap-4 pt-6 border-t border-slate-200/70 text-xs font-semibold text-slate-500">
              <div className="flex items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center text-[10px]">✓</span>
                <span>HIPAA Compliant</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center text-[10px]">🔒</span>
                <span>256-Bit SSL Encrypted</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-teal-100 text-teal-700 flex items-center justify-center text-[10px]">⚡</span>
                <span>Live Queue Sync</span>
              </div>
            </div>
          </div>

          {/* Hero Visual Container */}
          <div className="lg:col-span-5 relative">
            <div className="relative mx-auto max-w-md lg:max-w-none">
              {/* Glossy Mesh Card */}
              <div className="relative rounded-3xl bg-gradient-to-br from-emerald-800 via-[#0E7A50] to-slate-900 p-8 text-white shadow-2xl overflow-hidden border border-white/20">
                <div className="absolute -top-24 -right-24 w-64 h-64 bg-teal-400/20 rounded-full blur-3xl pointer-events-none" />
                <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-emerald-500/30 rounded-full blur-3xl pointer-events-none" />

                {/* Card Header */}
                <div className="flex justify-between items-center pb-6 border-b border-white/15">
                  <div>
                    <div className="text-[11px] font-bold uppercase tracking-wider text-teal-200">
                      Live Queue Monitor
                    </div>
                    <div className="text-xl font-manrope font-bold text-white">
                      Room 02 • Dr. S. Perera
                    </div>
                  </div>
                  <span className="px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-300 font-bold text-[11px] border border-emerald-400/30 flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                    In Session
                  </span>
                </div>

                {/* Token Hero Display */}
                <div className="my-8 text-center py-6 rounded-2xl bg-white/10 backdrop-blur-md border border-white/15 shadow-inner">
                  <div className="text-xs font-semibold text-teal-200 uppercase tracking-widest mb-1">
                    Currently Calling Token
                  </div>
                  <div className="text-6xl font-black font-manrope tracking-tight text-white drop-shadow-md">
                    #A-014
                  </div>
                  <div className="text-xs font-medium text-white/80 mt-2 flex items-center justify-center gap-1.5">
                    <span>Estimated Wait:</span>
                    <span className="font-bold text-teal-300">~6 mins</span>
                  </div>
                </div>

                {/* Queue Stats Mini Bar */}
                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div className="p-3 rounded-xl bg-white/5 border border-white/10 backdrop-blur-xs">
                    <span className="text-white/60 block text-[10px] uppercase">Next in Line</span>
                    <span className="font-bold text-sm text-white">Token #A-015</span>
                  </div>
                  <div className="p-3 rounded-xl bg-white/5 border border-white/10 backdrop-blur-xs">
                    <span className="text-white/60 block text-[10px] uppercase">Total Waiting</span>
                    <span className="font-bold text-sm text-teal-300">3 Patients</span>
                  </div>
                </div>
              </div>

              {/* Floating Badge */}
              <div className="absolute -bottom-6 -left-6 bg-white/90 backdrop-blur-xl border border-white p-4 rounded-2xl shadow-xl flex items-center gap-3 animate-float hidden sm:flex">
                <div className="w-10 h-10 rounded-xl bg-[#0E7A50] text-white flex items-center justify-center text-xl shadow-md shadow-emerald-700/30">
                  🦷
                </div>
                <div>
                  <div className="text-xs font-bold text-slate-800">4.9 / 5.0 Rating</div>
                  <div className="text-[11px] text-slate-500">From 2,400+ Patient Reviews</div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Stats Grid */}
        <section className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
          {[
            { label: "Patients Served", val: "18,500+", icon: "👥" },
            { label: "Average Wait Time", val: "18 mins", icon: "⏱️" },
            { label: "Patient Satisfaction", val: "99.4%", icon: "⭐" },
            { label: "Clinical Specialists", val: "14 Dentists", icon: "🩺" },
          ].map((stat, i) => (
            <div
              key={i}
              className="glass-card p-6 text-center border border-white/80 shadow-glass flex flex-col justify-center space-y-1.5 hover:scale-[1.02] transition-all duration-200"
            >
              <div className="text-2xl mb-1">{stat.icon}</div>
              <div className="font-manrope text-2xl sm:text-3xl font-extrabold text-slate-900">
                {stat.val}
              </div>
              <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                {stat.label}
              </div>
            </div>
          ))}
        </section>

        {/* Services Section */}
        <section id="services" className="space-y-12 text-center flex flex-col items-center">
          <div className="space-y-3 max-w-xl mx-auto">
            <span className="px-3.5 py-1.5 bg-emerald-500/10 border border-emerald-200 text-emerald-800 font-bold text-xs rounded-full uppercase tracking-wider">
              Comprehensive Care
            </span>
            <h2 className="font-manrope text-3xl sm:text-4xl font-extrabold text-slate-900">
              Complete dental care under one roof
            </h2>
            <p className="text-sm text-slate-500">
              State-of-the-art diagnostics and gentle treatments tailored to your clinical needs.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6 sm:gap-8 text-left w-full">
            {[
              {
                title: "General Dentistry",
                desc: "Routine examinations, digital X-rays, scaling & polishing, and restorative tooth fillings.",
                icon: "🦷",
                tags: ["Checkups", "Scaling", "Fillings"],
              },
              {
                title: "Orthodontics & Aligners",
                desc: "Traditional braces, clear ceramic brackets, and invisible aligners for precision smile correction.",
                icon: "✨",
                tags: ["Clear Aligners", "Braces", "Retainers"],
              },
              {
                title: "Oral Surgery & Endodontics",
                desc: "Root canal treatments, painless tooth extractions, and surgical consultations.",
                icon: "🏥",
                tags: ["Root Canal", "Extractions", "Surgery"],
              },
              {
                title: "Cosmetic Dentistry",
                desc: "Porcelain veneers, professional laser teeth whitening, and complete aesthetic smile makeovers.",
                icon: "💎",
                tags: ["Whitening", "Veneers", "Bonding"],
              },
              {
                title: "Pediatric Dental Care",
                desc: "Specialized, anxiety-free dental visits, fluoride treatments, and dental sealants for kids.",
                icon: "🧸",
                tags: ["Gentle Care", "Fluoride", "Prevention"],
              },
              {
                title: "Emergency Dental Desk",
                desc: "Immediate same-day care for severe toothaches, chipped teeth, and clinical emergencies.",
                icon: "🚨",
                tags: ["Same-Day", "Pain Relief", "Trauma"],
              },
            ].map((service, i) => (
              <div
                key={i}
                className="glass-card glass-card-interactive p-7 flex flex-col justify-between space-y-4"
              >
                <div className="space-y-3">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-[#0E7A50] to-teal-400 text-white flex items-center justify-center text-2xl shadow-md shadow-emerald-700/20">
                    {service.icon}
                  </div>
                  <h3 className="font-manrope text-lg font-bold text-slate-900">
                    {service.title}
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                    {service.desc}
                  </p>
                </div>
                <div className="flex flex-wrap gap-1.5 pt-2 border-t border-slate-100">
                  {service.tags.map((tag, tIndex) => (
                    <span
                      key={tIndex}
                      className="px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-800 text-[10px] font-semibold"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* How It Works Section */}
        <section className="glass-card p-8 sm:p-14 text-center space-y-12 border border-white/80 shadow-glass flex flex-col items-center">
          <div className="space-y-3 max-w-xl mx-auto">
            <span className="px-3.5 py-1.5 bg-emerald-500/10 border border-emerald-200 text-emerald-800 font-bold text-xs rounded-full uppercase tracking-wider">
              Patient Journey
            </span>
            <h2 className="font-manrope text-3xl sm:text-4xl font-extrabold text-slate-900">
              Three simple steps from booking to check-out
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-8 text-left w-full">
            {[
              {
                num: "01",
                title: "Book Your Slot Online",
                desc: "Choose your treatment purpose, date, and preferred 15-minute slot from the live clinical calendar.",
              },
              {
                num: "02",
                title: "Instant Check-In on Arrival",
                desc: "Reception validates your visit or generates a walk-in token. You join the live waiting queue instantly.",
              },
              {
                num: "03",
                title: "Consultation & Clear Billing",
                desc: "Your dentist conducts the examination, records history, and generates transparent billing receipts.",
              },
            ].map((step, i) => (
              <div
                key={i}
                className="p-6 rounded-2xl bg-white/70 border border-white/90 backdrop-blur-sm space-y-4 shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-200"
              >
                <span className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#0E7A50] to-teal-400 text-white flex items-center justify-center text-sm font-bold shadow-md shadow-emerald-700/25">
                  {step.num}
                </span>
                <h3 className="font-manrope text-lg font-bold text-slate-900">
                  {step.title}
                </h3>
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                  {step.desc}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* Practice Overview & Live Monitor */}
        <section id="about" className="grid md:grid-cols-12 gap-10 items-center">
          <div className="md:col-span-7 space-y-6 text-left">
            <span className="px-3.5 py-1.5 bg-emerald-500/10 border border-emerald-200 text-emerald-800 font-bold text-xs rounded-full uppercase tracking-wider">
              About Our Practice
            </span>
            <h2 className="font-manrope text-3xl sm:text-4xl font-extrabold text-slate-900 leading-snug">
              Clinical excellence powered by real-time workflow coordination
            </h2>
            <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
              Our clinic combines modern dental diagnostics with a hybrid queue engine. By seamlessly balancing pre-booked appointments and urgent walk-ins, we eliminate waiting room congestion and keep patients informed at every step.
            </p>
            <div className="grid grid-cols-2 gap-4 pt-2">
              <div className="p-4 rounded-xl bg-emerald-50/70 border border-emerald-100">
                <div className="font-bold text-slate-900 text-sm mb-1">Digitized Dental Charts</div>
                <p className="text-xs text-slate-600">Full treatment history, diagnosis notes, and follow-up tracking.</p>
              </div>
              <div className="p-4 rounded-xl bg-teal-50/70 border border-teal-100">
                <div className="font-bold text-slate-900 text-sm mb-1">Itemized Invoicing</div>
                <p className="text-xs text-slate-600">Automated invoices based on official clinical treatment catalogues.</p>
              </div>
            </div>
          </div>

          <div className="md:col-span-5">
            <div className="glass-card-dark p-8 space-y-5 shadow-2xl relative overflow-hidden text-xs">
              <div className="flex justify-between items-center border-b border-white/10 pb-4">
                <span className="text-slate-300 font-semibold">Today's Clinic Activity</span>
                <span className="font-bold text-teal-300 bg-teal-400/10 px-2.5 py-1 rounded-full border border-teal-400/20">
                  Live Operations
                </span>
              </div>
              <div className="flex justify-between border-b border-white/10 pb-3 text-slate-300">
                <span>Active Consultation Rooms</span>
                <span className="font-bold text-white">4 of 4 Active</span>
              </div>
              <div className="flex justify-between border-b border-white/10 pb-3 text-slate-300">
                <span>Patients Checked-In Today</span>
                <span className="font-bold text-white">28 Patients</span>
              </div>
              <div className="flex justify-between border-b border-white/10 pb-3 text-slate-300">
                <span>Average Consultation Time</span>
                <span className="font-bold text-teal-300">14.2 Mins</span>
              </div>
              <div className="flex justify-between text-slate-300">
                <span>System Security</span>
                <span className="font-bold text-emerald-400">100% Encrypted</span>
              </div>
            </div>
          </div>
        </section>

        {/* Interactive FAQ Section */}
        <section className="space-y-8 max-w-3xl mx-auto w-full">
          <div className="text-center space-y-2">
            <h2 className="font-manrope text-2xl sm:text-3xl font-extrabold text-slate-900">
              Frequently Asked Questions
            </h2>
            <p className="text-xs sm:text-sm text-slate-500">
              Everything you need to know about our booking and appointment queue system.
            </p>
          </div>

          <div className="space-y-3 text-left">
            {[
              {
                q: "How does the live queue token system work?",
                a: "When you book an appointment or check in at the reception desk, you are assigned a token number. The live monitor shows the active token being called in real-time, so you know exactly when your turn arrives.",
              },
              {
                q: "Can I reschedule or cancel my appointment online?",
                a: "Yes! You can log in to your patient dashboard anytime to view upcoming appointments, choose a new available time slot, or cancel with one click.",
              },
              {
                q: "Are walk-in patients accepted?",
                a: "Absolutely. Our front desk reception team can register walk-in patients on the spot and generate an immediate queue token integrated into the day's schedule.",
              },
              {
                q: "How are treatment prices and invoices calculated?",
                a: "All treatments follow a standardized clinical catalogue price list. Invoices are generated automatically upon conclusion of your appointment, with payment records viewable in your history.",
              },
            ].map((faq, idx) => (
              <div
                key={idx}
                className="glass-card overflow-hidden border border-white/90 transition-all duration-200"
              >
                <button
                  type="button"
                  onClick={() => toggleFaq(idx)}
                  className="w-full px-6 py-4.5 text-left flex justify-between items-center gap-4 font-bold text-sm text-slate-800 hover:text-[#0E7A50] cursor-pointer"
                >
                  <span>{faq.q}</span>
                  <span className="text-[#0E7A50] text-lg transition-transform duration-200">
                    {activeFaq === idx ? "−" : "+"}
                  </span>
                </button>
                {activeFaq === idx && (
                  <div className="px-6 pb-4.5 text-xs sm:text-sm text-slate-600 leading-relaxed border-t border-slate-100 pt-3 animate-fadeIn">
                    {faq.a}
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>

        {/* CTA Banner */}
        <section className="rounded-3xl bg-gradient-to-r from-emerald-900 via-[#0E7A50] to-teal-800 p-10 sm:p-16 text-center space-y-6 text-white shadow-2xl relative overflow-hidden border border-white/20 flex flex-col items-center">
          <div className="absolute -top-24 -right-24 w-80 h-80 bg-teal-400/20 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-24 -left-24 w-80 h-80 bg-emerald-500/30 rounded-full blur-3xl pointer-events-none" />

          <div className="space-y-3 max-w-xl mx-auto relative z-10">
            <h2 className="font-manrope text-3xl sm:text-4xl font-extrabold leading-tight">
              Ready to schedule your visit?
            </h2>
            <p className="text-sm sm:text-base text-emerald-100">
              Create your patient account in under 2 minutes and book your preferred slot.
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-4 relative z-10 pt-2">
            <NavLink to="/register">
              <button className="px-8 py-3.5 bg-white text-emerald-900 font-bold text-sm rounded-xl hover:bg-emerald-50 transition-all duration-200 shadow-lg hover:scale-105 active:scale-95">
                Create Patient Account →
              </button>
            </NavLink>
            <NavLink to="/login">
              <button className="px-7 py-3.5 bg-white/15 hover:bg-white/25 border border-white/30 text-white font-semibold text-sm rounded-xl transition-all duration-200">
                Sign In to Portal
              </button>
            </NavLink>
          </div>
        </section>
      </main>
    </div>
  );
};

export default MainPage;
