import { useTranslation } from 'react-i18next';

import ApiKey from '@/features/Setting/ApiKey/ApiKey';
import SettingHeader from '@/features/Setting/Page/SettingHeader';

const Page = () => {
  const { t } = useTranslation('setting');
  return (
    <>
      <SettingHeader title={t('tab.apikey')} />
      <ApiKey />
    </>
  );
};

export default Page;
