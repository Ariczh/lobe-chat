'use client';

import { type FC } from 'react';
import { Outlet } from 'react-router-dom';

import MobileContentLayout from '@/components/server/MobileNavLayout';
import AgentIdSync from '@/features/AgentChat/AgentIdSync';
import ChatHeader from '@/features/MobileChat/ChatHeader';
import { useInitAgentConfig } from '@/hooks/useInitAgentConfig';

import { styles } from './style';

const Layout: FC = () => {
  useInitAgentConfig();

  return (
    <>
      <MobileContentLayout className={styles.mainContainer} header={<ChatHeader />}>
        <Outlet />
      </MobileContentLayout>
      <AgentIdSync />
    </>
  );
};

export default Layout;
