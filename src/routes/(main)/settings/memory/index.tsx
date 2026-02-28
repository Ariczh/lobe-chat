import { useTranslation } from 'react-i18next';

import Memory from '@/features/Setting/Memory/Memory';
import SettingHeader from '@/features/Setting/Page/SettingHeader';

const Page = () => {
  const { t } = useTranslation('setting');
  return (
    <>
      <SettingHeader title={t('tab.memory')} />
      <Memory />
    </>
  );
};

export default Page;
