'use client';

import { OllamaProviderCard } from 'model-bank/modelProviders';
import { useTranslation } from 'react-i18next';

import CheckError from '@/features/Setting/Provider/detail/Ollama/CheckError';
import ProviderDetail from '@/features/Setting/Provider/detail/ProviderDetail';

const Page = () => {
  const { t } = useTranslation('modelProvider');

  return (
    <ProviderDetail
      {...OllamaProviderCard}
      checkErrorRender={CheckError}
      settings={{
        ...OllamaProviderCard.settings,
        proxyUrl: {
          desc: t('ollama.endpoint.desc'),
          placeholder: 'http://127.0.0.1:11434',
          title: t('ollama.endpoint.title'),
        },
      }}
    />
  );
};

export default Page;
