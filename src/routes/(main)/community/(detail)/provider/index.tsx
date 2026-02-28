'use client';

import { Flexbox } from '@lobehub/ui';
import { memo } from 'react';
import { useParams } from 'react-router-dom';

import NotFound from '@/features/Community/DetailComponents/NotFound';
import { DetailProvider } from '@/features/Community/DetailProvider/DetailProvider';
import Details from '@/features/Community/DetailProvider/Details';
import Header from '@/features/Community/DetailProvider/Header';
import { useDiscoverStore } from '@/store/discover';

import Loading from './loading';

interface ProviderDetailPageProps {
  mobile?: boolean;
}

const ProviderDetailPage = memo<ProviderDetailPageProps>(({ mobile }) => {
  const params = useParams<{ slug: string }>();
  const identifier = decodeURIComponent(params.slug ?? '');

  const useProviderDetail = useDiscoverStore((s) => s.useProviderDetail);
  const { data, isLoading } = useProviderDetail({ identifier, withReadme: true });

  if (isLoading) return <Loading />;
  if (!data) return <NotFound />;

  return (
    <DetailProvider config={data}>
      <Flexbox gap={16}>
        <Header mobile={mobile} />
        <Details mobile={mobile} />
      </Flexbox>
    </DetailProvider>
  );
});

export const MobileProviderPage = memo<{ mobile?: boolean }>(() => {
  return <ProviderDetailPage mobile={true} />;
});

export default ProviderDetailPage;
