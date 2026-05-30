import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface CliConfig {
  wsUrl: string;
  apiEndpoint: string;
  apiToken: string;
  connectionStatus: 'connected' | 'disconnected' | 'unknown';
}

const DEFAULT_CONFIG: CliConfig = {
  wsUrl: process.env.NEXT_PUBLIC_PI_WS_URL || 'ws://localhost:8080',
  apiEndpoint: process.env.NEXT_PUBLIC_PI_API_URL || 'http://localhost:8080',
  apiToken: '',
  connectionStatus: 'unknown',
};

interface CliConfigState {
  config: CliConfig;
  isTesting: boolean;
  testResult: string | null;
  updateConfig: (partial: Partial<CliConfig>) => void;
  setConnectionStatus: (status: CliConfig['connectionStatus']) => void;
  testConnection: () => Promise<boolean>;
  resetConfig: () => void;
}

export const useCliConfigStore = create<CliConfigState>()(
  persist(
    (set, get) => ({
      config: DEFAULT_CONFIG,
      isTesting: false,
      testResult: null,
      updateConfig: (partial) => set((s) => ({ config: { ...s.config, ...partial } })),
      setConnectionStatus: (status) => set((s) => ({ config: { ...s.config, connectionStatus: status } })),
      testConnection: async () => {
        set({ isTesting: true, testResult: null });
        try {
          const { config } = get();
          const ws = new WebSocket(config.wsUrl);
          await new Promise<void>((resolve, reject) => {
            ws.onopen = () => {
              ws.close();
              resolve();
            };
            ws.onerror = () => reject(new Error('Connection failed'));
            setTimeout(() => reject(new Error('Timeout')), 5000);
          });
          set({ isTesting: false, testResult: 'Connection successful', config: { ...get().config, connectionStatus: 'connected' } });
          return true;
        } catch (e: any) {
          set({ isTesting: false, testResult: e.message || 'Connection failed', config: { ...get().config, connectionStatus: 'disconnected' } });
          return false;
        }
      },
      resetConfig: () => set({ config: DEFAULT_CONFIG, testResult: null }),
    }),
    { name: 'pi-cli-config' }
  )
);
