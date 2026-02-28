import { Flexbox } from '@lobehub/ui';
import { type FC } from 'react';
import { Outlet } from 'react-router-dom';

import { isDesktop } from '@/const/version';
import AgentIdSync from '@/features/AgentChat/AgentIdSync';
import Sidebar from '@/features/AgentChat/Sidebar';
import ProtocolUrlHandler from '@/features/ProtocolUrlHandler';
import { useInitAgentConfig } from '@/hooks/useInitAgentConfig';

import RegisterHotkeys from './RegisterHotkeys';
import { styles } from './style';

const Layout: FC = () => {
  useInitAgentConfig();

  return (
    <>
      <Sidebar />
      <Flexbox className={styles.mainContainer} flex={1} height={'100%'}>
        <Outlet />
      </Flexbox>
      {/* ↓ cloud slot ↓ */}

      {/* ↑ cloud slot ↑ */}
      <RegisterHotkeys />
      {isDesktop && <ProtocolUrlHandler />}
      <AgentIdSync />
    </>
  );
};

export default Layout;
