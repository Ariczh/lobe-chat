'use client';

import { cssVar } from 'antd-style';
import { memo } from 'react';
import { useLocation } from 'react-router-dom';

import SortButton from '@/features/Community/List/SortButton';
import StoreSearchBar from '@/features/Community/Search';
import UserAvatar from '@/features/Community/UserAvatar';
import NavHeader from '@/features/NavHeader';

import { styles } from './Header/style';

const Header = memo(() => {
  const location = useLocation();
  const isHome = location.pathname === '/';

  const cssVariables: Record<string, string> = {
    '--header-border-color': cssVar.colorBorderSecondary,
  };

  return (
    <NavHeader
      className={styles.headerContainer}
      left={<StoreSearchBar />}
      style={cssVariables}
      right={
        !isHome && (
          <>
            <SortButton />
            <UserAvatar />
          </>
        )
      }
      styles={{
        left: { flex: 1 },
      }}
    />
  );
});

export default Header;
