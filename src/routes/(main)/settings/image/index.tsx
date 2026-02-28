import { useTranslation } from 'react-i18next';

import Image from '@/features/Setting/Image/Image';
import SettingHeader from '@/features/Setting/Page/SettingHeader';

const Page = () => {
  const { t } = useTranslation('setting');
  return (
    <>
      <SettingHeader title={t('tab.image')} />
      <Image />
    </>
  );
};

export default Page;
