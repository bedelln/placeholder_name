import React, { useEffect, useState } from 'react';
import { api } from '../services/api';
import { User } from '../types';

interface AdminUserDetailProps {
  userId: string;
  onBack: () => void;
  onUserDeleted: (userId: string) => void;
}

type ChallengeTab = 'sent' | 'received';

export function AdminUserDetail({ userId, onBack, onUserDeleted }: AdminUserDetailProps) {
  const [user, setUser] = useState<User | null>(null);
  const [sentChallenges, setSentChallenges] = useState<any[]>([]);
  const [receivedChallenges, setReceivedChallenges] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<ChallengeTab>('sent');
  const [editingXp, setEditingXp] = useState(false);
  const [newXp, setNewXp] = useState('');
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    fetchUserDetail();
  }, [userId]);

  const fetchUserDetail = async () => {
    try {
      setLoading(true);
      setError(null);
      const result = await api.admin.getUserDetail(userId);
      setUser(result.user);
      setSentChallenges(result.sentChallenges);
      setReceivedChallenges(result.receivedChallenges);
      setNewXp(result.user.xp.toString());
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateXp = async () => {
    try {
      const xp = parseInt(newXp);
      if (isNaN(xp) || xp < 0) {
        setError('XP must be a non-negative number');
        return;
      }
      const updated = await api.admin.updateUserXp(userId, xp);
      setUser(updated);
      setEditingXp(false);
      setError(null);
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleDeleteUser = async () => {
    if (!window.confirm(`Delete user ${user?.displayName}? This cannot be undone.`)) return;
    try {
      setDeleting(true);
      await api.admin.deleteUser(userId);
      onUserDeleted(userId);
      onBack();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setDeleting(false);
    }
  };

  const handleDeleteChallenge = async (challengeId: string) => {
    if (!window.confirm('Delete this challenge?')) return;
    try {
      await api.admin.deleteChallenge(challengeId);
      setSentChallenges(sentChallenges.filter(c => c.id !== challengeId));
      setReceivedChallenges(receivedChallenges.filter(c => c.challenge.id !== challengeId));
    } catch (err: any) {
      setError(err.message);
    }
  };

  if (loading) return <div style={{ padding: 16, color: 'var(--muted)' }}>Loading...</div>;

  if (!user) return <div style={{ padding: 16, color: 'var(--danger)' }}>User not found</div>;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', padding: 16, gap: 16, overflow: 'auto' }}>
      <button
        onClick={onBack}
        style={{
          alignSelf: 'flex-start',
          background: 'transparent',
          color: 'var(--teal)',
          border: 'none',
          cursor: 'pointer',
          fontSize: 14,
          fontWeight: 700,
        }}
      >
        ← Back
      </button>

      {/* User Info */}
      <div style={{ background: 'rgba(255,255,255,0.05)', padding: 16, borderRadius: 8 }}>
        <div style={{ display: 'flex', gap: 16, marginBottom: 16 }}>
          <div
            style={{
              width: 60,
              height: 60,
              borderRadius: '50%',
              background: `linear-gradient(135deg, var(--gold), var(--teal))`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 28,
              fontWeight: 700,
              color: '#000',
            }}
          >
            {user.displayName.charAt(0).toUpperCase()}
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ color: 'var(--parchment)', fontSize: 18, fontWeight: 700 }}>{user.displayName}</div>
            <div style={{ color: 'var(--muted)', fontSize: 12 }}>@{user.username}</div>
            <div style={{ color: 'var(--muted)', fontSize: 12, marginTop: 4 }}>
              Role: <span style={{ color: 'var(--gold)' }}>{user.role}</span>
            </div>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 16 }}>
          <div>
            <div style={{ color: 'var(--muted)', fontSize: 12 }}>Total XP</div>
            <div style={{ color: 'var(--gold)', fontWeight: 700, fontSize: 18 }}>{user.xp}</div>
          </div>
          <div>
            <div style={{ color: 'var(--muted)', fontSize: 12 }}>Joined</div>
            <div style={{ color: 'var(--parchment)', fontSize: 12 }}>{new Date(user.createdAt).toLocaleDateString()}</div>
          </div>
        </div>

        {/* XP Editor */}
        <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
          {!editingXp ? (
            <button
              onClick={() => setEditingXp(true)}
              style={{
                flex: 1,
                padding: '10px 12px',
                background: 'rgba(240,192,64,0.2)',
                color: 'var(--gold)',
                border: '1px solid rgba(240,192,64,0.3)',
                borderRadius: 6,
                cursor: 'pointer',
                fontSize: 12,
                fontWeight: 700,
              }}
            >
              EDIT XP
            </button>
          ) : (
            <>
              <input
                type="number"
                value={newXp}
                onChange={(e) => setNewXp(e.target.value)}
                style={{
                  flex: 1,
                  padding: '10px 12px',
                  background: 'rgba(255,255,255,0.04)',
                  border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: 6,
                  color: 'var(--parchment)',
                  fontSize: 12,
                }}
              />
              <button
                onClick={handleUpdateXp}
                style={{
                  padding: '10px 12px',
                  background: 'rgba(46,204,113,0.2)',
                  color: 'var(--teal)',
                  border: '1px solid rgba(46,204,113,0.3)',
                  borderRadius: 6,
                  cursor: 'pointer',
                  fontSize: 12,
                  fontWeight: 700,
                }}
              >
                Save
              </button>
              <button
                onClick={() => setEditingXp(false)}
                style={{
                  padding: '10px 12px',
                  background: 'transparent',
                  color: 'var(--muted)',
                  border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: 6,
                  cursor: 'pointer',
                  fontSize: 12,
                }}
              >
                Cancel
              </button>
            </>
          )}
        </div>

        <button
          onClick={handleDeleteUser}
          disabled={deleting}
          style={{
            width: '100%',
            padding: '10px 12px',
            background: 'rgba(231,76,60,0.2)',
            color: 'var(--danger)',
            border: '1px solid rgba(231,76,60,0.3)',
            borderRadius: 6,
            cursor: 'pointer',
            fontSize: 12,
            fontWeight: 700,
          }}
        >
          {deleting ? 'DELETING...' : 'DELETE ACCOUNT'}
        </button>
      </div>

      {error && <div style={{ color: 'var(--danger)', fontSize: 12 }}>{error}</div>}

      {/* Challenges */}
      <div>
        <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
          <button
            onClick={() => setActiveTab('sent')}
            style={{
              flex: 1,
              padding: '10px',
              background: activeTab === 'sent' ? 'rgba(240,192,64,0.2)' : 'transparent',
              color: activeTab === 'sent' ? 'var(--gold)' : 'var(--muted)',
              border: '1px solid ' + (activeTab === 'sent' ? 'rgba(240,192,64,0.3)' : 'rgba(255,255,255,0.1)'),
              borderRadius: 6,
              cursor: 'pointer',
              fontSize: 12,
              fontWeight: 700,
            }}
          >
            SENT ({sentChallenges.length})
          </button>
          <button
            onClick={() => setActiveTab('received')}
            style={{
              flex: 1,
              padding: '10px',
              background: activeTab === 'received' ? 'rgba(240,192,64,0.2)' : 'transparent',
              color: activeTab === 'received' ? 'var(--gold)' : 'var(--muted)',
              border: '1px solid ' + (activeTab === 'received' ? 'rgba(240,192,64,0.3)' : 'rgba(255,255,255,0.1)'),
              borderRadius: 6,
              cursor: 'pointer',
              fontSize: 12,
              fontWeight: 700,
            }}
          >
            RECEIVED ({receivedChallenges.length})
          </button>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {activeTab === 'sent' && sentChallenges.map(challenge => (
            <div
              key={challenge.id}
              style={{
                padding: 12,
                background: 'rgba(255,255,255,0.03)',
                border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: 6,
                fontSize: 12,
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                <div style={{ color: 'var(--parchment)', fontWeight: 700 }}>{challenge.title}</div>
                <button
                  onClick={() => handleDeleteChallenge(challenge.id)}
                  style={{
                    background: 'transparent',
                    color: 'var(--danger)',
                    border: 'none',
                    cursor: 'pointer',
                    fontSize: 12,
                  }}
                >
                  Delete
                </button>
              </div>
              <div style={{ color: 'var(--muted)', fontSize: 11 }}>{challenge.description}</div>
              <div style={{ color: 'var(--gold)', marginTop: 6 }}>{challenge.xpReward} XP · {challenge.recipients.length} recipient{challenge.recipients.length !== 1 ? 's' : ''}</div>
            </div>
          ))}

          {activeTab === 'received' && receivedChallenges.map(cr => (
            <div
              key={cr.challenge.id}
              style={{
                padding: 12,
                background: 'rgba(255,255,255,0.03)',
                border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: 6,
                fontSize: 12,
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                <div style={{ color: 'var(--parchment)', fontWeight: 700 }}>{cr.challenge.title}</div>
                <button
                  onClick={() => handleDeleteChallenge(cr.challenge.id)}
                  style={{
                    background: 'transparent',
                    color: 'var(--danger)',
                    border: 'none',
                    cursor: 'pointer',
                    fontSize: 12,
                  }}
                >
                  Delete
                </button>
              </div>
              <div style={{ color: 'var(--muted)', fontSize: 11 }}>From: {cr.challenge.sender?.displayName}</div>
              <div style={{ color: 'var(--gold)', marginTop: 6 }}>{cr.challenge.xpReward} XP · Status: {cr.status}</div>
            </div>
          ))}

          {(activeTab === 'sent' && sentChallenges.length === 0) && (
            <div style={{ color: 'var(--muted)', fontSize: 12, textAlign: 'center', padding: 16 }}>
              No sent challenges
            </div>
          )}
          {(activeTab === 'received' && receivedChallenges.length === 0) && (
            <div style={{ color: 'var(--muted)', fontSize: 12, textAlign: 'center', padding: 16 }}>
              No received challenges
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
