import React from 'react';
import { User } from '../types';

export function AdminProfile({ currentUser }: { currentUser: User }) {
  const handleLogout = () => {
    localStorage.removeItem("sq_token");
    window.location.reload();
  };

  const level = Math.floor(currentUser.xp / 500) + 1;
  const xpInLevel = currentUser.xp % 500;
  const xpToNextLevel = 500 - xpInLevel;

  return (
    <div style={{ padding: 16, display: 'flex', flexDirection: 'column', gap: 24, overflow: 'auto', height: '100%' }}>
      {/* Profile Header */}
      <div style={{
        background: `linear-gradient(135deg, rgba(240,192,64,0.1), rgba(45,224,176,0.1))`,
        padding: 24,
        borderRadius: 12,
        textAlign: 'center'
      }}>
        <div
          style={{
            width: 80,
            height: 80,
            borderRadius: '50%',
            background: `linear-gradient(135deg, var(--gold), var(--teal))`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 40,
            fontWeight: 700,
            color: '#000',
            margin: '0 auto 16px',
            position: 'relative'
          }}
        >
          {currentUser.displayName.charAt(0).toUpperCase()}
          <div style={{
            position: 'absolute',
            bottom: 0,
            right: 0,
            background: 'var(--gold)',
            borderRadius: '50%',
            width: 28,
            height: 28,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 14,
            fontWeight: 700,
            color: '#000'
          }}>
            {level}
          </div>
        </div>
        <div style={{ color: 'var(--parchment)', fontSize: 20, fontWeight: 700, marginBottom: 4 }}>
          {currentUser.displayName}
        </div>
        <div style={{ color: 'var(--muted)', fontSize: 12 }}>@{currentUser.username}</div>
        <div style={{ color: 'var(--gold)', fontSize: 12, marginTop: 8, fontWeight: 700 }}>
          ADMIN
        </div>
      </div>

      {/* XP Progress */}
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
          <div style={{ color: 'var(--muted)', fontSize: 12 }}>Level {level}</div>
          <div style={{ color: 'var(--muted)', fontSize: 12 }}>{xpInLevel} / 500</div>
        </div>
        <div style={{
          width: '100%',
          height: 8,
          background: 'rgba(0,0,0,0.3)',
          borderRadius: 4,
          overflow: 'hidden'
        }}>
          <div style={{
            width: `${(xpInLevel / 500) * 100}%`,
            height: '100%',
            background: `linear-gradient(90deg, var(--gold), var(--teal))`,
            transition: 'width 0.3s'
          }} />
        </div>
        <div style={{ color: 'var(--muted)', fontSize: 11, marginTop: 8 }}>
          {xpToNextLevel} XP to next level
        </div>
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12 }}>
        <div style={{ background: 'rgba(255,255,255,0.05)', padding: 12, borderRadius: 8, textAlign: 'center' }}>
          <div style={{ color: 'var(--muted)', fontSize: 11 }}>Level</div>
          <div style={{ color: 'var(--gold)', fontWeight: 700, fontSize: 18 }}>{level}</div>
        </div>
        <div style={{ background: 'rgba(255,255,255,0.05)', padding: 12, borderRadius: 8, textAlign: 'center' }}>
          <div style={{ color: 'var(--muted)', fontSize: 11 }}>Total XP</div>
          <div style={{ color: 'var(--teal)', fontWeight: 700, fontSize: 18 }}>{currentUser.xp}</div>
        </div>
        <div style={{ background: 'rgba(255,255,255,0.05)', padding: 12, borderRadius: 8, textAlign: 'center' }}>
          <div style={{ color: 'var(--muted)', fontSize: 11 }}>XP This Level</div>
          <div style={{ color: 'var(--parchment)', fontWeight: 700, fontSize: 18 }}>{xpInLevel}</div>
        </div>
      </div>

      {/* Account Info */}
      <div style={{ background: 'rgba(255,255,255,0.03)', padding: 12, borderRadius: 8 }}>
        <div style={{ color: 'var(--muted)', fontSize: 12, marginBottom: 12 }}>Account Information</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8, fontSize: 12 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span style={{ color: 'var(--muted)' }}>Email:</span>
            <span style={{ color: 'var(--parchment)' }}>admin@account</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span style={{ color: 'var(--muted)' }}>Role:</span>
            <span style={{ color: 'var(--gold)' }}>ADMIN</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span style={{ color: 'var(--muted)' }}>Joined:</span>
            <span style={{ color: 'var(--parchment)' }}>{new Date(currentUser.createdAt).toLocaleDateString()}</span>
          </div>
        </div>
      </div>

      {/* Logout Button */}
      <button
        onClick={handleLogout}
        style={{
          width: '100%',
          padding: 14,
          background: 'rgba(231,76,60,0.15)',
          color: 'var(--danger)',
          border: '1px solid rgba(231,76,60,0.3)',
          borderRadius: 8,
          cursor: 'pointer',
          fontSize: 14,
          fontWeight: 700,
          marginTop: 'auto'
        }}
      >
        LOGOUT
      </button>
    </div>
  );
}
