import { useTranslation } from 'react-i18next';

import SettingHeader from '@/features/Setting/Page/SettingHeader';
import ProxyForm from '@/features/Setting/Proxy/ProxyForm';

const Page = () => {
  const { t } = useTranslation('setting');
  return (
    <>
      <SettingHeader title={t('tab.proxy')} />
      <ProxyForm />
    </>
  );
};

export default Page;
