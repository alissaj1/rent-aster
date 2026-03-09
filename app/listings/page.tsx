"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import BottomNav from "@/components/BottomNav";

type StatusId = "saved" | "touring" | "applied" | "approved" | "passed";
type PlatformId = "zillow" | "apartments" | "facebook" | "streeteasy" | "craigslist" | "trulia" | "realtor" | "other";

type Listing = {
  id: string;
  address: string;
  rent: number;
  bedrooms: string;
  source: PlatformId;
  sourceUrl?: string;
  status: StatusId;
  applicationFee?: number;
  notes?: string;
  dateAdded: string;
  roommates: string[];
};

type FormData = Omit<Listing, "id" | "dateAdded">;

const PLATFORMS: { id: PlatformId; label: string; color: string }[] = [
  { id: "zillow",      label: "Zillow",          color: "#006AFF" },
  { id: "apartments",  label: "Apartments.com",   color: "#E31837" },
  { id: "facebook",    label: "Facebook",         color: "#1877F2" },
  { id: "streeteasy",  label: "StreetEasy",       color: "#00A58E" },
  { id: "craigslist",  label: "Craigslist",       color: "#774433" },
  { id: "trulia",      label: "Trulia",           color: "#5E46D9" },
  { id: "realtor",     label: "Realtor.com",      color: "#D92228" },
  { id: "other",       label: "Other",            color: "#777065" },
];

const STATUSES: { id: StatusId; label: string; bg: string; color: string; icon: string }[] = [
  { id: "saved",    label: "Saved",      bg: "var(--muted)",  color: "var(--muted-foreground)", icon: "♡" },
  { id: "touring",  label: "Touring",    bg: "#ede9fa",       color: "#7c6bc4",                 icon: "↗" },
  { id: "applied",  label: "Applied",    bg: "#e6f4ef",       color: "#1a6b4a",                 icon: "→" },
  { id: "approved", label: "Approved",   bg: "#e6f4ef",       color: "#1a6b4a",                 icon: "✓" },
  { id: "passed",   label: "Passed",     bg: "#fde8e6",       color: "#c0392b",                 icon: "✕" },
];

const BEDROOMS = ["Studio", "1BR", "2BR", "3BR", "4BR+"];

const EMPTY_FORM: FormData = {
  address: "", rent: 0, bedrooms: "1BR",
  source: "zillow", sourceUrl: "", status: "saved",
  applicationFee: undefined, notes: "", roommates: [],
};

function loadListings(): Listing[] {
  if (typeof window === "undefined") return [];
  try { return JSON.parse(localStorage.getItem("aster_listings") || "[]"); }
  catch { return []; }
}
function saveListings(l: Listing[]) {
  localStorage.setItem("aster_listings", JSON.stringify(l));
}
function loadRoommates(): string[] {
  if (typeof window === "undefined") return [];
  try { return JSON.parse(localStorage.getItem("aster_roommates") || "[]"); }
  catch { return []; }
}

function parseListingUrl(url: string): Partial<FormData> {
  try {
    const u = new URL(url);
    const domain = u.hostname.replace("www.", "");
    let source: PlatformId = "other";
    let address = "";

    if (domain.includes("zillow")) {
      source = "zillow";
      // /homedetails/123-Main-St-Chicago-IL-60601/12345_zpid/
      const match = u.pathname.match(/\/homedetails\/([^/]+)\//);
      if (match) {
        address = match[1].replace(/-/g, " ").replace(/\d{5}$/, "").trim();
        address = address.replace(/\s+/g, " ").trim();
      }
    } else if (domain.includes("apartments.com")) {
      source = "apartments";
      // /the-building-name-city-st/
      const slug = u.pathname.split("/").filter(Boolean)[0] || "";
      address = slug.replace(/-/g, " ");
    } else if (domain.includes("streeteasy")) {
      source = "streeteasy";
      // /building/building-name or /rental/12345-address
      const parts = u.pathname.split("/").filter(Boolean);
      if (parts.length >= 2) address = parts[1].replace(/-/g, " ");
    } else if (domain.includes("facebook")) {
      source = "facebook";
    } else if (domain.includes("craigslist")) {
      source = "craigslist";
    } else if (domain.includes("trulia")) {
      source = "trulia";
      const match = u.pathname.match(/\/p\/[^/]+\/([^/]+)/);
      if (match) address = match[1].replace(/-/g, " ");
    } else if (domain.includes("realtor.com")) {
      source = "realtor";
      const match = u.pathname.match(/\/realestateandhomes-detail\/([^/]+)/);
      if (match) address = match[1].replace(/-/g, " ");
    }

    // Capitalize address words
    if (address) {
      address = address.replace(/\b\w/g, (c) => c.toUpperCase()).replace(/\s+/g, " ").trim();
    }

    return { source, address: address || "", sourceUrl: url };
  } catch {
    return { sourceUrl: url };
  }
}

function formatRoommate(name: string): string {
  const trimmed = name.trim();
  if (trimmed.startsWith("@")) return trimmed;
  return `@${trimmed}`;
}

export default function ListingsPage() {
  const router = useRouter();
  const [listings, setListings]             = useState<Listing[]>([]);
  const [activeStatus, setActiveStatus]     = useState<StatusId | "all">("all");
  const [showForm, setShowForm]             = useState(false);
  const [editId, setEditId]                 = useState<string | null>(null);
  const [form, setForm]                     = useState<FormData>(EMPTY_FORM);
  const [roommateInput, setRoommateInput]   = useState("");
  const [globalRoommates, setGlobalRoommates] = useState<string[]>([]);
  const [globalInput, setGlobalInput]       = useState("");

  // URL import
  const [showImport, setShowImport]         = useState(false);
  const [importUrl, setImportUrl]           = useState("");
  const importRef = useRef<HTMLInputElement>(null);

  // Compare mode
  const [compareMode, setCompareMode]       = useState(false);
  const [compareIds, setCompareIds]         = useState<string[]>([]);
  const [showCompare, setShowCompare]       = useState(false);

  useEffect(() => {
    setListings(loadListings());
    setGlobalRoommates(loadRoommates());
  }, []);

  useEffect(() => {
    if (showImport && importRef.current) importRef.current.focus();
  }, [showImport]);

  function persist(next: Listing[]) {
    setListings(next);
    saveListings(next);
  }

  function openAdd(prefill?: Partial<FormData>) {
    setEditId(null);
    setForm({ ...EMPTY_FORM, roommates: [...globalRoommates], ...prefill });
    setRoommateInput("");
    setShowForm(true);
  }

  function openEdit(l: Listing) {
    setEditId(l.id);
    setForm({
      address: l.address, rent: l.rent, bedrooms: l.bedrooms,
      source: l.source, sourceUrl: l.sourceUrl || "",
      status: l.status, applicationFee: l.applicationFee,
      notes: l.notes || "", roommates: [...l.roommates],
    });
    setRoommateInput("");
    setShowForm(true);
  }

  function saveForm() {
    if (!form.address || !form.rent) return;
    if (editId) {
      persist(listings.map(l => l.id === editId ? { ...l, ...form } : l));
    } else {
      persist([{
        ...form,
        id: Date.now().toString(),
        dateAdded: new Date().toLocaleDateString("en-US", { month: "short", day: "numeric" }),
      }, ...listings]);
    }
    setShowForm(false);
  }

  function deleteListing(id: string) {
    if (!confirm("Remove this listing?")) return;
    persist(listings.filter(l => l.id !== id));
    setShowForm(false);
  }

  function addFormRoommate() {
    const raw = roommateInput.trim();
    if (!raw) return;
    const name = formatRoommate(raw);
    if (form.roommates.includes(name)) return;
    setForm(f => ({ ...f, roommates: [...f.roommates, name] }));
    setRoommateInput("");
  }

  function addGlobalRoommate() {
    const raw = globalInput.trim();
    if (!raw) return;
    const name = formatRoommate(raw);
    if (globalRoommates.includes(name)) return;
    const next = [...globalRoommates, name];
    setGlobalRoommates(next);
    localStorage.setItem("aster_roommates", JSON.stringify(next));
    setGlobalInput("");
  }

  function removeGlobalRoommate(name: string) {
    const next = globalRoommates.filter(r => r !== name);
    setGlobalRoommates(next);
    localStorage.setItem("aster_roommates", JSON.stringify(next));
  }

  function quickUpdateStatus(id: string, newStatus: StatusId) {
    persist(listings.map(l => l.id === id ? { ...l, status: newStatus } : l));
  }

  function handleImport() {
    if (!importUrl.trim()) return;
    const prefill = parseListingUrl(importUrl.trim());
    setShowImport(false);
    setImportUrl("");
    openAdd(prefill);
  }

  function toggleCompareId(id: string) {
    setCompareIds(prev => {
      if (prev.includes(id)) return prev.filter(x => x !== id);
      if (prev.length >= 2) return [prev[1], id];
      return [...prev, id];
    });
  }

  const filtered = activeStatus === "all" ? listings : listings.filter(l => l.status === activeStatus);
  const totalFees = listings.reduce((s, l) => s + (l.applicationFee || 0), 0);

  function getPlatform(id: string) { return PLATFORMS.find(p => p.id === id) || PLATFORMS[PLATFORMS.length - 1]; }
  function getStatus(id: string)   { return STATUSES.find(s => s.id === id) || STATUSES[0]; }
  function getListing(id: string)  { return listings.find(l => l.id === id); }

  const compareA = compareIds[0] ? getListing(compareIds[0]) : null;
  const compareB = compareIds[1] ? getListing(compareIds[1]) : null;

  return (
    <div className="min-h-screen flex flex-col" style={{ background: "var(--background)" }}>
      {/* Nav */}
      <nav className="flex items-center justify-between px-5 py-4 border-b sticky top-0 z-10"
        style={{ borderColor: "var(--border)", background: "var(--background)" }}>
        <span
          className="text-base font-semibold tracking-tight cursor-pointer"
          style={{ color: "var(--foreground)" }}
          onClick={() => router.push("/")}
        >
          Aster
        </span>
        {totalFees > 0 && (
          <span className="text-xs font-semibold px-3 py-1.5 rounded-full"
            style={{ background: "#fde8e6", color: "#c0392b" }}>
            ${totalFees.toLocaleString()} in fees
          </span>
        )}
      </nav>

      {/* Header */}
      <div className="px-5 pt-7 pb-3">
        <div className="flex items-center gap-3 mb-1">
          <h1 className="text-2xl font-bold tracking-tight" style={{ color: "var(--foreground)" }}>
            Apartment tracker
          </h1>
          <button
            onClick={() => openAdd()}
            className="w-7 h-7 rounded-full flex items-center justify-center text-base font-bold transition-all hover:opacity-80"
            style={{ background: "var(--primary)", color: "#fff" }}
          >
            +
          </button>
        </div>
        <p className="text-sm mb-5" style={{ color: "var(--muted-foreground)" }}>
          {listings.length === 0
            ? "Your apartment hunt starts here."
            : `${listings.length} place${listings.length !== 1 ? "s" : ""} on your radar${
                listings.filter(l => l.status === "applied" || l.status === "approved").length > 0
                  ? ` · ${listings.filter(l => l.status === "applied" || l.status === "approved").length} applied`
                  : ""
              }`}
        </p>

        {/* Toolbar: Import + Compare */}
        <div className="flex items-center gap-2 mb-5">
          <button
            onClick={() => { setShowImport(v => !v); setCompareMode(false); }}
            className="text-xs font-semibold px-3 py-1.5 rounded-full border transition-all"
            style={{
              borderColor: showImport ? "var(--primary)" : "var(--border)",
              color: showImport ? "var(--primary)" : "var(--muted-foreground)",
              background: showImport ? "#ede9fa" : "transparent",
            }}
          >
            Import from link
          </button>
          {listings.length >= 2 && (
            <button
              onClick={() => { setCompareMode(v => !v); setCompareIds([]); setShowImport(false); }}
              className="text-xs font-semibold px-3 py-1.5 rounded-full border transition-all"
              style={{
                borderColor: compareMode ? "var(--primary)" : "var(--border)",
                color: compareMode ? "var(--primary)" : "var(--muted-foreground)",
                background: compareMode ? "#ede9fa" : "transparent",
              }}
            >
              Compare
            </button>
          )}
        </div>

        {/* Import URL input */}
        {showImport && (
          <div className="flex gap-2 mb-5">
            <input
              ref={importRef}
              type="url"
              placeholder="Paste a Zillow, StreetEasy, or Apartments.com link..."
              value={importUrl}
              onChange={e => setImportUrl(e.target.value)}
              onKeyDown={e => { if (e.key === "Enter") handleImport(); }}
              className="flex-1 px-4 py-2.5 text-sm rounded-lg border outline-none"
              style={{ borderColor: "var(--primary)", background: "var(--card)", color: "var(--foreground)" }}
            />
            <button
              onClick={handleImport}
              className="px-4 py-2.5 text-sm font-semibold rounded-lg"
              style={{ background: "var(--primary)", color: "#fff" }}
            >
              Import
            </button>
          </div>
        )}

        {/* Crew */}
        <div className="flex flex-wrap items-center gap-2 mb-1">
          <span className="text-xs font-semibold" style={{ color: "var(--muted-foreground)" }}>
            Your crew:
          </span>
          {globalRoommates.map(name => (
            <span key={name} className="flex items-center gap-1 text-xs font-medium px-2.5 py-1 rounded-full"
              style={{ background: "#ede9fa", color: "#7c6bc4" }}>
              {name}
              <button onClick={() => removeGlobalRoommate(name)} className="hover:opacity-60 ml-0.5">×</button>
            </span>
          ))}
          <div className="flex items-center gap-1">
            <input
              type="text" placeholder="+ @person" value={globalInput}
              onChange={e => setGlobalInput(e.target.value)}
              onKeyDown={e => { if (e.key === "Enter") { e.preventDefault(); addGlobalRoommate(); } }}
              className="text-xs px-2.5 py-1 rounded-full border outline-none"
              style={{ borderColor: "var(--border)", background: "transparent", color: "var(--foreground)", width: "80px" }}
            />
          </div>
        </div>
      </div>

      {/* Status tabs */}
      <div className="px-5 pb-3">
        <div className="flex gap-2 overflow-x-auto pb-1" style={{ scrollbarWidth: "none" }}>
          {([{ id: "all" as const, label: "All", icon: "" }, ...STATUSES]).map(s => {
            const count = s.id === "all" ? listings.length : listings.filter(l => l.status === s.id).length;
            const isActive = activeStatus === s.id;
            return (
              <button key={s.id} onClick={() => setActiveStatus(s.id)}
                className="whitespace-nowrap text-xs font-semibold px-3 py-1.5 rounded-full flex-shrink-0 transition-all"
                style={{
                  background: isActive ? "var(--foreground)" : "var(--muted)",
                  color: isActive ? "var(--background)" : "var(--muted-foreground)",
                }}>
                {"icon" in s && s.icon ? `${s.icon} ` : ""}{s.label}{count > 0 ? ` (${count})` : ""}
              </button>
            );
          })}
        </div>
      </div>

      {/* Compare hint */}
      {compareMode && (
        <div className="mx-5 mb-3 px-4 py-3 rounded-lg text-sm"
          style={{ background: "#ede9fa", color: "#7c6bc4" }}>
          {compareIds.length === 0 && "Select two places to compare them head-to-head."}
          {compareIds.length === 1 && "Pick one more to start the comparison."}
          {compareIds.length === 2 && (
            <div className="flex items-center justify-between">
              <span>2 selected — ready to compare!</span>
              <button onClick={() => setShowCompare(true)}
                className="text-xs font-bold underline ml-2">
                Compare now
              </button>
            </div>
          )}
        </div>
      )}

      {/* Cards */}
      <div className="flex-1 px-5 pb-28">
        {filtered.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-4xl mb-4" style={{ color: "var(--border)" }}>[ ]</p>
            <p className="text-sm font-semibold mb-1" style={{ color: "var(--foreground)" }}>
              {activeStatus === "all" ? "Nothing here yet" : `No ${getStatus(activeStatus).label.toLowerCase()} listings`}
            </p>
            <p className="text-xs mb-5" style={{ color: "var(--muted-foreground)" }}>
              {activeStatus === "all" ? "Tap + to add your first place, or import from a link." : "Switch to All to see everything."}
            </p>
            {activeStatus === "all" && (
              <button onClick={() => openAdd()}
                className="text-xs font-semibold px-4 py-2 rounded-lg"
                style={{ background: "var(--primary)", color: "#fff" }}>
                Add your first listing
              </button>
            )}
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {filtered.map(l => {
              const platform = getPlatform(l.source);
              const status = getStatus(l.status);
              const isSelected = compareIds.includes(l.id);
              return (
                <div key={l.id}
                  onClick={() => compareMode ? toggleCompareId(l.id) : openEdit(l)}
                  className="p-4 rounded-xl border w-full transition-all cursor-pointer"
                  style={{
                    borderColor: isSelected ? "var(--primary)" : "var(--border)",
                    background: isSelected ? "#ede9fa" : "var(--card)",
                    boxShadow: isSelected ? "0 0 0 2px var(--primary)" : "none",
                  }}>
                  {/* Top row */}
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div className="font-semibold text-sm leading-snug flex-1" style={{ color: "var(--foreground)" }}>
                      {l.address}
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      {compareMode && (
                        <div className="w-5 h-5 rounded-full border-2 flex items-center justify-center"
                          style={{ borderColor: isSelected ? "var(--primary)" : "var(--border)", background: isSelected ? "var(--primary)" : "transparent" }}>
                          {isSelected && <span className="text-white text-xs font-bold">✓</span>}
                        </div>
                      )}
                      {/* Status dropdown */}
                      <select
                        value={l.status}
                        onChange={e => { e.stopPropagation(); quickUpdateStatus(l.id, e.target.value as StatusId); }}
                        onClick={e => e.stopPropagation()}
                        className="text-xs font-bold px-2 py-1 rounded-full border-0 outline-none cursor-pointer"
                        style={{ background: status.bg, color: status.color }}
                      >
                        {STATUSES.map(s => (
                          <option key={s.id} value={s.id}>{s.icon} {s.label}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                  {/* Rent + bedrooms + source */}
                  <div className="flex items-center gap-2 flex-wrap mb-2">
                    <span className="text-base font-bold" style={{ color: "var(--foreground)" }}>
                      ${l.rent.toLocaleString()}
                      <span className="text-xs font-normal" style={{ color: "var(--muted-foreground)" }}>/mo</span>
                    </span>
                    <span className="text-xs" style={{ color: "var(--muted-foreground)" }}>{l.bedrooms}</span>
                    <span className="text-xs font-medium px-2 py-0.5 rounded-full"
                      style={{ background: platform.color + "18", color: platform.color }}>
                      {platform.label}
                    </span>
                  </div>
                  {/* Fee */}
                  {l.applicationFee ? (
                    <div className="text-xs font-medium mb-1.5" style={{ color: "#c0392b" }}>
                      App fee: ${l.applicationFee.toLocaleString()}
                    </div>
                  ) : null}
                  {/* Roommates */}
                  {l.roommates.length > 0 && (
                    <div className="text-xs" style={{ color: "#7c6bc4" }}>
                      {l.roommates.join(" ")}
                    </div>
                  )}
                  {/* Notes preview */}
                  {l.notes && (
                    <div className="text-xs mt-1.5 line-clamp-1" style={{ color: "var(--muted-foreground)" }}>
                      {l.notes}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Add / Edit overlay */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex flex-col" style={{ background: "var(--background)" }}>
          <div className="flex items-center justify-between px-5 py-4 border-b"
            style={{ borderColor: "var(--border)" }}>
            <button onClick={() => setShowForm(false)} className="text-sm"
              style={{ color: "var(--muted-foreground)" }}>Cancel</button>
            <span className="text-sm font-semibold" style={{ color: "var(--foreground)" }}>
              {editId ? "Edit place" : "Add a place"}
            </span>
            <button onClick={saveForm} className="text-sm font-semibold"
              style={{ color: form.address && form.rent ? "var(--primary)" : "var(--muted-foreground)" }}>
              Save
            </button>
          </div>

          <div className="flex-1 overflow-y-auto px-5 py-6 space-y-6">
            {/* Address */}
            <div>
              <label className="text-xs font-semibold uppercase tracking-wider mb-2 block"
                style={{ color: "var(--muted-foreground)" }}>Address</label>
              <input type="text" placeholder="123 Main St Apt 4B, Chicago"
                value={form.address}
                onChange={e => setForm(f => ({ ...f, address: e.target.value }))}
                className="w-full px-4 py-3 text-sm rounded-lg border outline-none"
                style={{ borderColor: "var(--border)", background: "var(--card)", color: "var(--foreground)" }}
              />
            </div>

            {/* Rent + Bedrooms */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-semibold uppercase tracking-wider mb-2 block"
                  style={{ color: "var(--muted-foreground)" }}>Monthly rent</label>
                <input type="number" placeholder="2,400"
                  value={form.rent || ""}
                  onChange={e => setForm(f => ({ ...f, rent: +e.target.value }))}
                  className="w-full px-4 py-3 text-sm rounded-lg border outline-none"
                  style={{ borderColor: "var(--border)", background: "var(--card)", color: "var(--foreground)" }}
                />
              </div>
              <div>
                <label className="text-xs font-semibold uppercase tracking-wider mb-2 block"
                  style={{ color: "var(--muted-foreground)" }}>Bedrooms</label>
                <div className="flex flex-wrap gap-1.5">
                  {BEDROOMS.map(b => (
                    <button key={b} onClick={() => setForm(f => ({ ...f, bedrooms: b }))}
                      className="px-2.5 py-1.5 text-xs font-medium rounded-lg border"
                      style={{
                        borderColor: form.bedrooms === b ? "var(--primary)" : "var(--border)",
                        background: form.bedrooms === b ? "var(--primary)" : "transparent",
                        color: form.bedrooms === b ? "#fff" : "var(--foreground)",
                      }}>
                      {b}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Platform */}
            <div>
              <label className="text-xs font-semibold uppercase tracking-wider mb-2 block"
                style={{ color: "var(--muted-foreground)" }}>Where did you find it?</label>
              <div className="flex flex-wrap gap-2">
                {PLATFORMS.map(p => (
                  <button key={p.id} onClick={() => setForm(f => ({ ...f, source: p.id }))}
                    className="px-3 py-1.5 text-xs font-medium rounded-lg border transition-all"
                    style={{
                      borderColor: form.source === p.id ? p.color : "var(--border)",
                      background: form.source === p.id ? p.color + "18" : "transparent",
                      color: form.source === p.id ? p.color : "var(--muted-foreground)",
                    }}>
                    {p.label}
                  </button>
                ))}
              </div>
            </div>

            {/* URL */}
            <div>
              <label className="text-xs font-semibold uppercase tracking-wider mb-2 block"
                style={{ color: "var(--muted-foreground)" }}>Listing URL (optional)</label>
              <input type="url" placeholder="https://..."
                value={form.sourceUrl || ""}
                onChange={e => setForm(f => ({ ...f, sourceUrl: e.target.value }))}
                className="w-full px-4 py-3 text-sm rounded-lg border outline-none"
                style={{ borderColor: "var(--border)", background: "var(--card)", color: "var(--foreground)" }}
              />
            </div>

            {/* Status — visual pills */}
            <div>
              <label className="text-xs font-semibold uppercase tracking-wider mb-3 block"
                style={{ color: "var(--muted-foreground)" }}>Status</label>
              <div className="grid grid-cols-2 gap-2">
                {STATUSES.map(s => {
                  const isActive = form.status === s.id;
                  return (
                    <button key={s.id} onClick={() => setForm(f => ({ ...f, status: s.id }))}
                      className="flex items-center gap-2 px-3 py-3 rounded-xl border text-left transition-all"
                      style={{
                        borderColor: isActive ? s.color : "var(--border)",
                        background: isActive ? s.bg : "transparent",
                      }}>
                      <span className="text-base" style={{ color: s.color }}>{s.icon}</span>
                      <span className="text-sm font-semibold" style={{ color: isActive ? s.color : "var(--foreground)" }}>
                        {s.label}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Application fee */}
            <div>
              <label className="text-xs font-semibold uppercase tracking-wider mb-2 block"
                style={{ color: "var(--muted-foreground)" }}>Application fee ($)</label>
              <input type="number" placeholder="75"
                value={form.applicationFee ?? ""}
                onChange={e => setForm(f => ({ ...f, applicationFee: e.target.value ? +e.target.value : undefined }))}
                className="w-full px-4 py-3 text-sm rounded-lg border outline-none"
                style={{ borderColor: "var(--border)", background: "var(--card)", color: "var(--foreground)" }}
              />
              <p className="text-xs mt-1.5" style={{ color: "var(--muted-foreground)" }}>
                Adds to your running fee total
              </p>
            </div>

            {/* Notes */}
            <div>
              <label className="text-xs font-semibold uppercase tracking-wider mb-2 block"
                style={{ color: "var(--muted-foreground)" }}>Notes</label>
              <textarea
                placeholder="First impressions, things to double-check, transit access..."
                value={form.notes || ""}
                onChange={e => setForm(f => ({ ...f, notes: e.target.value }))}
                rows={3}
                className="w-full px-4 py-3 text-sm rounded-lg border outline-none resize-none"
                style={{ borderColor: "var(--border)", background: "var(--card)", color: "var(--foreground)" }}
              />
            </div>

            {/* Roommates */}
            <div>
              <label className="text-xs font-semibold uppercase tracking-wider mb-2 block"
                style={{ color: "var(--muted-foreground)" }}>Searching with</label>
              <div className="flex flex-wrap gap-2 mb-2.5">
                {form.roommates.map(name => (
                  <span key={name} className="flex items-center gap-1 text-xs font-medium px-2.5 py-1 rounded-full"
                    style={{ background: "#ede9fa", color: "#7c6bc4" }}>
                    {name}
                    <button onClick={() => setForm(f => ({ ...f, roommates: f.roommates.filter(r => r !== name) }))}
                      className="hover:opacity-60">×</button>
                  </span>
                ))}
              </div>
              <div className="flex gap-2">
                <input type="text" placeholder="@alex or Alex"
                  value={roommateInput}
                  onChange={e => setRoommateInput(e.target.value)}
                  onKeyDown={e => { if (e.key === "Enter") { e.preventDefault(); addFormRoommate(); } }}
                  className="flex-1 px-4 py-2.5 text-sm rounded-lg border outline-none"
                  style={{ borderColor: "var(--border)", background: "var(--card)", color: "var(--foreground)" }}
                />
                <button onClick={addFormRoommate}
                  className="px-4 py-2.5 text-sm font-medium rounded-lg"
                  style={{ background: "var(--muted)", color: "var(--foreground)" }}>
                  Add
                </button>
              </div>
            </div>

            {/* Delete */}
            {editId && (
              <div className="pt-2 pb-4">
                <button onClick={() => deleteListing(editId!)}
                  className="w-full py-3 rounded-lg text-sm font-medium"
                  style={{ background: "#fde8e6", color: "#c0392b" }}>
                  Remove listing
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Head-to-head comparison modal */}
      {showCompare && compareA && compareB && (
        <div className="fixed inset-0 z-50 flex flex-col" style={{ background: "var(--background)" }}>
          <div className="flex items-center justify-between px-5 py-4 border-b"
            style={{ borderColor: "var(--border)" }}>
            <button onClick={() => setShowCompare(false)} className="text-sm"
              style={{ color: "var(--muted-foreground)" }}>Close</button>
            <span className="text-sm font-semibold" style={{ color: "var(--foreground)" }}>Head-to-head</span>
            <span className="w-10" />
          </div>

          <div className="flex-1 overflow-y-auto px-5 py-6">
            {/* Headers */}
            <div className="grid grid-cols-2 gap-3 mb-6">
              {[compareA, compareB].map((l, i) => (
                <div key={l.id} className="p-3 rounded-xl text-center"
                  style={{ background: i === 0 ? "#ede9fa" : "#e6f4ef" }}>
                  <div className="text-xs font-bold mb-1" style={{ color: i === 0 ? "#7c6bc4" : "#1a6b4a" }}>
                    Option {String.fromCharCode(65 + i)}
                  </div>
                  <div className="text-sm font-semibold leading-snug" style={{ color: "var(--foreground)" }}>
                    {l.address}
                  </div>
                </div>
              ))}
            </div>

            {/* Comparison rows */}
            {[
              {
                label: "Monthly rent",
                a: `$${compareA.rent.toLocaleString()}`,
                b: `$${compareB.rent.toLocaleString()}`,
                winner: compareA.rent < compareB.rent ? "a" : compareA.rent > compareB.rent ? "b" : null,
                winnerHint: "lower is better",
              },
              {
                label: "Bedrooms",
                a: compareA.bedrooms,
                b: compareB.bedrooms,
                winner: null,
              },
              {
                label: "Found on",
                a: PLATFORMS.find(p => p.id === compareA.source)?.label ?? "—",
                b: PLATFORMS.find(p => p.id === compareB.source)?.label ?? "—",
                winner: null,
              },
              {
                label: "Status",
                a: STATUSES.find(s => s.id === compareA.status)?.label ?? "—",
                b: STATUSES.find(s => s.id === compareB.status)?.label ?? "—",
                winner: null,
              },
              {
                label: "App fee",
                a: compareA.applicationFee ? `$${compareA.applicationFee.toLocaleString()}` : "None",
                b: compareB.applicationFee ? `$${compareB.applicationFee.toLocaleString()}` : "None",
                winner: (compareA.applicationFee ?? 0) < (compareB.applicationFee ?? 0) ? "a"
                      : (compareA.applicationFee ?? 0) > (compareB.applicationFee ?? 0) ? "b" : null,
                winnerHint: "lower is better",
              },
            ].map(row => (
              <div key={row.label} className="mb-4">
                <div className="text-xs font-semibold uppercase tracking-wider mb-2"
                  style={{ color: "var(--muted-foreground)" }}>{row.label}</div>
                <div className="grid grid-cols-2 gap-3">
                  {(["a", "b"] as const).map(side => {
                    const val = side === "a" ? row.a : row.b;
                    const isWinner = row.winner === side;
                    return (
                      <div key={side} className="px-3 py-2.5 rounded-lg border text-sm font-semibold text-center"
                        style={{
                          borderColor: isWinner ? (side === "a" ? "#7c6bc4" : "#1a6b4a") : "var(--border)",
                          background: isWinner ? (side === "a" ? "#ede9fa" : "#e6f4ef") : "var(--card)",
                          color: isWinner ? (side === "a" ? "#7c6bc4" : "#1a6b4a") : "var(--foreground)",
                        }}>
                        {val}
                        {isWinner && <span className="ml-1 text-xs">★</span>}
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}

            {/* Notes side-by-side */}
            {(compareA.notes || compareB.notes) && (
              <div className="mt-4">
                <div className="text-xs font-semibold uppercase tracking-wider mb-2"
                  style={{ color: "var(--muted-foreground)" }}>Notes</div>
                <div className="grid grid-cols-2 gap-3">
                  {[compareA, compareB].map((l, i) => (
                    <div key={l.id} className="px-3 py-2.5 rounded-lg border text-xs"
                      style={{ borderColor: "var(--border)", background: "var(--card)", color: "var(--muted-foreground)" }}>
                      {l.notes || <span style={{ opacity: 0.4 }}>No notes</span>}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      <BottomNav />
    </div>
  );
}
