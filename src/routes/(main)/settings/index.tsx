'use client';

import { memo } from 'react';
import { useParams } from 'react-router-dom';

import SettingsContent from '@/features/Setting/Page/SettingsContent';
import { SettingsTabs } from '@/store/global/initialState';

import { type LayoutProps } from './_layout/type';

const Layout = memo<LayoutProps>(() => {
  const params = useParams<{ tab?: string }>();

  const activeTab = (params.tab as SettingsTabs) || SettingsTabs.Profile;

  return <SettingsContent activeTab={activeTab} mobile={false} />;
});

Layout.displayName = 'DesktopSettingsLayout';

export default Layout;
