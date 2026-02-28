import { memo } from 'react';
import { Outlet } from 'react-router-dom';

import MobileContentLayout from '@/components/server/MobileNavLayout';
import Header from '@/features/MobileProfile/Header';

const Layout = memo(() => {
  return (
    <MobileContentLayout header={<Header />}>
      <Outlet />
    </MobileContentLayout>
  );
});

export default Layout;
