"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import BottomNav from "@/components/BottomNav";

type RiskLevel = "conservative" | "balanced" | "growth";
type ContribType = "percent" | "fixed";

type FundConfig = {
  monthlyRent: number;
  contribType: ContribType;
  contribValue: number;
  riskLevel: RiskLevel;
  startDate: string;
  bankName?: string;
};

const RISK_OPTIONS: { id: RiskLevel; label: string; rate: number; desc: string; expected: string }[] = [
  { id: "conservative", label: "Conservative", rate: 0.045, desc: "Lower risk, steady growth",         expected: "~4–5% annual return" },
  { id: "balanced",     label: "Balanced",     rate: 0.07,  desc: "Mix of growth and stability",       expected: "~6–8% annual return" },
  { id: "growth",       label: "Growth",       rate: 0.10,  desc: "Higher potential, more volatility", expected: "~9–12% annual return" },
];

const BANKS = [
  "Chase", "Bank of America", "Wells Fargo", "Citi",
  "Capital One", "US Bank", "TD Bank", "Other",
];

function calcBalance(monthly: number, annualRate: number, months: number): number {
  if (months <= 0 || monthly <= 0) return 0;
  const r = annualRate / 12;
  return monthly * ((Math.pow(1 + r, months) - 1) / r);
}

function monthsSince(dateStr: string): number {
  const start = new Date(dateStr);
  const now = new Date();
  return Math.max(0, (now.getFullYear() - start.getFullYear()) * 12 + (now.getMonth() - start.getMonth()));
}

function SingleSlider({ min, max, step, value, onChange, pct }: {
  min: number; max: number; step: number; value: number;
  onChange: (v: number) => void; pct: number;
}) {
  return (
    <div className="relative px-1" style={{ height: "28px" }}>
      <div className="absolute inset-x-0 rounded-full"
        style={{ top: "50%", transform: "translateY(-50%)", height: "4px", background: "var(--muted)" }} />
      <div className="absolute left-0 rounded-full"
        style={{ top: "50%", transform: "translateY(-50%)", height: "4px", width: `${pct}%`, background: "var(--primary)" }} />
      <input type="range" min={min} max={max} step={step} value={value}
        onChange={e => onChange(+e.target.value)}
        className="absolute inset-0 w-full opacity-0 cursor-pointer" style={{ zIndex: 5 }} />
      <div className="absolute pointer-events-none rounded-full border-2"
        style={{
          left: `calc(${pct}% - 10px)`, top: "50%", transform: "translateY(-50%)",
          width: "20px", height: "20px",
          background: "var(--primary)", borderColor: "var(--background)",
          boxShadow: "0 1px 4px rgba(0,0,0,.2)",
        }} />
    </div>
  );
}

function ProjectionChart({ monthly, annualRate, currentMonths }: {
  monthly: number; annualRate: number; currentMonths: number;
}) {
  const totalMonths = 60;
  const points = Array.from({ length: totalMonths + 1 }, (_, m) => calcBalance(monthly, annualRate, m));
  const maxVal = points[totalMonths];
  const W = 360, H = 100;
  if (maxVal === 0) return <div style={{ height: H, background: "var(--muted)", borderRadius: "8px" }} />;

  const coords = points.map((v, m) => ({
    x: (m / totalMonths) * W,
    y: H - (v / maxVal) * (H - 6),
  }));

  const linePath = coords.map((c, i) => `${i === 0 ? "M" : "L"}${c.x.toFixed(1)},${c.y.toFixed(1)}`).join(" ");
  const areaPath = `${linePath} L${W},${H} L0,${H} Z`;
  const curX = ((Math.min(currentMonths, totalMonths)) / totalMonths) * W;

  return (
    <svg viewBox={`0 0 ${W} ${H}`} style={{ width: "100%", height: "auto", display: "block" }} preserveAspectRatio="none">
      <defs>
        <linearGradient id="fundGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#7c6bc4" stopOpacity="0.3" />
          <stop offset="100%" stopColor="#7c6bc4" stopOpacity="0.02" />
        </linearGradient>
      </defs>
      <path d={areaPath} fill="url(#fundGrad)" />
      <path d={linePath} fill="none" stroke="#7c6bc4" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      {currentMonths > 0 && (
        <line x1={curX} y1="4" x2={curX} y2={H}
          stroke="#7c6bc4" strokeWidth="1.5" strokeDasharray="4,3" opacity="0.6" />
      )}
    </svg>
  );
}

export default function FundPage() {
  const router = useRouter();
  const [config, setConfig]             = useState<FundConfig | null>(null);
  const [loaded, setLoaded]             = useState(false);

  // Setup overlay state
  const [showSetup, setShowSetup]       = useState(false);
  const [step, setStep]                 = useState<1 | 2 | 3 | 4>(1);
  const [success, setSuccess]           = useState(false);
  const [pendingConfig, setPendingConfig] = useState<FundConfig | null>(null);

  // Step 1: bank
  const [selectedBank, setSelectedBank] = useState("");
  const [connecting, setConnecting]     = useState(false);
  const [connected, setConnected]       = useState(false);

  // Step 2: rent
  const [rent, setRent]                 = useState(2000);

  // Step 3: contribution
  const [contribType, setContribType]   = useState<ContribType>("percent");
  const [contribValue, setContribValue] = useState(10);

  // Step 4: risk
  const [riskLevel, setRiskLevel]       = useState<RiskLevel>("balanced");

  useEffect(() => {
    try {
      const saved = localStorage.getItem("aster_fund");
      if (saved) setConfig(JSON.parse(saved));
    } catch {}
    setLoaded(true);
  }, []);

  function handleBankConnect(bank: string) {
    if (connecting || connected) return;
    setSelectedBank(bank);
    setConnecting(true);
    setTimeout(() => { setConnecting(false); setConnected(true); }, 1500);
  }

  function openSetup() {
    setStep(1);
    setSuccess(false);
    setPendingConfig(null);
    setSelectedBank("");
    setConnecting(false);
    setConnected(false);
    setRent(2000);
    setContribType("percent");
    setContribValue(10);
    setRiskLevel("balanced");
    setShowSetup(true);
  }

  function closeSetup() {
    setShowSetup(false);
    setSuccess(false);
  }

  function startFund() {
    const cfg: FundConfig = {
      monthlyRent: rent, contribType, contribValue,
      riskLevel, startDate: new Date().toISOString().split("T")[0],
      bankName: selectedBank || undefined,
    };
    localStorage.setItem("aster_fund", JSON.stringify(cfg));
    setPendingConfig(cfg);
    setSuccess(true);
  }

  function goToDashboard() {
    setConfig(pendingConfig);
    setShowSetup(false);
    setSuccess(false);
  }

  function editSetup() {
    if (!confirm("This will reset your fund setup. Your projected numbers will reset. Continue?")) return;
    localStorage.removeItem("aster_fund");
    setConfig(null);
    openSetup();
  }

  if (!loaded) return null;

  const monthlyContrib = contribType === "percent" ? (rent * contribValue) / 100 : contribValue;
  const selectedRisk = RISK_OPTIONS.find(r => r.id === riskLevel) ?? RISK_OPTIONS[1];
  const rentPct = ((rent - 500) / (6000 - 500)) * 100;
  const pPct = contribType === "percent" ? ((contribValue - 1) / (50 - 1)) * 100 : ((contribValue - 50) / (2000 - 50)) * 100;

  // ── Dashboard ──
  if (config) {
    const dashMonths = monthsSince(config.startDate);
    const monthly = config.contribType === "percent"
      ? (config.monthlyRent * config.contribValue) / 100
      : config.contribValue;
    const dashRisk = RISK_OPTIONS.find(r => r.id === config.riskLevel) ?? RISK_OPTIONS[1];
    const balance = calcBalance(monthly, dashRisk.rate, dashMonths);
    const totalInvested = monthly * dashMonths;
    const totalReturns = Math.max(0, balance - totalInvested);
    const projected5yr = calcBalance(monthly, dashRisk.rate, dashMonths + 60);

    const milestones = [
      { label: "Emergency housing buffer", sub: "3 months of rent", target: config.monthlyRent * 3 },
      { label: "Starter down payment", sub: "3% on $300k home", target: 9000 },
      { label: "Full down payment", sub: "20% on $300k home", target: 60000 },
    ];

    return (
      <div className="min-h-screen flex flex-col pb-20" style={{ background: "var(--background)" }}>
        <nav className="flex items-center justify-between px-5 py-4 border-b" style={{ borderColor: "var(--border)" }}>
          <span className="text-lg uppercase tracking-[0.06em] font-semibold cursor-pointer"
            style={{ fontFamily: "var(--font-geist-sans)", color: "var(--foreground)" }}
            onClick={() => router.push("/")}>
            Aster
          </span>
          <button onClick={editSetup} className="text-xs font-medium" style={{ color: "var(--muted-foreground)" }}>
            Edit setup
          </button>
        </nav>

        <div className="px-5 pt-8 pb-4">
          <p className="text-xs font-semibold uppercase tracking-widest mb-2" style={{ color: "var(--primary)" }}>Housing Fund</p>
          {config.bankName && (
            <p className="text-xs mb-3" style={{ color: "var(--muted-foreground)" }}>Connected to {config.bankName}</p>
          )}
          <div className="text-5xl font-bold tracking-tight mb-1" style={{ color: "var(--foreground)" }}>
            ${Math.round(balance).toLocaleString()}
          </div>
          <p className="text-sm" style={{ color: "var(--muted-foreground)" }}>
            {dashMonths === 0
              ? "Fund started today — come back next month to see growth."
              : `${dashMonths} month${dashMonths !== 1 ? "s" : ""} of investing · ${dashRisk.label} strategy`}
          </p>
        </div>

        <div className="px-5 mb-5">
          <div className="rounded-xl p-4" style={{ background: "var(--card)", border: "1px solid var(--border)" }}>
            <div className="flex justify-between items-baseline mb-3">
              <span className="text-xs font-semibold" style={{ color: "var(--muted-foreground)" }}>5-year projection</span>
              <span className="text-xs font-bold" style={{ color: "var(--primary)" }}>${Math.round(projected5yr).toLocaleString()}</span>
            </div>
            <ProjectionChart monthly={monthly} annualRate={dashRisk.rate} currentMonths={dashMonths} />
            <div className="flex justify-between text-xs mt-2" style={{ color: "var(--muted-foreground)" }}>
              <span>Now</span><span>5 years</span>
            </div>
          </div>
        </div>

        <div className="px-5 grid grid-cols-2 gap-3 mb-5">
          {[
            { label: "Monthly investment", value: `$${Math.round(monthly).toLocaleString()}`, sub: config.contribType === "percent" ? `${config.contribValue}% of rent` : "fixed amount", green: false },
            { label: "Total invested", value: `$${Math.round(totalInvested).toLocaleString()}`, sub: `over ${dashMonths} month${dashMonths !== 1 ? "s" : ""}`, green: false },
            { label: "Investment returns", value: `+$${Math.round(totalReturns).toLocaleString()}`, sub: dashRisk.expected, green: true },
            { label: "Projected at 5 yrs", value: `$${Math.round(projected5yr).toLocaleString()}`, sub: `${dashRisk.label} strategy`, green: false },
          ].map(s => (
            <div key={s.label} className="rounded-xl p-4" style={{ background: "var(--card)", border: "1px solid var(--border)" }}>
              <div className="text-xs mb-2" style={{ color: "var(--muted-foreground)" }}>{s.label}</div>
              <div className="text-xl font-bold mb-0.5" style={{ color: s.green ? "#1a6b4a" : "var(--foreground)" }}>{s.value}</div>
              <div className="text-xs" style={{ color: "var(--muted-foreground)" }}>{s.sub}</div>
            </div>
          ))}
        </div>

        <div className="px-5 mb-5">
          <div className="rounded-xl p-4" style={{ background: "var(--card)", border: "1px solid var(--border)" }}>
            <p className="text-xs font-semibold uppercase tracking-wider mb-4" style={{ color: "var(--muted-foreground)" }}>Milestones</p>
            {milestones.map(m => {
              const pct = Math.min(100, (balance / m.target) * 100);
              const reached = pct >= 100;
              return (
                <div key={m.label} className="mb-4 last:mb-0">
                  <div className="flex justify-between text-xs mb-1.5">
                    <div>
                      <span style={{ color: "var(--foreground)" }}>{m.label}</span>
                      <span className="ml-1" style={{ color: "var(--muted-foreground)" }}>· {m.sub}</span>
                    </div>
                    <span style={{ color: reached ? "#1a6b4a" : "var(--muted-foreground)" }}>
                      {reached ? "✓" : `$${m.target.toLocaleString()}`}
                    </span>
                  </div>
                  <div className="rounded-full h-2" style={{ background: "var(--muted)" }}>
                    <div className="rounded-full h-2 transition-all" style={{ width: `${pct}%`, background: reached ? "#1a6b4a" : "var(--primary)" }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="px-5 pb-10">
          <p className="text-xs leading-relaxed text-center" style={{ color: "var(--muted-foreground)" }}>
            Projections assume steady monthly contributions and historical average market returns. Not financial advice.
          </p>
        </div>
        <BottomNav />
      </div>
    );
  }

  // ── Fund landing (no config yet) ──
  return (
    <div className="min-h-screen flex flex-col pb-20" style={{ background: "var(--background)" }}>
      <nav className="flex items-center justify-between px-5 py-4 border-b" style={{ borderColor: "var(--border)" }}>
        <span className="text-base font-semibold tracking-tight cursor-pointer"
          style={{ color: "var(--foreground)" }}
          onClick={() => router.push("/")}>
          Aster
        </span>
      </nav>

      <div className="flex-1 flex flex-col px-6 pt-12 pb-8">
        <p className="text-xs font-semibold uppercase tracking-widest mb-4" style={{ color: "var(--primary)" }}>
          Housing Fund
        </p>
        <h1 className="text-3xl font-bold tracking-tight leading-tight mb-4" style={{ color: "var(--foreground)" }}>
          Build wealth<br />as you rent.
        </h1>
        <p className="text-sm leading-relaxed mb-12" style={{ color: "var(--muted-foreground)" }}>
          Every month, a portion of your rent goes into a growing investment fund.
          Start small, stay consistent, and build toward a future home.
        </p>

        {/* Feature list */}
        <div className="space-y-5 mb-12">
          {[
            { icon: "→", label: "Auto-invest", desc: "A % of your rent contributed every month" },
            { icon: "→", label: "Your risk level", desc: "Conservative, balanced, or growth" },
            { icon: "→", label: "Watch it grow", desc: "Track balance, returns, and milestones" },
            { icon: "→", label: "Down payment track", desc: "See how close you are to owning" },
          ].map(f => (
            <div key={f.label} className="flex items-start gap-4">
              <span className="text-base mt-0.5" style={{ color: "var(--primary)" }}>{f.icon}</span>
              <div>
                <div className="text-sm font-semibold mb-0.5" style={{ color: "var(--foreground)" }}>{f.label}</div>
                <div className="text-xs" style={{ color: "var(--muted-foreground)" }}>{f.desc}</div>
              </div>
            </div>
          ))}
        </div>

        <button
          onClick={openSetup}
          className="w-full py-4 rounded-lg text-sm font-semibold transition-opacity hover:opacity-90"
          style={{ background: "var(--primary)", color: "#ffffff" }}
        >
          Get started →
        </button>
        <p className="text-xs text-center mt-3" style={{ color: "var(--muted-foreground)" }}>
          Takes about 2 minutes
        </p>
      </div>

      <BottomNav />

      {/* Setup overlay */}
      {showSetup && (
        <div className="fixed inset-0 z-50 flex flex-col" style={{ background: "var(--background)" }}>

          {/* Success screen */}
          {success ? (
            <div className="flex-1 flex flex-col items-center justify-center px-6 text-center">
              <div className="w-20 h-20 rounded-full flex items-center justify-center text-3xl mx-auto mb-6"
                style={{ background: "#e6f4ef" }}>
                ✓
              </div>
              <p className="text-xs font-semibold uppercase tracking-widest mb-3" style={{ color: "#1a6b4a" }}>
                You&apos;re all set
              </p>
              <h2 className="text-2xl font-bold mb-3" style={{ color: "var(--foreground)" }}>
                Your fund is live.
              </h2>
              <p className="text-sm mb-2" style={{ color: "var(--muted-foreground)" }}>
                {pendingConfig?.bankName && `Connected to ${pendingConfig.bankName}.`} Investing ${Math.round(
                  pendingConfig?.contribType === "percent"
                    ? ((pendingConfig?.monthlyRent ?? 0) * (pendingConfig?.contribValue ?? 0)) / 100
                    : (pendingConfig?.contribValue ?? 0)
                ).toLocaleString()}/month on a {pendingConfig?.riskLevel} strategy.
              </p>
              <p className="text-xs mb-10" style={{ color: "var(--muted-foreground)" }}>
                Come back next month to watch it grow.
              </p>
              <button
                onClick={goToDashboard}
                className="w-full max-w-xs py-4 rounded-lg text-sm font-semibold"
                style={{ background: "var(--primary)", color: "#ffffff" }}
              >
                View my dashboard →
              </button>
            </div>
          ) : (
            <>
              {/* Setup nav */}
              <div className="flex items-center justify-between px-5 py-4 border-b" style={{ borderColor: "var(--border)" }}>
                <button onClick={closeSetup} className="text-sm" style={{ color: "var(--muted-foreground)" }}>Cancel</button>
                <div className="flex items-center gap-2">
                  {([1, 2, 3, 4] as const).map(s => (
                    <div key={s} className="rounded-full transition-all duration-300"
                      style={{ width: step === s ? "24px" : "8px", height: "8px", background: step >= s ? "var(--foreground)" : "var(--border)" }} />
                  ))}
                </div>
                <span className="w-10" />
              </div>

              <div className="flex-1 flex flex-col items-center justify-center px-6 py-10 overflow-y-auto">

                {/* Step 1: Link account */}
                {step === 1 && (
                  <div className="w-full max-w-md">
                    <p className="text-xs font-semibold uppercase tracking-widest mb-4" style={{ color: "var(--primary)" }}>
                      Step 1 of 4
                    </p>
                    <h1 className="text-3xl font-bold tracking-tight mb-2" style={{ color: "var(--foreground)" }}>
                      Link your account
                    </h1>
                    <p className="text-sm mb-8" style={{ color: "var(--muted-foreground)" }}>
                      Connect the bank account or card you use to pay rent.
                    </p>

                    {!connected ? (
                      <>
                        <div className="grid grid-cols-2 gap-3 mb-6">
                          {BANKS.map(bank => (
                            <button key={bank} onClick={() => handleBankConnect(bank)}
                              className="p-4 rounded-xl border text-left transition-all"
                              style={{
                                borderColor: selectedBank === bank ? "var(--primary)" : "var(--border)",
                                background: selectedBank === bank ? "#ede9fa" : "var(--card)",
                              }}>
                              <div className="text-sm font-semibold" style={{ color: "var(--foreground)" }}>{bank}</div>
                              {selectedBank === bank && connecting && (
                                <div className="text-xs mt-1" style={{ color: "var(--primary)" }}>Connecting...</div>
                              )}
                            </button>
                          ))}
                        </div>
                        <p className="text-xs text-center" style={{ color: "var(--muted-foreground)" }}>
                          Prototype only — no credentials stored or transmitted.
                        </p>
                      </>
                    ) : (
                      <div className="text-center py-6">
                        <div className="w-14 h-14 rounded-full flex items-center justify-center text-xl mx-auto mb-4"
                          style={{ background: "#e6f4ef" }}>
                          ✓
                        </div>
                        <p className="text-base font-semibold mb-1" style={{ color: "#1a6b4a" }}>
                          {selectedBank} connected
                        </p>
                        <p className="text-sm mb-8" style={{ color: "var(--muted-foreground)" }}>
                          Ready to invest from this account.
                        </p>
                        <button onClick={() => setStep(2)} className="w-full py-3 rounded-lg text-sm font-semibold"
                          style={{ background: "var(--primary)", color: "#ffffff" }}>
                          Continue →
                        </button>
                      </div>
                    )}
                  </div>
                )}

                {/* Step 2: Rent */}
                {step === 2 && (
                  <div className="w-full max-w-md">
                    <p className="text-xs font-semibold uppercase tracking-widest mb-4" style={{ color: "var(--primary)" }}>
                      Step 2 of 4
                    </p>
                    <h1 className="text-3xl font-bold tracking-tight mb-2" style={{ color: "var(--foreground)" }}>
                      What&apos;s your monthly rent?
                    </h1>
                    <p className="text-sm mb-10" style={{ color: "var(--muted-foreground)" }}>
                      We&apos;ll use this to calculate your monthly contribution.
                    </p>
                    <div className="text-center mb-8">
                      <div className="text-5xl font-bold mb-1" style={{ color: "var(--foreground)" }}>
                        ${rent.toLocaleString()}
                      </div>
                      <div className="text-sm" style={{ color: "var(--muted-foreground)" }}>per month</div>
                    </div>
                    <SingleSlider min={500} max={6000} step={50} value={rent} onChange={setRent} pct={rentPct} />
                    <div className="flex justify-between text-xs mt-2 mb-10" style={{ color: "var(--muted-foreground)" }}>
                      <span>$500</span><span>$6,000</span>
                    </div>
                    <div className="flex gap-3">
                      <button onClick={() => setStep(1)} className="px-5 py-3 rounded-lg text-sm font-medium border"
                        style={{ borderColor: "var(--border)", color: "var(--muted-foreground)", background: "transparent" }}>
                        ← Back
                      </button>
                      <button onClick={() => setStep(3)} className="flex-1 py-3 rounded-lg text-sm font-semibold"
                        style={{ background: "var(--primary)", color: "#ffffff" }}>
                        Continue →
                      </button>
                    </div>
                  </div>
                )}

                {/* Step 3: Contribution */}
                {step === 3 && (
                  <div className="w-full max-w-md">
                    <p className="text-xs font-semibold uppercase tracking-widest mb-4" style={{ color: "var(--primary)" }}>
                      Step 3 of 4
                    </p>
                    <h1 className="text-3xl font-bold tracking-tight mb-2" style={{ color: "var(--foreground)" }}>
                      How much will you invest?
                    </h1>
                    <p className="text-sm mb-8" style={{ color: "var(--muted-foreground)" }}>
                      Choose a percentage of your rent or a fixed monthly amount.
                    </p>

                    <div className="flex gap-2 mb-8 p-1 rounded-lg" style={{ background: "var(--muted)" }}>
                      {(["percent", "fixed"] as ContribType[]).map(t => (
                        <button key={t} onClick={() => { setContribType(t); setContribValue(t === "percent" ? 10 : 200); }}
                          className="flex-1 py-2 rounded-md text-sm font-medium transition-all"
                          style={{
                            background: contribType === t ? "var(--card)" : "transparent",
                            color: contribType === t ? "var(--foreground)" : "var(--muted-foreground)",
                            boxShadow: contribType === t ? "0 1px 3px rgba(0,0,0,.08)" : "none",
                          }}>
                          {t === "percent" ? "% of rent" : "Fixed amount"}
                        </button>
                      ))}
                    </div>

                    <div className="text-center mb-2">
                      <div className="text-5xl font-bold" style={{ color: "var(--foreground)" }}>
                        {contribType === "percent" ? `${contribValue}%` : `$${contribValue.toLocaleString()}`}
                      </div>
                    </div>
                    <div className="text-center text-sm font-semibold mb-8" style={{ color: "var(--primary)" }}>
                      = ${Math.round(monthlyContrib).toLocaleString()}/month invested
                    </div>

                    {contribType === "percent" ? (
                      <>
                        <SingleSlider min={1} max={50} step={1} value={contribValue} onChange={setContribValue} pct={pPct} />
                        <div className="flex justify-between text-xs mt-2 mb-10" style={{ color: "var(--muted-foreground)" }}>
                          <span>1%</span><span>50%</span>
                        </div>
                      </>
                    ) : (
                      <>
                        <SingleSlider min={50} max={2000} step={25} value={contribValue} onChange={setContribValue} pct={pPct} />
                        <div className="flex justify-between text-xs mt-2 mb-10" style={{ color: "var(--muted-foreground)" }}>
                          <span>$50</span><span>$2,000</span>
                        </div>
                      </>
                    )}

                    <div className="flex gap-3">
                      <button onClick={() => setStep(2)} className="px-5 py-3 rounded-lg text-sm font-medium border"
                        style={{ borderColor: "var(--border)", color: "var(--muted-foreground)", background: "transparent" }}>
                        ← Back
                      </button>
                      <button onClick={() => setStep(4)} className="flex-1 py-3 rounded-lg text-sm font-semibold"
                        style={{ background: "var(--primary)", color: "#ffffff" }}>
                        Continue →
                      </button>
                    </div>
                  </div>
                )}

                {/* Step 4: Risk */}
                {step === 4 && (
                  <div className="w-full max-w-md">
                    <p className="text-xs font-semibold uppercase tracking-widest mb-4" style={{ color: "var(--primary)" }}>
                      Step 4 of 4
                    </p>
                    <h1 className="text-3xl font-bold tracking-tight mb-2" style={{ color: "var(--foreground)" }}>
                      Pick your investment style
                    </h1>
                    <p className="text-sm mb-8" style={{ color: "var(--muted-foreground)" }}>
                      Choose how much risk you&apos;re comfortable with.
                    </p>

                    <div className="space-y-3 mb-6">
                      {RISK_OPTIONS.map(opt => {
                        const isSelected = riskLevel === opt.id;
                        return (
                          <button key={opt.id} onClick={() => setRiskLevel(opt.id)}
                            className="w-full p-4 rounded-xl border text-left transition-all"
                            style={{
                              borderColor: isSelected ? "var(--primary)" : "var(--border)",
                              background: isSelected ? "var(--primary)" : "var(--card)",
                            }}>
                            <div className="font-semibold text-sm mb-0.5"
                              style={{ color: isSelected ? "#ffffff" : "var(--foreground)" }}>{opt.label}</div>
                            <div className="text-xs mb-1"
                              style={{ color: isSelected ? "rgba(255,255,255,0.75)" : "var(--muted-foreground)" }}>{opt.desc}</div>
                            <div className="text-xs font-semibold"
                              style={{ color: isSelected ? "rgba(255,255,255,0.9)" : "var(--primary)" }}>{opt.expected}</div>
                          </button>
                        );
                      })}
                    </div>

                    {/* Summary preview */}
                    <div className="rounded-xl p-4 mb-8" style={{ background: "var(--card)", border: "1px solid var(--border)" }}>
                      <p className="text-xs font-semibold uppercase tracking-wider mb-3" style={{ color: "var(--muted-foreground)" }}>
                        Fund summary
                      </p>
                      {[
                        { label: "Account", value: selectedBank || "Not linked" },
                        { label: "Monthly investment", value: `$${Math.round(monthlyContrib).toLocaleString()}/mo` },
                        { label: "After 1 year", value: `$${Math.round(calcBalance(monthlyContrib, selectedRisk.rate, 12)).toLocaleString()}` },
                        { label: "After 5 years", value: `$${Math.round(calcBalance(monthlyContrib, selectedRisk.rate, 60)).toLocaleString()}`, bold: true },
                      ].map(row => (
                        <div key={row.label} className="flex justify-between text-sm mb-1.5 last:mb-0">
                          <span style={{ color: "var(--muted-foreground)" }}>{row.label}</span>
                          <span style={{ color: row.bold ? "var(--primary)" : "var(--foreground)", fontWeight: row.bold ? 700 : 600 }}>
                            {row.value}
                          </span>
                        </div>
                      ))}
                    </div>

                    <div className="flex gap-3">
                      <button onClick={() => setStep(3)} className="px-5 py-3 rounded-lg text-sm font-medium border"
                        style={{ borderColor: "var(--border)", color: "var(--muted-foreground)", background: "transparent" }}>
                        ← Back
                      </button>
                      <button onClick={startFund} className="flex-1 py-3 rounded-lg text-sm font-semibold"
                        style={{ background: "var(--primary)", color: "#ffffff" }}>
                        Start my fund →
                      </button>
                    </div>
                  </div>
                )}

              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}
