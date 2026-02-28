import { memo } from 'react';

import Body from '@/features/Home/Sidebar/Body';
import { AgentModalProvider } from '@/features/Home/Sidebar/Body/Agent/ModalProvider';
import Footer from '@/features/Home/Sidebar/Footer';
import Header from '@/features/Home/Sidebar/Header';
import SideBarLayout from '@/features/NavPanel/SideBarLayout';

const Sidebar = memo(() => {
  return (
    <AgentModalProvider>
      <SideBarLayout body={<Body />} footer={<Footer />} header={<Header />} />
    </AgentModalProvider>
  );
});

export default Sidebar;
