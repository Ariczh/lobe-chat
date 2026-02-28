'use client';

import { memo } from 'react';
import { useParams } from 'react-router-dom';

import { type LayoutProps } from '@/features/Setting/Layout/type';
import SettingsContent from '@/features/Setting/Page/SettingsContent';
import { SettingsTabs } from '@/store/global/initialState';

const Layout = memo<LayoutProps>(() => {
  const params = useParams<{ tab?: string }>();

  const activeTab = (params.tab as SettingsTabs) || SettingsTabs.Profile;

  return <SettingsContent activeTab={activeTab} mobile={false} />;
});

Layout.displayName = 'DesktopSettingsLayout';

export default Layout;
