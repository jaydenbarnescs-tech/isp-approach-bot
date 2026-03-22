"use client";
import { useState, useEffect, useMemo } from "react";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://vrsvfphylajgrnjiewxk.supabase.co";
const SUPABASE_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";

async function supaFetch(table, params = "") {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/${table}?${params}`, {
    headers: { apikey: SUPABASE_KEY, Authorization: `Bearer ${SUPABASE_KEY}` },
  });
  return res.json();
}

async function supaUpdate(table, id, body) {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/${table}?id=eq.${id}`, {
    method: "PATCH",
    headers: {
      apikey: SUPABASE_KEY,
      Authorization: `Bearer ${SUPABASE_KEY}`,
      "Content-Type": "application/json",
      Prefer: "return=minimal",
    },
    body: JSON.stringify(body),
  });
  return res.ok;
}

const STATUS_MAP = {
  "未着手": { color: "#3b82f6", bg: "#1e3a5f" },
  "架電済": { color: "#f59e0b", bg: "#4a3520" },
  "商談中": { color: "#a855f7", bg: "#3b1f5e" },
  "成約": { color: "#22c55e", bg: "#1a3a2a" },
  "見送り": { color: "#ef4444", bg: "#3f1f1f" },
};

const PRIORITY_COLOR = (s) =>
  s >= 80 ? "#ef4444" : s >= 60 ? "#f59e0b" : s >= 40 ? "#3b82f6" : "#6b7280";

function Badge({ status }) {
  const s = STATUS_MAP[status] || { color: "#888", bg: "#333" };
  return (
    <span style={{ padding: "3px 10px", borderRadius: 20, fontSize: 12, fontWeight: 600, color: s.color, background: s.bg, whiteSpace: "nowrap" }}>
      {status}
    </span>
  );
}

function PriorityBar({ score }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
      <div style={{ width: 48, height: 6, background: "#1f2937", borderRadius: 3, overflow: "hidden" }}>
        <div style={{ width: `${score}%`, height: "100%", background: PRIORITY_COLOR(score), borderRadius: 3 }} />
      </div>
      <span style={{ fontSize: 12, color: PRIORITY_COLOR(score), fontWeight: 600, minWidth: 22 }}>{score}</span>
    </div>
  );
}

function StatCard({ label, value, sub, accent }) {
  return (
    <div style={{ background: "#111827", border: "1px solid #1f2937", borderRadius: 12, padding: "18px 20px", flex: 1, minWidth: 130 }}>
      <div style={{ fontSize: 12, color: "#9ca3af", marginBottom: 4 }}>{label}</div>
      <div style={{ fontSize: 28, fontWeight: 700, color: accent || "#f9fafb" }}>{value}</div>
      {sub && <div style={{ fontSize: 11, color: "#6b7280", marginTop: 4 }}>{sub}</div>}
    </div>
  );
}

export default function Dashboard() {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [sortBy, setSortBy] = useState("priority");
  const [selected, setSelected] = useState(null);

  useEffect(() => {
    supaFetch("customers", "select=*&order=priority_score.desc").then((data) => {
      if (Array.isArray(data)) setCustomers(data);
      setLoading(false);
    });
  }, []);

  const handleStatusChange = async (id, newStatus) => {
    const ok = await supaUpdate("customers", id, { approach_status: newStatus });
    if (ok) {
      setCustomers((prev) => prev.map((c) => (c.id === id ? { ...c, approach_status: newStatus } : c)));
      setSelected((prev) => (prev?.id === id ? { ...prev, approach_status: newStatus } : prev));
    }
  };

  const filtered = useMemo(() => {
    let list = customers;
    if (statusFilter !== "all") list = list.filter((c) => c.approach_status === statusFilter);
    if (search) {
      const q = search.toLowerCase();
      list = list.filter((c) =>
        c.full_name.toLowerCase().includes(q) || c.address.toLowerCase().includes(q) ||
        c.current_isp.toLowerCase().includes(q) || c.phone.includes(q)
      );
    }
    if (sortBy === "priority") list = [...list].sort((a, b) => b.priority_score - a.priority_score);
    else if (sortBy === "contract_end") list = [...list].sort((a, b) => new Date(a.contract_end_date || "2099-01-01") - new Date(b.contract_end_date || "2099-01-01"));
    else if (sortBy === "cost") list = [...list].sort((a, b) => b.monthly_cost - a.monthly_cost);
    return list;
  }, [customers, statusFilter, search, sortBy]);

  const stats = useMemo(() => {
    const total = customers.length;
    const byStatus = {};
    customers.forEach((c) => (byStatus[c.approach_status] = (byStatus[c.approach_status] || 0) + 1));
    const highP = customers.filter((c) => c.priority_score >= 80).length;
    const expiring = customers.filter((c) => {
      if (!c.contract_end_date) return false;
      return (new Date(c.contract_end_date) - new Date()) / 86400000 <= 30;
    }).length;
    return { total, byStatus, highP, expiring };
  }, [customers]);

  return (
    <div style={{ background: "#0a0e17", minHeight: "100vh", color: "#e5e7eb", fontFamily: "'DM Sans', 'Noto Sans JP', sans-serif" }}>
      <header style={{ padding: "16px 28px", borderBottom: "1px solid #1f2937", display: "flex", alignItems: "center", justifyContent: "space-between", background: "#0c0f17" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{ width: 36, height: 36, borderRadius: 10, background: "linear-gradient(135deg, #6d28d9, #2563eb)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18 }}>\ud83d\udcde</div>
          <div>
            <div style={{ fontWeight: 700, fontSize: 16, color: "#f9fafb" }}>ISP Approach Bot</div>
            <div style={{ fontSize: 11, color: "#6b7280" }}>AI Voice Sales Dashboard</div>
          </div>
        </div>
      </header>
      <main style={{ padding: "24px 28px", maxWidth: 1280, margin: "0 auto" }}>
        <div style={{ display: "flex", gap: 12, marginBottom: 24, flexWrap: "wrap" }}>
          <StatCard label="\u7dcf\u30ea\u30fc\u30c9\u6570" value={stats.total} />
          <StatCard label="\u9ad8\u512a\u5148\u5ea6" value={stats.highP} accent="#ef4444" />
          <StatCard label="\u5951\u7d04\u7d42\u4e8630\u65e5\u4ee5\u5185" value={stats.expiring} accent="#f59e0b" />
          <StatCard label="\u6210\u7d04" value={stats.byStatus["\u6210\u7d04"] || 0} accent="#22c55e" />
        </div>
        <div style={{ display: "flex", gap: 10, marginBottom: 18, flexWrap: "wrap", alignItems: "center" }}>
          <input type="text" placeholder="\ud83d\udd0d \u691c\u7d22..." value={search} onChange={(e) => setSearch(e.target.value)} style={{ padding: "9px 14px", background: "#111827", border: "1px solid #1f2937", borderRadius: 8, color: "#e5e7eb", fontSize: 13, width: 280 }} />
          {["all", "\u672a\u7740\u624b", "\u67b6\u96fb\u6e08", "\u5546\u8ac7\u4e2d", "\u6210\u7d04", "\u898b\u9001\u308a"].map((s) => (
            <button key={s} onClick={() => setStatusFilter(s)} style={{ padding: "6px 12px", borderRadius: 6, border: statusFilter === s ? "1px solid #4f46e5" : "1px solid #1f2937", background: statusFilter === s ? "#1e1b4b" : "transparent", color: statusFilter === s ? "#818cf8" : "#6b7280", cursor: "pointer", fontSize: 12 }}>
              {s === "all" ? "\u5168\u3066" : s}
            </button>
          ))}
        </div>
        {loading ? <div style={{ textAlign: "center", padding: 60 }}>Loading...</div> : (
          <div style={{ overflowX: "auto", borderRadius: 12, border: "1px solid #1f2937" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
              <thead><tr style={{ background: "#0c0f17" }}>
                {["\u9867\u5ba2\u540d","\u4f4f\u6240","ISP","\u901f\u5ea6","\u6708\u984d","\u5951\u7d04\u7d42\u4e86","\u30b9\u30c6\u30fc\u30bf\u30b9","\u512a\u5148\u5ea6"].map((h) => (
                  <th key={h} style={{ padding: "10px 14px", textAlign: "left", color: "#6b7280", fontWeight: 500, fontSize: 11, borderBottom: "1px solid #1f2937" }}>{h}</th>
                ))}
              </tr></thead>
              <tbody>{filtered.map((c, i) => (
                <tr key={c.id} onClick={() => setSelected(c)} style={{ background: i % 2 === 0 ? "transparent" : "#080b12", cursor: "pointer" }}>
                  <td style={{ padding: "10px 14px", fontWeight: 600, color: "#f9fafb" }}>{c.full_name}</td>
                  <td style={{ padding: "10px 14px", color: "#9ca3af", maxWidth: 200, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{c.address}</td>
                  <td style={{ padding: "10px 14px" }}>{c.current_isp}</td>
                  <td style={{ padding: "10px 14px", color: "#9ca3af" }}>{c.contract_speed}</td>
                  <td style={{ padding: "10px 14px" }}>\u00a5{c.monthly_cost?.toLocaleString()}</td>
                  <td style={{ padding: "10px 14px" }}>{c.contract_end_date || "\u2014"}</td>
                  <td style={{ padding: "10px 14px" }}><Badge status={c.approach_status} /></td>
                  <td style={{ padding: "10px 14px" }}><PriorityBar score={c.priority_score} /></td>
                </tr>
              ))}</tbody>
            </table>
          </div>
        )}
      </main>
    </div>
  );
}
