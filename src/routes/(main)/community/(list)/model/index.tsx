'use client';

import { Flexbox } from '@lobehub/ui';
import { memo } from 'react';

import Pagination from '@/features/Community/List/Pagination';
import List from '@/features/Community/ListModel/List';
import { useQuery } from '@/hooks/useQuery';
import { useDiscoverStore } from '@/store/discover';
import { type ModelQueryParams } from '@/types/discover';
import { DiscoverTab } from '@/types/discover';

import Loading from './loading';

const ModelPage = memo<{ mobile?: boolean }>(() => {
  const { q, page, category, sort, order } = useQuery() as ModelQueryParams;
  const useModelList = useDiscoverStore((s) => s.useModelList);
  const { data, isLoading } = useModelList({
    category,
    order,
    page,
    pageSize: 21,
    q,
    sort,
  });

  if (isLoading || !data) return <Loading />;

  const { items, currentPage, pageSize, totalCount } = data;

  return (
    <Flexbox gap={32} width={'100%'}>
      <List data={items} />
      <Pagination
        currentPage={currentPage}
        pageSize={pageSize}
        tab={DiscoverTab.Models}
        total={totalCount}
      />
    </Flexbox>
  );
});

export default ModelPage;
