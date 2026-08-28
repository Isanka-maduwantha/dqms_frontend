import React from "react";
import { NavLink } from "react-router-dom";

export const MainPage: React.FC = () => {
  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-[#f2f7f4] via-[#e2eee7] to-[#d3e5dc] font-inter text-muted-green px-8 sm:px-14 flex flex-col items-center py-10">
      <main className="w-full max-w-6xl mx-auto space-y-24 md:space-y-36">
        
        {/* Hero Section */}
        <section className="grid md:grid-cols-2 gap-12 lg:gap-16 items-center pt-8 pb-12">
          <div className="space-y-8">
            <span className="inline-block px-4 py-1.5 bg-accent/10 border border-accent/20 text-accent font-bold text-xs rounded-full uppercase tracking-wider backdrop-blur-sm shadow-sm">
              HIPAA-COMPLIANT CLINICAL NETWORK
            </span>
            <h1 className="font-manrope text-4xl lg:text-5xl font-extrabold text-green-text-1 leading-tight">
              Dental care that <span className="text-accent">keeps pace</span> with your day.
            </h1>
            <p className="text-muted-green text-base max-w-md leading-relaxed">
              Book appointments, track your live queue position and manage your
              treatment history — all in one secure patient portal.
            </p>
            <div className="flex flex-wrap items-center gap-4 pt-2">
              <NavLink to="/login">
                <button className="px-6 py-3.5 bg-accent hover:bg-cyan-green text-white font-medium text-sm rounded-full flex items-center gap-2 transition-all duration-200 shadow-md hover:shadow-lg hover:scale-[1.02] active:scale-[0.98]">
                  Get started <span>→</span>
                </button>
              </NavLink>
              <NavLink to="/lobby">
                <button className="px-6 py-3.5 bg-white/40 hover:bg-white/70 backdrop-blur-md border border-white/60 text-green-text-1 font-medium text-sm rounded-full transition-all duration-200 shadow-glass hover:shadow-glass-lg active:scale-[0.98]">
                  View live queue
                </button>
              </NavLink>
            </div>
            <div className="flex items-center gap-6 pt-6 text-xs font-medium text-muted-green border-t border-white/40">
              <span className="flex items-center gap-1.5">🛡️ HIPAA compliant</span>
              <span className="flex items-center gap-1.5">🔒 256-bit encrypted</span>
              <span className="flex items-center gap-1.5">✓ ISO 27001</span>
            </div>
          </div>

          {/* Hero Visual Container */}
          <div className="bg-gradient-to-br from-[#0e7a50] to-[#0a3b2c] h-[400px] lg:h-[460px] rounded-3xl flex items-center justify-center shadow-glass-lg relative overflow-hidden border border-white/30">
            <div className="absolute -top-16 -right-16 w-60 h-60 bg-white/10 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute -bottom-16 -left-16 w-60 h-60 bg-white/10 rounded-full blur-3xl pointer-events-none" />
            <span className="text-9xl select-none drop-shadow-2xl relative z-10 transition-transform duration-300 hover:scale-110 cursor-pointer">
              🦷
            </span>
          </div>
        </section>

        {/* Stats Grid */}
        <section className="grid grid-cols-2 md:grid-cols-4 gap-6 lg:gap-8">
          {[
            { label: "PATIENTS TREATED", val: "18k+" },
            { label: "AVERAGE WAIT TIME", val: "24m" },
            { label: "AVERAGE RATING", val: "4.9 ★" },
            { label: "SPECIALIST PROVIDERS", val: "12" },
          ].map((stat, i) => (
            <div
              key={i}
              className="py-8 px-6 bg-white/40 backdrop-blur-md rounded-2xl text-center border border-white/60 shadow-glass flex flex-col justify-center space-y-2 hover:bg-white/60 hover:scale-[1.02] transition-all duration-200"
            >
              <div className="font-manrope text-3xl md:text-4xl font-extrabold text-green-text-1">
                {stat.val}
              </div>
              <div className="text-[11px] font-bold text-muted-green tracking-wider uppercase">
                {stat.label}
              </div>
            </div>
          ))}
        </section>

        {/* Services Section */}
        <section className="space-y-12 text-center flex flex-col justify-center items-center">
          <div className="space-y-4 max-w-xl mx-auto">
            <span className="px-4 py-1.5 bg-accent/10 border border-accent/20 text-accent font-bold text-xs rounded-full uppercase tracking-wider backdrop-blur-sm">
              Services
            </span>
            <h2 className="font-manrope text-3xl md:text-4xl font-bold text-green-text-1">
              Everything your smile needs, under one roof
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-8 text-left w-full">
            {[
              {
                title: "General Dentistry",
                desc: "Routine checkups, cleanings and fillings from our core clinical team.",
                icon: "🦷",
              },
              {
                title: "Orthodontics",
                desc: "Braces, aligners and bite correction tracked through every visit.",
                icon: "🪥",
              },
              {
                title: "Oral Surgery",
                desc: "Extractions, root canals and specialist referrals, fully documented.",
                icon: "🏥",
              },
            ].map((service, i) => (
              <div
                key={i}
                className="p-8 bg-white/40 backdrop-blur-md border border-white/60 rounded-3xl space-y-5 shadow-glass hover:bg-white/70 hover:shadow-glass-lg hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between"
              >
                <div className="space-y-4">
                  <div className="w-14 h-14 bg-white/80 border border-white/80 rounded-2xl flex items-center justify-center text-2xl shadow-sm">
                    {service.icon}
                  </div>
                  <h3 className="font-manrope text-xl font-bold text-green-text-1">
                    {service.title}
                  </h3>
                  <p className="text-sm text-muted-green leading-relaxed">
                    {service.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* How It Works Section */}
        <section className="bg-white/40 backdrop-blur-md rounded-3xl p-10 md:p-16 text-center space-y-12 border border-white/60 shadow-glass flex flex-col items-center">
          <div className="space-y-4 max-w-xl mx-auto">
            <span className="px-4 py-1.5 bg-accent/10 border border-accent/20 text-accent font-bold text-xs rounded-full uppercase tracking-wider backdrop-blur-sm">
              How It Works
            </span>
            <h2 className="font-manrope text-3xl md:text-4xl font-bold text-green-text-1">
              From booking to check-out, in three steps
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-10 text-left w-full">
            {[
              {
                num: "01",
                title: "Book online",
                desc: "Pick a provider and a 15-minute slot that fits your day.",
              },
              {
                num: "02",
                title: "Check in on arrival",
                desc: "Reception marks you arrived — you join the live queue instantly.",
              },
              {
                num: "03",
                title: "See your provider",
                desc: "Watch the lobby screen for your turn and consultation room.",
              },
            ].map((step, i) => (
              <div key={i} className="p-6 rounded-2xl bg-white/30 border border-white/40 backdrop-blur-sm space-y-4 shadow-sm hover:bg-white/50 transition-all duration-200">
                <span className="w-10 h-10 rounded-xl bg-accent text-white flex items-center justify-center text-sm font-bold shadow-md">
                  {step.num}
                </span>
                <h3 className="font-manrope text-xl font-bold text-green-text-1">
                  {step.title}
                </h3>
                <p className="text-sm text-muted-green leading-relaxed">
                  {step.desc}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* About & Live Stats */}
        <section className="grid md:grid-cols-3 gap-12 lg:gap-16 items-center">
          <div className="md:col-span-2 space-y-6">
            <span className="px-4 py-1.5 bg-accent/10 border border-accent/20 text-accent font-bold text-xs rounded-full uppercase tracking-wider backdrop-blur-sm">
              About Dental Surgery
            </span>
            <h2 className="font-manrope text-3xl md:text-4xl font-bold text-green-text-1 leading-snug">
              A clinic built around real-time care coordination
            </h2>
            <p className="text-base text-muted-green leading-relaxed max-w-xl">
              Our hybrid queue engine blends scheduled appointments with walk-in
              patients so every chair stays full and every wait feels fair.
              Front desk, dentists and patients all see the same live picture of
              the day.
            </p>
            <div className="pt-2">
              <a
                href="#learn-more"
                className="inline-flex items-center gap-2 font-semibold text-sm text-accent hover:text-cyan-green transition-colors"
              >
                Learn more about our practice <span>→</span>
              </a>
            </div>
          </div>

          {/* Live Desk Glass Card */}
          <div className="bg-[#0f231c]/90 backdrop-blur-lg border border-white/20 text-white p-8 rounded-3xl space-y-6 text-xs font-mono shadow-glass-lg relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-accent/20 rounded-full blur-2xl pointer-events-none" />
            <div className="flex justify-between border-b border-white/10 pb-4">
              <span className="text-white/70">Today's queue</span>
              <span className="font-bold text-sm text-accent">18 patients</span>
            </div>
            <div className="flex justify-between border-b border-white/10 pb-4">
              <span className="text-white/70">Avg. wait</span>
              <span className="font-bold text-sm text-accent">24 minutes</span>
            </div>
            <div className="flex justify-between">
              <span className="text-white/70">Rooms active</span>
              <span className="font-bold text-sm text-emerald-400">4 / 4</span>
            </div>
          </div>
        </section>

        {/* CTA Banner */}
        <section className="bg-gradient-to-br from-[#0e7a50] to-[#0a3b2c] rounded-3xl p-12 md:p-16 text-center space-y-8 text-white shadow-glass-lg border border-white/20 relative overflow-hidden flex flex-col items-center">
          <div className="absolute -top-20 -right-20 w-72 h-72 bg-white/10 rounded-full blur-3xl pointer-events-none" />
          <div className="space-y-4 max-w-xl mx-auto relative z-10">
            <h2 className="font-manrope text-3xl md:text-4xl lg:text-5xl font-bold leading-tight">
              Ready to book your next visit?
            </h2>
            <p className="text-base text-white/80">
              Create a patient account in under two minutes.
            </p>
          </div>
          <NavLink to="/register" className="relative z-10">
            <button className="px-8 py-4 bg-white text-green-text-1 font-bold text-sm rounded-full hover:bg-white/90 transition-all duration-200 shadow-lg hover:scale-105 active:scale-95">
              Create your account →
            </button>
          </NavLink>
        </section>
      </main>
    </div>
  );
};

export default MainPage;