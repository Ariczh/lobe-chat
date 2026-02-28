import { memo, Suspense } from 'react';

import SessionListContent from '@/features/MobileHome/SessionListContent';
import SkeletonList from '@/features/MobileHome/SkeletonList';

const Home = memo(() => {
  return (
    <Suspense fallback={<SkeletonList />}>
      <SessionListContent />
    </Suspense>
  );
});

Home.displayName = 'MobileHome';

export default Home;
