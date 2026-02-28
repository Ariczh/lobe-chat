'use client';

import { Center, Flexbox, Text, Tooltip } from '@lobehub/ui';
import { Badge } from 'antd';
import { cssVar } from 'antd-style';
import { memo } from 'react';
import { useTranslation } from 'react-i18next';

import { DESKTOP_HEADER_ICON_SIZE } from '@/const/layoutTokens';
import CateTag from '@/features/Memory/CateTag';
import DetailLoading from '@/features/Memory/DetailLoading';
import DetailPanel from '@/features/Memory/DetailPanel';
import HashTags from '@/features/Memory/HashTags';
import HighlightedContent from '@/features/Memory/HighlightedContent';
import ProgressIcon from '@/features/Memory/ProgressIcon';
import SourceLink from '@/features/Memory/SourceLink';
import Time from '@/features/Memory/Time';
import { useQueryState } from '@/hooks/useQueryParam';
import { useUserMemoryStore } from '@/store/userMemory';
import { LayersEnum } from '@/types/userMemory';

import ContextDropdown from './ContextDropdown';

const ContextRightPanel = memo(() => {
  const [contextId] = useQueryState('contextId', { clearOnDefault: true });
  const useFetchMemoryDetail = useUserMemoryStore((s) => s.useFetchMemoryDetail);
  const { t } = useTranslation('memory');
  const { data: context, isLoading } = useFetchMemoryDetail(contextId, LayersEnum.Context);

  if (!contextId) return null;

  let content;
  if (isLoading) content = <DetailLoading />;
  if (context)
    content = (
      <>
        <CateTag cate={context.type} />
        <Text
          as={'h1'}
          fontSize={20}
          weight={'bold'}
          style={{
            lineHeight: 1.4,
            marginBottom: 0,
          }}
        >
          {context.title}
          <Tooltip title={context.currentStatus}>
            <Center flex={'none'} height={20} style={{ display: 'inline-flex' }} width={20}>
              <Badge
                status="processing"
                style={{ marginLeft: 8 }}
                styles={{
                  indicator: { alignSelf: 'center', marginBottom: 4 },
                }}
              />
            </Center>
          </Tooltip>
        </Text>
        <Flexbox horizontal align="center" gap={16}>
          <ProgressIcon
            showInfo
            format={(percent) => `${t('filter.sort.scoreImpact')}: ${percent}%`}
            percent={(context.scoreImpact ?? 0) * 100}
          />
          <ProgressIcon
            showInfo
            format={(percent) => `${t('filter.sort.scoreUrgency')}: ${percent}%`}
            percent={(context.scoreUrgency ?? 0) * 100}
            strokeColor={
              (context.scoreUrgency ?? 0) >= 0.7 ? cssVar.colorError : cssVar.colorWarning
            }
          />
        </Flexbox>
        <Flexbox horizontal align="center" gap={16} justify="space-between">
          <SourceLink source={context.source} />
          <Time capturedAt={context.capturedAt || context.updatedAt || context.createdAt} />
        </Flexbox>
        <HighlightedContent>{context.description}</HighlightedContent>
        <HashTags hashTags={context.tags} />
      </>
    );

  return (
    <DetailPanel
      header={{
        right: contextId ? (
          <ContextDropdown id={contextId} size={DESKTOP_HEADER_ICON_SIZE} />
        ) : undefined,
      }}
    >
      {content}
    </DetailPanel>
  );
});

export default ContextRightPanel;
