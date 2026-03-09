"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import BottomNav from "@/components/BottomNav";

const REVIEWS = [
  {
    text: "I moved from a small town to Chicago with no idea what was normal. Aster told me I was about to pay a broker fee I didn't have to. Saved me $1,800.",
    name: "Destiny M.",
    location: "Chicago, IL",
    stars: 5,
  },
  {
    text: "Finally something that just tells you what rent actually costs — not some wild range. I knew exactly what to budget before I even started touring.",
    name: "Marcus T.",
    location: "Austin, TX",
    stars: 5,
  },
  {
    text: "The neighborhood guide flagged flooding in an area I was seriously considering. I had no idea. This should be required reading before you sign anything.",
    name: "Priya S.",
    location: "New York, NY",
    stars: 5,
  },
  {
    text: "I'm a first-gen renter. No one in my family could tell me what a normal security deposit was. Aster did in about 30 seconds.",
    name: "Jordan R.",
    location: "Seattle, WA",
    stars: 5,
  },
  {
    text: "The roommate budget calculator alone was worth it. We went from arguing about money to splitting costs clearly before we even signed.",
    name: "Aaliyah & Cam",
    location: "Los Angeles, CA",
    stars: 5,
  },
];

const FEATURES = [
  {
    label: "City Navigator",
    desc: "Explore rent prices, neighborhoods, and market norms before you move.",
    href: "/start",
  },
  {
    label: "Apartment Tracker",
    desc: "Manage every listing, tour, and application in one place.",
    href: "/listings",
  },
  {
    label: "Housing Fund",
    desc: "Invest alongside your rent toward a future home.",
    href: "/fund",
  },
];

export default function Landing() {
  const router = useRouter();
  const [reviewIndex, setReviewIndex] = useState(0);
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const interval = setInterval(() => {
      setVisible(false);
      setTimeout(() => {
        setReviewIndex((i) => (i + 1) % REVIEWS.length);
        setVisible(true);
      }, 400);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const review = REVIEWS[reviewIndex];

  return (
    <div className="min-h-screen flex flex-col pb-16" style={{ background: "var(--background)" }}>

      {/* Dark hero */}
      <section
        className="flex flex-col px-6 pt-10 pb-16"
        style={{ background: "#0d0b14", minHeight: "100svh" }}
      >
        {/* Nav */}
        <nav className="flex items-center justify-between mb-16">
          <span
            className="text-2xl tracking-widest uppercase"
            style={{
              fontFamily: "var(--font-logo)",
              fontWeight: 300,
              color: "#ffffff",
              letterSpacing: "0.22em",
            }}
          >
            Aster
          </span>
          <button
            onClick={() => router.push("/start")}
            className="text-xs font-semibold uppercase tracking-widest transition-opacity hover:opacity-60"
            style={{ color: "rgba(255,255,255,0.5)" }}
          >
            Get started
          </button>
        </nav>

        {/* Hero text */}
        <div className="flex-1 flex flex-col justify-center">
          <h1
            className="font-bold leading-none tracking-tight mb-12"
            style={{ fontSize: "clamp(52px, 12vw, 96px)", lineHeight: 0.92 }}
          >
            <span style={{ color: "#ffffff" }}>KNOW</span>
            <br />
            <span style={{ color: "#ffffff" }}>YOUR</span>
            <br />
            <span style={{ color: "#7c6bc4" }}>CITY.</span>
            <br />
            <span style={{ color: "#ffffff" }}>TRACK</span>
            <br />
            <span style={{ color: "#ffffff" }}>YOUR</span>
            <br />
            <span style={{ color: "#7c6bc4" }}>SEARCH.</span>
            <br />
            <span style={{ color: "#ffffff" }}>BUILD</span>
            <br />
            <span style={{ color: "#ffffff" }}>YOUR</span>
            <br />
            <span style={{ color: "#7c6bc4" }}>WEALTH.</span>
          </h1>

          <button
            onClick={() => router.push("/start")}
            className="self-start px-8 py-4 rounded-lg text-sm font-semibold transition-opacity hover:opacity-90"
            style={{ background: "#7c6bc4", color: "#ffffff" }}
          >
            Get started free
          </button>
          <p className="text-xs mt-4" style={{ color: "rgba(255,255,255,0.3)" }}>
            No sign-up required.
          </p>
        </div>
      </section>

      {/* Monzo-style features list */}
      <section className="px-6 py-14" style={{ background: "var(--background)" }}>
        <div className="max-w-lg mx-auto">
          <p
            className="text-xs font-semibold uppercase tracking-widest mb-8"
            style={{ color: "var(--muted-foreground)" }}
          >
            What do you need?
          </p>
          <div>
            {FEATURES.map((f, i) => (
              <div key={f.href}>
                <button
                  onClick={() => router.push(f.href)}
                  className="w-full flex items-center justify-between py-6 text-left group transition-opacity hover:opacity-70"
                >
                  <div>
                    <div
                      className="text-2xl font-bold tracking-tight mb-1"
                      style={{ color: "var(--primary)" }}
                    >
                      {f.label}
                    </div>
                    <div className="text-sm" style={{ color: "var(--muted-foreground)" }}>
                      {f.desc}
                    </div>
                  </div>
                  <span
                    className="text-xl ml-4 flex-shrink-0"
                    style={{ color: "var(--primary)" }}
                  >
                    →
                  </span>
                </button>
                {i < FEATURES.length - 1 && (
                  <div className="border-t" style={{ borderColor: "var(--border)" }} />
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Reviews */}
      <section
        className="border-y px-6 py-16"
        style={{ borderColor: "var(--border)", background: "var(--card)" }}
      >
        <div className="max-w-xl mx-auto text-center">
          <div
            className="transition-opacity duration-400"
            style={{ opacity: visible ? 1 : 0 }}
          >
            <div className="flex justify-center gap-1 mb-4">
              {Array.from({ length: review.stars }).map((_, i) => (
                <span key={i} style={{ color: "#7c6bc4", fontSize: "18px", lineHeight: 1 }}>★</span>
              ))}
            </div>
            <p
              className="text-xl md:text-2xl font-semibold leading-snug mb-6"
              style={{ color: "var(--foreground)" }}
            >
              &ldquo;{review.text}&rdquo;
            </p>
            <p className="text-sm font-semibold" style={{ color: "var(--foreground)" }}>
              {review.name}
            </p>
            <p className="text-xs mt-1" style={{ color: "var(--muted-foreground)" }}>
              {review.location}
            </p>
          </div>

          <div className="flex justify-center gap-2 mt-8">
            {REVIEWS.map((_, i) => (
              <button
                key={i}
                onClick={() => { setVisible(false); setTimeout(() => { setReviewIndex(i); setVisible(true); }, 400); }}
                className="rounded-full transition-all duration-300"
                style={{
                  width: i === reviewIndex ? "20px" : "8px",
                  height: "8px",
                  background: i === reviewIndex ? "var(--foreground)" : "var(--border)",
                }}
              />
            ))}
          </div>
        </div>
      </section>

      {/* Cities */}
      <section className="px-6 py-14">
        <div className="max-w-2xl mx-auto text-center">
          <p
            className="text-xs font-semibold uppercase tracking-widest mb-6"
            style={{ color: "var(--primary)" }}
          >
            Now covering
          </p>
          <div className="flex flex-wrap justify-center gap-3 mb-4">
            {["New York", "Los Angeles", "Chicago", "Austin", "Seattle", "Miami"].map((city) => (
              <span
                key={city}
                className="px-4 py-2 rounded-full border text-sm font-medium"
                style={{ borderColor: "var(--border)", color: "var(--foreground)" }}
              >
                {city}
              </span>
            ))}
          </div>
          <p className="text-xs" style={{ color: "var(--muted-foreground)" }}>
            More cities coming soon
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer
        className="px-8 py-6 border-t mt-auto text-center"
        style={{ borderColor: "var(--border)" }}
      >
        <p className="text-xs" style={{ color: "var(--muted-foreground)" }}>
          Aster — built for renters
        </p>
      </footer>

      <BottomNav />
    </div>
  );
}
