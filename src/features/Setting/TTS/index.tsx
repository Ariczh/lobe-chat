'use client';

import { useTranslation } from 'react-i18next';

import SettingHeader from '@/features/Setting/Page/SettingHeader';

import OpenAI from './OpenAI';
import STT from './STT';

const TTS = () => {
  const { t } = useTranslation('setting');
  return (
    <>
      <SettingHeader title={t('tab.tts')} />
      <OpenAI />
      <STT />
    </>
  );
};

export default TTS;
