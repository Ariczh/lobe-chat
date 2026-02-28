'use client';

import { DEFAULT_REWRITE_QUERY } from '@lobechat/prompts';
import { useTranslation } from 'react-i18next';

import DefaultAgentForm from '@/features/Setting/Agent/DefaultAgentForm';
import SystemAgentForm from '@/features/Setting/Agent/SystemAgentForm';
import SettingHeader from '@/features/Setting/Page/SettingHeader';
import { featureFlagsSelectors, useServerConfigStore } from '@/store/serverConfig';

const Page = () => {
  const { t } = useTranslation('setting');
  const { enableKnowledgeBase } = useServerConfigStore(featureFlagsSelectors);
  return (
    <>
      <SettingHeader title={t('tab.agent')} />
      <DefaultAgentForm />
      <SystemAgentForm systemAgentKey="topic" />
      <SystemAgentForm systemAgentKey="generationTopic" />
      <SystemAgentForm systemAgentKey="translation" />
      <SystemAgentForm systemAgentKey="historyCompress" />
      <SystemAgentForm systemAgentKey="agentMeta" />
      {enableKnowledgeBase && (
        <SystemAgentForm
          allowCustomPrompt
          allowDisable
          defaultPrompt={DEFAULT_REWRITE_QUERY}
          systemAgentKey="queryRewrite"
        />
      )}
    </>
  );
};

export default Page;
