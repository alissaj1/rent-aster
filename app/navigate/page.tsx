"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { Suspense, useState, useCallback } from "react";
import dynamic from "next/dynamic";
import { findCity, type CityData } from "@/lib/cityData";

const NeighborhoodMap = dynamic(() => import("@/components/NeighborhoodMap"), { ssr: false });

function fmt(n: number) { return `$${n.toLocaleString()}`; }

const SLIDES = ["Rent Range", "Neighborhoods", "What to Know", "Where to Search"];

// ── Slide 1: Rent Range ──────────────────────────────────────────────────────
function SlideRentSnapshot({ city, budgetMin, budgetMax, totalMin, totalMax, roommateCount }: {
  city: CityData; budgetMin: number; budgetMax: number;
  totalMin: number; totalMax: number; roommateCount: number;
}) {
  const rows = [
    { label: "Studio", total: city.avgRents.studio },
    { label: "1 BR",   total: city.avgRents.oneBR },
    { label: "2 BR",   total: city.avgRents.twoBR },
    { label: "3 BR",   total: city.avgRents.threeBR },
  ].map(r => ({ ...r, perPerson: Math.round(r.total / roommateCount) }));

  const chartMax = Math.max(...rows.map(r => r.perPerson), budgetMax) * 1.08;
  const budgetMaxPct = Math.min((budgetMax / chartMax) * 100, 98);

  return (
    <div>
      <p className="text-xs font-semibold uppercase tracking-widest mb-1" style={{ color: "var(--primary)" }}>Rent Range</p>
      <h2 className="text-2xl font-bold mb-4" style={{ color: "var(--foreground)" }}>{city.name} Rent Prices</h2>

      {/* Budget summary: individual vs total */}
      <div className="grid grid-cols-2 gap-3 mb-6">
        <div className="rounded-lg border p-4" style={{ background: "var(--card)", borderColor: "var(--border)" }}>
          <p className="text-xs font-semibold uppercase tracking-widest mb-1.5" style={{ color: "var(--muted-foreground)" }}>Your share</p>
          <p className="text-xl font-bold leading-tight" style={{ color: "var(--foreground)" }}>{fmt(budgetMin)}–{fmt(budgetMax)}</p>
          <p className="text-xs mt-1" style={{ color: "var(--muted-foreground)" }}>per person / month</p>
        </div>
        <div className="rounded-lg border p-4" style={{ background: "var(--muted)", borderColor: "var(--border)" }}>
          <p className="text-xs font-semibold uppercase tracking-widest mb-1.5" style={{ color: "var(--muted-foreground)" }}>
            {roommateCount === 1 ? "Total" : "Group total"}
          </p>
          <p className="text-xl font-bold leading-tight" style={{ color: "var(--foreground)" }}>{fmt(totalMin)}–{fmt(totalMax)}</p>
          <p className="text-xs mt-1" style={{ color: "var(--muted-foreground)" }}>
            {roommateCount === 1 ? "you pay this" : `${roommateCount} people combined`}
          </p>
        </div>
      </div>

      {/* Chart: per-person share as primary metric */}
      <div className="rounded-lg border p-5" style={{ background: "var(--card)", borderColor: "var(--border)" }}>
        <div className="flex justify-between items-baseline mb-4">
          <p className="text-xs font-semibold" style={{ color: "var(--muted-foreground)" }}>
            Your share per apartment type
          </p>
          {roommateCount > 1 && (
            <p className="text-xs" style={{ color: "var(--muted-foreground)" }}>+ total apt cost</p>
          )}
        </div>

        <div className="flex flex-col gap-4">
          {rows.map((row) => {
            const pct = (row.perPerson / chartMax) * 100;
            const inRange = row.perPerson >= budgetMin && row.perPerson <= budgetMax;
            const underBudget = row.perPerson < budgetMin;
            const barColor = inRange ? "#1a6b4a" : underBudget ? "var(--border)" : "var(--primary)";
            const textColor = inRange ? "#1a6b4a" : underBudget ? "var(--muted-foreground)" : "var(--primary)";
            return (
              <div key={row.label} className="flex items-center gap-3">
                <span className="w-12 text-xs font-medium shrink-0" style={{ color: "var(--muted-foreground)" }}>{row.label}</span>
                <div className="flex-1 relative" style={{ height: "10px" }}>
                  {/* Track */}
                  <div className="absolute inset-0 rounded-full" style={{ background: "var(--muted)" }} />
                  {/* Bar fill */}
                  <div className="absolute inset-y-0 left-0 rounded-full" style={{ width: `${pct}%`, background: barColor, zIndex: 1 }} />
                  {/* Budget max marker line */}
                  <div className="absolute" style={{
                    left: `${budgetMaxPct}%`,
                    top: "-4px", bottom: "-4px",
                    width: "2px",
                    background: "#1a6b4a",
                    opacity: 0.65,
                    borderRadius: "1px",
                    zIndex: 2,
                  }} />
                </div>
                <div className="w-32 text-right shrink-0">
                  <span className="text-sm font-bold" style={{ color: textColor }}>
                    {fmt(row.perPerson)}<span className="text-xs font-normal">/person</span>
                  </span>
                  {roommateCount > 1 && (
                    <div className="text-xs" style={{ color: "var(--muted-foreground)" }}>{fmt(row.total)} total</div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Legend */}
        <div className="flex gap-4 mt-4 pt-4 border-t flex-wrap" style={{ borderColor: "var(--border)" }}>
          <div className="flex items-center gap-1.5 text-xs" style={{ color: "#1a6b4a" }}>
            <div className="w-3 h-3 rounded-full" style={{ background: "#1a6b4a" }} />
            Within your budget
          </div>
          <div className="flex items-center gap-1.5 text-xs" style={{ color: "var(--primary)" }}>
            <div className="w-3 h-3 rounded-full" style={{ background: "var(--primary)" }} />
            Over budget
          </div>
          <div className="flex items-center gap-1.5 text-xs" style={{ color: "#1a6b4a" }}>
            <div className="w-0.5 h-3 rounded" style={{ background: "#1a6b4a", opacity: 0.65 }} />
            Your budget max
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Slide 2: Neighborhoods ───────────────────────────────────────────────────
function SlideNeighborhoods({ city, budgetMax }: { city: CityData; budgetMax: number }) {
  const [selected, setSelected] = useState<string | null>(city.neighborhoods[0]?.name ?? null);
  const handleSelect = useCallback((name: string) => setSelected(name), []);

  return (
    <div>
      <p className="text-xs font-semibold uppercase tracking-widest mb-1" style={{ color: "var(--primary)" }}>Neighborhoods</p>
      <h2 className="text-2xl font-bold mb-4" style={{ color: "var(--foreground)" }}>Where to Live in {city.name}</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Map */}
        <div style={{ height: "360px", borderRadius: "8px", overflow: "hidden", border: "1px solid var(--border)" }}>
          <NeighborhoodMap
            neighborhoods={city.neighborhoods}
            center={city.center}
            budgetMax={budgetMax}
            selected={selected}
            onSelect={handleSelect}
          />
        </div>

        {/* List panel */}
        <div className="flex flex-col gap-2 overflow-y-auto" style={{ maxHeight: "360px" }}>
          {city.neighborhoods.map((n) => {
            const affordable = n.avgRent1BR <= budgetMax;
            const isSelected = selected === n.name;
            const mapsUrl = `https://www.google.com/maps/search/${encodeURIComponent(n.name + ", " + city.name)}`;
            return (
              <div key={n.name}>
                <button
                  onClick={() => setSelected(n.name)}
                  className="w-full text-left p-3 rounded-lg border transition-all"
                  style={{
                    borderColor: isSelected ? "var(--foreground)" : "var(--border)",
                    background: isSelected ? "var(--foreground)" : "var(--card)",
                  }}
                >
                  <div className="flex items-center justify-between mb-0.5">
                    <span className="text-sm font-semibold" style={{ color: isSelected ? "var(--background)" : "var(--foreground)" }}>
                      {n.name}
                    </span>
                    <span className="text-xs font-bold" style={{ color: isSelected ? (affordable ? "#06d6a0" : "#ff9999") : affordable ? "#1a6b4a" : "var(--primary)" }}>
                      {fmt(n.avgRent1BR)}/mo
                    </span>
                  </div>
                  <p className="text-xs" style={{ color: isSelected ? "rgba(255,255,255,0.7)" : "var(--muted-foreground)" }}>
                    {n.vibe}
                  </p>
                  {isSelected && (
                    <div className="flex flex-wrap gap-1 mt-2">
                      {n.tags.map((t) => (
                        <span key={t} className="text-xs px-2 py-0.5 rounded-full" style={{ background: "rgba(255,255,255,0.15)", color: "rgba(255,255,255,0.85)" }}>{t}</span>
                      ))}
                    </div>
                  )}
                </button>
                {isSelected && (
                  <a
                    href={mapsUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1 text-xs mt-1 ml-1 font-medium transition-opacity hover:opacity-70"
                    style={{ color: "var(--primary)" }}
                  >
                    View on Google Maps ↗
                  </a>
                )}
              </div>
            );
          })}
        </div>
      </div>

      <p className="text-xs mt-3" style={{ color: "var(--muted-foreground)" }}>
        Green = within your budget &nbsp;·&nbsp; Red = over budget &nbsp;·&nbsp; Click a pin or row to explore
      </p>
    </div>
  );
}

// ── Slide 3: What to Know ────────────────────────────────────────────────────
function SlideWhatToKnow({ city }: { city: CityData }) {
  const [subTab, setSubTab] = useState<"norms" | "principles" | "flags">("norms");

  const normConfig = [
    { key: "deposit",  label: "Security Deposit",  value: city.marketNorms.deposit,              color: "#1a6b4a", symbol: "$" },
    { key: "lease",    label: "Lease Terms",        value: city.marketNorms.leaseTerms.join(", "), color: "#2563eb", symbol: "↻" },
    { key: "pets",     label: "Pet Policy",         value: city.marketNorms.petPolicy,             color: "#ea580c", symbol: "♦" },
    { key: "appFee",   label: "Application Fee",    value: city.marketNorms.applicationFee,        color: "#7c3aed", symbol: "%" },
    { key: "credit",   label: "Credit Score",       value: city.marketNorms.creditScore,           color: "#374151", symbol: "★" },
    { key: "income",   label: "Income Requirement", value: city.marketNorms.incomeRequirement,     color: "#c0392b", symbol: "×" },
  ];

  const SUB_TABS: { id: "norms" | "principles" | "flags"; label: string }[] = [
    { id: "norms",      label: "Market Norms" },
    { id: "principles", label: "Principles"   },
    { id: "flags",      label: "Red Flags"    },
  ];

  return (
    <div>
      <p className="text-xs font-semibold uppercase tracking-widest mb-1" style={{ color: "var(--primary)" }}>What to Know</p>
      <h2 className="text-2xl font-bold mb-4" style={{ color: "var(--foreground)" }}>Before You Sign in {city.name}</h2>

      {/* Sub-tab pill switcher */}
      <div className="flex gap-1 mb-5 p-1 rounded-lg" style={{ background: "var(--muted)" }}>
        {SUB_TABS.map(({ id, label }) => (
          <button
            key={id}
            onClick={() => setSubTab(id)}
            className="flex-1 py-2 text-xs font-semibold rounded-md transition-all"
            style={{
              background: subTab === id ? "var(--card)" : "transparent",
              color: subTab === id ? "var(--foreground)" : "var(--muted-foreground)",
              boxShadow: subTab === id ? "0 1px 3px rgba(0,0,0,0.08)" : "none",
            }}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Market Norms: 2-col icon cards */}
      {subTab === "norms" && (
        <div className="grid grid-cols-2 gap-3">
          {normConfig.map((norm) => (
            <div key={norm.key} className="rounded-lg border p-4" style={{ background: "var(--card)", borderColor: "var(--border)" }}>
              <div className="flex items-center gap-2.5 mb-2.5">
                <div
                  className="w-8 h-8 rounded-lg flex items-center justify-center text-sm font-black shrink-0"
                  style={{ background: norm.color, color: "#fff" }}
                >
                  {norm.symbol}
                </div>
                <span className="text-xs font-semibold leading-tight" style={{ color: "var(--muted-foreground)" }}>{norm.label}</span>
              </div>
              <p className="text-sm font-bold leading-snug" style={{ color: "var(--foreground)" }}>{norm.value}</p>
            </div>
          ))}
        </div>
      )}

      {/* Principles: principle headline + supporting renter quote */}
      {subTab === "principles" && (
        <div className="flex flex-col gap-4">
          {city.proTips.map((tip, i) => (
            <div key={i} className="rounded-lg border p-5" style={{ background: "var(--card)", borderColor: "var(--border)" }}>
              <div className="flex items-start gap-3 mb-4">
                <div
                  className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-black shrink-0 mt-0.5"
                  style={{ background: "var(--foreground)", color: "var(--background)" }}
                >
                  {i + 1}
                </div>
                <p className="text-base font-semibold leading-snug" style={{ color: "var(--foreground)" }}>
                  {tip.text}
                </p>
              </div>
              <blockquote className="border-l-2 pl-4 ml-9" style={{ borderColor: "var(--border)" }}>
                <p className="text-sm italic mb-2" style={{ color: "var(--muted-foreground)" }}>
                  &ldquo;{tip.quote}&rdquo;
                </p>
                <p className="text-xs font-semibold" style={{ color: "var(--foreground)" }}>
                  — {tip.author}
                  <span className="font-normal ml-1" style={{ color: "var(--muted-foreground)" }}>
                    {tip.context}
                  </span>
                </p>
              </blockquote>
            </div>
          ))}
        </div>
      )}

      {/* Red Flags */}
      {subTab === "flags" && (
        <div className="flex flex-col gap-3">
          {city.redFlags.map((flag, i) => (
            <div key={i} className="rounded-lg p-5"
              style={{
                borderLeft: `4px solid ${flag.severity === "high" ? "var(--primary)" : "#f59e0b"}`,
                background: flag.severity === "high" ? "#fff5f5" : "#fffbeb",
                border: `1px solid ${flag.severity === "high" ? "#fecaca" : "#fde68a"}`,
                borderLeftWidth: "4px",
              }}>
              <div className="flex items-start gap-3">
                <div className="text-xl shrink-0 mt-0.5" style={{ color: flag.severity === "high" ? "var(--primary)" : "#92400e" }}>
                  {flag.severity === "high" ? "✕" : "!"}
                </div>
                <div>
                  <div className="font-bold text-sm mb-1 flex items-center gap-2"
                    style={{ color: flag.severity === "high" ? "var(--primary)" : "#92400e" }}>
                    {flag.title}
                    <span className="text-xs font-semibold px-2 py-0.5 rounded-full"
                      style={{ background: flag.severity === "high" ? "#fee2e2" : "#fef3c7", color: flag.severity === "high" ? "var(--primary)" : "#92400e" }}>
                      {flag.severity === "high" ? "High risk" : "Watch out"}
                    </span>
                  </div>
                  <p className="text-sm leading-relaxed" style={{ color: flag.severity === "high" ? "#7f1d1d" : "#78350f" }}>
                    {flag.detail}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ── Slide 4: Where to Search ─────────────────────────────────────────────────
function SlideSearch({ city }: { city: CityData }) {
  return (
    <div>
      <p className="text-xs font-semibold uppercase tracking-widest mb-1" style={{ color: "var(--primary)" }}>Where to Search</p>
      <h2 className="text-2xl font-bold mb-2" style={{ color: "var(--foreground)" }}>Best Search Platforms</h2>
      <p className="text-sm mb-5" style={{ color: "var(--muted-foreground)" }}>Ordered by relevance for {city.name}.</p>
      <div className="flex flex-col gap-3">
        {city.searchPlatforms.map((p, i) => {
          let domain = "";
          try { domain = new URL(p.url).hostname; } catch { /* ignore */ }
          return (
            <a key={p.name} href={p.url} target="_blank" rel="noopener noreferrer"
              className="flex items-center gap-4 rounded-lg border p-4 transition-all hover:border-current"
              style={{ background: "var(--card)", borderColor: "var(--border)", textDecoration: "none" }}
            >
              {/* Logo */}
              <div className="w-10 h-10 rounded-lg overflow-hidden flex items-center justify-center shrink-0"
                style={{ background: "var(--muted)", border: "1px solid var(--border)" }}>
                {domain ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={`https://www.google.com/s2/favicons?domain=${domain}&sz=64`}
                    alt={p.name}
                    width={28}
                    height={28}
                    style={{ width: "28px", height: "28px", objectFit: "contain" }}
                  />
                ) : (
                  <span className="text-sm font-black" style={{ color: "var(--foreground)" }}>{i + 1}</span>
                )}
              </div>

              <div className="flex-1 min-w-0">
                <div className="font-semibold text-sm flex items-center gap-2 flex-wrap" style={{ color: "var(--foreground)" }}>
                  {p.name}
                  {i === 0 && (
                    <span className="text-xs font-semibold px-2 py-0.5 rounded-full" style={{ background: "var(--muted)", color: "var(--primary)" }}>
                      Top pick
                    </span>
                  )}
                </div>
                <p className="text-xs mt-0.5 truncate" style={{ color: "var(--muted-foreground)" }}>{p.bestFor}</p>
              </div>
              <span className="text-sm shrink-0" style={{ color: "var(--primary)" }}>↗</span>
            </a>
          );
        })}
      </div>
    </div>
  );
}

// ── Main carousel ────────────────────────────────────────────────────────────
function CityResults({ city, budgetMin, budgetMax, roommateCount }: {
  city: CityData; budgetMin: number; budgetMax: number; roommateCount: number;
}) {
  const [slide, setSlide] = useState(0);
  const totalMin = budgetMin * roommateCount;
  const totalMax = budgetMax * roommateCount;

  return (
    <div className="min-h-screen" style={{ background: "var(--background)" }}>
      {/* City header */}
      <div className="px-8 py-8 border-b" style={{ background: "var(--card)", borderColor: "var(--border)" }}>
        <div className="max-w-2xl mx-auto">
          <p className="text-xs font-semibold uppercase tracking-widest mb-1" style={{ color: "var(--primary)" }}>City Navigator</p>
          <h1 className="text-3xl font-bold tracking-tight mb-1" style={{ color: "var(--foreground)" }}>{city.name}, {city.state}</h1>
          <p className="text-sm mb-3" style={{ color: "var(--muted-foreground)" }}>{city.tagline}</p>
          <div className="flex flex-wrap gap-2">
            <span className="text-xs font-medium px-3 py-1 rounded-full border" style={{ borderColor: "var(--border)", color: "var(--muted-foreground)" }}>
              {fmt(budgetMin)}–{fmt(budgetMax)}/person
            </span>
            <span className="text-xs font-semibold px-3 py-1 rounded-full" style={{ background: "var(--muted)", color: "var(--foreground)" }}>
              {fmt(totalMin)}–{fmt(totalMax)} total
            </span>
          </div>
        </div>
      </div>

      {/* Slide tabs */}
      <div className="border-b overflow-x-auto" style={{ borderColor: "var(--border)", background: "var(--card)" }}>
        <div className="flex max-w-2xl mx-auto px-6">
          {SLIDES.map((label, i) => (
            <button key={label} onClick={() => setSlide(i)}
              className="px-4 py-3.5 text-xs font-semibold whitespace-nowrap border-b-2 transition-all"
              style={{
                borderColor: slide === i ? "var(--foreground)" : "transparent",
                color: slide === i ? "var(--foreground)" : "var(--muted-foreground)",
              }}
            >
              {i + 1}. {label}
            </button>
          ))}
        </div>
      </div>

      {/* Slide content */}
      <div className="max-w-2xl mx-auto px-6 py-8">
        {slide === 0 && <SlideRentSnapshot city={city} budgetMin={budgetMin} budgetMax={budgetMax} totalMin={totalMin} totalMax={totalMax} roommateCount={roommateCount} />}
        {slide === 1 && <SlideNeighborhoods city={city} budgetMax={budgetMax} />}
        {slide === 2 && <SlideWhatToKnow city={city} />}
        {slide === 3 && <SlideSearch city={city} />}

        {/* Prev / Next */}
        <div className="flex justify-between mt-8 pt-6 border-t" style={{ borderColor: "var(--border)" }}>
          <button onClick={() => setSlide((s) => Math.max(0, s - 1))} disabled={slide === 0}
            className="text-sm font-medium transition-opacity"
            style={{ color: "var(--foreground)", opacity: slide === 0 ? 0.2 : 1 }}>
            ← {slide > 0 ? SLIDES[slide - 1] : ""}
          </button>
          <button onClick={() => setSlide((s) => Math.min(SLIDES.length - 1, s + 1))} disabled={slide === SLIDES.length - 1}
            className="text-sm font-medium transition-opacity"
            style={{ color: "var(--foreground)", opacity: slide === SLIDES.length - 1 ? 0.2 : 1 }}>
            {slide < SLIDES.length - 1 ? SLIDES[slide + 1] : ""} →
          </button>
        </div>
      </div>
    </div>
  );
}

function NotFound({ query }: { query: string }) {
  const router = useRouter();
  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6 text-center" style={{ background: "var(--background)" }}>
      <p className="text-xs font-semibold uppercase tracking-widest mb-4" style={{ color: "var(--primary)" }}>Not Found</p>
      <h1 className="text-3xl font-bold mb-3" style={{ color: "var(--foreground)" }}>No data for &ldquo;{query}&rdquo;</h1>
      <p className="text-sm mb-8 max-w-sm" style={{ color: "var(--muted-foreground)" }}>We currently cover NYC, LA, Chicago, Austin, Seattle, and Miami. More cities coming soon.</p>
      <button onClick={() => router.push("/start")} className="px-5 py-2.5 rounded-lg text-sm font-medium border" style={{ borderColor: "var(--border)", color: "var(--foreground)" }}>Back to search</button>
    </div>
  );
}

function NavigatePage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const cityQuery      = searchParams.get("city") || "";
  const budgetMinStr   = searchParams.get("budgetMin") || "0";
  const budgetMaxStr   = searchParams.get("budgetMax") || "0";
  const roommatesParam = searchParams.get("roommates") || "solo";

  const budgetMin     = parseInt(budgetMinStr, 10) || 0;
  const budgetMax     = parseInt(budgetMaxStr, 10) || 0;
  const roommateCount = roommatesParam === "solo" ? 1 : roommatesParam === "1" ? 2 : roommatesParam === "2" ? 3 : 4;
  const city          = findCity(cityQuery);

  return (
    <>
      <div className="sticky top-0 z-10 px-6 py-3 border-b flex items-center" style={{ background: "var(--background)", borderColor: "var(--border)" }}>
        <div className="max-w-2xl mx-auto w-full flex items-center justify-between">
          <button onClick={() => router.push("/")} className="text-sm font-medium hover:opacity-60 transition-opacity" style={{ color: "var(--foreground)" }}>← RentReady</button>
          {city && <span className="text-sm" style={{ color: "var(--muted-foreground)" }}>{city.name}, {city.state}</span>}
        </div>
      </div>
      {city
        ? <CityResults city={city} budgetMin={budgetMin} budgetMax={budgetMax} roommateCount={roommateCount} />
        : <NotFound query={cityQuery} />
      }
    </>
  );
}

export default function Page() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center" style={{ background: "var(--background)" }}>
        <p className="text-sm" style={{ color: "var(--muted-foreground)" }}>Loading...</p>
      </div>
    }>
      <NavigatePage />
    </Suspense>
  );
}
