'use client';

import { memo } from 'react';
import { useTranslation } from 'react-i18next';

import Title from '@/features/Community/components/Title';
import AssistantList from '@/features/Community/ListAgent/List';
import CreatorRewardBanner from '@/features/Community/ListHome/CreatorRewardBanner';
import McpList from '@/features/Community/ListMcp/List';
import { useDiscoverStore } from '@/store/discover';
import { AssistantSorts, McpSorts } from '@/types/discover';

import Loading from './loading';

const HomePage = memo(() => {
  const { t } = useTranslation('discover');
  const useAssistantList = useDiscoverStore((s) => s.useAssistantList);
  const useMcpList = useDiscoverStore((s) => s.useFetchMcpList);

  const { data: assistantList, isLoading: assistantLoading } = useAssistantList({
    page: 1,
    pageSize: 12,
    sort: AssistantSorts.Recommended,
  });

  const { data: mcpList, isLoading: pluginLoading } = useMcpList({
    page: 1,
    pageSize: 12,
    sort: McpSorts.Recommended,
  });

  if (assistantLoading || pluginLoading || !assistantList || !mcpList) return <Loading />;

  return (
    <>
      <CreatorRewardBanner />
      <Title more={t('home.more')} moreLink={'/community/agent'}>
        {t('home.featuredAssistants')}
      </Title>
      <AssistantList data={assistantList.items} rows={4} />
      <div />
      <Title more={t('home.more')} moreLink={'/community/mcp'}>
        {t('home.featuredTools')}
      </Title>
      <McpList data={mcpList.items} rows={4} />
    </>
  );
});

export default HomePage;
