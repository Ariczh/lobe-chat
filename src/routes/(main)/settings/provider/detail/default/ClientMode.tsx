'use client';

import { Flexbox } from '@lobehub/ui';
import { memo } from 'react';

import Loading from '@/components/Loading/BrandTextLoading';
import ModelList from '@/features/Setting/Provider/ModelList';
import ProviderConfig from '@/features/Setting/Provider/ProviderConfig';
import { useClientDataSWR } from '@/libs/swr';
import { aiProviderService } from '@/services/aiProvider';
import { useAiInfraStore } from '@/store/aiInfra';

const ClientMode = memo<{ id: string }>(({ id }) => {
  const useFetchAiProviderItem = useAiInfraStore((s) => s.useFetchAiProviderItem);
  useFetchAiProviderItem(id);

  const { data, isLoading } = useClientDataSWR(`get-client-provider-${id}`, () =>
    aiProviderService.getAiProviderById(id),
  );

  if (isLoading || !data || !data.id) return <Loading debugId="Provider > ClientMode" />;

  return (
    <Flexbox gap={24} paddingBlock={8}>
      <ProviderConfig {...data} id={id} name={data.name || ''} />
      <ModelList id={id} />
    </Flexbox>
  );
});

export default ClientMode;
