'use client';

import { memo } from 'react';

import MainInterfaceTracker from '@/components/Analytics/MainInterfaceTracker';
import ConversationArea from '@/features/AgentChat/Conversation/ConversationArea';
import PageTitle from '@/features/AgentChat/PageTitle';
import PortalPanel from '@/features/AgentChat/Portal/features/PortalPanel';
import TelemetryNotification from '@/features/AgentChat/TelemetryNotification';
import Topic from '@/features/MobileChat/Topic';

const MobileChatPage = memo(() => {
  return (
    <>
      <PageTitle />
      <ConversationArea />
      <Topic />
      <PortalPanel mobile />
      <MainInterfaceTracker />
      <TelemetryNotification mobile />
    </>
  );
});

export default MobileChatPage;
