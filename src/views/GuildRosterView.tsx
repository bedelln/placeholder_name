import React, { useEffect, useRef, useState } from 'react';

import { Avatar, EmptyState, Spinner } from '../components/Common';
import { useAsync } from '../hooks/useAsync';
import { api } from '../services/api';
import { Friendship, Group, GuildTab, User } from '../types';
import { ChallengeComposerModal } from './ChallengeComposerModal';

function ConfirmRemoveModal({
  groupName,
  memberName,
  busy,
  onCancel,
  onConfirm,
}: {
  groupName: string;
  memberName: string;
  busy: boolean;
  onCancel: () => void;
  onConfirm: () => void;
}) {
  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 1000,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 20,
        background: "rgba(6, 5, 12, 0.72)",
        backdropFilter: "blur(6px)",
      }}
    >
      <div
        className="card"
        style={{
          width: "100%",
          maxWidth: 380,
          padding: 20,
          background: "linear-gradient(180deg, rgba(24,22,38,0.98), rgba(13,13,26,0.99))",
          border: "1px solid rgba(240,192,64,0.22)",
          boxShadow: "0 18px 40px rgba(0,0,0,0.4)",
        }}
      >
        <div style={{ fontFamily: "'Cinzel', serif", fontWeight: 700, fontSize: 18, color: "var(--gold)", marginBottom: 8 }}>
          Remove Member
        </div>
        <div style={{ color: "var(--parchment)", fontSize: 14, lineHeight: 1.5, marginBottom: 18 }}>
          Remove <strong>{memberName}</strong> from <strong>{groupName}</strong>? They will no longer appear in this group&apos;s leaderboard.
        </div>
        <div style={{ display: "flex", gap: 10 }}>
          <button className="btn-ghost" style={{ flex: 1, padding: 12 }} onClick={onCancel} disabled={busy}>
            Cancel
          </button>
          <button className="btn-gold" style={{ flex: 1, padding: 12 }} onClick={onConfirm} disabled={busy}>
            {busy ? "REMOVING..." : "Confirm"}
          </button>
        </div>
      </div>
    </div>
  );
}

export function GuildRosterView({
  currentUserId,
  onToast,
  onFriendsChange,
}: {
  currentUserId: string;
  onToast: (msg: string) => void;
  onFriendsChange: (friends: User[]) => void;
}) {
  const [tab, setTab] = useState<GuildTab>("roster");
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<User[]>([]);
  const [searching, setSearching] = useState(false);
  const [composerFriendId, setComposerFriendId] = useState<string | undefined>();
  const [composerOpen, setComposerOpen] = useState(false);
  const [groupName, setGroupName] = useState("");
  const [createMemberIds, setCreateMemberIds] = useState<string[]>([]);
  const [selectedGroupId, setSelectedGroupId] = useState<string | null>(null);
  const [addMemberIds, setAddMemberIds] = useState<string[]>([]);
  const [renameGroupName, setRenameGroupName] = useState("");
  const [groupBusy, setGroupBusy] = useState(false);
  const [pendingRemoval, setPendingRemoval] = useState<{ userId: string; name: string } | null>(null);
  const searchTimeout = useRef<ReturnType<typeof setTimeout>>();

  const rosterState = useAsync(
    async () => {
      const friends = await api.friends.listAccepted();
      onFriendsChange(friends);
      return friends;
    },
    []
  );

  const pendingState = useAsync(
    () => api.friends.listPending(),
    []
  );

  const catState = useAsync(
    () => api.challenges.listCategories(),
    []
  );

  const groupState = useAsync(
    () => api.groups.list(),
    []
  );

  useEffect(() => {
    if (groupState.data.length === 0) {
      setSelectedGroupId(null);
      setRenameGroupName("");
      return;
    }

    if (!selectedGroupId || !groupState.data.some((group) => group.id === selectedGroupId)) {
      setSelectedGroupId(groupState.data[0].id);
    }
  }, [groupState.data, selectedGroupId]);

  const selectedGroup = groupState.data.find((group) => group.id === selectedGroupId) ?? null;

  useEffect(() => {
    setRenameGroupName(selectedGroup?.name ?? "");
    setAddMemberIds([]);
  }, [selectedGroupId, selectedGroup?.name]);

  useEffect(() => {
    if (searchTimeout.current) clearTimeout(searchTimeout.current);
    if (!searchQuery.trim()) {
      setSearchResults([]);
      setSearching(false);
      return;
    }
    setSearching(true);
    searchTimeout.current = setTimeout(async () => {
      try {
        const results = await api.friends.search(searchQuery);
        setSearchResults(results);
      } catch {
        setSearchResults([]);
      }
      setSearching(false);
    }, 400);
  }, [searchQuery]);

  const patchGroupState = (updater: (prev: Group[]) => Group[]) => {
    groupState.setData((prev) => updater(prev));
  };

  const handleSendInvite = async (username: string) => {
    try {
      await api.friends.sendInvite(username);
      onToast("Guild invite dispatched!");
      setSearchQuery("");
      setSearchResults([]);
    } catch (error: any) {
      onToast(error.message ?? "Failed to send guild invite.");
    }
  };

  const handleInviteFromGroup = async (username: string, displayName: string) => {
    try {
      await api.friends.sendInvite(username);
      onToast(`Invite sent to ${displayName}.`);
    } catch (error: any) {
      onToast(error.message ?? "Failed to send guild invite.");
    }
  };

  const handleRespond = async (f: Friendship, status: "accepted" | "declined") => {
    try {
      await api.friends.respond(f.id, status);
    } catch (error: any) {
      onToast(error.message ?? "Failed to update guild invite.");
      return;
    }
    pendingState.setData((prev) => prev.filter((p) => p.id !== f.id));
    if (status === "accepted") {
      rosterState.setData((prev) => {
        if (!f.requester) {
          return prev;
        }
        const next = prev.some((user) => user.id === f.requester!.id)
          ? prev
          : [...prev, f.requester];
        onFriendsChange(next);
        return next;
      });
      onToast(`${f.requester?.displayName} joined your guild!`);
    } else {
      onToast("Invite declined.");
    }
  };

  const toggleMemberSelection = (
    userId: string,
    selectedIds: string[],
    setter: React.Dispatch<React.SetStateAction<string[]>>
  ) => {
    setter(selectedIds.includes(userId)
      ? selectedIds.filter((id) => id !== userId)
      : [...selectedIds, userId]);
  };

  const handleCreateGroup = async () => {
    if (!groupName.trim()) {
      onToast("Group name is required.");
      return;
    }

    setGroupBusy(true);
    try {
      const group = await api.groups.create({ name: groupName.trim(), memberIds: createMemberIds });
      patchGroupState((prev) => [group, ...prev]);
      setSelectedGroupId(group.id);
      setGroupName("");
      setCreateMemberIds([]);
      setTab("groups");
      onToast(`Group "${group.name}" created.`);
    } catch (error: any) {
      onToast(error.message ?? "Failed to create group.");
    } finally {
      setGroupBusy(false);
    }
  };

  const selectedGroupMemberIds = selectedGroup?.members.map((member) => member.userId) ?? [];
  const availableFriendsForSelectedGroup = rosterState.data.filter((friend) => !selectedGroupMemberIds.includes(friend.id));

  const handleAddMembers = async () => {
    if (!selectedGroup) {
      return;
    }

    if (addMemberIds.length === 0) {
      onToast("Choose at least one friend to add.");
      return;
    }

    setGroupBusy(true);
    try {
      const updatedGroup = await api.groups.addMembers(selectedGroup.id, addMemberIds);
      patchGroupState((prev) => prev.map((group) => group.id === updatedGroup.id ? updatedGroup : group));
      setAddMemberIds([]);
      onToast(`Group "${updatedGroup.name}" updated.`);
    } catch (error: any) {
      onToast(error.message ?? "Failed to update group.");
    } finally {
      setGroupBusy(false);
    }
  };

  const handleRenameGroup = async () => {
    if (!selectedGroup) {
      return;
    }

    if (!renameGroupName.trim()) {
      onToast("Group name is required.");
      return;
    }

    setGroupBusy(true);
    try {
      const updatedGroup = await api.groups.rename(selectedGroup.id, renameGroupName.trim());
      patchGroupState((prev) => prev.map((group) => group.id === updatedGroup.id ? updatedGroup : group));
      onToast(`Group renamed to "${updatedGroup.name}".`);
    } catch (error: any) {
      onToast(error.message ?? "Failed to rename group.");
    } finally {
      setGroupBusy(false);
    }
  };

  const handleRemoveMember = async (memberUserId: string, memberName: string) => {
    if (!selectedGroup) {
      return;
    }

    setGroupBusy(true);
    try {
      const updatedGroup = await api.groups.removeMember(selectedGroup.id, memberUserId);

      if (updatedGroup) {
        patchGroupState((prev) => prev.map((group) => group.id === updatedGroup.id ? updatedGroup : group));
      } else {
        patchGroupState((prev) => prev.filter((group) => group.id !== selectedGroup.id));
      }

      onToast(`${memberName} removed from ${selectedGroup.name}.`);
    } catch (error: any) {
      onToast(error.message ?? "Failed to remove member.");
    } finally {
      setGroupBusy(false);
      setPendingRemoval(null);
    }
  };

  const rosterFriends = rosterState.data;
  const friendIds = new Set(rosterFriends.map((friend) => friend.id));
  const pendingCount = pendingState.data.length;
  const groupCount = groupState.data.length;

  return (
    <div style={{ display: "flex", flexDirection: "column", width: "100%", height: "100%" }}>
      <div style={{ padding: "24px 20px 0" }}>
        <h1 style={{ fontFamily: "'Cinzel', serif", fontWeight: 900, fontSize: 26, lineHeight: 1.1, marginBottom: 4 }} className="gold-text">
          Guild Roster
        </h1>
        <p style={{ color: "var(--muted)", fontSize: 13 }}>
          {tab === "groups" ? "Organize your allies into dedicated adventuring circles" : "Your allies and incoming invites"}
        </p>

        {tab !== "groups" && (
          <>
            <div style={{ position: "relative", marginTop: 18 }}>
              <span style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", fontSize: 16, color: "var(--muted)" }}>🔍</span>
              <input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by username..."
                style={{
                  width: "100%", background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.1)",
                  borderRadius: 12, padding: "12px 16px 12px 42px", color: "var(--parchment)", fontSize: 14,
                }}
              />
              {searching && (
                <div style={{ position: "absolute", right: 14, top: "50%", transform: "translateY(-50%)" }}>
                  <Spinner />
                </div>
              )}
            </div>

            {searchResults.length > 0 && (
              <div className="card" style={{ marginTop: 8, padding: "8px 0", zIndex: 10 }}>
                {searchResults.map((u) => (
                  <div key={u.id} style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 16px" }}>
                    <Avatar user={u} size={34} />
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 700, fontSize: 14 }}>{u.displayName}</div>
                      <div style={{ fontSize: 12, color: "var(--muted)" }}>@{u.username}</div>
                    </div>
                    <button
                      className="btn-teal"
                      style={{ padding: "6px 12px", fontSize: 12 }}
                      onClick={() => handleSendInvite(u.username)}
                    >
                      Invite
                    </button>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>

      <div style={{ display: "flex", gap: 24, padding: "20px 20px 0", borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
        {(["roster", "invites", "groups"] as GuildTab[]).map((t) => {
          const active = tab === t;
          const count = t === "invites" ? pendingCount : t === "groups" ? groupCount : rosterFriends.length;
          return (
            <button
              key={t}
              onClick={() => setTab(t)}
              style={{
                paddingBottom: 12, background: "transparent", position: "relative",
                fontFamily: "'Cinzel', serif", fontWeight: 700, fontSize: 13,
                color: active ? "var(--gold)" : "var(--muted)",
                transition: "color 0.2s",
              }}
            >
              {t.toUpperCase()} ({count})
              {active && (
                <div style={{
                  position: "absolute", bottom: -1, left: 0, right: 0, height: 2,
                  background: "var(--gold)", boxShadow: "var(--glow-gold)",
                }} />
              )}
            </button>
          );
        })}
      </div>

      <div style={{ flex: 1, overflowY: "auto", padding: "12px 20px 20px" }}>
        {tab === "roster" && (
          <div style={{ display: "flex", flexDirection: "column" }}>
            {rosterFriends.length > 0 ? (
              rosterFriends.map((u) => (
                <div key={u.id} style={{ display: "flex", alignItems: "center", gap: 14, padding: "14px 0", borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
                  <Avatar user={u} size={44} />
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 700, fontSize: 15 }}>{u.displayName}</div>
                    <div style={{ fontSize: 12, color: "var(--muted)" }}>Lvl {Math.floor(u.xp / 500) + 1} · {u.xp} XP</div>
                  </div>
                  <button
                    className="btn-ghost"
                    style={{ padding: "8px 12px", fontSize: 12 }}
                    onClick={() => {
                      setComposerFriendId(u.id);
                      setComposerOpen(true);
                    }}
                  >
                    ⚔️ Challenge
                  </button>
                </div>
              ))
            ) : (
              <EmptyState icon="👥" message="Your guild is empty. Recruit allies to share the journey!" />
            )}
          </div>
        )}

        {tab === "invites" && (
          <div style={{ display: "flex", flexDirection: "column" }}>
            {pendingState.data.length > 0 ? (
              pendingState.data.map((f) => (
                <div key={f.id} style={{ display: "flex", alignItems: "center", gap: 14, padding: "16px 0", borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
                  <Avatar user={f.requester!} size={44} />
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 700, fontSize: 15 }}>{f.requester?.displayName}</div>
                    <div style={{ fontSize: 12, color: "var(--muted)" }}>wants to join your guild</div>
                  </div>
                  <div style={{ display: "flex", gap: 8 }}>
                    <button className="btn-teal" style={{ padding: "8px 12px", fontSize: 12 }} onClick={() => handleRespond(f, "accepted")}>Join</button>
                    <button className="btn-ghost" style={{ padding: "8px 12px", fontSize: 12 }} onClick={() => handleRespond(f, "declined")}>✕</button>
                  </div>
                </div>
              ))
            ) : (
              <EmptyState icon="📜" message="No pending invitations at the moment." />
            )}
          </div>
        )}

        {tab === "groups" && (
          <div style={{ display: "grid", gap: 16 }}>
            <div className="card" style={{ padding: 16 }}>
              <div style={{ fontFamily: "'Cinzel', serif", fontWeight: 700, fontSize: 15, marginBottom: 12 }}>Create a Group</div>
              <input
                value={groupName}
                onChange={(e) => setGroupName(e.target.value)}
                placeholder="Weekend Raiders"
                style={{
                  width: "100%", background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.1)",
                  borderRadius: 12, padding: "12px 16px", color: "var(--parchment)", fontSize: 14, marginBottom: 12,
                }}
              />
              <div style={{ color: "var(--muted)", fontSize: 12, marginBottom: 10 }}>
                Select friends to include now. You will be added automatically.
              </div>
              <div style={{ display: "grid", gap: 8, marginBottom: 14 }}>
                {rosterFriends.length > 0 ? rosterFriends.map((friend) => {
                  const selected = createMemberIds.includes(friend.id);
                  return (
                    <button
                      key={friend.id}
                      onClick={() => toggleMemberSelection(friend.id, createMemberIds, setCreateMemberIds)}
                      style={{
                        display: "flex", alignItems: "center", gap: 12, padding: "10px 12px",
                        borderRadius: 12, border: selected ? "1px solid rgba(45,224,176,0.55)" : "1px solid rgba(255,255,255,0.08)",
                        background: selected ? "rgba(45,224,176,0.12)" : "rgba(255,255,255,0.03)", color: "var(--parchment)",
                      }}
                    >
                      <Avatar user={friend} size={36} />
                      <div style={{ flex: 1, textAlign: "left" }}>
                        <div style={{ fontWeight: 700, fontSize: 14 }}>{friend.displayName}</div>
                        <div style={{ fontSize: 12, color: "var(--muted)" }}>@{friend.username}</div>
                      </div>
                      <div style={{ fontSize: 12, color: selected ? "var(--teal)" : "var(--muted)" }}>
                        {selected ? "Selected" : "Add"}
                      </div>
                    </button>
                  );
                }) : (
                  <EmptyState icon="🛡️" message="Add friends to your guild before creating a group." />
                )}
              </div>
              <button className="btn-gold" style={{ width: "100%", padding: 14 }} onClick={handleCreateGroup} disabled={groupBusy}>
                {groupBusy ? "FORGING GROUP..." : "CREATE GROUP"}
              </button>
            </div>

            <div className="card" style={{ padding: 16 }}>
              <div style={{ fontFamily: "'Cinzel', serif", fontWeight: 700, fontSize: 15, marginBottom: 12 }}>Your Groups</div>
              {groupState.loading ? (
                <Spinner />
              ) : groupState.data.length > 0 ? (
                <div style={{ display: "grid", gap: 10 }}>
                  {groupState.data.map((group) => {
                    const active = group.id === selectedGroupId;
                    return (
                      <button
                        key={group.id}
                        onClick={() => setSelectedGroupId(group.id)}
                        style={{
                          display: "flex", justifyContent: "space-between", alignItems: "center",
                          padding: "12px 14px", borderRadius: 12,
                          border: active ? "1px solid rgba(240,192,64,0.45)" : "1px solid rgba(255,255,255,0.08)",
                          background: active ? "rgba(240,192,64,0.08)" : "rgba(255,255,255,0.03)",
                          color: "var(--parchment)",
                        }}
                      >
                        <div style={{ textAlign: "left" }}>
                          <div style={{ fontFamily: "'Cinzel', serif", fontWeight: 700, fontSize: 14 }}>{group.name}</div>
                          <div style={{ fontSize: 12, color: "var(--muted)" }}>{group.members.length} members</div>
                        </div>
                        <div style={{ fontSize: 12, color: active ? "var(--gold)" : "var(--muted)" }}>
                          {active ? "Viewing" : "Open"}
                        </div>
                      </button>
                    );
                  })}
                </div>
              ) : (
                <EmptyState icon="🏰" message="No groups yet. Create one to split your friends into separate circles." />
              )}
            </div>

            {selectedGroup && (
              <div className="card" style={{ padding: 16 }}>
                <div style={{ display: "grid", gap: 12, marginBottom: 16 }}>
                  <div>
                    <div style={{ fontFamily: "'Cinzel', serif", fontWeight: 700, fontSize: 18 }}>{selectedGroup.name}</div>
                    <div style={{ color: "var(--muted)", fontSize: 12 }}>{selectedGroup.members.length} members in this group</div>
                  </div>
                  <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
                    <input
                      value={renameGroupName}
                      onChange={(e) => setRenameGroupName(e.target.value)}
                      placeholder="Rename this group"
                      style={{
                        flex: 1, background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.1)",
                        borderRadius: 12, padding: "12px 16px", color: "var(--parchment)", fontSize: 14,
                      }}
                    />
                    <button className="btn-gold" style={{ padding: "12px 14px", whiteSpace: "nowrap" }} onClick={handleRenameGroup} disabled={groupBusy}>
                      Rename
                    </button>
                  </div>
                </div>

                <div style={{ display: "grid", gap: 10, marginBottom: 18 }}>
                  {selectedGroup.members.map((member) => (
                    <div key={member.id} style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 12px", borderRadius: 12, background: "rgba(255,255,255,0.03)" }}>
                      <Avatar user={member.user} size={38} />
                      <div style={{ flex: 1 }}>
                        <div style={{ fontWeight: 700, fontSize: 14 }}>{member.user.displayName}</div>
                        <div style={{ fontSize: 12, color: "var(--muted)" }}>@{member.user.username}</div>
                      </div>
                      <div style={{ fontSize: 12, color: "var(--gold)", marginRight: 8 }}>{member.user.xp} XP</div>
                      {member.userId !== currentUserId && !friendIds.has(member.userId) && (
                        <button
                          className="btn-teal"
                          style={{ padding: "8px 10px", fontSize: 12 }}
                          onClick={() => handleInviteFromGroup(member.user.username, member.user.displayName)}
                          disabled={groupBusy}
                        >
                          Invite
                        </button>
                      )}
                      <button
                        className="btn-ghost"
                        style={{ padding: "8px 10px", fontSize: 12 }}
                        onClick={() => setPendingRemoval({ userId: member.userId, name: member.user.displayName })}
                        disabled={groupBusy}
                      >
                        Remove
                      </button>
                    </div>
                  ))}
                </div>

                <div style={{ fontFamily: "'Cinzel', serif", fontWeight: 700, fontSize: 14, marginBottom: 10 }}>Add Friends to This Group</div>
                {availableFriendsForSelectedGroup.length > 0 ? (
                  <>
                    <div style={{ display: "grid", gap: 8, marginBottom: 14 }}>
                      {availableFriendsForSelectedGroup.map((friend) => {
                        const selected = addMemberIds.includes(friend.id);
                        return (
                          <button
                            key={friend.id}
                            onClick={() => toggleMemberSelection(friend.id, addMemberIds, setAddMemberIds)}
                            style={{
                              display: "flex", alignItems: "center", gap: 12, padding: "10px 12px",
                              borderRadius: 12, border: selected ? "1px solid rgba(45,224,176,0.55)" : "1px solid rgba(255,255,255,0.08)",
                              background: selected ? "rgba(45,224,176,0.12)" : "rgba(255,255,255,0.03)", color: "var(--parchment)",
                            }}
                          >
                            <Avatar user={friend} size={36} />
                            <div style={{ flex: 1, textAlign: "left" }}>
                              <div style={{ fontWeight: 700, fontSize: 14 }}>{friend.displayName}</div>
                              <div style={{ fontSize: 12, color: "var(--muted)" }}>@{friend.username}</div>
                            </div>
                            <div style={{ fontSize: 12, color: selected ? "var(--teal)" : "var(--muted)" }}>
                              {selected ? "Selected" : "Add"}
                            </div>
                          </button>
                        );
                      })}
                    </div>
                    <button className="btn-teal" style={{ width: "100%", padding: 12 }} onClick={handleAddMembers} disabled={groupBusy}>
                      {groupBusy ? "ADDING FRIENDS..." : "ADD SELECTED FRIENDS"}
                    </button>
                  </>
                ) : (
                  <EmptyState icon="✨" message="Everyone from your current friends list is already in this group." />
                )}
              </div>
            )}
          </div>
        )}
      </div>

      {composerOpen && (
        <ChallengeComposerModal
          friends={rosterFriends}
          categories={catState.data}
          preselectedFriendId={composerFriendId}
          onClose={() => setComposerOpen(false)}
          onSent={() => {
            setComposerOpen(false);
            onToast("Challenge dispatched!");
          }}
        />
      )}

      {selectedGroup && pendingRemoval && (
        <ConfirmRemoveModal
          groupName={selectedGroup.name}
          memberName={pendingRemoval.name}
          busy={groupBusy}
          onCancel={() => setPendingRemoval(null)}
          onConfirm={() => handleRemoveMember(pendingRemoval.userId, pendingRemoval.name)}
        />
      )}
    </div>
  );
}
