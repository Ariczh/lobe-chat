import { useTranslation } from 'react-i18next';

import SettingHeader from '@/features/Setting/Page/SettingHeader';
import ToolDetectorSection from '@/features/Setting/SystemTools/ToolDetectorSection';

const Page = () => {
  const { t } = useTranslation('setting');
  return (
    <>
      <SettingHeader title={t('tab.systemTools')} />
      <ToolDetectorSection />
    </>
  );
};

export default Page;
