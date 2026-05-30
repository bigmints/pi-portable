'use client';

import { User, Clock, LogOut } from 'lucide-react';
import styles from './AccountSection.module.css';

export default function AccountSection() {
  const handleExtend = () => { alert('Session extended'); };
  const handleLogout = async () => {
    await fetch('/api/session', { method: 'DELETE' });
    window.location.href = '/login';
  };

  return (
    <div className={styles.section}>
      <div className={styles.card}>
        <div className={styles.avatar}><User size={32} /></div>
        <div className={styles.info}>
          <h3 className={styles.name}>Pi User</h3>
          <p className={styles.email}>session@pi.local</p>
        </div>
      </div>
      <div className={styles.card}>
        <div className={styles.row}>
          <div className={styles.label}><Clock size={16} /><span>Session</span></div>
          <span className={styles.value}>Active</span>
        </div>
        <div className={styles.row}>
          <div className={styles.label}><Clock size={16} /><span>Expires</span></div>
          <span className={styles.value}>24h remaining</span>
        </div>
      </div>
      <div className={styles.actions}>
        <button className={styles.btn} onClick={handleExtend}><Clock size={16} /> Extend Session</button>
        <button className={styles.btn + ' ' + styles.danger} onClick={handleLogout}><LogOut size={16} /> Logout</button>
      </div>
    </div>
  );
}
