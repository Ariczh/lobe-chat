'use client';

import { type PropsWithChildren } from 'react';

import MobileContentLayout from '@/components/server/MobileNavLayout';
import Header from '@/features/MobileChatSettings/Layout/Header';
import Footer from '@/features/Setting/Footer';

const Layout = ({ children }: PropsWithChildren) => (
  <MobileContentLayout header={<Header />}>
    {children}
    <Footer />
  </MobileContentLayout>
);

export default Layout;
