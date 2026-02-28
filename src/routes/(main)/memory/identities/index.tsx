import { Flexbox, Icon, Tag } from '@lobehub/ui';
import { BrainCircuitIcon } from 'lucide-react';
import { type FC } from 'react';
import { memo, useCallback, useEffect, useState } from 'react';

import EditableModal from '@/features/Memory/EditableModal';
import CommonFilterBar from '@/features/Memory/FilterBar';
import IdentityRightPanel from '@/features/Memory/Identities/IdentityRightPanel';
import { type IdentityType } from '@/features/Memory/Identities/List';
import List from '@/features/Memory/Identities/List';
import SegmentedBar from '@/features/Memory/Identities/SegmentedBar';
import Loading from '@/features/Memory/Loading';
import MemoryAnalysis from '@/features/Memory/MemoryAnalysis';
import { SCROLL_PARENT_ID } from '@/features/Memory/TimeLineView/useScrollParent';
import { type ViewMode } from '@/features/Memory/ViewModeSwitcher';
import ViewModeSwitcher from '@/features/Memory/ViewModeSwitcher';
import NavHeader from '@/features/NavHeader';
import WideScreenContainer from '@/features/WideScreenContainer';
import WideScreenButton from '@/features/WideScreenContainer/WideScreenButton';
import { useQueryState } from '@/hooks/useQueryParam';
import { useUserMemoryStore } from '@/store/userMemory';
import { type TypesEnum } from '@/types/userMemory';

const IdentitiesArea = memo(() => {
  const [viewMode, setViewMode] = useState<ViewMode>('timeline');
  const [searchValueRaw, setSearchValueRaw] = useQueryState('q', { clearOnDefault: true });
  const [typeFilterRaw, setTypeFilterRaw] = useQueryState('type', { clearOnDefault: true });

  const searchValue = searchValueRaw || '';
  const typeFilter = (typeFilterRaw as IdentityType) || 'all';

  const identitiesPage = useUserMemoryStore((s) => s.identitiesPage);
  const identitiesInit = useUserMemoryStore((s) => s.identitiesInit);
  const identitiesTotal = useUserMemoryStore((s) => s.identitiesTotal);
  const identitiesSearchLoading = useUserMemoryStore((s) => s.identitiesSearchLoading);
  const useFetchIdentities = useUserMemoryStore((s) => s.useFetchIdentities);
  const resetIdentitiesList = useUserMemoryStore((s) => s.resetIdentitiesList);

  // 当搜索或类型变化时重置列表
  useEffect(() => {
    const types = typeFilter === 'all' ? undefined : [typeFilter as TypesEnum];
    resetIdentitiesList({ q: searchValue || undefined, types });
  }, [searchValue, typeFilter]);

  // 调用 SWR hook 获取数据
  const { isLoading } = useFetchIdentities({
    page: identitiesPage,
    pageSize: 12,
    q: searchValue || undefined,
    types: typeFilter === 'all' ? undefined : [typeFilter as TypesEnum],
  });

  // Handle search and type changes
  const handleSearch = useCallback(
    (value: string) => {
      setSearchValueRaw(value || null);
    },
    [setSearchValueRaw],
  );

  const handleTypeChange = useCallback(
    (type: IdentityType) => {
      setTypeFilterRaw(type === 'all' ? null : type);
    },
    [setTypeFilterRaw],
  );

  // 显示 loading：搜索/重置中 或 首次加载中
  const showLoading = identitiesSearchLoading || !identitiesInit;

  return (
    <Flexbox flex={1} height={'100%'}>
      <NavHeader
        left={
          Boolean(identitiesTotal) && (
            <Tag icon={<Icon icon={BrainCircuitIcon} />}>{identitiesTotal}</Tag>
          )
        }
        right={
          <>
            <MemoryAnalysis iconOnly />
            <ViewModeSwitcher value={viewMode} onChange={setViewMode} />
            <WideScreenButton />
          </>
        }
      />
      <Flexbox
        height={'100%'}
        id={SCROLL_PARENT_ID}
        style={{ overflowY: 'auto', paddingBottom: '16vh' }}
        width={'100%'}
      >
        <WideScreenContainer gap={32} paddingBlock={48}>
          <Flexbox horizontal align={'center'} gap={12} justify={'space-between'}>
            <SegmentedBar typeValue={typeFilter} onTypeChange={handleTypeChange} />
            <CommonFilterBar searchValue={searchValue} onSearch={handleSearch} />
          </Flexbox>
          {showLoading ? (
            <Loading viewMode={viewMode} />
          ) : (
            <List isLoading={isLoading} searchValue={searchValue} viewMode={viewMode} />
          )}
        </WideScreenContainer>
      </Flexbox>
    </Flexbox>
  );
});

const Identities: FC = () => {
  return (
    <>
      <Flexbox horizontal height={'100%'} width={'100%'}>
        <IdentitiesArea />
        <IdentityRightPanel />
      </Flexbox>
      <EditableModal />
    </>
  );
};

export default Identities;
