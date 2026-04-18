import React, { useState, useEffect, useCallback, useRef } from "react";
import { User, Tab } from "./src/types";
import { api } from "./src/services/api";
import { GlobalStyles } from "./src/styles/GlobalStyles";
import { Spinner } from "./src/components/Common";
import { Toast, XpFloat } from "./src/components/Feedback";
import { BottomNav } from "./src/components/BottomNav";
import { AuthView } from "./src/views/AuthView";
import { QuestBoardView } from "./src/views/QuestBoardView";
import { GuildRosterView } from "./src/views/GuildRosterView";
import { HallOfFameView } from "./src/views/HallOfFameView";
import { ProfileView } from "./src/views/ProfileView";

/**
 * Main application entry point for Sidequesting.
 * Handles high-level state management, authentication routing, and notifications.
 */
export default function App() {
  const [isReady, setIsReady] = useState(false);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [tab, setTab] = useState<Tab>("quests");
  const [friends, setFriends] = useState<User[]>([]);
  const [toast, setToast] = useState<string | null>(null);
  const [xpFloats, setXpFloats] = useState<{ id: number; xp: number; x: number; y: number }[]>([]);
  const floatId = useRef(0);

  const [inboxCount, setInboxCount] = useState(0);
  const [pendingCount, setPendingCount] = useState(0);

  // Poll for notifications (new quests and friend requests) every 15 seconds.
  useEffect(() => {
    if (!currentUser) return;
    const fetchCounts = async () => {
      try {
        const [inbox, pending] = await Promise.all([
          api.challenges.inbox(),
          api.friends.listPending()
        ]);
        setInboxCount(inbox.filter(q => q.recipientStatus === "pending").length);
        setPendingCount(pending.length);
      } catch (e) { /* ignore silently */ }
    };
    fetchCounts();
    const interval = setInterval(fetchCounts, 15000);
    return () => clearInterval(interval);
  }, [currentUser]);

  useEffect(() => {
    if (!currentUser) {
      setFriends([]);
      return;
    }

    api.friends.listAccepted().then(setFriends).catch(() => {});
  }, [currentUser]);

  // Check for existing authentication token on initial load.
  useEffect(() => {
    const token = localStorage.getItem("sq_token");
    if (token) {
      api.challenges.me().then(user => {
        setCurrentUser(user);
        setIsReady(true);
      }).catch(() => {
        // If token is invalid or expired, clear it.
        localStorage.removeItem("sq_token");
        setIsReady(true);
      });
    } else {
      setIsReady(true);
    }
  }, []);

  const handleAuthSuccess = (user: User) => {
    setCurrentUser(user);
  };

  const showToast = useCallback((msg: string) => {
    setToast(msg);
  }, []);

  const handleXpGain = useCallback((xp: number, x: number, y: number) => {
    const id = floatId.current++;
    setXpFloats((prev) => [...prev, { id, xp, x, y }]);
    // Optionally refresh user XP from backend
    api.challenges.me().then(setCurrentUser).catch(() => {});
  }, []);

  const removeFloat = useCallback((id: number) => {
    setXpFloats((prev) => prev.filter((f) => f.id !== id));
  }, []);

  const appShellStyle: React.CSSProperties = {
    position: "relative",
    zIndex: 1,
    display: "flex",
    flexDirection: "column",
    height: "100svh",
    width: "100%",
    maxWidth: 600,
    margin: "0 auto",
    overflow: "hidden",
  };

  if (!isReady) return <div style={{ height: "100%", display: "flex", alignItems: "center" }}><Spinner /></div>;

  if (!currentUser) return (
    <>
      <GlobalStyles />
      <div style={appShellStyle}>
        <AuthView onAuthSuccess={handleAuthSuccess} />
      </div>
      {toast && <Toast message={toast} onDone={() => setToast(null)} />}
    </>
  );

  return (
    <>
      <GlobalStyles />

      {/* Background ambient glow */}
      <div style={{
        position: "fixed", inset: 0, pointerEvents: "none", zIndex: 0,
        background: `
          radial-gradient(ellipse 60% 40% at 20% 10%, rgba(240,192,64,0.04) 0%, transparent 70%),
          radial-gradient(ellipse 50% 50% at 80% 90%, rgba(45,224,176,0.04) 0%, transparent 70%)
        `,
      }} />

      <div style={appShellStyle}>
        {/* Views */}
        <div style={{ flex: 1, overflow: "hidden", position: "relative" }}>
          {tab === "quests" && (
            <QuestBoardView
              currentUser={currentUser}
              friends={friends}
              onXpGain={handleXpGain}
              onToast={showToast}
            />
          )}
          {tab === "guild" && (
            <GuildRosterView
              currentUserId={currentUser.id}
              onToast={showToast}
              onFriendsChange={setFriends}
            />
          )}
          {tab === "fame" && (
            <HallOfFameView currentUserId={currentUser.id} />
          )}
          {tab === "profile" && (
            <ProfileView currentUser={currentUser} />
          )}
        </div>

        <BottomNav
          tab={tab}
          setTab={setTab}
          inboxCount={inboxCount}
          pendingCount={pendingCount}
        />
      </div>

      {/* Toast */}
      {toast && <Toast message={toast} onDone={() => setToast(null)} />}

      {/* XP Floats */}
      {xpFloats.map((f) => (
        <XpFloat key={f.id} xp={f.xp} x={f.x} y={f.y} onDone={() => removeFloat(f.id)} />
      ))}
    </>
  );
}
