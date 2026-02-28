import { useTranslation } from 'react-i18next';

import Appearance from '@/features/Setting/Common/Appearance';
import Common from '@/features/Setting/Common/Common/Common';
import SettingHeader from '@/features/Setting/Page/SettingHeader';

const Page = () => {
  const { t } = useTranslation('setting');
  return (
    <>
      <SettingHeader title={t('tab.common')} />
      <Common />
      <Appearance />
    </>
  );
};

export default Page;
