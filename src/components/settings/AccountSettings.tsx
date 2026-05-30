'use client';
import { useState } from 'react';
import { Eye, EyeOff, Wifi, WifiOff, Loader2, CheckCircle, XCircle, RotateCcw } from 'lucide-react';
import { useCliConfigStore } from '@/store/cli-config';
import styles from './AccountSettings.module.css';

export default function AccountSettings() {
  const { config, isTesting, testResult, updateConfig, testConnection, resetConfig } = useCliConfigStore();
  const [showToken, setShowToken] = useState(false);

  const statusIcon = () => {
    switch (config.connectionStatus) {
      case 'connected': return <Wifi className={styles.statusIcon} style={{ color: 'var(--color-success)' }} size={16} />;
      case 'disconnected': return <WifiOff className={styles.statusIcon} style={{ color: 'var(--color-error)' }} size={16} />;
      default: return <Wifi className={styles.statusIcon} style={{ color: 'var(--color-muted)' }} size={16} />;
    }
  };

  return (
    <div className={styles.container}>
      <h2 className={styles.title}>Account & CLI Config</h2>
      
      <div className={styles.statusBadge}>
        {statusIcon()}
        <span>{config.connectionStatus.charAt(0).toUpperCase() + config.connectionStatus.slice(1)}</span>
      </div>

      <div className={styles.form}>
        <div className={styles.field}>
          <label htmlFor="wsUrl">WebSocket URL</label>
          <input
            id="wsUrl"
            type="url"
            className={styles.input}
            value={config.wsUrl}
            onChange={(e) => updateConfig({ wsUrl: e.target.value })}
            placeholder="ws://localhost:8080"
          />
        </div>

        <div className={styles.field}>
          <label htmlFor="apiEndpoint">API Endpoint</label>
          <input
            id="apiEndpoint"
            type="url"
            className={styles.input}
            value={config.apiEndpoint}
            onChange={(e) => updateConfig({ apiEndpoint: e.target.value })}
            placeholder="http://localhost:8080"
          />
        </div>

        <div className={styles.field}>
          <label htmlFor="apiToken">API Token</label>
          <div className={styles.tokenWrapper}>
            <input
              id="apiToken"
              type={showToken ? 'text' : 'password'}
              className={styles.input}
              value={config.apiToken}
              onChange={(e) => updateConfig({ apiToken: e.target.value })}
              placeholder="Enter your API token"
            />
            <button type="button" className={styles.toggleButton} onClick={() => setShowToken(!showToken)} aria-label={showToken ? 'Hide token' : 'Show token'}>
              {showToken ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
        </div>

        <div className={styles.actions}>
          <button
            className={`${styles.button} ${styles.testButton}`}
            onClick={testConnection}
            disabled={isTesting}
          >
            {isTesting ? <Loader2 className={styles.spinner} size={16} /> : <Wifi size={16} />}
            {isTesting ? 'Testing...' : 'Test Connection'}
          </button>
          <button className={`${styles.button} ${styles.resetButton}`} onClick={resetConfig}>
            <RotateCcw size={16} /> Reset
          </button>
        </div>

        {testResult && (
          <div className={`${styles.testResult} ${testResult.includes('successful') ? styles.success : styles.error}`}>
            {testResult.includes('successful') ? <CheckCircle size={16} /> : <XCircle size={16} />}
            {testResult}
          </div>
        )}
      </div>
    </div>
  );
}
