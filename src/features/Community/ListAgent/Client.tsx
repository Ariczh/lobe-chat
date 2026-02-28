'use client';

import { Flexbox } from '@lobehub/ui';
import { memo } from 'react';

import { withSuspense } from '@/components/withSuspense';
import ListLoading from '@/features/Community/components/ListLoading';
import Pagination from '@/features/Community/List/Pagination';
import List from '@/features/Community/ListAgent/List';
import { useQuery } from '@/hooks/useQuery';
import { useDiscoverStore } from '@/store/discover';
import { type AssistantMarketSource, type AssistantQueryParams } from '@/types/discover';
import { DiscoverTab } from '@/types/discover';

const Client = memo<{ mobile?: boolean }>(() => {
  const { q, page, category, sort, order, ownerId, source } = useQuery() as AssistantQueryParams;
  const marketSource = (source as AssistantMarketSource | undefined) ?? 'new';
  const useAssistantList = useDiscoverStore((s) => s.useAssistantList);
  const { data, isLoading } = useAssistantList({
    category,
    order,
    ownerId,
    page,
    pageSize: 21,
    q,
    sort,
    source: marketSource,
  });

  if (isLoading || !data) return <ListLoading />;

  const { items, currentPage, pageSize, totalCount } = data;

  return (
    <Flexbox gap={32} width={'100%'}>
      <List data={items} />
      <Pagination
        currentPage={currentPage}
        pageSize={pageSize}
        tab={DiscoverTab.Assistants}
        total={totalCount}
      />
    </Flexbox>
  );
});

export default withSuspense(Client);
