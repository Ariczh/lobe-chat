'use client';

import { Flexbox } from '@lobehub/ui';
import { memo } from 'react';

import MainInterfaceTracker from '@/components/Analytics/MainInterfaceTracker';
import PageTitle from '@/features/AgentChat/PageTitle';
import TelemetryNotification from '@/features/AgentChat/TelemetryNotification';
import Conversation from '@/features/GroupChat/Conversation';
import Portal from '@/features/GroupChat/Portal';

const ChatPage = memo(() => {
  return (
    <>
      <PageTitle />
      <Flexbox
        horizontal
        height={'100%'}
        style={{ overflow: 'hidden', position: 'relative' }}
        width={'100%'}
      >
        <Conversation />
        <Portal />
      </Flexbox>
      <MainInterfaceTracker />
      <TelemetryNotification mobile={false} />
    </>
  );
});

export default ChatPage;
