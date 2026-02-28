import { OpenAIProviderCard } from 'model-bank/modelProviders';

import { useSettingsContext } from '@/features/Setting/Layout/ContextProvider';
import ProviderDetail from '@/features/Setting/Provider/detail/ProviderDetail';

const Page = () => {
  const { showOpenAIProxyUrl, showOpenAIApiKey } = useSettingsContext();

  return (
    <ProviderDetail
      {...OpenAIProviderCard}
      settings={{
        ...OpenAIProviderCard.settings,
        proxyUrl: showOpenAIProxyUrl && {
          placeholder: 'https://api.openai.com/v1',
        },
        showApiKey: showOpenAIApiKey,
      }}
    />
  );
};

export default Page;
