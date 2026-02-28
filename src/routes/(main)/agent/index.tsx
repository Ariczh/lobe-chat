'use client';

import { Flexbox } from '@lobehub/ui';
import { memo } from 'react';

import MainInterfaceTracker from '@/components/Analytics/MainInterfaceTracker';
import Conversation from '@/features/AgentChat/Conversation';
import PageTitle from '@/features/AgentChat/PageTitle';
import Portal from '@/features/AgentChat/Portal';
import TelemetryNotification from '@/features/AgentChat/TelemetryNotification';

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
