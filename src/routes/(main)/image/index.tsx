'use client';

import { Flexbox } from '@lobehub/ui';
import { memo } from 'react';

import ImageWorkspace from '@/features/ImageGeneration/ImageWorkspace';
import NavHeader from '@/features/NavHeader';
import WideScreenContainer from '@/features/WideScreenContainer';
import WideScreenButton from '@/features/WideScreenContainer/WideScreenButton';

const DesktopImagePage = memo(() => {
  return (
    <>
      <NavHeader right={<WideScreenButton />} />
      <Flexbox height={'100%'} style={{ overflowY: 'auto', position: 'relative' }} width={'100%'}>
        <WideScreenContainer height={'100%'} wrapperStyle={{ height: '100%' }}>
          <ImageWorkspace />
        </WideScreenContainer>
      </Flexbox>
    </>
  );
});

DesktopImagePage.displayName = 'DesktopImagePage';

export default DesktopImagePage;
