import React from 'react';
import { AdminUsers } from '../components/AdminUsers';

export function AdminView() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', width: '100%' }}>
      <AdminUsers />
    </div>
  );
}
