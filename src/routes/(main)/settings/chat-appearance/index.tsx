import { useTranslation } from 'react-i18next';

import ChatAppearance from '@/features/Setting/ChatAppearance/ChatAppearance';
import SettingHeader from '@/features/Setting/Page/SettingHeader';

const Page = () => {
  const { t } = useTranslation('setting');

  return (
    <>
      <SettingHeader title={t('tab.chatAppearance')} />
      <ChatAppearance />
    </>
  );
};

export default Page;
