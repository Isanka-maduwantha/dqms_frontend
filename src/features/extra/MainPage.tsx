import React from "react";
import { NavLink } from "react-router-dom";

export const MainPage: React.FC = () => {
  return (
    <div className="min-h-screen grow bg-white font-inter text-muted-green px-8 sm:px-14 flex flex-col items-center">
      <main className="w-full  mx-auto space-y-32 md:space-y-44">
        {/* Hero Section */}
        <section className="grid md:grid-cols-2 gap-12 lg:gap-20 items-center pb-16 pt-16">
          <div className="space-y-8">
            <span className="inline-block px-3.5 py-1 bg-accent/10 text-accent font-semibold text-xs rounded-full uppercase tracking-wider">
              HIPAA-COMPLIANT CLINICAL NETWORK
            </span>
            <h1 className="font-manrope text-4xl lg:text-5xl font-extrabold text-green-text-1 leading-tight">
              Dental care that <span className="text-accent">keeps pace</span>{" "}
              with your day.
            </h1>
            <p className="text-muted-green text-base max-w-md leading-relaxed">
              Book appointments, track your live queue position and manage your
              treatment history — all in one secure patient portal.
            </p>
            <div className="flex flex-wrap items-center gap-4 pt-2">
              <NavLink to="/login">
                <button className="px-6 py-3 bg-accent text-white font-medium text-sm rounded-full flex items-center gap-2 hover:opacity-90 transition-opacity">
                  Get started <span>→</span>
                </button>
              </NavLink>
              <NavLink to="/lobby">
                <button className="px-6 py-3 border border-border-grey text-green-text-1 font-medium text-sm rounded-full hover:bg-gray-50 transition-colors">
                  View live queue
                </button>
              </NavLink>
            </div>
            <div className="flex items-center gap-8 pt-6 text-xs text-muted-green border-t border-border-grey/50">
              <span>🛡️ HIPAA compliant</span>
              <span>🔒 256-bit encrypted</span>
              <span>✓ ISO 27001</span>
            </div>
          </div>

          <div className="bg-accent h-[400px] lg:h-[460px] rounded-2xl flex items-center justify-center shadow-lg relative overflow-hidden">
            <span className="text-9xl select-none">🦷</span>
          </div>
        </section>

        {/* Stats Grid */}
        <section className="grid grid-cols-2 md:grid-cols-4 gap-6 lg:gap-8 pb-14">
          {[
            { label: "PATIENTS TREATED", val: "18k+" },
            { label: "AVERAGE WAIT TIME", val: "24m" },
            { label: "AVERAGE RATING", val: "4.9 ★" },
            { label: "SPECIALIST PROVIDERS", val: "12" },
          ].map((stat, i) => (
            <div
              key={i}
              className="py-10 px-6 bg-accent/5 rounded-xl text-center border border-border-grey/30 flex flex-col justify-center space-y-2"
            >
              <div className="font-manrope text-3xl md:text-4xl font-bold text-green-text-1">
                {stat.val}
              </div>
              <div className="text-[11px] font-semibold text-muted-green tracking-wider uppercase">
                {stat.label}
              </div>
            </div>
          ))}
        </section>

        {/* Services Section */}
        <section className="space-y-16 text-center pb-14 pt-14 flex flex-col justify-center items-center">
          <div className="space-y-4 max-w-xl mx-auto  ">
            <span className="px-3.5 py-1 bg-accent/10 text-accent font-semibold text-xs rounded-full uppercase tracking-wider">
              Services
            </span>
            <h2 className="font-manrope text-2xl md:text-4xl font-bold text-green-text-1">
              Everything your smile needs, under one roof
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-8 text-left pt-5.5">
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
                className="p-8 border border-border-grey rounded-2xl space-y-5 bg-white hover:border-accent/40 transition-colors flex flex-col justify-between"
              >
                <div className="space-y-4">
                  <div className="w-12 h-12 bg-accent/10 rounded-lg flex items-center justify-center text-xl">
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
        <section className="bg-accent/5 rounded-3xl p-10 md:p-20 text-center space-y-16 border border-border-grey/40 flex flex-col items-center gap-5.5">
          <div className="space-y-4 max-w-xl mx-auto">
            <span className="px-3.5 py-1 bg-accent/10 text-accent font-semibold text-xs rounded-full uppercase tracking-wider">
              How It Works
            </span>
            <h2 className="font-manrope text-2xl md:text-4xl font-bold text-green-text-1">
              From booking to check-out, in three steps
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-12 text-left">
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
              <div key={i} className="space-y-5">
                <span className="w-10 h-10 rounded-full bg-green-text-1 text-white flex items-center justify-center text-sm font-bold shadow-sm">
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
        <section className="grid md:grid-cols-3 gap-12 lg:gap-16 items-center pt-14 pb-14">
          <div className="md:col-span-2 space-y-6">
            <span className="px-3.5 py-1 bg-accent/10 text-accent font-semibold text-xs rounded-full uppercase tracking-wider">
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
                className="inline-flex items-center gap-2 font-semibold text-sm text-green-text-1 hover:underline"
              >
                Learn more about our practice <span>→</span>
              </a>
            </div>
          </div>

          {/* Live Desk Card */}
          <div className="bg-green-text-1 text-white p-8 rounded-2xl space-y-6 text-xs font-mono shadow-md">
            <div className="flex justify-between border-b border-white/10 pb-4">
              <span className="text-white/70">Today's queue</span>
              <span className="font-bold text-sm">18 patients</span>
            </div>
            <div className="flex justify-between border-b border-white/10 pb-4">
              <span className="text-white/70">Avg. wait</span>
              <span className="font-bold text-sm">24 minutes</span>
            </div>
            <div className="flex justify-between">
              <span className="text-white/70">Rooms active</span>
              <span className="font-bold text-sm">4 / 4</span>
            </div>
          </div>
        </section>

        {/* CTA Banner */}
        <section className="bg-accent rounded-3xl p-12 md:p-20 text-center space-y-8 text-white shadow-xl flex flex-col items-center gap-5">
          <div className="space-y-4 max-w-xl mx-auto">
            <h2 className="font-manrope text-3xl md:text-4xl lg:text-5xl font-bold leading-tight">
              Ready to book your next visit?
            </h2>
            <p className="text-base text-white/90">
              Create a patient account in under two minutes.
            </p>
          </div>
          <NavLink to="/register">
            <button className="px-8 py-4 bg-white text-green-text-1 font-bold text-sm rounded-full hover:bg-gray-100 transition-colors shadow-md">
              Create your account →
            </button>
          </NavLink>
        </section>
      </main>
    </div>
  );
};

export default MainPage;
