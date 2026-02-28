'use client';

import { useTranslation } from 'react-i18next';

import { isDesktop } from '@/const/version';

import Conversation from './Conversation';
import Desktop from './Desktop';
import Essential from './Essential';

const Hotkey = () => {
  const { t } = useTranslation('setting');
  return (
    <>
      <Essential />
      {isDesktop ? <Desktop /> : <Conversation />}
    </>
  );
};

export default Hotkey;
