import React, { memo } from 'react';

import ConfigPanel from '@/features/ImageGeneration/ConfigPanel';
import { NavPanelPortal } from '@/features/NavPanel';
import SideBarLayout from '@/features/NavPanel/SideBarLayout';

import Header from './Header';

const Sidebar = memo(() => {
  return (
    <NavPanelPortal navKey="image">
      <SideBarLayout body={<ConfigPanel />} header={<Header />} />
    </NavPanelPortal>
  );
});

Sidebar.displayName = 'ImageSidebar';

export default Sidebar;
