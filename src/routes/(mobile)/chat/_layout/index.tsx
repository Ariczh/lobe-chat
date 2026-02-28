'use client';

import { type FC } from 'react';
import { Outlet } from 'react-router-dom';

import MobileContentLayout from '@/components/server/MobileNavLayout';
import ChatHeader from '@/features/MobileChat/ChatHeader';
import { useInitAgentConfig } from '@/hooks/useInitAgentConfig';
import AgentIdSync from '@/routes/(main)/agent/_layout/AgentIdSync';

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
