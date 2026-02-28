'use client';

import { memo } from 'react';

import { NavPanelPortal } from '@/features/NavPanel';
import SideBarLayout from '@/features/NavPanel/SideBarLayout';
import Body from '@/features/PageEditor/Sidebar/Body';
import Header from '@/features/PageEditor/Sidebar/Header';

const Sidebar = memo(() => {
  return (
    <NavPanelPortal navKey="page">
      <SideBarLayout body={<Body />} header={<Header />} />
    </NavPanelPortal>
  );
});

Sidebar.displayName = 'PageSidebar';

export default Sidebar;
