import { useTranslation } from 'react-i18next';

import { isDesktop } from '@/const/version';
import Conversation from '@/features/Setting/Hotkey/Conversation';
import Desktop from '@/features/Setting/Hotkey/Desktop';
import Essential from '@/features/Setting/Hotkey/Essential';
import SettingHeader from '@/features/Setting/Page/SettingHeader';

const Page = () => {
  const { t } = useTranslation('setting');
  return (
    <>
      <SettingHeader title={t('tab.hotkey')} />
      {isDesktop && <Desktop />}
      <Essential />
      <Conversation />
    </>
  );
};

export default Page;
