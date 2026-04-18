import React, { useEffect, useRef, useState } from 'react';
import { User } from '../types';

/**
 * The ProfileView displays the user's progress in a card-based layout inspired by
 * the original concept while keeping the live XP display and logout behavior.
 */
export function ProfileView({
  currentUser,
}: {
  currentUser: User;
}) {
  const [xp, setXp] = useState(currentUser.xp);
  const [displayXp, setDisplayXp] = useState(0);
  const animRef = useRef<ReturnType<typeof setInterval>>();

  useEffect(() => {
    setXp(currentUser.xp);
  }, [currentUser.xp]);

  useEffect(() => {
    let current = 0;
    const target = xp;
    const step = Math.max(1, Math.ceil(target / 60));

    animRef.current = setInterval(() => {
      current = Math.min(current + step, target);
      setDisplayXp(current);
      if (current >= target) {
        clearInterval(animRef.current);
      }
    }, 16);

    return () => clearInterval(animRef.current);
  }, [xp]);

  const level = Math.floor(xp / 500) + 1;
  const xpIntoLevel = xp % 500;
  const xpPct = Math.round((xpIntoLevel / 500) * 100);
  const xpToNextLevel = Math.max(0, 500 - xpIntoLevel);

  const statCards = [
    { label: "Level", value: `${level}`, icon: "🏅" },
    { label: "Total XP", value: `${displayXp}`, icon: "⚔️" },
    { label: "Next Level", value: `${xpToNextLevel}`, icon: "🔥" },
  ];

  const recentDeeds = [
    {
      icon: "✅",
      title: `Holding steady at Level ${level}`,
      subtitle: `${xpToNextLevel} XP until Level ${level + 1}`,
    },
    {
      icon: "⚔️",
      title: `Current XP stands at ${displayXp}`,
      subtitle: `Progress bar is ${xpPct}% full`,
    },
    {
      icon: "📜",
      title: "Account forged and ready for sidequests",
      subtitle: `Joined ${new Date(currentUser.createdAt).toLocaleDateString()}`,
    },
  ];

  return (
    <div style={{ display: "flex", flexDirection: "column", width: "100%", height: "100%", overflowY: "auto" }}>
      <div style={{ minHeight: "100%", padding: "28px 20px 24px" }}>
        <div style={{ width: "100%", display: "flex", flexDirection: "column", gap: 18 }}>
          <div
            className="card"
            style={{
              padding: "26px 22px 22px",
              textAlign: "center",
              background: "linear-gradient(180deg, rgba(255,255,255,0.04), rgba(255,255,255,0.02))",
            }}
          >
            <div style={{ position: "relative", width: 92, margin: "0 auto 18px" }}>
              <div
                style={{
                  width: 92,
                  height: 92,
                  borderRadius: "50%",
                  background: "linear-gradient(135deg, #e16464, #f0c040)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 34,
                  color: "#191523",
                  fontWeight: 900,
                  fontFamily: "'Cinzel', serif",
                  boxShadow: "0 10px 26px rgba(0,0,0,0.35)",
                }}
              >
                {currentUser.displayName[0]}
              </div>
              <div
                style={{
                  position: "absolute",
                  right: -2,
                  bottom: 2,
                  background: "linear-gradient(135deg, var(--gold), #fde89a)",
                  color: "#191523",
                  fontFamily: "'Cinzel', serif",
                  fontWeight: 900,
                  fontSize: 11,
                  padding: "4px 9px",
                  borderRadius: 999,
                  border: "2px solid var(--obsidian-mid)",
                }}
              >
                LV.{level}
              </div>
            </div>

            <div style={{ fontFamily: "'Cinzel', serif", fontWeight: 700, fontSize: 22, marginBottom: 4 }}>
              {currentUser.displayName}
            </div>
            <div style={{ color: "var(--muted)", fontSize: 13, marginBottom: 14 }}>@{currentUser.username}</div>

            <div
              className="gold-text"
              style={{ fontFamily: "'Cinzel', serif", fontWeight: 900, fontSize: 20, marginBottom: 2 }}
            >
              {displayXp}
            </div>
            <div
              style={{
                color: "var(--gold)",
                fontFamily: "'Cinzel', serif",
                fontWeight: 700,
                fontSize: 12,
                letterSpacing: "0.08em",
                marginBottom: 18,
              }}
            >
              XP
            </div>

            <div style={{ width: "100%", maxWidth: 250, margin: "0 auto" }}>
              <div
                style={{
                  height: 6,
                  background: "rgba(255,255,255,0.06)",
                  borderRadius: 999,
                  overflow: "hidden",
                }}
              >
                <div
                  style={{
                    height: "100%",
                    width: `${xpPct}%`,
                    background: "linear-gradient(90deg, var(--gold-dim), var(--gold))",
                    boxShadow: "0 0 10px rgba(240,192,64,0.4)",
                    transition: "width 0.4s ease-out",
                  }}
                />
              </div>
              <div style={{ color: "var(--muted)", fontSize: 11, marginTop: 8 }}>
                {xpIntoLevel} / 500 XP to Level {level + 1}
              </div>
            </div>
          </div>

          <div className="separator" />

          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12 }}>
            {statCards.map((card) => (
              <div key={card.label} className="card" style={{ padding: "14px 8px", textAlign: "center" }}>
                <div style={{ fontSize: 20, marginBottom: 8 }}>{card.icon}</div>
                <div
                  style={{
                    fontFamily: "'Cinzel', serif",
                    fontWeight: 700,
                    fontSize: 18,
                    color: "var(--gold)",
                  }}
                >
                  {card.value}
                </div>
                <div
                  style={{
                    fontSize: 10,
                    color: "var(--muted)",
                    textTransform: "uppercase",
                    letterSpacing: "0.05em",
                    marginTop: 4,
                  }}
                >
                  {card.label}
                </div>
              </div>
            ))}
          </div>

          <div>
            <div
              style={{
                fontFamily: "'Cinzel', serif",
                fontWeight: 700,
                fontSize: 15,
                color: "var(--gold)",
                marginBottom: 12,
              }}
            >
              ⚔ Recent Deeds
            </div>
            <div className="card" style={{ padding: "8px 16px" }}>
              {recentDeeds.map((deed, index) => (
                <div
                  key={deed.title}
                  style={{
                    display: "flex",
                    alignItems: "flex-start",
                    gap: 12,
                    padding: "12px 0",
                    borderBottom: index < recentDeeds.length - 1 ? "1px solid rgba(255,255,255,0.06)" : "none",
                  }}
                >
                  <div style={{ fontSize: 18, lineHeight: 1 }}>{deed.icon}</div>
                  <div style={{ flex: 1 }}>
                    <div style={{ color: "var(--parchment)", fontSize: 13, fontWeight: 700 }}>{deed.title}</div>
                    <div style={{ color: "var(--muted)", fontSize: 11, marginTop: 2 }}>{deed.subtitle}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <button
            className="btn-ghost"
            style={{ width: "100%", color: "var(--danger)", borderColor: "rgba(224,85,85,0.2)" }}
            onClick={() => {
              localStorage.removeItem("sq_token");
              window.location.reload();
            }}
          >
            Logout
          </button>
        </div>
      </div>
    </div>
  );
}
