import { Outlet } from 'react-router-dom';

import MobileContentLayout from '@/components/server/MobileNavLayout';
import { SCROLL_PARENT_ID } from '@/features/Community/const';
import Footer from '@/features/Setting/Footer';

import Header from './Header';

const Layout = () => {
  return (
    <MobileContentLayout gap={16} header={<Header />} id={SCROLL_PARENT_ID} padding={16}>
      <Outlet />
      <div />
      <Footer />
    </MobileContentLayout>
  );
};

export default Layout;
