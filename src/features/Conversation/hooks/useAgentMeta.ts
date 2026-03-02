import { INBOX_SESSION_ID } from '@lobechat/const';
import { type MetaData } from '@lobechat/types';
import { useMemo } from 'react';

import { useAgentStore } from '@/store/agent';
import { agentSelectors } from '@/store/agent/selectors';

import { contextSelectors, useConversationStore } from '../store';

const LOBE_AI_TITLE = 'Lobe AI';

/**
 * Hook to get agent meta data for a specific agent or the current conversation.
 * Handles special cases for builtin agents by showing Lobe AI title as fallback.
 * Inbox agent supports user customization - uses stored title if available.
 * Other builtin agents always show Lobe AI title.
 *
 * @param messageAgentId - Optional agent ID from the message. If provided, uses this agent's meta.
 *                         Falls back to the current conversation's agent if not provided.
 */
export const useAgentMeta = (messageAgentId?: string | null): MetaData => {
  const contextAgentId = useConversationStore(contextSelectors.agentId);
  // Use message's agentId if provided, otherwise fallback to context agentId
  const agentId = messageAgentId || contextAgentId;
  const agentMeta = useAgentStore(agentSelectors.getAgentMetaById(agentId));
  const builtinAgentIdMap = useAgentStore((s) => s.builtinAgentIdMap);

  return useMemo(() => {
    // Check if the current agent is a builtin agent
    const builtinAgentIds = Object.values(builtinAgentIdMap);
    const isBuiltinAgent = builtinAgentIds.includes(agentId);

    if (isBuiltinAgent) {
      const isInbox = builtinAgentIdMap[INBOX_SESSION_ID] === agentId;
      if (isInbox) {
        // Inbox supports customization: use stored title, fallback to Lobe AI
        return { ...agentMeta, title: agentMeta.title || LOBE_AI_TITLE };
      }
      // Other builtin agents always show Lobe AI title
      return { ...agentMeta, title: LOBE_AI_TITLE };
    }

    return agentMeta;
  }, [agentId, agentMeta, builtinAgentIdMap]);
};

/**
 * Hook to check if the current agent is a builtin agent
 */
export const useIsBuiltinAgent = (): boolean => {
  const agentId = useConversationStore(contextSelectors.agentId);
  const builtinAgentIdMap = useAgentStore((s) => s.builtinAgentIdMap);

  return useMemo(() => {
    const builtinAgentIds = Object.values(builtinAgentIdMap);
    return builtinAgentIds.includes(agentId);
  }, [agentId, builtinAgentIdMap]);
};
