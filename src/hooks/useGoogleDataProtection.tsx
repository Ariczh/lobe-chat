'use client';

import type { UIChatMessage } from '@lobechat/types';
import { App } from 'antd';
import { useCallback, useMemo } from 'react';
import { useTranslation } from 'react-i18next';

import {
  GOOGLE_TOOL_IDENTIFIERS,
  isGoogleRestrictedProvider,
  isGoogleTool,
} from '@/const/googleDataProtection';
import { useAgentStore } from '@/store/agent';
import { agentSelectors } from '@/store/agent/selectors';
import { useToolStore } from '@/store/tool';
import { klavisStoreSelectors } from '@/store/tool/selectors';

/**
 * Check if messages contain any Google tool usage
 */
export const findGoogleToolsInMessages = (messages: UIChatMessage[] | undefined): string[] => {
  if (!messages || messages.length === 0) return [];

  const googleToolIds = new Set<string>();

  for (const message of messages) {
    // Check plugin field
    if (message.plugin?.identifier && isGoogleTool(message.plugin.identifier)) {
      googleToolIds.add(message.plugin.identifier);
    }

    // Check tools field
    if (message.tools) {
      for (const tool of message.tools) {
        if (isGoogleTool(tool.identifier)) {
          googleToolIds.add(tool.identifier);
        }
      }
    }

    // Check children (grouped tool messages - AssistantContentBlock has tools field)
    if (message.children) {
      for (const child of message.children) {
        if (child.tools) {
          for (const tool of child.tools) {
            if (isGoogleTool(tool.identifier)) {
              googleToolIds.add(tool.identifier);
            }
          }
        }
      }
    }
  }

  return Array.from(googleToolIds);
};

export interface GoogleDataProtectionState {
  enabledGoogleToolIds: string[];
  hasConflict: boolean;
  hasEnabledGoogleTools: boolean;
  isUsingRestrictedProvider: boolean;
}

export const useGoogleDataProtection = () => {
  const { t } = useTranslation('setting');
  const { modal } = App.useApp();

  const plugins = useAgentStore(agentSelectors.currentAgentPlugins);
  const currentProvider = useAgentStore(agentSelectors.currentAgentModelProvider);
  const currentModel = useAgentStore(agentSelectors.currentAgentModel);
  const connectedServers = useToolStore(klavisStoreSelectors.getConnectedServers);

  const state = useMemo((): GoogleDataProtectionState => {
    const connectedGoogleServerIds = connectedServers
      .filter((server) => isGoogleTool(server.identifier))
      .map((server) => server.identifier);

    const enabledGoogleToolIds = plugins.filter((pluginId) =>
      connectedGoogleServerIds.includes(pluginId),
    );

    const hasEnabledGoogleTools = enabledGoogleToolIds.length > 0;
    const isUsingRestrictedProvider = isGoogleRestrictedProvider(currentProvider, currentModel);
    const hasConflict = hasEnabledGoogleTools && isUsingRestrictedProvider;

    return {
      enabledGoogleToolIds,
      hasConflict,
      hasEnabledGoogleTools,
      isUsingRestrictedProvider,
    };
  }, [plugins, currentProvider, currentModel, connectedServers]);

  const checkGoogleToolConnect = useCallback(
    async (toolIdentifier: string): Promise<boolean> => {
      if (!isGoogleTool(toolIdentifier)) return false;
      if (!isGoogleRestrictedProvider(currentProvider, currentModel)) return false;

      modal.warning({
        centered: true,
        content: t('googleDataProtection.cannotConnectGoogle.content'),
        okText: t('googleDataProtection.understood'),
        title: t('googleDataProtection.cannotConnectGoogle.title'),
      });

      return true;
    },
    [currentProvider, currentModel, modal, t],
  );

  const checkModelSwitch = useCallback(
    async (newProviderId: string, newModelId?: string): Promise<boolean> => {
      if (!isGoogleRestrictedProvider(newProviderId, newModelId)) return false;
      if (!state.hasEnabledGoogleTools) return false;

      const toolNames = state.enabledGoogleToolIds
        .map((id) => {
          const toolInfo = GOOGLE_TOOL_IDENTIFIERS.find((t) => t === id);
          return toolInfo || id;
        })
        .join(', ');

      modal.warning({
        centered: true,
        content: t('googleDataProtection.cannotSwitchModel.content', { tools: toolNames }),
        okText: t('googleDataProtection.understood'),
        title: t('googleDataProtection.cannotSwitchModel.title'),
      });

      return true;
    },
    [state.hasEnabledGoogleTools, state.enabledGoogleToolIds, modal, t],
  );

  const checkMessageSend = useCallback(async (): Promise<boolean> => {
    if (!isGoogleRestrictedProvider(currentProvider, currentModel)) return true;
    if (!state.hasEnabledGoogleTools) return true;

    const toolNames = state.enabledGoogleToolIds
      .map((id) => {
        const toolInfo = GOOGLE_TOOL_IDENTIFIERS.find((t) => t === id);
        return toolInfo || id;
      })
      .join(', ');

    modal.warning({
      centered: true,
      content: t('googleDataProtection.cannotSendMessage.content', { tools: toolNames }),
      okText: t('googleDataProtection.understood'),
      title: t('googleDataProtection.cannotSendMessage.title'),
    });

    return false;
  }, [
    currentProvider,
    currentModel,
    state.hasEnabledGoogleTools,
    state.enabledGoogleToolIds,
    modal,
    t,
  ]);

  /**
   * Scenario 4: Check if message history contains Google tool usage
   * Block sending if using restricted provider with Google tools in history
   * Returns false to block, true to allow
   */
  const checkMessageHistoryForGoogleTools = useCallback(
    async (messages: UIChatMessage[] | undefined): Promise<boolean> => {
      if (!isGoogleRestrictedProvider(currentProvider, currentModel)) return true;

      const googleToolsInHistory = findGoogleToolsInMessages(messages);
      if (googleToolsInHistory.length === 0) return true;

      const toolNames = googleToolsInHistory.join(', ');

      modal.warning({
        centered: true,
        content: t('googleDataProtection.cannotSendWithHistory.content', { tools: toolNames }),
        okText: t('googleDataProtection.understood'),
        title: t('googleDataProtection.cannotSendWithHistory.title'),
      });

      return false;
    },
    [currentProvider, currentModel, modal, t],
  );

  return {
    checkGoogleToolConnect,
    checkMessageHistoryForGoogleTools,
    checkMessageSend,
    checkModelSwitch,
    state,
  };
};
