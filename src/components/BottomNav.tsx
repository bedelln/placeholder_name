import React from 'react';
import { Tab } from '../types';

export function BottomNav({
  tab,
  setTab,
  inboxCount,
  pendingCount,
  isAdmin,
}: {
  tab: Tab;
  setTab: (t: Tab) => void;
  inboxCount: number;
  pendingCount: number;
  isAdmin?: boolean;
}) {
  const items: { id: Tab; label: string; icon: string; count?: number }[] = isAdmin
    ? [
        { id: "admin" as Tab, label: "Users", icon: "👥" },
        { id: "profile", label: "Profile", icon: "👤" },
      ]
    : [
        { id: "quests", label: "Quests", icon: "⚔️", count: inboxCount },
        { id: "guild", label: "Guild", icon: "🛡️", count: pendingCount },
        { id: "fame", label: "Fame", icon: "🏆" },
        { id: "profile", label: "Profile", icon: "👤" },
      ];

  return (
    <nav style={{
      display: "flex", height: 74, background: "var(--obsidian-mid)",
      borderTop: "1px solid var(--card-border)", paddingBottom: "env(safe-area-inset-bottom)",
      boxShadow: "0 -4px 20px rgba(0,0,0,0.4)",
    }}>
      {items.map((it) => (
        <button
          key={it.id}
          onClick={() => setTab(it.id)}
          style={{
            flex: 1, display: "flex", flexDirection: "column",
            alignItems: "center", justifyContent: "center", gap: 4,
            background: "transparent", color: tab === it.id ? "var(--gold)" : "var(--muted)",
            transition: "all 0.2s", position: "relative",
          }}
        >
          <span style={{ fontSize: 20, filter: tab === it.id ? "drop-shadow(var(--glow-gold))" : "none" }}>{it.icon}</span>
          <span style={{
            fontFamily: "'Cinzel', serif", fontSize: 10, fontWeight: 700,
            textTransform: "uppercase", letterSpacing: "0.05em",
          }}>
            {it.label}
          </span>
          {it.count ? it.count > 0 && (
            <span style={{
              position: "absolute", top: 10, right: "20%",
            }} className="badge">
              {it.count}
            </span>
          ) : null}
          {tab === it.id && (
            <div style={{
              position: "absolute", bottom: 0, width: 24, height: 2,
              background: "var(--gold)", borderRadius: 2, boxShadow: "var(--glow-gold)",
            }} />
          )}
        </button>
      ))}
    </nav>
  );
}
