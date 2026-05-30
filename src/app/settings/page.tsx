'use client';

import { SettingsTabs, AccountSettings, AppearanceSection, ShortcutsSection, NotificationsSection, AdvancedSection } from '@/components/settings';

export default function SettingsPage() {
  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <SettingsTabs>
        <AccountSettings />
        <AppearanceSection />
        <ShortcutsSection />
        <NotificationsSection />
        <AdvancedSection />
      </SettingsTabs>
    </div>
  );
}
