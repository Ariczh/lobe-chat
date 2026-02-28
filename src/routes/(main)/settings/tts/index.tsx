import { useTranslation } from 'react-i18next';

import SettingHeader from '@/features/Setting/Page/SettingHeader';
import OpenAI from '@/features/Setting/TTS/OpenAI';
import STT from '@/features/Setting/TTS/STT';

const Page = () => {
  const { t } = useTranslation('setting');
  return (
    <>
      <SettingHeader title={t('tab.tts')} />
      <STT />
      <OpenAI />
    </>
  );
};

export default Page;
