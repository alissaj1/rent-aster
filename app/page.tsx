"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

const REVIEWS = [
  {
    text: "I moved from a small town to Chicago with no idea what was normal. RentReady told me I was about to pay a broker fee I didn't have to. Saved me $1,800.",
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
    text: "I'm a first-gen renter. No one in my family could tell me what a normal security deposit was. RentReady did in about 30 seconds.",
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
    <div className="min-h-screen flex flex-col" style={{ background: "var(--background)" }}>
      {/* Nav */}
      <nav
        className="flex items-center justify-between px-8 py-5 border-b"
        style={{ borderColor: "var(--border)" }}
      >
        <span className="font-semibold text-base tracking-tight" style={{ color: "var(--foreground)" }}>
          RentReady
        </span>
        <button
          onClick={() => router.push("/start")}
          className="text-sm font-medium transition-opacity hover:opacity-60"
          style={{ color: "var(--muted-foreground)" }}
        >
          Get started →
        </button>
      </nav>

      {/* Hero */}
      <section className="flex flex-col items-center justify-center text-center px-6 pt-20 pb-16 max-w-2xl mx-auto w-full">
        <p
          className="text-xs font-semibold uppercase tracking-widest mb-6"
          style={{ color: "var(--primary)" }}
        >
          For renters who deserve better
        </p>
        <h1
          className="text-5xl md:text-6xl font-bold tracking-tight leading-tight mb-6"
          style={{ color: "var(--foreground)" }}
        >
          Renting is confusing.
          <br />
          <span style={{ color: "var(--primary)" }}>It doesn&apos;t have to be.</span>
        </h1>
        <p
          className="text-lg leading-relaxed mb-10 max-w-lg"
          style={{ color: "var(--muted-foreground)" }}
        >
          Moving to a new city is hard enough. We built the guide, financial
          management tool, and renter advocate we wish we had — all in one.
        </p>
        <button
          onClick={() => router.push("/start")}
          className="px-8 py-4 rounded-lg text-base font-semibold transition-opacity hover:opacity-90 active:opacity-75"
          style={{ background: "var(--foreground)", color: "var(--background)" }}
        >
          Let&apos;s get started
        </button>
        <p className="text-xs mt-4" style={{ color: "var(--muted-foreground)" }}>
          Free. No sign-up required.
        </p>
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
            {/* Stars */}
            <div className="flex justify-center gap-1 mb-4">
              {Array.from({ length: review.stars }).map((_, i) => (
                <span key={i} style={{ color: "#c0392b", fontSize: "18px", lineHeight: 1 }}>★</span>
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

          {/* Dots */}
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
          RentReady — built for renters
        </p>
      </footer>
    </div>
  );
}
