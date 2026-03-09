"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

const CITIES = ["New York", "Los Angeles", "Chicago", "Austin", "Seattle", "Miami"];

const ROOMMATE_OPTIONS = [
  { id: "solo", label: "Just me", sub: "Flying solo", people: 1, bedrooms: "Studio or 1BR" },
  { id: "1",    label: "1 roommate", sub: "Splitting a 2BR", people: 2, bedrooms: "2BR" },
  { id: "2",    label: "2 roommates", sub: "Sharing a 3BR",  people: 3, bedrooms: "3BR" },
  { id: "3+",   label: "3 or more",  sub: "Splitting a 4BR+", people: 4, bedrooms: "4BR+" },
];

type Step = 1 | 2 | 3;

const MIN = 500;
const MAX = 7000;
const STEP = 50;

function pct(val: number) { return ((val - MIN) / (MAX - MIN)) * 100; }

export default function StartPage() {
  const router = useRouter();
  const [step, setStep]           = useState<Step>(1);
  const [city, setCity]           = useState("");
  const [cityInput, setCityInput] = useState("");
  const [budgetMin, setBudgetMin] = useState(1200);
  const [budgetMax, setBudgetMax] = useState(2500);
  const [roommate, setRoommate]   = useState<typeof ROOMMATE_OPTIONS[number] | null>(null);

  function handleCityInput(val: string) { setCityInput(val); setCity(val); }
  function handleCitySelect(c: string)  { setCity(c); setCityInput(c); }

  function handleMinChange(val: number) {
    setBudgetMin(Math.min(val, budgetMax - STEP));
  }
  function handleMaxChange(val: number) {
    setBudgetMax(Math.max(val, budgetMin + STEP));
  }

  function handleSubmit(opt: typeof ROOMMATE_OPTIONS[number]) {
    const params = new URLSearchParams({
      city,
      budgetMin: String(budgetMin),
      budgetMax: String(budgetMax),
      roommates: opt.id,
    });
    router.push(`/navigate?${params.toString()}`);
  }

  const budgetHint =
    budgetMax < 1200 ? "Tight budget in most cities — some neighborhoods are doable." :
    budgetMax < 2000 ? "Solid range for cities like Chicago or Austin." :
    budgetMax < 3500 ? "Good range — opens up 1BRs in most cities." :
                       "Strong budget. You'll have solid options almost anywhere.";

  return (
    <>
      <style>{`
        .range-thumb { pointer-events: none; -webkit-appearance: none; appearance: none; background: transparent; width: 100%; position: absolute; height: 0; }
        .range-thumb::-webkit-slider-thumb { -webkit-appearance: none; appearance: none; pointer-events: all; width: 20px; height: 20px; border-radius: 50%; background: var(--primary); cursor: pointer; border: 2px solid var(--background); box-shadow: 0 1px 4px rgba(0,0,0,.2); }
        .range-thumb::-moz-range-thumb { pointer-events: all; width: 20px; height: 20px; border-radius: 50%; background: var(--primary); cursor: pointer; border: 2px solid var(--background); box-shadow: 0 1px 4px rgba(0,0,0,.2); }
      `}</style>

      <div className="min-h-screen flex flex-col" style={{ background: "var(--background)" }}>
        {/* Nav */}
        <nav className="flex items-center justify-between px-8 py-5 border-b" style={{ borderColor: "var(--border)" }}>
          <span
            className="font-semibold text-base tracking-tight cursor-pointer"
            style={{ color: "var(--foreground)" }}
            onClick={() => router.push("/")}
          >
            Aster
          </span>
          <div className="flex items-center gap-2">
            {([1, 2, 3] as Step[]).map((s) => (
              <div key={s} className="rounded-full transition-all duration-300"
                style={{ width: step === s ? "24px" : "8px", height: "8px", background: step >= s ? "var(--foreground)" : "var(--border)" }}
              />
            ))}
          </div>
        </nav>

        <div className="flex-1 flex flex-col items-center justify-center px-6 py-16">

          {/* ── Step 1: City ── */}
          {step === 1 && (
            <div className="w-full max-w-md">
              <p className="text-xs font-semibold uppercase tracking-widest mb-4" style={{ color: "var(--primary)" }}>Step 1 of 3</p>
              <h1 className="text-3xl font-bold tracking-tight mb-2" style={{ color: "var(--foreground)" }}>Where are you headed?</h1>
              <p className="text-sm mb-6" style={{ color: "var(--muted-foreground)" }}>Type a city or pick one below.</p>

              {/* Input first */}
              <input
                type="text"
                placeholder="Type any city..."
                value={cityInput}
                onChange={(e) => handleCityInput(e.target.value)}
                className="w-full px-4 py-3 text-sm rounded-lg border outline-none transition-all mb-4"
                style={{
                  borderColor: city && !CITIES.includes(city) ? "var(--foreground)" : "var(--border)",
                  background: "var(--card)", color: "var(--foreground)",
                }}
              />

              {/* City grid */}
              <div className="grid grid-cols-2 gap-2 mb-6">
                {CITIES.map((c) => (
                  <button key={c} onClick={() => handleCitySelect(c)}
                    className="px-4 py-3 rounded-lg border text-sm font-medium text-left transition-all"
                    style={{
                      borderColor: city === c ? "var(--foreground)" : "var(--border)",
                      background: city === c ? "var(--foreground)" : "var(--card)",
                      color: city === c ? "var(--background)" : "var(--foreground)",
                    }}
                  >{c}</button>
                ))}
              </div>

              <button onClick={() => city && setStep(2)} disabled={!city}
                className="w-full py-3 rounded-lg text-sm font-semibold transition-all"
                style={{ background: city ? "var(--primary)" : "var(--muted)", color: city ? "#ffffff" : "var(--muted-foreground)", cursor: city ? "pointer" : "not-allowed" }}
              >Continue →</button>
            </div>
          )}

          {/* ── Step 2: Budget (dual range) ── */}
          {step === 2 && (
            <div className="w-full max-w-md">
              <p className="text-xs font-semibold uppercase tracking-widest mb-4" style={{ color: "var(--primary)" }}>Step 2 of 3</p>
              <h1 className="text-3xl font-bold tracking-tight mb-2" style={{ color: "var(--foreground)" }}>What&apos;s your individual rent budget?</h1>
              <p className="text-sm mb-8" style={{ color: "var(--muted-foreground)" }}>Set your personal monthly range — this is <em>your share</em>, not the total apartment cost.</p>

              {/* Budget display */}
              <div className="flex items-end justify-center gap-3 mb-8">
                <div className="text-center">
                  <div className="text-xs font-semibold uppercase tracking-widest mb-1" style={{ color: "var(--muted-foreground)" }}>Min</div>
                  <div className="text-4xl font-bold" style={{ color: "var(--foreground)" }}>${budgetMin.toLocaleString()}</div>
                </div>
                <div className="text-2xl font-light mb-1" style={{ color: "var(--border)" }}>—</div>
                <div className="text-center">
                  <div className="text-xs font-semibold uppercase tracking-widest mb-1" style={{ color: "var(--muted-foreground)" }}>Max</div>
                  <div className="text-4xl font-bold" style={{ color: "var(--foreground)" }}>${budgetMax.toLocaleString()}</div>
                </div>
                <div className="text-base font-medium mb-1" style={{ color: "var(--muted-foreground)" }}>/mo</div>
              </div>

              {/* Dual range slider */}
              <div className="relative mb-3 px-1" style={{ height: "28px" }}>
                {/* Track background */}
                <div className="absolute left-0 right-0 rounded-full" style={{ top: "50%", transform: "translateY(-50%)", height: "4px", background: "var(--muted)" }} />
                {/* Active track */}
                <div className="absolute rounded-full" style={{ top: "50%", transform: "translateY(-50%)", height: "4px", left: `${pct(budgetMin)}%`, right: `${100 - pct(budgetMax)}%`, background: "var(--primary)" }} />
                <input type="range" className="range-thumb" min={MIN} max={MAX} step={STEP} value={budgetMin}
                  onChange={(e) => handleMinChange(+e.target.value)}
                  style={{ top: "50%", transform: "translateY(-50%)", zIndex: budgetMin > MAX - 200 ? 5 : 3 }}
                />
                <input type="range" className="range-thumb" min={MIN} max={MAX} step={STEP} value={budgetMax}
                  onChange={(e) => handleMaxChange(+e.target.value)}
                  style={{ top: "50%", transform: "translateY(-50%)", zIndex: 4 }}
                />
              </div>
              <div className="flex justify-between text-xs mb-8" style={{ color: "var(--muted-foreground)" }}>
                <span>${MIN.toLocaleString()}</span>
                <span>${MAX.toLocaleString()}</span>
              </div>

              {/* Hint */}
              <div className="rounded-lg border p-4 mb-8 text-sm" style={{ borderColor: "var(--border)", background: "var(--card)", color: "var(--muted-foreground)" }}>
                {budgetHint}
              </div>

              <div className="flex gap-3">
                <button onClick={() => setStep(1)} className="px-5 py-3 rounded-lg text-sm font-medium border transition-all" style={{ borderColor: "var(--border)", color: "var(--muted-foreground)", background: "transparent" }}>← Back</button>
                <button onClick={() => setStep(3)} className="flex-1 py-3 rounded-lg text-sm font-semibold" style={{ background: "var(--primary)", color: "#ffffff" }}>Continue →</button>
              </div>
            </div>
          )}

          {/* ── Step 3: Roommates ── */}
          {step === 3 && (
            <div className="w-full max-w-md">
              <p className="text-xs font-semibold uppercase tracking-widest mb-4" style={{ color: "var(--primary)" }}>Step 3 of 3</p>
              <h1 className="text-3xl font-bold tracking-tight mb-2" style={{ color: "var(--foreground)" }}>Will you have roommates?</h1>
              <p className="text-sm mb-8" style={{ color: "var(--muted-foreground)" }}>
                Your range is <strong>${budgetMin.toLocaleString()}–${budgetMax.toLocaleString()}/mo</strong> per person. We&apos;ll calculate the total apartment cost.
              </p>

              <div className="grid grid-cols-2 gap-3 mb-4">
                {ROOMMATE_OPTIONS.map((opt) => {
                  const totalMin = budgetMin * opt.people;
                  const totalMax = budgetMax * opt.people;
                  const isSelected = roommate?.id === opt.id;
                  return (
                    <button key={opt.id} onClick={() => setRoommate(opt)}
                      className="p-4 rounded-lg border text-left transition-all"
                      style={{
                        borderColor: isSelected ? "var(--primary)" : "var(--border)",
                        background: isSelected ? "var(--primary)" : "var(--card)",
                      }}
                    >
                      <div className="font-semibold text-sm mb-0.5" style={{ color: isSelected ? "#ffffff" : "var(--foreground)" }}>{opt.label}</div>
                      <div className="text-xs mb-1" style={{ color: isSelected ? "rgba(255,255,255,0.7)" : "var(--muted-foreground)" }}>{opt.bedrooms}</div>
                      <div className="text-xs mb-3" style={{ color: isSelected ? "rgba(255,255,255,0.7)" : "var(--muted-foreground)" }}>{opt.sub}</div>
                      <div className="text-sm font-bold" style={{ color: isSelected ? "#ffffff" : "var(--primary)" }}>
                        ${totalMin.toLocaleString()}–${totalMax.toLocaleString()}
                      </div>
                      <div className="text-xs" style={{ color: isSelected ? "rgba(255,255,255,0.7)" : "var(--muted-foreground)" }}>total apt/mo</div>
                    </button>
                  );
                })}
              </div>

              <button
                onClick={() => roommate && handleSubmit(roommate)}
                disabled={!roommate}
                className="w-full py-3 rounded-lg text-sm font-semibold mb-3 transition-all"
                style={{ background: roommate ? "var(--primary)" : "var(--muted)", color: roommate ? "#ffffff" : "var(--muted-foreground)", cursor: roommate ? "pointer" : "not-allowed" }}
              >View results →</button>

              <button onClick={() => setStep(2)} className="w-full py-3 rounded-lg text-sm font-medium border" style={{ borderColor: "var(--border)", color: "var(--muted-foreground)", background: "transparent" }}>← Back</button>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
