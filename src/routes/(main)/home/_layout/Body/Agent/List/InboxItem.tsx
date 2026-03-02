'use client';

import { DEFAULT_INBOX_AVATAR, SESSION_CHAT_URL } from '@lobechat/const';
import { Avatar } from '@lobehub/ui';
import { type CSSProperties } from 'react';
import { memo } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';

import NavItem from '@/features/NavPanel/components/NavItem';
import { useAgentStore } from '@/store/agent';
import { agentSelectors, builtinAgentSelectors } from '@/store/agent/selectors';
import { useChatStore } from '@/store/chat';
import { operationSelectors } from '@/store/chat/selectors';

interface InboxItemProps {
  className?: string;
  style?: CSSProperties;
}

const InboxItem = memo<InboxItemProps>(({ className, style }) => {
  const { t } = useTranslation('chat');
  const inboxAgentId = useAgentStore(builtinAgentSelectors.inboxAgentId);
  const inboxMeta = useAgentStore((s) => {
    const id = builtinAgentSelectors.inboxAgentId(s);
    return id ? agentSelectors.getAgentMetaById(id)(s) : undefined;
  });

  const isLoading = useChatStore(operationSelectors.isAgentRuntimeRunning);
  const inboxAgentTitle = inboxMeta?.title || t('inbox.title');
  const inboxAvatar = inboxMeta?.avatar || DEFAULT_INBOX_AVATAR;

  return (
    <Link aria-label={inboxAgentTitle} to={SESSION_CHAT_URL(inboxAgentId, false)}>
      <NavItem
        className={className}
        loading={isLoading}
        style={style}
        title={inboxAgentTitle}
        icon={<Avatar emojiScaleWithBackground avatar={inboxAvatar} shape={'square'} size={24} />}
      />
    </Link>
  );
});

export default InboxItem;
