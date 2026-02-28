import { type IdentityListItem } from '@lobechat/types';
import { memo } from 'react';

import { TimelineView as GenericTimelineView } from '@/features/Memory/TimeLineView';
import { PeriodHeader, TimelineItemWrapper } from '@/features/Memory/TimeLineView/PeriodGroup';
import { useUserMemoryStore } from '@/store/userMemory';

import IdentityCard from './IdentityCard';

interface TimelineViewProps {
  identities: IdentityListItem[];
  isLoading?: boolean;
  onClick?: (identity: IdentityListItem) => void;
}

const TimelineView = memo<TimelineViewProps>(({ identities, isLoading, onClick }) => {
  const loadMoreIdentities = useUserMemoryStore((s) => s.loadMoreIdentities);
  const identitiesHasMore = useUserMemoryStore((s) => s.identitiesHasMore);

  return (
    <GenericTimelineView
      data={identities}
      groupBy="month"
      hasMore={identitiesHasMore}
      isLoading={isLoading}
      renderHeader={(periodKey) => <PeriodHeader groupBy="month" periodKey={periodKey} />}
      getDateForGrouping={(identity) =>
        identity.episodicDate || identity.capturedAt || identity.createdAt
      }
      renderItem={(identity) => (
        <TimelineItemWrapper>
          <IdentityCard identity={identity} onClick={() => onClick?.(identity)} />
        </TimelineItemWrapper>
      )}
      onLoadMore={loadMoreIdentities}
    />
  );
});

export default TimelineView;
