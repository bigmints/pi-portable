'use client';

import { SettingsTabs, AccountSection, CliConfigSection, AppearanceSection, ShortcutsSection, NotificationsSection, AdvancedSection } from '@/components/settings';

export default function SettingsPage() {
  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <SettingsTabs>
        <AccountSection />
        <CliConfigSection />
        <AppearanceSection />
        <ShortcutsSection />
        <NotificationsSection />
        <AdvancedSection />
      </SettingsTabs>
    </div>
  );
}
