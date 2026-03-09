"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

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

const STATUSES: { id: StatusId; label: string; bg: string; color: string }[] = [
  { id: "saved",    label: "Saved",       bg: "var(--muted)",  color: "var(--muted-foreground)" },
  { id: "touring",  label: "Touring",     bg: "#ede9fa",       color: "#7c6bc4" },
  { id: "applied",  label: "Applied",     bg: "#e6f4ef",       color: "#1a6b4a" },
  { id: "approved", label: "Approved ✓",  bg: "#e6f4ef",       color: "#1a6b4a" },
  { id: "passed",   label: "Passed",      bg: "#fde8e6",       color: "#c0392b" },
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

  useEffect(() => {
    setListings(loadListings());
    setGlobalRoommates(loadRoommates());
  }, []);

  function persist(next: Listing[]) {
    setListings(next);
    saveListings(next);
  }

  function openAdd() {
    setEditId(null);
    setForm({ ...EMPTY_FORM, roommates: [...globalRoommates] });
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
    const name = roommateInput.trim();
    if (!name || form.roommates.includes(name)) return;
    setForm(f => ({ ...f, roommates: [...f.roommates, name] }));
    setRoommateInput("");
  }

  function addGlobalRoommate() {
    const name = globalInput.trim();
    if (!name || globalRoommates.includes(name)) return;
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

  const filtered = activeStatus === "all" ? listings : listings.filter(l => l.status === activeStatus);
  const totalFees = listings.reduce((s, l) => s + (l.applicationFee || 0), 0);

  function getPlatform(id: string) { return PLATFORMS.find(p => p.id === id) || PLATFORMS[PLATFORMS.length - 1]; }
  function getStatus(id: string)   { return STATUSES.find(s => s.id === id) || STATUSES[0]; }

  return (
    <div className="min-h-screen flex flex-col" style={{ background: "var(--background)" }}>
      {/* Nav */}
      <nav className="flex items-center justify-between px-5 py-4 border-b sticky top-0 z-10"
        style={{ borderColor: "var(--border)", background: "var(--background)" }}>
        <span className="font-semibold text-base tracking-tight cursor-pointer"
          style={{ color: "var(--foreground)" }} onClick={() => router.push("/")}>
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
        <h1 className="text-2xl font-bold tracking-tight mb-1" style={{ color: "var(--foreground)" }}>
          My apartment tracker
        </h1>
        <p className="text-sm mb-5" style={{ color: "var(--muted-foreground)" }}>
          {listings.length === 0
            ? "Start tracking apartments you're considering."
            : `${listings.length} apartment${listings.length !== 1 ? "s" : ""} tracked${
                listings.filter(l => l.status === "applied" || l.status === "approved").length > 0
                  ? ` · ${listings.filter(l => l.status === "applied" || l.status === "approved").length} applied`
                  : ""
              }`}
        </p>

        {/* Searching with */}
        <div className="flex flex-wrap items-center gap-2 mb-1">
          <span className="text-xs font-semibold" style={{ color: "var(--muted-foreground)" }}>
            Searching with:
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
              type="text" placeholder="+ Add person" value={globalInput}
              onChange={e => setGlobalInput(e.target.value)}
              onKeyDown={e => { if (e.key === "Enter") { e.preventDefault(); addGlobalRoommate(); } }}
              className="text-xs px-2.5 py-1 rounded-full border outline-none"
              style={{ borderColor: "var(--border)", background: "transparent", color: "var(--foreground)", width: "90px" }}
            />
          </div>
        </div>
      </div>

      {/* Status tabs */}
      <div className="px-5 pb-3">
        <div className="flex gap-2 overflow-x-auto pb-1" style={{ scrollbarWidth: "none" }}>
          {([{ id: "all" as const, label: "All" }, ...STATUSES]).map(s => {
            const count = s.id === "all" ? listings.length : listings.filter(l => l.status === s.id).length;
            const isActive = activeStatus === s.id;
            return (
              <button key={s.id} onClick={() => setActiveStatus(s.id)}
                className="whitespace-nowrap text-xs font-semibold px-3 py-1.5 rounded-full flex-shrink-0 transition-all"
                style={{
                  background: isActive ? "var(--foreground)" : "var(--muted)",
                  color: isActive ? "var(--background)" : "var(--muted-foreground)",
                }}>
                {s.label}{count > 0 ? ` (${count})` : ""}
              </button>
            );
          })}
        </div>
      </div>

      {/* Cards */}
      <div className="flex-1 px-5 pb-28">
        {filtered.length === 0 ? (
          <div className="text-center py-20">
            <div className="text-5xl mb-4">🏠</div>
            <p className="text-sm font-semibold mb-1" style={{ color: "var(--foreground)" }}>
              {activeStatus === "all" ? "No listings yet" : `No ${getStatus(activeStatus).label.toLowerCase()} listings`}
            </p>
            <p className="text-xs" style={{ color: "var(--muted-foreground)" }}>
              {activeStatus === "all" ? "Tap + to add your first apartment." : "Switch to All to see everything."}
            </p>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {filtered.map(l => {
              const platform = getPlatform(l.source);
              const status = getStatus(l.status);
              return (
                <button key={l.id} onClick={() => openEdit(l)}
                  className="text-left p-4 rounded-xl border w-full transition-all hover:shadow-sm"
                  style={{ borderColor: "var(--border)", background: "var(--card)" }}>
                  {/* Top row */}
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div className="font-semibold text-sm leading-snug" style={{ color: "var(--foreground)" }}>
                      {l.address}
                    </div>
                    <span className="text-xs font-semibold px-2 py-0.5 rounded-full flex-shrink-0"
                      style={{ background: status.bg, color: status.color }}>
                      {status.label}
                    </span>
                  </div>
                  {/* Rent + bedrooms + source */}
                  <div className="flex items-center gap-2 flex-wrap mb-2">
                    <span className="text-sm font-bold" style={{ color: "var(--foreground)" }}>
                      ${l.rent.toLocaleString()}/mo
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
                    <div className="text-xs" style={{ color: "var(--muted-foreground)" }}>
                      With: {l.roommates.join(", ")}
                    </div>
                  )}
                  {/* Notes preview */}
                  {l.notes && (
                    <div className="text-xs mt-1.5 line-clamp-1" style={{ color: "var(--muted-foreground)" }}>
                      {l.notes}
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* FAB */}
      <div className="fixed bottom-6 right-6 z-20">
        <button onClick={openAdd}
          className="w-14 h-14 rounded-full flex items-center justify-center text-2xl shadow-lg transition-all active:scale-95"
          style={{ background: "var(--primary)", color: "#fff" }}>
          +
        </button>
      </div>

      {/* Add / Edit overlay */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex flex-col" style={{ background: "var(--background)" }}>
          <div className="flex items-center justify-between px-5 py-4 border-b"
            style={{ borderColor: "var(--border)" }}>
            <button onClick={() => setShowForm(false)} className="text-sm"
              style={{ color: "var(--muted-foreground)" }}>Cancel</button>
            <span className="text-sm font-semibold" style={{ color: "var(--foreground)" }}>
              {editId ? "Edit listing" : "Add listing"}
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

            {/* Status + Fee */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-semibold uppercase tracking-wider mb-2 block"
                  style={{ color: "var(--muted-foreground)" }}>Status</label>
                <div className="space-y-1.5">
                  {STATUSES.map(s => (
                    <button key={s.id} onClick={() => setForm(f => ({ ...f, status: s.id }))}
                      className="w-full px-3 py-2 text-xs font-medium rounded-lg text-left border transition-all"
                      style={{
                        borderColor: form.status === s.id ? "var(--foreground)" : "var(--border)",
                        background: form.status === s.id ? "var(--foreground)" : "transparent",
                        color: form.status === s.id ? "var(--background)" : "var(--muted-foreground)",
                      }}>
                      {s.label}
                    </button>
                  ))}
                </div>
              </div>
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
                  Adds to your fee total
                </p>
              </div>
            </div>

            {/* Notes */}
            <div>
              <label className="text-xs font-semibold uppercase tracking-wider mb-2 block"
                style={{ color: "var(--muted-foreground)" }}>Notes</label>
              <textarea
                placeholder="First impressions, things to check, transit access..."
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
                <input type="text" placeholder="Add a name..."
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
    </div>
  );
}
