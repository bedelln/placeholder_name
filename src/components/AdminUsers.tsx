import React, { useEffect, useState } from 'react';
import { api } from '../services/api';
import { User } from '../types';
import { AdminUserDetail } from './AdminUserDetail';

export function AdminUsers() {
  const [users, setUsers] = useState<User[]>([]);
  const [total, setTotal] = useState(0);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const delaySearch = setTimeout(() => {
      fetchUsers();
    }, 300);
    return () => clearTimeout(delaySearch);
  }, [search]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      setError(null);
      const result = await api.admin.listUsers(20, 0, search || undefined);
      setUsers(result.users);
      setTotal(result.total);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleUserDelete = (userId: string) => {
    setUsers(users.filter(u => u.id !== userId));
    setTotal(total - 1);
  };

  if (selectedUserId) {
    return <AdminUserDetail userId={selectedUserId} onBack={() => setSelectedUserId(null)} onUserDeleted={handleUserDelete} />;
  }

  return (
    <div style={{ padding: 16, display: 'flex', flexDirection: 'column', gap: 16, height: '100%' }}>
      <div>
        <input
          type="text"
          placeholder="Search users..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{
            width: '100%',
            padding: '12px 16px',
            background: 'rgba(255,255,255,0.04)',
            border: '1px solid rgba(255,255,255,0.1)',
            borderRadius: 8,
            color: 'var(--parchment)',
            fontSize: 14,
          }}
        />
      </div>

      {error && <div style={{ color: 'var(--danger)', fontSize: 13 }}>{error}</div>}

      <div style={{ fontSize: 12, color: 'var(--muted)' }}>
        Found {total} user{total !== 1 ? 's' : ''}
      </div>

      {loading && <div style={{ color: 'var(--muted)' }}>Loading...</div>}

      <div style={{ flex: 1, overflow: 'auto' }}>
        {users.map(user => (
          <div
            key={user.id}
            onClick={() => setSelectedUserId(user.id)}
            style={{
              padding: 12,
              marginBottom: 8,
              background: 'rgba(255,255,255,0.05)',
              border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: 8,
              cursor: 'pointer',
              transition: 'all 0.2s',
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.08)';
              (e.currentTarget as HTMLElement).style.borderColor = 'rgba(240,192,64,0.3)';
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.05)';
              (e.currentTarget as HTMLElement).style.borderColor = 'rgba(255,255,255,0.1)';
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: '50%',
                  background: `linear-gradient(135deg, var(--gold), var(--teal))`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 18,
                  fontWeight: 700,
                  color: '#000',
                }}
              >
                {user.displayName.charAt(0).toUpperCase()}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ color: 'var(--parchment)', fontWeight: 700 }}>{user.displayName}</div>
                <div style={{ color: 'var(--muted)', fontSize: 12 }}>@{user.username}</div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ color: 'var(--gold)', fontWeight: 700 }}>{user.xp} XP</div>
                <div style={{ color: 'var(--muted)', fontSize: 12 }}>{user.role}</div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
