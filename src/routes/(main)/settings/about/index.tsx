import { useTranslation } from 'react-i18next';

import About from '@/features/Setting/About';
import Analytics from '@/features/Setting/About/Analytics';
import SettingHeader from '@/features/Setting/Page/SettingHeader';

const Page = ({ mobile }: { mobile?: boolean }) => {
  const { t } = useTranslation('setting');
  return (
    <>
      <SettingHeader title={t('tab.about')} />
      <About mobile={mobile} />
      <Analytics />
    </>
  );
};

export default Page;
