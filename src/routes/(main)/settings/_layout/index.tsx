'use client';

import { Flexbox } from '@lobehub/ui';
import { type FC } from 'react';
import { Outlet } from 'react-router-dom';

import SettingsContextProvider from '@/features/Setting/Layout/ContextProvider';
import SideBar from '@/features/Setting/Layout/SideBar';

import { styles } from './style';

const Layout: FC = () => {
  return (
    <SettingsContextProvider
      value={{
        showOpenAIApiKey: true,
        showOpenAIProxyUrl: true,
      }}
    >
      <SideBar />
      <Flexbox className={styles.mainContainer} flex={1} height={'100%'}>
        <Outlet />
      </Flexbox>
    </SettingsContextProvider>
  );
};

export default Layout;
