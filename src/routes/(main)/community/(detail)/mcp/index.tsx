'use client';

import { Flexbox } from '@lobehub/ui';
import { memo } from 'react';
import { useParams } from 'react-router-dom';

import { TocProvider } from '@/features/Community/Detail/Toc/useToc';
import NotFound from '@/features/Community/DetailComponents/NotFound';
import Details from '@/features/Community/DetailMcp/Details';
import { DetailProvider } from '@/features/MCPPluginDetail/DetailProvider';
import Header from '@/features/MCPPluginDetail/Header';
import { useFetchInstalledPlugins } from '@/hooks/useFetchInstalledPlugins';
import { useQuery } from '@/hooks/useQuery';
import { useDiscoverStore } from '@/store/discover';

import Loading from './loading';

interface McpDetailPageProps {
  mobile?: boolean;
}

const McpDetailPage = memo<McpDetailPageProps>(({ mobile }) => {
  const params = useParams<{ slug: string }>();
  const identifier = params.slug ?? '';

  const { version } = useQuery() as { version?: string };
  const useMcpDetail = useDiscoverStore((s) => s.useFetchMcpDetail);
  const { data, isLoading } = useMcpDetail({ identifier, version });

  useFetchInstalledPlugins();

  if (isLoading) return <Loading />;
  if (!data) return <NotFound />;

  return (
    <TocProvider>
      <DetailProvider config={data}>
        <Flexbox data-testid="mcp-detail-content" gap={16}>
          <Header mobile={mobile} />
          <Details mobile={mobile} />
        </Flexbox>
      </DetailProvider>
    </TocProvider>
  );
});

export const MobileMcpPage = memo<{ mobile?: boolean }>(() => {
  return <McpDetailPage mobile={true} />;
});

export default McpDetailPage;
