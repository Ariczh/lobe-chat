import { Suspense } from 'react';

import Loading from '@/components/Loading/BrandTextLoading';
import Portal from '@/features/AgentChat/Portal/features/Portal';
import PortalPanel from '@/features/AgentChat/Portal/features/PortalPanel';

const ChatPortal = () => {
  return (
    <Portal>
      <Suspense fallback={<Loading debugId={'ChatPortal'} />}>
        <PortalPanel mobile={false} />
      </Suspense>
    </Portal>
  );
};

export default ChatPortal;
