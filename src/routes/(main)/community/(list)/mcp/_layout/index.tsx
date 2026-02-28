import { Flexbox } from '@lobehub/ui';
import { Outlet } from 'react-router-dom';

import CategoryContainer from '@/features/Community/components/CategoryContainer';
import Category from '@/features/Community/ListMcp/Category';

import { styles } from './style';

const Layout = () => {
  return (
    <Flexbox horizontal className={styles.mainContainer} gap={24} width={'100%'}>
      <CategoryContainer>
        <Category />
      </CategoryContainer>
      <Flexbox flex={1} gap={16}>
        <Outlet />
      </Flexbox>
    </Flexbox>
  );
};

export default Layout;
