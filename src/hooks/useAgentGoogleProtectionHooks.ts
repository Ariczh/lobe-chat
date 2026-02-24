'use client';

import type { UIChatMessage } from '@lobechat/types';
import { useMemo } from 'react';

import { type ConversationHooks } from '@/features/Conversation';

import { useGoogleDataProtection } from './useGoogleDataProtection';

interface UseAgentGoogleProtectionHooksParams {
  messages?: UIChatMessage[];
}

export function useAgentGoogleProtectionHooks(
  params?: UseAgentGoogleProtectionHooksParams,
): ConversationHooks {
  const { checkMessageHistoryForGoogleTools, checkMessageSend } = useGoogleDataProtection();

  return useMemo(
    (): ConversationHooks => ({
      onBeforeSendMessage: async () => {
        // Check 1: Are Google tools currently enabled with restricted provider?
        const canSendWithEnabledTools = await checkMessageSend();
        if (!canSendWithEnabledTools) return false;

        // Check 2: Does message history contain Google tool usage with restricted provider?
        const canSendWithHistory = await checkMessageHistoryForGoogleTools(params?.messages);
        if (!canSendWithHistory) return false;

        return true;
      },
    }),
    [checkMessageSend, checkMessageHistoryForGoogleTools, params?.messages],
  );
}
