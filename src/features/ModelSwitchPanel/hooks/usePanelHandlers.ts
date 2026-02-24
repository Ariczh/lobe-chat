import { useCallback } from 'react';

import { useGoogleDataProtection } from '@/hooks/useGoogleDataProtection';
import { useAgentStore } from '@/store/agent';

interface UsePanelHandlersProps {
  onModelChange?: (params: { model: string; provider: string }) => Promise<void>;
  onOpenChange?: (open: boolean) => void;
}

export const usePanelHandlers = ({
  onModelChange: onModelChangeProp,
  onOpenChange,
}: UsePanelHandlersProps) => {
  const updateAgentConfig = useAgentStore((s) => s.updateAgentConfig);
  const { checkModelSwitch } = useGoogleDataProtection();

  const handleModelChange = useCallback(
    async (modelId: string, providerId: string) => {
      // Check if switching to a restricted provider with Google tools enabled
      const isBlocked = await checkModelSwitch(providerId, modelId);
      if (isBlocked) {
        return;
      }

      const params = { model: modelId, provider: providerId };
      if (onModelChangeProp) {
        onModelChangeProp(params);
      } else {
        updateAgentConfig(params);
      }
    },
    [onModelChangeProp, updateAgentConfig, checkModelSwitch],
  );

  const handleClose = useCallback(() => {
    onOpenChange?.(false);
  }, [onOpenChange]);

  return { handleClose, handleModelChange };
};
