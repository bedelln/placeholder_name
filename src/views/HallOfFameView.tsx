import React, { useEffect, useRef, useState } from 'react';

import { Avatar, Spinner, XpBadge } from '../components/Common';
import { api } from '../services/api';
import { Group, LeaderboardEntry } from '../types';

export function HallOfFameView({ currentUserId }: { currentUserId: string }) {
  const [groups, setGroups] = useState<Group[]>([]);
  const [selectedScope, setSelectedScope] = useState("all");
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [loadingGroups, setLoadingGroups] = useState(true);
  const [loadingLeaderboard, setLoadingLeaderboard] = useState(true);
  const [scopeMenuOpen, setScopeMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    let cancelled = false;

    const loadGroups = async () => {
      setLoadingGroups(true);
      try {
        const nextGroups = await api.groups.list();
        if (!cancelled) {
          setGroups(nextGroups);
        }
      } catch {
        if (!cancelled) {
          setGroups([]);
        }
      } finally {
        if (!cancelled) {
          setLoadingGroups(false);
        }
      }
    };

    loadGroups();

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    let cancelled = false;

    const loadLeaderboard = async () => {
      setLoadingLeaderboard(true);
      try {
        const nextEntries = await api.leaderboard.list(selectedScope === "all" ? undefined : selectedScope);
        if (!cancelled) {
          setEntries(nextEntries);
        }
      } catch {
        if (!cancelled) {
          setEntries([]);
        }
      } finally {
        if (!cancelled) {
          setLoadingLeaderboard(false);
        }
      }
    };

    loadLeaderboard();

    return () => {
      cancelled = true;
    };
  }, [selectedScope]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (!menuRef.current?.contains(event.target as Node)) {
        setScopeMenuOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const medals: Record<number, string> = { 1: "🥇", 2: "🥈", 3: "🥉" };
  const maxXp = entries[0]?.user.xp || 1;
  const selectedGroup = selectedScope === "all" ? null : groups.find((group) => group.id === selectedScope) ?? null;
  const scopeOptions = [
    { id: "all", label: "All Friends", detail: "Across your entire guild roster" },
    ...groups.map((group) => ({
      id: group.id,
      label: group.name,
      detail: `${group.members.length} member${group.members.length === 1 ? "" : "s"}`
    }))
  ];
  const selectedScopeLabel = selectedGroup?.name ?? "All Friends";

  return (
    <div style={{ display: "flex", flexDirection: "column", width: "100%", height: "100%", overflowY: "auto" }}>
      <div style={{ padding: "24px 20px" }}>
        <h1 style={{ fontFamily: "'Cinzel', serif", fontWeight: 900, fontSize: 26, lineHeight: 1.1, marginBottom: 4 }} className="gold-text">
          Hall of Fame
        </h1>
        <p style={{ color: "var(--muted)", fontSize: 13 }}>
          {selectedGroup ? `XP standings for ${selectedGroup.name}` : "Top adventurers across your full friends list"}
        </p>

        <div style={{ marginTop: 18, marginBottom: 24 }}>
          <label style={{ display: "block", marginBottom: 8, color: "var(--muted)", fontSize: 12, fontWeight: 700, letterSpacing: "0.08em" }}>
            LEADERBOARD SCOPE
          </label>
          <div ref={menuRef} style={{ position: "relative" }}>
            <button
              onClick={() => setScopeMenuOpen((prev) => !prev)}
              style={{
                width: "100%",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                gap: 12,
                background: "linear-gradient(180deg, rgba(25,24,42,0.96), rgba(18,17,30,0.98))",
                border: scopeMenuOpen ? "1px solid rgba(240,192,64,0.38)" : "1px solid rgba(255,255,255,0.1)",
                borderRadius: 14,
                padding: "13px 16px",
                color: "var(--parchment)",
                boxShadow: scopeMenuOpen ? "0 0 0 1px rgba(240,192,64,0.08), 0 12px 24px rgba(0,0,0,0.28)" : "none",
              }}
            >
              <div style={{ textAlign: "left" }}>
                <div style={{ fontFamily: "'Cinzel', serif", fontWeight: 700, fontSize: 15, color: "var(--gold)" }}>
                  {selectedScopeLabel}
                </div>
                <div style={{ fontSize: 11, color: "var(--muted)" }}>
                  {selectedGroup ? `${selectedGroup.members.length} ranked adventurers` : "Everyone in your friends list"}
                </div>
              </div>
              <div style={{ color: scopeMenuOpen ? "var(--gold)" : "var(--muted)", fontSize: 14 }}>
                {scopeMenuOpen ? "▲" : "▼"}
              </div>
            </button>

            {scopeMenuOpen && (
              <div
                className="card"
                style={{
                  position: "absolute",
                  top: "calc(100% + 8px)",
                  left: 0,
                  right: 0,
                  zIndex: 20,
                  padding: 8,
                  background: "linear-gradient(180deg, rgba(20,19,32,0.98), rgba(13,13,26,0.99))",
                  border: "1px solid rgba(240,192,64,0.18)",
                  boxShadow: "0 18px 40px rgba(0,0,0,0.38)",
                }}
              >
                {scopeOptions.map((option) => {
                  const active = option.id === selectedScope;
                  return (
                    <button
                      key={option.id}
                      onClick={() => {
                        setSelectedScope(option.id);
                        setScopeMenuOpen(false);
                      }}
                      style={{
                        width: "100%",
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        gap: 12,
                        padding: "12px 14px",
                        borderRadius: 12,
                        background: active ? "rgba(240,192,64,0.12)" : "transparent",
                        border: active ? "1px solid rgba(240,192,64,0.3)" : "1px solid transparent",
                        color: "var(--parchment)",
                      }}
                    >
                      <div style={{ textAlign: "left" }}>
                        <div style={{ fontFamily: "'Cinzel', serif", fontWeight: 700, fontSize: 14, color: active ? "var(--gold)" : "var(--parchment)" }}>
                          {option.label}
                        </div>
                        <div style={{ fontSize: 11, color: "var(--muted)" }}>{option.detail}</div>
                      </div>
                      <div style={{ fontSize: 12, color: active ? "var(--gold)" : "var(--teal)" }}>
                        {active ? "Selected" : "View"}
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
          {loadingGroups && <div style={{ marginTop: 10 }}><Spinner /></div>}
        </div>

        {loadingLeaderboard ? (
          <Spinner />
        ) : (
          <>
            {entries.length >= 3 && (
              <div
                style={{
                  display: "flex", alignItems: "flex-end", justifyContent: "center",
                  gap: 16, marginBottom: 32, padding: "24px 0",
                }}
              >
                {[1, 0, 2].map((idx) => {
                  const entry = entries[idx];
                  if (!entry) return null;
                  const heights = [80, 100, 60];
                  const height = heights[[1, 0, 2].indexOf(idx)];
                  const isMe = entry.user.id === currentUserId;
                  return (
                    <div
                      key={entry.user.id}
                      className="fade-up"
                      style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 8 }}
                    >
                      <div style={{ fontSize: 22 }}>{medals[entry.rank] ?? entry.rank}</div>
                      <div style={{ position: "relative" }}>
                        <Avatar user={entry.user} size={idx === 0 ? 52 : 42} />
                        {isMe && (
                          <div style={{
                            position: "absolute", inset: -3, borderRadius: "50%",
                            border: "2px solid var(--gold)", animation: "glowPulse 2s ease infinite",
                          }} />
                        )}
                      </div>
                      <div style={{ fontFamily: "'Cinzel', serif", fontWeight: 700, fontSize: 13, textAlign: "center", maxWidth: 80 }}>
                        {entry.user.displayName.split(" ")[0]}
                      </div>
                      <XpBadge xp={entry.user.xp} />
                      <div style={{
                        width: 64, background: "rgba(240,192,64,0.12)",
                        border: "1px solid rgba(240,192,64,0.25)",
                        borderRadius: "6px 6px 0 0", height,
                      }} />
                    </div>
                  );
                })}
              </div>
            )}

            <div className="separator" />

            {entries.map((entry, i) => {
              const isMe = entry.user.id === currentUserId || entry.isCurrentUser;
              const pct = Math.round((entry.user.xp / maxXp) * 100);
              return (
                <div
                  key={entry.user.id}
                  className="card fade-up"
                  style={{
                    marginBottom: 8, padding: "14px 16px",
                    borderColor: isMe ? "rgba(240,192,64,0.4)" : "var(--card-border)",
                    background: isMe ? "rgba(240,192,64,0.05)" : "var(--card)",
                    animationDelay: `${i * 0.04}s`,
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 10 }}>
                    <div style={{
                      width: 28, fontFamily: "'Cinzel', serif", fontWeight: 700, fontSize: 16,
                      color: entry.rank <= 3 ? "var(--gold)" : "var(--muted)", textAlign: "center",
                    }}>
                      {medals[entry.rank] ?? `#${entry.rank}`}
                    </div>
                    <Avatar user={entry.user} size={38} />
                    <div style={{ flex: 1 }}>
                      <div style={{ fontFamily: "'Cinzel', serif", fontWeight: 700, fontSize: 14, color: isMe ? "var(--gold)" : "var(--parchment)" }}>
                        {entry.user.displayName} {isMe && <span style={{ fontSize: 11, color: "var(--teal)" }}>· YOU</span>}
                      </div>
                      <div style={{ fontSize: 12, color: "var(--muted)" }}>@{entry.user.username}</div>
                    </div>
                    <XpBadge xp={entry.user.xp} />
                  </div>
                  <div style={{ height: 4, background: "rgba(255,255,255,0.06)", borderRadius: 2, overflow: "hidden" }}>
                    <div style={{
                      height: "100%", width: `${pct}%`, borderRadius: 2,
                      background: isMe
                        ? "linear-gradient(90deg, #f0c040, #fde89a)"
                        : "linear-gradient(90deg, var(--teal-dim), var(--teal))",
                      transition: "width 1s ease",
                    }} />
                  </div>
                </div>
              );
            })}

            {entries.length === 0 && (
              <div className="card" style={{ padding: "20px 16px", color: "var(--muted)", textAlign: "center" }}>
                No leaderboard entries found for this selection.
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
