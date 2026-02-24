export const GOOGLE_RESTRICTED_PROVIDER_IDS = ['xai', 'deepseek'] as const;
export type GoogleRestrictedProvider = (typeof GOOGLE_RESTRICTED_PROVIDER_IDS)[number];

// Model prefixes that are restricted from using Google tools
export const GOOGLE_RESTRICTED_MODEL_PREFIXES = ['grok', 'deepseek'] as const;

export const GOOGLE_TOOL_IDENTIFIERS = [
  'gmail',
  'google-calendar',
  'google-drive',
  'google-sheets',
  'google-docs',
] as const;
export type GoogleToolIdentifier = (typeof GOOGLE_TOOL_IDENTIFIERS)[number];

/**
 * Check if a provider/model combination is restricted from using Google tools
 * Checks both provider ID and model ID (model name may contain restricted prefixes)
 */
export const isGoogleRestrictedProvider = (providerId: string, modelId?: string): boolean => {
  // Check provider ID
  if (GOOGLE_RESTRICTED_PROVIDER_IDS.includes(providerId as GoogleRestrictedProvider)) {
    return true;
  }

  // Check model ID (model name may start with grok or deepseek)
  if (modelId) {
    const lowerModelId = modelId.toLowerCase();
    if (GOOGLE_RESTRICTED_MODEL_PREFIXES.some((prefix) => lowerModelId.startsWith(prefix))) {
      return true;
    }
  }

  return false;
};

export const isGoogleTool = (identifier: string): boolean =>
  GOOGLE_TOOL_IDENTIFIERS.includes(identifier as GoogleToolIdentifier);
